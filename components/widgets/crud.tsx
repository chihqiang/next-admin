"use client"

import { ReactNode, useState, useCallback, useEffect } from "react"
import { Search, Edit, Trash2, Plus } from "lucide-react"
import { toast } from "sonner"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  DataList,
  DataListColumn,
  RenderCard,
} from "@/components/widgets/data-list"
import type { PageResponse } from "@/lib/request"

// ============================================================================
// 类型定义
// ============================================================================

/**
 * 搜索字段配置
 */
export interface SearchField {
  /** 字段名 */
  name: string
  /** 显示标签 */
  label: string
  /** 输入类型 */
  type?: "input" | "select"
  /** 占位符 */
  placeholder?: string
  /** 选择框选项 */
  options?: { value: string | number; label: string }[]
}

/**
 * 包含 id 的实体类型约束
 */
export interface HasId {
  id: number
}

/**
 * Crud 组件配置
 */
export interface CrudProps<T extends HasId, FormData = T> {
  /** 页面标题（可选，不在内容区显示，仅用于语义） */
  title?: string
  /** 实体名称 */
  entityName: string

  /** 表格列定义 */
  columns: DataListColumn<T>[]
  /** 列表 API */
  listApi: (
    params: { page: number; size: number } & Record<string, unknown>
  ) => Promise<PageResponse<T>>
  /** 每页条数 @default 10 */
  pageSize?: number
  /** 是否可选择（支持批量删除） */
  selectable?: boolean

  /** 搜索字段配置 */
  searchFields?: SearchField[]

  /** 删除 API */
  deleteApi?: (id: number) => Promise<unknown>
  /** 是否支持批量删除 */
  batchDelete?: boolean

  /** 表单组件 */
  formComponent?: React.ComponentType<{
    formData: FormData
    onChange: (data: FormData) => void
  }>
  /** 默认表单数据 */
  defaultFormData?: FormData
  /** 新增 API */
  createApi?: (data: FormData) => Promise<unknown>
  /** 更新 API */
  updateApi?: (data: FormData & { id: number }) => Promise<unknown>
  /** 获取详情 API */
  detailApi?: (id: number) => Promise<FormData>

  /** 弹窗最大宽度 @default "600px" */
  dialogWidth?: string
  /** 弹窗最大高度 @default "85vh" */
  dialogHeight?: string

  /** 自定义操作列（完全替换默认操作） */
  renderActions?: (item: T) => ReactNode
  /** 额外操作按钮（在编辑/删除按钮之前添加） */
  extraActions?: (item: T) => ReactNode
  /** 获取删除确认显示名称 */
  getItemName?: (item: T) => ReactNode
}

// ============================================================================
// CrudSearchForm - 通用搜索表单组件
// ============================================================================

interface CrudSearchFormProps {
  /** 搜索字段配置 */
  fields: SearchField[]
  /** 当前搜索值 */
  values: Record<string, string>
  /** 搜索值变化回调 */
  onValueChange: (name: string, value: string) => void
  /** 搜索回调 */
  onSearch: () => void
  /** 重置回调 */
  onReset: () => void
  /** 是否加载中 */
  loading?: boolean
}

/**
 * 通用搜索表单组件
 * 支持 input 和 select 类型的搜索字段
 */
export function CrudSearchForm({
  fields,
  values,
  onValueChange,
  onSearch,
  onReset,
  loading = false,
}: CrudSearchFormProps) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        onSearch()
      }}
      className="grid grid-cols-2 gap-3 sm:flex sm:flex-wrap sm:items-end"
    >
      {fields.map((field) => (
        <div key={field.name} className="flex items-center gap-2">
          {field.type === "select" ? (
            <Select
              value={values[field.name] || ""}
              onValueChange={(value) => onValueChange(field.name, value || "")}
            >
              <SelectTrigger size="sm" className="w-full sm:w-32">
                <SelectValue placeholder={field.label} />
              </SelectTrigger>
              <SelectContent>
                {field.options?.map((opt) => (
                  <SelectItem key={String(opt.value)} value={String(opt.value)}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <input
              type="text"
              name={field.name}
              placeholder={field.placeholder || field.label}
              value={values[field.name] || ""}
              onChange={(e) => onValueChange(field.name, e.target.value)}
              className="h-7 w-full rounded-md border border-input bg-background px-2 text-sm sm:w-40"
            />
          )}
        </div>
      ))}
      <div className="col-span-2 flex gap-2 sm:col-span-1">
        <Button type="submit" size="sm" disabled={loading}>
          <Search className="mr-2 h-4 w-4" />
          搜索
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onReset}
          disabled={loading}
        >
          重置
        </Button>
      </div>
    </form>
  )
}

// ============================================================================
// CrudFormDialog - 通用表单弹窗（新增/编辑共用）
// ============================================================================

interface CrudFormDialogProps<FormData> {
  /** 是否打开 */
  open: boolean
  /** 是否为编辑模式 */
  isEdit: boolean
  /** 实体名称 */
  entityName: string
  /** 关闭回调 */
  onClose: () => void
  /** 提交回调 */
  onSubmit: () => void | Promise<void>
  /** 表单数据 */
  formData: FormData | null
  /** 表单数据变化回调 */
  onFormChange: (data: FormData) => void
  /** 表单组件 */
  formComponent: React.ComponentType<{
    formData: FormData
    onChange: (data: FormData) => void
  }>
  /** 是否加载中 */
  loading?: boolean
  /** 弹窗最大宽度 @default "600px" */
  dialogWidth?: string
  /** 弹窗最大高度 @default "85vh" */
  dialogHeight?: string
}

/**
 * 通用表单弹窗
 * 用于新增和编辑操作
 */
export function CrudFormDialog<FormData>({
  open,
  isEdit,
  entityName,
  onClose,
  onSubmit,
  formData,
  onFormChange,
  formComponent: FormComponent,
  loading = false,
  dialogWidth = "600px",
  dialogHeight = "85vh",
}: CrudFormDialogProps<FormData>) {
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await onSubmit()
  }

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className="overflow-y-auto"
        style={{ maxWidth: dialogWidth, maxHeight: dialogHeight }}
      >
        <DialogHeader>
          <DialogTitle>
            {isEdit ? `编辑${entityName}` : `新增${entityName}`}
          </DialogTitle>
        </DialogHeader>

        {formData && (
          <form id="crud-form" onSubmit={handleSubmit}>
            <FormComponent formData={formData} onChange={onFormChange} />
          </form>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            取消
          </Button>
          <Button
            type="submit"
            form="crud-form"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading && (
              <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            )}
            {isEdit ? "更新" : "创建"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ============================================================================
// CrudDeleteDialog - 通用删除确认弹窗
// ============================================================================

interface CrudDeleteDialogProps {
  /** 是否打开 */
  open: boolean
  /** 关闭回调 */
  onClose: () => void
  /** 确认回调 */
  onConfirm: () => void | Promise<void>
  /** 标题 */
  title?: string
  /** 删除项名称 */
  itemName?: ReactNode
  /** 是否加载中 */
  loading?: boolean
}

/**
 * 通用删除确认弹窗
 */
export function CrudDeleteDialog({
  open,
  onClose,
  onConfirm,
  title = "确认删除",
  itemName,
  loading = false,
}: CrudDeleteDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            确定要删除{itemName ? `「${itemName}」` : ""}吗？此操作不可撤销。
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            取消
          </Button>
          <Button variant="destructive" onClick={onConfirm} disabled={loading}>
            {loading && (
              <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            )}
            确认删除
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ============================================================================
// CrudBatchDeleteDialog - 批量删除确认弹窗
// ============================================================================

interface CrudBatchDeleteDialogProps {
  /** 是否打开 */
  open: boolean
  /** 关闭回调 */
  onClose: () => void
  /** 确认回调 */
  onConfirm: () => void | Promise<void>
  /** 实体名称 */
  entityName: string
  /** 选中数量 */
  count: number
  /** 是否加载中 */
  loading?: boolean
}

/**
 * 批量删除确认弹窗
 */
export function CrudBatchDeleteDialog({
  open,
  onClose,
  onConfirm,
  entityName,
  count,
  loading = false,
}: CrudBatchDeleteDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>批量删除{entityName}</DialogTitle>
          <DialogDescription>
            确定要删除选中的 {count} 个{entityName}吗？此操作不可撤销。
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            取消
          </Button>
          <Button variant="destructive" onClick={onConfirm} disabled={loading}>
            {loading && (
              <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            )}
            确认删除
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ============================================================================
// CrudActionsBar - 操作栏组件
// ============================================================================

interface CrudActionsBarProps {
  /** 实体名称 */
  entityName: string
  /** 是否显示新增按钮 */
  showAdd?: boolean
  /** 新增回调 */
  onAdd?: () => void
  /** 是否可选择 */
  selectable?: boolean
  /** 选中数量 */
  selectedCount?: number
  /** 是否显示批量删除按钮 */
  showBatchDelete?: boolean
  /** 批量删除回调 */
  onBatchDelete?: () => void
  /** 自定义操作按钮 */
  extraActions?: ReactNode
}

/**
 * 操作栏组件
 * 包含新增按钮和批量操作按钮
 */
export function CrudActionsBar({
  entityName,
  showAdd = false,
  onAdd,
  selectable = false,
  selectedCount = 0,
  showBatchDelete = false,
  onBatchDelete,
  extraActions,
}: CrudActionsBarProps) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-wrap items-center gap-2">
        {showAdd && onAdd && (
          <Button onClick={onAdd} size="sm">
            <Plus className="mr-2 h-4 w-4" />
            新增{entityName}
          </Button>
        )}
        {extraActions}
      </div>

      {selectable && showBatchDelete && onBatchDelete && (
        <Button
          variant="destructive"
          size="sm"
          onClick={onBatchDelete}
          disabled={selectedCount === 0}
        >
          <Trash2 className="mr-2 h-4 w-4" />
          批量删除 ({selectedCount})
        </Button>
      )}
    </div>
  )
}

// ============================================================================
// Crud - 一体化 CRUD 组件
// ============================================================================

type DialogMode = "none" | "add" | "edit" | "delete"

/**
 * 一体化 CRUD 组件
 *
 * 功能：
 * - 自动渲染搜索表单
 * - 自动渲染表格和分页
 * - 自动处理新增/编辑弹窗
 * - 自动处理删除确认弹窗
 * - 支持批量删除
 *
 * @example
 * ```tsx
 * <Crud<Account, AccountCreateUpdate>
 *   title="账号管理"
 *   entityName="账号"
 *   columns={columns}
 *   listApi={accountListApi}
 *   pageSize={8}
 *   searchFields={[
 *     { name: "id", label: "账号ID", type: "input" },
 *   ]}
 *   deleteApi={accountDeleteApi}
 *   batchDelete
 *   formComponent={AccountForm}
 *   defaultFormData={defaultFormData}
 *   createApi={accountCreateApi}
 *   updateApi={accountUpdateApi}
 *   detailApi={accountDetailApi}
 * />
 * ```
 */
export function Crud<T extends HasId, FormData = T>(
  props: CrudProps<T, FormData>
) {
  const {
    title,
    entityName,
    columns,
    listApi,
    pageSize = 10,
    selectable = false,
    searchFields,
    deleteApi,
    batchDelete = false,
    formComponent: FormComponent,
    defaultFormData,
    createApi,
    updateApi,
    detailApi,
    renderActions,
    extraActions,
    getItemName,
    dialogWidth,
    dialogHeight,
  } = props

  // 数据状态
  const [data, setData] = useState<T[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [searchParams, setSearchParams] = useState<Record<string, unknown>>({})

  // 选中状态
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set())
  const [showBatchDeleteConfirm, setShowBatchDeleteConfirm] = useState(false)

  // 弹窗状态
  const [dialogMode, setDialogMode] = useState<DialogMode>("none")
  const [currentItem, setCurrentItem] = useState<T | null>(null)
  const [formData, setFormData] = useState<FormData | null>(null)
  const [submitLoading, setSubmitLoading] = useState(false)

  // 搜索表单值
  const [searchFormValues, setSearchFormValues] = useState<
    Record<string, string>
  >({})

  // 数据获取
  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const result = await listApi({
        page,
        size: pageSize,
        ...searchParams,
      })
      setData(result.data)
      setTotal(result.total)
    } catch (error) {
      const msg = error instanceof Error ? error.message : "获取数据失败"
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }, [page, pageSize, searchParams, listApi])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // 搜索处理
  const handleSearch = useCallback(() => {
    const params: Record<string, unknown> = {}
    for (const [key, value] of Object.entries(searchFormValues)) {
      if (value !== undefined && value !== null && value !== "") {
        params[key] = value
      }
    }
    setSearchParams(params)
    setPage(1)
  }, [searchFormValues])

  const handleReset = useCallback(() => {
    setSearchParams({})
    setSearchFormValues({})
    setPage(1)
  }, [])

  // 弹窗控制
  const openAdd = useCallback(() => {
    setDialogMode("add")
    setCurrentItem(null)
    setFormData(defaultFormData || ({} as FormData))
  }, [defaultFormData])

  const openEdit = useCallback(
    async (item: T) => {
      setDialogMode("edit")
      setCurrentItem(item)

      if (detailApi) {
        try {
          const detail = await detailApi(item.id)
          setFormData(detail)
        } catch {
          setFormData(item as unknown as FormData)
        }
      } else {
        setFormData(item as unknown as FormData)
      }
    },
    [detailApi]
  )

  const openDelete = useCallback((item: T) => {
    setDialogMode("delete")
    setCurrentItem(item)
  }, [])

  const closeDialog = useCallback(() => {
    setDialogMode("none")
    setCurrentItem(null)
    setFormData(null)
  }, [])

  // 提交处理
  const handleSubmit = useCallback(async () => {
    if (!formData) return

    setSubmitLoading(true)
    try {
      if (dialogMode === "edit") {
        if (!updateApi) throw new Error("不支持更新")
        if (!currentItem) throw new Error("当前编辑项不存在")
        const updateData = { ...formData, id: currentItem.id } as FormData & {
          id: number
        }
        await updateApi(updateData)
        toast.success(`${entityName}更新成功`)
      } else {
        if (!createApi) throw new Error("不支持新增")
        await createApi(formData)
        toast.success(`${entityName}创建成功`)
      }
      closeDialog()
      fetchData()
    } catch (error) {
      const msg = error instanceof Error ? error.message : "操作失败"
      toast.error(msg)
    } finally {
      setSubmitLoading(false)
    }
  }, [
    formData,
    dialogMode,
    updateApi,
    createApi,
    currentItem,
    entityName,
    closeDialog,
    fetchData,
  ])

  const handleDelete = useCallback(async () => {
    if (!deleteApi || !currentItem) return

    setSubmitLoading(true)
    try {
      await deleteApi(currentItem.id)
      toast.success(`${entityName}删除成功`)
      closeDialog()
      fetchData()
    } catch (error) {
      const msg = error instanceof Error ? error.message : "删除失败"
      toast.error(msg)
    } finally {
      setSubmitLoading(false)
    }
  }, [deleteApi, currentItem, entityName, closeDialog, fetchData])

  // 批量删除
  const handleBatchDelete = useCallback(() => {
    if (selectedKeys.size === 0) {
      toast.warning("请先选择要删除的项目")
      return
    }
    setShowBatchDeleteConfirm(true)
  }, [selectedKeys])

  const confirmBatchDelete = useCallback(async () => {
    if (!deleteApi) return

    const ids = Array.from(selectedKeys).map(Number)
    setSubmitLoading(true)
    setShowBatchDeleteConfirm(false)

    try {
      await Promise.all(ids.map((id) => deleteApi(id)))
      toast.success(`成功删除 ${ids.length} 个${entityName}`)
      setSelectedKeys(new Set())
      fetchData()
    } catch (error) {
      const msg = error instanceof Error ? error.message : "批量删除失败"
      toast.error(msg)
    } finally {
      setSubmitLoading(false)
    }
  }, [deleteApi, selectedKeys, entityName, fetchData])

  // 选择处理
  const handleSelectRow = useCallback((key: string, checked: boolean) => {
    setSelectedKeys((prev) => {
      const next = new Set(prev)
      if (checked) {
        next.add(key)
      } else {
        next.delete(key)
      }
      return next
    })
  }, [])

  const handleSelectAll = useCallback(
    (checked: boolean) => {
      if (checked) {
        setSelectedKeys(new Set(data.map((item) => String(item.id))))
      } else {
        setSelectedKeys(new Set())
      }
    },
    [data]
  )

  // 默认操作列
  const defaultRenderActions = useCallback(
    (item: T) => (
      <div className="flex justify-end gap-1">
        {extraActions && extraActions(item)}
        {FormComponent && updateApi && createApi && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={(e) => {
              e.stopPropagation()
              openEdit(item)
            }}
          >
            <Edit className="h-4 w-4" />
          </Button>
        )}
        {deleteApi && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-destructive"
            onClick={(e) => {
              e.stopPropagation()
              openDelete(item)
            }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>
    ),
    [
      FormComponent,
      updateApi,
      createApi,
      deleteApi,
      openEdit,
      openDelete,
      extraActions,
    ]
  )

  // 最终列配置
  const finalColumns =
    renderActions || (FormComponent && updateApi && createApi) || deleteApi
      ? [
          ...columns,
          {
            key: "actions",
            header: "操作",
            headerClassName: "text-right",
            cellClassName: "text-right",
            cell: (row: T) =>
              renderActions ? renderActions(row) : defaultRenderActions(row),
          } as DataListColumn<T>,
        ]
      : columns

  // 默认卡片渲染：从 columns 中提取前几列数据展示
  const defaultRenderCard = (item: T) => {
    // 取前 3 列作为卡片信息（排除 actions 列）
    const infoColumns = columns.slice(0, 3)
    const meta = (
      <div className="flex flex-wrap gap-x-4 gap-y-1">
        {infoColumns.map((col) => (
          <span key={col.key}>
            <span className="text-muted-foreground">{col.header}: </span>
            {col.cell(item)}
          </span>
        ))}
      </div>
    )
    return (
      <RenderCard
        entity={item}
        title={String(item.id)}
        meta={meta}
        {...(FormComponent && updateApi && createApi
          ? { onEdit: openEdit }
          : {})}
        {...(deleteApi ? { onDelete: openDelete } : {})}
      />
    )
  }

  // 选择状态
  const isAllSelected = data.length > 0 && selectedKeys.size === data.length
  const isPartiallySelected =
    selectedKeys.size > 0 && selectedKeys.size < data.length

  // 获取删除显示名称
  const getDeleteItemName = (): React.ReactNode => {
    if (!currentItem) return ""
    if (getItemName) return getItemName(currentItem)
    const item = currentItem as Record<string, unknown>
    if ("name" in currentItem && typeof item.name === "string") {
      return item.name
    }
    return `ID: ${currentItem.id}`
  }

  const hasFormDialog = !!(FormComponent && createApi && updateApi)

  return (
    <Card>
      <CardContent className="space-y-4 p-4">
        {/* 搜索表单 */}
        {searchFields && searchFields.length > 0 && (
          <div className="mb-2">
            <CrudSearchForm
              fields={searchFields}
              values={searchFormValues}
              onValueChange={(name, value) =>
                setSearchFormValues((prev) => ({ ...prev, [name]: value }))
              }
              onSearch={handleSearch}
              onReset={handleReset}
              loading={loading}
            />
          </div>
        )}

        {/* 操作栏 */}
        <CrudActionsBar
          entityName={entityName}
          showAdd={hasFormDialog}
          onAdd={openAdd}
          selectable={selectable}
          selectedCount={selectedKeys.size}
          showBatchDelete={batchDelete}
          onBatchDelete={handleBatchDelete}
        />

        {/* 数据表格 */}
        <DataList
          data={data}
          columns={finalColumns}
          renderCard={defaultRenderCard}
          keyExtractor={(item) => String(item.id)}
          loading={loading}
          pagination={{
            page,
            pageSize,
            total,
            onPageChange: setPage,
          }}
          emptyText={`暂无${entityName}数据`}
          selectable={selectable}
          selectedRowKeys={selectedKeys}
          isAllSelected={isAllSelected}
          isPartiallySelected={isPartiallySelected}
          onSelectRow={handleSelectRow}
          onSelectAll={handleSelectAll}
        />
      </CardContent>

      {/* 新增/编辑弹窗 */}
      {hasFormDialog && (
        <CrudFormDialog
          open={dialogMode === "add" || dialogMode === "edit"}
          isEdit={dialogMode === "edit"}
          entityName={entityName}
          onClose={closeDialog}
          onSubmit={handleSubmit}
          formData={formData}
          onFormChange={setFormData}
          formComponent={FormComponent}
          loading={submitLoading}
          {...(dialogWidth ? { dialogWidth } : {})}
          {...(dialogHeight ? { dialogHeight } : {})}
        />
      )}

      {/* 删除确认弹窗 */}
      {deleteApi && (
        <CrudDeleteDialog
          open={dialogMode === "delete"}
          onClose={closeDialog}
          onConfirm={handleDelete}
          itemName={getDeleteItemName()}
          loading={submitLoading}
        />
      )}

      {/* 批量删除确认弹窗 */}
      {deleteApi && batchDelete && (
        <CrudBatchDeleteDialog
          open={showBatchDeleteConfirm}
          onClose={() => setShowBatchDeleteConfirm(false)}
          onConfirm={confirmBatchDelete}
          entityName={entityName}
          count={selectedKeys.size}
          loading={submitLoading}
        />
      )}
    </Card>
  )
}

export default Crud

"use client"

import { ReactNode, useState, useCallback, useEffect } from "react"
import { Search, Edit, Trash2, Plus } from "lucide-react"
import { toast } from "sonner"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
import { DataList, DataListColumn, RenderCard } from "@/components/widgets/data-list"

// ==================== 类型定义 ====================

/**
 * 分页响应接口
 */
export interface PageResponse<T> {
  data: T[]
  total: number
}

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
 * 包含 id 的实体类型
 */
export interface HasId {
  id: number
}

/**
 * CrudTable 组件配置
 */
export interface CrudTableProps<T extends HasId, FormData = T> {
  /** 页面标题 */
  title: string
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
  /** 是否可选择 */
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

  /** 自定义操作列 */
  renderActions?: (item: T) => ReactNode
  /** 额外操作按钮（在编辑/删除按钮之前显示） */
  extraActions?: (item: T) => ReactNode
  /** 获取删除确认显示名称 */
  getItemName?: (item: T) => ReactNode
}

type DialogMode = "none" | "add" | "edit" | "delete"

// ==================== 组件实现 ====================

export function CrudTable<T extends HasId, FormData = T>(
  props: CrudTableProps<T, FormData>
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
  const [searchFormValues, setSearchFormValues] = useState<Record<string, string>>({})

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
  const handleSearch = useCallback(
    (searchData: Record<string, string>) => {
      const params: Record<string, unknown> = {}
      for (const [key, value] of Object.entries(searchData)) {
        if (value !== undefined && value !== null && value !== "") {
          params[key] = value
        }
      }
      setSearchParams(params)
      setPage(1)
    },
    []
  )

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
          setFormData((item as unknown) as FormData)
        }
      } else {
        setFormData((item as unknown) as FormData)
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
    [FormComponent, updateApi, createApi, deleteApi, openEdit, openDelete, extraActions]
  )

  // 最终列配置
  const finalColumns =
    renderActions ||
    (FormComponent && updateApi && createApi) ||
    deleteApi
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

  // 默认卡片渲染
  const defaultRenderCard = (item: T) => (
    <RenderCard
      entity={item}
      title={String(item.id)}
      status={{
        value: "active",
        variant: "default",
        label: entityName,
      }}
      {...(FormComponent && updateApi && createApi ? { onEdit: openEdit } : {})}
      {...(deleteApi ? { onDelete: openDelete } : {})}
    />
  )

    // 自动渲染搜索表单
  const autoSearchForm = () => (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        handleSearch(searchFormValues)
      }}
      className="flex flex-wrap items-end gap-4"
    >
      {searchFields?.map((field) => (
        <div key={field.name} className="flex items-center gap-2">
          {field.type === "select" ? (
            <Select
              value={searchFormValues[field.name] || ""}
              onValueChange={(value) => {
                setSearchFormValues((prev) => ({ ...prev, [field.name]: value || "" }))
              }}
            >
              <SelectTrigger size="sm" className="w-32">
                <SelectValue placeholder={`${field.label}`} />
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
              value={searchFormValues[field.name] || ""}
              onChange={(e) =>
                setSearchFormValues((prev) => ({ ...prev, [field.name]: e.target.value }))
              }
               className="h-7 w-40 rounded-md border border-input bg-background px-2 text-sm"
            />
          )}
        </div>
      ))}
      <Button type="submit" size="sm" disabled={loading}>
        <Search className="mr-2 h-4 w-4" />
        搜索
      </Button>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => {
          setSearchFormValues({})
          handleReset()
        }}
        disabled={loading}
      >
        重置
      </Button>
    </form>
  )

  const isAllSelected = data.length > 0 && selectedKeys.size === data.length
  const isPartiallySelected = selectedKeys.size > 0 && selectedKeys.size < data.length

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

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 搜索表单 */}
        {searchFields && (
          <div className="mb-4">{autoSearchForm()}</div>
        )}

        {/* 操作栏 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {FormComponent && createApi && (
              <Button onClick={openAdd} size="sm">
                <Plus className="mr-2 h-4 w-4" />
                新增{entityName}
              </Button>
            )}
          </div>

          {selectable && batchDelete && deleteApi && (
            <Button
              variant="destructive"
              size="sm"
              onClick={handleBatchDelete}
              disabled={selectedKeys.size === 0}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              批量删除 ({selectedKeys.size})
            </Button>
          )}
        </div>

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
      {FormComponent && (
        <Dialog
          open={dialogMode === "add" || dialogMode === "edit"}
          onOpenChange={(open) => !open && closeDialog()}
        >
          <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>
                {dialogMode === "edit" ? `编辑${entityName}` : `新增${entityName}`}
              </DialogTitle>
            </DialogHeader>

            {formData && (
              <FormComponent formData={formData} onChange={setFormData} />
            )}

            <DialogFooter>
              <Button variant="outline" onClick={closeDialog} disabled={submitLoading}>
                取消
              </Button>
              <Button onClick={handleSubmit} disabled={submitLoading}>
                {submitLoading && (
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                )}
                {dialogMode === "edit" ? "更新" : "创建"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* 删除确认弹窗 */}
      <Dialog
        open={dialogMode === "delete"}
        onOpenChange={(open) => !open && closeDialog()}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>确认删除</DialogTitle>
            <DialogDescription>
              确定要删除「{getDeleteItemName()}」吗？此操作不可撤销。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={closeDialog} disabled={submitLoading}>
              取消
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={submitLoading}>
              {submitLoading && (
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              )}
              确认删除
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 批量删除确认弹窗 */}
      <Dialog
        open={showBatchDeleteConfirm}
        onOpenChange={(open) => !open && setShowBatchDeleteConfirm(false)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>批量删除{entityName}</DialogTitle>
            <DialogDescription>
              确定要删除选中的 {selectedKeys.size} 个{entityName}吗？此操作不可撤销。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowBatchDeleteConfirm(false)}
              disabled={submitLoading}
            >
              取消
            </Button>
            <Button
              variant="destructive"
              onClick={confirmBatchDelete}
              disabled={submitLoading}
            >
              {submitLoading && (
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              )}
              确认删除
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}

export default CrudTable

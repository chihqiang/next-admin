"use client"

import { useState, useCallback } from "react"
import { toast } from "sonner"

// ==================== 类型定义 ====================

/**
 * 弹窗模式
 */
type DialogMode = "none" | "add" | "edit" | "delete"

/**
 * CRUD 操作配置项
 * @template T 实体类型
 * @template FormData 表单数据类型（可选，默认等于 T）
 */
export interface CrudOptions<T, FormData = T> {
  /** 实体名称（用于提示语，如"账号"、"角色"） */
  entityName?: string
  /** 新增 API */
  createApi: (data: FormData) => Promise<unknown>
  /** 更新 API */
  updateApi: (data: FormData & { id: number }) => Promise<unknown>
  /** 删除 API */
  deleteApi: (id: number) => Promise<unknown>
  /** 操作成功后的回调（如刷新列表） */
  onSuccess?: () => void
  /** 自定义新增成功提示语 */
  createSuccessMessage?: string
  /** 自定义更新成功提示语 */
  updateSuccessMessage?: string
  /** 自定义删除成功提示语 */
  deleteSuccessMessage?: string
}

/**
 * useCrud Hook 返回值
 * @template T 实体类型
 * @template FormData 表单数据类型
 */
export interface CrudReturn<T, FormData = T> {
  // ==================== 状态 ====================
  /** 是否为编辑模式 */
  isEdit: boolean
  /** 当前选中的实体（用于编辑/删除） */
  currentItem: T | null
  /** 是否正在加载 */
  isLoading: boolean

  // ==================== 弹窗状态 ====================
  /** 表单弹窗是否打开（新增或编辑） */
  isFormOpen: boolean
  /** 删除确认弹窗是否打开 */
  isDeleteOpen: boolean

  // ==================== 弹窗控制 ====================
  /** 打开新增弹窗 */
  openAdd: () => void
  /** 打开编辑弹窗 */
  openEdit: (item: T) => void
  /** 打开删除确认弹窗 */
  openDelete: (item: T) => void
  /** 关闭所有弹窗 */
  closeAll: () => void

  // ==================== 业务方法 ====================
  /** 处理新增/更新提交 */
  handleSubmit: (data: FormData) => Promise<void>
  /** 处理删除 */
  handleDelete: () => Promise<void>
}

// ==================== Hook 实现 ====================

/**
 * CRUD 通用 Hook
 *
 * 封装常见的增删改查逻辑，避免在每个列表组件中重复编写。
 * UI 组件请使用 components/crud/ 目录下的通用组件。
 *
 * @template T 实体类型（如 Account、Role、Menu）
 * @template FormData 表单数据类型（可选，默认等于 T）
 * @param options CRUD 操作配置
 * @returns CRUD 状态和方法
 *
 * @example
 * ```tsx
 * const { openAdd, openEdit, openDelete, handleSubmit, handleDelete, isEdit, currentItem, isLoading } = useCrud({
 *   entityName: "账号",
 *   createApi: accountCreateApi,
 *   updateApi: accountUpdateApi,
 *   deleteApi: accountDeleteApi,
 *   onSuccess: fetchData,
 * })
 *
 * return (
 *   <>
 *     <Button onClick={openAdd}>新增</Button>
 *     <Table items={items} onEdit={openEdit} onDelete={openDelete} />
 *     <CrudFormDialog
 *       open={true}
 *       isEdit={isEdit}
 *       title={{ add: "新增账号", edit: "编辑账号" }}
 *       onClose={closeAll}
 *       onSubmit={handleSubmit}
 *       loading={isLoading}
 *     >
 *       {(formProps) => <AccountForm {...formProps} />}
 *     </CrudFormDialog>
 *     <CrudDeleteDialog
 *       open={true}
 *       itemName={currentItem?.name}
 *       onClose={closeAll}
 *       onConfirm={handleDelete}
 *       loading={isLoading}
 *     />
 *   </>
 * )
 * ```
 */
export function useCrud<T, FormData = T>(
  options: CrudOptions<T, FormData>
): CrudReturn<T, FormData> {
  const {
    entityName,
    createApi,
    updateApi,
    deleteApi,
    onSuccess,
    createSuccessMessage,
    updateSuccessMessage,
    deleteSuccessMessage,
  } = options

  // ==================== 状态 ====================
  const [dialogMode, setDialogMode] = useState<DialogMode>("none")
  const [isEdit, setIsEdit] = useState(false)
  const [currentItem, setCurrentItem] = useState<T | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // 派生状态
  const isFormOpen = dialogMode === "add" || dialogMode === "edit"
  const isDeleteOpen = dialogMode === "delete"

  // ==================== 弹窗控制 ====================

  const openAdd = useCallback(() => {
    setIsEdit(false)
    setCurrentItem(null)
    setDialogMode("add")
  }, [])

  const openEdit = useCallback((item: T) => {
    setIsEdit(true)
    setCurrentItem(item)
    setDialogMode("edit")
  }, [])

  const openDelete = useCallback((item: T) => {
    setCurrentItem(item)
    setDialogMode("delete")
  }, [])

  const closeAll = useCallback(() => {
    setIsEdit(false)
    setCurrentItem(null)
    setDialogMode("none")
  }, [])

  // ==================== 业务方法 ====================

  const handleSubmit = useCallback(
    async (data: FormData) => {
      try {
        setIsLoading(true)
        if (isEdit) {
          await updateApi({
            ...data,
            id: (currentItem as unknown as { id: number }).id,
          } as FormData & { id: number })
          toast.success(updateSuccessMessage || `${entityName}更新成功`)
        } else {
          await createApi(data)
          toast.success(createSuccessMessage || `${entityName}创建成功`)
        }
        closeAll()
        onSuccess?.()
      } catch (error) {
        const msg = error instanceof Error ? error.message : "操作失败"
        toast.error(msg)
        throw error
      } finally {
        setIsLoading(false)
      }
    },
    [
      isEdit,
      currentItem,
      createApi,
      updateApi,
      closeAll,
      onSuccess,
      entityName,
      createSuccessMessage,
      updateSuccessMessage,
    ]
  )

  const handleDelete = useCallback(async () => {
    if (!currentItem) return
    try {
      setIsLoading(true)
      await deleteApi((currentItem as unknown as { id: number }).id)
      toast.success(deleteSuccessMessage || `${entityName}删除成功`)
      closeAll()
      onSuccess?.()
    } catch (error) {
      const msg = error instanceof Error ? error.message : "操作失败"
      toast.error(msg)
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [
    currentItem,
    deleteApi,
    closeAll,
    onSuccess,
    entityName,
    deleteSuccessMessage,
  ])

  return {
    isEdit,
    currentItem,
    isLoading,
    isFormOpen,
    isDeleteOpen,
    openAdd,
    openEdit,
    openDelete,
    closeAll,
    handleSubmit,
    handleDelete,
  }
}

// ==================== 兼容层 ====================

/**
 * @deprecated 请使用 useCrud
 * 为了兼容旧代码，保留此 Hook
 * 旧接口返回：isAddDialogOpen, isEditDialogOpen, isDeleteDialogOpen, openAddDialog, closeAllDialogs, etc.
 */
export function useCrudDialog<T, FormData = T>(
  options: CrudOptions<T, FormData>
) {
  const {
    isEdit,
    currentItem,
    isLoading,
    isFormOpen,
    isDeleteOpen,
    openAdd,
    openEdit,
    openDelete,
    closeAll,
    handleSubmit,
    handleDelete,
  } = useCrud<T, FormData>(options)

  return {
    isAddDialogOpen: !isEdit && isFormOpen,
    isEditDialogOpen: isEdit && isFormOpen,
    isDeleteDialogOpen: isDeleteOpen,
    currentItem,
    isLoading,
    openAddDialog: openAdd,
    closeAllDialogs: closeAll,
    openEditDialog: openEdit,
    openDeleteDialog: openDelete,
    handleCreate: handleSubmit,
    handleUpdate: handleSubmit,
    handleDelete,
  }
}

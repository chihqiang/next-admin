"use client"

import { ReactNode } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"

// ==================== 类型定义 ====================

interface CrudFormDialogProps {
  /** 是否打开 */
  open: boolean
  /** 是否为编辑模式 */
  isEdit: boolean
  /** 标题（可以是字符串，或 { add: string; edit: string }） */
  title?: string | { add: string; edit: string }
  /** 自定义标题（当 title 为字符串时，会自动拼接"新增"/"编辑"前缀） */
  entityName?: string
  /** 关闭回调 */
  onClose: () => void
  /** 提交回调 */
  onSubmit: (data: unknown) => void | Promise<void>
  /** 是否加载中 */
  loading?: boolean
  /** 自定义提交按钮文本 */
  submitText?: string
  /** 表单内容（render prop，接收表单提交函数） */
  children: (handlers: { onSubmit: (data: unknown) => void }) => ReactNode
}

// ==================== 组件实现 ====================

/**
 * 通用表单弹窗（新增/编辑共用）
 *
 * @example
 * ```tsx
 * <CrudFormDialog
 *   open={true}
 *   isEdit={false}
 *   title={{ add: "新增账号", edit: "编辑账号" }}
 *   onClose={closeAll}
 *   onSubmit={handleSubmit}
 *   loading={isLoading}
 * >
 *   {({ onSubmit }) => (
 *     <AccountForm onSubmit={onSubmit} defaultValues={currentItem} />
 *   )}
 * </CrudFormDialog>
 * ```
 */
export function CrudFormDialog(props: CrudFormDialogProps) {
  const {
    open,
    isEdit,
    title,
    entityName,
    onClose,
    onSubmit,
    loading = false,
    submitText,
    children,
  } = props

  // 计算标题
  let dialogTitle: string
  if (typeof title === "string") {
    dialogTitle = title
  } else if (title && typeof title === "object") {
    dialogTitle = isEdit ? title.edit : title.add
  } else {
    const prefix = isEdit ? "编辑" : "新增"
    dialogTitle = entityName ? `${prefix}${entityName}` : `${prefix}`
  }

  // 提交处理函数
  const handleSubmit = (data: unknown) => {
    onSubmit(data)
  }

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{dialogTitle}</DialogTitle>
        </DialogHeader>
        {children({ onSubmit: handleSubmit })}
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            取消
          </Button>
          <Button type="submit" form="crud-form" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {submitText || (isEdit ? "更新" : "创建")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

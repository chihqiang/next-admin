"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"

// ==================== 类型定义 ====================

interface CrudDeleteDialogProps {
  /** 是否打开 */
  open: boolean
  /** 关闭回调 */
  onClose: () => void
  /** 确认回调 */
  onConfirm: () => void | Promise<void>
  /** 是否加载中 */
  loading?: boolean
  /** 标题（默认"确认删除"） */
  title?: string
  /** 描述内容（可以是字符串，或返回字符串的函数） */
  description?: string | ((itemName?: string) => string)
  /** 项目名称（用于描述中显示，如"管理员"） */
  itemName?: string
  /** 自定义确认按钮文本 */
  confirmText?: string
}

// ==================== 组件实现 ====================

/**
 * 通用删除确认弹窗
 *
 * @example
 * ```tsx
 * <CrudDeleteDialog
 *   open={true}
 *   itemName={currentItem?.name}
 *   onClose={closeAll}
 *   onConfirm={handleDelete}
 *   loading={isLoading}
 * />
 * ```
 */
export function CrudDeleteDialog(props: CrudDeleteDialogProps) {
  const {
    open,
    onClose,
    onConfirm,
    loading = false,
    title = "确认删除",
    description,
    itemName,
    confirmText = "确认删除",
  } = props

  // 计算描述内容
  let dialogDescription: string
  if (typeof description === "string") {
    dialogDescription = description
  } else if (typeof description === "function") {
    dialogDescription = description(itemName)
  } else {
    const name = itemName ? `「${itemName}」` : ""
    dialogDescription = `确定要删除 ${name} 吗？此操作不可撤销。`
  }

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{dialogDescription}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            取消
          </Button>
          <Button variant="destructive" onClick={onConfirm} disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

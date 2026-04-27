import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

interface ConfirmDialogProps {
  // 控制弹窗显示
  open: boolean
  // 关闭弹窗
  onClose: () => void
  // 标题
  title: string
  // 描述内容
  description: string | React.ReactNode
  // 确认按钮文字
  confirmText?: string
  // 取消按钮文字
  cancelText?: string
  // 确认按钮点击事件
  onConfirm: () => void
  // 确认按钮样式
  confirmButtonVariant?:
    | "default"
    | "destructive"
    | "ghost"
    | "link"
    | "secondary"
  // 加载状态
  isLoading?: boolean
}

export function ConfirmDialog({
  open,
  onClose,
  title,
  description,
  confirmText = "确定",
  cancelText = "取消",
  onConfirm,
  confirmButtonVariant = "default",
  isLoading = false,
}: ConfirmDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button variant="ghost" onClick={onClose} disabled={isLoading}>
            {cancelText}
          </Button>
          <Button
            variant={confirmButtonVariant}
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? "处理中..." : confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

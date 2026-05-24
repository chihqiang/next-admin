"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Role, Menu } from "@/api/roles"
import { menuAllApi } from "@/api/menu"
import { TreeCheckbox } from "@/components/widgets/tree-checkbox"
import { buildTree } from "@/lib/utils/tree"
import { useState, useEffect } from "react"

interface RoleAuthorizeDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  role: Role | null
  onAuthorize: (roleId: number, menuIds: number[]) => void
  isLoading?: boolean
}

export function RoleAuthorizeDialog({
  open,
  onOpenChange,
  role,
  onAuthorize,
  isLoading = false,
}: RoleAuthorizeDialogProps) {
  const [selectedMenuIds, setSelectedMenuIds] = useState<number[]>([])
  const [menus, setMenus] = useState<Menu[]>([])
  const [isLoadingMenus, setIsLoadingMenus] = useState(false)

  // 当弹窗打开时，获取菜单数据
  useEffect(() => {
    if (open) {
      const fetchMenus = async () => {
        try {
          setIsLoadingMenus(true)
          const menuList = await menuAllApi()
          setMenus(menuList)
        } catch (error) {
          console.error("获取菜单数据失败:", error)
        } finally {
          setIsLoadingMenus(false)
        }
      }

      fetchMenus()
    }
  }, [open])

  // 当角色变化时，重置选中的菜单
  useEffect(() => {
    if (role) {
      // 假设角色有 menus 字段，或者从其他地方获取已授权的菜单
      const authorizedMenuIds =
        (role as any).menus?.map((m: Menu) => m.id) || []
      setSelectedMenuIds(authorizedMenuIds)
    }
  }, [role])

  // 构建菜单 ID 到菜单对象的映射，用于快速查找
  const menuMap = new Map(menus.map((m) => [m.id, m]))

  // 将扁平化的菜单数据转换为树形结构
  const treeData = buildTree(menus)

  // 处理菜单选中状态变化
  const handleMenuChange = (ids: number[]) => {
    setSelectedMenuIds(ids)
  }

  // 处理授权提交
  const handleSubmit = () => {
    if (role) {
      onAuthorize(role.id, selectedMenuIds)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>角色授权</DialogTitle>
          <DialogDescription>
            为角色 {role?.name} 分配菜单权限，点击保存按钮完成授权
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          {isLoadingMenus ? (
            <div className="flex items-center justify-center py-8">
              <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <TreeCheckbox
              data={treeData}
              selectedIds={selectedMenuIds}
              onChange={handleMenuChange}
            />
          )}
        </div>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            disabled={isLoading || isLoadingMenus}
          >
            取消
          </Button>
          <Button
            onClick={handleSubmit}
            className="bg-blue-600 text-white hover:bg-blue-700"
            disabled={isLoading || isLoadingMenus}
          >
            {isLoading ? "授权中..." : "保存授权"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

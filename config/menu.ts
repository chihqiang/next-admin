import { LayoutDashboard, UserCog } from "lucide-react"

export interface Menu {
  key: string
  label: string
  icon?: React.ComponentType<{ className?: string }>
  path?: string
  children?: Menu[]
}

export const menus: Menu[] = [
  {
    key: "dashboard",
    label: "控制台",
    icon: LayoutDashboard,
    path: "/admin/dashboard",
  },
  {
    key: "auth",
    label: "权限管理",
    icon: UserCog,
    children: [
      {
        key: "accounts",
        label: "账号列表",
        path: "/admin/sys/account",
      },
      {
        key: "roles",
        label: "角色管理",
        path: "/admin/sys/roles",
      },
      {
        key: "menus",
        label: "菜单管理",
        path: "/admin/sys/menu",
      },
    ],
  },
]

/**
 * 从菜单配置自动生成路径到标题的映射
 * 避免手动维护导致的不一致
 */
function generatePathToTitleMap(menuList: Menu[]): Record<string, string> {
  const map: Record<string, string> = {}

  const traverse = (items: Menu[]) => {
    items.forEach((item) => {
      // 如果有path，添加到映射
      if (item.path) {
        map[item.path] = item.label
      }
      // 递归处理子菜单
      if (item.children) {
        traverse(item.children)
      }
    })
  }

  traverse(menuList)
  return map
}

/**
 * 路径到标题的映射
 * 从menus配置自动生成，包含登录等特殊页面
 */
export const pathToTitleMap: Record<string, string> = {
  // 特殊页面
  "/login": "登录",
  // 从菜单配置自动生成
  ...generatePathToTitleMap(menus),
}

// 可见的菜单项
export const visibleMenuItems: Menu[] = menus

// 获取页面标题
export function getPageTitle(pathname: string): string {
  return (
    Object.entries(pathToTitleMap)
      .filter(([path]) => pathname.startsWith(path))
      .sort((a, b) => b[0].length - a[0].length)
      .at(0)?.[1] ?? "管理后台"
  )
}

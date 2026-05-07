import {
  LayoutDashboard,
  Menu,
  ScrollText,
  ShieldUser,
  UserCog,
  Users,
} from "lucide-react"
import { getAccount } from "@/lib/account"

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
        icon: Users,
        path: "/admin/sys/account",
      },
      {
        key: "roles",
        label: "角色管理",
        icon: ShieldUser,
        path: "/admin/sys/roles",
      },
      {
        key: "menus",
        label: "菜单管理",
        icon: Menu,
        path: "/admin/sys/menu",
      },
      {
        key: "log",
        label: "日志管理",
        icon: ScrollText,
        path: "/admin/sys/log",
      },
    ],
  },
]

// 菜单配置
/**
 * 递归遍历菜单列表，生成路径到标题的映射
 */
function generatePathToTitleMap(menuList: Menu[]): Record<string, string> {
  const map: Record<string, string> = {}
  const traverse = (items: Menu[]) => {
    items.forEach((item) => {
      if (item.path) {
        map[item.path] = item.label
      }
      if (item.children) {
        traverse(item.children)
      }
    })
  }
  traverse(menuList)
  return map
}
/**
 * 获取路径到标题的完整映射（静态配置 + 账户动态菜单）
 */
export function getAccountMenuPathTitleMap(): Record<string, string> {
  const accountMap: Record<string, string> = {}
  type AccountMenu = { path?: string; name: string; children?: AccountMenu[] }
  const traverseAccountMenus = (items: AccountMenu[]) => {
    items.forEach((item) => {
      if (item.path) {
        accountMap[item.path] = item.name
      }
      if (item.children) {
        traverseAccountMenus(item.children)
      }
    })
  }
  traverseAccountMenus((getAccount()?.menus ?? []) as AccountMenu[])
  return {
    ...pathToTitleMap,
    ...accountMap,
  }
}
// 静态路径映射（不含动态菜单）
export const pathToTitleMap: Record<string, string> = {
  "/login": "登录",
  ...generatePathToTitleMap(menus),
}

// 获取页面标题（自动合并用户菜单）
export function getPageTitle(pathname: string): string {
  const map =
    typeof window !== "undefined"
      ? getAccountMenuPathTitleMap()
      : pathToTitleMap
  return (
    Object.entries(map)
      .filter(([path]) => pathname.startsWith(path))
      .sort((a, b) => b[0].length - a[0].length)
      .at(0)?.[1] ?? "管理后台"
  )
}

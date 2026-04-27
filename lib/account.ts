import { local } from "@/lib/storage"

const ACCOUNT_KEY = "AUTH_ACCOUNT"

export interface AuthAccount {
  id: number
  name: string
  email: string
  status: boolean
  menus: AuthMenu[]
}

export interface AuthMenu {
  /** 菜单ID */
  id: number
  /** 父菜单ID */
  pid: number
  /** 菜单类型 1-目录 2-菜单 3-按钮 */
  menu_type: number
  /** 菜单名称 */
  name: string
  /** 前端路由地址 */
  path: string
  /** 前端组件路径 */
  component: string
  /** 菜单图标 */
  icon: string
  /** 显示顺序 */
  sort: number
  /** 接口地址 */
  api_url: string
  /** 请求方式 GET/POST/PUT/DELETE，* 代表不限 */
  api_method: string
  /** 是否显示 true-显示 false-隐藏 */
  visible: boolean
  /** 状态 true-正常 false-禁用 */
  status: boolean
  /** 备注 */
  remark: string
}

export const setAccount = (account: AuthAccount) => {
  local.set(ACCOUNT_KEY, account)
}
/**
 * 删除账户信息
 */
export const removeAccount = () => {
  local.remove(ACCOUNT_KEY)
}
/**
 * 获取账户信息
 */
export const getAccount = (): AuthAccount | null => {
  return local.get<AuthAccount | null>(ACCOUNT_KEY, null)
}

/**
 * 检查是否存在指定路径的菜单
 */
export const hasMenuPath = (path: string): boolean => {
  return Boolean(
    getAccount()?.menus?.find((item: AuthMenu) => item.path === path)
  )
}

/**
 * 检查是否存在指定接口地址的菜单
 */
export const hasMenuApiUrl = (url: string): boolean => {
  return Boolean(
    getAccount()?.menus?.find((item: AuthMenu) => item.api_url === url)
  )
}
// 菜单树结构
export interface AuthMenuTree extends AuthMenu {
  children: AuthMenuTree[]
}

// 构建菜单树，支持任意层级嵌套
export const menuTree = (menus: AuthMenu[]): AuthMenuTree[] => {
  const nodeMap = new Map<number, AuthMenuTree>()
  const roots: AuthMenuTree[] = []

  // 先构建所有节点
  menus.forEach((item) => {
    nodeMap.set(item.id, {
      ...item,
      children: [],
    })
  })

  // 再将节点挂载到父节点
  menus.forEach((item) => {
    const node = nodeMap.get(item.id)!
    if (item.pid === 0) {
      roots.push(node)
      return
    }

    const parent = nodeMap.get(item.pid)
    if (parent) {
      parent.children.push(node)
    } else {
      roots.push(node)
    }
  })

  return roots
}

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
  id: number
  pid: number
  menu_type: number
  name: string
  path: string
  component: string
  icon: string
  sort: number
  api_url: string
  api_method: string
  visible: boolean
  status: boolean
  remark: string
}

export const setAccount = (account: AuthAccount) => {
  local.set(ACCOUNT_KEY, account)
}

export const removeAccount = () => {
  local.remove(ACCOUNT_KEY)
}

export const getAccount = (): AuthAccount | null => {
  return local.get<AuthAccount | null>(ACCOUNT_KEY, null)
}

export const hasMenuPath = (path: string): boolean => {
  return Boolean(
    getAccount()?.menus?.find((item: AuthMenu) => item.path === path)
  )
}

function matchApiUrl(pattern: string, url: string): boolean {
  const patternSegments = pattern.split("/")
  const urlSegments = url.split("/")

  if (patternSegments.length !== urlSegments.length) {
    return false
  }

  for (let i = 0; i < patternSegments.length; i++) {
    const patternSeg = patternSegments[i]
    const urlSeg = urlSegments[i]

    if (patternSeg === "*") {
      continue
    }

    if (patternSeg !== urlSeg) {
      return false
    }
  }

  return true
}

export const hasMenuApiUrl = (url: string): boolean => {
  return Boolean(
    getAccount()?.menus?.find((item: AuthMenu) =>
      item.api_url ? matchApiUrl(item.api_url, url) : false
    )
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

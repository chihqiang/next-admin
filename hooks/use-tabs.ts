"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import { getPageTitle } from "@/lib/nav"
import { local } from "@/lib/storage"

// -----------------------------------------------------------------------------
// 类型定义
// -----------------------------------------------------------------------------

export interface TabItem {
  /** 路由路径，唯一标识 */
  path: string
  /** 标签页显示标题 */
  title: string
  /** 是否可关闭（首页 Tab 不可关闭） */
  closable: boolean
}

interface TabState {
  tabs: TabItem[]
  activePath: string
}

// -----------------------------------------------------------------------------
// 常量
// -----------------------------------------------------------------------------

const STORAGE_KEY = "ADMIN_TABS"

/** 默认首页 Tab（不可关闭） */
const HOME_TAB: TabItem = {
  path: "/admin/dashboard",
  title: "控制台",
  closable: false,
}

// -----------------------------------------------------------------------------
// Hook 实现
// -----------------------------------------------------------------------------

/**
 * 多标签页管理 Hook
 *
 * 功能：
 * - 自动监听路由变化，打开/激活对应 Tab
 * - Tab 持久化到 localStorage，刷新后恢复
 * - 支持关闭单个、关闭其他、关闭全部
 * - 首页 Tab 不可关闭
 */
export function useTabs() {
  const router = useRouter()
  const pathname = usePathname()
  const [tabs, setTabs] = useState<TabItem[]>([HOME_TAB])
  const [activePath, setActivePath] = useState<string>(pathname)
  const initialized = useRef(false)

  // 从 localStorage 恢复 Tab 状态
  useEffect(() => {
    const saved = local.get<TabState | null>(STORAGE_KEY, null)
    if (saved && saved.tabs && saved.tabs.length > 0) {
      // 确保首页 Tab 始终存在且在第一位
      const hasHome = saved.tabs.some((t) => t.path === HOME_TAB.path)
      const restored = hasHome ? saved.tabs : [HOME_TAB, ...saved.tabs]
      setTabs(restored)
      setActivePath(saved.activePath || pathname)
    }
    initialized.current = true
  }, [])

  // 持久化到 localStorage
  useEffect(() => {
    if (!initialized.current) return
    local.set<TabState>(STORAGE_KEY, { tabs, activePath })
  }, [tabs, activePath])

  // 路由变化时自动添加/激活 Tab
  useEffect(() => {
    if (!initialized.current) return
    // 只处理 /admin 下的路由
    if (!pathname.startsWith("/admin")) return

    const title = getPageTitle(pathname)
    const isHome = pathname === HOME_TAB.path

    setTabs((prev) => {
      const existing = prev.find((t) => t.path === pathname)
      if (existing) {
        // 已存在，更新标题（可能动态菜单变了）
        return prev.map((t) =>
          t.path === pathname ? { ...t, title } : t
        )
      }
      // 新增 Tab
      const newTab: TabItem = {
        path: pathname,
        title,
        closable: !isHome,
      }
      return [...prev, newTab]
    })

    setActivePath(pathname)
  }, [pathname])

  // 点击 Tab 导航
  const navigateToTab = useCallback(
    (path: string) => {
      if (path === pathname) return
      router.push(path)
    },
    [router, pathname]
  )

  // 关闭单个 Tab
  const closeTab = useCallback(
    (path: string) => {
      setTabs((prev) => {
        const target = prev.find((t) => t.path === path)
        if (!target || !target.closable) return prev

        const newTabs = prev.filter((t) => t.path !== path)

        // 如果关闭的是当前激活的 Tab，跳转到相邻 Tab
        if (path === activePath) {
          const closedIndex = prev.findIndex((t) => t.path === path)
          const nextActive =
            newTabs[Math.min(closedIndex, newTabs.length - 1)]
          if (nextActive) {
            router.push(nextActive.path)
          }
        }

        return newTabs
      })
    },
    [activePath, router]
  )

  // 关闭其他 Tab
  const closeOtherTabs = useCallback(
    (path: string) => {
      setTabs((prev) => {
        const target = prev.find((t) => t.path === path)
        if (!target) return prev

        // 保留目标 Tab + 首页 Tab（如果不同）
        const keep = prev.filter(
          (t) => t.path === path || !t.closable
        )

        // 如果目标 Tab 不是当前路由，跳转过去
        if (path !== pathname) {
          router.push(path)
        }

        return keep
      })
    },
    [router, pathname]
  )

  // 关闭所有可关闭的 Tab（保留首页）
  const closeAllTabs = useCallback(() => {
    setTabs((prev) => prev.filter((t) => !t.closable))
    // 跳回首页
    if (pathname !== HOME_TAB.path) {
      router.push(HOME_TAB.path)
    }
  }, [router, pathname])

  // 刷新当前 Tab（关闭再重新导航）
  const refreshTab = useCallback(
    (path: string) => {
      // 通过移除再添加来触发组件重新挂载
      setActivePath("")
      setTimeout(() => {
        setActivePath(path)
        router.push(path)
      }, 0)
    },
    [router]
  )

  return {
    tabs,
    activePath,
    navigateToTab,
    closeTab,
    closeOtherTabs,
    closeAllTabs,
    refreshTab,
  }
}

"use client"

import React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Building2, ChevronDown, ChevronRight, Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
  SidebarFooter,
} from "@/components/ui/sidebar"
import { useState } from "react"
import { getPageTitle } from "@/config/menu"
import { AuthMenuTree } from "@/lib/account"
import { NavAccount } from "@/components/layout/nav-account"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/hooks/use-auth"
import { Icon } from "@/components/widgets/ico"

export function LayoutSidebar({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()
  const { authAccount, getCurrentMenuTree } = useAuth()
  const accountData = {
    account: {
      name: authAccount?.name || "管理员",
      email: authAccount?.email || "",
    },
  }
  // 获取当前菜单树
  const menuTree = getCurrentMenuTree()
  // 初始化菜单展开状态（使用懒初始化，避免每次渲染都执行计算）
  const [menuOpenState, setMenuOpenState] = useState<Record<string, boolean>>(
    () => {
      return menuTree.reduce(
        (acc, item) => {
          if (item.children && item.children.length > 0) {
            acc[item.id.toString()] = item.children.some((child) =>
              pathname.startsWith(child.path || "")
            )
          }
          return acc
        },
        {} as Record<string, boolean>
      )
    }
  )
  const toggleMenu = (key: string) => {
    setMenuOpenState((prev) => ({
      ...prev,
      [key]: !prev[key],
    }))
  }

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center justify-between px-4 py-2">
            <div className="flex items-center gap-2">
              <Building2 className="h-6 w-6" />
              <span className="text-lg font-semibold">管理后台</span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              title={theme === "dark" ? "切换到亮色模式" : "切换到暗色模式"}
            >
              {theme === "dark" ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
              <span className="sr-only">切换主题</span>
            </Button>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {menuTree.map((item: AuthMenuTree) => (
                  <SidebarMenuItem key={item.id}>
                    {!item.children || item.children.length === 0 ? (
                      item.path ? (
                        <Link
                          href={item.path}
                          className={`flex w-full items-center gap-3 overflow-hidden rounded-md p-2 text-left text-sm ring-sidebar-ring outline-hidden transition-[width,height,padding] hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 active:bg-sidebar-accent active:text-sidebar-accent-foreground ${pathname === item.path ? "bg-sidebar-accent font-medium text-sidebar-accent-foreground" : ""}`}
                        >
                          {item.icon && <Icon name={item.icon} />}
                          <span>{item.name}</span>
                        </Link>
                      ) : (
                        <div className="flex w-full items-center gap-3 overflow-hidden rounded-md p-2 text-left text-sm ring-sidebar-ring outline-hidden transition-[width,height,padding] hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 active:bg-sidebar-accent active:text-sidebar-accent-foreground">
                          {item.icon && <Icon name={item.icon} />}
                          <span>{item.name}</span>
                        </div>
                      )
                    ) : (
                      <>
                        <SidebarMenuButton
                          onClick={(e) => {
                            e.stopPropagation()
                            toggleMenu(item.id.toString())
                          }}
                          className="flex w-full items-center justify-between gap-3"
                        >
                          <div className="flex items-center gap-3">
                            {item.icon && <Icon name={item.icon} />}
                            <span>{item.name}</span>
                          </div>
                          {menuOpenState[item.id.toString()] ? (
                            <ChevronDown className="h-3 w-3" />
                          ) : (
                            <ChevronRight className="h-3 w-3" />
                          )}
                        </SidebarMenuButton>
                        {menuOpenState[item.id.toString()] && item.children && (
                          <SidebarMenuSub>
                            {item.children.map((subItem: AuthMenuTree) => (
                              <SidebarMenuSubItem key={subItem.id}>
                                {subItem.path ? (
                                  <Link
                                    href={subItem.path}
                                    className={`flex h-7 min-w-0 -translate-x-px items-center gap-2 overflow-hidden rounded-md px-2 text-sm text-sidebar-foreground ring-sidebar-ring outline-hidden group-data-[collapsible=icon]:hidden hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 active:bg-sidebar-accent active:text-sidebar-accent-foreground disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 data-active:bg-sidebar-accent data-active:text-sidebar-accent-foreground [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0 [&>svg]:text-sidebar-accent-foreground ${pathname.startsWith(subItem.path || "") ? "bg-sidebar-accent text-sidebar-accent-foreground" : ""}`}
                                  >
                                    {subItem.icon && (
                                      <Icon name={subItem.icon} />
                                    )}
                                    {subItem.name}
                                  </Link>
                                ) : (
                                  <div className="flex h-7 min-w-0 -translate-x-px items-center gap-2 overflow-hidden rounded-md px-2 text-sm text-sidebar-foreground ring-sidebar-ring outline-hidden group-data-[collapsible=icon]:hidden hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 active:bg-sidebar-accent active:text-sidebar-accent-foreground disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 data-active:bg-sidebar-accent data-active:text-sidebar-accent-foreground [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0 [&>svg]:text-sidebar-accent-foreground">
                                    {subItem.icon && (
                                      <Icon name={subItem.icon} />
                                    )}
                                    {subItem.name}
                                  </div>
                                )}
                              </SidebarMenuSubItem>
                            ))}
                          </SidebarMenuSub>
                        )}
                      </>
                    )}
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <NavAccount account={accountData.account} />
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>
      <SidebarInset className="min-w-0 overflow-hidden">
        <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <h1 className="font-semibold">{getPageTitle(pathname)}</h1>
        </header>
        <div className="min-w-0 flex-1 overflow-y-auto p-4">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  )
}

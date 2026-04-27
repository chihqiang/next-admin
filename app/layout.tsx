"use client"

import { Geist_Mono, Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/components/providers/auth-provider"
import { cn } from "@/lib/utils"
import { Toaster } from "sonner"
import { NProgressProvider } from "@/components/providers/nprogress-provider"
import { getPageTitle } from "@/config/menu"
import { useEffect } from "react"
import { usePathname } from "next/navigation"

import "@/mocks"

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" })

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  // 从路径中获取页面标题
  const pathname = usePathname()
  useEffect(() => {
    // 从路径中获取页面标题
    const pageTitle = getPageTitle(pathname)
    // 设置文档标题
    document.title = pageTitle ? `${pageTitle} - 管理后台` : "管理后台"
  }, [pathname])
  // 渲染页面
  return (
    <html
      lang="zh-CN"
      suppressHydrationWarning
      className={cn(
        "antialiased",
        fontMono.variable,
        "font-sans",
        inter.variable
      )}
    >
      <body>
        <AuthProvider>
          <ThemeProvider>{children}</ThemeProvider>
          <Toaster />
          <NProgressProvider />
        </AuthProvider>
      </body>
    </html>
  )
}

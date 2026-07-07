import { useAuth } from "@/hooks/use-auth"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { authEventBus } from "@/lib/token"

interface AuthGuardProps {
  children: React.ReactNode
}
export function AuthGuard({ children }: AuthGuardProps) {
  const { authToken, isLoading } = useAuth()
  const router = useRouter()

  // 根据authToken判断是否已登录
  const isLoggedIn = !!authToken

  useEffect(() => {
    // 如果验证完成并且账户未登录，重定向到登录页面
    if (!isLoading && !isLoggedIn) {
      router.push("/login")
    }
  }, [isLoading, isLoggedIn, router])

  // 监听认证事件
  useEffect(() => {
    // 监听未授权事件
    const unsubscribeUnauthorized = authEventBus.on("auth:unauthorized", () => {
      router.push("/login")
    })

    // 监听登出事件
    const unsubscribeLogout = authEventBus.on("auth:logout", () => {
      router.push("/login")
    })

    return () => {
      unsubscribeUnauthorized()
      unsubscribeLogout()
    }
  }, [router])

  // 只有当账户已登录时才渲染children
  if (!isLoggedIn) {
    return null
  }
  return <>{children}</>
}

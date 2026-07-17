import { useAuth } from "@/hooks/use-auth"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { authEventBus } from "@/lib/token"
import { Skeleton } from "@/components/ui/skeleton"

interface AuthGuardProps {
  children: React.ReactNode
}
export function AuthGuard({ children }: AuthGuardProps) {
  const { authToken, isLoading } = useAuth()
  const router = useRouter()

  const isLoggedIn = !!authToken

  useEffect(() => {
    if (!isLoading && !isLoggedIn) {
      router.push("/login")
    }
  }, [isLoading, isLoggedIn, router])

  useEffect(() => {
    const unsubscribeUnauthorized = authEventBus.on("auth:unauthorized", () => {
      router.push("/login")
    })

    const unsubscribeLogout = authEventBus.on("auth:logout", () => {
      router.push("/login")
    })

    return () => {
      unsubscribeUnauthorized()
      unsubscribeLogout()
    }
  }, [router])

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="space-y-3">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>
    )
  }

  if (!isLoggedIn) {
    return null
  }
  return <>{children}</>
}

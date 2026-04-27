import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LayoutDashboard } from "lucide-react"

export default function AdminPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <LayoutDashboard className="h-6 w-6 text-gray-600 dark:text-gray-400" />
        <h1 className="text-2xl font-bold">控制台</h1>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">
              总账户数
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">1,234</div>
            <div className="mt-1 text-sm text-green-600 dark:text-green-400">
              +12.5% 较上月
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">
              今日访问量
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">567</div>
            <div className="mt-1 text-sm text-green-600 dark:text-green-400">
              +8.2% 较昨日
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">
              活跃账户
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">892</div>
            <div className="mt-1 text-sm text-green-600 dark:text-green-400">
              +5.3% 较上周
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">
              系统状态
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600 dark:text-green-400">
              正常
            </div>
            <div className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              所有服务运行正常
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>最近活动</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
                <span className="font-medium text-blue-600 dark:text-blue-400">
                  U
                </span>
              </div>
              <div>
                <p className="text-sm font-medium">账户 John Doe 登录系统</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  2分钟前
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
                <span className="font-medium text-green-600 dark:text-green-400">
                  A
                </span>
              </div>
              <div>
                <p className="text-sm font-medium">新账户 Jane Smith 注册</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  15分钟前
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900">
                <span className="font-medium text-purple-600 dark:text-purple-400">
                  M
                </span>
              </div>
              <div>
                <p className="text-sm font-medium">菜单管理已更新</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  1小时前
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

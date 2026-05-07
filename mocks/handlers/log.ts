import { HttpResponse, delay, http } from "msw"

const mockLogList = Array.from({ length: 50 }, (_, index) => ({
  id: index + 1,
  request_path: `/api/v1/sys/${["account", "role", "menu", "log"][index % 4]}/${["list", "create", "update", "delete"][index % 4]}`,
  request_method: ["GET", "POST", "PUT", "DELETE"][index % 4],
  response_code: index % 10 === 0 ? 500 : 200,
  request_payload:
    index % 3 === 0 ? JSON.stringify({ name: "test", id: index }) : undefined,
  request_ip: `192.168.1.${(index % 255) + 1}`,
  request_os: index % 2 === 0 ? "Windows 10" : "macOS 14",
  request_browser: index % 2 === 0 ? "Chrome 120.0" : "Safari 17.0",
  process_time: `${(Math.random() * 100).toFixed(2)}ms`,
  account_id: (index % 10) + 1,
  account_name: index % 5 === 0 ? "system" : `admin${index % 3}`,
  description: index % 10 === 0 ? "操作失败" : "操作成功",
  created_at: new Date(Date.now() - index * 3600000).toISOString(),
}))

export const logHandlers = [
  // 获取日志列表
  http.get("/api/v1/sys/log/list", async ({ request }) => {
    await delay(300)

    const url = new URL(request.url)
    const page = Number(url.searchParams.get("page")) || 1
    const page_size = Number(url.searchParams.get("page_size")) || 10
    const request_path = url.searchParams.get("request_path")
    const request_method = url.searchParams.get("request_method")
    const request_ip = url.searchParams.get("request_ip")

    let list = [...mockLogList]

    // 过滤
    if (request_path) {
      list = list.filter((item) => item.request_path.includes(request_path))
    }
    if (request_method) {
      list = list.filter((item) => item.request_method === request_method)
    }
    if (request_ip) {
      list = list.filter((item) => item.request_ip?.includes(request_ip))
    }

    // 分页
    const start = (page - 1) * page_size
    const end = start + page_size
    const data = list.slice(start, end)

    return HttpResponse.json({
      code: 0,
      message: "success",
      data: {
        data,
        total: list.length,
        page,
        page_size,
      },
    })
  }),
]

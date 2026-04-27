import { http, HttpResponse } from "msw"
import { accounts, menus } from "@/mocks/handlers/data"

export const accountHandlers = [
  // 登录（带账号密码校验）
  http.post("/api/v1/auth/login", async ({ request }) => {
    const body = await request.json()
    const { email, password } = body as {
      email: string
      password: string
      remember: boolean
    }
    // 模拟校验
    if (email === "admin@example.com" && password === "123456") {
      return HttpResponse.json({
        code: 0,
        msg: "登录成功",
        data: {
          id: 1,
          login_type: "password",
          access_token: "mock-token-" + Date.now(),
          token_type: "Bearer",
          expires_in: 3600,
          refresh_token: "mock-refresh-token-" + Date.now(),
        },
      })
    } else {
      return HttpResponse.json({
        code: 1001,
        msg: "邮箱或密码错误",
        data: null,
      })
    }
  }),
  // 获取当前登录用户信息
  http.get("/api/v1/auth/user/profile", async ({ request }) => {
    return HttpResponse.json({
      code: 0,
      msg: "登录成功",
      data: {
        id: 1,
        name: "管理员",
        email: "admin@example.com",
        menus: menus,
      },
    })
  }),
  // 账号分页列表（最新 MSW 语法）
  http.get("/api/v1/sys/account/list", ({ request }) => {
    const url = new URL(request.url)
    // 获取分页参数
    const page = url.searchParams.get("page") || "1"
    const size = url.searchParams.get("size") || "10"
    const id = url.searchParams.get("id")
    // 过滤数据
    let filteredAccounts = accounts
    if (id) {
      filteredAccounts = accounts.filter((account) => account.id === Number(id))
    }
    // 分页处理
    const startIndex = (Number(page) - 1) * Number(size)
    const endIndex = startIndex + Number(size)
    const paginatedAccounts = filteredAccounts.slice(startIndex, endIndex)
    // 返回格式和接口完全一致
    return HttpResponse.json({
      code: 0,
      msg: "success",
      data: {
        total: filteredAccounts.length,
        list: paginatedAccounts,
        page: Number(page),
        size: Number(size),
      },
    })
  }),

  // 创建账号
  http.post("/api/v1/sys/account/create", async ({ request }) => {
    const body = await request.json()
    const account = body as {
      name: string
      email: string
      password?: string
      roles: Array<{ id: number; name: string }>
      status: boolean
    }

    // 模拟创建账号，返回创建的账号信息
    return HttpResponse.json({
      code: 0,
      msg: "创建成功",
      data: {
        id: Math.floor(Math.random() * 10000),
        name: account.name,
        email: account.email,
        roles: account.roles,
        status: account.status,
      },
    })
  }),

  // 更新账号
  http.put("/api/v1/sys/account/update/:id", async ({ request, params }) => {
    const body = await request.json()
    const account = body as {
      id: number
      name: string
      email: string
      password?: string
      roles: Array<{ id: number; name: string }>
      status: boolean
    }

    // 模拟更新账号，返回更新后的账号信息
    return HttpResponse.json({
      code: 0,
      msg: "更新成功",
      data: {
        id: account.id,
        name: account.name,
        email: account.email,
        roles: account.roles,
        status: account.status,
      },
    })
  }),

  // 删除账号
  http.delete("/api/v1/sys/account/delete/:id", ({ params }) => {
    const id = Number(params.id)

    // 模拟删除账号，返回删除的账号信息
    return HttpResponse.json({
      code: 0,
      msg: "删除成功",
      data: {
        id: id,
        name: `user_${id}`,
        email: `user_${id}@example.com`,
        roles: [{ id: 1, name: "admin" }],
        status: true,
      },
    })
  }),

  // 获取账号详情
  http.get("/api/v1/sys/account/detail/:id", ({ params }) => {
    const id = Number(params.id)

    // 模拟获取账号详情
    return HttpResponse.json({
      code: 0,
      msg: "success",
      data: {
        id: id,
        name: `user_${id}`,
        email: `user_${id}@example.com`,
        roles: [{ id: 1, name: "admin" }],
        status: true,
      },
    })
  }),
]

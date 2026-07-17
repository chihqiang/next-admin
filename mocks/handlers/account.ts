import { http, HttpResponse } from "msw"
import { accounts, menus, roles } from "@/mocks/handlers/data"

export const accountHandlers = [
  http.post("/api/v1/auth/login", async ({ request }) => {
    const body = await request.json()
    const { email, password } = body as {
      email: string
      password: string
      remember: boolean
    }
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

  http.get("/api/v1/auth/me", async () => {
    return HttpResponse.json({
      code: 0,
      msg: "success",
      data: {
        id: 1,
        name: "管理员",
        email: "admin@example.com",
        menus: menus,
      },
    })
  }),

  http.get("/api/v1/sys/accounts", ({ request }) => {
    const url = new URL(request.url)
    const page = url.searchParams.get("page") || "1"
    const size = url.searchParams.get("size") || "10"
    const id = url.searchParams.get("id")

    let filteredAccounts = accounts
    if (id) {
      filteredAccounts = accounts.filter((account) => account.id === Number(id))
    }

    const startIndex = (Number(page) - 1) * Number(size)
    const endIndex = startIndex + Number(size)
    const paginatedAccounts = filteredAccounts.slice(startIndex, endIndex)

    return HttpResponse.json({
      code: 0,
      msg: "success",
      data: {
        total: filteredAccounts.length,
        data: paginatedAccounts,
      },
    })
  }),

  http.get("/api/v1/sys/accounts/:id", ({ params }) => {
    const id = Number(params.id)
    const account = accounts.find((a) => a.id === id)

    if (account) {
      return HttpResponse.json({
        code: 0,
        msg: "success",
        data: account,
      })
    } else {
      return HttpResponse.json(
        {
          code: 404,
          msg: "账号不存在",
          data: null,
        },
        { status: 404 }
      )
    }
  }),

  http.post("/api/v1/sys/accounts", async ({ request }) => {
    const body = await request.json()
    const account = body as {
      name: string
      email: string
      password?: string
      roles: Array<{ id: number; name: string }>
      status: boolean
    }

    const fullRoles = account.roles
      .map((r) => roles.find((fr) => fr.id === r.id))
      .filter(Boolean) as typeof roles
    const newAccount = {
      id: Math.floor(Math.random() * 10000),
      name: account.name,
      email: account.email,
      roles: fullRoles,
      status: account.status,
    }
    accounts.push(newAccount)

    return HttpResponse.json({
      code: 0,
      msg: "创建成功",
      data: newAccount,
    })
  }),

  http.put("/api/v1/sys/accounts/:id", async ({ request, params }) => {
    const id = Number(params.id)
    const body = await request.json()
    const account = body as {
      id: number
      name: string
      email: string
      password?: string
      roles: Array<{ id: number; name: string }>
      status: boolean
    }

    const index = accounts.findIndex((a) => a.id === id)
    if (index !== -1) {
      const fullRoles = account.roles
        .map((r) => roles.find((fr) => fr.id === r.id))
        .filter(Boolean) as typeof roles
      accounts[index] = { ...accounts[index], ...account, id, roles: fullRoles }
    }

    return HttpResponse.json({
      code: 0,
      msg: "更新成功",
      data: accounts[index] || { ...account, id },
    })
  }),

  http.delete("/api/v1/sys/accounts/:id", ({ params }) => {
    const id = Number(params.id)
    const index = accounts.findIndex((a) => a.id === id)
    const deleted = index !== -1 ? accounts[index] : null
    if (index !== -1) {
      accounts.splice(index, 1)
    }

    return HttpResponse.json({
      code: 0,
      msg: "删除成功",
      data: deleted || {
        id,
        name: `user_${id}`,
        email: `user_${id}@example.com`,
        roles: [],
        status: true,
      },
    })
  }),
]

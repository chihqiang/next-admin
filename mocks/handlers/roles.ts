import { http, HttpResponse } from "msw"
import { roles } from "@/mocks/handlers/data"

export const roleHandlers = [
  // 获取角色列表
  http.get("/api/v1/sys/role/list", ({ request }) => {
    const url = new URL(request.url)
    const page = url.searchParams.get("page") || "1"
    const size = url.searchParams.get("size") || "10"
    const id = url.searchParams.get("id")

    let filteredRoles = roles
    if (id) {
      filteredRoles = roles.filter((role) => role.id === Number(id))
    }

    const startIndex = (Number(page) - 1) * Number(size)
    const endIndex = startIndex + Number(size)
    const paginatedRoles = filteredRoles.slice(startIndex, endIndex)

    return HttpResponse.json({
      code: 0,
      msg: "success",
      data: {
        total: filteredRoles.length,
        data: paginatedRoles,
        page: Number(page),
        size: Number(size),
      },
    })
  }),

  // 获取所有角色
  http.get("/api/v1/sys/role/all", () => {
    return HttpResponse.json({
      code: 0,
      msg: "success",
      data: roles,
    })
  }),

  // 授权角色菜单
  http.post("/api/v1/sys/role/associate-menus", async ({ request }) => {
    const body = await request.json()
    const { id, menu_ids } = body as { id: number; menu_ids: number[] }

    const role = roles.find((r) => r.id === id)
    if (role) {
      return HttpResponse.json({
        code: 0,
        msg: "授权成功",
        data: {
          ...role,
          menus: menu_ids,
        },
      })
    } else {
      return HttpResponse.json({
        code: 404,
        msg: "角色不存在",
        data: null,
      })
    }
  }),

  // 获取角色详情
  http.get("/api/v1/sys/role/detail", ({ request }) => {
    const url = new URL(request.url)
    const id = Number(url.searchParams.get("id"))

    const role = roles.find((role) => role.id === id)
    if (role) {
      return HttpResponse.json({
        code: 0,
        msg: "success",
        data: role,
      })
    } else {
      return HttpResponse.json({
        code: 404,
        msg: "角色不存在",
        data: null,
      })
    }
  }),

  // 创建角色
  http.post("/api/v1/sys/role/create", async ({ request }) => {
    const roleData = (await request.json()) as {
      name: string
      sort: number
      status: boolean
      remark: string
      menus: Array<{ id: number; pid: number; name: string; remark: string }>
    }

    return HttpResponse.json({
      code: 0,
      msg: "创建成功",
      data: {
        ...roleData,
        id: Date.now(),
      },
    })
  }),

  // 更新角色
  http.put("/api/v1/sys/role/update", async ({ request }) => {
    const roleData = (await request.json()) as {
      id: number
      name: string
      sort: number
      status: boolean
      remark: string
      menus: Array<{ id: number; pid: number; name: string; remark: string }>
    }

    return HttpResponse.json({
      code: 0,
      msg: "更新成功",
      data: roleData,
    })
  }),

  // 删除角色
  http.delete("/api/v1/sys/role/delete", ({ request }) => {
    const url = new URL(request.url)
    const id = Number(url.searchParams.get("id"))

    const role = roles.find((r) => r.id === id)
    return HttpResponse.json({
      code: 0,
      msg: "删除成功",
      data: role || { id, name: "", sort: 0, status: false, remark: "" },
    })
  }),
]

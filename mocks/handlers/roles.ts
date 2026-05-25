import { http, HttpResponse } from "msw"
import { roles } from "@/mocks/handlers/data"

export const roleHandlers = [
  http.get("/api/v1/sys/roles", ({ request }) => {
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
      },
    })
  }),

  http.get("/api/v1/sys/roles/all", () => {
    return HttpResponse.json({
      code: 0,
      msg: "success",
      data: roles,
    })
  }),

  http.post("/api/v1/sys/roles/:id/menus", async ({ request, params }) => {
    const roleId = Number(params.id)
    const body = await request.json()
    const { menu_ids } = body as { menu_ids: number[] }

    const role = roles.find((r) => r.id === roleId)
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
      return HttpResponse.json(
        {
          code: 404,
          msg: "角色不存在",
          data: null,
        },
        { status: 404 }
      )
    }
  }),

  http.get("/api/v1/sys/roles/:id", ({ params }) => {
    const id = Number(params.id)
    const role = roles.find((role) => role.id === id)

    if (role) {
      return HttpResponse.json({
        code: 0,
        msg: "success",
        data: role,
      })
    } else {
      return HttpResponse.json(
        {
          code: 404,
          msg: "角色不存在",
          data: null,
        },
        { status: 404 }
      )
    }
  }),

  http.post("/api/v1/sys/roles", async ({ request }) => {
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

  http.put("/api/v1/sys/roles/:id", async ({ request, params }) => {
    const id = Number(params.id)
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
      data: {
        ...roleData,
        id,
      },
    })
  }),

  http.delete("/api/v1/sys/roles/:id", ({ params }) => {
    const id = Number(params.id)
    const role = roles.find((r) => r.id === id)

    return HttpResponse.json({
      code: 0,
      msg: "删除成功",
      data: role || { id, name: "", sort: 0, status: false, remark: "" },
    })
  }),
]

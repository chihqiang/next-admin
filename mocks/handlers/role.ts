import { http, HttpResponse } from "msw"
import { Role } from "@/api/roles"
import { roles, permissions, menus } from "@/mocks/handlers/data"

export const roleHandlers = [
  // 获取角色列表
  http.get("/api/v1/sys/role/list", ({ request }) => {
    const url = new URL(request.url)
    // 获取分页参数
    const page = url.searchParams.get("page") || "1"
    const size = url.searchParams.get("size") || "10"
    const id = url.searchParams.get("id")
    // 模拟角色数据
    const mockData = roles
    // 过滤数据
    let filteredRoles = mockData
    if (id) {
      filteredRoles = mockData.filter((role) => role.id === Number(id))
    }
    // 分页处理
    const startIndex = (Number(page) - 1) * Number(size)
    const endIndex = startIndex + Number(size)
    const paginatedRoles = filteredRoles.slice(startIndex, endIndex)

    // 返回格式和接口完全一致
    return HttpResponse.json({
      code: 0,
      msg: "success",
      data: {
        total: filteredRoles.length,
        list: paginatedRoles,
        page: Number(page),
        size: Number(size),
      },
    })
  }),
  // 获取角色列表
  http.get("/api/v1/sys/role/all", ({ request }) => {
    // 返回格式和接口完全一致
    return HttpResponse.json({
      code: 0,
      msg: "success",
      data: roles.map((item) => ({
        id: item.id,
        name: item.name,
        sort: item.sort,
        status: item.status,
        remark: item.remark,
      })),
    })
  }),
  // 授权角色菜单
  http.post(
    "/api/v1/sys/role/associate-menus/:id",
    async ({ params, request }) => {
      const id = Number(params.id)
      const { menu_ids } = (await request.json()) as { menu_ids: number[] }
      // 返回格式和接口完全一致
      return HttpResponse.json({
        code: 0,
        msg: "success",
        data: {
          id: id,
          menus: permissions.filter((p) => menu_ids.includes(p.id)),
        },
      })
    }
  ),
  // 获取角色详情
  http.get("/api/v1/sys/role/detail/:id", ({ params }) => {
    const id = Number(params.id)
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
    const roleData = (await request.json()) as Role

    // 模拟创建角色，返回创建的角色信息
    return HttpResponse.json({
      code: 0,
      msg: "创建成功",
      data: {
        ...roleData,
        id: Date.now(), // 模拟生成ID
      },
    })
  }),

  // 更新角色
  http.put("/api/v1/sys/role/update/:id", async ({ request, params }) => {
    const roleData = (await request.json()) as Role

    // 模拟更新角色，返回更新后的角色信息
    return HttpResponse.json({
      code: 0,
      msg: "更新成功",
      data: roleData,
    })
  }),

  // 删除角色
  http.delete("/api/v1/sys/role/delete/:id", ({ params }) => {
    const id = Number(params.id)

    // 模拟删除角色，返回删除的角色信息
    return HttpResponse.json({
      code: 0,
      msg: "删除成功",
      data: {
        id: id,
        name: `角色_${id}`,
        sort: 0,
        status: true,
        remark: "",
        menus: [],
      },
    })
  }),

  // 获取所有菜单
  http.get("/api/v1/sys/menu/all", async ({ request }) => {
    // 模拟获取所有菜单，返回菜单列表
    return HttpResponse.json({
      code: 0,
      msg: "success",
      data: menus,
    })
  }),
]

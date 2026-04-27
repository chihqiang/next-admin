import { http, HttpResponse } from "msw"
import { Menu } from "@/api/menu"
import { menus } from "@/mocks/handlers/data"

export const menuHandlers = [
  // 获取菜单列表
  http.get("/api/v1/sys/menu/list", ({ request }) => {
    const url = new URL(request.url)
    // 获取分页参数
    const page = url.searchParams.get("page") || "1"
    const size = url.searchParams.get("size") || "10"
    const id = url.searchParams.get("id")
    // 模拟菜单数据
    const mockMenus = menus
    // 过滤数据
    let filteredMenus = mockMenus
    if (id) {
      filteredMenus = mockMenus.filter((menu) => menu.id === Number(id))
    }
    // 分页处理
    const startIndex = (Number(page) - 1) * Number(size)
    const endIndex = startIndex + Number(size)
    const paginatedMenus = filteredMenus.slice(startIndex, endIndex)
    // 返回格式和接口完全一致
    return HttpResponse.json({
      code: 0,
      msg: "success",
      data: {
        total: filteredMenus.length,
        list: paginatedMenus,
        page: Number(page),
        size: Number(size),
      },
    })
  }),

  // 获取菜单详情
  http.get("/api/v1/sys/menu/detail/:id", ({ params }) => {
    const id = Number(params.id)
    const menu = menus.find((menu) => menu.id === id)
    if (menu) {
      return HttpResponse.json({
        code: 0,
        msg: "success",
        data: menu,
      })
    } else {
      return HttpResponse.json({
        code: 404,
        msg: "菜单不存在",
        data: null,
      })
    }
  }),

  // 创建菜单
  http.post("/api/v1/sys/menu/create", async ({ request }) => {
    const menuData = (await request.json()) as Menu

    // 模拟创建菜单，返回创建的菜单信息
    return HttpResponse.json({
      code: 0,
      msg: "创建成功",
      data: {
        ...menuData,
        id: Date.now(), // 模拟生成ID
      },
    })
  }),

  // 更新菜单
  http.put("/api/v1/sys/menu/update/:id", async ({ request, params }) => {
    const menuData = (await request.json()) as Menu

    // 模拟更新菜单，返回更新后的菜单信息
    return HttpResponse.json({
      code: 0,
      msg: "更新成功",
      data: menuData,
    })
  }),

  // 删除菜单
  http.delete("/api/v1/sys/menu/delete/:id", ({ params }) => {
    const id = Number(params.id)

    // 模拟删除菜单，返回删除的菜单信息
    return HttpResponse.json({
      code: 0,
      msg: "删除成功",
      data: {
        id: id,
        name: `菜单_${id}`,
        pid: 0,
        menu_type: 1,
        path: "",
        component: "",
        icon: "",
        sort: 1,
        api_url: "",
        api_method: "",
        visible: true,
        status: true,
        remark: "",
      },
    })
  }),
]

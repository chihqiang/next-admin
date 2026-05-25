import { http, HttpResponse } from "msw"
import { Menu } from "@/api/menu"
import { menus } from "@/mocks/handlers/data"

export const menuHandlers = [
  http.get("/api/v1/sys/menus", ({ request }) => {
    const url = new URL(request.url)
    const page = url.searchParams.get("page") || "1"
    const size = url.searchParams.get("size") || "10"
    const id = url.searchParams.get("id")

    let filteredMenus = menus
    if (id) {
      filteredMenus = menus.filter((menu) => menu.id === Number(id))
    }

    const startIndex = (Number(page) - 1) * Number(size)
    const endIndex = startIndex + Number(size)
    const paginatedMenus = filteredMenus.slice(startIndex, endIndex)

    return HttpResponse.json({
      code: 0,
      msg: "success",
      data: {
        total: filteredMenus.length,
        data: paginatedMenus,
      },
    })
  }),

  http.get("/api/v1/sys/menus/:id", ({ params }) => {
    const id = Number(params.id)
    const menu = menus.find((menu) => menu.id === id)

    if (menu) {
      return HttpResponse.json({
        code: 0,
        msg: "success",
        data: menu,
      })
    } else {
      return HttpResponse.json(
        {
          code: 404,
          msg: "菜单不存在",
          data: null,
        },
        { status: 404 }
      )
    }
  }),

  http.post("/api/v1/sys/menus", async ({ request }) => {
    const menuData = (await request.json()) as Menu

    return HttpResponse.json({
      code: 0,
      msg: "创建成功",
      data: {
        ...menuData,
        id: Date.now(),
      },
    })
  }),

  http.put("/api/v1/sys/menus/:id", async ({ request, params }) => {
    const id = Number(params.id)
    const menuData = (await request.json()) as Menu

    return HttpResponse.json({
      code: 0,
      msg: "更新成功",
      data: {
        ...menuData,
        id,
      },
    })
  }),

  http.delete("/api/v1/sys/menus/:id", ({ params }) => {
    const id = Number(params.id)

    return HttpResponse.json({
      code: 0,
      msg: "删除成功",
      data: {
        id,
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

  http.get("/api/v1/sys/menus/all", () => {
    return HttpResponse.json({
      code: 0,
      msg: "success",
      data: menus,
    })
  }),
]

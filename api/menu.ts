import request from "@/lib/request"
import { PageRequest, PageResponse } from "@/lib/types/page"

// 菜单类型映射
export const menuTypeMap: Record<number, string> = {
  1: "目录",
  2: "菜单",
  3: "按钮",
}
// 请求方式映射
export const apiMethodMap: Record<string, string> = {
  "": "无",
  GET: "GET",
  POST: "POST",
  PUT: "PUT",
  DELETE: "DELETE",
  "*": "不限",
}
// 菜单信息
export interface Menu {
  /** 菜单ID */
  id: number
  /** 父菜单ID */
  pid: number
  /** 菜单类型 1-目录 2-菜单 3-按钮 */
  menu_type: number
  /** 菜单名称 */
  name: string
  /** 前端路由地址 */
  path: string
  /** 前端组件路径 */
  component: string
  /** 菜单图标 */
  icon: string
  /** 显示顺序 */
  sort: number
  /** 接口地址 */
  api_url: string
  /** 请求方式 GET/POST/PUT/DELETE，* 代表不限 */
  api_method: string
  /** 是否显示 true-显示 false-隐藏 */
  visible: boolean
  /** 状态 true-正常 false-禁用 */
  status: boolean
  /** 备注 */
  remark: string
}
// 菜单列表请求
export interface MenuListRequest extends PageRequest {
  id?: number
}
// 菜单列表响应
export interface MenuListResponse extends PageResponse<Menu> {}

// 获取菜单列表
export async function menuListApi(
  data: MenuListRequest
): Promise<MenuListResponse> {
  return await request.get<MenuListResponse>("/api/v1/sys/menu/list", {
    params: data,
  })
}
// 获取菜单详情
export async function menuDetailApi(id: number): Promise<Menu> {
  return await request.get<Menu>(`/api/v1/sys/menu/detail/${id}`)
}
// 创建菜单
export async function menuCreateApi(data: Menu): Promise<Menu> {
  return await request.post<Menu>("/api/v1/sys/menu/create", data)
}
// 更新菜单
export async function menuUpdateApi(data: Menu): Promise<Menu> {
  return await request.put<Menu>(`/api/v1/sys/menu/update/${data.id}`, data)
}
// 删除菜单
export async function menuDeleteApi(id: number): Promise<Menu> {
  return await request.delete<Menu>(`/api/v1/sys/menu/delete/${id}`)
}

// 获取所有菜单
export async function menuAllApi(): Promise<Menu[]> {
  return await request.get<Menu[]>("/api/v1/sys/menu/all")
}

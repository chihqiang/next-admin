import request from "@/lib/request"
import { PageRequest, PageResponse } from "@/lib/types/page"

// 角色信息
export interface Role {
  /** 主键ID */
  id: number
  /** 角色名称 */
  name: string
  /** 显示顺序 */
  sort: number
  /** 状态 true-正常 false-禁用 */
  status: boolean
  /** 备注 */
  remark: string
}

// 角色树列表响应
export interface RoleFromRequest extends Role {
  /** 权限列表 */
  menus: Menu[]
}
// 菜单信息
export interface Menu {
  /** 菜单ID */
  id: number
  /** 父菜单ID */
  pid: number
  /** 菜单名称 */
  name: string
  /** 菜单备注 */
  remark: string
}
// 角色列表请求
export interface RoleListRequest extends PageRequest {
  id?: number
}
// 角色列表响应
export interface RoleListResponse extends PageResponse<Role> {}

// 获取角色列表
export async function roleListApi(
  data: RoleListRequest
): Promise<RoleListResponse> {
  return await request.get<RoleListResponse>("/api/v1/sys/role/list", {
    params: data,
  })
}

export async function roleAllListApi(): Promise<Role[]> {
  return await request.get<Role[]>("/api/v1/sys/role/all")
}

// 授权角色菜单
export async function roleAssociateMenusApi(
  roleId: number,
  menuIds: number[]
): Promise<RoleFromRequest> {
  return await request.post<RoleFromRequest>(
    `/api/v1/sys/role/associate-menus/${roleId}`,
    { menu_ids: menuIds }
  )
}

// 获取角色详情
export async function roleDetailApi(id: number): Promise<RoleFromRequest> {
  return await request.get<RoleFromRequest>(`/api/v1/sys/role/detail/${id}`)
}

// 创建角色
export async function roleCreateApi(data: RoleFromRequest): Promise<Role> {
  return await request.post<Role>("/api/v1/sys/role/create", data)
}

// 更新角色
export async function roleUpdateApi(data: RoleFromRequest): Promise<Role> {
  return await request.put<Role>(`/api/v1/sys/role/update/${data.id}`, data)
}

// 删除角色
export async function roleDeleteApi(id: number): Promise<Role> {
  return await request.delete<Role>(`/api/v1/sys/role/delete/${id}`)
}

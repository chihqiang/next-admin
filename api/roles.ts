import request from "@/lib/request"
import { PageRequest, PageResponse } from "@/lib/types/page"

export interface Role {
  id: number
  name: string
  sort: number
  status: boolean
  remark: string
}

export interface RoleFromRequest extends Role {
  menus: Menu[]
}

export interface Menu {
  id: number
  pid: number
  name: string
  remark: string
}

export interface RoleListRequest extends PageRequest {
  id?: number
}

export interface RoleListResponse extends PageResponse<Role> {}

export async function roleListApi(
  data: RoleListRequest
): Promise<RoleListResponse> {
  return await request.get<RoleListResponse>("/api/v1/sys/roles", {
    params: data,
  })
}

export async function roleAllListApi(): Promise<Role[]> {
  return await request.get<Role[]>("/api/v1/sys/roles/all")
}

export async function roleAssociateMenusApi(
  roleId: number,
  menuIds: number[]
): Promise<RoleFromRequest> {
  return await request.post<RoleFromRequest>(
    `/api/v1/sys/roles/${roleId}/menus`,
    { menu_ids: menuIds }
  )
}

export async function roleDetailApi(id: number): Promise<RoleFromRequest> {
  return await request.get<RoleFromRequest>(`/api/v1/sys/roles/${id}`)
}

export async function roleCreateApi(data: RoleFromRequest): Promise<Role> {
  return await request.post<Role>("/api/v1/sys/roles", data)
}

export async function roleUpdateApi(data: RoleFromRequest): Promise<Role> {
  return await request.put<Role>(`/api/v1/sys/roles/${data.id}`, data)
}

export async function roleDeleteApi(id: number): Promise<Role> {
  return await request.delete<Role>(`/api/v1/sys/roles/${id}`)
}

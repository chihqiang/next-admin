import { AuthAccount } from "@/lib/account"
import request, { sequentialApiCalls } from "@/lib/request"
import { AuthToken, setToken } from "@/lib/token"
import { PageRequest, PageResponse } from "@/lib/types/page"

// 登录请求
export interface LoginRequest {
  email: string
  password: string
  remember: boolean
}
// 账号角色
export interface AccountRole {
  id: number
  name: string
}

// 账号信息
export interface Account {
  id: number
  name: string
  email: string
  roles: AccountRole[]
  status: boolean
}

// 创建和更新账号请求
export interface AccountCreateUpdate extends Account {
  password?: string
}

// 账号列表请求
export interface AccountListRequest extends PageRequest {
  id?: number
}

// 账号列表响应
export interface AccountListResponse extends PageResponse<Account> {}

// 登录
export async function loginApi(data: LoginRequest): Promise<AuthToken> {
  return await request.post<AuthToken>("/api/v1/auth/login", data)
}

// 获取当前登录用户信息
export async function userProfileApi(): Promise<AuthAccount> {
  return await request.get<AuthAccount>("/api/v1/auth/user/profile")
}

// 获取账号列表
export async function accountListApi(
  data: AccountListRequest
): Promise<AccountListResponse> {
  return await request.get<AccountListResponse>("/api/v1/sys/account/list", {
    params: data,
  })
}

// 获取账号详情
export async function accountDetailApi(id: number): Promise<Account> {
  return await request.get<Account>(`/api/v1/sys/account/detail/${id}`)
}

// 创建账号
export async function accountCreateApi(
  data: AccountCreateUpdate
): Promise<Account> {
  return await request.post<Account>("/api/v1/sys/account/create", data)
}

// 更新账号
export async function accountUpdateApi(
  data: AccountCreateUpdate
): Promise<Account> {
  return await request.put<Account>(
    `/api/v1/sys/account/update/${data.id}`,
    data
  )
}

// 删除账号
export async function accountDeleteApi(id: number): Promise<Account> {
  return await request.delete<Account>(`/api/v1/sys/account/delete/${id}`)
}

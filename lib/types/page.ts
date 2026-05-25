// 分页请求类型
export interface PageRequest {
  page: number
  size: number
}

// 分页响应类型，只包含列表数据和总记录数
export interface PageResponse<T> {
  data: T[]
  total: number
}

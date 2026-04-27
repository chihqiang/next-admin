"use client"

import { ReactNode } from "react"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"

// ==================== 类型定义 ====================

export interface CrudSearchFormProps {
  /** 表单内容 */
  children: ReactNode
  /** 搜索回调 */
  onSearch: (data: Record<string, string>) => void
  /** 重置回调 */
  onReset: () => void
  /** 是否加载中 */
  loading?: boolean
}

// ==================== 组件实现 ====================

/**
 * 通用搜索表单容器
 *
 * 提供搜索和重置按钮，表单字段由 children 传入
 *
 * @example
 * ```tsx
 * <CrudSearchForm onSearch={handleSearch} onReset={handleReset}>
 *   <Input name="name" placeholder="请输入姓名" />
 *   <Select name="status">...</Select>
 * </CrudSearchForm>
 * ```
 */
export function CrudSearchForm(props: CrudSearchFormProps) {
  const { children, onSearch, onReset, loading = false } = props

  const handleSubmit = (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const formData = new FormData(form)
    const data: Record<string, string> = {}
    formData.forEach((value, key) => {
      data[key] = String(value)
    })
    onSearch(data)
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-4">
      {children}
      <div className="flex gap-2">
        <Button type="submit" disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          搜索
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={onReset}
          disabled={loading}
        >
          重置
        </Button>
      </div>
    </form>
  )
}

"use client"

import { ReactNode } from "react"
import { Button } from "@/components/ui/button"
import { Plus, Trash2, Download } from "lucide-react"

export interface CrudPageActionsProps<T = any> {
  /** 实体名称（用于新增按钮） */
  entityName?: string
  /** 选中的行数据 */
  selectedRows?: T[]
  /** 新增回调（如果不提供，则不显示新增按钮） */
  onAdd?: () => void
  /** 批量删除回调 */
  onBatchDelete?: (selectedRows: T[]) => void
  /** 批量导出回调 */
  onBatchExport?: (selectedRows: T[]) => void
  /** 自定义批量操作（可选，会显示在批量操作按钮后面） */
  customBatchActions?: ReactNode
  /** 自定义操作区域（替换默认的新增按钮） */
  actions?: ReactNode | ((selectedRows: T[]) => ReactNode)
}

/**
 * CRUD 页面操作栏组件
 *
 * 包含：批量操作按钮、新增按钮（或自定义操作）
 * 所有按钮从左到右依次排列
 * 如果没有选中任何行，批量操作按钮不显示
 *
 * @example 简单用法（只显示新增按钮）
 * <CrudPageActions entityName="账号" onAdd={openAdd} />
 *
 * @example 支持批量操作
 * <CrudPageActions
 *   entityName="账号"
 *   selectedRows={selectedRows}
 *   onAdd={openAdd}
 *   onBatchDelete={handleBatchDelete}
 * />
 */
export function CrudPageActions<T = any>({
  entityName,
  selectedRows = [],
  onAdd,
  onBatchDelete,
  onBatchExport,
  customBatchActions,
  actions,
}: CrudPageActionsProps<T>) {
  const hasSelection = selectedRows.length > 0

  // 渲染操作按钮区域
  const renderActions = () => {
    if (typeof actions === "function") {
      return actions(selectedRows)
    }
    if (actions) {
      return actions
    }
    // 默认显示新增按钮
    if (onAdd && entityName) {
      return (
        <Button onClick={onAdd}>
          <Plus className="mr-2 h-4 w-4" />
          新增{entityName}
        </Button>
      )
    }
    return null
  }

  return (
    <div className="mb-4 flex items-center gap-2">
      {renderActions()}

      {customBatchActions}

      {/* 批量操作按钮（始终显示） */}
      {onBatchDelete && (
        <Button
          variant="destructive"
          size="sm"
          onClick={() => onBatchDelete(selectedRows)}
          disabled={!hasSelection}
        >
          <Trash2 className="mr-2 h-4 w-4" />
          批量删除
        </Button>
      )}

      {onBatchExport && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => onBatchExport(selectedRows)}
          disabled={!hasSelection}
        >
          <Download className="mr-2 h-4 w-4" />
          批量导出
        </Button>
      )}
    </div>
  )
}

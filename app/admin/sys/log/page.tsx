"use client"

import { logListApi, Log } from "@/api/log"
import { CrudTable, SearchField } from "@/components/widgets/crud-table"
import { DataListColumn } from "@/components/widgets/data-list"

const searchFields: SearchField[] = [
  {
    name: "request_path",
    label: "请求路径",
    type: "input",
    placeholder: "请求路径",
  },
  {
    name: "request_ip",
    label: "请求IP",
    type: "input",
    placeholder: "请求IP",
  },
  {
    name: "request_method",
    label: "请求方法",
    type: "select",
    options: [
      { value: "GET", label: "GET" },
      { value: "POST", label: "POST" },
      { value: "PUT", label: "PUT" },
      { value: "DELETE", label: "DELETE" },
    ],
  },
]

export default function LogPage() {
  // 请求方法颜色映射
  const methodColor = (method: string) => {
    const colorMap: Record<string, string> = {
      GET: "text-green-600 bg-green-50",
      POST: "text-blue-600 bg-blue-50",
      PUT: "text-orange-600 bg-orange-50",
      DELETE: "text-red-600 bg-red-50",
    }
    return colorMap[method] || "text-gray-600 bg-gray-50"
  }

  const columns: DataListColumn<Log>[] = [
    {
      key: "id",
      header: "ID",
      cellClassName: "w-16 font-medium",
      cell: (row) => row.id,
    },
    {
      key: "account_name",
      header: "账号",
      cell: (row) => row.account_name || "-",
    },
    {
      key: "request_method",
      header: "方法",
      cell: (row) => (
        <span
          className={`inline-flex items-center rounded px-2 py-0.5 text-xs font-medium ${methodColor(
            row.request_method
          )}`}
        >
          {row.request_method}
        </span>
      ),
    },
    {
      key: "request_path",
      header: "请求路径",
      cell: (row) => row.request_path || "-",
    },
    {
      key: "request_ip",
      header: "IP地址",
      cell: (row) => row.request_ip || "-",
    },
    {
      key: "response_code",
      header: "状态码",
      cell: (row) => (
        <span
          className={
            row.response_code >= 200 && row.response_code < 300
              ? "text-green-600"
              : "text-red-600"
          }
        >
          {row.response_code}
        </span>
      ),
    },
    {
      key: "process_time",
      header: "耗时",
      cell: (row) => row.process_time || "-",
    },
    {
      key: "description",
      header: "描述",
      cell: (row) => row.description || "-",
    },
  ]

  return (
    <CrudTable<Log>
      title="日志管理"
      entityName="日志"
      columns={columns}
      listApi={logListApi}
      pageSize={8}
      searchFields={searchFields}
    />
  )
}

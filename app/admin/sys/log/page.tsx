"use client"

import { useState, useCallback, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { logListApi, Log } from "@/api/log"
import { CrudPage } from "@/components/crud/crud-page"
import { CrudSearchForm } from "@/components/crud/crud-search-form"

export default function LogPage() {
  const [logs, setLogs] = useState<Log[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)

  const [request, setRequest] = useState({
    page: 1,
    size: 8,
    request_path: "",
    request_ip: "",
    request_method: "",
  })

  const fetchLogs = useCallback(async () => {
    setLoading(true)
    try {
      const resp = await logListApi({
        page: request.page,
        size: request.size,
        request_path: request.request_path || undefined,
        request_ip: request.request_ip || undefined,
        request_method: request.request_method || undefined,
      })
      setLogs(resp.data)
      setTotal(resp.total)
    } finally {
      setLoading(false)
    }
  }, [request])

  useEffect(() => {
    fetchLogs()
  }, [fetchLogs])

  // 搜索处理
  const handleSearch = (data: Record<string, string>) => {
    setRequest({
      page: 1,
      size: request.size,
      request_path: data.request_path || "",
      request_ip: data.request_ip || "",
      request_method: data.request_method || "",
    })
  }

  // 重置处理
  const handleReset = () => {
    setRequest({
      page: 1,
      size: request.size,
      request_path: "",
      request_ip: "",
      request_method: "",
    })
  }

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

  return (
    <>
      <CrudPage<Log>
        title="日志管理"
        entityName="日志"
        searchForm={({ onSearch, onReset }) => (
          <CrudSearchForm
            onSearch={(data) => {
              handleSearch(data)
              onSearch(data)
            }}
            onReset={() => {
              handleReset()
              onReset()
            }}
          >
            <div className="flex flex-wrap gap-2">
              <Input
                name="request_path"
                placeholder="请求路径"
                className="w-40"
              />
              <Input name="request_ip" placeholder="请求IP" className="w-32" />
              <select
                name="request_method"
                className="flex h-10 w-32 items-center rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none"
              >
                <option value="">请求方法</option>
                <option value="GET">GET</option>
                <option value="POST">POST</option>
                <option value="PUT">PUT</option>
                <option value="DELETE">DELETE</option>
              </select>
            </div>
          </CrudSearchForm>
        )}
        columns={[
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
        ]}
        dataSource={logs}
        loading={loading}
        pagination={{
          current: request.page,
          pageSize: request.size,
          total,
          onChange: (page) => setRequest((prev) => ({ ...prev, page })),
        }}
      />
    </>
  )
}

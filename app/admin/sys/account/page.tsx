"use client"

import { useState, useCallback, useEffect } from "react"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import {
  Account,
  AccountCreateUpdate,
  accountListApi,
  accountCreateApi,
  accountUpdateApi,
  accountDeleteApi,
  accountDetailApi,
} from "@/api/account"
import { AccountForm } from "@/components/forms/account-form"
import { CrudPage } from "@/components/crud/crud-page"
import { CrudSearchForm } from "@/components/crud/crud-search-form"
import { CrudFormDialog } from "@/components/crud/crud-form-dialog"
import { CrudDeleteDialog } from "@/components/crud/crud-delete-dialog"
import { ConfirmDialog } from "@/components/widgets/confirm-dialog"
import { useCrud } from "@/hooks/use-crud"

export default function AccountPage() {
  const [accounts, setAccounts] = useState<Account[]>([])
  const [total, setTotal] = useState(0)
  const [showBatchDeleteConfirm, setShowBatchDeleteConfirm] = useState(false)
  const [batchDeleteIds, setBatchDeleteIds] = useState<number[]>([])

  // 实际请求参数（只有这个变化才触发请求）
  const [request, setRequest] = useState({
    page: 1,
    size: 8,
    id: undefined as number | undefined,
  })

  const {
    isEdit,
    currentItem,
    isLoading,
    isFormOpen,
    isDeleteOpen,
    openAdd,
    openEdit,
    openDelete,
    closeAll,
    handleSubmit,
    handleDelete,
  } = useCrud<Account, AccountCreateUpdate>({
    entityName: "账号",
    createApi: accountCreateApi,
    updateApi: (data) => accountUpdateApi(data),
    deleteApi: accountDeleteApi,
    onSuccess: () => fetchAccounts(),
  })

  const [formData, setFormData] = useState<AccountCreateUpdate>({
    id: 0,
    name: "",
    email: "",
    password: "",
    roles: [],
    status: true,
  })

  const fetchAccounts = useCallback(() => {
    accountListApi({
      page: request.page,
      size: request.size,
      id: request.id,
    }).then((resp) => {
      setAccounts(resp.list)
      setTotal(resp.total)
    })
  }, [request])

  useEffect(() => {
    fetchAccounts()
  }, [fetchAccounts])

  // 编辑时获取详情
  useEffect(() => {
    if (isEdit && currentItem?.id) {
      accountDetailApi(currentItem.id).then(setFormData)
    }
  }, [isEdit, currentItem])

  // 搜索处理 - 只在点击搜索按钮时触发
  const handleSearch = (data: Record<string, string>) => {
    setRequest({
      page: 1,
      size: request.size,
      id: data.id ? Number(data.id) : undefined,
    })
  }

  // 重置处理 - 只在点击重置按钮时触发
  const handleReset = () => {
    setRequest({
      page: 1,
      size: request.size,
      id: undefined,
    })
  }

  // 批量删除处理 - 打开确认对话框
  const handleBatchDelete = (selectedRows: Account[]) => {
    const ids = selectedRows.map((row) => row.id)
    setBatchDeleteIds(ids)
    setShowBatchDeleteConfirm(true)
  }

  // 确认批量删除
  const confirmBatchDelete = async () => {
    try {
      await Promise.all(batchDeleteIds.map((id) => accountDeleteApi(id)))
      setShowBatchDeleteConfirm(false)
      setBatchDeleteIds([])
      fetchAccounts()
    } catch (error) {
      console.error("批量删除失败", error)
    }
  }

  return (
    <>
      <CrudPage<Account>
        title="账号管理"
        entityName="账号"
        selectable
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
            <div className="relative flex-1">
              <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input name="id" placeholder="搜索账号ID" className="pl-10" />
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
            key: "name",
            header: "姓名",
            cell: (row) => row.name,
          },
          {
            key: "email",
            header: "邮箱",
            cell: (row) => row.email,
          },
          {
            key: "roles",
            header: "角色",
            cell: (row) => (row.roles || []).map((r) => r.name).join(", "),
          },
          {
            key: "status",
            header: "状态",
            cell: (row) => (row.status ? "活跃" : "禁用"),
          },
        ]}
        dataSource={accounts}
        loading={false}
        pagination={{
          current: request.page,
          pageSize: request.size,
          total,
          onChange: (page) => setRequest((prev) => ({ ...prev, page })),
        }}
        onAdd={openAdd}
        onEdit={openEdit}
        onDelete={openDelete}
        onBatchDelete={handleBatchDelete}
      />

      <CrudFormDialog
        open={isFormOpen}
        isEdit={!!isEdit}
        entityName="账号"
        onClose={closeAll}
        onSubmit={(data) => handleSubmit(data as AccountCreateUpdate)}
        loading={isLoading}
      >
        {({ onSubmit }) => (
          <form
            id="crud-form"
            onSubmit={(e) => {
              e.preventDefault()
              onSubmit(formData)
            }}
          >
            <AccountForm formData={formData} onChange={setFormData} />
          </form>
        )}
      </CrudFormDialog>

      <CrudDeleteDialog
        open={isDeleteOpen}
        onClose={closeAll}
        onConfirm={() => handleDelete()}
        title="删除账号"
        itemName={currentItem?.name || ""}
        loading={isLoading}
      />

      <ConfirmDialog
        open={showBatchDeleteConfirm}
        onClose={() => setShowBatchDeleteConfirm(false)}
        title="批量删除账号"
        description={`确定要删除选中的 ${batchDeleteIds.length} 个账号吗？此操作不可恢复。`}
        confirmText="删除"
        confirmButtonVariant="destructive"
        onConfirm={confirmBatchDelete}
      />
    </>
  )
}

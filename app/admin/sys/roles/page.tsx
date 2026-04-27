"use client"

import { useState, useCallback, useEffect } from "react"
import { Search, Shield, Edit, Trash2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import {
  Role,
  RoleFromRequest,
  roleListApi,
  roleCreateApi,
  roleUpdateApi,
  roleDeleteApi,
  roleDetailApi,
  roleAssociateMenusApi,
} from "@/api/roles"
import { RoleForm } from "@/components/forms/role-form"
import { RoleAuthorizeDialog } from "@/components/admin/sys/roles/authorize"
import { CrudPage } from "@/components/crud/crud-page"
import { CrudSearchForm } from "@/components/crud/crud-search-form"
import { CrudFormDialog } from "@/components/crud/crud-form-dialog"
import { CrudDeleteDialog } from "@/components/crud/crud-delete-dialog"
import { useCrud } from "@/hooks/use-crud"
import { Button } from "@/components/ui/button"

export default function RolesPage() {
  const [roles, setRoles] = useState<Role[]>([])
  const [total, setTotal] = useState(0)

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
  } = useCrud<Role, RoleFromRequest>({
    entityName: "角色",
    createApi: roleCreateApi,
    updateApi: (data) => roleUpdateApi(data),
    deleteApi: roleDeleteApi,
    onSuccess: () => fetchRoles(),
  })

  const [formData, setFormData] = useState<RoleFromRequest>({
    id: 0,
    name: "",
    sort: 0,
    status: true,
    remark: "",
    menus: [],
  })

  // 授权弹窗状态
  const [isAuthorizeOpen, setIsAuthorizeOpen] = useState(false)
  const [authorizeRole, setAuthorizeRole] = useState<Role | null>(null)

  const fetchRoles = useCallback(() => {
    roleListApi({
      page: request.page,
      size: request.size,
      id: request.id,
    }).then((resp) => {
      setRoles(resp.list)
      setTotal(resp.total)
    })
  }, [request])

  useEffect(() => {
    fetchRoles()
  }, [fetchRoles])

  useEffect(() => {
    if (isEdit && currentItem?.id) {
      roleDetailApi(currentItem.id).then(setFormData)
    }
  }, [isEdit, currentItem])

  const handleSearch = (data: Record<string, string>) => {
    setRequest({
      page: 1,
      size: request.size,
      id: data.id ? Number(data.id) : undefined,
    })
  }

  const handleReset = () => {
    setRequest({
      page: 1,
      size: request.size,
      id: undefined,
    })
  }

  // 打开授权弹窗
  const openAuthorize = (role: Role) => {
    setAuthorizeRole(role)
    setIsAuthorizeOpen(true)
  }

  // 关闭授权弹窗
  const closeAuthorize = () => {
    setIsAuthorizeOpen(false)
    setAuthorizeRole(null)
  }

  // 处理授权
  const handleAuthorize = async (roleId: number, menuIds: number[]) => {
    try {
      await roleAssociateMenusApi(roleId, menuIds)
      closeAuthorize()
      fetchRoles()
    } catch (error) {
      console.error("授权失败", error)
    }
  }

  return (
    <>
      <CrudPage<Role>
        title="角色管理"
        entityName="角色"
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
              <Input name="id" placeholder="搜索角色ID" className="pl-10" />
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
            header: "角色名称",
            cell: (row) => (
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-blue-500" />
                <span className="font-medium">{row.name}</span>
              </div>
            ),
          },
          {
            key: "sort",
            header: "排序",
            cell: (row) => row.sort,
          },
          {
            key: "remark",
            header: "备注",
            cell: (row) => row.remark || "-",
          },
          {
            key: "status",
            header: "状态",
            cell: (row) => (row.status ? "正常" : "禁用"),
          },
        ]}
        dataSource={roles}
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
        renderActions={(row) => (
          <div className="flex justify-end gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation()
                openAuthorize(row)
              }}
              title="授权"
            >
              <Shield className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation()
                openEdit(row)
              }}
              title="编辑"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-destructive"
              onClick={(e) => {
                e.stopPropagation()
                openDelete(row)
              }}
              title="删除"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        )}
      />

      <CrudFormDialog
        open={isFormOpen}
        isEdit={!!isEdit}
        entityName="角色"
        onClose={closeAll}
        onSubmit={(data) => handleSubmit(data as RoleFromRequest)}
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
            <RoleForm formData={formData} onChange={setFormData} />
          </form>
        )}
      </CrudFormDialog>

      <CrudDeleteDialog
        open={isDeleteOpen}
        onClose={closeAll}
        onConfirm={() => handleDelete()}
        title="删除角色"
        itemName={currentItem?.name || ""}
        loading={isLoading}
      />

      {/* 授权弹窗 */}
      <RoleAuthorizeDialog
        open={isAuthorizeOpen}
        onOpenChange={closeAuthorize}
        role={authorizeRole}
        onAuthorize={handleAuthorize}
        isLoading={isLoading}
      />
    </>
  )
}

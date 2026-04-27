"use client"

import { useState, useCallback, useEffect } from "react"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import {
  Menu,
  menuListApi,
  menuCreateApi,
  menuUpdateApi,
  menuDeleteApi,
  menuDetailApi,
} from "@/api/menu"
import { MenuForm } from "@/components/forms/menu-form"
import { CrudPage } from "@/components/crud/crud-page"
import { CrudSearchForm } from "@/components/crud/crud-search-form"
import { CrudFormDialog } from "@/components/crud/crud-form-dialog"
import { CrudDeleteDialog } from "@/components/crud/crud-delete-dialog"
import { useCrud } from "@/hooks/use-crud"

export default function MenuPage() {
  const [menus, setMenus] = useState<Menu[]>([])
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
  } = useCrud<Menu, Menu>({
    entityName: "菜单",
    createApi: menuCreateApi,
    updateApi: (data) => menuUpdateApi(data),
    deleteApi: menuDeleteApi,
    onSuccess: () => fetchMenus(),
  })

  const [formData, setFormData] = useState<Menu>({
    id: 0,
    pid: 0,
    menu_type: 1,
    name: "",
    path: "",
    component: "",
    icon: "",
    sort: 0,
    api_url: "",
    api_method: "",
    visible: true,
    status: true,
    remark: "",
  })

  const fetchMenus = useCallback(() => {
    menuListApi({
      page: request.page,
      size: request.size,
      id: request.id,
    }).then((resp) => {
      setMenus(resp.list)
      setTotal(resp.total)
    })
  }, [request])

  useEffect(() => {
    fetchMenus()
  }, [fetchMenus])

  useEffect(() => {
    if (isEdit && currentItem?.id) {
      menuDetailApi(currentItem.id).then(setFormData)
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

  return (
    <>
      <CrudPage<Menu>
        title="菜单管理"
        entityName="菜单"
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
              <Input name="id" placeholder="搜索菜单ID" className="pl-10" />
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
            header: "菜单名称",
            cell: (row) => row.name,
          },
          {
            key: "menu_type",
            header: "类型",
            cell: (row) => {
              const typeMap: Record<number, string> = {
                1: "目录",
                2: "菜单",
                3: "按钮",
              }
              return typeMap[row.menu_type] || "未知"
            },
          },
          {
            key: "path",
            header: "路由",
            cell: (row) => row.path || "-",
          },
          {
            key: "api_url",
            header: "接口地址",
            cell: (row) => row.api_url || "-",
          },
          {
            key: "visible",
            header: "显示",
            cell: (row) => (row.visible ? "显示" : "隐藏"),
          },
          {
            key: "status",
            header: "状态",
            cell: (row) => (row.status ? "正常" : "禁用"),
          },
        ]}
        dataSource={menus}
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
      />

      <CrudFormDialog
        open={isFormOpen}
        isEdit={!!isEdit}
        entityName="菜单"
        onClose={closeAll}
        onSubmit={(data) => handleSubmit(data as Menu)}
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
            <MenuForm formData={formData} onChange={setFormData} />
          </form>
        )}
      </CrudFormDialog>

      <CrudDeleteDialog
        open={isDeleteOpen}
        onClose={closeAll}
        onConfirm={() => handleDelete()}
        title="删除菜单"
        itemName={currentItem?.name || ""}
        loading={isLoading}
      />
    </>
  )
}

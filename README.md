# Next.js Admin

基于 Next.js 14+ 和 shadcn/ui 构建的现代化管理后台系统，开箱即用，适合快速启动中后台项目。

## 技术栈

| 分类 | 技术 |
|------|------|
| 框架 | Next.js 16 (App Router + Turbopack) |
| 语言 | TypeScript 5 |
| UI 组件 | shadcn/ui + Tailwind CSS 4 |
| 表单 | React Hook Form + TanStack Form + Zod |
| 图表 | Recharts |
| HTTP | Axios |
| Mock | MSW (Mock Service Worker) |
| 图标 | Lucide React |
| 主题 | next-themes (支持明暗切换) |

## 功能特性

### 认证与权限
- [x] 登录页面（含 Token 管理）
- [x] 路由守卫
- [x] 动态菜单生成
- [x] RBAC 权限模型（账号、角色、菜单）

### 页面模块
- [x] **控制台** - 统计卡片、最近活动
- [x] **账号管理** - 增删改查、搜索、分页、批量操作
- [x] **角色管理** - 增删改查、权限配置
- [x] **菜单管理** - 树形结构菜单配置
- [x] **日志管理** - 操作日志查询

## 项目结构

```
├── app/                      # Next.js App Router 页面
│   ├── admin/               # 管理后台页面
│   │   ├── dashboard/       # 控制台
│   │   └── sys/            # 系统管理（账号/角色/菜单/日志）
│   └── login/              # 登录页
├── components/              # 组件目录
│   ├── admin/              # 业务页面组件
│   ├── crud/               # CRUD 通用组件
│   ├── forms/              # 业务表单组件
│   ├── layout/             # 布局组件（侧边栏、顶栏、路由守卫）
│   ├── login/              # 登录相关组件
│   ├── providers/          # React Context providers
│   ├── ui/                 # shadcn/ui 组件库
│   └── widgets/            # 通用小部件
├── api/                     # API 接口定义
├── lib/                     # 工具库
│   ├── request.ts          # Axios 封装
│   ├── token.ts            # Token 管理
│   ├── nav.ts              # 导航菜单配置
│   └── utils.ts            # 通用工具函数
├── hooks/                   # React Hooks
├── mocks/                    # MSW Mock 数据
└── public/                  # 静态资源
```

## 快速开始

### 环境要求
- Node.js 20+
- pnpm 8+

### 安装依赖

```bash
pnpm install
```

### 启动开发服务器

```bash
pnpm dev
```

访问 http://localhost:3000/login

- 用户名: `admin@example.com`
- 密码: `123456`

### 其他命令

```bash
pnpm build      # 生产构建
pnpm start      # 启动生产服务器
pnpm lint       # ESLint 检查
pnpm format     # 代码格式化
pnpm typecheck  # TypeScript 类型检查
pnpm check      # 运行所有检查（format + lint + typecheck）
```

## 开发指南

### 添加新页面

1. 在 `app/admin/` 下创建新页面目录
2. 使用 `CrudPage` 组件快速构建 CRUD 页面
3. 在 `lib/nav.ts` 中注册菜单

### 组件开发

使用 shadcn/ui 提供的组件：

```bash
pnpm shadcn add [component-name]
```
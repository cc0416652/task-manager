# 智能任务管理系统

一个基于 **Node.js + Express + Supabase** 的智能任务管理系统。中文界面，支持添加任务、优先级筛选、完成/未完成切换、删除，任务按创建时间倒序展示，已完成任务自动加删除线。

## 功能特性

- 输入框 + 优先级下拉（高 / 中 / 低）添加任务
- 任务列表展示：标题、优先级标签、完成状态、创建时间
- 每条任务带「完成 / 未完成」切换按钮和「删除」按钮
- 按优先级筛选：全部 / 高 / 中 / 低
- 任务按创建时间倒序显示（最新创建的排最上面）
- 已完成的任务标题自动加删除线
- 数据持久化存储到 Supabase（PostgreSQL）数据库

## 技术栈

| 层级 | 技术 |
| ---- | ---- |
| 后端 | Node.js + Express |
| 数据库 | Supabase（PostgreSQL） |
| 前端 | 原生 HTML + CSS + JavaScript（无框架） |

## 目录结构

```
task-manager/
├── package.json          # 项目依赖与启动脚本
├── server.js             # Express 服务 + Supabase API 路由
├── .env.example          # 环境变量模板（复制为 .env 后填写）
├── .gitignore            # Git 忽略规则
├── sql/
│   └── schema.sql        # Supabase 建表 SQL（在控制台执行）
├── public/               # 前端静态文件
│   ├── index.html        # 页面结构
│   ├── style.css         # 样式
│   └── app.js            # 前端交互逻辑
└── README.md
```

## 快速开始（5 步）

### 第 1 步：创建 Supabase 项目

1. 打开 [supabase.com](https://supabase.com) 并登录（没有账号先注册）
2. 点击 **New project**，填写项目名称，选择区域和数据库密码，创建项目
3. 等待项目创建完成（约 1 分钟）

### 第 2 步：建表

1. 进入 Supabase 控制台，左侧菜单选择 **SQL Editor**
2. 点击 **New query**，将 `sql/schema.sql` 里的内容全部粘贴进去
3. 点击 **Run** 执行，看到 `Success` 即建表成功

### 第 3 步：配置环境变量

1. 左侧菜单进入 **Project Settings -> API**
2. 复制 **Project URL** 和 **Publishable key**（如 `sb_publishable_...`）
3. 在项目目录下执行：

```bash
cp .env.example .env
```

4. 编辑 `.env`，填入复制的两个值：

```bash
NEXT_PUBLIC_SUPABASE_URL=https://你的项目地址.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=你的publishable密钥
PORT=3000
```

### 第 4 步：安装依赖并启动

```bash
npm install
npm run dev
```

看到 `智能任务管理系统已启动：http://localhost:3000` 即启动成功。

### 第 5 步：打开使用

浏览器访问 **http://localhost:3000**，开始管理你的任务吧。

## API 说明

| 方法 | 路径 | 说明 |
| ---- | ---- | ---- |
| GET | `/api/tasks` | 获取全部任务（按创建时间倒序） |
| GET | `/api/tasks?priority=高` | 按优先级筛选（高 / 中 / 低） |
| POST | `/api/tasks` | 添加任务，body：`{ "title": "标题", "priority": "高" }` |
| PATCH | `/api/tasks/:id` | 切换完成状态，body：`{ "completed": true }` |
| DELETE | `/api/tasks/:id` | 删除任务 |

## 数据表结构（tasks）

| 字段 | 类型 | 说明 |
| ---- | ---- | ---- |
| id | bigint（自增主键） | 任务 ID |
| title | text | 任务标题 |
| priority | text | 优先级：'高' / '中' / '低' |
| completed | boolean（默认 false） | 是否完成 |
| created_at | timestamptz（默认当前时间） | 创建时间 |

## 常见问题

**Q：启动时报「缺少 Supabase 配置」？**
说明没有复制 `.env.example` 为 `.env`，或 `.env` 中的值为空。检查第 3 步。

**Q：页面能打开但添加任务失败？**
多为 Supabase 的 URL 或 publishable key 填错，或 tasks 表尚未创建。按第 2、3 步核对。

**Q：如何部署到线上？**
个人学习项目推荐先本地跑通。部署可参考 Vercel / Render / Railway 的 Node.js 部署文档，将 `.env` 中的变量配置为平台环境变量即可（切勿把 `.env` 提交到 GitHub）。

## 许可证

MIT

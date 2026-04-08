# 用户后台管理系统

这是一个基于 Nuxt.js 的用户后台管理系统项目。该项目使用了多种现代化的前端技术和工具，旨在提供一个高效、可扩展的用户管理平台。

## 项目结构

- **全局页面头部**：配置在 `nuxt.config.js` 中，包含页面标题、meta 信息、favicon 和外部脚本。
- **全局 CSS**：使用 Tailwind CSS 进行样式设计，相关文件位于 `@/assets/css/tailwind.css`。
- **插件**：在页面渲染之前运行的插件，配置在 `@/plugins/primevue.js`。
- **自动导入组件**：启用自动导入组件功能。
- **模块**：集成了多个 Nuxt.js 模块，如 Tailwind CSS、Pinia、i18n 等。
- **PrimeVue**：使用 Aura 主题进行 UI 设计。
- **构建配置**：使用 Vite 进行构建，支持文件系统访问。
- **路由中间件**：使用 `auth` 中间件进行路由保护。
- **ESLint 配置**：在开发过程中禁用 ESLint 错误和警告。
- **国际化**：支持中文和英文，默认语言为中文。
- **Turnstile**：集成 Cloudflare Turnstile 进行人机验证。
- **运行时配置**：通过环境变量配置公共和私有的运行时变量。
- **开发工具**：启用开发工具和调试模式。

## 环境变量

建议先复制一份模板：

```bash
cp .env.example .env
```

项目当前实际使用到的环境变量如下：

- `MIDDLEWARE_BACKEND_URL`：全量接管模式下，自定义中间件 / BFF 的地址。若配置，则所有现有 BFF 转发都会优先走这里。
- `MIDDLEWARE_SERVICE_URL`：渐进式拆分时的外部业务中间件地址（例如 Deno 服务）。
- `MIDDLEWARE_SERVICE_SCOPES`：哪些模块优先走 `MIDDLEWARE_SERVICE_URL`，使用逗号分隔，例如 `cart,products`。当前支持：`auth`、`cart`、`dashboard`、`products`、`tickets`、`upload`、`user`。
- `MIDDLEWARE_SERVICE_HEADERS`：Nuxt 请求外部业务中间件时附带的额外请求头配置，要求是 JSON 数组。
- `MIDDLEWARE_BACKEND_HEADERS`：BFF 转发到后端时附带的额外请求头配置，要求是 JSON 数组。
- `BACKEND_URL`：默认魔方财务后端地址。代码同时兼容 `BACK_URL`、`NUXT_BACK_URL`，三选一即可。
- `NUXT_PUBLIC_BASE_URL`：当前站点对外访问地址。代码同时兼容 `BASE_URL`。
- `NUXT_PUBLIC_AGENTATION_SERVER_URL`：开发期 Agentation MCP/HTTP 服务地址，默认 `http://localhost:4747`。
- `TURNSTILE_SITE_KEY`：Cloudflare Turnstile 的站点密钥。
- `TURNSTILE_SECRET_KEY`：Cloudflare Turnstile 的私密密钥。
- `NUXT_SESSION_PASSWORD`：Nuxt 会话密钥，必须配置，建议使用 32 位以上随机字符串。

其中：

- 登录、注册、找回密码、安全中心等带 Turnstile 的流程会依赖 `TURNSTILE_SITE_KEY` 和 `TURNSTILE_SECRET_KEY`。
- `NUXT_SESSION_PASSWORD` 为空时，基于 `nuxt-auth-utils` 的会话接口会直接报错。
- 所有本地 `/api/*` 自定义中间件 / BFF 转发默认读取 `BACKEND_URL`，若配置了 `MIDDLEWARE_BACKEND_URL` 则全量以它为准。
- 若要渐进式把后端能力拆出 Nuxt，可配置 `MIDDLEWARE_SERVICE_URL` 与 `MIDDLEWARE_SERVICE_SCOPES`。当前购物车与产品相关 BFF 已接入 scope 路由能力，因此可以先让 `cart,products` 走外部业务中间件，其余接口继续直连闭源后端。
- 若配置了 `MIDDLEWARE_BACKEND_HEADERS`，所有 BFF 转发到后端的请求都会自动附带这些请求头。支持以下数组项格式：
  - `{"name":"x-header","value":"secret"}`
  - `["x-header","secret"]`
  - `"x-header:secret"`
- 若配置了 `MIDDLEWARE_SERVICE_HEADERS`，只有命中 `MIDDLEWARE_SERVICE_SCOPES` 的接口在请求外部业务中间件时会自动附带这些请求头，格式与 `MIDDLEWARE_BACKEND_HEADERS` 相同。
- 若只想本地跑静态页面，`TURNSTILE_*` 可以先留空，但相关验证流程不会正常工作。

## 安装与运行

1. 克隆项目到本地：

   ```bash
   git clone <repository-url>
   ```

2. 进入项目目录：

   ```bash
   cd nuxt-dash-synull
   ```

3. 安装依赖：

   ```bash
   pnpm install
   ```

4. 运行开发服务器：

   ```bash
   pnpm dev
   ```

5. 构建项目：

   ```bash
   pnpm build
   ```

6. 启动生产服务器：

   ```bash
   pnpm start
   ```

## Agentation 开发标注

- 项目现在会在 **开发环境** 自动挂载 Agentation 工具条，**生产构建不会注入**。
- 默认会连接 `http://localhost:4747`，也可以通过 `NUXT_PUBLIC_AGENTATION_SERVER_URL` 改成别的地址。
- 建议先检查本地 Agentation MCP 状态：

  ```bash
  pnpm agentation:doctor
  ```

- 启动 Agentation MCP 服务：

  ```bash
  pnpm agentation:mcp
  ```

- 然后再启动 Nuxt 开发服务：

  ```bash
  pnpm dev
  ```

- Copilot CLI 的 MCP 配置保存在 `~/.copilot/mcp-config.json`。服务启动后，Copilot 就可以直接读取和处理页面标注。

## 贡献

由于该项目为闭源项目，暂不接受外部贡献。

## 许可证

该项目为闭源项目，所有权利保留。

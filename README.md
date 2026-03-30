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
- **Twemoji**：配置 Twemoji 的缓存时间。
- **Turnstile**：集成 Cloudflare Turnstile 进行人机验证。
- **运行时配置**：通过环境变量配置公共和私有的运行时变量。
- **开发工具**：启用开发工具和调试模式。

## 环境变量

项目使用以下环境变量进行配置：

- `TURNSTILE_SITE_KEY`：Cloudflare Turnstile 的站点密钥。
- `TURNSTILE_SECRET_KEY`：Cloudflare Turnstile 的私密密钥。
- `BASE_URL`：项目的基础 URL，默认为 `http://localhost:3000`。
- `NUXT_SESSION_PASSWORD`：Nuxt 会话的密码，默认会自动生成。


## 安装与运行

1. 克隆项目到本地：

   ```bash
   git clone <repository-url>
   ```

2. 进入项目目录：

   ```bash
   cd nuxt-yunyoocenter
   ```

3. 安装依赖：

   ```bash
   npm install
   ```

4. 运行开发服务器：

   ```bash
   npm run dev
   ```

5. 构建项目：

   ```bash
   npm run build
   ```

6. 启动生产服务器：

   ```bash
   npm run start
   ```

## 贡献

由于该项目为闭源项目，暂不接受外部贡献。

## 许可证

该项目为闭源项目，所有权利保留。
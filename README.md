# 微信公众号 Markdown 编辑器

基于 React + TypeScript + Vite 的微信公众号文章 Markdown 编辑器。支持实时预览、工具栏快捷插入、语法高亮、适配公众号粘贴（内联样式），以及一键复制/下载 HTML。

## 本地开发

- 安装依赖：`npm install`
- 启动开发：`npm run dev`（默认端口 `5173`）
- 类型检查：`npm run typecheck`
- 构建产物：`npm run build`，输出到 `dist/`

## 部署到 GitHub Pages

项目已内置工作流：`.github/workflows/pages.yml`

### 步骤

1. 将仓库推送到 GitHub，并确保默认分支为 `main`
2. 打开仓库的 `Settings → Pages → Build and deployment`，将 `Source` 设置为 `GitHub Actions`
3. 提交到 `main` 分支触发工作流，等待 `Deploy to GitHub Pages` 两个 Job（build、deploy）成功
4. Pages 站点地址通常为：
   - 用户/组织站点：`https://<用户名>.github.io/`
   - 项目站点：`https://<用户名>.github.io/<仓库名>/`

### 资源路径问题说明

- 已在 `vite.config.ts` 设置 `base: './'`，构建后所有静态资源均以相对路径引用，适用于项目站点路径（`/<repo>/`）
- 如你的 Pages 是用户站点仓库（例如 `yourname.github.io`），同样可正常使用；若你需要固定根路径，可将 `base` 改为 `'/'`

### 404 路由与刷新

- 已在 `public/404.html` 添加回退至站点根目录的重定向（`meta refresh`），避免误访问路径导致的空白页

## 公众号适配说明

- 渲染使用内联样式，避免粘贴到公众号时样式丢失
- 复制会写入 `text/html` 富文本到剪贴板，兼容旧浏览器提供回退方案
- 代码高亮颜色在导出前会“扁平化”为内联样式，粘贴后仍保留颜色与强调

## 目录结构

- `src/App.tsx`：应用框架与交互逻辑（复制/下载、主题、布局、TOC）
- `src/components/*`：编辑器、工具栏、预览、状态栏、目录组件
- `src/utils/markdown.ts`：Markdown 渲染与内联样式规则
- `public/`：静态文件（favicon、404 回退）

## License

MIT

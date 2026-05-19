# Pace 官网部署到 Vercel（一次性指引）

> 仓库根的 `index.html` / `styles.css` / `app.js` 是 landing 静态文件。
> `vercel.json` + `.vercelignore` 已经配好。

## 部署步骤（首次）

1. 打开 https://vercel.com/new
2. 用 GitHub 账号登陆 (Upp-Ljl)
3. **Import Git Repository** → 选 `Upp-Ljl/Pace`
4. Configure Project 页：
   - **Framework Preset**: `Other`（自动识别 vercel.json 后置灰也行）
   - **Root Directory**: `./` （留空默认根，因为 index.html 在根）
   - **Build Command**: 空（vercel.json 已设 null）
   - **Output Directory**: `.`（vercel.json 已设）
   - **Install Command**: 空
5. 点 **Deploy**——首次 ~30-60s
6. 拿到 `https://pace-<hash>.vercel.app` 临时域名

## 自定义域名（可选）

Vercel project settings → Domains → Add `pace.example.com` → DNS 解 CNAME 到 `cname.vercel-dns.com`。

## 之后的更新

每次 `git push origin main` 都会自动触发 Vercel re-deploy（约 20-40s）。preview 分支也会自动建 preview URL。

## 本地预览

```bash
# 项目根
python -m http.server 8000
# 浏览器开 http://localhost:8000
```

或 `npx serve` 也行。

## 验证 checklist

- [ ] hero 第一屏完整渲染（4 个 tagline 切换 button 在顶部能点）
- [ ] 5 屏滚动顺序正确
- [ ] Source Serif 4 + Inter + JetBrains Mono 加载（不要 fallback 到系统衬线）
- [ ] 紫色 accent #6B4FE0 / 暖白 base #FAF8F5 颜色对得上
- [ ] 移动端（缩窄浏览器到 600px 宽）section padding 不爆 + 内容不溢出
- [ ] 4 个 tagline button URL hash `#tagline-a / b / c / d` 切换持久（刷新 URL 还是同一个）

## 排查

- **build 失败 "Cannot find xxx"**: vercel.json 里 `"framework": null` + buildCommand null 应该跳过所有 Node build。如果还是触发 npm install，加 `.vercelignore` 把 `package.json` 排掉
- **页面拿到 404**: 检查 index.html 是不是在 repo 根。Vercel 默认 serve `/index.html`
- **静态资源 404**: styles.css / app.js 的引用必须用 root-relative `/styles.css`（vercel.json `cleanUrls: true` 不影响）
- **字体没载到**: Google Fonts CDN URL 用 `https://`，不要 `http://`。CSP header 默认放行

## Repo 大小提示

vercel 上传时只 upload .vercelignore 允许的文件（≤200KB）。`packages/desktop-shell/node_modules` ~500MB 不会进去。

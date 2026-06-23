# 睡眠恢复年龄观察器

这是从 AI 延续学日报商机里筛出来的第一个可交付工具项目。它不再只是日报和导航，而是一个可直接给用户使用的静态网页工具：输入 7 天可穿戴设备和睡眠习惯数据，生成睡眠恢复分、恢复年龄画像、薄弱项和 7 天行动报告。

目标业务域名：`https://sleep.aivora.cn/`

## 产品定位

- 面向有 Apple Watch、Oura、Garmin、小米手环、睡眠 App 数据的普通用户。
- 只做睡眠恢复状态观察，不做医疗诊断、治疗建议或真实生物年龄检测。
- 免费工具用于引流，后续可卖 19.9 元详细 AI 报告、49 元打卡群、199 元非医疗数据复盘。

## 主要页面

- `/`：首页，直接展示睡眠恢复年龄观察器。
- `/sleep-recovery-age/`：完整工具页。
- `/opportunity/`：从 AI 延续学资讯里提炼的商机日报。
- `/project-opportunity/`：可收藏、试跑或二次开发的项目雷达。

## Aivora 项目模式

这个仓库按“GitHub 仓库为源项目，网页为展示和交互，Aivora 子域名为业务入口”的方式维护。详细流程见：

- `docs/aivora-github-project-model.md`
- `docs/project-origin.md`
- `docs/launch-checklist.md`
- `docs/paid-ai-report.md`

## AI 详细报告

前端已经预留“19.9 元 AI 详细报告”入口。实现方式是：

1. Aivora 商品卖一次性兑换码。
2. 用户在工具页输入兑换码。
3. 前端请求 `/api/sleep-report`。
4. Cloudflare Worker 校验兑换码并调用 Anthropic-compatible API。
5. AI 返回详细 Markdown 报告。

后端代码在 `worker/`。API Key 只能通过 `wrangler secret put ANTHROPIC_API_KEY` 设置到 Cloudflare Worker，不能写进前端、README、GitHub Actions 或任何提交文件。

## 本地预览

```bash
hugo server -D
```

## 构建

```bash
hugo --minify
```

## 自动更新链路

对应后端项目：`D:\GitHub\CloudFlare-BioAge-Toolkit`

后端 Cloudflare Worker 会定时抓取数据、调用 AI 生成内容，并提交到本仓库。后续更新重点应该围绕“能否增强工具、报告模板、付费交付或社群运营”，不要只追求文章数量。

## 部署

默认域名配置在 `static/CNAME`：

```text
sleep.aivora.cn
```

GitHub Pages 子域名 DNS 建议：

```text
类型：CNAME
主机记录：sleep
记录值：dongyu19920904.github.io
```

推送到 GitHub Pages 或 Cloudflare Pages 后，把 DNS 指向对应托管服务即可。

## 注意

本站只做公开信息整理、健康数据观察和非医疗工具演示，不提供医疗诊断、治疗建议、用药建议或抗衰疗效承诺。

# Aivora GitHub 小项目落地模式

## 结论

可行，而且适合用来批量做 AI 商机小工具。

推荐标准模式是：

1. GitHub 仓库是项目源头，保存代码、文档、来源、部署 workflow 和运营说明。
2. GitHub Pages 或 Cloudflare Pages 负责把仓库发布成网页。
3. Aivora 子域名负责对外传播和成交，例如 `sleep.aivora.cn`。
4. AI 延续学日报负责发现商机，Codex/CowAgent 负责把商机变成工具或页面。
5. Aivora 主站负责收款、客服、账号销售、付费报告和后续服务。

## 每个项目的推荐结构

```text
project-name/
  .github/workflows/pages.yaml
  content/
  layouts/
  static/CNAME
  docs/
    aivora-github-project-model.md
    project-origin.md
    launch-checklist.md
  README.md
  hugo.yaml
```

## GitHub 原项目怎么用

不是每个商机都适合直接 fork。推荐分三种：

1. Fork 改造型：原 GitHub 项目本身能跑，有许可证，适合加中文页面、在线 demo、教程和商业入口。
2. 仓库包装型：原项目太科研或太难跑，只把它作为资料来源，在自己的仓库里做解释器、可视化、报告工具或教程。
3. 商机工具型：没有明确原项目，但来自日报的研究/文章/趋势，可以在自己的仓库里从零做一个小工具，并在 `docs/project-origin.md` 记录来源。

## 域名规则

当前项目建议使用：

```text
sleep.aivora.cn
```

DNS 记录建议：

```text
类型：CNAME
主机记录：sleep
记录值：dongyu19920904.github.io
```

注意：GitHub Pages 的 CNAME 记录值是 `<用户名>.github.io`，不要写成带仓库名的地址。

## GitHub Pages 设置

每个仓库需要：

1. 推送代码到 GitHub。
2. 在仓库 Settings → Pages 里选择 GitHub Actions 作为发布来源。
3. 在 Custom domain 填写项目子域名，例如 `sleep.aivora.cn`。
4. DNS 生效后开启 Enforce HTTPS。
5. 保证 `static/CNAME` 或 Pages 设置里的域名和 DNS 记录一致。

## 批量做项目的命名建议

```text
sleep.aivora.cn        睡眠恢复年龄观察器
bioage.aivora.cn       生物年龄资料与工具
brainage.aivora.cn     脑龄项目解释器
hrv.aivora.cn          HRV 恢复观察工具
longevity.aivora.cn    AI 延续学工具总入口
```

## 商业闭环

每个小项目都应该有四层：

1. 免费工具：用户马上能用，有分数、报告或可视化结果。
2. 低价交付：9.9 或 19.9 的 PDF、模板、资料包、AI 解读。
3. 社群服务：49 到 99 的打卡群、资料更新群、案例复盘群。
4. 高价服务：199 到 999 的定制解读、部署、自动化、项目改造。

## 当前项目下一步

1. 在 GitHub 新建仓库，例如 `Sleep-Recovery-Age-Web`。
2. 把本地项目推上去。
3. 在 DNS 里新增 `sleep.aivora.cn` 的 CNAME。
4. 在 GitHub Pages 设置里填写 `sleep.aivora.cn`。
5. 把 Aivora 店铺里新建一个 19.9 元商品：睡眠恢复报告。
6. 商品详情页链接到 `https://sleep.aivora.cn/`。
7. 收到订单后，让用户提交报告文本或截图，再用 AI 生成详细版报告。

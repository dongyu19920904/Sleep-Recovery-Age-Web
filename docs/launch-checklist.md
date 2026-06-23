# 发布检查清单

## 仓库

- [ ] GitHub 仓库已创建
- [ ] 本地代码已推送
- [ ] 默认分支为 `main` 或 `master`
- [ ] `.github/workflows/pages.yaml` 存在
- [ ] GitHub Pages Source 已设置为 GitHub Actions

## 域名

- [ ] `static/CNAME` 写入目标域名
- [ ] GitHub Pages Custom domain 写入目标域名
- [ ] DNS 已添加 CNAME 记录
- [ ] DNS 记录值指向 `dongyu19920904.github.io`
- [ ] GitHub Pages 已开启 Enforce HTTPS

## 产品

- [ ] 首页第一屏就是工具，而不是介绍页
- [ ] 工具有默认示例值
- [ ] 工具可在手机使用
- [ ] 结果可复制或导出
- [ ] 页面有明确的非医疗声明
- [ ] 页面有低价付费入口
- [ ] README 写清楚定位、运行和部署
- [ ] `docs/project-origin.md` 记录商机来源和改造边界

## 验证

```bash
hugo --minify --logLevel warn
```

本地预览：

```bash
hugo server -D
```

检查：

- [ ] 首页返回 200
- [ ] 工具页返回 200
- [ ] 页面能生成报告
- [ ] 手机宽度不溢出
- [ ] 导航和页脚没有乱码

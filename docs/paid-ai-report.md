# 19.9 元 AI 睡眠详细报告方案

## 结论

可以接入 AI 自动生成报告，但必须用后端中转。API Key 不能放进 Hugo 页面、JavaScript、GitHub 仓库或任何浏览器可见位置。

当前推荐第一版：

```text
Aivora 商品收款 -> 自动发一个兑换码 -> 用户在工具页输入兑换码 -> Cloudflare Worker 调 Claude -> 返回详细报告
```

这样不用一开始就接复杂支付回调，也能真正收费交付。

## 为什么用兑换码

兑换码模式最适合 19.9 元小产品：

- 可以直接放进发卡系统库存。
- 不需要先打通支付 webhook。
- 一个码只生成一次报告，避免 API 被刷。
- 客服处理简单，用户付款后立即拿码。
- 后续可以升级成订单自动校验。

## 技术结构

```text
前端：GitHub Pages / sleep.aivora.cn
后端：Cloudflare Worker / sleep.aivora.cn/api/*
密钥：Cloudflare Worker Secret
兑换码：Cloudflare KV
模型：claude-opus-4-6
API URL：https://cloudcode.bdjd.cc
```

## 前端流程

1. 用户填写 7 天睡眠数据。
2. 页面生成免费简版报告。
3. 用户购买 19.9 元商品并获得兑换码。
4. 用户输入兑换码，点击“生成 AI 详细报告”。
5. 前端 POST 到 `/api/sleep-report`。
6. 页面展示详细 Markdown 报告，可复制保存。

## 后端流程

1. 检查 CORS，只允许本站和开发地址访问。
2. 检查兑换码是否存在、是否已使用。
3. 把用户数据和简版报告放入安全 prompt。
4. 调用 Anthropic Messages API 兼容接口。
5. 成功后把兑换码标记为已使用。
6. 返回详细报告。

## Prompt 原则

详细报告要卖得出去，但不能越过医疗边界：

- 用“恢复年龄画像”，不用“真实生物年龄”。
- 做趋势观察，不做诊断。
- 给低风险行动建议，不给治疗方案。
- 明确哪些情况需要看医生。
- 每条建议要和用户数据关联，不写泛泛鸡汤。

## 付费商品文案

商品名：

```text
睡眠恢复 AI 详细报告 1 次
```

商品描述：

```text
购买后获得 1 个报告兑换码。打开 sleep.aivora.cn，填写你的 7 天睡眠平均数据，输入兑换码后自动生成 1 份 AI 睡眠恢复详细报告。报告用于个人健康数据观察和习惯复盘，不提供医疗诊断或治疗建议。
```

售后说明：

```text
兑换码未使用可联系客服处理；已成功生成报告后不支持退款。若页面报错，请截图联系微信 aiwoola。
```

## 上线前待办

- [ ] 部署 `worker/` 里的 Cloudflare Worker。
- [ ] 把 `ANTHROPIC_API_KEY` 设置为 Worker Secret。
- [ ] 创建 `SLEEP_REPORT_CODES` KV namespace。
- [ ] 生成 20 到 100 个兑换码写入 KV。
- [ ] 同一批兑换码上传到 Aivora 发卡商品库存。
- [ ] 给 `sleep.aivora.cn/api/*` 绑定 Worker route。
- [ ] 用一个测试码生成报告，确认 AI 输出质量。

# Sleep Recovery Age API

Cloudflare Worker backend for the paid AI sleep report.

## Why this exists

GitHub Pages is static, so the Anthropic-compatible API key must never be placed in the frontend. The frontend sends sleep data and a paid access code to this Worker. The Worker validates the code, calls the AI API, and returns the detailed report.

## Required secrets

Do not commit API keys. Set them with Wrangler:

```bash
cd worker
wrangler secret put ANTHROPIC_API_KEY
```

Use the value from your Anthropic-compatible provider when prompted.

For quick testing without KV, you can set comma-separated access codes:

```bash
wrangler secret put REPORT_ACCESS_CODES
```

Example secret value:

```text
TEST-199-A,TEST-199-B
```

For production, use KV single-use codes instead of static codes.

## Production code flow

1. Create a KV namespace:

```bash
wrangler kv namespace create SLEEP_REPORT_CODES
```

2. Copy the namespace id into `wrangler.toml`.
3. Put paid codes into KV as JSON:

```bash
wrangler kv key put "code:SR-20260623-0001" "{\"price\":\"19.9\",\"usedAt\":null}" --binding SLEEP_REPORT_CODES
```

4. Upload the same codes into the Aivora/发卡商品库存.
5. Buyer receives one code after payment.
6. Buyer enters the code on the tool page and gets one AI detailed report.

## Local development

```bash
cd worker
wrangler dev
```

Use `REPORT_MODE = "open"` only in local or temporary test environments. Do not use open mode in production.

## Deploy

```bash
cd worker
wrangler deploy
```

Recommended route after DNS is active:

```text
sleep.aivora.cn/api/*
```

Then the frontend can call:

```text
/api/sleep-report
```

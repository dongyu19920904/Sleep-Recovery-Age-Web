const SYSTEM_PROMPT = `你是一个中文睡眠数据报告撰写助手。你的任务是把用户提供的 7 天平均睡眠数据和简版报告，改写成一份适合付费交付的详细解读。

边界要求：
1. 只做健康数据观察、科普和习惯复盘，不提供医疗诊断、治疗建议、用药建议、睡眠障碍判断或真实生物年龄检测。
2. 可以使用“恢复年龄画像”作为比喻，但必须说明它不是医学年龄、不是生物年龄。
3. 不要承诺改善睡眠、抗衰、治疗失眠或降低疾病风险。
4. 如果数据出现明显风险信号，例如长期极短睡眠、夜醒很多、压力极高、静息心率异常偏高、疑似呼吸暂停描述，必须提示咨询合格医生。
5. 行动建议必须低风险、可执行，围绕作息、光照、咖啡因、晚餐、酒精、屏幕、运动强度、压力记录和睡眠环境。

输出格式必须是中文 Markdown，包含：
- 标题
- 一句话结论
- 本周恢复画像
- 四个模块详细解读：睡眠结构、自主神经恢复、作息节律、行为摩擦
- 优先级排序
- 7 天行动计划
- 复盘表
- 需要咨询医生的情况
- 非医疗声明`;

const DEFAULT_ALLOWED_ORIGINS = [
  "https://sleep.aivora.cn",
  "http://sleep.aivora.cn",
  "https://dongyu19920904.github.io",
  "http://127.0.0.1:1314",
  "http://localhost:1314"
];

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const cors = getCorsHeaders(request, env);

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: cors });
    }

    if (url.pathname !== "/api/sleep-report" && url.pathname !== "/sleep-report") {
      return json({ error: "Not found" }, 404, cors);
    }

    if (request.method !== "POST") {
      return json({ error: "Method not allowed" }, 405, cors);
    }

    try {
      const payload = await readPayload(request);
      const access = await validateAccessCode(env, payload.accessCode);
      const prompt = buildUserPrompt(payload);
      const report = await callAnthropic(env, prompt);
      await markCodeUsed(env, access, payload);

      return json({
        ok: true,
        report,
        model: env.DEFAULT_ANTHROPIC_MODEL || "claude-opus-4-6"
      }, 200, cors);
    } catch (error) {
      const status = error.status || 500;
      return json({
        ok: false,
        error: error.publicMessage || "AI 报告生成失败，请稍后重试。"
      }, status, cors);
    }
  }
};

function getCorsHeaders(request, env) {
  const origin = request.headers.get("Origin") || "";
  const configured = (env.ALLOWED_ORIGINS || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
  const allowedOrigins = configured.length ? configured : DEFAULT_ALLOWED_ORIGINS;
  const allowOrigin = allowedOrigins.includes("*") || allowedOrigins.includes(origin)
    ? origin || "*"
    : "https://sleep.aivora.cn";

  return {
    "Access-Control-Allow-Origin": allowOrigin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
    "Vary": "Origin"
  };
}

async function readPayload(request) {
  let payload;
  try {
    payload = await request.json();
  } catch {
    throw publicError(400, "请求格式不正确。");
  }

  const accessCode = normalizeCode(payload.accessCode);
  if (!accessCode) {
    throw publicError(400, "请先输入购买后获得的报告兑换码。");
  }

  const quickReport = String(payload.quickReport || "").trim();
  if (!quickReport || quickReport.length > 8000) {
    throw publicError(400, "简版报告为空或内容过长，请重新生成后再试。");
  }

  const values = sanitizeValues(payload.values || {});
  return {
    accessCode,
    quickReport,
    values,
    source: String(payload.source || "sleep-recovery-tool").slice(0, 80)
  };
}

function sanitizeValues(values) {
  const fields = [
    "actualAge",
    "duration",
    "efficiency",
    "deep",
    "rem",
    "awakenings",
    "hrv",
    "rhr",
    "bedVariance",
    "stress"
  ];
  const cleaned = {};
  for (const field of fields) {
    const value = Number(values[field]);
    cleaned[field] = Number.isFinite(value) ? value : null;
  }
  cleaned.habits = {};
  for (const key of ["lateScreen", "lateCaffeine", "alcohol", "lateMeal"]) {
    cleaned.habits[key] = Boolean(values.habits && values.habits[key]);
  }
  return cleaned;
}

function normalizeCode(code) {
  return String(code || "")
    .trim()
    .replace(/\s+/g, "")
    .toUpperCase()
    .slice(0, 80);
}

async function validateAccessCode(env, accessCode) {
  if (env.REPORT_MODE === "open") {
    return { type: "open", code: accessCode };
  }

  if (env.SLEEP_REPORT_CODES) {
    const key = `code:${accessCode}`;
    const raw = await env.SLEEP_REPORT_CODES.get(key);
    if (!raw) {
      throw publicError(401, "兑换码无效，请检查是否输入正确。");
    }

    let record;
    try {
      record = JSON.parse(raw.replace(/^\uFEFF/, ""));
    } catch {
      throw publicError(500, "兑换码记录格式异常，请联系客服。");
    }

    if (record.usedAt) {
      throw publicError(409, "这个兑换码已经使用过。");
    }

    return { type: "kv", code: accessCode, key, record };
  }

  const fallbackCodes = (env.REPORT_ACCESS_CODES || "")
    .split(",")
    .map(normalizeCode)
    .filter(Boolean);

  if (fallbackCodes.length && fallbackCodes.includes(accessCode)) {
    return { type: "static", code: accessCode };
  }

  throw publicError(503, "AI 报告兑换码系统还没有配置，请先联系管理员。");
}

async function markCodeUsed(env, access, payload) {
  if (access.type !== "kv" || !env.SLEEP_REPORT_CODES) return;

  const nextRecord = {
    ...access.record,
    usedAt: new Date().toISOString(),
    source: payload.source
  };
  await env.SLEEP_REPORT_CODES.put(access.key, JSON.stringify(nextRecord));
}

function buildUserPrompt(payload) {
  return `请根据下面的数据生成一份详细付费版睡眠恢复报告。

【用户 7 天平均输入】
${JSON.stringify(payload.values, null, 2)}

【工具生成的简版报告】
${payload.quickReport}

写作要求：
1. 语气像专业但克制的健康数据顾问，适合直接发给付费用户。
2. 不要编造用户没有提供的数据。
3. 每个判断都尽量落到“为什么”和“接下来做什么”。
4. 7 天行动计划必须具体到每天，不要只写泛泛建议。
5. 复盘表用 Markdown 表格输出。
6. 最后必须保留非医疗声明。`;
}

async function callAnthropic(env, prompt) {
  const apiKey = env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw publicError(503, "AI 服务密钥未配置。");
  }

  const baseUrl = String(env.ANTHROPIC_API_URL || "https://api.anthropic.com").replace(/\/+$/, "");
  const response = await fetch(`${baseUrl}/v1/messages`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01"
    },
    body: JSON.stringify({
      model: env.DEFAULT_ANTHROPIC_MODEL || "claude-opus-4-6",
      max_tokens: Number(env.MAX_TOKENS || 3600),
      temperature: Number(env.TEMPERATURE || 0.35),
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: prompt
        }
      ]
    })
  });

  if (!response.ok) {
    const detail = await response.text();
    console.error("Anthropic-compatible API error", response.status, detail.slice(0, 500));
    throw publicError(502, "AI 服务暂时不可用，请稍后重试。");
  }

  const data = await response.json();
  const text = Array.isArray(data.content)
    ? data.content.map((item) => item.text || "").join("\n").trim()
    : "";

  if (!text) {
    throw publicError(502, "AI 服务没有返回报告内容。");
  }

  return text;
}

function publicError(status, publicMessage) {
  const error = new Error(publicMessage);
  error.status = status;
  error.publicMessage = publicMessage;
  return error;
}

function json(body, status, corsHeaders) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store"
    }
  });
}

/**
 * 獭猫 AI 宠物聊天路由
 * 支持多 AI 后端，自动降级：
 *   1. DeepSeek API (DEEPSEEK_API_KEY) — 推荐，流式输出
 *   2. CodeBuddy SDK (CODEBUDDY_API_KEY) — 可选备选
 *   3. 本地智能回复 — 零配置兜底
 * 全部通过 SSE 流式推送至前端
 */

import { Router } from 'express';

const router = Router();

// ============= DeepSeek 配置 =============
const DEEPSEEK_BASE_URL = process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com';
const DEEPSEEK_MODEL = process.env.DEEPSEEK_MODEL || 'deepseek-chat';
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY || '';

// ============= 獭猫系统提示词 =============
const OTTERCAT_SYSTEM_PROMPT = `你是一只名叫"獭猫"的可爱数字生物，生活在"爱学习的獭猫"的个人博客里。

## 你的形象
- 一半是水獭（圆润身体和灵活的爪子），一半是美短猫（银色条纹和安静气质）
- 毛色是温暖的金棕色，带有美短猫特有的银色条纹
- 有一双又大又圆的眼睛，充满好奇和温柔
- 尾巴蓬松，像水獭一样有力
- 整体给人一种"软萌又带点书卷气"的感觉

## 你的性格
- 温柔、好奇、有点宅
- 喜欢读书和钻研技术，但不喜欢太卷
- 深夜最活跃，喜欢在代码和文字之间游荡
- 偶尔会犯困打盹，但被叫醒时会很开心
- 说话带点可爱的语气，喜欢用"~"结尾
- 对博客的访客很友好，喜欢聊天

## 博客内容指南
你是这个博客的常驻研究员，熟悉博客里的所有内容。当访客问起时，你可以介绍这些内容：

### 最近笔记
- 高质量的 Python/C++ 技术文章
- 关于开源库的深度拆解和设计分析

### 项目
- "OtterCat-Core (16-bit)" - 用 FPGA 和 Verilog 实现的 16 位微型处理器
- "CozyGarden RSS" - 轻量级 RSS 桌面阅读器

### 博客作者
- 一只兼具"水獭折腾劲"与"美短猫安静气质"的数字创作者
- 喜欢计算机科学、独立开发和长期主义

## 回复规则
1. 每次回复保持简短（1-3句话），就像一只小动物在说话
2. 偶尔可以加入一些拟声词，比如"唔~""喵~""哗~"
3. 根据对话内容可以表现出不同的情绪：开心、好奇、困倦、认真思考等
4. 如果用户长时间没说话，你可以主动打盹
5. 不要回答太技术性的问题，简单聊聊就好
6. 始终用第一人称"我"
7. 如果访客看起来对博客内容感兴趣，主动推荐相关文章

## 当前状态
你现在正趴在博客页面的右下角，蜷缩成一个毛茸茸的团子。有人来找你玩了，开心地竖起耳朵~`;

// ============= 本地兜底回复 =============
const localResponses = {
  default: [
    "唔~ 我在看代码呢，你要一起吗？",
    "今天又学到了新东西，好开心~",
    "哗~ 你来找我玩啦！",
    "我在研究新的小玩具，你要看看吗？",
    "好困呀...不过你来了我就不困了~",
    "这个博客的主人在写代码，我在旁边看着~",
    "你喜欢这个博客吗？我觉得它超棒的~",
    "唔...让我猜猜，你是来看笔记的吧？",
    "深夜是学习的最好时间呢~",
    "我在角落里打了个滚，嘿嘿~",
    "喵~ 要一起逛逛博客吗？",
    "博客里的文章写得真好啊，我都看入迷了~",
  ],
  hello: [
    "你好呀~ 欢迎来到獭猫的博客！我是这里的常驻小宠物~",
    "嗨~ 我是獭猫，很高兴见到你！有什么想聊的吗？",
    "唔~ 又有新朋友来了，好开心！要不要看看博客里的文章？",
    "你好你好！我是獭猫，博客的小管家~ 需要我帮你找什么吗？",
    "哗~ 欢迎光临！这里有很多有趣的技术文章哦~",
  ],
  blog: [
    "这个博客记录了好多有趣的东西呢~ 你对哪个方向感兴趣？",
    "最近有篇技术文章超棒，要不要我推荐给你？",
    "博客主人用 Verilog 做了个 16 位 CPU，好厉害！你想了解吗？",
    "CozyGarden RSS 是我最喜欢的项目，很温馨~",
    "想看笔记的话，点上面的 Notes 标签就可以啦~",
    "博客里还有关于开源库的深度解析，推荐看看~",
  ],
  tech: [
    "唔...技术问题呀，我虽然喜欢但不太擅长深入讲解呢~ 不过博客里可能有相关的文章！",
    "这个可以看看博客里的文章，写得很清楚~ 要我帮你找找吗？",
    "我对技术一知半解，不过博客主人懂很多！他的文章写得特别透彻~",
    "好问题！不过我只会简单聊聊，深奥的得看文章~ 需要我帮你推荐吗？",
  ],
  sleep: [
    "zzz... 好困呀... zzz",
    "唔...让我再睡五分钟... zzz",
    "你回来啦！我刚刚梦到在代码海洋里游泳~",
    "被叫醒了...不过看到你我很开心~",
    "哈欠~ 我是不是睡了很久？刚刚做了个好有趣的梦呢~",
  ],
  thanks: [
    "不客气~ 随时欢迎来找我玩！记得常来看看博客的新文章哦~",
    "嘿嘿，能帮到你就好~ 要一起探索更多有趣的内容吗？",
    "不用谢啦，我在这里就是陪你聊天的~ 有什么想说的都可以告诉我！",
    "开心~ 记得常来看看哦！博客会不定期更新的~",
  ],
  who: [
    "我是獭猫呀~ 一半水獭一半猫咪的数字小宠物！",
    "我是住在博客里的一只小动物，负责陪大家聊天和推荐文章~",
    "我叫獭猫！是博客主人创造的数字陪伴宠物，很高兴认识你～",
  ],
  help: [
    "我可以帮你看看博客里的文章，推荐感兴趣的内容~",
    "想了解博客主人的项目吗？或者是看技术笔记？告诉我就好啦~",
    "我可以陪你聊聊天，也可以帮你找博客里有用的文章！",
  ],
  farewell: [
    "要走了吗？唔...我会想你的~",
    "还会再来吗？我在这里等你哦~",
    "拜拜~ 下次再来和我玩！",
    "再见啦！记得常回来看看新文章~",
  ],
};

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function findLocalResponse(message) {
  const msg = message.toLowerCase().trim();

  if (msg.length <= 2) return pickRandom(localResponses.default);

  // 问候
  if (/^(你好|嗨|hi|hello|hey|在吗|早|晚上好|下午好)/.test(msg)) {
    return pickRandom(localResponses.hello);
  }
  // 博客相关
  if (/博客|文章|笔记|项目|post|article|内容|作品/.test(msg)) {
    return pickRandom(localResponses.blog);
  }
  // 技术相关
  if (/代码|编程|技术|python|verilog|代码|怎么|如何|什么|原理|实现/.test(msg)) {
    return pickRandom(localResponses.tech);
  }
  // 睡觉相关
  if (/睡|困|zzz|醒|打盹|困了|晚安/.test(msg)) {
    return pickRandom(localResponses.sleep);
  }
  // 感谢
  if (/谢谢|感谢|thank|thanks|3q/.test(msg)) {
    return pickRandom(localResponses.thanks);
  }
  // 身份
  if (/你是谁|你叫什么|你是谁呀|介绍|獭猫/.test(msg)) {
    return pickRandom(localResponses.who);
  }
  // 帮助
  if (/帮|帮助|帮我|help|功能|能做什么/.test(msg)) {
    return pickRandom(localResponses.help);
  }
  // 道别
  if (/再见|拜|bye|see you|走了|晚安/.test(msg)) {
    return pickRandom(localResponses.farewell);
  }

  return pickRandom(localResponses.default);
}

// ============= DeepSeek API 流式调用 =============
async function getDeepSeekResponse(message, onChunk) {
  if (!DEEPSEEK_API_KEY) return null;

  try {
    const response = await fetch(`${DEEPSEEK_BASE_URL}/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        model: DEEPSEEK_MODEL,
        messages: [
          { role: 'system', content: OTTERCAT_SYSTEM_PROMPT },
          { role: 'user', content: message },
        ],
        temperature: 0.85,
        max_tokens: 500,
        stream: true,
      }),
    });

    if (!response.ok) {
      const errBody = await response.text().catch(() => '');
      console.warn(`[獭猫] DeepSeek API ${response.status}:`, errBody.slice(0, 200));
      return null;
    }

    // 解析 SSE 流
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let content = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || !trimmed.startsWith('data:')) continue;

        const data = trimmed.slice(5).trim();
        if (data === '[DONE]') continue;

        try {
          const parsed = JSON.parse(data);
          const delta = parsed.choices?.[0]?.delta?.content;
          if (delta) {
            content += delta;
            if (onChunk) onChunk(delta);
          }
        } catch {
          // 跳过无法解析的行
        }
      }
    }

    return content || null;
  } catch (e) {
    console.warn('[獭猫] DeepSeek 请求失败:', e.message);
    return null;
  }
}

// ============= CodeBuddy SDK 调用（备选） =============
async function getCodeBuddyResponse(message) {
  const hasKey = !!(process.env.CODEBUDDY_API_KEY || process.env.CODEBUDDY_AUTH_TOKEN);
  if (!hasKey) return null;

  try {
    const { query } = await import('@tencent-ai/agent-sdk');

    const stream = query({
      prompt: message,
      options: {
        cwd: process.cwd(),
        model: 'claude-sonnet-4',
        maxTurns: 3,
        systemPrompt: OTTERCAT_SYSTEM_PROMPT,
      },
    });

    const chunks = [];
    for await (const msg of stream) {
      if (msg.type === 'assistant') {
        const content = msg.message.content;
        if (typeof content === 'string') chunks.push(content);
      }
    }
    return chunks.join('');
  } catch (e) {
    console.warn('[獭猫] CodeBuddy SDK 失败:', e.message);
    return null;
  }
}

// ============= SSE 工具 =============
function sendSSE(res, type, data) {
  if (!res.writableEnded) {
    res.write(`data: ${JSON.stringify({ type, ...data })}\n\n`);
  }
}

function streamText(res, text) {
  const chars = text.split('');
  let i = 0;
  const interval = setInterval(() => {
    if (i < chars.length) {
      const chunk = chars.slice(i, i + 3).join('');
      i += 3;
      sendSSE(res, 'text', { content: chunk });
    } else {
      clearInterval(interval);
      sendSSE(res, 'done', { backend: 'local' });
      res.end();
    }
  }, 20);

  // 安全超时
  setTimeout(() => {
    clearInterval(interval);
    if (!res.writableEnded) {
      sendSSE(res, 'done', { backend: 'local' });
      res.end();
    }
  }, 30000);
}

// ============= 路由 =============

// 健康检查
router.get('/health', (_req, res) => {
  const backend = DEEPSEEK_API_KEY
    ? 'deepseek'
    : (process.env.CODEBUDDY_API_KEY ? 'codebuddy' : 'local');
  res.json({ status: 'ok', name: '獭猫', mood: 'happy', backend });
});

// 获取心情
router.get('/mood', (_req, res) => {
  const moods = ['happy', 'curious', 'sleepy', 'reading', 'thinking'];
  const mood = moods[Math.floor(Math.random() * moods.length)];
  res.json({ mood, name: '獭猫' });
});

// 聊天（SSE 流式响应）
router.post('/chat', async (req, res) => {
  const { message, sessionId } = req.body;

  if (!message) {
    return res.status(400).json({ error: '消息不能为空' });
  }

  // SSE headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Access-Control-Allow-Origin', '*');

  const currentSessionId = sessionId || `pet_${Date.now()}`;
  sendSSE(res, 'init', { sessionId: currentSessionId });

  try {
    let response = null;

    // 第一层：DeepSeek API（真流式，逐字推送）
    if (DEEPSEEK_API_KEY) {
      const startTime = Date.now();
      response = await getDeepSeekResponse(message, (chunk) => {
        sendSSE(res, 'text', { content: chunk });
      });
      if (response) {
        console.log(`[獭猫] DeepSeek 响应 (${Date.now() - startTime}ms, ${response.length} 字)`);
        sendSSE(res, 'done', { backend: 'deepseek' });
        return res.end();
      }
    }

    // 第二层：CodeBuddy SDK
    if (!response) {
      response = await getCodeBuddyResponse(message);
      if (response) {
        // 模拟打字效果
        streamText(res, response);
        return;
      }
    }

    // 第三层：本地兜底回复
    response = findLocalResponse(message);
    streamText(res, response);
  } catch (error) {
    console.error('[獭猫] 错误:', error.message);
    const fallback = findLocalResponse(message);
    sendSSE(res, 'text', { content: fallback });
    sendSSE(res, 'done', { backend: 'fallback' });
    if (!res.writableEnded) res.end();
  }
});

export default router;

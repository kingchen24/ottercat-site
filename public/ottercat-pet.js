/* ========================================
   獭猫 AI 宠物陪伴小组件 - 可嵌入脚本
   爱学习的獭猫 | 独立数字工作室
   ========================================
   用法:
   1. 启动后端服务器
   2. 在页面中加入:
      <script src="http://your-server:3001/ottercat-pet.js"></script>
   ======================================== */

(function() {
  'use strict';

  // ==========================================
  // 配置
  // ==========================================
  var CONFIG = {
    apiBase: window.OTTERCAT_API_URL || window.location.origin,
    idleTimeout: 120000,
    sleepTimeout: 300000,
    bubbleDuration: 4000,
  };

  // ==========================================
  // 状态
  // ==========================================
  var state = {
    mood: 'idle',
    isChatOpen: false,
    isDragging: false,
    isSleeping: false,
    isTyping: false,
    lastInteraction: Date.now(),
    sessionId: null,
    idleTimer: null,
    sleepTimer: null,
  };

  // ==========================================
  // 内联 CSS
  // ==========================================
  function injectStyles() {
    var style = document.createElement('style');
    style.textContent = `
:root {
  --pet-body: #c4956a;
  --pet-body-dark: #a67b52;
  --pet-body-light: #d4a57a;
  --pet-stripe: #8b7355;
  --pet-belly: #f0dcc0;
  --pet-nose: #ff8a8a;
  --pet-eye: #2a1a0a;
  --pet-whisker: #6b5b4a;
  --pet-bg: rgba(30,25,20,0.85);
  --pet-text: #f0e8dc;
  --pet-accent: #e8c49a;
  --pet-shadow: rgba(0,0,0,0.3);
  --pet-chat-bg: rgba(40,35,30,0.95);
  --pet-chat-border: #5a4a3a;
}

.ottercat-container {
  position: fixed !important;
  bottom: 30px !important;
  right: 30px !important;
  z-index: 2147483647 !important;
  cursor: grab !important;
  user-select: none !important;
  touch-action: none !important;
  font-family: 'Segoe UI','PingFang SC','Microsoft YaHei',sans-serif !important;
  overflow: visible !important;
}
.ottercat-container:active { cursor: grabbing !important; }

.ottercat-pet {
  position: relative !important;
  width: 130px !important;
  height: 150px !important;
  transition: transform 0.3s cubic-bezier(0.34,1.56,0.64,1) !important;
  overflow: visible !important;
}
.ottercat-pet:hover { transform: scale(1.08) !important; }

.ottercat-svg {
  width: 100% !important;
  height: 100% !important;
  overflow: visible !important;
}

@keyframes pet-breathe { 0%,100%{transform:scaleY(1)} 50%{transform:scaleY(1.02)} }
.ottercat-pet.idle .ottercat-svg { animation: pet-breathe 3s ease-in-out infinite !important; }

@keyframes tail-wag { 0%,100%{transform:rotate(0deg)} 25%{transform:rotate(15deg)} 75%{transform:rotate(-5deg)} }
.ottercat-tail { transform-origin: bottom center !important; animation: tail-wag 2s ease-in-out infinite !important; }

@keyframes blink { 0%,95%,100%{transform:scaleY(1)} 97%{transform:scaleY(0.1)} }
.ottercat-eye { transform-origin: center !important; animation: blink 4s ease-in-out infinite !important; }

@keyframes pet-jump { 0%,100%{transform:translateY(0)} 30%{transform:translateY(-15px) scale(1.05)} 50%{transform:translateY(-20px) scale(1.1)} }
.ottercat-pet.happy { animation: pet-jump 0.6s ease-in-out !important; }

@keyframes pet-think { 0%,100%{transform:rotate(0deg)} 25%{transform:rotate(3deg)} 75%{transform:rotate(-3deg)} }
.ottercat-pet.thinking { animation: pet-think 1s ease-in-out infinite !important; }

@keyframes pet-curious { 0%,100%{transform:translateX(0)} 25%{transform:translateX(5px)} 75%{transform:translateX(-5px)} }
.ottercat-pet.curious { animation: pet-curious 0.8s ease-in-out infinite !important; }

@keyframes pet-sleep { 0%,100%{transform:translateY(0) scale(0.95)} 50%{transform:translateY(3px) scale(0.93)} }
.ottercat-pet.sleeping {
  opacity: 0.8 !important;
  animation: pet-sleep 4s ease-in-out infinite !important;
}

.ottercat-bubble {
  position: absolute !important;
  top: -10px !important; left: 50% !important;
  transform: translateX(-50%) translateY(-100%) !important;
  background: var(--pet-chat-bg) !important;
  border: 1px solid var(--pet-chat-border) !important;
  border-radius: 16px !important;
  padding: 8px 14px !important;
  font-size: 13px !important;
  color: var(--pet-text) !important;
  white-space: nowrap !important; max-width: 200px !important;
  overflow: hidden !important; text-overflow: ellipsis !important;
  pointer-events: none !important;
  opacity: 0 !important;
  transition: opacity 0.3s ease, transform 0.3s ease !important;
  box-shadow: 0 4px 16px rgba(0,0,0,0.3) !important;
}
.ottercat-bubble::after {
  content: '' !important;
  position: absolute !important; bottom: -8px !important; left: 50% !important;
  transform: translateX(-50%) !important;
  border-left: 8px solid transparent !important;
  border-right: 8px solid transparent !important;
  border-top: 8px solid var(--pet-chat-bg) !important;
}
.ottercat-bubble.show { opacity: 1 !important; transform: translateX(-50%) translateY(-110%) !important; }

.ottercat-chat {
  position: fixed !important;
  bottom: 180px !important; right: 30px !important;
  width: 340px !important; height: 460px !important;
  background: var(--pet-chat-bg) !important;
  border: 1px solid var(--pet-chat-border) !important;
  border-radius: 20px !important;
  box-shadow: 0 8px 32px rgba(0,0,0,0.4) !important;
  display: none !important;
  flex-direction: column !important;
  overflow: hidden !important;
  z-index: 2147483646 !important;
}
.ottercat-chat.open { display: flex !important; }
@keyframes chat-slide-up { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
.ottercat-chat.open { animation: chat-slide-up 0.3s cubic-bezier(0.34,1.56,0.64,1) !important; }

.ottercat-chat-header {
  display: flex !important; align-items: center !important;
  justify-content: space-between !important;
  padding: 14px 18px !important;
  border-bottom: 1px solid var(--pet-chat-border) !important;
}
.ottercat-chat-title {
  display: flex !important; align-items: center !important; gap: 8px !important;
  font-size: 15px !important; font-weight: 600 !important; color: var(--pet-text) !important;
}
.ottercat-chat-title-icon {
  width: 28px !important; height: 28px !important;
  border-radius: 50% !important;
  background: linear-gradient(135deg, var(--pet-body), var(--pet-stripe)) !important;
  display: flex !important; align-items: center !important; justify-content: center !important;
  font-size: 16px !important;
}
.ottercat-chat-close {
  width: 32px !important; height: 32px !important; border-radius: 50% !important;
  border: none !important; background: transparent !important; color: var(--pet-text) !important;
  cursor: pointer !important; font-size: 16px !important;
  transition: background 0.2s !important;
}
.ottercat-chat-close:hover { background: rgba(255,255,255,0.1) !important; }

.ottercat-chat-messages {
  flex: 1 !important; padding: 14px !important; overflow-y: auto !important;
  display: flex !important; flex-direction: column !important; gap: 10px !important;
}
.ottercat-msg {
  max-width: 85% !important; padding: 10px 14px !important;
  border-radius: 14px !important; font-size: 13px !important;
  line-height: 1.6 !important; word-wrap: break-word !important;
  animation: msg-fade-in 0.3s ease !important;
}
@keyframes msg-fade-in { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
.ottercat-msg.bot {
  align-self: flex-start !important;
  background: rgba(196,149,106,0.15) !important;
  border: 1px solid rgba(196,149,106,0.2) !important;
  color: var(--pet-text) !important;
  border-bottom-left-radius: 4px !important;
}
.ottercat-msg.user {
  align-self: flex-end !important;
  background: linear-gradient(135deg, var(--pet-body), var(--pet-body-dark)) !important;
  color: #1a1510 !important;
  border-bottom-right-radius: 4px !important;
}

.ottercat-typing {
  align-self: flex-start !important;
  display: flex !important; align-items: center !important; gap: 4px !important;
  padding: 12px 16px !important;
  background: rgba(196,149,106,0.1) !important;
  border-radius: 14px !important;
  border-bottom-left-radius: 4px !important;
}
.ottercat-typing-dot {
  width: 6px !important; height: 6px !important; border-radius: 50% !important;
  background: var(--pet-body) !important;
  animation: typing-bounce 1.4s ease-in-out infinite !important;
}
.ottercat-typing-dot:nth-child(2) { animation-delay: 0.2s !important; }
.ottercat-typing-dot:nth-child(3) { animation-delay: 0.4s !important; }
@keyframes typing-bounce { 0%,60%,100%{transform:translateY(0)} 30%{transform:translateY(-6px)} }

.ottercat-chat-input-area {
  display: flex !important; align-items: center !important; gap: 8px !important;
  padding: 12px 16px !important;
  border-top: 1px solid var(--pet-chat-border) !important;
}
.ottercat-chat-input {
  flex: 1 !important; padding: 10px 14px !important;
  border: 1px solid var(--pet-chat-border) !important; border-radius: 24px !important;
  background: rgba(255,255,255,0.05) !important; color: var(--pet-text) !important;
  font-size: 13px !important; outline: none !important;
}
.ottercat-chat-input:focus { border-color: var(--pet-body) !important; }
.ottercat-chat-input::placeholder { color: rgba(240,232,220,0.4) !important; }
.ottercat-chat-send {
  width: 38px !important; height: 38px !important; border-radius: 50% !important;
  border: none !important;
  background: linear-gradient(135deg, var(--pet-body), var(--pet-body-dark)) !important;
  color: #1a1510 !important; cursor: pointer !important; font-size: 16px !important;
  transition: transform 0.2s, box-shadow 0.2s !important; flex-shrink: 0 !important;
}
.ottercat-chat-send:hover { transform: scale(1.1) !important; box-shadow: 0 2px 8px rgba(196,149,106,0.4) !important; }
.ottercat-chat-send:disabled { opacity: 0.5 !important; cursor: not-allowed !important; transform: none !important; }

.ottercat-mood-indicator {
  position: absolute !important; top: -6px !important; right: -6px !important;
  width: 24px !important; height: 24px !important; border-radius: 50% !important;
  display: flex !important; align-items: center !important; justify-content: center !important;
  font-size: 12px !important;
  background: var(--pet-chat-bg) !important;
  border: 2px solid var(--pet-chat-border) !important;
  pointer-events: none !important;
}

@media (max-width:600px) {
  .ottercat-container { bottom: 16px !important; right: 16px !important; }
  .ottercat-pet { width: 100px !important; height: 115px !important; }
  .ottercat-chat { right: 10px !important; left: 10px !important; bottom: 140px !important; width: auto !important; height: 400px !important; }
}
`;
    document.head.appendChild(style);
  }

  // ==========================================
  // 獭猫 SVG
  // ==========================================
  function petSVG() {
    return [
'<svg class="ottercat-svg" viewBox="0 0 200 240" xmlns="http://www.w3.org/2000/svg">',
  '<defs>',
    '<linearGradient id="bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#d4a57a"/><stop offset="100%" stop-color="#c4956a"/></linearGradient>',
    '<linearGradient id="bl" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#f0dcc0"/><stop offset="100%" stop-color="#e8d0b0"/></linearGradient>',
    '<linearGradient id="tailGrad" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#d4a57a"/><stop offset="100%" stop-color="#a67b52"/></linearGradient>',
  '</defs>',
  /* 尾巴 - 水獭粗尾巴，限在viewBox内 */
  '<g class="ottercat-tail">',
    '<path d="M155,190 C165,185 180,175 185,160 C188,152 190,145 185,140 C180,135 172,138 170,148 C168,158 160,175 150,185Z" fill="url(#tailGrad)" stroke="#8b7355" stroke-width="1"/>',
    '<path d="M182,145 C185,140 188,143 185,148 C182,153 179,150 182,145Z" fill="#8b7355" opacity="0.3"/>',
  '</g>',
  /* 身体 - 水獭长圆身体 */
  '<ellipse cx="100" cy="170" rx="48" ry="36" fill="url(#bg)" stroke="#a67b52" stroke-width="1.5"/>',
  /* 美短猫条纹 */
  '<path d="M70,150 Q100,146 130,150" fill="none" stroke="#8b7355" stroke-width="2.5" opacity="0.35"/>',
  '<path d="M65,160 Q100,156 135,160" fill="none" stroke="#8b7355" stroke-width="2" opacity="0.3"/>',
  '<path d="M68,170 Q100,166 132,170" fill="none" stroke="#8b7355" stroke-width="2" opacity="0.25"/>',
  /* 肚皮 */
  '<ellipse cx="100" cy="175" rx="30" ry="22" fill="url(#bl)" opacity="0.5"/>',
  /* 前腿 - 水獭短腿 */
  '<ellipse cx="72" cy="198" rx="14" ry="9" fill="url(#bg)" stroke="#a67b52" stroke-width="1"/>',
  '<ellipse cx="128" cy="198" rx="14" ry="9" fill="url(#bg)" stroke="#a67b52" stroke-width="1"/>',
  '<ellipse cx="72" cy="195" rx="10" ry="6" fill="#c4956a"/>',
  '<ellipse cx="128" cy="195" rx="10" ry="6" fill="#c4956a"/>',
  /* 头部 - 猫咪圆脸 */
  '<ellipse cx="100" cy="108" rx="43" ry="38" fill="url(#bg)" stroke="#a67b52" stroke-width="1.5"/>',
  /* 猫咪尖耳朵 */
  '<g class="ottercat-ear">',
    '<path d="M62,78 L58,48 L80,62 Z" fill="#c4956a" stroke="#a67b52" stroke-width="1.5" stroke-linejoin="round"/>',
    '<path d="M65,75 L62,55 L77,64 Z" fill="#f0dcc0" opacity="0.5"/>',
  '</g>',
  '<g class="ottercat-ear">',
    '<path d="M138,78 L142,48 L120,62 Z" fill="#c4956a" stroke="#a67b52" stroke-width="1.5" stroke-linejoin="round"/>',
    '<path d="M135,75 L138,55 L123,64 Z" fill="#f0dcc0" opacity="0.5"/>',
  '</g>',
  /* 耳朵内粉色 */
  '<path d="M63,72 L60,55 L74,63 Z" fill="#f5c6c6" opacity="0.4"/>',
  '<path d="M137,72 L140,55 L126,63 Z" fill="#f5c6c6" opacity="0.4"/>',
  /* 大眼睛 - 猫咪特色 */
  '<g class="ottercat-eye">',
    '<ellipse cx="84" cy="102" rx="13" ry="14" fill="white" stroke="#8b7355" stroke-width="1.2"/>',
    '<ellipse cx="85" cy="102" rx="8" ry="9" fill="#2a1a0a"/>',
    '<ellipse cx="82" cy="98" rx="4.5" ry="4.5" fill="white" opacity="0.9"/>',
    '<circle cx="87" cy="106" r="2.5" fill="white" opacity="0.5"/>',
  '</g>',
  '<g class="ottercat-eye">',
    '<ellipse cx="116" cy="102" rx="13" ry="14" fill="white" stroke="#8b7355" stroke-width="1.2"/>',
    '<ellipse cx="117" cy="102" rx="8" ry="9" fill="#2a1a0a"/>',
    '<ellipse cx="114" cy="98" rx="4.5" ry="4.5" fill="white" opacity="0.9"/>',
    '<circle cx="119" cy="106" r="2.5" fill="white" opacity="0.5"/>',
  '</g>',
  /* 小鼻子 */
  '<ellipse cx="100" cy="118" rx="4.5" ry="3.5" fill="#ff8a8a"/>',
  /* 猫咪嘴巴 */
  '<path d="M95,121 Q100,127 105,121" fill="none" stroke="#6b5b4a" stroke-width="1.5" stroke-linecap="round"/>',
  '<line x1="100" y1="118" x2="100" y2="121" stroke="#6b5b4a" stroke-width="1.5"/>',
  /* 胡须 */
  '<g stroke="#8b7355" stroke-width="1" opacity="0.5" stroke-linecap="round">',
    '<line x1="72" y1="112" x2="50" y2="108"/>',
    '<line x1="72" y1="116" x2="48" y2="116"/>',
    '<line x1="72" y1="120" x2="50" y2="124"/>',
    '<line x1="128" y1="112" x2="150" y2="108"/>',
    '<line x1="128" y1="116" x2="152" y2="116"/>',
    '<line x1="128" y1="120" x2="150" y2="124"/>',
  '</g>',
  /* 睡觉眼睛 */
  '<g class="sleepy-eyes" style="display:none">',
    '<path d="M76,102 Q84,96 92,102" fill="none" stroke="#2a1a0a" stroke-width="2.5" stroke-linecap="round"/>',
    '<path d="M108,102 Q116,96 124,102" fill="none" stroke="#2a1a0a" stroke-width="2.5" stroke-linecap="round"/>',
  '</g>',
  /* Zzz */
  '<g class="zzz" style="display:none">',
    '<text x="142" y="58" font-size="10" fill="#c4956a" opacity="0.6">z</text>',
    '<text x="148" y="44" font-size="14" fill="#c4956a" opacity="0.4">z</text>',
    '<text x="155" y="28" font-size="18" fill="#c4956a" opacity="0.3">Z</text>',
  '</g>',
'</svg>'
    ].join('');
  }

  // ==========================================
  // 构建 DOM
  // ==========================================
  var $ = {
    container: null,
    pet: null,
    chat: null,
    bubble: null,
    messages: null,
    input: null,
    sendBtn: null,
    moodIcon: null,
  };

  function buildWidget() {
    // 注入样式
    injectStyles();

    // 容器
    var container = document.createElement('div');
    container.className = 'ottercat-container';

    // 宠物
    var pet = document.createElement('div');
    pet.className = 'ottercat-pet idle';
    pet.innerHTML = petSVG();

    // 心情指示器
    var moodIcon = document.createElement('div');
    moodIcon.className = 'ottercat-mood-indicator';
    moodIcon.textContent = '😊';

    // 气泡
    var bubble = document.createElement('div');
    bubble.className = 'ottercat-bubble';
    bubble.textContent = '你好~ 我是獭猫！';

    // 聊天窗口
    var chat = document.createElement('div');
    chat.className = 'ottercat-chat';
    chat.innerHTML =
      '<div class="ottercat-chat-header">' +
        '<div class="ottercat-chat-title"><span class="ottercat-chat-title-icon">🐱</span><span>獭猫</span></div>' +
        '<button class="ottercat-chat-close">✕</button>' +
      '</div>' +
      '<div class="ottercat-chat-messages">' +
        '<div class="ottercat-msg bot">你好呀~ 我是住在博客里的獭猫！找我聊天吗？🐱</div>' +
      '</div>' +
      '<div class="ottercat-chat-input-area">' +
        '<input class="ottercat-chat-input" type="text" placeholder="和獭猫说点什么..." maxlength="200">' +
        '<button class="ottercat-chat-send">➤</button>' +
      '</div>';

    // 组装
    pet.appendChild(moodIcon);
    pet.appendChild(bubble);
    container.appendChild(pet);
    container.appendChild(chat);
    document.body.appendChild(container);

    // 缓存引用
    $.container = container;
    $.pet = pet;
    $.chat = chat;
    $.bubble = bubble;
    $.moodIcon = moodIcon;
    $.messages = chat.querySelector('.ottercat-chat-messages');
    $.input = chat.querySelector('.ottercat-chat-input');
    $.sendBtn = chat.querySelector('.ottercat-chat-send');
  }

  // ==========================================
  // 情绪管理
  // ==========================================
  var moods = {
    idle: { icon: '😊', cls: 'idle' },
    happy: { icon: '😄', cls: 'happy' },
    sleeping: { icon: '💤', cls: 'sleeping' },
    thinking: { icon: '🤔', cls: 'thinking' },
    curious: { icon: '👀', cls: 'curious' },
  };

  function setMood(mood) {
    state.mood = mood;
    var m = moods[mood] || moods.idle;

    // 清除旧状态
    Object.keys(moods).forEach(function(k) {
      $.pet.classList.remove(moods[k].cls);
    });
    // 眼睛/睡眠显示
    var sleepyEyes = $.pet.querySelector('.sleepy-eyes');
    var zzz = $.pet.querySelector('.zzz');
    var eyes = $.pet.querySelectorAll('.ottercat-eye');

    if (mood === 'sleeping') {
      $.pet.classList.add('sleeping');
      if (sleepyEyes) sleepyEyes.style.display = 'block';
      if (zzz) zzz.style.display = 'block';
      eyes.forEach(function(e) { e.style.display = 'none'; });
    } else {
      if (sleepyEyes) sleepyEyes.style.display = 'none';
      if (zzz) zzz.style.display = 'none';
      eyes.forEach(function(e) { e.style.display = 'block'; });
      $.pet.classList.add(m.cls);
    }

    $.moodIcon.textContent = m.icon;
  }

  // ==========================================
  // 气泡
  // ==========================================
  var quips = [
    '你好呀~ 欢迎来玩！',
    '今天天气不错呢~',
    '唔...在看什么有趣的东西？',
    '让我猜猜，你也是夜猫子吧？',
    '哗~ 你来了！',
    '我在看代码，你要一起吗？',
    '好困... zzz',
    '今天学到了新东西！',
    '这个博客很有品味~',
    '要不要聊聊天？',
  ];

  function showBubble(text, duration) {
    $.bubble.textContent = text;
    $.bubble.classList.add('show');
    clearTimeout($.bubble._t);
    $.bubble._t = setTimeout(function() {
      $.bubble.classList.remove('show');
    }, duration || CONFIG.bubbleDuration);
  }

  // ==========================================
  // 空闲管理
  // ==========================================
  function resetIdle() {
    clearTimeout(state.idleTimer);
    clearTimeout(state.sleepTimer);

    state.idleTimer = setTimeout(function() {
      if (!state.isChatOpen) {
        setMood('sleeping');
        state.isSleeping = true;
        showBubble('zzz... 好困...', 3000);
      }
      state.sleepTimer = setTimeout(function() {
        if (!state.isChatOpen) {
          state.isSleeping = true;
        }
      }, CONFIG.sleepTimeout - CONFIG.idleTimeout);
    }, CONFIG.idleTimeout);
  }

  function wakeUp() {
    resetIdle();
    if (state.isSleeping) {
      state.isSleeping = false;
      setMood('happy');
      showBubble('唔...你回来啦！', 2500);
      setTimeout(function() { setMood('idle'); }, 1500);
    } else {
      setMood('happy');
      setTimeout(function() { setMood('idle'); }, 1500);
    }
  }

  // ==========================================
  // 聊天
  // ==========================================
  var botMsgDiv = null;

  function addMsg(role, text) {
    var div = document.createElement('div');
    div.className = 'ottercat-msg ' + role;
    div.textContent = text;
    $.messages.appendChild(div);
    $.messages.scrollTop = $.messages.scrollHeight;
  }

  function streamBot(chunk) {
    if (!botMsgDiv || !botMsgDiv.parentNode) {
      botMsgDiv = document.createElement('div');
      botMsgDiv.className = 'ottercat-msg bot';
      botMsgDiv.textContent = '';
      $.messages.appendChild(botMsgDiv);
    }
    botMsgDiv.textContent += chunk;
    $.messages.scrollTop = $.messages.scrollHeight;
  }

  function showTyping() {
    var div = document.createElement('div');
    div.className = 'ottercat-typing';
    div.id = 'otcat-typing';
    div.innerHTML = '<span class="ottercat-typing-dot"></span><span class="ottercat-typing-dot"></span><span class="ottercat-typing-dot"></span>';
    $.messages.appendChild(div);
    $.messages.scrollTop = $.messages.scrollHeight;
  }

  function hideTyping() {
    var el = document.getElementById('otcat-typing');
    if (el) el.remove();
  }

  function sendMsg() {
    var text = $.input.value.trim();
    if (!text || state.isTyping) return;

    $.input.value = '';
    addMsg('user', text);
    setMood('thinking');
    state.isTyping = true;
    botMsgDiv = null;
    showTyping();

    var xhr = new XMLHttpRequest();
    xhr.open('POST', CONFIG.apiBase + '/api/pet/chat');
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.responseType = 'text';

    var lastIndex = 0;

    xhr.onprogress = function() {
      var newData = xhr.responseText.slice(lastIndex);
      lastIndex = xhr.responseText.length;
      var lines = newData.split('\n');
      for (var i = 0; i < lines.length; i++) {
        var line = lines[i].trim();
        if (line.startsWith('data: ')) {
          try {
            var data = JSON.parse(line.slice(6));
            onSSEData(data);
          } catch(e) {}
        }
      }
    };

    xhr.onloadend = function() {
      state.isTyping = false;
      hideTyping();
      botMsgDiv = null;
      if (state.mood === 'thinking') setMood('idle');
      resetIdle();
    };

    xhr.send(JSON.stringify({
      message: text,
      sessionId: state.sessionId,
    }));
  }

  function onSSEData(data) {
    if (data.type === 'init') {
      state.sessionId = data.sessionId;
    } else if (data.type === 'text') {
      hideTyping();
      streamBot(data.content);
    } else if (data.type === 'done') {
      showBubble('唔...说完了~', 3000);
    } else if (data.type === 'error') {
      addMsg('bot', data.message || '让我打个盹先... zzz');
    }
  }

  // ==========================================
  // 交互事件
  // ==========================================
  function initEvents() {
    var isDragging = false;
    var startX, startY, elLeft, elTop;

    $.pet.addEventListener('mousedown', function(e) {
      if (e.button !== 0) return;
      isDragging = false;
      var rect = $.pet.getBoundingClientRect();
      startX = e.clientX;
      startY = e.clientY;
      elLeft = rect.left;
      elTop = rect.top;

      function onMove(e2) {
        var dx = e2.clientX - startX;
        var dy = e2.clientY - startY;
        if (Math.abs(dx) > 5 || Math.abs(dy) > 5) isDragging = true;
        if (isDragging) {
          $.container.style.left = (elLeft + dx) + 'px';
          $.container.style.top = (elTop + dy) + 'px';
          $.container.style.right = 'auto';
          $.container.style.bottom = 'auto';
        }
      }
      function onUp() {
        document.removeEventListener('mousemove', onMove);
        document.removeEventListener('mouseup', onUp);
        if (!isDragging) toggleChat();
      }
      document.addEventListener('mousemove', onMove);
      document.addEventListener('mouseup', onUp);
    });

    $.pet.addEventListener('touchstart', function(e) {
      var touch = e.touches[0];
      isDragging = false;
      var rect = $.pet.getBoundingClientRect();
      startX = touch.clientX;
      startY = touch.clientY;
      elLeft = rect.left;
      elTop = rect.top;

      function onMove(e2) {
        var t = e2.touches[0];
        var dx = t.clientX - startX;
        var dy = t.clientY - startY;
        if (Math.abs(dx) > 5 || Math.abs(dy) > 5) isDragging = true;
        if (isDragging) {
          $.container.style.left = (elLeft + dx) + 'px';
          $.container.style.top = (elTop + dy) + 'px';
          $.container.style.right = 'auto';
          $.container.style.bottom = 'auto';
        }
        e2.preventDefault();
      }
      function onUp() {
        document.removeEventListener('touchmove', onMove);
        document.removeEventListener('touchend', onUp);
        if (!isDragging) toggleChat();
      }
      document.addEventListener('touchmove', onMove, { passive: false });
      document.addEventListener('touchend', onUp);
      e.preventDefault();
    });

    // 聊天开关
    function toggleChat() {
      state.isChatOpen = !state.isChatOpen;
      $.chat.classList.toggle('open', state.isChatOpen);
      if (state.isChatOpen) {
        setMood('happy');
        if (state.isSleeping) {
          state.isSleeping = false;
          showBubble('唔...你回来啦！', 2500);
        }
        resetIdle();
        setTimeout(function() { $.input.focus(); }, 200);
      }
    }

    // 关闭按钮
    $.chat.querySelector('.ottercat-chat-close').addEventListener('click', function(e) {
      e.stopPropagation();
      state.isChatOpen = false;
      $.chat.classList.remove('open');
    });

    // 发送
    $.sendBtn.addEventListener('click', sendMsg);
    $.input.addEventListener('keydown', function(e) {
      if (e.key === 'Enter') sendMsg();
    });

    // 页面点击唤醒
    document.addEventListener('click', function(e) {
      if (state.isSleeping && !e.target.closest('.ottercat-container')) {
        wakeUp();
      }
    });
  }

  // ==========================================
  // 初始化
  // ==========================================
  function init() {
    buildWidget();
    initEvents();
    setMood('idle');
    resetIdle();

    setTimeout(function() {
      showBubble(quips[Math.floor(Math.random() * quips.length)], 4000);
    }, 2000);

    setInterval(function() {
      if (!state.isChatOpen && !state.isSleeping) {
        showBubble(quips[Math.floor(Math.random() * quips.length)], 4000);
      }
    }, 60000);

    console.log('🐱 獭猫已上线！欢迎来玩~');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();

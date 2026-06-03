import bcrypt from 'bcryptjs';
import {
  clearAdmins, createAdmin,
  clearProfile, saveProfile,
  clearSkills, saveSkills,
  clearGears, addGear,
  clearInterests, addInterest,
  clearPosts, createPost,
  clearProjects, createProject,
  clearTimelines, createTimeline,
} from './db.js';

console.log('🌱 正在初始化数据库...');

// 创建管理员账号
clearAdmins();
createAdmin(
  'admin',
  bcrypt.hashSync('admin123', 10),
  '你最喜欢的动物是什么？',
  bcrypt.hashSync('水獭猫', 10)
);
console.log('✅ 管理员账号: admin / admin123');

// 个人信息
clearProfile();
saveProfile({
  name: '爱学习的獭猫',
  title: '独立数字创作者',
  bio: '一只兼具「水獭折腾劲」与「美短猫安静气质」的数字创作者。这里是我的个人档案馆与小玩具工坊，记录我在计算机科学、独立开发以及长期主义成长道路上的足迹。',
  email: 'chenxh21edu@gmail.com',
  github: 'https://github.com/kingchen24',
});

// 技能
clearSkills();
saveSkills([
  { name: '核心计算架构', subtitle: 'PyTorch / Transformer 算子 / 硬件体系', level: 85 },
  { name: '独立轻量化开发', subtitle: 'TypeScript / Rust / Local-First 架构', level: 70 },
  { name: '极简视觉设计与插画', subtitle: 'Figma / 矢量线稿 / 原型打磨', level: 60 },
]);

// 装备
clearGears();
addGear('Screen: 27寸明基专业色彩显示器 (3000K 护眼夜间模式)');
addGear('Keyboard: HHKB Professional Type-S (静电容无声敲击)');
addGear('Fuel: 浅烘耶加雪菲单品豆 (手冲 / 维持代码高产)');
addGear('Analog: MD Paper 纸质网格草稿本 + 凌美钢笔');

// 爱好
clearInterests();
addInterest('在旧书店的旧纸张气味里消磨掉一整个无所事事的雨天下午。');
addInterest('带上一保温杯热咖啡，坐在河边安静地观察水鸟和流水的层流与湍流现象。');
addInterest('去搜集各种精美的实体复古开源徽章以及极其小众的独立印刷手账。');

// 博客文章
clearPosts();
createPost({
  title: '理解 Transformer 中的旋转位置编码 (RoPE)：从几何直觉到数学推导',
  slug: 'rope-geometric-intuition',
  summary: '最近看论文时重新推了一遍 RoPE 的复数空间旋转。这篇文章尝试不堆砌公式，而是从二维坐标旋转的几何直觉出发，一步步拆解为什么它在处理长文本外推时如此优雅...',
  content: `在处理大语言模型的长文本外推问题时，位置编码的设计往往决定了模型的生死。最近在深夜重读论文，我重新在草稿纸上推演了一遍大名鼎鼎的 **RoPE (Rotary Position Embedding)**。

## 核心思想：我们要解决什么？

传统的绝对位置编码（如 Transformer 原版中的正余弦编码）就像给每个座位贴上固定标签。但在自注意力机制中，我们真正关心的是词与词之间的**相对距离**。

## 二维空间中的几何旋转

在线性代数中，要让一个二维向量旋转一个角度 θ，我们只需要让它乘以旋转矩阵。RoPE 的精妙之处就在于，它将高维的词向量拆解成无数个两两一组的二维子空间。

## 极简 PyTorch 实现

\`\`\`python
import torch

def apply_rotary_emb(x, freqs_cis):
    x_complex = torch.view_as_complex(x.float().reshape(*x.shape[:-1], -1, 2))
    freqs_cis = freqs_cis.view(1, x_complex.shape[1], 1, x_complex.shape[-1])
    x_rotated = x_complex * freqs_cis
    return torch.view_as_real(x_rotated).flatten(-2)
\`\`\`

在深夜跑通这段测试代码后，看着损失函数曲线稳步下降，那种内心的安静是无法言喻的。这或许就是长期主义研究者最纯粹的快乐。`,
  category: '计算机科学',
  tags: JSON.stringify(['深度学习', 'Transformer', 'RoPE']),
  read_time: 12,
  word_count: 3420,
  mood: '星期三深夜',
  icon: 'cpu',
  published: 1,
});

createPost({
  title: '为什么我的独立轻量级卡片笔记工具坚持采用本地优先（Local-First）架构？',
  slug: 'local-first-card-notes',
  summary: '在云端协同泛滥的今天，聊聊我为什么花了一个月将数据完全下沉到 CRDTs 和 IndexedDB。数据隐私只是其一，那种秒开的无缝感以及不依赖网络的踏实感，才是真正的数字舒适圈...',
  content: `在云端协同泛滥的今天，我想聊聊一个看似"逆潮流"的技术选择：为什么我将自己的卡片笔记工具完全定位为本地优先（Local-First）。

## 什么是 Local-First？

简单来说，本地优先意味着：
- 数据存储在你的设备上，而非云端服务器
- 不依赖网络连接，随时随地可用
- 瞬时响应，没有网络延迟
- 你拥有数据的完全控制权

## 为什么选择这条路？

### 1. 秒开的无缝体验
当笔记保存在 IndexedDB 中时，打开应用的体验就像打开一个本地文本编辑器——不需要等待网络请求，不需要看着加载动画。

### 2. 不依赖网络的踏实感
在飞机上、地铁里、或是网络不稳定的咖啡馆，你的知识库始终可用。

### 3. 隐私是自然而然的
数据不需要经过任何第三方服务器，保密性从架构层面就得到了保证。

## 技术实现：CRDT + IndexedDB

我选择了基于 CRDT 的方案来处理未来可能的多设备同步问题。这样即使将来需要跨设备协作，也无需改变核心架构。`,
  category: '独立开发日志',
  tags: JSON.stringify(['独立开发', 'Local-First', 'CRDT']),
  read_time: 8,
  word_count: 2100,
  mood: '雨天午后',
  icon: 'beaker',
  published: 1,
});

createPost({
  title: '16位微型自定义微处理器自制记录：Verilog 仿真到波形观测分析',
  slug: '16bit-cpu-verilog',
  summary: '记录自己搭建编译环境，到手动写出微架构算术逻辑单元（ALU）的全过程。文中贴出了详细的时序仿真波形图分析，以及在解决数据冲突时的几次失败推演记录。',
  content: `记录了从零开始设计和实现一个16位微处理器的完整过程。

## 架构设计

这个小CPU包含以下核心组件：
- **ALU（算术逻辑单元）**：支持加、减、与、或、异或等基本运算
- **寄存器组**：8个16位通用寄存器
- **控制单元**：基于有限状态机的指令译码
- **指令集**：8条精简指令

## 指令集设计

| 指令 | 功能 | 格式 |
|------|------|------|
| LOAD | 从内存加载 | LOAD Rdest, [Rsrc] |
| STORE | 存储到内存 | STORE [Rdest], Rsrc |
| ADD | 加法 | ADD Rdest, Rsrc1, Rsrc2 |
| SUB | 减法 | SUB Rdest, Rsrc1, Rsrc2 |
| AND | 按位与 | AND Rdest, Rsrc1, Rsrc2 |
| OR | 按位或 | OR Rdest, Rsrc1, Rsrc2 |
| JMP | 无条件跳转 | JMP addr |
| JZ | 条件跳转 | JZ Rcond, addr |

## 遇到的坑

数据冲突（Data Hazard）是最大的挑战。当连续两条指令操作同一个寄存器时，流水线会产生错误结果。通过插入NOP气泡解决了这个问题。

这次实践让我对计算机体系结构有了更深的理解——纸上得来终觉浅，绝知此事要躬行。`,
  category: '科研白皮书',
  tags: JSON.stringify(['FPGA', 'Verilog', '计算机体系结构']),
  read_time: 15,
  word_count: 3800,
  mood: '大寒寒夜',
  icon: 'binary',
  published: 1,
});

// 项目
clearProjects();
createProject({
  title: 'OtterCat-Core (16-bit)',
  description: '在 FPGA 上用 Verilog 实现的一个简易 16 位微型处理器架构，包含了自制的 8 条核心指令集。用于治愈自己的硬件科研宅强迫症。',
  icon: 'cpu',
  tech: 'Verilog / 计算机体系结构',
  color: 'orange',
  github_url: 'https://github.com/kingchen24',
  sort_order: 0,
});
createProject({
  title: 'CozyGarden RSS',
  description: '轻量级无压力 RSS 桌面阅读器。没有花哨的算法推荐，纯粹基于本地沙盒过滤，支持卡片式"数字温室"排版，专门适合深夜安静长读。',
  icon: 'calendar-heart',
  tech: 'TypeScript / Electron',
  color: 'blue',
  sort_order: 1,
});

// 时间线
clearTimelines();
createTimeline({
  date_label: '2026.05',
  title: '开始死磕图形学与 WebGPU 核心渲染管线',
  description: '感觉有些底层的光影算法还是要在画布上跑一跑才踏实。手写了几个噪声生成器，深夜看着屏幕上泛起的算法微光，有一种独特的解压感。',
  highlight: 1,
});
createTimeline({
  date_label: '2026.04',
  title: '独立网站的 IP 角色「獭猫」形象正式敲定',
  description: '改了十几稿，终于把水獭的憨厚敏捷和美短猫的软萌安静揉在了一起。以后它就是这个数字花园的常驻首席研究员了。',
  highlight: 0,
});
createTimeline({
  date_label: '2026.02',
  title: '全面拥抱长期主义，重组并精简了个人知识库',
  description: '删掉了海量碎片化的收藏夹，退出了浮躁的技术社群，把笔记迁移回纸质框架和 Markdown 纯文本。专注才是抵抗焦虑的唯一解。',
  highlight: 0,
});

console.log('✅ 示例数据导入完成');
console.log('🚀 运行 npm run dev 启动开发服务器');
console.log('📝 管理后台: http://localhost:5173/admin');

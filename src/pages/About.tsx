import { useState, useEffect } from 'react'
import { Compass, Wrench, Antenna, MailOpen, Mail, Github } from 'lucide-react'
import { profileApi } from '@/lib/api'

export default function About() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    profileApi.get().then(setData).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="max-w-2xl mx-auto px-6 py-20 text-center text-stone-400">加载中...</div>;
  if (!data) return null;

  const { profile, skills, gears, interests } = data;

  const barColors = [
    'bg-amber-600',
    'bg-stone-700',
    'bg-stone-400',
  ];

  return (
    <div className="max-w-2xl w-full mx-auto px-6 py-8">
      {/* Profile Header */}
      <section className="flex flex-col sm:flex-row items-center sm:items-start gap-8 border-b border-stone-200/60 pb-10 mb-12">
        <div className="w-24 h-24 rounded-2xl bg-white border border-stone-200/60 p-3 flex items-center justify-center shrink-0 shadow-xs relative">
          <svg viewBox="0 0 100 100" className="w-full h-full text-stone-700" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
            <circle cx="50" cy="52" r="24" fill="#FDFBF7"/>
            <path d="M 32 38 L 36 24 L 46 32" fill="#E5E7EB"/>
            <path d="M 68 38 L 64 24 L 54 32" fill="#E5E7EB"/>
            <rect x="36" y="44" width="11" height="9" rx="1"/>
            <rect x="53" y="44" width="11" height="9" rx="1"/>
            <line x1="47" y1="48" x2="53" y2="48"/>
            <line x1="26" y1="56" x2="16" y2="54"/>
            <line x1="26" y1="60" x2="14" y2="60"/>
            <line x1="74" y1="56" x2="84" y2="54"/>
            <line x1="74" y1="60" x2="86" y2="60"/>
          </svg>
          <span className="absolute -bottom-1.5 -right-1.5 bg-amber-600 text-white text-[9px] px-1.5 py-0.5 rounded-full font-mono">Lv.26</span>
        </div>
        <div className="space-y-3 w-full text-center sm:text-left">
          <h1 className="font-serif text-2xl font-bold text-stone-900 tracking-tight">
            首席研究员：{profile?.name || '獭猫 (OtterCat)'}
          </h1>
          <p className="text-stone-500 text-sm leading-relaxed">
            {profile?.bio || '一只由「水獭的死磕折腾劲」与「美短小猫的安静长情」融合而成的数字化虚拟化身。'}
          </p>
          <div className="flex flex-wrap justify-center sm:justify-start gap-2 pt-1 font-mono text-[10px]">
            <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200/40">#深夜活跃型</span>
            <span className="px-2 py-0.5 rounded bg-stone-100 text-stone-600">#轻度科研宅</span>
            <span className="px-2 py-0.5 rounded bg-stone-100 text-stone-600">#独立开发者</span>
            <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200/40">#长期主义者</span>
          </div>
        </div>
      </section>

      {/* Skills */}
      <section className="space-y-6 mb-12">
        <h2 className="font-serif text-lg font-bold text-stone-950 flex items-center gap-2 border-b border-stone-100 pb-2">
          <Compass className="w-4 h-4 text-stone-400" /> 研究航向与实验工具箱
        </h2>
        <p className="text-sm text-stone-600 leading-relaxed">
          我不迷信过于庞大的工程架构，更偏爱那些能够被完全掌控、具有数学美感与极佳效率的底层技术。
        </p>
        <div className="space-y-4 pt-2">
          {skills?.map((s: any, i: number) => (
            <div key={s.id} className="space-y-1.5">
              <div className="flex justify-between items-baseline text-xs">
                <span className="font-medium text-stone-800 flex items-center gap-1">
                  {s.name} <span className="text-[10px] text-stone-400 font-normal">({s.subtitle})</span>
                </span>
                <span className="font-mono text-stone-400">研习进度: {s.level}%</span>
              </div>
              <div className="h-1 w-full bg-stone-100 rounded-full overflow-hidden p-[0.5px] border border-stone-200/30">
                <div className={`h-full rounded-full ${barColors[i % 3]}`} style={{ width: `${s.level}%` }}></div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Desk Setup */}
      <section className="space-y-6 mb-12 bg-stone-50/60 border border-stone-200/40 rounded-xl p-5">
        <h2 className="font-serif text-base font-bold text-stone-900 flex items-center gap-2">
          <Wrench className="w-4 h-4 text-amber-600/80" /> 深夜书桌生存装备 (Desk Setup)
        </h2>
        <p className="text-xs text-stone-500 leading-relaxed">
          这些散落在木质书桌上的实体物件，构成了我抵抗数字世界噪音的实体庇护所：
        </p>
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-stone-600 font-medium">
          {gears?.map((g: any, i: number) => (
            <li key={g.id} className="flex items-center gap-2">
              <span className={`w-1 h-1 rounded-full ${i === 0 ? 'bg-amber-500' : 'bg-stone-400'}`}></span>
              {g.name}
            </li>
          ))}
        </ul>
      </section>

      {/* Interests */}
      <section className="space-y-4 mb-12">
        <h2 className="font-serif text-lg font-bold text-stone-950 flex items-center gap-2 border-b border-stone-100 pb-2">
          <Antenna className="w-4 h-4 text-stone-400" /> 工作室外的精神辐射
        </h2>
        <p className="text-sm text-stone-600 leading-relaxed">
          当服务器编译进度条拉满、或者算法推演陷入死胡同的时候，通常可以在这些角落找到我：
        </p>
        <div className="text-xs text-stone-500 leading-relaxed pl-4 border-l border-stone-200 space-y-2 italic">
          {interests?.map((item: any) => (
            <p key={item.id}>"{item.content}"</p>
          ))}
        </div>
      </section>

      {/* Contact */}
      <section className="space-y-4">
        <h2 className="font-serif text-lg font-bold text-stone-950 flex items-center gap-2 border-b border-stone-100 pb-2">
          <MailOpen className="w-4 h-4 text-stone-400" /> 发射联络电波
        </h2>
        <p className="text-sm text-stone-600 leading-relaxed">
          如果你也喜欢在深夜安静地折腾一些奇奇怪怪的技术小玩具、或者同样是一位长期主义的独立创作者，随时欢迎向我的数字信箱投递电波：
        </p>
        <div className="pt-2 flex flex-col sm:flex-row gap-4 font-mono text-xs">
          <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-white border border-stone-200/60 text-stone-700 w-full justify-center sm:justify-start">
            <Mail className="w-4 h-4 text-stone-400" /> {profile?.email || 'chenxh21edu@gmail.com'}
          </div>
          <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-white border border-stone-200/60 text-stone-700 w-full justify-center sm:justify-start">
            <Github className="w-4 h-4 text-stone-400" /> {profile?.github || 'https://kingchen24.github.io/'}
          </div>
        </div>
      </section>
    </div>
  )
}

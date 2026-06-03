import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Code2, BookOpen, Coffee, Archive, ChevronRight, Clock, Cpu, CalendarHeart, Github, ExternalLink, Milestone, Sparkles, Binary } from 'lucide-react'
import { postsApi, projectsApi, timelinesApi } from '@/lib/api'

export default function Home() {
  const [posts, setPosts] = useState<any[]>([])
  const [projects, setProjects] = useState<any[]>([])
  const [timelines, setTimelines] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      postsApi.list(),
      projectsApi.list(),
      timelinesApi.list(),
    ]).then(([p, pr, t]) => {
      setPosts(p.slice(0, 2));
      setProjects(pr);
      setTimelines(t);
    }).finally(() => setLoading(false));
  }, []);

  const colorMap: Record<string, string> = {
    orange: 'bg-orange-400',
    blue: 'bg-blue-400',
    green: 'bg-emerald-400',
    purple: 'bg-purple-400',
    amber: 'bg-amber-400',
    red: 'bg-red-400',
  };

  const bgColorMap: Record<string, string> = {
    orange: 'bg-orange-50 text-orange-700 border-orange-100',
    blue: 'bg-blue-50 text-blue-700 border-blue-100',
    green: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    purple: 'bg-purple-50 text-purple-700 border-purple-100',
    amber: 'bg-amber-50 text-amber-700 border-amber-100',
    red: 'bg-red-50 text-red-700 border-red-100',
  };

  if (loading) {
    return <div className="max-w-4xl mx-auto px-6 py-20 text-center text-stone-400">正在翻开笔记本...</div>;
  }

  return (
    <div className="max-w-4xl w-full mx-auto px-6">
      {/* Hero */}
      <section className="py-12 md:py-20 grid grid-cols-1 md:grid-cols-12 gap-12 items-center border-b border-stone-200/60 pb-16">
        <div className="md:col-span-7 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-200/50 text-xs text-amber-800 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
            深夜的数字工作室里，灯还亮着
          </div>
          <h1 className="font-serif text-3xl md:text-4xl font-bold tracking-tight text-stone-900 leading-tight">
            构建、思考与漫长的成长。<br />
            我是<span className="text-amber-600">獭猫</span>。
          </h1>
          <p className="text-stone-600 leading-relaxed text-sm md:text-base max-w-lg">
            一只兼具「水獭折腾劲」与「美短猫安静气质」的数字创作者。这里是我的个人档案馆与小玩具工坊，记录我在计算机科学、独立开发以及长期主义成长道路上的足迹。
          </p>
          <div className="pt-2 flex items-center gap-4 text-xs text-stone-400 font-medium tracking-wide">
            <span className="flex items-center gap-1"><Code2 className="w-3.5 h-3.5" /> Code Everything</span>
            <span className="flex items-center gap-1"><BookOpen className="w-3.5 h-3.5" /> Read Papers</span>
            <span className="flex items-center gap-1"><Coffee className="w-3.5 h-3.5" /> Stay Cozy</span>
          </div>
        </div>
        <div className="md:col-span-5 flex justify-center">
          <div className="relative w-full max-w-[280px] aspect-square bg-stone-100/40 border border-stone-200/60 rounded-2xl p-6 flex items-center justify-center shadow-xs">
            <svg viewBox="0 0 200 200" className="w-full h-full text-stone-700" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M 40 40 Q 110 100 170 170 L 40 170 Z" fill="#FEF3C7" opacity="0.35" stroke="none"/>
              <line x1="20" y1="170" x2="180" y2="170" strokeWidth="2" className="text-stone-400"/>
              <path d="M 35 170 L 35 155 Q 35 110 55 100 L 70 105" />
              <path d="M 65 95 L 85 105 L 75 115 L 55 105 Z" fill="#F59E0B" className="text-amber-500" strokeWidth="1"/>
              <path d="M 125 170 L 165 160 L 155 140 L 115 150 Z" fill="#FFFFFF"/>
              <line x1="128" y1="158" x2="153" y2="152" strokeWidth="1" opacity="0.4"/>
              <line x1="125" y1="152" x2="145" y2="147" strokeWidth="1" opacity="0.4"/>
              <path d="M 148 143 L 152 145 M 152 143 L 148 145" strokeWidth="0.8" opacity="0.6"/>
              <rect x="75" y="115" width="45" height="32" rx="2" fill="#2D2825" className="text-stone-800"/>
              <line x1="97" y1="147" x2="97" y2="160" />
              <line x1="87" y1="160" x2="107" y2="160" />
              <line x1="80" y1="122" x2="95" y2="122" stroke="#6EE7B7" strokeWidth="1" opacity="0.8"/>
              <line x1="80" y1="128" x2="105" y2="128" stroke="#6EE7B7" strokeWidth="1" opacity="0.8"/>
              <line x1="85" y1="134" x2="100" y2="134" stroke="#FCD34D" strokeWidth="1" opacity="0.8"/>
              <rect x="125" y="155" width="10" height="12" rx="1" fill="#D97706" className="text-amber-700"/>
              <path d="M 127 151 Q 128 147 127 145 M 131 152 Q 132 148 131 146" strokeWidth="1" className="text-amber-600"/>
              <path d="M 112 170 Q 115 142 102 135 Q 98 132 95 136" fill="#E5E7EB" strokeWidth="1.5"/>
              <path d="M 112 168 Q 130 178 128 162 Q 120 158 112 165" fill="#D1D5DB" opacity="0.8"/>
              <circle cx="100" cy="122" r="10" fill="#E5E7EB"/>
              <path d="M 92 115 L 94 109 L 98 113" fill="#E5E7EB"/>
              <path d="M 108 115 L 106 109 L 102 113" fill="#E5E7EB"/>
              <rect x="88" y="119" width="6" height="5" rx="0.5" strokeWidth="1"/>
              <rect x="96" y="119" width="6" height="5" rx="0.5" strokeWidth="1"/>
              <line x1="94" y1="121" x2="96" y2="121" strokeWidth="1"/>
              <path d="M 102 136 Q 92 142 84 145" />
              <path d="M 102 138 Q 94 144 86 148" />
            </svg>
            <Sparkles className="absolute top-4 right-4 w-4 h-4 text-amber-400/70" />
          </div>
        </div>
      </section>

      {/* Latest Notes */}
      <section id="notes" className="py-16 border-b border-stone-200/60">
        <div className="flex justify-between items-baseline mb-10">
          <h2 className="font-serif text-xl font-bold tracking-wide flex items-center gap-2 text-stone-950">
            <Archive className="w-4 h-4 text-stone-400" /> 最近的研究与笔记
          </h2>
          <Link to="/notes" className="text-xs font-medium text-amber-700 hover:text-amber-800 transition-colors flex items-center gap-0.5">
            查看全部档案馆 <ChevronRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="space-y-10">
          {posts.map((post) => {
            const tags = typeof post.tags === 'string' ? JSON.parse(post.tags) : post.tags || [];
            return (
              <Link key={post.id} to={`/notes/${post.slug}`} className="group block relative cursor-pointer">
                <div className="space-y-2">
                  <div className="flex items-center gap-3 text-xs text-stone-400">
                    <time>{post.created_at?.slice(0, 10)}</time>
                    <span>•</span>
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {post.read_time} min read</span>
                    {tags[0] && <><span>•</span><span className="px-2 py-0.5 rounded bg-stone-100 text-stone-600 font-mono text-[10px]">#{tags[0]}</span></>}
                  </div>
                  <h3 className="font-serif text-lg font-bold text-stone-900 group-hover:text-amber-700 transition-colors duration-300">
                    {post.title}
                  </h3>
                  <p className="text-stone-500 text-sm leading-relaxed max-w-3xl">
                    {post.summary}
                  </p>
                </div>
                <div className="absolute -inset-x-3 -inset-y-2 rounded-xl group-hover:bg-stone-100/40 -z-10 transition-all duration-300"></div>
              </Link>
            );
          })}
          {posts.length === 0 && <p className="text-stone-400 text-sm">还没有笔记，去管理后台发表第一篇吧。</p>}
        </div>
      </section>

      {/* Projects */}
      <section id="projects" className="py-16 border-b border-stone-200/60">
        <div className="flex justify-between items-baseline mb-10">
          <h2 className="font-serif text-xl font-bold tracking-wide flex items-center gap-2 text-stone-950">
            <Binary className="w-4 h-4 text-stone-400" /> 折腾的小玩具与实验
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {projects.map((proj) => (
            <div key={proj.id} className="group border border-stone-200/60 hover:border-stone-300 rounded-xl p-5 bg-white/50 hover:bg-white transition-all duration-300 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <div className={`p-2 rounded-lg border ${bgColorMap[proj.color] || 'bg-stone-100 text-stone-600 border-stone-200/40'}`}>
                    {proj.icon === 'cpu' ? <Cpu className="w-4 h-4" /> :
                     proj.icon === 'calendar-heart' ? <CalendarHeart className="w-4 h-4" /> :
                     <Binary className="w-4 h-4" />}
                  </div>
                  {proj.github_url && (
                    <a href={proj.github_url} target="_blank" rel="noopener noreferrer" className="text-stone-400 hover:text-stone-600 transition-colors">
                      <Github className="w-4 h-4" />
                    </a>
                  )}
                </div>
                <h3 className="font-serif font-bold text-stone-900 group-hover:text-amber-700 transition-colors">{proj.title}</h3>
                <p className="text-stone-500 text-xs leading-relaxed">{proj.description}</p>
              </div>
              <div className="pt-4 flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${colorMap[proj.color] || 'bg-stone-400'}`}></span>
                <span className="text-[11px] font-mono text-stone-400">{proj.tech}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Timeline */}
      <section id="journey" className="py-16">
        <h2 className="font-serif text-xl font-bold tracking-wide flex items-center gap-2 text-stone-950 mb-10">
          <Milestone className="w-4 h-4 text-stone-400" /> 獭猫的成长碎碎念
        </h2>
        <div className="relative border-l border-stone-200/80 ml-2 pl-6 space-y-8">
          {timelines.map((t) => (
            <div key={t.id} className="relative">
              <span className={`absolute -left-[30px] top-1 w-2.5 h-2.5 rounded-full border-2 ${t.highlight ? 'border-amber-600' : 'border-stone-400'} bg-white`}></span>
              <div className="space-y-1">
                <span className={`text-xs font-mono font-semibold ${t.highlight ? 'text-amber-700' : 'text-stone-400'}`}>{t.date_label}</span>
                <h4 className="text-sm font-semibold text-stone-900">{t.title}</h4>
                <p className="text-xs text-stone-500 leading-relaxed max-w-2xl">{t.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ChevronRight, Clock, PenTool, Lightbulb, Copyright } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import { postsApi } from '@/lib/api'

export default function BlogDetail() {
  const { slug } = useParams()
  const [post, setPost] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (slug) {
      postsApi.getBySlug(slug).then(setPost).catch(() => setPost(null)).finally(() => setLoading(false));
    }
  }, [slug]);

  if (loading) return <div className="max-w-4xl mx-auto px-6 py-20 text-center text-stone-400">正在展开手稿...</div>;
  if (!post) return <div className="max-w-4xl mx-auto px-6 py-20 text-center text-stone-400">手稿未找到</div>;

  const tags = typeof post.tags === 'string' ? JSON.parse(post.tags) : post.tags || [];

  return (
    <div className="max-w-4xl w-full mx-auto px-6 py-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-stone-400 mb-6 font-medium">
        <Link to="/" className="hover:text-stone-600">首页</Link>
        <ChevronRight className="w-3 h-3" />
        <Link to="/notes" className="hover:text-stone-600">档案馆</Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-stone-500 truncate">正文手稿</span>
      </div>

      {/* Article Header */}
      <header className="border-b border-stone-200/60 pb-8 mb-10 space-y-4">
        <div className="flex flex-wrap items-center gap-3 text-xs text-stone-400">
          <time className="font-mono bg-stone-100 px-2 py-0.5 rounded text-stone-600">{post.created_at?.slice(0, 10)}</time>
          <span>·</span>
          <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {post.read_time} min read</span>
          <span>·</span>
          <span className="flex items-center gap-1"><PenTool className="w-3.5 h-3.5" /> {post.word_count || '?'} 字</span>
          <span>·</span>
          {tags[0] && <span className="text-amber-700 font-medium">#{tags[0]}</span>}
        </div>
        <h1 className="font-serif text-2xl md:text-3xl font-bold text-stone-900 leading-tight tracking-tight">
          {post.title}
        </h1>
        <div className="flex items-center gap-2 pt-2">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-sm bg-emerald-50 text-[10px] font-medium text-emerald-800 border border-emerald-200/40">
            <span className="w-1 h-1 rounded-full bg-emerald-500"></span> 数字花园长期维护中
          </span>
        </div>
      </header>

      {/* Article Body */}
      <article className="max-w-2xl mx-auto prose prose-stone prose-lg">
        <ReactMarkdown
          components={{
            h2: ({ children }) => (
              <h2 className="font-serif text-xl font-bold text-stone-900 pt-6 pb-2 border-b border-stone-100 flex items-center gap-2">
                {children}
              </h2>
            ),
            h3: ({ children }) => (
              <h3 className="font-serif text-lg font-bold text-stone-900 pt-4">{children}</h3>
            ),
            p: ({ children }) => (
              <p className="text-stone-800 leading-relaxed tracking-wide mb-4">{children}</p>
            ),
            code: ({ children, className }) => {
              const isInline = !className;
              return isInline ? (
                <code className="bg-stone-100 text-amber-700 px-1.5 py-0.5 rounded text-sm font-mono">{children}</code>
              ) : (
                <div className="rounded-xl overflow-hidden bg-[#221E1C] border border-stone-800 my-6 shadow-sm">
                  <div className="flex justify-between items-center px-4 py-2.5 bg-[#1A1715] border-b border-stone-800 text-xs font-mono text-stone-400">
                    <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-orange-500/80"></span> code</span>
                  </div>
                  <pre className="p-4 overflow-x-auto text-xs font-mono leading-relaxed text-stone-200">
                    <code>{children}</code>
                  </pre>
                </div>
              );
            },
            blockquote: ({ children }) => (
              <blockquote className="bg-amber-50/40 border-l-2 border-amber-600 px-4 py-3 my-4 rounded-r-lg text-sm text-stone-700">
                {children}
              </blockquote>
            ),
            strong: ({ children }) => <strong className="text-stone-900 font-semibold">{children}</strong>,
            table: ({ children }) => (
              <div className="overflow-x-auto my-4">
                <table className="w-full text-sm border-collapse border border-stone-200 rounded-lg">{children}</table>
              </div>
            ),
            th: ({ children }) => <th className="border border-stone-200 px-3 py-2 bg-stone-50 text-left font-medium text-stone-700">{children}</th>,
            td: ({ children }) => <td className="border border-stone-200 px-3 py-2 text-stone-600">{children}</td>,
          }}>
          {post.content}
        </ReactMarkdown>
      </article>

      {/* Footer */}
      <div className="max-w-2xl mx-auto mt-16 pt-6 border-t border-stone-200/60 text-xs text-stone-400 space-y-6">
        <div className="bg-stone-50 border border-stone-200/40 rounded-xl p-4 flex items-start gap-3">
          <Copyright className="w-4 h-4 text-stone-400 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            本手稿采用 <span className="text-stone-700 underline cursor-pointer">CC BY-NC-SA 4.0</span> 许可协议。属于獭猫的个人公开学习笔记，转载请保留数字工作室出处。
          </p>
        </div>
        <div className="flex justify-center">
          <Link to="/notes" className="text-stone-500 hover:text-stone-900 transition-colors flex items-center gap-1">
            ← 返回档案馆
          </Link>
        </div>
      </div>
    </div>
  )
}

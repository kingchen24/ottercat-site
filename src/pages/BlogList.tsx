import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Layers, Search, Clock, Cpu, Beaker, Binary, Tags, ChevronLeft, ChevronRight } from 'lucide-react'
import { postsApi } from '@/lib/api'

const iconMap: Record<string, any> = { cpu: Cpu, beaker: Beaker, binary: Binary };
const PAGE_SIZE = 8;

export default function BlogList() {
  const [posts, setPosts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState('全部')
  const [activeTag, setActiveTag] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    postsApi.list().then(setPosts).finally(() => setLoading(false));
  }, []);

  // 当筛选条件变化时重置到第1页
  useEffect(() => { setCurrentPage(1); }, [search, activeCategory, activeTag]);

  const categories = ['全部', ...new Set(posts.map(p => p.category))];
  const allTags = [...new Set(posts.flatMap(p => {
    const tags = typeof p.tags === 'string' ? JSON.parse(p.tags) : p.tags || [];
    return tags;
  }))];

  const filtered = posts.filter(p => {
    const matchSearch = !search || p.title.includes(search) || p.summary?.includes(search) || p.category?.includes(search);
    const matchCategory = activeCategory === '全部' || p.category === activeCategory;
    const matchTag = !activeTag || (typeof p.tags === 'string' ? JSON.parse(p.tags) : p.tags || []).includes(activeTag);
    return matchSearch && matchCategory && matchTag;
  });

  // 分页
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginatedPosts = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const handleTagClick = (tag: string) => {
    setActiveTag(prev => prev === tag ? null : tag);
  };

  if (loading) return <div className="max-w-4xl mx-auto px-6 py-20 text-center text-stone-400">正在翻找档案...</div>;

  return (
    <div className="max-w-4xl w-full mx-auto px-6 py-8">
      <div className="border-b border-stone-200/60 pb-8 mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <h1 className="font-serif text-2xl md:text-3xl font-bold text-stone-900 tracking-tight">学习档案馆</h1>
          <p className="text-xs text-stone-400 font-medium flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5" /> 截至今日已安稳封存了 {posts.length} 篇技术手稿与实验观测。
          </p>
        </div>
        <div className="relative w-full md:w-64">
          <input
            type="text" placeholder="翻阅手稿记录..."
            value={search} onChange={e => setSearch(e.target.value)}
            className="w-full text-xs px-3 py-2 pl-8 rounded-lg bg-stone-100/60 border border-stone-200/60 placeholder-stone-400 focus:outline-none focus:border-stone-400 focus:bg-white transition-all duration-300 text-stone-800"
          />
          <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
        </div>
      </div>

      {/* Categories */}
      <div className="space-y-4 mb-12">
        <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-stone-500 border-b border-stone-100 pb-3">
          <span className="text-stone-400 mr-2">分类索引:</span>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1 rounded-md transition-colors ${activeCategory === cat ? 'bg-stone-200/60 text-stone-900' : 'hover:bg-stone-100 hover:text-stone-900'}`}
            >
              {cat} ({cat === '全部' ? posts.length : posts.filter(p => p.category === cat).length})
            </button>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
          <span className="mr-1 text-stone-400"><Tags className="w-3 h-3 inline mr-0.5" /> 细分过滤:</span>
          {allTags.map(tag => (
            <button
              key={tag}
              onClick={() => handleTagClick(tag)}
              className={`px-2 py-0.5 rounded border transition-colors cursor-pointer ${
                activeTag === tag
                  ? 'bg-amber-100 border-amber-300 text-amber-700 font-medium'
                  : 'border-stone-200/40 text-stone-500 hover:border-stone-400 hover:text-stone-700 hover:bg-stone-50'
              }`}
            >
              #{tag}
            </button>
          ))}
        </div>
      </div>

      {/* Posts List */}
      <div className="space-y-12">
        {paginatedPosts.map(post => {
          const tags = typeof post.tags === 'string' ? JSON.parse(post.tags) : post.tags || [];
          const Icon = iconMap[post.icon] || Cpu;
          return (
            <article key={post.id} className="group relative flex flex-col md:grid md:grid-cols-12 gap-2 md:gap-6 items-start">
              <div className="md:col-span-2 flex md:flex-col items-center md:items-start gap-2 md:gap-0.5 text-xs font-mono text-stone-400 pt-1">
                <time className="font-semibold text-stone-500">{post.created_at?.slice(0, 10)}</time>
                <span className="md:hidden">•</span>
                <span className="text-[11px]">{post.mood || ''}</span>
              </div>
              <div className="md:col-span-10 space-y-2.5 w-full">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2 text-xs text-stone-400">
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {post.read_time} min read</span>
                    <span>•</span>
                    <span className="text-stone-500">{post.category}</span>
                  </div>
                  <div className="text-stone-300 group-hover:text-amber-600/60 transition-colors duration-500">
                    <Icon className="w-4 h-4" strokeWidth={1.5} />
                  </div>
                </div>
                <Link to={`/notes/${post.slug}`} className="block">
                  <h2 className="font-serif text-xl font-bold text-stone-900 group-hover:text-amber-700 transition-colors duration-300 leading-snug">
                    {post.title}
                  </h2>
                </Link>
                <p className="text-stone-500 text-sm leading-relaxed max-w-2xl">{post.summary}</p>
                {tags.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    {tags.map((tag: string) => (
                      <span
                        key={tag}
                        onClick={(e) => { e.stopPropagation(); handleTagClick(tag); }}
                        className={`text-[11px] px-1.5 py-0.5 rounded cursor-pointer transition-colors ${
                          activeTag === tag
                            ? 'bg-amber-100 text-amber-700 font-medium'
                            : 'text-stone-400 hover:bg-stone-100 hover:text-stone-600'
                        }`}
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div className="absolute -inset-x-4 -inset-y-3 rounded-xl group-hover:bg-stone-100/40 -z-10 transition-all duration-300"></div>
            </article>
          );
        })}
        {filtered.length === 0 && (
          <p className="text-center text-stone-400 py-12">没有找到匹配的手稿记录</p>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 pt-8 mt-8 border-t border-stone-100">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className={`flex items-center gap-1 px-3 py-1.5 text-xs rounded-lg border transition-colors ${
              currentPage === 1
                ? 'border-stone-100 text-stone-300 cursor-not-allowed'
                : 'border-stone-200 text-stone-500 hover:border-stone-400 hover:text-stone-800 hover:bg-stone-50'
            }`}
          >
            <ChevronLeft className="w-3.5 h-3.5" /> 上一页
          </button>

          <div className="flex items-center gap-1.5">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`w-8 h-8 text-xs rounded-lg font-medium transition-colors ${
                  page === currentPage
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'text-stone-500 hover:bg-stone-100 hover:text-stone-800'
                }`}
              >
                {page}
              </button>
            ))}
          </div>

          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className={`flex items-center gap-1 px-3 py-1.5 text-xs rounded-lg border transition-colors ${
              currentPage === totalPages
                ? 'border-stone-100 text-stone-300 cursor-not-allowed'
                : 'border-stone-200 text-stone-500 hover:border-stone-400 hover:text-stone-800 hover:bg-stone-50'
            }`}
          >
            下一页 <ChevronRight className="w-3.5 h-3.5" />
          </button>

          <span className="ml-2 text-[11px] text-stone-400">
            第 {currentPage}/{totalPages} 页，共 {filtered.length} 篇
          </span>
        </div>
      )}
    </div>
  )
}

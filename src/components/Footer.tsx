import { Github, Mail, Rss } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="border-t border-stone-200/60 bg-stone-50/50 mt-12 py-10 text-stone-400 text-xs">
      <div className="max-w-4xl w-full mx-auto px-6 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div>
          © 2026 爱学习的獭猫. 慢火慢熬的数字花园.
        </div>
        <div className="flex items-center gap-6">
          <a href="https://github.com/kingchen24" className="hover:text-stone-700 transition-colors flex items-center gap-1">
            <Github className="w-3.5 h-3.5" /> GitHub
          </a>
          <a href="mailto:chenxh21edu@gmail.com" className="hover:text-stone-700 transition-colors flex items-center gap-1">
            <Mail className="w-3.5 h-3.5" /> Email
          </a>
          <a href="#" className="hover:text-stone-700 transition-colors flex items-center gap-1">
            <Rss className="w-3.5 h-3.5" /> RSS
          </a>
        </div>
      </div>
    </footer>
  )
}

import { Link, useLocation } from 'react-router-dom'
import { Cat } from 'lucide-react'

export default function Header() {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="max-w-4xl w-full mx-auto px-6 py-8 flex justify-between items-center">
      <Link to="/" className="font-serif text-xl font-bold tracking-wider hover:text-amber-700 transition-colors duration-300 flex items-center gap-2 text-charcoal">
        <Cat className="w-5 h-5" /> 爱学习的獭猫
      </Link>
      <nav className="flex items-center gap-8 text-sm font-medium text-stone-500">
        <Link
          to="/notes"
          className={`hover:text-stone-900 transition-colors duration-300 ${isActive('/notes') ? 'text-stone-900 border-b border-stone-800 pb-0.5' : ''}`}
        >
          Notes
        </Link>
        <a href="/#projects" className="hover:text-stone-900 transition-colors duration-300">Projects</a>
        <a href="/#journey" className="hover:text-stone-900 transition-colors duration-300">Timeline</a>
        <Link
          to="/about"
          className={`hover:text-stone-900 transition-colors duration-300 ${isActive('/about') ? 'text-stone-900 border-b border-stone-800 pb-0.5' : ''}`}
        >
          About
        </Link>
      </nav>
    </header>
  )
}

import { useState, useEffect } from 'react'
import { NavLink, Link, useLocation } from 'react-router-dom'
import {
  Inbox,
  FileText,
  Building2,
  GitBranch,
  BarChart3,
  FileSearch,
  Briefcase,
  UserCog,
  Settings,
  ShieldCheck,
  ChevronDown,
  Sparkles,
  X,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useLanguage } from '../../context/LanguageContext'

interface SidebarProps {
  mobileOpen?: boolean
  onClose?: () => void
}

function SidebarNavContent({ onClose }: { onClose?: () => void }) {
  const { user, isSuperAdmin } = useAuth()
  const { t } = useLanguage()
  const location = useLocation()

  const isAdminRouteActive = ['/bureaus', '/users', '/settings'].some((p) =>
    location.pathname.startsWith(p),
  )
  const [adminOpen, setAdminOpen] = useState(isAdminRouteActive)

  const mainNavItems = [
    { name: t('nav.my_desk'), path: '/dashboard?tab=my-desk', icon: Inbox },
    { name: t('nav.complaints'), path: '/complaints', icon: FileText },
    { name: t('nav.institutions'), path: '/institutions', icon: Building2 },
    { name: t('nav.overlaps'), path: '/overlaps', icon: GitBranch },
    { name: t('nav.reports'), path: '/reports', icon: BarChart3 },
    { name: t('nav.audit'), path: '/audit-logs', icon: FileSearch },
  ]

  const adminNavItems = [
    { name: t('nav.bureaus'), path: '/bureaus', icon: Briefcase },
    { name: t('nav.users'), path: '/users', icon: UserCog },
    { name: t('nav.settings'), path: '/settings', icon: Settings },
  ]

  return (
    <div className="flex h-full flex-col bg-navy text-white">
      <div className="flex h-16 items-center justify-between border-b border-slate-700 px-4">
        <Link
          to="/welcome"
          title="View Samanvay System Overview"
          onClick={onClose}
          className="flex items-center gap-2.5 hover:bg-slate-800/60 rounded-lg p-1 -ml-1 transition group cursor-pointer"
        >
          <img
            src="/logo.png"
            alt="Samanvay Logo"
            className="h-9 w-9 rounded-lg object-contain bg-white p-0.5 group-hover:scale-105 transition-transform shrink-0"
          />
          <div>
            <h1 className="text-sm font-bold leading-tight tracking-tight">Samanvay (समन्वय)</h1>
            <p className="text-[11px] text-slate-400 group-hover:text-amber-300 transition-colors">
              AICTE Complaint Coordination
            </p>
          </div>
        </Link>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white md:hidden"
            aria-label="Close navigation menu"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>
      <div className="bg-emerald-600 px-4 py-1.5 text-center text-[10px] font-bold tracking-wider text-white uppercase">
        {t('demo.badge')}
      </div>
      <nav className="flex-1 space-y-0.5 overflow-y-auto px-2 py-3">
        {mainNavItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={onClose}
            className={() => {
              // Custom matching for /dashboard?tab=my-desk
              const active = item.path.includes('?')
                ? location.pathname + location.search === item.path ||
                  (location.pathname === '/dashboard' && !location.search.includes('tab=') && item.path.includes('my-desk'))
                : location.pathname.startsWith(item.path) && !location.search.includes('tab=accuracy')

              return `flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors ${
                active
                  ? 'bg-slate-700 text-white font-medium'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`
            }}
          >
            <item.icon className="h-4 w-4 text-slate-400" />
            {item.name}
          </NavLink>
        ))}

        {/* Collapsed Admin Group visible only to Super Admin */}
        {isSuperAdmin && (
          <div className="mt-4 pt-3 border-t border-slate-700/60">
            <button
              type="button"
              onClick={() => setAdminOpen(!adminOpen)}
              className="flex w-full items-center justify-between rounded-md px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-slate-400 hover:bg-slate-800/60 hover:text-slate-200 transition-colors"
            >
              <span className="flex items-center gap-2">
                <ShieldCheck className="h-3.5 w-3.5 text-amber-400" />
                Admin
              </span>
              <ChevronDown
                className={`h-3.5 w-3.5 transition-transform duration-200 ${
                  adminOpen ? 'rotate-180' : ''
                }`}
              />
            </button>
            {adminOpen && (
              <div className="mt-1 space-y-0.5 pl-2">
                {adminNavItems.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={onClose}
                    className={({ isActive }) =>
                      `flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors ${
                        isActive
                          ? 'bg-slate-700 text-white font-medium'
                          : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                      }`
                    }
                  >
                    <item.icon className="h-4 w-4 text-slate-400" />
                    {item.name}
                  </NavLink>
                ))}
              </div>
            )}
          </div>
        )}
      </nav>
      <div className="p-2 border-t border-slate-800">
        <Link
          to="/welcome"
          onClick={onClose}
          className="flex items-center gap-2 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 px-3 py-2 text-xs font-semibold transition group"
        >
          <Sparkles className="h-4 w-4 text-amber-400 group-hover:scale-110 transition-transform shrink-0" />
          <span>Project Info &amp; Demo Guide</span>
        </Link>
      </div>
      <div className="border-t border-slate-700 px-4 py-3 bg-slate-900/40">
        <p className="truncate text-xs font-semibold text-slate-200">{user?.full_name}</p>
        <p className="truncate text-[11px] text-slate-400">
          {user?.role}
          {user?.bureau_name ? ` · ${user.bureau_name}` : ''}
        </p>
      </div>
    </div>
  )
}

export default function Sidebar({ mobileOpen = false, onClose }: SidebarProps) {
  // Prevent background scrolling when mobile sidebar is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [mobileOpen])

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && mobileOpen && onClose) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [mobileOpen, onClose])

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden h-full w-64 shrink-0 flex-col md:flex">
        <SidebarNavContent />
      </aside>

      {/* Mobile Drawer Overlay Backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm transition-opacity duration-300 md:hidden ${
          mobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Mobile Slide-in Drawer */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 max-w-[85vw] flex-col shadow-2xl transition-transform duration-300 ease-in-out md:hidden ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        aria-label="Mobile Navigation"
      >
        <SidebarNavContent onClose={onClose} />
      </aside>
    </>
  )
}

import { useEffect, useRef, useState } from 'react'
import {
  ArrowRight,
  Bell,
  FileText,
  GitMerge,
  Globe,
  LogOut,
  Sparkles,
  Info,
  Menu,
} from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'
import { api } from '../../lib/api'
import { useAuth } from '../../context/AuthContext'
import { useLanguage } from '../../context/LanguageContext'
import { Badge } from '../ui'
import DailyBriefingModal from '../DailyBriefingModal'

interface HeaderProps {
  onOpenMobileMenu?: () => void
}

export default function Header({ onOpenMobileMenu }: HeaderProps = {}) {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout } = useAuth()
  const { lang, setLang, t } = useLanguage()
  const [unread, setUnread] = useState(0)
  const [briefingOpen, setBriefingOpen] = useState(false)

  // Notification Quick Popover
  const [notifOpen, setNotifOpen] = useState(false)
  const [recentNotifs, setRecentNotifs] = useState<any[]>([])
  const [notifLoading, setNotifLoading] = useState(false)
  const notifRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false)
      }
    }
    document.addEventListener('mousedown', handleOutside)
    return () => document.removeEventListener('mousedown', handleOutside)
  }, [])

  const loadRecentNotifs = async () => {
    setNotifLoading(true)
    try {
      const res = await api.get<any[]>('/api/notifications', { params: { limit: 5 } })
      setRecentNotifs(res.data)
    } catch {
      //
    } finally {
      setNotifLoading(false)
    }
  }

  const toggleNotif = () => {
    const next = !notifOpen
    setNotifOpen(next)
    if (next) {
      void loadRecentNotifs()
    }
  }

  const handleQuickNotifClick = async (item: any) => {
    setNotifOpen(false)
    if (!item.read) {
      try {
        await api.post(`/api/notifications/${item.id}/read`)
        setUnread((prev) => Math.max(0, prev - 1))
      } catch {
        // non-critical
      }
    }
    const target =
      item.target_path ||
      (item.overlap_id
        ? `/overlaps?id=${item.overlap_id}`
        : item.complaint_id
        ? `/complaints?id=${item.complaint_id}`
        : item.complaint_number
        ? `/complaints?search=${encodeURIComponent(item.complaint_number)}`
        : '/notifications')
    navigate(target)
  }

  useEffect(() => {
    if (!user) return
    let active = true
    const load = async () => {
      try {
        const response = await api.get<{ unread: number }>('/api/notifications/unread-count')
        if (active) setUnread(response.data.unread)
      } catch {
        // Header badge is non-critical.
      }
    }
    void load()
    const timer = window.setInterval(load, 30000)
    return () => {
      active = false
      window.clearInterval(timer)
    }
  }, [user, location.pathname])

  const initials = (user?.full_name || '?')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('')

  const getPageTitle = () => {
    if (location.pathname === '/dashboard') return t('nav.dashboard')
    if (location.pathname === '/institutions') return t('nav.institutions')
    if (location.pathname === '/complaints') return t('nav.complaints')
    if (location.pathname === '/overlaps') return t('nav.overlaps')
    if (location.pathname === '/coordination') return t('nav.coordination')
    if (location.pathname === '/notifications') return t('nav.notifications')
    if (location.pathname === '/reports') return t('nav.reports')
    if (location.pathname === '/bureaus') return t('nav.bureaus')
    if (location.pathname === '/users') return t('nav.users')
    if (location.pathname === '/audit-logs') return t('nav.audit')
    if (location.pathname === '/settings') return t('nav.settings')
    return t('brand.name')
  }

  return (
    <header className="flex h-16 shrink-0 items-center justify-between gap-3 border-b bg-white px-3 sm:px-6">
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        {onOpenMobileMenu && (
          <button
            type="button"
            onClick={onOpenMobileMenu}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900 md:hidden transition-colors"
            aria-label="Open navigation menu"
          >
            <Menu className="h-5 w-5" />
          </button>
        )}
        <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight truncate">
          {getPageTitle()}
        </h2>
        <span className="hidden text-xs text-slate-400 lg:inline-block">|</span>
        <span className="hidden text-xs font-medium text-slate-600 lg:inline-block">
          {t('brand.subtitle')}
        </span>
      </div>
      <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
        {/* Language Toggle */}
        <button
          type="button"
          onClick={() => setLang(lang === 'en' ? 'hi' : 'en')}
          className="flex items-center gap-1.5 rounded-full border border-slate-300 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
          title="Toggle Language / भाषा बदलें"
        >
          <Globe className="h-3.5 w-3.5 text-blue-600" />
          <span>{lang === 'en' ? 'हिन्दी' : 'English'}</span>
        </button>

        <Badge className="hidden bg-emerald-100 text-emerald-800 font-medium sm:inline-flex">
          {t('demo.badge')}
        </Badge>

        {/* Daily Briefing button */}
        <button
          type="button"
          onClick={() => setBriefingOpen(true)}
          className="flex items-center gap-1.5 rounded-full border border-purple-200 bg-purple-50 px-2.5 py-1 text-xs font-semibold text-purple-700 hover:bg-purple-100 transition-colors"
          title="Daily 60-Second Briefing"
        >
          <Sparkles className="h-3.5 w-3.5 text-purple-600" />
          <span className="hidden sm:inline">Daily Briefing</span>
        </button>

        {/* Project Info / Welcome Page */}
        <button
          type="button"
          onClick={() => navigate('/welcome')}
          className="flex items-center gap-1.5 rounded-full border border-amber-300 bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-800 hover:bg-amber-100 transition-colors"
          title="Project Info &amp; System Architecture"
        >
          <Info className="h-3.5 w-3.5 text-amber-600" />
          <span className="hidden sm:inline">Project Info</span>
        </button>

        {/* Notifications Popover Trigger & Dropdown */}
        <div className="relative" ref={notifRef}>
          <button
            type="button"
            onClick={toggleNotif}
            className={`relative rounded-xl p-2 transition-colors ${
              notifOpen ? 'bg-amber-100/70 text-stone-950 ring-1 ring-amber-400' : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
            }`}
            aria-label="Notifications"
            title="Live Regulatory Alerts & Notifications"
          >
            <Bell className="h-5 w-5" />
            {unread > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-amber-500 px-1 text-[10px] font-black text-stone-950 shadow-xs animate-pulse">
                {unread > 99 ? '99+' : unread}
              </span>
            )}
          </button>

          {/* Quick Notification Dropdown */}
          {notifOpen && (
            <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 rounded-2xl border border-stone-200/90 bg-white shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="flex items-center justify-between border-b border-stone-100 bg-stone-50/80 px-4 py-3">
                <div className="flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-amber-400/20 text-amber-800 text-xs font-bold">
                    <Bell className="h-3.5 w-3.5" />
                  </span>
                  <span className="text-xs font-extrabold text-stone-900">Recent Alerts</span>
                </div>
                {unread > 0 && (
                  <span className="rounded-full bg-amber-100 border border-amber-300 px-2 py-0.5 text-[10px] font-bold text-amber-800">
                    {unread} unread
                  </span>
                )}
              </div>

              <div className="max-h-[340px] overflow-y-auto divide-y divide-stone-100">
                {notifLoading ? (
                  <div className="py-8 text-center text-xs text-stone-500 font-medium">
                    Loading alerts...
                  </div>
                ) : recentNotifs.length === 0 ? (
                  <div className="py-8 text-center text-xs text-stone-500 font-medium px-4">
                    No recent notifications.
                  </div>
                ) : (
                  recentNotifs.map((item) => {
                    const isOverlap =
                      (item.type || '').toLowerCase().includes('overlap') ||
                      item.title.toLowerCase().includes('overlap') ||
                      item.message.toLowerCase().includes('overlap') ||
                      Boolean(item.overlap_id)

                    return (
                      <div
                        key={item.id}
                        onClick={() => void handleQuickNotifClick(item)}
                        className={`p-3 transition-colors cursor-pointer flex items-start gap-2.5 hover:bg-amber-50/30 ${
                          item.read ? 'bg-white' : 'bg-amber-50/15'
                        }`}
                      >
                        <span
                          className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border text-xs ${
                            isOverlap
                              ? 'bg-amber-400/20 text-amber-800 border-amber-400/40'
                              : 'bg-blue-50 text-blue-700 border-blue-200'
                          }`}
                        >
                          {isOverlap ? <GitMerge className="h-3.5 w-3.5" /> : <FileText className="h-3.5 w-3.5" />}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-stone-900 line-clamp-1">
                            {item.title}
                          </p>
                          <p className="text-[11px] text-stone-600 line-clamp-2 mt-0.5 leading-snug">
                            {item.message}
                          </p>
                          <div className="mt-1 flex items-center justify-between text-[10px]">
                            {item.complaint_number && (
                              <span className="font-mono font-bold text-blue-700 bg-blue-50 px-1 py-0.2 rounded">
                                {item.complaint_number}
                              </span>
                            )}
                            <span className="font-bold text-amber-700 ml-auto flex items-center gap-0.5 hover:underline">
                              {isOverlap ? 'Open Overlap' : 'View Issue'} <ArrowRight className="h-2.5 w-2.5" />
                            </span>
                          </div>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>

              <div className="border-t border-stone-100 bg-stone-50/70 p-2.5 text-center">
                <button
                  type="button"
                  onClick={() => {
                    setNotifOpen(false)
                    navigate('/notifications')
                  }}
                  className="w-full rounded-xl bg-stone-900 py-1.5 text-xs font-bold text-white hover:bg-slate-800 transition-colors shadow-2xs"
                >
                  View All Alerts &amp; Notifications →
                </button>
              </div>
            </div>
          )}
        </div>
        <div className="hidden items-center gap-2 rounded-md border border-slate-200 px-2.5 py-1.5 sm:flex">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-navy text-xs font-semibold text-white">
            {initials}
          </div>
          <div className="leading-tight">
            <p className="text-xs font-semibold text-slate-900">{user?.full_name || 'AICTE Officer'}</p>
            <p className="text-[11px] text-slate-500 font-medium">{user?.role || 'Officer'}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => void logout()}
          className="flex items-center gap-1.5 rounded-md p-2 text-sm text-slate-600 hover:bg-slate-100"
          title="Sign out"
        >
          <LogOut className="h-5 w-5" />
          <span className="hidden md:inline">Sign out</span>
        </button>
      </div>

      <DailyBriefingModal
        open={briefingOpen}
        onClose={() => setBriefingOpen(false)}
      />
    </header>
  )
}

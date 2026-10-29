import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowRight,
  Bell,
  BellOff,
  CheckCheck,
  FileText,
  GitMerge,
  RefreshCw,
  ShieldAlert,
} from 'lucide-react'
import { toast } from 'sonner'
import { api, errorMessage } from '../lib/api'
import { formatDateTime, severityClass } from '../lib/utils'
import {
  Badge,
  Button,
  EmptyState,
  ErrorBanner,
  LoadingBlock,
  PageHeader,
} from '../components/ui'

interface Notification {
  id: string
  type: string | null
  title: string
  message: string
  severity: string | null
  complaint_id: string | null
  complaint_number: string | null
  overlap_id?: string | null
  target_path?: string | null
  read: boolean
  created_at: string | null
  read_at: string | null
}

export default function Notifications() {
  const navigate = useNavigate()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadOnly, setUnreadOnly] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const response = await api.get<Notification[]>('/api/notifications', {
        params: { limit: 200, ...(unreadOnly ? { unread_only: true } : {}) },
      })
      setNotifications(response.data)
    } catch (err) {
      setError(errorMessage(err))
    } finally {
      setLoading(false)
    }
  }, [unreadOnly])

  useEffect(() => {
    void load()
  }, [load])

  const markRead = async (notification: Notification) => {
    if (notification.read) return
    try {
      await api.post(`/api/notifications/${notification.id}/read`)
      setNotifications((current) =>
        current.map((item) =>
          item.id === notification.id
            ? { ...item, read: true, read_at: new Date().toISOString() }
            : item,
        ),
      )
    } catch (err) {
      toast.error(errorMessage(err))
    }
  }

  const markAllRead = async () => {
    setBusy(true)
    try {
      const response = await api.post('/api/notifications/read-all')
      toast.success(response.data.message || 'All notifications marked as read')
      await load()
    } catch (err) {
      toast.error(errorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  const getTargetUrl = (notification: Notification): string => {
    if (notification.target_path) {
      return notification.target_path
    }

    const typeStr = (notification.type || '').toLowerCase()
    const titleStr = (notification.title || '').toLowerCase()
    const msgStr = (notification.message || '').toLowerCase()

    const isOverlap =
      typeStr.includes('overlap') ||
      titleStr.includes('overlap') ||
      msgStr.includes('overlap') ||
      titleStr.includes('duplicate') ||
      msgStr.includes('duplicate')

    const isCoordination =
      typeStr.includes('coordination') ||
      titleStr.includes('coordination') ||
      msgStr.includes('coordination') ||
      typeStr.includes('transfer')

    if (isOverlap) {
      if (notification.overlap_id) {
        return `/overlaps?id=${notification.overlap_id}`
      }
      if (notification.complaint_number) {
        return `/overlaps?search=${encodeURIComponent(notification.complaint_number)}`
      }
      return '/overlaps'
    }

    if (isCoordination) {
      if (notification.overlap_id) {
        return `/overlaps?id=${notification.overlap_id}`
      }
      if (notification.complaint_number) {
        return `/coordination?search=${encodeURIComponent(notification.complaint_number)}`
      }
      return '/coordination'
    }

    if (notification.complaint_id) {
      return `/complaints?id=${notification.complaint_id}`
    }

    if (notification.complaint_number) {
      return `/complaints?search=${encodeURIComponent(notification.complaint_number)}`
    }

    return '/dashboard'
  }

  const handleNotificationClick = async (notification: Notification) => {
    // 1. Mark as read immediately
    if (!notification.read) {
      void markRead(notification)
    }

    // 2. Navigate straight to the relevant issue / overlap
    const target = getTargetUrl(notification)
    navigate(target)
  }

  const unread = notifications.filter((notification) => !notification.read).length

  return (
    <div className="space-y-6">
      <PageHeader
        title="Alerts & Notifications"
        subtitle="Live regulatory alerts, overlap warnings, case assignments and deadline escalations"
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => void load()} className="rounded-xl border-stone-300 text-stone-700 hover:bg-stone-50">
              <RefreshCw className="h-4 w-4" /> Refresh
            </Button>
            <Button variant="secondary" loading={busy} onClick={() => void markAllRead()} className="rounded-xl border-stone-300 hover:bg-stone-100">
              <CheckCheck className="h-4 w-4" /> Mark all read
            </Button>
          </div>
        }
      />

      <ErrorBanner message={error} />

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-stone-200/90 bg-white p-4 shadow-xs">
        <label className="flex items-center gap-2 text-sm font-semibold text-stone-700 cursor-pointer">
          <input
            type="checkbox"
            className="h-4 w-4 rounded border-stone-300 text-amber-500 focus:ring-amber-400"
            checked={unreadOnly}
            onChange={(event) => setUnreadOnly(event.target.checked)}
          />
          Show unread alerts only
        </label>
        <p className="text-xs font-bold text-stone-600">
          <span className="text-amber-600 font-black">{unread}</span> unread of {notifications.length} total notification(s)
        </p>
      </div>

      {loading ? (
        <div className="rounded-2xl border border-stone-200/90 bg-white p-8 shadow-xs">
          <LoadingBlock label="Loading notifications…" />
        </div>
      ) : notifications.length === 0 ? (
        <div className="rounded-2xl border border-stone-200/90 bg-white p-6 shadow-xs">
          <EmptyState
            title={unreadOnly ? 'No unread notifications' : 'No notifications yet'}
            description="Notifications appear when cases are assigned, escalated, transferred or potential cross-bureau overlaps are detected."
          />
        </div>
      ) : (
        <div className="space-y-2.5">
          {notifications.map((notification) => {
            const isOverlap =
              (notification.type || '').toLowerCase().includes('overlap') ||
              notification.title.toLowerCase().includes('overlap') ||
              notification.message.toLowerCase().includes('overlap') ||
              Boolean(notification.overlap_id)

            const isCoordination =
              (notification.type || '').toLowerCase().includes('coordination') ||
              (notification.type || '').toLowerCase().includes('transfer') ||
              notification.title.toLowerCase().includes('coordination')

            return (
              <div
                key={notification.id}
                onClick={() => void handleNotificationClick(notification)}
                className={`group flex items-start sm:items-center justify-between gap-3.5 rounded-2xl border p-4 shadow-xs transition-all duration-200 cursor-pointer ${
                  notification.read
                    ? 'border-stone-200/80 bg-white hover:border-amber-300 hover:bg-amber-50/15'
                    : 'border-amber-300/80 bg-gradient-to-r from-amber-50/60 to-white hover:border-amber-400 hover:shadow-md'
                }`}
                title="Click to jump directly to this case / overlap issue"
              >
                <div className="flex items-start gap-3.5 min-w-0 flex-1">
                  <span
                    className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border transition-transform group-hover:scale-105 ${
                      notification.read
                        ? 'bg-stone-100 text-stone-400 border-stone-200'
                        : isOverlap
                        ? 'bg-amber-400/20 text-amber-800 border-amber-400/40'
                        : isCoordination
                        ? 'bg-purple-100 text-purple-700 border-purple-200'
                        : 'bg-blue-50 text-blue-700 border-blue-200'
                    }`}
                  >
                    {isOverlap ? (
                      <GitMerge className="h-5 w-5" />
                    ) : isCoordination ? (
                      <ShieldAlert className="h-5 w-5" />
                    ) : notification.read ? (
                      <BellOff className="h-4.5 w-4.5" />
                    ) : (
                      <Bell className="h-4.5 w-4.5 text-amber-600 animate-pulse" />
                    )}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-extrabold text-stone-900 group-hover:text-amber-900 transition-colors">
                        {notification.title}
                      </p>
                      {notification.severity && (
                        <Badge className={severityClass(notification.severity)}>
                          {notification.severity}
                        </Badge>
                      )}
                      {notification.type && (
                        <span className="rounded-md bg-stone-100 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-stone-600 border border-stone-200/60">
                          {notification.type}
                        </span>
                      )}
                      {!notification.read && (
                        <span className="flex h-2 w-2 rounded-full bg-amber-500 animate-ping" aria-label="Unread" />
                      )}
                    </div>
                    <p className="mt-1 text-xs text-stone-700 leading-relaxed group-hover:text-stone-900">
                      {notification.message}
                    </p>
                    <div className="mt-1.5 flex flex-wrap items-center gap-2 text-[11px] font-medium text-stone-500">
                      <span>{formatDateTime(notification.created_at)}</span>
                      {notification.complaint_number && (
                        <>
                          <span>•</span>
                          <span className="font-mono font-bold text-blue-700 bg-blue-50 px-1.5 py-0.2 rounded border border-blue-200/60">
                            {notification.complaint_number}
                          </span>
                        </>
                      )}
                      {notification.read_at && (
                        <>
                          <span>•</span>
                          <span className="text-stone-400">Read {formatDateTime(notification.read_at)}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2 shrink-0">
                  {/* Action Direct Redirect Button */}
                  <div className="inline-flex items-center gap-1.5 rounded-xl bg-stone-900 text-white group-hover:bg-amber-400 group-hover:text-stone-950 font-bold px-3 py-1.5 text-xs shadow-xs transition-colors">
                    {isOverlap ? (
                      <>
                        <GitMerge className="h-3.5 w-3.5" />
                        <span>Open Overlap</span>
                      </>
                    ) : isCoordination ? (
                      <>
                        <ShieldAlert className="h-3.5 w-3.5" />
                        <span>Coordination Room</span>
                      </>
                    ) : (
                      <>
                        <FileText className="h-3.5 w-3.5" />
                        <span>View Issue</span>
                      </>
                    )}
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                  </div>

                  {!notification.read && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        void markRead(notification)
                      }}
                      className="rounded-lg px-2 py-1 text-[11px] font-semibold text-stone-500 hover:text-stone-900 hover:bg-stone-100 transition-colors"
                      title="Mark as read without leaving"
                    >
                      Mark read
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

import { useEffect, useState } from 'react'
import {
  ChevronRight,
  Sparkles,
  X,
  AlertTriangle,
  GitBranch,
  ShieldCheck,
  Building2,
  FileText,
  Clock,
  RefreshCw,
  Cpu,
  Layers,
  ArrowRight,
  Eye,
  EyeOff,
  Check,
  BarChart3,
  Flame,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { api, errorMessage } from '../lib/api'
import { Button } from './ui'

interface BriefingItem {
  type: string
  title: string
  description: string
  urgency: string
  case_id?: string | null
  deep_link: string
  action_label: string
}

interface DailyBriefingData {
  generated_at?: string
  officer_name?: string
  officer_bureau?: string
  read_time_seconds?: number
  headline?: string
  project_overview?: string
  executive_analysis?: string
  key_findings?: string[]
  items?: BriefingItem[]
  is_live_gemini?: boolean
  ai_source?: string
  stats?: {
    new_today?: number
    overdue_count?: number
    active_overlaps?: number
    health_score?: number
    total_complaints?: number
  }
  bureau_distribution?: Record<string, number>
  top_institutions?: Array<{ name: string; open_cases: number }>
  // Legacy compatibility fields
  date?: string
  greeting?: string
  new_cases_today?: number
  overdue_cases?: number
  pending_overlaps?: number
  summary_text?: string
  top_action_items?: Array<{ title: string; desc: string; link: string }>
}

interface DailyBriefingModalProps {
  open: boolean
  onClose: () => void
}

export default function DailyBriefingModal({ open, onClose }: DailyBriefingModalProps) {
  const navigate = useNavigate()
  const [data, setData] = useState<DailyBriefingData | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'briefing' | 'architecture' | 'gemini'>('briefing')

  // Gemini Key state
  const [geminiKeyInput, setGeminiKeyInput] = useState('')
  const [showKey, setShowKey] = useState(false)
  const [savingKey, setSavingKey] = useState(false)
  const [keyConfigured, setKeyConfigured] = useState(false)
  const [maskedKey, setMaskedKey] = useState('')

  const fetchBriefing = (customKey?: string) => {
    setLoading(true)
    const url = customKey
      ? `/api/dashboard/daily-briefing?gemini_key=${encodeURIComponent(customKey)}`
      : '/api/dashboard/daily-briefing'

    api.get<DailyBriefingData>(url)
      .then((res) => {
        setData(res.data)
      })
      .catch((err) => {
        toast.error(errorMessage(err))
      })
      .finally(() => setLoading(false))
  }

  const checkKeyStatus = () => {
    api.get<{ configured: boolean; masked_key: string }>('/api/dashboard/gemini-key/status')
      .then((res) => {
        setKeyConfigured(res.data.configured)
        setMaskedKey(res.data.masked_key)
      })
      .catch(() => {
        // Non-critical check
      })
  }

  useEffect(() => {
    if (open) {
      fetchBriefing()
      checkKeyStatus()
    }
  }, [open])

  const handleSaveGeminiKey = async () => {
    if (!geminiKeyInput.trim()) {
      toast.error('Please enter a valid Google Gemini API key')
      return
    }
    setSavingKey(true)
    try {
      const res = await api.post<{ status: string; message: string; model?: string }>(
        '/api/dashboard/gemini-key',
        { api_key: geminiKeyInput.trim() },
      )
      if (res.data.status === 'success') {
        toast.success(res.data.message || 'Gemini API key saved & verified successfully!')
        setKeyConfigured(true)
        setMaskedKey(`${geminiKeyInput.slice(0, 6)}...${geminiKeyInput.slice(-4)}`)
        setGeminiKeyInput('')
        fetchBriefing()
        setActiveTab('briefing')
      } else {
        toast.error(res.data.message || 'Failed to verify Gemini API key')
      }
    } catch (err) {
      toast.error(errorMessage(err))
    } finally {
      setSavingKey(false)
    }
  }

  if (!open) return null

  // Safely extract normalized data
  const headline =
    data?.headline ||
    data?.summary_text ||
    'Review daily cross-bureau complaints, SLA compliance and overlap decisions.'
  const overview =
    data?.project_overview ||
    'Samanvay (समन्वय) coordinates institution complaints across AICTE Regulation, PGRC, and Approval Bureaus using AI deduplication, joint consensus rooms, and an immutable hash chain.'
  const analysis =
    data?.executive_analysis ||
    'Real-time operational situational digest. Proactive review of flagged overlap pairs prevents duplicate campus inspections and contradictory regulatory orders.'

  const items: BriefingItem[] =
    data?.items && Array.isArray(data.items)
      ? data.items
      : (data?.top_action_items || []).map((it) => ({
        type: 'ACTION',
        title: it.title,
        description: it.desc,
        urgency: 'High',
        deep_link: it.link || '/dashboard',
        action_label: 'View',
      }))

  const overdueCount = data?.stats?.overdue_count ?? data?.overdue_cases ?? 0
  const activeOverlaps = data?.stats?.active_overlaps ?? data?.pending_overlaps ?? 0
  const newToday = data?.stats?.new_today ?? data?.new_cases_today ?? 0
  const healthScore = data?.stats?.health_score ?? 88
  const isLiveGemini = Boolean(data?.is_live_gemini)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3 sm:p-4 backdrop-blur-xs overflow-y-auto">
      <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Modal Top Header */}
        <div className="bg-gradient-to-r from-navy via-slate-900 to-slate-800 text-white px-5 py-4 flex items-center justify-between border-b border-slate-700 shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-purple-500/20 border border-purple-400/40 flex items-center justify-center shrink-0">
              <Sparkles className="h-5 w-5 text-purple-300 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base sm:text-lg font-bold tracking-tight text-white">
                  Daily 60-Second Officer Briefing
                </h3>
                {isLiveGemini ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 border border-emerald-400/50 px-2 py-0.5 text-[10px] font-semibold text-emerald-300">
                    <Sparkles className="h-2.5 w-2.5 text-emerald-300" />
                    Gemini 1.5 Flash Active
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/20 border border-amber-400/50 px-2 py-0.5 text-[10px] font-semibold text-amber-300">
                    <Cpu className="h-2.5 w-2.5 text-amber-300" />
                    Rule-Based Synthesis
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-300 mt-0.5">
                AICTE Samanvay Intelligence · {data?.officer_name || 'Officer'} (
                {data?.officer_bureau || 'Coordination'})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="h-8 w-8 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/60 flex items-center justify-center transition-colors"
            aria-label="Close dialog"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-4 shrink-0 text-xs font-semibold overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('briefing')}
            className={`flex items-center gap-1.5 py-2.5 px-3 border-b-2 transition-colors whitespace-nowrap ${activeTab === 'briefing'
                ? 'border-purple-600 text-purple-700 bg-white font-bold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>60s Operational Briefing</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('architecture')}
            className={`flex items-center gap-1.5 py-2.5 px-3 border-b-2 transition-colors whitespace-nowrap ${activeTab === 'architecture'
                ? 'border-blue-600 text-blue-700 bg-white font-bold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
          >
            <Layers className="h-3.5 w-3.5" />
            <span>Project Overview &amp; Architecture</span>
          </button>
          {/* <button
            type="button"
            onClick={() => setActiveTab('gemini')}
            className={`flex items-center gap-1.5 py-2.5 px-3 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'gemini'
                ? 'border-emerald-600 text-emerald-700 bg-white font-bold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Key className="h-3.5 w-3.5" />
            <span>Gemini API Key</span>
            {keyConfigured && (
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
            )}
          </button> */}
        </div>

        {/* Modal Body with Scroll */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-4">
          {loading ? (
            <div className="py-14 text-center space-y-3">
              <div className="flex justify-center">
                <RefreshCw className="h-8 w-8 text-purple-600 animate-spin" />
              </div>
              <p className="text-sm font-semibold text-slate-800">
                Synthesizing executive briefing with AI…
              </p>
              <p className="text-xs text-slate-500">
                Analyzing cross-bureau overlap clusters, disposal SLAs &amp; institutional risk indicators.
              </p>
            </div>
          ) : (
            <>
              {/* TAB 1: 60-SECOND BRIEFING */}
              {activeTab === 'briefing' && (
                <div className="space-y-4">
                  {/* Headline Banner */}
                  <div className="rounded-xl bg-gradient-to-r from-purple-50 via-indigo-50 to-blue-50 p-4 border border-purple-200/80 shadow-xs">
                    <div className="flex items-start gap-2.5">
                      <span className="p-1 rounded-md bg-purple-600 text-white shrink-0 mt-0.5">
                        <Flame className="h-3.5 w-3.5" />
                      </span>
                      <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-purple-900">
                          Executive Situation Headline
                        </h4>
                        <p className="text-sm font-semibold text-slate-900 mt-1 leading-snug">
                          {headline}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Visual KPI Mini-Ribbons */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    <div className="rounded-xl border border-red-200 bg-red-50/70 p-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-semibold text-red-700">Overdue SLA</span>
                        <AlertTriangle className="h-3.5 w-3.5 text-red-500" />
                      </div>
                      <p className="mt-1 text-lg font-bold text-red-900">{overdueCount}</p>
                      <span className="text-[10px] text-red-600">&gt;30d disposal breach</span>
                    </div>

                    <div className="rounded-xl border border-purple-200 bg-purple-50/70 p-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-semibold text-purple-700">Active Overlaps</span>
                        <GitBranch className="h-3.5 w-3.5 text-purple-500" />
                      </div>
                      <p className="mt-1 text-lg font-bold text-purple-900">{activeOverlaps}</p>
                      <span className="text-[10px] text-purple-600">Pending joint review</span>
                    </div>

                    <div className="rounded-xl border border-blue-200 bg-blue-50/70 p-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-semibold text-blue-700">New Today</span>
                        <FileText className="h-3.5 w-3.5 text-blue-500" />
                      </div>
                      <p className="mt-1 text-lg font-bold text-blue-900">{newToday}</p>
                      <span className="text-[10px] text-blue-600">Past 24 hours</span>
                    </div>

                    <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-semibold text-emerald-700">Coord. Health</span>
                        <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                      </div>
                      <p className="mt-1 text-lg font-bold text-emerald-900">{healthScore}%</p>
                      <span className="text-[10px] text-emerald-600">High regulatory trust</span>
                    </div>
                  </div>

                  {/* Gemini Executive Deep Analysis */}
                  <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-3.5">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                        <Cpu className="h-3.5 w-3.5 text-purple-600" />
                        AI Strategic Analysis &amp; Root Cause
                      </span>
                      <span className="text-[10px] text-slate-500">{data?.ai_source}</span>
                    </div>
                    <p className="text-xs text-slate-700 leading-relaxed">{analysis}</p>
                  </div>

                  {/* Key Findings */}
                  {data?.key_findings && data.key_findings.length > 0 && (
                    <div className="space-y-1.5">
                      <p className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                        Key Operational Observations:
                      </p>
                      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                        {data.key_findings.map((finding, idx) => (
                          <li
                            key={idx}
                            className="flex items-start gap-2 rounded-lg border border-slate-200 bg-white p-2 text-[11px] text-slate-700 shadow-2xs"
                          >
                            <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5" />
                            <span>{finding}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Action Items */}
                  <div className="space-y-2">
                    <p className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                      Immediate Priority Actions ({items.length}):
                    </p>
                    <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                      {items.map((item, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-3 hover:border-slate-300 transition-all shadow-2xs"
                        >
                          <div className="min-w-0 pr-2">
                            <div className="flex items-center gap-2">
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${item.urgency === 'Critical'
                                    ? 'bg-red-100 text-red-800 border border-red-200'
                                    : item.urgency === 'High'
                                      ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                      : 'bg-blue-100 text-blue-800 border border-blue-200'
                                  }`}
                              >
                                {item.type}
                              </span>
                              <p className="text-xs font-bold text-slate-900 truncate">
                                {item.title}
                              </p>
                            </div>
                            <p className="text-[11px] text-slate-600 mt-1 line-clamp-2">
                              {item.description}
                            </p>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            className="shrink-0 text-xs text-purple-700 border-purple-200 hover:bg-purple-50"
                            onClick={() => {
                              onClose()
                              navigate(item.deep_link)
                            }}
                          >
                            {item.action_label} <ChevronRight className="h-3 w-3 ml-1" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: PROJECT OVERVIEW & ARCHITECTURE VISUALS */}
              {activeTab === 'architecture' && (
                <div className="space-y-4">
                  {/* Project Overview Intro */}
                  <div className="rounded-xl border border-blue-200 bg-blue-50/60 p-4">
                    <h4 className="text-sm font-bold text-blue-950 flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-blue-700" />
                      About Samanvay (समन्वय) — AICTE Platform
                    </h4>
                    <p className="text-xs text-blue-900 mt-1.5 leading-relaxed">{overview}</p>
                  </div>

                  {/* Visual 4-Pillar Pipeline Diagram */}
                  <div>
                    <h5 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                      Core System Architecture &amp; Intelligence Pipeline
                    </h5>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-2xs hover:border-blue-300 transition-colors">
                        <div className="flex items-center gap-2">
                          <span className="h-6 w-6 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                            1
                          </span>
                          <span className="text-xs font-bold text-slate-900">
                            Unified Ingestion Engine
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600 mt-1.5 leading-relaxed">
                          Captures grievances from AICTE web portals, citizens, RTI, and bureau referrals into one deduplicated registry.
                        </p>
                      </div>

                      <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-2xs hover:border-purple-300 transition-colors">
                        <div className="flex items-center gap-2">
                          <span className="h-6 w-6 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-xs">
                            2
                          </span>
                          <span className="text-xs font-bold text-slate-900">
                            AI Semantic Overlap Detection
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600 mt-1.5 leading-relaxed">
                          Sentence transformer embeddings (`all-MiniLM-L6-v2`) discover cross-bureau conflicts, fee cartels, and duplicate cases.
                        </p>
                      </div>

                      <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-2xs hover:border-amber-300 transition-colors">
                        <div className="flex items-center gap-2">
                          <span className="h-6 w-6 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-xs">
                            3
                          </span>
                          <span className="text-xs font-bold text-slate-900">
                            Joint Coordination Rooms
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600 mt-1.5 leading-relaxed">
                          Facilitates inter-bureau agreements, preventing one bureau from closing a file while another is actively inspecting.
                        </p>
                      </div>

                      <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-2xs hover:border-emerald-300 transition-colors">
                        <div className="flex items-center gap-2">
                          <span className="h-6 w-6 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">
                            4
                          </span>
                          <span className="text-xs font-bold text-slate-900">
                            Immutable Hash-Chain Audit
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600 mt-1.5 leading-relaxed">
                          SHA-256 cryptographic chaining guarantees every transfer, joint agreement, and closure is legally unforgeable.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Live Bureau Distribution Progress Visuals */}
                  {data?.bureau_distribution && Object.keys(data.bureau_distribution).length > 0 && (
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                          <BarChart3 className="h-3.5 w-3.5 text-blue-600" />
                          Live Active Bureau Caseload
                        </span>
                        <span className="text-[11px] text-slate-500">Live DB Distribution</span>
                      </div>
                      <div className="space-y-2">
                        {Object.entries(data.bureau_distribution).map(([bureau, count]) => {
                          const total = data?.stats?.total_complaints || 10
                          const pct = Math.min(100, Math.round((count / (total || 1)) * 100))
                          return (
                            <div key={bureau} className="text-xs">
                              <div className="flex justify-between text-[11px] font-medium text-slate-700 mb-0.5">
                                <span>{bureau}</span>
                                <span className="font-bold text-slate-900">
                                  {count} active cases ({pct}%)
                                </span>
                              </div>
                              <div className="h-2 w-full rounded-full bg-slate-200 overflow-hidden">
                                <div
                                  className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-600"
                                  style={{ width: `${Math.max(8, pct)}%` }}
                                ></div>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}

                  <div className="text-center pt-2">
                    <Button
                      size="sm"
                      onClick={() => {
                        onClose()
                        navigate('/welcome')
                      }}
                      className="text-xs"
                    >
                      Explore Interactive System Guide <ArrowRight className="h-3.5 w-3.5 ml-1" />
                    </Button>
                  </div>
                </div>
              )}

              {/* TAB 3: GEMINI AI CONFIGURATION */}
              {activeTab === 'gemini' && (
                <div className="space-y-4">
                  <div className="rounded-xl border border-purple-200 bg-purple-50/60 p-4">
                    <div className="flex items-start gap-3">
                      <span className="p-2 rounded-xl bg-purple-600 text-white shrink-0">
                        <Sparkles className="h-5 w-5" />
                      </span>
                      <div>
                        <h4 className="text-sm font-bold text-purple-950">
                          Google Gemini 1.5 Flash Integration
                        </h4>
                        <p className="text-xs text-purple-900 mt-1 leading-relaxed">
                          Samanvay connects directly to Google Gemini to synthesize real-time grievance statistics, detect root causes, and produce natural language executive briefings in seconds.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Status Banner */}
                  <div className="rounded-xl border border-slate-200 bg-white p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-bold text-slate-900">Current API Status:</p>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {keyConfigured
                            ? `Active · Configured key: ${maskedKey || 'Valid'}`
                            : 'No key configured. Currently using built-in deterministic analytics.'}
                        </p>
                      </div>
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-bold ${keyConfigured
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            : 'bg-amber-100 text-amber-800 border border-amber-200'
                          }`}
                      >
                        {keyConfigured ? 'Gemini Ready' : 'Fallback Engine'}
                      </span>
                    </div>

                    <div className="mt-4 pt-4 border-t border-slate-100 space-y-3">
                      <label className="block text-xs font-bold text-slate-700">
                        Enter / Update Google Gemini API Key:
                      </label>
                      <div className="relative">
                        <input
                          type={showKey ? 'text' : 'password'}
                          value={geminiKeyInput}
                          onChange={(e) => setGeminiKeyInput(e.target.value)}
                          placeholder="AIzaSy..."
                          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs font-mono pr-10 focus:border-purple-600 focus:outline-hidden"
                        />
                        <button
                          type="button"
                          onClick={() => setShowKey(!showKey)}
                          className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
                        >
                          {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>

                      <div className="flex items-center gap-2 flex-wrap">
                        <Button
                          size="sm"
                          onClick={handleSaveGeminiKey}
                          disabled={savingKey || !geminiKeyInput.trim()}
                          className="text-xs bg-purple-600 hover:bg-purple-700 text-white"
                        >
                          {savingKey ? 'Verifying with Google…' : 'Save & Verify Key'}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => fetchBriefing()}
                          disabled={loading}
                          className="text-xs"
                        >
                          <RefreshCw className="h-3 w-3 mr-1" />
                          Regenerate Briefing
                        </Button>
                      </div>

                      <p className="text-[11px] text-slate-500">
                        Don't have a key? Get a free API key at{' '}
                        <a
                          href="https://aistudio.google.com/app/apikey"
                          target="_blank"
                          rel="noreferrer"
                          className="text-purple-600 font-semibold underline hover:text-purple-800"
                        >
                          aistudio.google.com
                        </a>{' '}
                        (takes 10 seconds, zero cost).
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Modal Footer */}
        <div className="border-t border-slate-200 bg-slate-50 px-5 py-3 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 text-[11px] text-slate-500">
            <Clock className="h-3.5 w-3.5 text-slate-400" />
            <span>Target read time: ~60 seconds</span>
          </div>
          <div className="flex items-center gap-2">
            {activeTab !== 'briefing' && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setActiveTab('briefing')}
                className="text-xs"
              >
                Back to Briefing
              </Button>
            )}
            <Button variant="primary" size="sm" onClick={onClose} className="text-xs">
              Done / Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

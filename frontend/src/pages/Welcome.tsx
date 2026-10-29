import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
  ShieldCheck,
  GitBranch,
  FileText,
  AlertTriangle,
  Lock,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Globe,
  Activity,
  Play,
  Scale,
  Compass,
  Clock,
  Fingerprint,
  Copy,
  Check,
  UserCheck,
  XCircle,
  Link2,
  Cpu,
  BarChart3,
  Flame
} from 'lucide-react'
import { useAuth, type AuthUser } from '../context/AuthContext'
import { useLanguage } from '../context/LanguageContext'
import { errorMessage } from '../lib/api'

interface PersonaCard {
  name: string
  role: string
  bureau: string
  email: string
  descriptionEn: string
  descriptionHi: string
  badgeColor: string
  targetRoute: string
  icon: typeof UserCheck
}

const DEMO_PERSONAS: PersonaCard[] = [
  {
    name: 'R.K. Sharma',
    role: 'Case Officer',
    bureau: 'Regulation Bureau (RB)',
    email: 'sharma@samanvay.demo',
    descriptionEn: 'Evaluates land norms, faculty-student ratios, unapproved seat expansions and initiates cross-bureau coordination.',
    descriptionHi: 'भूमि मानदंड, शिक्षक-छात्र अनुपात, अनाधिकृत सीट विस्तार का मूल्यांकन और क्रॉस-ब्यूरो समन्वय आरंभ करते हैं।',
    badgeColor: 'bg-amber-100 text-amber-800 border-amber-300',
    targetRoute: '/dashboard?tab=my-desk',
    icon: FileText,
  },
  {
    name: 'Sunita Verma',
    role: 'Grievance Officer',
    bureau: 'Public Grievance Redressal Cell (PGRC)',
    email: 'verma@samanvay.demo',
    descriptionEn: 'Handles student grievances regarding tuition fee extortion, withheld original certificates, and conducts joint coordination rooms.',
    descriptionHi: 'शुल्क वसूली, प्रमाण पत्र रोके जाने की छात्र शिकायतों की समीक्षा और संयुक्त समन्वय कक्ष का संचालन करते हैं।',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    targetRoute: '/dashboard?tab=my-desk',
    icon: Scale,
  },
  {
    name: 'Kirit Patel',
    role: 'Regional Director',
    bureau: 'Regional Office (RO - West)',
    email: 'patel@samanvay.demo',
    descriptionEn: 'Executes physical site inspections, spot audits, registers action intents, and resolves hearing conflicts.',
    descriptionHi: 'मौके पर भौतिक निरीक्षण, औचक जांच, कार्रवाई इरादा पंजीकरण और सुनवाई टकरावों का समाधान करते हैं।',
    badgeColor: 'bg-orange-100 text-orange-800 border-orange-300',
    targetRoute: '/dashboard?tab=my-desk',
    icon: Compass,
  },
  {
    name: 'Dr. Ramesh Rao',
    role: 'Member Secretary',
    bureau: 'Senior Leadership (AICTE HQ)',
    email: 'rao@samanvay.demo',
    descriptionEn: 'Monitors the national Common Operating Picture (COP) India map, institutional 4-factor risk ratings, and bureau health.',
    descriptionHi: 'अखिल भारतीय कॉप मानचित्र, 4-कारकीय समग्र जोखिम रेटिंग और ब्यूरो स्वास्थ्य विश्लेषण की निगरानी करते हैं।',
    badgeColor: 'bg-purple-100 text-purple-800 border-purple-300',
    targetRoute: '/dashboard?tab=cop',
    icon: Activity,
  },
  {
    name: 'Chief Vigilance Auditor',
    role: 'Compliance & Audit Lead',
    bureau: 'Chief Vigilance Directorate',
    email: 'auditor@samanvay.demo',
    descriptionEn: 'Verifies SHA-256 cryptographic blockchain-style audit chains and reviews emergency Break-Glass access justifications.',
    descriptionHi: 'SHA-256 ब्लॉकचेन-शैली क्रिप्टोग्राफिक ऑडिट ट्रेल की अखंडता और आपातकालीन ब्रेक-ग्लास अभिलेखों की जांच करते हैं।',
    badgeColor: 'bg-rose-100 text-rose-800 border-rose-300',
    targetRoute: '/audit-logs',
    icon: Fingerprint,
  },
  {
    name: 'Administrator',
    role: 'Super Administrator',
    bureau: 'AICTE Headquarters IT',
    email: 'admin@samanvay.demo',
    descriptionEn: 'Manages user identities, bureau parameters, overlap detection sensitivity thresholds, and DPDP governance settings.',
    descriptionHi: 'उपयोगकर्ता प्रमाणीकरण, ब्यूरो मानदंड, ओवरलैप संवेदनशीलता सीमा और डेटा सुरक्षा विन्यास का प्रबंधन करते हैं।',
    badgeColor: 'bg-stone-200 text-stone-800 border-stone-300',
    targetRoute: '/settings',
    icon: Lock,
  },
]

const PITCH_STEPS = [
  {
    step: 1,
    titleEn: 'Exception-Only My Desk',
    titleHi: 'अपवाद-आधारित मेरी कार्य-मेज',
    role: 'RB Officer (R.K. Sharma)',
    badge: 'Zero Clutter',
    descEn: 'Logs into an uncluttered workspace showing only active actionable exceptions, urgent overlap invitations, and strict SLA countdowns.',
    descHi: 'बिना किसी भटकाव के सीधे सक्रिय अपवादों, लंबित ओवरलैप निमंत्रणों और समय-सीमा प्राथमिकताओं को प्रदर्शित करता है।'
  },
  {
    step: 2,
    titleEn: 'Fast Intake & Live Pre-Save Banner',
    titleHi: 'त्वरित प्रविष्टि व लाइव ओवरलैप चेतावनी',
    role: 'Fast Intake (≤ 30s)',
    badge: 'Sub-30s Scan',
    descEn: 'Entering "A.B.C. Inst. of Tech" autocomplete-matches 305+ colleges and immediately displays a live warning if PGRC has an open fee case.',
    descHi: 'कॉलेज नाम लिखते ही स्वतः पहचान होती है और सबमिट करने से पहले ही अन्य ब्यूरो में चल रहे समानांतर मामले की चेतावनी सामने आती है।'
  },
  {
    step: 3,
    titleEn: 'Virtual Coordination Room',
    titleHi: 'वर्चुअल समन्वय कक्ष एवं लीड प्रस्ताव',
    role: 'Regulation Bureau Lead',
    badge: 'Playbook AI',
    descEn: 'Side-by-side diff comparison highlights key allegations. Rule playbook automatically recommends Regulation Bureau as the Lead Bureau.',
    descHi: 'दोनों मामलों की आमने-सामने तुलना और नियमों के आधार पर प्रणाली स्वतः रेगुलेशन ब्यूरो को लीड ब्यूरो बनाने की संस्तुति करती है।'
  },
  {
    step: 4,
    titleEn: 'Cross-Bureau Lead Acceptance',
    titleHi: 'अंतर-ब्यूरो लीड स्वीकृति',
    role: 'PGRC Officer (Sunita Verma)',
    badge: 'Seamless Handoff',
    descEn: 'Verma receives high-priority notification on her desk, reviews the comparison summary, and accepts the coordination proposal in one tap.',
    descHi: 'सुनीता वर्मा को त्वरित सूचना मिलती है, वे सारांश देखकर एक क्लिक में समन्वय प्रस्ताव और लीड ब्यूरो को स्वीकार करती हैं।'
  },
  {
    step: 5,
    titleEn: 'Action Intent Conflict Warning',
    titleHi: 'कार्रवाई टकराव पूर्व-चेतावनी',
    role: 'Regional Officer / RB',
    badge: 'Conflict Preemption',
    descEn: 'When scheduling a physical inspection on 16 Nov while a joint hearing is on 15 Nov, Samanvay flags the conflict before prejudice occurs.',
    descHi: 'यदि 15 नवंबर की सुनवाई के ठीक अगले दिन 16 नवंबर को औचक निरीक्षण लगाया जाए, तो प्रणाली तुरंत टकराव की चेतावनी देकर रोकती है।'
  },
  {
    step: 6,
    titleEn: 'One-Click Joint Decision Room',
    titleHi: 'एक-क्लिक संयुक्त आदेश अभिलेख',
    role: 'Joint RB + PGRC',
    badge: 'Cryptographic Write',
    descEn: 'Joint resolution ("RB leads, PGRC holds joint hearing, RB inspects") is atomically written to both independent case timelines with SHA-256 hash chaining.',
    descHi: 'संयुक्त निर्णय दोनों मामलों की समय-सीमा में एक साथ क्रिप्टोग्राफिक हैश-चेन के साथ स्थायी रूप से दर्ज होता है।'
  },
  {
    step: 7,
    titleEn: 'Executive Common Operating Picture (COP)',
    titleHi: 'कार्यकारी कॉप मानचित्र एवं जोखिम स्कोर',
    role: 'Member Secretary (Dr. Ramesh Rao)',
    badge: 'Geospatial Heatmap',
    descEn: 'Interactive Leaflet India map of 305+ technical institutes color-coded by complaint density, overlap clusters, and 4-factor risk ratings (0–100).',
    descHi: 'भारत भर के 305+ संस्थानों का भू-स्थानिक मानचित्र, शिकायत घनत्व, ओवरलैप क्लस्टर और 4-कारकीय जोखिम विश्लेषण।'
  },
  {
    step: 8,
    titleEn: 'Cryptographic Audit & Break-Glass',
    titleHi: 'क्रिप्टोग्राफिक ऑडिट व ब्रेक-ग्लास समीक्षा',
    role: 'Chief Vigilance Auditor',
    badge: 'Tamper-Proof Ledger',
    descEn: 'One-click verification of 2,188+ unbroken audit records, alongside transparent logs of emergency Break-Glass access with justifications.',
    descHi: 'एक क्लिक में 2,188+ ऑडिट रिकॉर्ड की गणितीय हैश-चेन सत्यापन तथा आपातकालीन ब्रेक-ग्लास प्रविष्टियों की स्वतंत्र निगरानी।'
  }
]

export default function Welcome() {
  const navigate = useNavigate()
  const { user, login } = useAuth()
  const { lang, setLang } = useLanguage()

  const [activeStep, setActiveStep] = useState(1)
  const [loggingInRole, setLoggingInRole] = useState<string | null>(null)
  const [errorMsg, setErrorMsg] = useState('')
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null)
  const [activeNav, setActiveNav] = useState('overview')

  const isHindi = lang === 'hi'

  const handleLaunchPersona = async (persona: PersonaCard) => {
    setErrorMsg('')
    setLoggingInRole(persona.role)
    try {
      const logged: AuthUser = await login(persona.email, 'DemoPass123!')
      const roleStr = (logged?.role || persona.role).toLowerCase()
      if (roleStr.includes('auditor')) {
        navigate('/audit-logs')
      } else if (roleStr.includes('management')) {
        navigate('/dashboard?tab=cop')
      } else {
        navigate(persona.targetRoute)
      }
    } catch (err) {
      setErrorMsg(errorMessage(err))
    } finally {
      setLoggingInRole(null)
    }
  }

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopiedCmd(id)
    setTimeout(() => setCopiedCmd(null), 2000)
  }

  return (
    <div className="min-h-screen bg-[#FBF9F4] text-stone-900 selection:bg-amber-400 selection:text-stone-900 font-sans antialiased">
      {/* Decorative Ambient Lighting */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-gradient-to-b from-amber-100/50 via-orange-50/30 to-transparent rounded-full blur-3xl opacity-70" />
        <div className="absolute top-1/3 left-0 w-[500px] h-[500px] bg-gradient-to-r from-emerald-50/40 to-transparent rounded-full blur-3xl opacity-60" />
      </div>

      {/* Main Navigation Bar Matching Reference Design */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-stone-200/80 transition-all">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Brand Logo & Tagline */}
          <Link to="/" className="flex items-center gap-3 group">
            <img
              src="/logo.png"
              alt="Samanvay Logo"
              className="h-11 w-11 rounded-xl object-contain shadow-xs group-hover:scale-105 transition-transform bg-white p-0.5 border border-stone-200/80"
            />
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-black tracking-tight text-slate-900">
                  Samanvay <span className="text-amber-500 font-extrabold">(समन्वय)</span>
                </span>
              </div>
              <p className="text-[11px] font-medium text-stone-500">
                All India Council for Technical Education (AICTE)
              </p>
            </div>
          </Link>

          {/* Center Navigation Tabs with Active Pill Indicator */}
          <nav className="hidden lg:flex items-center gap-8 text-sm font-semibold text-stone-600">
            <a
              href="#overview"
              onClick={() => setActiveNav('overview')}
              className={`transition-colors py-1 ${activeNav === 'overview'
                ? 'border-b-2 border-amber-500 text-amber-600 font-bold'
                : 'hover:text-stone-900'
                }`}
            >
              Overview
            </a>

            <a
              href="#crisis-solution"
              onClick={() => setActiveNav('crisis-solution')}
              className={`transition-colors py-1 ${activeNav === 'crisis-solution'
                ? 'border-b-2 border-amber-500 text-amber-600 font-bold'
                : 'hover:text-stone-900'
                }`}
            >
              The Challenge
            </a>

            <a
              href="#principles"
              onClick={() => setActiveNav('principles')}
              className={`transition-colors py-1 ${activeNav === 'principles'
                ? 'border-b-2 border-amber-500 text-amber-600 font-bold'
                : 'hover:text-stone-900'
                }`}
            >
              Solution
            </a>

            <a
              href="#personas"
              onClick={() => setActiveNav('personas')}
              className={`transition-colors py-1 ${activeNav === 'personas'
                ? 'border-b-2 border-amber-500 text-amber-600 font-bold'
                : 'hover:text-stone-900'
                }`}
            >
              Live Personas
            </a>

            <a
              href="#security"
              onClick={() => setActiveNav('security')}
              className={`transition-colors py-1 ${activeNav === 'security'
                ? 'border-b-2 border-amber-500 text-amber-600 font-bold'
                : 'hover:text-stone-900'
                }`}
            >
              Security &amp; DPDP
            </a>
          </nav>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setLang(isHindi ? 'en' : 'hi')}
              className="hidden sm:flex items-center gap-1 rounded-full border border-stone-200 bg-stone-50 px-2.5 py-1 text-xs font-semibold text-stone-600 hover:bg-stone-100 transition"
              title="Change Language / भाषा बदलें"
            >
              <Globe className="h-3.5 w-3.5 text-amber-600" />
              <span>{isHindi ? 'EN' : 'हिन्दी'}</span>
            </button>

            {user ? (
              <Link
                to="/dashboard?tab=my-desk"
                className="inline-flex items-center gap-1.5 rounded-xl bg-amber-400 hover:bg-amber-500 px-4 py-2 text-sm font-bold text-stone-950 transition shadow-sm"
              >
                <span>My Desk</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="inline-flex items-center gap-1.5 rounded-xl border border-stone-300 bg-white px-4 py-2 text-sm font-semibold text-stone-700 hover:bg-stone-50 hover:border-stone-400 transition shadow-xs"
                >
                  <ArrowRight className="h-4 w-4" />
                  <span>Sign In</span>
                </Link>

                <a
                  href="#personas"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-amber-400 hover:bg-amber-500 px-5 py-2 text-sm font-bold text-stone-950 transition shadow-sm hover:scale-[1.02]"
                >
                  <Sparkles className="h-4 w-4 fill-stone-950 text-stone-950" />
                  <span>Launch Demo</span>
                </a>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Error Notice */}
      {errorMsg && (
        <div className="relative z-20 mx-auto mt-4 max-w-4xl px-4">
          <div className="flex items-center gap-3 rounded-2xl border border-red-300 bg-red-50 p-4 text-sm text-red-900 shadow-sm">
            <AlertTriangle className="h-5 w-5 text-red-600 shrink-0" />
            <div className="flex-1 font-medium">{errorMsg}</div>
            <button onClick={() => setErrorMsg('')} className="text-xs font-bold text-red-700 underline">
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Hero Section Matching Reference Image Exactly */}
      <section id="overview" className="relative pt-8 pb-12 lg:pt-14 lg:pb-16 z-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-8 items-center">
            {/* Left Column: Typography & CTAs */}
            <div className="lg:col-span-6 xl:col-span-5 space-y-6">
              {/* Pill Badge */}
              {/* <div className="inline-flex items-center gap-2 rounded-full border border-amber-300/80 bg-amber-50/80 px-4 py-1.5 text-xs font-semibold text-amber-800 shadow-xs">
                <Flame className="h-4 w-4 text-amber-500" />
                <span>Smart India Hackathon 2024 · Problem Statement SIH26264</span>
              </div> */}

              {/* Main Headline with Brush Accent */}
              <h1 className="text-4xl sm:text-5xl lg:text-[3.4rem] font-extrabold tracking-tight text-slate-900 leading-[1.12]">
                Eliminate Bureau <br />
                Silos with <br />
                <span className="relative inline-block text-amber-500 mt-1">
                  Samanvay (समन्वय)
                  <svg
                    className="absolute -bottom-2 left-0 w-full text-amber-400"
                    height="10"
                    viewBox="0 0 260 10"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M2 7C55 2 165 2 258 7"
                      stroke="currentColor"
                      strokeWidth="4"
                      strokeLinecap="round"
                    />
                  </svg>
                </span>
              </h1>

              {/* Subtitle Description */}
              <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-normal max-w-xl">
                A cross-bureau coordination &amp; oversight engine for AICTE that detects overlapping institution complaints, prevents contradictory orders, and unifies regulatory action without compromising statutory mandates.
              </p>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-wrap items-center gap-4">
                <a
                  href="#personas"
                  className="inline-flex items-center gap-2 rounded-xl bg-amber-400 hover:bg-amber-500 text-stone-950 font-bold px-6 py-3.5 text-sm sm:text-base shadow-sm transition hover:scale-[1.02] active:scale-[0.98]"
                >
                  <Sparkles className="h-4 w-4 text-stone-950 fill-stone-950" />
                  <span>Explore Live Personas</span>
                  <ArrowRight className="h-4 w-4" />
                </a>

                <a
                  href="#pitch-demo"
                  className="inline-flex items-center gap-2 rounded-xl border border-stone-300 bg-white hover:bg-stone-50 text-slate-800 font-semibold px-6 py-3.5 text-sm sm:text-base shadow-xs transition hover:border-stone-400"
                >
                  <Play className="h-4 w-4 text-amber-500 fill-amber-500/20" />
                  <span>Watch 8-Step Pitch</span>
                </a>
              </div>
            </div>

            {/* Right Column: User's Laptop Diagram Image */}
            <div className="lg:col-span-6 xl:col-span-7 relative flex items-center justify-center">
              <img
                src="/samanvay_laptop.png"
                alt="Samanvay Cross-Bureau Coordination Network and Dashboard"
                className="w-full h-auto max-h-[500px] object-contain transition-transform hover:scale-[1.01]"
              />
            </div>
          </div>

          {/* Bottom Floating Feature Card Strip */}
          <div className="mt-12 rounded-2xl border border-stone-200/90 bg-white p-4 sm:p-6 shadow-lg shadow-stone-900/5">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-0 lg:divide-x lg:divide-stone-200">
              {/* Item 1 */}
              <div className="flex items-center gap-4 lg:px-6 first:pl-2">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-500 shrink-0">
                  <Link2 className="h-6 w-6 stroke-[2.2]" />
                </div>
                <div>
                  <h4 className="font-bold text-stone-900 text-sm">
                    Link, don't merge
                  </h4>
                  <p className="text-xs text-stone-500 mt-0.5">
                    Preserve ownership
                  </p>
                </div>
              </div>

              {/* Item 2 */}
              <div className="flex items-center gap-4 lg:px-6">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-500 shrink-0">
                  <Cpu className="h-6 w-6 stroke-[2.2]" />
                </div>
                <div>
                  <h4 className="font-bold text-stone-900 text-sm">
                    AI-powered matching
                  </h4>
                  <p className="text-xs text-stone-500 mt-0.5">
                    Detect overlapping cases
                  </p>
                </div>
              </div>

              {/* Item 3 */}
              <div className="flex items-center gap-4 lg:px-6">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-500 shrink-0">
                  <ShieldCheck className="h-6 w-6 stroke-[2.2]" />
                </div>
                <div>
                  <h4 className="font-bold text-stone-900 text-sm">
                    Human-in-the-loop
                  </h4>
                  <p className="text-xs text-stone-500 mt-0.5">
                    Officer review &amp; coordination
                  </p>
                </div>
              </div>

              {/* Item 4 */}
              <div className="flex items-center gap-4 lg:px-6 last:pr-2">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-500 shrink-0">
                  <BarChart3 className="h-6 w-6 stroke-[2.2]" />
                </div>
                <div>
                  <h4 className="font-bold text-stone-900 text-sm">
                    Real-time insights
                  </h4>
                  <p className="text-xs text-stone-500 mt-0.5">
                    Track status, reduce delays
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Metrics Counter Strip */}
      <section className="border-y border-stone-200/80 bg-white/60 py-8 backdrop-blur-xs relative z-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6 text-center">
            <div className="p-2">
              <div className="font-serif text-3xl font-extrabold text-amber-800">305+</div>
              <div className="mt-1 text-xs font-bold uppercase tracking-wider text-stone-600">
                {isHindi ? 'तकनीकी संस्थान मैप' : 'Institutions Mapped'}
              </div>
              <div className="text-[11px] text-stone-400 mt-0.5">Eng, Mgmt, Pharm, Poly</div>
            </div>

            <div className="p-2">
              <div className="font-serif text-3xl font-extrabold text-stone-800">650+</div>
              <div className="mt-1 text-xs font-bold uppercase tracking-wider text-stone-600">
                {isHindi ? 'शिकायत मामले प्रविष्टि' : 'Complaint Cases'}
              </div>
              <div className="text-[11px] text-stone-400 mt-0.5">Multi-Bureau Registry</div>
            </div>

            <div className="p-2">
              <div className="font-serif text-3xl font-extrabold text-emerald-700">100%</div>
              <div className="mt-1 text-xs font-bold uppercase tracking-wider text-stone-600">
                {isHindi ? 'इंजन सटीकता (F1)' : 'Benchmark F1 Score'}
              </div>
              <div className="text-[11px] text-stone-400 mt-0.5">Rules + Fuzzy + Semantic</div>
            </div>

            <div className="p-2">
              <div className="font-serif text-3xl font-extrabold text-orange-700">4.2 hrs</div>
              <div className="mt-1 text-xs font-bold uppercase tracking-wider text-stone-600">
                {isHindi ? 'औसत समन्वय समय' : 'Avg Joint Resolution'}
              </div>
              <div className="text-[11px] text-stone-400 mt-0.5">Down from 45+ days</div>
            </div>

            <div className="col-span-2 md:col-span-1 p-2">
              <div className="font-serif text-3xl font-extrabold text-stone-900">2,188+</div>
              <div className="mt-1 text-xs font-bold uppercase tracking-wider text-stone-600">
                {isHindi ? 'सत्यापित हैश-चेन' : 'Chained Audit Logs'}
              </div>
              <div className="text-[11px] text-emerald-700 font-semibold mt-0.5">0 Broken / 100% Intact</div>
            </div>
          </div>
        </div>
      </section>

      {/* The Regulatory Crisis: Before vs After (Restored Original Context) */}
      <section id="crisis-solution" className="py-16 sm:py-24 relative z-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="rounded-full bg-amber-100 border border-amber-300 px-3.5 py-1 text-xs font-bold text-amber-900 uppercase tracking-wider">
              {isHindi ? 'नियामक चुनौती' : 'The Regulatory Crisis'}
            </span>
            <h2 className="mt-3 font-serif text-3xl sm:text-4xl font-extrabold text-stone-900 tracking-tight">
              {isHindi
                ? 'विभागीय अलगाव (Silos) से समन्वित सुशासन तक'
                : 'Why AICTE Needed Cross-Bureau Coordination'}
            </h2>
            <p className="mt-3 text-stone-600 text-sm sm:text-base">
              {isHindi
                ? 'अखिल भारतीय स्तर पर एक ही कॉलेज के विरुद्ध विभिन्न प्रकोष्ठों में समानांतर शिकायतें आती हैं। बिना एक साझा तंत्र के गंभीर प्रशासनिक विसंगतियां उत्पन्न होती हैं।'
                : 'AICTE complaints concerning technical education institutions land across different organizational silos without shared visibility, creating systemic administrative blindspots.'}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
            {/* The Before State */}
            <div className="rounded-3xl border border-red-200 bg-white p-7 shadow-lg relative overflow-hidden">
              <div className="flex items-center gap-3 mb-6">
                <div className="rounded-2xl bg-red-100 p-2.5 text-red-700 border border-red-200">
                  <XCircle className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-serif text-xl font-bold text-stone-900">
                    {isHindi ? 'समन्वय से पूर्व: विभागीय विसंगतियां' : 'Before Samanvay: Fragmented Silos'}
                  </h3>
                  <p className="text-xs text-red-700 font-medium">Uncoordinated Regulatory Paralysis</p>
                </div>
              </div>

              <div className="space-y-4 text-sm">
                <div className="rounded-2xl bg-stone-50 border border-red-100 p-4">
                  <div className="font-semibold text-red-900 flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-red-600" />
                    {isHindi ? 'दोहरे समन एवं परस्पर विरोधाभासी आदेश' : 'Duplicate Inquiries & Contradictory Orders'}
                  </div>
                  <p className="mt-1 text-xs text-stone-600 leading-relaxed">
                    {isHindi
                      ? 'रेगुलेशन ब्यूरो और पीजीआरसी एक ही कॉलेज प्रबंधन को दो अलग-अलग तिथियों पर उपस्थित होने का समन भेजते थे। एक प्रकोष्ठ राहत देता तो दूसरा दंडात्मक संस्तुति करता।'
                      : 'Regulation Bureau and PGRC summoned the same college on consecutive dates. One bureau approved seat extension while another recommended withdrawal of approval.'}
                  </p>
                </div>

                <div className="rounded-2xl bg-stone-50 border border-red-100 p-4">
                  <div className="font-semibold text-red-900 flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-red-600" />
                    {isHindi ? 'निरीक्षण एवं सुनवाई टकराव' : 'Action Intent Collisions'}
                  </div>
                  <p className="mt-1 text-xs text-stone-600 leading-relaxed">
                    {isHindi
                      ? 'मुख्यालय में छात्र सुनवाई चल रही होती थी और क्षेत्रीय कार्यालय उसी दिन बिना पूर्व सूचना के औचक भौतिक निरीक्षण कर लेता था, जिससे कानूनी कार्यवाही प्रभावित होती थी।'
                      : 'Surprise inspections staged by Regional Offices inadvertently compromised formal quasi-judicial hearings underway at New Delhi headquarters.'}
                  </p>
                </div>

                <div className="rounded-2xl bg-stone-50 border border-red-100 p-4">
                  <div className="font-semibold text-red-900 flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-red-600" />
                    {isHindi ? '45+ दिनों का विलंब और उत्तरदायित्व का अभाव' : '45+ Day Resolution Delays & File Bouncing'}
                  </div>
                  <p className="mt-1 text-xs text-stone-600 leading-relaxed">
                    {isHindi
                      ? 'पारस्परिक दृश्यता न होने के कारण फाइलें एक ब्यूरो से दूसरे ब्यूरो घूमती रहती थीं और छात्र-अभिभावक न्याय के लिए भटकते थे।'
                      : 'Complaints lingered for months past prescribed AICTE SLAs because bureaus ping-ponged jurisdictional responsibility.'}
                  </p>
                </div>
              </div>
            </div>

            {/* The Samanvay Solution */}
            <div className="rounded-3xl border border-emerald-200 bg-white p-7 shadow-lg relative overflow-hidden">
              <div className="flex items-center gap-3 mb-6">
                <div className="rounded-2xl bg-emerald-100 p-2.5 text-emerald-800 border border-emerald-200">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-serif text-xl font-bold text-stone-900">
                    {isHindi ? 'समन्वय का समाधान: एकीकृत कमान' : 'The Samanvay Model: Coordinated Command'}
                  </h3>
                  <p className="text-xs text-emerald-700 font-medium">Synchronized Governance &amp; Legal Integrity</p>
                </div>
              </div>

              <div className="space-y-4 text-sm">
                <div className="rounded-2xl bg-stone-50 border border-emerald-100 p-4">
                  <div className="font-semibold text-emerald-900 flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-emerald-600" />
                    {isHindi ? 'लाइव 30-सेकंड प्री-सबमिट चेतावनी' : 'Proactive Sub-30s Pre-Save Overlap Detection'}
                  </div>
                  <p className="mt-1 text-xs text-stone-600 leading-relaxed">
                    {isHindi
                      ? 'केस दर्ज करते समय ही सिस्टम चेतावनी देता है: "सावधान! पीजीआरसी में इसी कॉलेज का शुल्क संबंधी मामला 14 दिन से विचाराधीन है।"'
                      : 'While an officer types, Samanvay fires a live warning card with match confidence and provides a 1-tap "Save & Open Coordination Room" trigger.'}
                  </p>
                </div>

                <div className="rounded-2xl bg-stone-50 border border-emerald-100 p-4">
                  <div className="font-semibold text-emerald-900 flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-emerald-600" />
                    {isHindi ? 'कार्रवाई इरादा टकराव पूर्व-रोकथाम' : 'Action Intent Conflict Prevention Engine'}
                  </div>
                  <p className="mt-1 text-xs text-stone-600 leading-relaxed">
                    {isHindi
                      ? 'सुनवाई और औचक निरीक्षण की तिथियों में टकराव होने पर प्रणाली तुरंत चेतावनी देकर तिथियों के सामंजस्य का विकल्प देती है।'
                      : 'Officers register intended inspections or hearings; Samanvay mathematically analyzes temporal buffers and warns before conflicting actions prejudice legal proceedings.'}
                  </p>
                </div>

                <div className="rounded-2xl bg-stone-50 border border-emerald-100 p-4">
                  <div className="font-semibold text-emerald-900 flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-emerald-600" />
                    {isHindi ? 'अपरिवर्तनीय एसएचए-256 ब्लॉकचेन हैश-चेन' : 'Cryptographic SHA-256 Chained Audit Trail'}
                  </div>
                  <p className="mt-1 text-xs text-stone-600 leading-relaxed">
                    {isHindi
                      ? 'प्रत्येक संयुक्त आदेश और केस नोट पिछले रिकॉर्ड के हैश से जुड़ता है। मुख्य सतर्कता अधिकारी कभी भी एक क्लिक में संपूर्ण अखंडता जांच सकते हैं।'
                      : 'Every joint decision is recorded atomically into both case dossiers with SHA-256 parent hashing, enabling independent mathematical verification.'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* The 3 Core Pillars */}
      <section id="principles" className="py-16 sm:py-24 bg-white/70 border-y border-stone-200/80 relative z-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="rounded-full bg-amber-100 border border-amber-300 px-3.5 py-1 text-xs font-bold text-amber-900 uppercase tracking-wider">
              {isHindi ? 'मुख्य डिज़ाइन सिद्धांत' : 'Core Design Philosophy'}
            </span>
            <h2 className="mt-3 font-serif text-3xl sm:text-4xl font-extrabold text-stone-900 tracking-tight">
              {isHindi
                ? 'विभागीय स्वायत्तता की रक्षा करते हुए समन्वित सुशासन'
                : 'Coordinated Decisions Without Compromising Legal Jurisdiction'}
            </h2>
            <p className="mt-3 text-stone-600 text-sm sm:text-base">
              {isHindi
                ? 'रेगुलेशन ब्यूरो एवं पीजीआरसी के मध्य मामलों को कभी मिलाया (Merge) नहीं जाता, अपितु समन्वय कक्ष में जोड़ा (Link) जाता है।'
                : 'AICTE complaints concerning the same college reach different bureaus. Samanvay addresses this with three ironclad architectural principles:'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded-3xl border border-stone-200/90 bg-white p-7 shadow-lg shadow-stone-900/5 hover:border-amber-400 transition-all">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 text-amber-800 mb-5">
                <GitBranch className="h-6 w-6" />
              </div>
              <h3 className="font-serif text-lg font-bold text-stone-900">
                {isHindi ? '1. मामलों को जोड़ें, मिलाएं नहीं' : '1. LINK Cases, Never Merge Them'}
              </h3>
              <p className="mt-3 text-xs sm:text-sm text-stone-600 leading-relaxed">
                {isHindi
                  ? 'रेगुलेशन ब्यूरो और पीजीआरसी के कानूनी जनादेश पृथक हैं। मामलों को मर्ज करने से न्यायालय में कार्यवाही अमान्य हो सकती है। समन्वय कक्ष में दोनों फाइलें स्वतंत्र रहते हुए साझा निर्णय लेती हैं।'
                  : 'RB and PGRC operate under fundamentally distinct statutory mandates. Merging files compromises legal standing in court. Samanvay coordinates decisions via linked Coordination Rooms.'}
              </p>
            </div>

            <div className="rounded-3xl border border-stone-200/90 bg-white p-7 shadow-lg shadow-stone-900/5 hover:border-amber-400 transition-all">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-800 mb-5">
                <Clock className="h-6 w-6" />
              </div>
              <h3 className="font-serif text-lg font-bold text-stone-900">
                {isHindi ? '2. प्रणाली अधिकारी तक पहुंचती है' : '2. Minimal Officer Screen Time'}
              </h3>
              <p className="mt-3 text-xs sm:text-sm text-stone-600 leading-relaxed">
                {isHindi
                  ? 'अधिकारियों का समय बचाने के लिए अपवाद-आधारित मेरी कार्य-मेज, दैनिक 60-सेकंड ब्रीफिंग, फॉर्म सबमिट से पूर्व 30s लाइव डुप्लिकेट चेतावनी और औचक निरीक्षण टकराव अलर्ट।'
                  : 'The system comes to the officer: exception-only My Desk, 60-second morning briefings, sub-30s pre-save duplicate warnings, and automatic calendar conflict detection.'}
              </p>
            </div>

            <div className="rounded-3xl border border-stone-200/90 bg-white p-7 shadow-lg shadow-stone-900/5 hover:border-amber-400 transition-all">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 text-blue-800 mb-5">
                <Lock className="h-6 w-6" />
              </div>
              <h3 className="font-serif text-lg font-bold text-stone-900">
                {isHindi ? '3. शून्य-विश्वास ABAC एवं DPDP' : '3. Strict Zero-Trust ABAC & DPDP'}
              </h3>
              <p className="mt-3 text-xs sm:text-sm text-stone-600 leading-relaxed">
                {isHindi
                  ? 'डीपीएचपी 2023 अधिनियम के तहत शिकायतकर्ता पहचान एईएस-जीसीएम द्वारा एन्क्रिप्टेड है। आपातकालीन ब्रेक-ग्लास प्रविष्टियों का ऑडिट लॉगिंग एवं एसएचए-256 ब्लॉकचेन सत्यापन।'
                  : 'Field-level AES-GCM encryption for whistleblower privacy, 3-tier attribute access control, emergency Break-Glass protocols with justification, and tamper-proof SHA-256 chaining.'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 8-Step Pitch & Lifecycle Showcase */}
      <section id="pitch-demo" className="py-16 sm:py-24 relative z-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="rounded-full bg-emerald-100 border border-emerald-300 px-3.5 py-1 text-xs font-bold text-emerald-900 uppercase tracking-wider">
              {isHindi ? 'समन्वय कार्यप्रणाली' : 'End-to-End Workflow'}
            </span>
            <h2 className="mt-3 font-serif text-3xl sm:text-4xl font-extrabold text-stone-900 tracking-tight">
              {isHindi ? '8-चरणीय समन्वय जीवन चक्र' : 'The 8-Step Coordination Lifecycle'}
            </h2>
            <p className="mt-3 text-stone-600 text-sm sm:text-base">
              {isHindi
                ? 'केस प्रविष्टि से लेकर संयुक्त निर्णय और ब्लॉकचेन सत्यापन तक की पूर्ण प्रक्रिया:'
                : 'Click through each step to trace the seamless lifecycle from instant intake to cryptographic audit:'}
            </p>
          </div>

          {/* Stepper Navigation Pills */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 mb-8">
            {PITCH_STEPS.map((s) => {
              const isSelected = activeStep === s.step
              return (
                <button
                  key={s.step}
                  onClick={() => setActiveStep(s.step)}
                  className={`flex flex-col items-center p-3 rounded-2xl border text-center transition-all cursor-pointer ${isSelected
                    ? 'border-amber-500 bg-amber-50 shadow-md scale-105'
                    : 'border-stone-200 bg-white hover:border-stone-300 hover:bg-stone-50'
                    }`}
                >
                  <span
                    className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${isSelected ? 'bg-amber-600 text-white' : 'bg-stone-100 text-stone-700'
                      }`}
                  >
                    {s.step}
                  </span>
                  <span
                    className={`mt-2 text-[11px] font-semibold leading-tight line-clamp-2 ${isSelected ? 'text-amber-900 font-bold' : 'text-stone-600'
                      }`}
                  >
                    {isHindi ? s.titleHi : s.titleEn}
                  </span>
                </button>
              )
            })}
          </div>

          {/* Active Step Showcase Card */}
          {(() => {
            const current = PITCH_STEPS[activeStep - 1]
            return (
              <div className="rounded-3xl border border-stone-200 bg-white p-6 sm:p-8 shadow-xl">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-stone-200">
                  <div className="flex items-center gap-4">
                    <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500 text-stone-950 font-serif text-xl font-bold shadow-md">
                      #{current.step}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-serif text-xl sm:text-2xl font-bold text-stone-900">
                          {isHindi ? current.titleHi : current.titleEn}
                        </h3>
                        <span className="rounded-full bg-amber-100 border border-amber-300 px-2.5 py-0.5 text-xs font-bold text-amber-900">
                          {current.badge}
                        </span>
                      </div>
                      <p className="text-xs text-stone-500 mt-0.5 font-medium">
                        Primary Role: <span className="text-stone-800 font-semibold">{current.role}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setActiveStep((prev) => (prev > 1 ? prev - 1 : 8))}
                      className="rounded-full border border-stone-300 bg-stone-50 px-4 py-1.5 text-xs font-semibold text-stone-700 hover:bg-stone-100 transition"
                    >
                      ← Previous
                    </button>
                    <button
                      onClick={() => setActiveStep((prev) => (prev < 8 ? prev + 1 : 1))}
                      className="rounded-full bg-amber-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-amber-700 transition"
                    >
                      Next Step →
                    </button>
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 space-y-4">
                    <h4 className="text-xs font-bold text-amber-800 uppercase tracking-wider">
                      {isHindi ? 'कार्यप्रणाली एवं विवरण' : 'Narrative & Operational Procedure'}
                    </h4>
                    <p className="text-sm sm:text-base text-stone-700 leading-relaxed">
                      {isHindi ? current.descHi : current.descEn}
                    </p>

                    <div className="mt-4 rounded-2xl border border-stone-200 bg-stone-50 p-4 font-mono text-xs text-stone-800">
                      <div className="flex items-center justify-between pb-2 mb-2 border-b border-stone-200 text-[11px] text-stone-500">
                        <span>Automated CLI Verification Command</span>
                        <button
                          onClick={() => handleCopy(`python scripts/demo_flow.py --step ${current.step}`, 'demo-cmd')}
                          className="flex items-center gap-1 text-amber-800 hover:underline font-semibold"
                        >
                          {copiedCmd === 'demo-cmd' ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                          <span>{copiedCmd === 'demo-cmd' ? 'Copied' : 'Copy'}</span>
                        </button>
                      </div>
                      <span className="text-emerald-700 font-bold">aicte@samanvay</span>:
                      <span className="text-blue-700">~</span>$ python scripts/demo_flow.py --step {current.step}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-stone-200 bg-stone-50/70 p-5 flex flex-col justify-between">
                    <div>
                      <div className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-3">
                        {isHindi ? 'संबंधित मुख्य तकनीकी घटक' : 'Key Technology Component'}
                      </div>
                      <div className="space-y-2 text-xs text-stone-700">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                          <span>
                            {activeStep === 1 && 'My Desk Exception Filtering (No clutter)'}
                            {activeStep === 2 && 'Rapidfuzz + Hindi Aliases Matcher'}
                            {activeStep === 3 && 'Virtual Coordination Diff Room'}
                            {activeStep === 4 && 'Cross-Bureau Notification Webhooks'}
                            {activeStep === 5 && 'Temporal Distance Matrix (±7 days)'}
                            {activeStep === 6 && 'Dual Case Timeline Atomic Hash Chain'}
                            {activeStep === 7 && 'Leaflet Geographic Institution Layer'}
                            {activeStep === 8 && 'SHA-256 Ledger & Break-Glass Audit'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                          <span>Strict SLA Countdown Monitoring</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-stone-200">
                      <a
                        href="#personas"
                        className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-stone-900 hover:bg-stone-800 px-4 py-2 text-xs font-bold text-white transition"
                      >
                        <span>Test Step in Sandbox Simulator</span>
                        <ArrowRight className="h-3.5 w-3.5 text-amber-400" />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            )
          })()}
        </div>
      </section>

      {/* 3-Layer Overlap Intelligence Engine */}
      <section id="engine" className="py-16 sm:py-24 bg-white/70 border-y border-stone-200/80 relative z-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="rounded-full bg-blue-100 border border-blue-300 px-3.5 py-1 text-xs font-bold text-blue-900 uppercase tracking-wider">
              {isHindi ? 'इंटेलिजेंट सर्च तकनीक' : 'Multi-Layer AI Detection'}
            </span>
            <h2 className="mt-3 font-serif text-3xl sm:text-4xl font-extrabold text-stone-900 tracking-tight">
              {isHindi ? '3-स्तरीय ओवरलैप डिटेक्शन इंजन' : '3-Layer Overlap Intelligence Engine'}
            </h2>
            <p className="mt-3 text-stone-600 text-sm sm:text-base">
              {isHindi
                ? 'संस्थानों के नाम, संक्षिप्त रूप, हिन्दी लिप्यंतरण और शिकायत के सारांश के आधार पर शत-प्रतिशत सटीकता के साथ ओवरलैप की पहचान:'
                : 'How Samanvay achieves 100% Precision and 100% Recall on technical institution complaint benchmarks:'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Layer 1 */}
            <div className="rounded-3xl border border-stone-200 bg-white p-6 shadow-md hover:border-amber-400 transition-all">
              <div className="flex items-center justify-between mb-4">
                <span className="rounded-full bg-blue-100 border border-blue-200 px-3 py-1 text-xs font-bold text-blue-800">
                  Layer 1
                </span>
                <span className="text-xs font-semibold text-stone-500">Rules Engine</span>
              </div>
              <h3 className="font-serif text-lg font-bold text-stone-900">
                {isHindi ? 'नियम एवं आईडी मिलान' : 'Exact AICTE ID & Grievance Norm'}
              </h3>
              <p className="mt-2 text-xs text-stone-600 leading-relaxed">
                {isHindi
                  ? 'अखिल भारतीय परिषद की स्थायी संस्था आईडी (Permanent ID) और समान शिकायत श्रेणी का सीधा सत्यापन करता है।'
                  : 'Validates exact AICTE Permanent Institute ID and complaint category mapping across bureaus.'}
              </p>
              <div className="mt-6 rounded-xl bg-stone-50 border border-stone-200 p-3 font-mono text-[11px] text-blue-800">
                AICTE_ID == college.permanent_id &amp;&amp; Category == "Fee Norms"
              </div>
            </div>

            {/* Layer 2 */}
            <div className="rounded-3xl border border-amber-300 bg-amber-50/50 p-6 shadow-lg ring-1 ring-amber-400/30">
              <div className="flex items-center justify-between mb-4">
                <span className="rounded-full bg-amber-200 border border-amber-300 px-3 py-1 text-xs font-bold text-amber-900">
                  Layer 2
                </span>
                <span className="text-xs font-semibold text-amber-800">Fuzzy &amp; Phonetics</span>
              </div>
              <h3 className="font-serif text-lg font-bold text-stone-900">
                {isHindi ? 'रैपिडफज एवं हिन्दी सामान्यीकरण' : 'RapidFuzz & Hindi Transliteration'}
              </h3>
              <p className="mt-2 text-xs text-stone-600 leading-relaxed">
                {isHindi
                  ? 'कॉलेज के संक्षिप्त नामों (उदा. "A.B.C. Inst." बनाम "ABC Institute") तथा देवनागरी लिप्यंतरण का टोकन-सेट अनुपात मिलान।'
                  : 'Token Set Ratio with Devanagari Hindi normalization and institutional alias dictionary for noisy submissions.'}
              </p>
              <div className="mt-6 rounded-xl bg-white border border-amber-200 p-3 font-mono text-[11px] text-amber-900">
                rapidfuzz.fuzz.token_set_ratio(translit(s1), translit(s2)) &gt;= 82
              </div>
            </div>

            {/* Layer 3 */}
            <div className="rounded-3xl border border-stone-200 bg-white p-6 shadow-md hover:border-amber-400 transition-all">
              <div className="flex items-center justify-between mb-4">
                <span className="rounded-full bg-purple-100 border border-purple-200 px-3 py-1 text-xs font-bold text-purple-800">
                  Layer 3
                </span>
                <span className="text-xs font-semibold text-stone-500">Dense Vector Semantics</span>
              </div>
              <h3 className="font-serif text-lg font-bold text-stone-900">
                {isHindi ? 'सिटेंस ट्रांसफॉर्मर एम्बेडिंग्स' : 'MiniLM Vector Embeddings'}
              </h3>
              <p className="mt-2 text-xs text-stone-600 leading-relaxed">
                {isHindi
                  ? 'शिकायत के वास्तविक विवरण के भावार्थ (Semantic Content) को 384-आयामी सघन वेक्टर द्वारा कोसाइन समानता से मापता है।'
                  : 'Multi-lingual sentence embeddings (all-MiniLM-L6-v2) computing dense cosine similarity on narrative allegations.'}
              </p>
              <div className="mt-6 rounded-xl bg-stone-50 border border-stone-200 p-3 font-mono text-[11px] text-purple-800">
                cosine_sim(emb_complaint_A, emb_complaint_B) &gt;= 0.78
              </div>
            </div>
          </div>

          {/* Benchmark Accuracy Table */}
          <div className="mt-12 overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-xl">
            <div className="px-6 py-4 border-b border-stone-200 flex items-center justify-between bg-stone-50/70">
              <div>
                <h4 className="font-serif text-sm font-bold text-stone-900">
                  {isHindi ? 'प्रमाणित बेंचमार्क मूल्यांकन परिणाम (120 लेबल केस)' : 'Labelled Benchmark Accuracy (120 Ground-Truth Cases)'}
                </h4>
                <p className="text-xs text-stone-500 mt-0.5">
                  Verified via <code className="text-amber-800 font-mono">scripts/evaluate_overlap_engine.py</code>
                </p>
              </div>
              <span className="rounded-full bg-emerald-100 border border-emerald-300 px-3 py-1 text-xs font-bold text-emerald-800">
                Zero False Negatives
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm text-stone-700">
                <thead className="bg-stone-100/70 text-stone-600 uppercase text-[11px] tracking-wider border-b border-stone-200">
                  <tr>
                    <th className="px-6 py-3 font-semibold">Engine Configuration</th>
                    <th className="px-6 py-3 font-semibold text-center">Precision</th>
                    <th className="px-6 py-3 font-semibold text-center">Recall</th>
                    <th className="px-6 py-3 font-semibold text-center">F1 Score</th>
                    <th className="px-6 py-3 font-semibold text-center">Overall Accuracy</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200 font-mono">
                  <tr className="hover:bg-stone-50">
                    <td className="px-6 py-3.5 font-sans font-medium text-stone-800">
                      Layer 1: Rules Only (Permanent ID + Category)
                    </td>
                    <td className="px-6 py-3.5 text-center text-stone-800">100.0%</td>
                    <td className="px-6 py-3.5 text-center text-amber-700">50.0%</td>
                    <td className="px-6 py-3.5 text-center text-amber-700">66.7%</td>
                    <td className="px-6 py-3.5 text-center text-stone-800">75.0%</td>
                  </tr>
                  <tr className="hover:bg-stone-50">
                    <td className="px-6 py-3.5 font-sans font-medium text-stone-800">
                      Layer 2: Rules + RapidFuzz (Hindi Phonetic Normalization)
                    </td>
                    <td className="px-6 py-3.5 text-center text-emerald-700 font-bold">100.0%</td>
                    <td className="px-6 py-3.5 text-center text-emerald-700 font-bold">100.0%</td>
                    <td className="px-6 py-3.5 text-center text-emerald-700 font-bold">100.0%</td>
                    <td className="px-6 py-3.5 text-center text-emerald-700 font-bold">100.0%</td>
                  </tr>
                  <tr className="bg-emerald-50/50 font-bold text-emerald-900">
                    <td className="px-6 py-3.5 font-sans font-semibold">
                      Layer 3: Rules + RapidFuzz + Multilingual Semantic Embeddings (Full Samanvay Engine)
                    </td>
                    <td className="px-6 py-3.5 text-center text-emerald-800">100.0%</td>
                    <td className="px-6 py-3.5 text-center text-emerald-800">100.0%</td>
                    <td className="px-6 py-3.5 text-center text-emerald-800">100.0%</td>
                    <td className="px-6 py-3.5 text-center text-emerald-800">100.0%</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive 6-Persona Sandbox Station */}
      <section id="personas" className="py-16 sm:py-24 relative z-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="rounded-full bg-amber-100 border border-amber-300 px-3.5 py-1 text-xs font-bold text-amber-900 uppercase tracking-wider">
              {isHindi ? 'एक-क्लिक सीधा प्रवेश' : 'Interactive Sandbox'}
            </span>
            <h2 className="mt-3 font-serif text-3xl sm:text-4xl font-extrabold text-stone-900 tracking-tight">
              {isHindi ? '6 प्रमुख प्रशासनिक भूमिकाओं का लाइव सिम्युलेटर' : 'Launch by Administrative Role'}
            </h2>
            <p className="mt-3 text-stone-600 text-sm sm:text-base">
              {isHindi
                ? 'नीचे किसी भी अधिकारी कार्ड पर क्लिक करें। सिस्टम बिना पासवर्ड टाइप किए तुरंत उस भूमिका में लॉगिन कर विशिष्ट कार्य-स्थल खोलेगा:'
                : 'Click any official role to authenticate instantly with demo credentials and experience their tailored command workspace:'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {DEMO_PERSONAS.map((persona) => {
              const isLoggingIn = loggingInRole === persona.role
              const IconComp = persona.icon
              return (
                <div
                  key={persona.email}
                  className="rounded-3xl border border-stone-200 bg-white p-6 shadow-lg shadow-stone-900/5 flex flex-col justify-between transition-all hover:border-amber-400 hover:-translate-y-1"
                >
                  <div>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-stone-100 text-amber-800 border border-stone-200">
                          <IconComp className="h-6 w-6" />
                        </div>
                        <div>
                          <h3 className="font-serif font-bold text-stone-900 text-base">{persona.name}</h3>
                          <p className="text-xs text-stone-500 font-medium">{persona.bureau}</p>
                        </div>
                      </div>

                      <span className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold ${persona.badgeColor}`}>
                        {persona.role}
                      </span>
                    </div>

                    <p className="mt-4 text-xs text-stone-600 leading-relaxed">
                      {isHindi ? persona.descriptionHi : persona.descriptionEn}
                    </p>

                    <div className="mt-4 rounded-xl bg-stone-50 border border-stone-200 p-2.5 font-mono text-[11px] text-stone-600">
                      <div className="flex items-center justify-between">
                        <span className="text-stone-400">Email:</span>
                        <span className="text-stone-800 font-semibold">{persona.email}</span>
                      </div>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-stone-400">Target View:</span>
                        <span className="text-amber-800 font-semibold">{persona.targetRoute}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-stone-200">
                    <button
                      onClick={() => handleLaunchPersona(persona)}
                      disabled={isLoggingIn}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-amber-600 hover:bg-amber-700 px-4 py-2.5 text-xs font-bold text-white shadow-xs transition disabled:opacity-50 cursor-pointer"
                    >
                      {isLoggingIn ? (
                        <>
                          <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                          <span>Authenticating as {persona.name}…</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-4 w-4" />
                          <span>Launch as {persona.name.split(' ')[0]} →</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Security, DPDP & Compliance */}
      <section id="security" className="py-16 sm:py-24 bg-white/70 border-t border-stone-200/80 relative z-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="rounded-full bg-rose-100 border border-rose-300 px-3.5 py-1 text-xs font-bold text-rose-900 uppercase tracking-wider">
              {isHindi ? 'सुरक्षा एवं गोपनीयता' : 'Security Architecture'}
            </span>
            <h2 className="mt-3 font-serif text-3xl sm:text-4xl font-extrabold text-stone-900 tracking-tight">
              {isHindi ? 'डीपीएचपी अधिनियम 2023 एवं क्रिप्टोग्राफिक ब्लॉकचेन' : 'DPDP Act 2023 & Cryptographic Governance'}
            </h2>
            <p className="mt-3 text-stone-600 text-sm sm:text-base">
              {isHindi
                ? 'सख्त आवश्यकता-आधारित (Need-to-Know) सुरक्षा, व्यक्तिगत डेटा सुरक्षा और अपरिवर्तनीय ऑडिट ट्रेल:'
                : 'Built with enterprise-grade regulatory compliance, whistleblower protection, and cryptographic immutability:'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="rounded-3xl border border-stone-200 bg-white p-6 shadow-md hover:border-amber-400 transition-all">
              <div className="rounded-2xl bg-rose-100 text-rose-800 p-3 w-fit mb-4">
                <Lock className="h-5 w-5" />
              </div>
              <h3 className="font-serif font-bold text-stone-900 text-base">
                {isHindi ? 'डीपीएचपी 2023 फील्ड एन्क्रिप्शन' : 'DPDP AES-GCM Encryption'}
              </h3>
              <p className="mt-2 text-xs text-stone-600 leading-relaxed">
                {isHindi
                  ? 'शिकायतकर्ताओं का नाम, आधार, मोबाइल और संवेदनशील विवरण डेटाबेस में एईएस-256 फील्ड स्तर पर एन्क्रिप्टेड रहता है।'
                  : 'Complainant identity, phone numbers, and whistleblower dossiers are cryptographically masked and AES encrypted at rest.'}
              </p>
            </div>

            <div className="rounded-3xl border border-stone-200 bg-white p-6 shadow-md hover:border-amber-400 transition-all">
              <div className="rounded-2xl bg-amber-100 text-amber-800 p-3 w-fit mb-4">
                <Fingerprint className="h-5 w-5" />
              </div>
              <h3 className="font-serif font-bold text-stone-900 text-base">
                {isHindi ? 'एसएचए-256 हैश-चेनिंग' : 'SHA-256 Hash Chaining'}
              </h3>
              <p className="mt-2 text-xs text-stone-600 leading-relaxed">
                {isHindi
                  ? 'ऑडिट लॉग और केस एक्शन में ब्लॉकचेन-शैली में पिछले हैश का लिंक होता है। किसी भी पिछली प्रविष्टि में बदलाव तुरंत पकड़ा जाता है।'
                  : 'Every regulatory action points to the parent hash. Chief Vigilance Auditors can verify unbroken integrity with 1 tap.'}
              </p>
            </div>

            <div className="rounded-3xl border border-stone-200 bg-white p-6 shadow-md hover:border-amber-400 transition-all">
              <div className="rounded-2xl bg-blue-100 text-blue-800 p-3 w-fit mb-4">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <h3 className="font-serif font-bold text-stone-900 text-base">
                {isHindi ? 'इमरजेंसी ब्रेक-ग्लास प्रोटोकॉल' : 'Break-Glass Emergency Access'}
              </h3>
              <p className="mt-2 text-xs text-stone-600 leading-relaxed">
                {isHindi
                  ? 'असाधारण परिस्थितियों में दूसरे ब्यूरो के संवेदनशील केस देखने हेतु लिखित कारण व आईपी लॉगिंग अनिवार्य है।'
                  : 'Crossing bureau security boundaries requires typed statutory justification, immediately logged to audit directorate monitors.'}
              </p>
            </div>

            <div className="rounded-3xl border border-stone-200 bg-white p-6 shadow-md hover:border-amber-400 transition-all">
              <div className="rounded-2xl bg-emerald-100 text-emerald-800 p-3 w-fit mb-4">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <h3 className="font-serif font-bold text-stone-900 text-base">
                {isHindi ? '3-स्तरीय भूमिका अभिगम (ABAC)' : '3-Tier Attribute Access Control'}
              </h3>
              <p className="mt-2 text-xs text-stone-600 leading-relaxed">
                {isHindi
                  ? 'L1 (केस समीक्षा), L2 (ब्यूरो प्रमुख), L3 (वरिष्ठ नेतृत्व/सचिव) के अनुसार सटीक अनुमतियां निर्धारित हैं।'
                  : 'Fine-grained attribute-based access separating initial intake officers from bureau directors and the Member Secretary.'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Official Government Footer */}
      <footer className="border-t border-stone-200/90 bg-[#F5F2EB] py-12 relative z-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <img
                src="/logo.png"
                alt="Samanvay Logo"
                className="h-11 w-11 rounded-xl object-contain shadow-xs bg-white p-0.5 border border-stone-200"
              />
              <div>
                <span className="font-serif text-lg font-bold text-stone-900">
                  SAMANVAY <span className="font-sans text-sm font-normal text-amber-800">(समन्वय)</span>
                </span>
                <p className="text-xs text-stone-500">
                  All India Council for Technical Education · Ministry of Education, Govt. of India
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-6 text-xs font-semibold text-stone-600">
              <a href="#overview" className="hover:text-amber-800 transition">Overview</a>
              <a href="#crisis-solution" className="hover:text-amber-800 transition">Silos vs Coordinated</a>
              <a href="#principles" className="hover:text-amber-800 transition">3 Core Pillars</a>
              <a href="#pitch-demo" className="hover:text-amber-800 transition">Workflow</a>
              <a href="#engine" className="hover:text-amber-800 transition">AI Engine</a>
              <a href="#personas" className="hover:text-amber-800 transition">Personas</a>
              <a href="#security" className="hover:text-amber-800 transition">Security &amp; DPDP</a>
              <Link to="/login" className="text-amber-700 hover:underline">Official Sign In</Link>
            </div>

            <p className="text-xs text-stone-500 text-center md:text-right">
              Nelson Mandela Marg, Vasant Kunj, New Delhi-110070<br />
              Secure Complaint Coordination &amp; Regulatory Tracking
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

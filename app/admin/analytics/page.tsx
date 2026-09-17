'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import {
  ArrowRight, Eye, UserRound, CalendarDays, FileText, ExternalLink,
  Smartphone, Monitor, Tablet, HelpCircle, BarChart3,
} from 'lucide-react'

interface Summary {
  total_views: number
  visits: number
  unique_visitors: number
  views_today: number
}

interface TopPage {
  path: string
  views: number
}

interface TopReferrer {
  referrer: string
  views: number
}

interface DailyView {
  day: string
  views: number
}

interface DeviceBreakdown {
  device: string
  views: number
}

const PERIODS: { label: string; days: number | null }[] = [
  { label: 'أسبوع', days: 7 },
  { label: 'شهر', days: 30 },
  { label: 'كل الوقت', days: null },
]

const DEVICE_ICON: Record<string, typeof Smartphone> = {
  'موبايل': Smartphone,
  'كمبيوتر': Monitor,
  'تابلت': Tablet,
  'غير معروف': HelpCircle,
}

export default function AdminAnalyticsPage() {
  const [loading, setLoading] = useState(true)
  const [periodDays, setPeriodDays] = useState<number | null>(30)
  const [summary, setSummary] = useState<Summary | null>(null)
  const [topPages, setTopPages] = useState<TopPage[]>([])
  const [topReferrers, setTopReferrers] = useState<TopReferrer[]>([])
  const [dailyViews, setDailyViews] = useState<DailyView[]>([])
  const [devices, setDevices] = useState<DeviceBreakdown[]>([])
  const router = useRouter()

  const loadData = useCallback(async (days: number | null) => {
    setLoading(true)
    const supabase = createClient()
    if (!supabase) { router.push('/admin/login'); return }
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/admin/login'); return }

    const [
      { data: summaryData },
      { data: pagesData },
      { data: referrersData },
      { data: dailyData },
      { data: deviceData },
    ] = await Promise.all([
      supabase.rpc('get_analytics_summary', { days_back: days }),
      supabase.rpc('get_top_pages', { days_back: days, limit_count: 10 }),
      supabase.rpc('get_top_referrers', { days_back: days, limit_count: 5 }),
      supabase.rpc('get_daily_views', { days_back: days }),
      supabase.rpc('get_device_breakdown', { days_back: days }),
    ])

    setSummary((summaryData?.[0] as Summary) ?? { total_views: 0, visits: 0, unique_visitors: 0, views_today: 0 })
    setTopPages((pagesData as TopPage[]) ?? [])
    setTopReferrers((referrersData as TopReferrer[]) ?? [])
    setDailyViews((dailyData as DailyView[]) ?? [])
    setDevices((deviceData as DeviceBreakdown[]) ?? [])
    setLoading(false)
  }, [router])

  useEffect(() => { loadData(periodDays) }, [periodDays, loadData])

  if (loading && !summary) {
    return <div className="min-h-screen flex items-center justify-center"><p className="text-ink/50 font-tajawal">جاري التحميل...</p></div>
  }

  const cards = [
    { label: 'زيارات اليوم', value: summary?.views_today ?? 0, icon: CalendarDays, color: 'text-ember' },
    { label: 'الزيارات (Sessions)', value: summary?.visits ?? 0, icon: UserRound, color: 'text-gold' },
    { label: 'زوار مختلفون', value: summary?.unique_visitors ?? 0, icon: UserRound, color: 'text-gold' },
    { label: 'مشاهدات الصفحات', value: summary?.total_views ?? 0, icon: Eye, color: 'text-ember' },
  ]

  const maxDaily = Math.max(1, ...dailyViews.map(d => d.views))
  const totalDeviceViews = Math.max(1, devices.reduce((sum, d) => sum + d.views, 0))

  return (
    <div className="min-h-screen p-4 sm:p-8">
      <div className="max-w-5xl mx-auto">
        <Link href="/admin/dashboard" className="text-gold hover:text-ember text-sm font-tajawal flex items-center gap-1 mb-2">
          <ArrowRight size={14} /> العودة
        </Link>

        <div className="flex flex-wrap items-center justify-between gap-3 mb-1">
          <h1 className="font-aref text-3xl text-ember">إحصائيات الزيارات</h1>
          <div className="flex gap-1 bg-black/20 rounded-lg p-1">
            {PERIODS.map((p) => (
              <button
                key={p.label}
                onClick={() => setPeriodDays(p.days)}
                className={`px-3 py-1.5 rounded-md text-xs font-tajawal transition-colors ${
                  periodDays === p.days ? 'bg-ember text-white' : 'text-ink/60 hover:text-ink'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
        <p className="text-ink/30 font-tajawal text-xs mb-8">الزيارة = تصفّح متواصل من نفس الشخص (فاصل أقل من 30 دقيقة). مشاهدات الصفحات = كل صفحة اتفتحت.</p>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          {cards.map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="card-lifted rounded-xl p-6">
              <Icon size={24} className={`${color} mb-3`} />
              <p className="font-aref text-2xl text-ink mb-1">{value.toLocaleString('ar-EG')}</p>
              <p className="text-ink/50 font-tajawal text-xs">{label}</p>
            </div>
          ))}
        </div>

        <div className="card-lifted rounded-xl p-6 mb-8">
          <h2 className="font-aref text-xl text-ink mb-5 flex items-center gap-2">
            <BarChart3 size={18} className="text-gold" /> المشاهدات يوميًا
          </h2>
          {dailyViews.length === 0 ? (
            <p className="text-ink/40 font-tajawal text-sm">لا توجد بيانات بعد</p>
          ) : (
            <div className="overflow-x-auto">
              <div className="flex items-end gap-2 h-40 min-w-max px-1">
                {dailyViews.map((d) => (
                  <div key={d.day} className="flex flex-col items-center gap-2" style={{ width: 28 }}>
                    <div
                      className="w-4 rounded-t bg-ember/70"
                      style={{ height: `${Math.max(4, (d.views / maxDaily) * 120)}px` }}
                      title={`${d.views} مشاهدة`}
                    />
                    <span className="text-ink/40 font-tajawal text-[10px] whitespace-nowrap">
                      {new Date(d.day).toLocaleDateString('ar-EG', { day: '2-digit', month: '2-digit' })}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="card-lifted rounded-xl p-6">
            <h2 className="font-aref text-xl text-ink mb-4 flex items-center gap-2">
              <FileText size={18} className="text-gold" /> أكتر الصفحات زيارة
            </h2>
            {topPages.length === 0 ? (
              <p className="text-ink/40 font-tajawal text-sm">لا توجد بيانات بعد</p>
            ) : (
              <div className="space-y-2">
                {topPages.map((p) => (
                  <div key={p.path} className="flex items-center justify-between gap-3 py-2 border-b border-ink/10 last:border-0">
                    <span className="text-ink/80 font-tajawal text-sm truncate">{p.path}</span>
                    <span className="text-ember font-tajawal text-sm font-semibold shrink-0">{p.views.toLocaleString('ar-EG')}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="card-lifted rounded-xl p-6">
            <h2 className="font-aref text-xl text-ink mb-4 flex items-center gap-2">
              <ExternalLink size={18} className="text-gold" /> مصدر الزيارات
            </h2>
            {topReferrers.length === 0 ? (
              <p className="text-ink/40 font-tajawal text-sm">لا توجد بيانات بعد</p>
            ) : (
              <div className="space-y-2">
                {topReferrers.map((r) => (
                  <div key={r.referrer} className="flex items-center justify-between gap-3 py-2 border-b border-ink/10 last:border-0">
                    <span className="text-ink/80 font-tajawal text-sm truncate">{r.referrer}</span>
                    <span className="text-ember font-tajawal text-sm font-semibold shrink-0">{r.views.toLocaleString('ar-EG')}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="card-lifted rounded-xl p-6">
            <h2 className="font-aref text-xl text-ink mb-4 flex items-center gap-2">
              <Smartphone size={18} className="text-gold" /> نوع الجهاز
            </h2>
            {devices.length === 0 ? (
              <p className="text-ink/40 font-tajawal text-sm">لا توجد بيانات بعد</p>
            ) : (
              <div className="space-y-3">
                {devices.map((d) => {
                  const Icon = DEVICE_ICON[d.device] ?? HelpCircle
                  const pct = Math.round((d.views / totalDeviceViews) * 100)
                  return (
                    <div key={d.device}>
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="text-ink/80 font-tajawal text-sm flex items-center gap-1.5">
                          <Icon size={14} className="text-ink/40" /> {d.device}
                        </span>
                        <span className="text-ink/50 font-tajawal text-xs">{pct}%</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-black/20 overflow-hidden">
                        <div className="h-full bg-ember/70 rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

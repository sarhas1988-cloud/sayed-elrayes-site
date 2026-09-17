'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'

const BOT_UA = /bot|crawl|spider|slurp|headless|python-requests|curl\/|wget\/|axios\/|go-http-client|facebookexternalhit|petalbot|semrushbot|ahrefsbot|mj12bot|bytespider|ccbot|gptbot|claudebot|applebot/i

function isLikelyBot(): boolean {
  if (typeof navigator === 'undefined') return true
  if (navigator.webdriver) return true
  if (BOT_UA.test(navigator.userAgent)) return true
  return false
}

function getSessionId(): string {
  if (typeof window === 'undefined') return ''
  let id = localStorage.getItem('sr_sid')
  if (!id) {
    id = crypto.randomUUID()
    localStorage.setItem('sr_sid', id)
  }
  return id
}

export function PageTracker() {
  const pathname = usePathname()

  useEffect(() => {
    if (!pathname || pathname.startsWith('/admin')) return
    if (isLikelyBot()) return

    const supabase = createClient()
    if (!supabase) return

    supabase.from('page_views').insert({
      path: pathname,
      referrer: document.referrer || null,
      session_id: getSessionId(),
      user_agent: navigator.userAgent,
    }).then(() => {})
  }, [pathname])

  return null
}

import { useState, useEffect } from 'react'
import { supabase } from '@lib/supabase'

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = atob(base64)
  return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)))
}

export type PushStatus = 'unsupported' | 'denied' | 'granted' | 'default' | 'loading'

export function usePushNotifications() {
  const [status, setStatus] = useState<PushStatus>('loading')

  useEffect(() => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      setStatus('unsupported')
      return
    }
    setStatus(Notification.permission as PushStatus)
  }, [])

  async function subscribe(): Promise<boolean> {
    if (!('serviceWorker' in navigator)) return false

    try {
      const registration = await navigator.serviceWorker.ready
      const vapidKey = import.meta.env.VITE_VAPID_PUBLIC_KEY

      const pushSub = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidKey),
      })

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return false

      await supabase
        .from('push_subscriptions')
        .upsert({ user_id: user.id, subscription: pushSub.toJSON() }, { onConflict: 'user_id' })

      setStatus('granted')
      return true
    } catch (e) {
      console.error('[push] subscribe error:', e)
      setStatus(Notification.permission as PushStatus)
      return false
    }
  }

  return { status, subscribe }
}

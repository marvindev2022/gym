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
  const [isSubscribing, setIsSubscribing] = useState(false)
  const [subscribeError, setSubscribeError] = useState<string | null>(null)
  const [subscribeSuccess, setSubscribeSuccess] = useState(false)

  useEffect(() => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      setStatus('unsupported')
      return
    }
    setStatus(Notification.permission as PushStatus)
  }, [])

  async function subscribe(): Promise<boolean> {
    if (!('serviceWorker' in navigator)) {
      setSubscribeError('Seu navegador não suporta notificações push.')
      return false
    }

    const vapidKey = import.meta.env.VITE_VAPID_PUBLIC_KEY
    if (!vapidKey) {
      setSubscribeError('Chave VAPID não configurada.')
      return false
    }

    setIsSubscribing(true)
    setSubscribeError(null)
    setSubscribeSuccess(false)

    try {
      const registration = await navigator.serviceWorker.ready

      const pushSub = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidKey),
      })

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setSubscribeError('Faça login para ativar notificações.')
        return false
      }

      const { error } = await supabase
        .from('push_subscriptions')
        .upsert({ user_id: user.id, subscription: pushSub.toJSON() }, { onConflict: 'user_id' })

      if (error) {
        setSubscribeError('Erro ao salvar subscription. Tente novamente.')
        return false
      }

      setStatus('granted')
      setSubscribeSuccess(true)
      setTimeout(() => setSubscribeSuccess(false), 3000)
      return true
    } catch (e: any) {
      if (e?.name === 'NotAllowedError') {
        setStatus('denied')
        setSubscribeError('Permissão negada. Habilite nas configurações do navegador.')
      } else {
        setSubscribeError('Não foi possível ativar. Tente novamente.')
      }
      setStatus(Notification.permission as PushStatus)
      return false
    } finally {
      setIsSubscribing(false)
    }
  }

  return { status, isSubscribing, subscribeError, subscribeSuccess, subscribe }
}

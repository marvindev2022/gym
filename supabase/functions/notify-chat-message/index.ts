import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import webpush from 'npm:web-push@3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const { conversation_id, sender_id, content, app_url } = await req.json()

  if (!conversation_id || !sender_id || !content) {
    return new Response(JSON.stringify({ error: 'Parâmetros obrigatórios ausentes' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  const supabaseAdmin = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  )

  // Busca a conversa para saber quem é o outro lado
  const { data: conv } = await supabaseAdmin
    .from('conversations')
    .select('student_id, trainer_id, students(name, user_id), trainers(name, user_id)')
    .eq('id', conversation_id)
    .single()

  if (!conv) {
    return new Response(JSON.stringify({ error: 'Conversa não encontrada' }), {
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  const student = (conv as any).students
  const trainer = (conv as any).trainers

  // Quem é o remetente e quem vai receber a notificação
  const senderIsStudent = student?.user_id === sender_id
  const receiverUserId = senderIsStudent ? trainer?.user_id : student?.user_id
  const senderName = senderIsStudent ? (student?.name ?? 'Aluno') : (trainer?.name ?? 'Professor')

  if (!receiverUserId) {
    return new Response(JSON.stringify({ ok: true, skipped: 'receiver not found' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  // Busca push subscriptions do destinatário
  const { data: subs } = await supabaseAdmin
    .from('push_subscriptions')
    .select('id, subscription')
    .eq('user_id', receiverUserId)

  const vapidPublic = Deno.env.get('VAPID_PUBLIC_KEY')
  const vapidPrivate = Deno.env.get('VAPID_PRIVATE_KEY')
  const vapidSubject = Deno.env.get('VAPID_SUBJECT') ?? 'mailto:contato@treinozap.com.br'

  if (!vapidPublic || !vapidPrivate || !subs?.length) {
    return new Response(JSON.stringify({ ok: true, skipped: 'no push subscriptions or VAPID keys' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  webpush.setVapidDetails(vapidSubject, vapidPublic, vapidPrivate)

  const preview = content.length > 80 ? content.slice(0, 77) + '...' : content
  const chatUrl = `${app_url ?? 'https://treinozap.com.br'}/chat/${conversation_id}`

  const payload = JSON.stringify({
    title: `💬 ${senderName}`,
    body: preview,
    url: chatUrl,
  })

  const expiredIds: string[] = []

  await Promise.allSettled(
    subs.map(async ({ id, subscription }) => {
      try {
        await webpush.sendNotification(subscription, payload)
      } catch (e: any) {
        console.error('[notify-chat] Push error:', e?.statusCode, e?.body)
        if (e?.statusCode === 410) expiredIds.push(id)
      }
    })
  )

  // Remove subscriptions expiradas
  if (expiredIds.length > 0) {
    await supabaseAdmin.from('push_subscriptions').delete().in('id', expiredIds)
  }

  return new Response(JSON.stringify({ ok: true }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
})

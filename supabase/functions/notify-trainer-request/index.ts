import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const { trainer_id, student_name, student_message, app_url } = await req.json()

  if (!trainer_id || !student_name) {
    return new Response(JSON.stringify({ error: 'trainer_id e student_name são obrigatórios' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  const supabaseAdmin = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  )

  // Busca dados do trainer
  const { data: trainer } = await supabaseAdmin
    .from('trainers')
    .select('name, phone, user_id')
    .eq('id', trainer_id)
    .single()

  if (!trainer) {
    return new Response(JSON.stringify({ error: 'Trainer não encontrado' }), {
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  const notifications: Promise<void>[] = []

  // --- WhatsApp via Evolution API ---
  const evolutionUrl = Deno.env.get('EVOLUTION_API_URL')
  const evolutionKey = Deno.env.get('EVOLUTION_API_KEY')
  const evolutionInstance = Deno.env.get('EVOLUTION_INSTANCE') ?? 'treinozap'

  if (evolutionUrl && evolutionKey && trainer.phone) {
    const phone = trainer.phone.replace(/\D/g, '')
    const number = phone.startsWith('55') ? phone : `55${phone}`

    const text = [
      `🏋️ *Nova solicitação de aluno!*`,
      ``,
      `*${student_name}* quer se conectar com você no TreinoZap.`,
      student_message ? `\nMensagem: _"${student_message}"_` : '',
      ``,
      `Acesse a plataforma para aceitar ou recusar:`,
      `👉 ${app_url ?? 'https://treinozap.com.br'}/dashboard`,
    ].filter(s => s !== undefined).join('\n')

    notifications.push(
      fetch(`${evolutionUrl}/message/sendText/${evolutionInstance}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', apikey: evolutionKey },
        body: JSON.stringify({ number, text }),
      }).then(() => {}).catch((e) => console.error('[notify] WhatsApp error:', e))
    )
  }

  // --- Email via Resend ---
  const resendKey = Deno.env.get('RESEND_API_KEY')
  const fromEmail = Deno.env.get('FROM_EMAIL') ?? 'noreply@treinozap.com.br'

  if (resendKey && trainer.user_id) {
    // Busca email do trainer via auth admin
    const { data: { user: trainerUser } } = await supabaseAdmin.auth.admin.getUserById(trainer.user_id)

    if (trainerUser?.email) {
      const emailHtml = `
        <div style="font-family:sans-serif;max-width:480px;margin:0 auto">
          <h2 style="color:#C9A84C">Nova solicitação no TreinoZap 🏋️</h2>
          <p>Olá, <strong>${trainer.name}</strong>!</p>
          <p><strong>${student_name}</strong> quer se conectar com você como aluno.</p>
          ${student_message ? `<blockquote style="border-left:3px solid #C9A84C;padding:8px 16px;color:#666;font-style:italic">"${student_message}"</blockquote>` : ''}
          <a href="${app_url ?? 'https://treinozap.com.br'}/dashboard"
             style="display:inline-block;margin-top:16px;padding:12px 24px;background:#C9A84C;color:#000;text-decoration:none;border-radius:6px;font-weight:bold">
            Ver solicitação →
          </a>
          <p style="margin-top:24px;color:#999;font-size:12px">TreinoZap — Plataforma para personal trainers</p>
        </div>
      `

      notifications.push(
        fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${resendKey}`,
          },
          body: JSON.stringify({
            from: fromEmail,
            to: trainerUser.email,
            subject: `${student_name} quer se conectar com você no TreinoZap`,
            html: emailHtml,
          }),
        }).then(() => {}).catch((e) => console.error('[notify] Email error:', e))
      )
    }
  }

  await Promise.allSettled(notifications)

  return new Response(JSON.stringify({ ok: true }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
})

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const { workout_id, public_token, status } = await req.json()

  if (!workout_id || !public_token || !status) {
    return new Response(JSON.stringify({ error: 'Parâmetros obrigatórios ausentes' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  if (!['active', 'in_progress', 'completed'].includes(status)) {
    return new Response(JSON.stringify({ error: 'Status inválido' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  const supabaseAdmin = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  )

  // Verifica que workout_id + public_token coincidem (segurança)
  const { data: workout } = await supabaseAdmin
    .from('workouts')
    .select('id, status')
    .eq('id', workout_id)
    .eq('public_token', public_token)
    .single()

  if (!workout) {
    return new Response(JSON.stringify({ error: 'Treino não encontrado' }), {
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  // Não regride status (completed não volta pra in_progress)
  const order = { active: 0, in_progress: 1, completed: 2 }
  if (order[status as keyof typeof order] < order[workout.status as keyof typeof order]) {
    return new Response(JSON.stringify({ ok: true, skipped: 'status regression' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  await supabaseAdmin.from('workouts').update({ status }).eq('id', workout_id)

  return new Response(JSON.stringify({ ok: true }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
})

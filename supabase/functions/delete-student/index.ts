import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const authHeader = req.headers.get('Authorization')
  if (!authHeader) {
    return new Response(JSON.stringify({ error: 'Não autorizado' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  const { studentId } = await req.json()
  if (!studentId) {
    return new Response(JSON.stringify({ error: 'studentId é obrigatório' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  const supabaseAdmin = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  )

  // Busca o aluno para pegar user_id e email
  const { data: student, error: fetchError } = await supabaseAdmin
    .from('students')
    .select('id, user_id, email')
    .eq('id', studentId)
    .single()

  if (fetchError || !student) {
    return new Response(JSON.stringify({ error: 'Aluno não encontrado' }), {
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  // Deleta da tabela students
  await supabaseAdmin.from('students').delete().eq('id', studentId)

  // Deleta do auth.users se tiver user_id
  if (student.user_id) {
    await supabaseAdmin.auth.admin.deleteUser(student.user_id)
  } else if (student.email) {
    // Busca por email se não tiver user_id (convidado mas nunca ativou)
    const { data: { users } } = await supabaseAdmin.auth.admin.listUsers()
    const authUser = users.find((u) => u.email === student.email)
    if (authUser) {
      await supabaseAdmin.auth.admin.deleteUser(authUser.id)
    }
  }

  return new Response(JSON.stringify({ success: true }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
})

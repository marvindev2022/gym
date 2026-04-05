/**
 * Serviço de notificações — WhatsApp via Evolution API (free, self-hosted)
 * Docs: https://doc.evolution-api.com
 *
 * Env vars necessárias:
 *   VITE_EVOLUTION_API_URL  — ex: https://sua-evolution.railway.app
 *   VITE_EVOLUTION_API_KEY  — chave definida na Evolution API
 *   VITE_EVOLUTION_INSTANCE — nome da instância (ex: treinozap)
 */

const BASE_URL = import.meta.env.VITE_EVOLUTION_API_URL
const API_KEY = import.meta.env.VITE_EVOLUTION_API_KEY
const INSTANCE = import.meta.env.VITE_EVOLUTION_INSTANCE ?? 'treinozap'

function cleanPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '')
  return digits.startsWith('55') ? digits : `55${digits}`
}

export async function sendWhatsApp(phone: string, message: string): Promise<void> {
  if (!BASE_URL || !API_KEY) {
    console.warn('[notifications] Evolution API não configurada — mensagem não enviada')
    return
  }

  const url = `${BASE_URL}/message/sendText/${INSTANCE}`

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: API_KEY,
    },
    body: JSON.stringify({
      number: cleanPhone(phone),
      text: message,
    }),
  })

  if (!res.ok) {
    const body = await res.text()
    console.error('[notifications] Erro ao enviar WhatsApp:', res.status, body)
  }
}

export function buildActivationMessage(params: {
  studentName: string
  trainerName: string
  email: string | null
  portalUrl: string
}): string {
  const { studentName, trainerName, email, portalUrl } = params
  return [
    `Olá, *${studentName}*! 👋`,
    ``,
    `Sou *${trainerName}*, seu personal trainer no TreinoZap.`,
    ``,
    `Seu cadastro foi criado! Para ativar sua conta e acessar seus treinos, verifique seu email${email ? ` *(${email})*` : ''} e clique no link de convite que te enviei.`,
    ``,
    `Após ativar, seus treinos estarão disponíveis aqui:`,
    `👉 ${portalUrl}`,
    ``,
    `Qualquer dúvida é só me chamar! 💪`,
  ].join('\n')
}

export function buildWelcomeMessage(params: {
  studentName: string
  trainerName: string
  portalUrl: string
}): string {
  const { studentName, trainerName, portalUrl } = params
  return [
    `Olá, *${studentName}*! 👋`,
    ``,
    `Você foi cadastrado na plataforma do seu personal *${trainerName}*.`,
    ``,
    `Aqui você vai receber seus treinos diretamente pelo link:`,
    `👉 ${portalUrl}`,
    ``,
    `Salva esse link — é por ele que você acompanha tudo! 💪`,
  ].join('\n')
}

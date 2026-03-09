/// <reference types="vite/client" />
/**
 * Evolution API - WhatsApp Integration
 *
 * Configure via environment variables:
 *   VITE_EVOLUTION_API_URL  = https://your-evolution-instance.com
 *   VITE_EVOLUTION_API_KEY  = your-api-key
 *   VITE_EVOLUTION_INSTANCE = your-instance-name
 */

const EVOLUTION_URL = import.meta.env.VITE_EVOLUTION_API_URL || '';
const EVOLUTION_KEY = import.meta.env.VITE_EVOLUTION_API_KEY || '';
const EVOLUTION_INSTANCE = import.meta.env.VITE_EVOLUTION_INSTANCE || '';

export interface WhatsAppMessage {
  phone: string;
  message: string;
}

/**
 * Send a WhatsApp text message via Evolution API.
 * Silently fails if not configured (returns false).
 */
export async function sendWhatsApp(phone: string, message: string): Promise<boolean> {
  if (!EVOLUTION_URL || !EVOLUTION_KEY || !EVOLUTION_INSTANCE) {
    console.warn('[WhatsApp] Evolution API not configured — skipping notification.');
    return false;
  }

  // Normalize phone: remove non-digits, ensure country code
  const normalized = phone.replace(/\D/g, '');
  if (!normalized || normalized.length < 10) {
    console.warn('[WhatsApp] Invalid phone number:', phone);
    return false;
  }

  try {
    const response = await fetch(
      `${EVOLUTION_URL}/message/sendText/${EVOLUTION_INSTANCE}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': EVOLUTION_KEY,
        },
        body: JSON.stringify({
          number: normalized,
          options: { delay: 1200 },
          textMessage: { text: message },
        }),
      }
    );

    if (!response.ok) {
      const err = await response.text();
      console.error('[WhatsApp] API error:', err);
      return false;
    }

    return true;
  } catch (err) {
    console.error('[WhatsApp] Network error:', err);
    return false;
  }
}

// ─── Pre-built notification messages ─────────────────────────────────────────

export const WA_MESSAGES = {
  taskCreated: (taskTitle: string, clientName: string) =>
    `🆕 *Nova demanda criada*\n\nTarefa: *${taskTitle}*\nCliente: ${clientName}\n\nAcesse o painel para ver os detalhes.`,

  taskMoved: (taskTitle: string, fromStatus: string, toStatus: string) =>
    `📋 *Tarefa atualizada*\n\n"${taskTitle}"\n${fromStatus} → *${toStatus}*`,

  clientReviewReady: (taskTitle: string, clientName: string) =>
    `👋 Olá *${clientName}*!\n\nTemos um conteúdo aguardando sua aprovação:\n\n📄 *${taskTitle}*\n\nAcesse o portal para revisar e aprovar: ${window.location.origin}/portal`,

  clientApprovalReady: (taskTitle: string, clientName: string) =>
    `✅ *Aprovação final necessária*\n\nOlá *${clientName}*, o conteúdo abaixo passou pela aprovação interna e está pronto para sua aprovação final:\n\n📄 *${taskTitle}*\n\nAcesse: ${window.location.origin}/portal`,

  clientApproved: (taskTitle: string) =>
    `🎉 *Aprovado pelo cliente!*\n\nA tarefa "${taskTitle}" foi aprovada pelo cliente e seguiu para o próximo passo.`,

  clientRejected: (taskTitle: string, reason: string) =>
    `❌ *Reprovado pelo cliente*\n\nA tarefa "${taskTitle}" foi reprovada.\n\nMotivo: ${reason}`,

  readyToPost: (taskTitle: string) =>
    `📲 *Pronto para postar!*\n\n"${taskTitle}" está aprovado e aguardando publicação. Acesse o painel para postar.`,

  published: (taskTitle: string, clientName: string) =>
    `🚀 *Publicado!*\n\nOlá *${clientName}*, o conteúdo "${taskTitle}" foi publicado com sucesso!`,
};

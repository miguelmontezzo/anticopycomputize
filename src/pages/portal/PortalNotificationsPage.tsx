import React from 'react';
import { useClientPortal } from '../../context/ClientPortalContext';
import { Bell, CheckCheck } from 'lucide-react';

const TYPE_LABELS: Record<string, string> = {
  new_calendar: 'Novo calendário',
  calendar_updated: 'Calendário atualizado',
  post_approved: 'Post aprovado',
  info: 'Informação',
};

export default function PortalNotificationsPage() {
  const { notifications, markAsRead } = useClientPortal();

  const handleClick = (id: string, isRead: boolean) => {
    if (!isRead) markAsRead(id);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">Notificações</h1>
        <p className="text-sm text-gray-500 mt-0.5">Atualizações da sua conta na agência.</p>
      </div>

      {notifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
          <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
            <Bell className="w-5 h-5 text-gray-400" />
          </div>
          <p className="text-sm text-gray-500">Nenhuma notificação por enquanto.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map(n => (
            <div
              key={n.id}
              onClick={() => handleClick(n.id, n.is_read)}
              className={`bg-white border rounded-xl p-4 cursor-pointer transition-all hover:border-gray-300 ${
                n.is_read ? 'border-gray-200' : 'border-black ring-1 ring-black/5'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    {!n.is_read && (
                      <span className="w-2 h-2 rounded-full bg-black shrink-0" />
                    )}
                    <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">
                      {TYPE_LABELS[n.type] || n.type}
                    </span>
                  </div>
                  <div className="text-sm font-semibold text-gray-900 mb-0.5">{n.title}</div>
                  {n.message && (
                    <p className="text-sm text-gray-500 leading-relaxed">{n.message}</p>
                  )}
                </div>
                <div className="text-xs text-gray-400 shrink-0 pt-0.5">
                  {new Date(n.created_at).toLocaleDateString('pt-BR')}
                </div>
              </div>

              {!n.is_read && (
                <div className="flex items-center gap-1 mt-2 text-xs text-gray-400">
                  <CheckCheck className="w-3 h-3" />
                  Clique para marcar como lida
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

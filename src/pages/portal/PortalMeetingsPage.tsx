import React from 'react';
import { CalendarClock } from 'lucide-react';

export default function PortalMeetingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">Reuniões</h1>
        <p className="text-sm text-gray-500 mt-0.5">Agenda de reuniões com a equipe.</p>
      </div>

      <div className="flex flex-col items-center justify-center py-24 text-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center">
          <CalendarClock className="w-6 h-6 text-gray-400" />
        </div>
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 border border-amber-200 rounded-full text-xs font-medium text-amber-700 mb-3">
            Em breve
          </div>
          <h2 className="text-base font-semibold text-gray-900 mb-2">
            Integração com Google Calendar
          </h2>
          <p className="text-sm text-gray-500 max-w-xs mx-auto leading-relaxed">
            Em breve você poderá visualizar e agendar reuniões com a equipe diretamente por aqui.
          </p>
        </div>
      </div>
    </div>
  );
}

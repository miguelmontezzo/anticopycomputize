import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Loader2 } from 'lucide-react';

export default function PortalCallbackPage() {
  const navigate = useNavigate();
  const [error, setError] = useState('');

  useEffect(() => {
    // Supabase SDK automatically parses the token from the URL hash.
    // We wait for the SIGNED_IN event and then look up the client.
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        // 1. Check client_users
        const { data: cu } = await supabase
          .from('client_users')
          .select('client_id, clients(slug)')
          .eq('user_id', session.user.id)
          .maybeSingle();

        if ((cu as any)?.clients?.slug) {
          navigate(`/portal/${(cu as any).clients.slug}/calendario`, { replace: true });
          return;
        }

        // 2. Auto-link by email
        const { data: clientByEmail } = await supabase
          .from('clients')
          .select('id, slug')
          .eq('email', session.user.email!)
          .maybeSingle();

        if (clientByEmail) {
          await supabase.from('client_users').insert({
            user_id: session.user.id,
            client_id: clientByEmail.id,
          });
          navigate(`/portal/${clientByEmail.slug}/calendario`, { replace: true });
          return;
        }

        // 3. No client found
        setError('Email não associado a nenhum cliente. Contate a agência.');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4 px-4 text-center">
        <p className="text-sm text-gray-700">{error}</p>
        <button
          onClick={() => navigate('/portal/login')}
          className="text-sm text-black underline"
        >
          Voltar ao login
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
        <p className="text-sm text-gray-500">Verificando acesso...</p>
      </div>
    </div>
  );
}

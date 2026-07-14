'use client';

import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { ParticipanteComJogador } from '@/lib/database.types';

/**
 * Busca os participantes de um racha e mantém em tempo real:
 * qualquer pessoa que clicar em +1 gol/assistência/defesa em qualquer
 * dispositivo atualiza a tela de todo mundo que estiver aberta nesse racha.
 */
export function useParticipantesRealtime(rachaId: string) {
  const [participantes, setParticipantes] = useState<ParticipanteComJogador[]>([]);
  const [carregando, setCarregando] = useState(true);

  const buscar = useCallback(async () => {
    const { data, error } = await supabase
      .from('racha_jogadores')
      .select('*, jogadores(*)')
      .eq('racha_id', rachaId)
      .order('created_at', { ascending: true });

    if (!error && data) {
      setParticipantes(data as unknown as ParticipanteComJogador[]);
    }
    setCarregando(false);
  }, [rachaId]);

  useEffect(() => {
    buscar();

    // Escuta qualquer mudança (INSERT ou UPDATE) na tabela de participação
    // filtrando só pelo racha atual, e re-sincroniza os dados.
    const canal = supabase
      .channel(`racha-${rachaId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'racha_jogadores',
          filter: `racha_id=eq.${rachaId}`,
        },
        () => {
          buscar();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(canal);
    };
  }, [rachaId, buscar]);

  return { participantes, carregando, recarregar: buscar };
}
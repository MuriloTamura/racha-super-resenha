'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { ParticipanteComJogador, TipoStat } from '@/lib/database.types';

const STAT_CONFIG: Record<TipoStat, { label: string; emoji: string }> = {
  gols: { label: 'Gol', emoji: '⚽' },
  assistencias: { label: 'Assist.', emoji: '🎯' },
  defesas: { label: 'Defesa', emoji: '🧤' },
};

export default function JogadorStatCard({
  participante,
}: {
  participante: ParticipanteComJogador;
}) {
  // Controla qual botão está "carregando" pra evitar duplo clique
  const [carregando, setCarregando] = useState<TipoStat | null>(null);

  async function alterar(tipo: TipoStat, delta: 1 | -1) {
    if (carregando) return;
    setCarregando(tipo);

    await supabase.rpc('incrementar_stat', {
      p_racha_id: participante.racha_id,
      p_jogador_id: participante.jogador_id,
      p_tipo_stat: tipo,
      p_delta: delta,
    });

    // Não precisa atualizar o estado manualmente:
    // o hook de realtime escuta a mudança e re-sincroniza sozinho.
    setCarregando(null);
  }

  return (
    <div className="card-racha p-4 flex flex-col gap-3">
      <p className="font-display font-bold text-white">{participante.jogadores.nome}</p>

      <div className="grid grid-cols-3 gap-2">
        {(Object.keys(STAT_CONFIG) as TipoStat[]).map((tipo) => (
          <div key={tipo} className="flex flex-col items-center gap-1.5">
            <span className="text-xs text-white/50">
              {STAT_CONFIG[tipo].emoji} {STAT_CONFIG[tipo].label}
            </span>
            <span className="font-display font-extrabold text-2xl text-racha-yellow">
              {participante[tipo]}
            </span>
            <div className="flex gap-1.5">
              <button
                onClick={() => alterar(tipo, -1)}
                disabled={carregando !== null || participante[tipo] === 0}
                className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 text-white/60 text-sm hover:bg-white/10 disabled:opacity-30 transition-colors"
                aria-label={`Remover ${STAT_CONFIG[tipo].label}`}
              >
                −
              </button>
              <button
                onClick={() => alterar(tipo, 1)}
                disabled={carregando !== null}
                className="btn-racha w-7 h-7 text-sm disabled:opacity-50"
                aria-label={`Adicionar ${STAT_CONFIG[tipo].label}`}
              >
                +
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
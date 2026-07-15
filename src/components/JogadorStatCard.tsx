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
  const [removendo, setRemovendo] = useState(false);

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

  async function remover() {
    const confirmar = window.confirm(
      `Remover ${participante.jogadores.nome} deste racha? As estatísticas dele nesse jogo serão descontadas do total geral.`
    );
    if (!confirmar) return;

    setRemovendo(true);
    await supabase.rpc('remover_participante', {
      p_participante_id: participante.id,
    });
    // O hook de realtime detecta a remoção e atualiza a lista sozinho.
    // (não precisa setRemovendo(false) porque o card vai deixar de existir)
  }

  return (
    <div className="card-racha p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <p className="font-display font-bold text-white">{participante.jogadores.nome}</p>
        <button
          onClick={remover}
          disabled={removendo}
          className="text-white/30 hover:text-red-400 text-sm px-2 py-1 disabled:opacity-30 transition-colors"
          aria-label={`Remover ${participante.jogadores.nome} do racha`}
        >
          {removendo ? '...' : '🗑️'}
        </button>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {(Object.keys(STAT_CONFIG) as TipoStat[]).map((tipo) => (
          <div key={tipo} className="flex flex-col items-center gap-2">
            <span className="text-xs text-white/50">
              {STAT_CONFIG[tipo].emoji} {STAT_CONFIG[tipo].label}
            </span>
            <span className="font-display font-extrabold text-3xl text-racha-yellow">
              {participante[tipo]}
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => alterar(tipo, -1)}
                disabled={carregando !== null || participante[tipo] === 0}
                className="w-11 h-11 rounded-xl bg-white/5 border border-white/10 text-white/60 text-xl hover:bg-white/10 disabled:opacity-30 transition-colors"
                aria-label={`Remover ${STAT_CONFIG[tipo].label}`}
              >
                −
              </button>
              <button
                onClick={() => alterar(tipo, 1)}
                disabled={carregando !== null}
                className="btn-racha w-11 h-11 text-xl disabled:opacity-50"
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
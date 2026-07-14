'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import type { Jogador, TipoStat } from '@/lib/database.types';

const ABAS: { tipo: TipoStat; label: string; emoji: string }[] = [
  { tipo: 'gols', label: 'Artilheiros', emoji: '⚽' },
  { tipo: 'assistencias', label: 'Garçons', emoji: '🎯' },
  { tipo: 'defesas', label: 'Paredões', emoji: '🧤' },
];

const MEDALHAS = ['🥇', '🥈', '🥉'];

export default function RankingPage() {
  const [jogadores, setJogadores] = useState<Jogador[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [abaAtiva, setAbaAtiva] = useState<TipoStat>('gols');

  useEffect(() => {
    async function buscar() {
      const { data } = await supabase.from('jogadores').select('*');
      setJogadores(data ?? []);
      setCarregando(false);
    }
    buscar();
  }, []);

  const ranking = [...jogadores]
    .filter((j) => j[abaAtiva] > 0)
    .sort((a, b) => b[abaAtiva] - a[abaAtiva]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link href="/" className="text-white/40 text-sm hover:text-racha-yellow">
          ← Todos os rachas
        </Link>
        <h2 className="font-display font-extrabold text-2xl text-racha-yellow mt-1">
          Ranking Geral
        </h2>
        <p className="text-white/60 text-sm mt-1">Histórico somado de todos os rachas</p>
      </div>

      <div className="flex gap-2">
        {ABAS.map((aba) => (
          <button
            key={aba.tipo}
            onClick={() => setAbaAtiva(aba.tipo)}
            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
              abaAtiva === aba.tipo
                ? 'bg-racha-yellow text-racha-black'
                : 'bg-racha-card text-white/60 border border-white/10'
            }`}
          >
            {aba.emoji} {aba.label}
          </button>
        ))}
      </div>

      {carregando && <p className="text-white/40 text-sm">Carregando...</p>}

      {!carregando && ranking.length === 0 && (
        <p className="text-white/40 text-sm text-center py-6">
          Ninguém pontuou nessa categoria ainda.
        </p>
      )}

      <div className="flex flex-col gap-2">
        {ranking.map((jogador, i) => (
          <div
            key={jogador.id}
            className="card-racha p-3 flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <span className="w-7 text-center font-display font-bold text-white/40">
                {MEDALHAS[i] ?? i + 1}
              </span>
              <span className="font-medium">{jogador.nome}</span>
            </div>
            <span className="font-display font-extrabold text-xl text-racha-yellow">
              {jogador[abaAtiva]}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import type { Jogador } from '@/lib/database.types';
import JogadorCard from '@/components/JogadorCard';

type Ordenacao = 'gols' | 'assistencias' | 'defesas' | 'ga' | 'nome';

const OPCOES_ORDENACAO: { valor: Ordenacao; label: string }[] = [
  { valor: 'ga', label: 'G/A' },
  { valor: 'gols', label: 'Gols' },
  { valor: 'assistencias', label: 'Assist.' },
  { valor: 'defesas', label: 'Defesas' },
  { valor: 'nome', label: 'Nome' },
];

export default function JogadoresPage() {
  const [jogadores, setJogadores] = useState<Jogador[]>([]);
  const [jogosPorJogador, setJogosPorJogador] = useState<Record<string, number>>({});
  const [carregando, setCarregando] = useState(true);
  const [busca, setBusca] = useState('');
  const [ordenacao, setOrdenacao] = useState<Ordenacao>('ga');

  useEffect(() => {
    async function buscar() {
      const [{ data: dadosJogadores }, { data: participacoes }] = await Promise.all([
        supabase.from('jogadores').select('*'),
        supabase.from('racha_jogadores').select('jogador_id'),
      ]);

      setJogadores(dadosJogadores ?? []);

      // Conta em quantos rachas cada jogador apareceu
      const contagem: Record<string, number> = {};
      for (const p of participacoes ?? []) {
        contagem[p.jogador_id] = (contagem[p.jogador_id] ?? 0) + 1;
      }
      setJogosPorJogador(contagem);

      setCarregando(false);
    }
    buscar();
  }, []);

  const jogadoresFiltrados = jogadores
    .filter((j) => j.nome.toLowerCase().includes(busca.trim().toLowerCase()))
    .sort((a, b) => {
      if (ordenacao === 'nome') return a.nome.localeCompare(b.nome);
      if (ordenacao === 'ga') return b.gols + b.assistencias - (a.gols + a.assistencias);
      return b[ordenacao] - a[ordenacao];
    });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link href="/" className="text-white/40 text-sm hover:text-racha-yellow">
          ← Todos os rachas
        </Link>
        <h2 className="font-display font-extrabold text-2xl text-racha-yellow mt-1">
          Jogadores
        </h2>
        <p className="text-white/60 text-sm mt-1">
          Todo mundo que já jogou o Racha Super Resenha
        </p>
      </div>

      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 text-lg pointer-events-none">
          🔍
        </span>
        <input
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Buscar jogador..."
          className="w-full bg-racha-card border border-white/10 rounded-xl pl-10 pr-3 py-3 text-base focus:border-racha-yellow outline-none"
        />
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {OPCOES_ORDENACAO.map((op) => (
          <button
            key={op.valor}
            onClick={() => setOrdenacao(op.valor)}
            className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              ordenacao === op.valor
                ? 'bg-racha-yellow text-racha-black'
                : 'bg-racha-card text-white/60 border border-white/10'
            }`}
          >
            {op.label}
          </button>
        ))}
      </div>

      {carregando && <p className="text-white/40 text-sm">Carregando...</p>}

      {!carregando && jogadoresFiltrados.length === 0 && (
        <p className="text-white/40 text-sm text-center py-6">
          Nenhum jogador encontrado.
        </p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {jogadoresFiltrados.map((jogador) => (
          <JogadorCard
            key={jogador.id}
            jogador={jogador}
            jogos={jogosPorJogador[jogador.id] ?? 0}
          />
        ))}
      </div>
    </div>
  );
}
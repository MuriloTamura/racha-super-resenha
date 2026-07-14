'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import type { Racha, Jogador } from '@/lib/database.types';
import { useParticipantesRealtime } from '@/hooks/useParticipantesRealtime';
import JogadorStatCard from '@/components/JogadorStatCard';
import AdicionarJogadorForm from '@/components/AdicionarJogadorForm';

function formatarData(dataISO: string) {
  const [ano, mes, dia] = dataISO.split('-');
  return `${dia}/${mes}/${ano}`;
}

export default function RachaPage() {
  const params = useParams();
  const rachaId = params.id as string;

  const [racha, setRacha] = useState<Racha | null>(null);
  const [jogadoresCadastrados, setJogadoresCadastrados] = useState<Jogador[]>([]);
  const [carregandoRacha, setCarregandoRacha] = useState(true);

  const { participantes, carregando: carregandoParticipantes, recarregar } =
    useParticipantesRealtime(rachaId);

  const buscarJogadoresCadastrados = useCallback(async () => {
    const { data } = await supabase.from('jogadores').select('*').order('nome');
    setJogadoresCadastrados(data ?? []);
  }, []);

  useEffect(() => {
    async function buscarRacha() {
      const { data } = await supabase.from('rachas').select('*').eq('id', rachaId).single();
      setRacha(data);
      setCarregandoRacha(false);
    }
    buscarRacha();
    buscarJogadoresCadastrados();
  }, [rachaId, buscarJogadoresCadastrados]);

  function handleJogadorAdicionado() {
    buscarJogadoresCadastrados();
    recarregar();
  }

  const idsJaNoRacha = new Set(participantes.map((p) => p.jogador_id));

  // Ranking do jogo: mais gols primeiro, depois assistências, depois defesas
  const participantesOrdenados = [...participantes].sort(
    (a, b) => b.gols - a.gols || b.assistencias - a.assistencias || b.defesas - a.defesas
  );

  if (carregandoRacha) {
    return <p className="text-white/40 text-sm">Carregando racha...</p>;
  }

  if (!racha) {
    return (
      <div className="text-center py-10">
        <p className="text-white/60">Racha não encontrado.</p>
        <Link href="/" className="text-racha-yellow underline text-sm mt-2 inline-block">
          Voltar para a lista
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link href="/" className="text-white/40 text-sm hover:text-racha-yellow">
          ← Todos os rachas
        </Link>
        <h2 className="font-display font-extrabold text-2xl text-racha-yellow mt-1">
          {racha.nome}
        </h2>
        <p className="text-white/60 text-sm mt-1">
          📅 {formatarData(racha.data)} &nbsp;•&nbsp; 📍 {racha.local}
        </p>
      </div>

      <AdicionarJogadorForm
        rachaId={rachaId}
        jogadoresCadastrados={jogadoresCadastrados}
        idsJaNoRacha={idsJaNoRacha}
        onAdicionado={handleJogadorAdicionado}
      />

      <div>
        <h3 className="text-white/50 text-sm font-semibold uppercase tracking-wide mb-3">
          Jogadores neste racha
        </h3>

        {carregandoParticipantes && <p className="text-white/40 text-sm">Carregando...</p>}

        {!carregandoParticipantes && participantesOrdenados.length === 0 && (
          <p className="text-white/40 text-sm">
            Nenhum jogador ainda. Adicione o primeiro acima! ⚽
          </p>
        )}

        <div className="flex flex-col gap-3">
          {participantesOrdenados.map((participante) => (
            <JogadorStatCard key={participante.id} participante={participante} />
          ))}
        </div>
      </div>
    </div>
  );
}
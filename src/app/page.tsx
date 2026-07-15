'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import type { Racha } from '@/lib/database.types';
import RachaCard from '@/components/RachaCard';

function hojeISO() {
  const hoje = new Date();
  const offset = hoje.getTimezoneOffset();
  const local = new Date(hoje.getTime() - offset * 60 * 1000);
  return local.toISOString().split('T')[0];
}

export default function HomePage() {
  const router = useRouter();

  const [rachas, setRachas] = useState<Racha[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const [nome, setNome] = useState('Racha Super Resenha');
  const [data, setData] = useState(hojeISO());
  const [local, setLocal] = useState('');

  useEffect(() => {
    buscarRachas();
  }, []);

  async function buscarRachas() {
    setCarregando(true);
    const { data: resultado, error } = await supabase
      .from('rachas')
      .select('*')
      .order('data', { ascending: false });

    if (error) {
      setErro('Não foi possível carregar os rachas. Tente recarregar a página.');
    } else {
      setRachas(resultado ?? []);
    }
    setCarregando(false);
  }

  async function criarRacha(e: React.FormEvent) {
    e.preventDefault();
    if (!local.trim()) {
      setErro('Preencha o local do racha.');
      return;
    }
    setEnviando(true);
    setErro(null);

    const { data: novoRacha, error } = await supabase
      .from('rachas')
      .insert({ nome: nome.trim() || 'Racha Super Resenha', data, local: local.trim() })
      .select()
      .single();

    if (error || !novoRacha) {
      setEnviando(false);
      setErro('Erro ao criar o racha. Tenta de novo.');
      return;
    }

    // Adiciona automaticamente todos os jogadores já cadastrados como
    // participantes desse racha novo, todos começando zerados (0 gol,
    // 0 assistência, 0 defesa) — o total histórico de cada um não é afetado.
    const { data: jogadoresCadastrados } = await supabase.from('jogadores').select('id');

    if (jogadoresCadastrados && jogadoresCadastrados.length > 0) {
      const participantesIniciais = jogadoresCadastrados.map((j) => ({
        racha_id: novoRacha.id,
        jogador_id: j.id,
        gols: 0,
        assistencias: 0,
        defesas: 0,
      }));

      await supabase.from('racha_jogadores').insert(participantesIniciais);
    }

    setEnviando(false);
    router.push(`/racha/${novoRacha.id}`);
  }

  return (
    <div className="flex flex-col gap-6">
      <button
        onClick={() => setMostrarForm((v) => !v)}
        className="btn-racha py-3 px-4 w-full"
      >
        {mostrarForm ? '✕ Cancelar' : '+ Criar novo racha'}
      </button>

      {mostrarForm && (
        <form
          onSubmit={criarRacha}
          className="card-racha p-4 flex flex-col gap-3 animate-in fade-in"
        >
          <div>
            <label className="text-sm text-white/60 block mb-1">Nome do racha</label>
            <input
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className="w-full bg-racha-black border border-white/10 rounded-lg px-3 py-2 focus:border-racha-yellow outline-none"
              placeholder="Racha Super Resenha"
            />
          </div>

          <div>
            <label className="text-sm text-white/60 block mb-1">Data</label>
            <input
              type="date"
              value={data}
              onChange={(e) => setData(e.target.value)}
              required
              className="w-full bg-racha-black border border-white/10 rounded-lg px-3 py-2 focus:border-racha-yellow outline-none"
            />
          </div>

          <div>
            <label className="text-sm text-white/60 block mb-1">Local</label>
            <input
              value={local}
              onChange={(e) => setLocal(e.target.value)}
              required
              className="w-full bg-racha-black border border-white/10 rounded-lg px-3 py-2 focus:border-racha-yellow outline-none"
              placeholder="Ex: Quadra do Zé"
            />
          </div>

          {erro && <p className="text-red-400 text-sm">{erro}</p>}

          <button type="submit" disabled={enviando} className="btn-racha py-2.5 mt-1 disabled:opacity-50">
            {enviando ? 'Criando...' : 'Criar racha'}
          </button>
        </form>
      )}

      {erro && !mostrarForm && <p className="text-red-400 text-sm">{erro}</p>}

      <div>
        <h2 className="text-white/50 text-sm font-semibold uppercase tracking-wide mb-3">
          Rachas
        </h2>

        {carregando && <p className="text-white/40 text-sm">Carregando...</p>}

        {!carregando && rachas.length === 0 && (
          <p className="text-white/40 text-sm">
            Nenhum racha cadastrado ainda. Crie o primeiro acima! ⚽
          </p>
        )}

        <div className="flex flex-col gap-3">
          {rachas.map((racha) => (
            <RachaCard key={racha.id} racha={racha} />
          ))}
        </div>
      </div>
    </div>
  );
}
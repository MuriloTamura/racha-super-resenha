'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import type { Racha } from '@/lib/database.types';

export default function EditarRachaPage() {
  const params = useParams();
  const router = useRouter();
  const rachaId = params.id as string;

  const [racha, setRacha] = useState<Racha | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [nome, setNome] = useState('');
  const [data, setData] = useState('');
  const [local, setLocal] = useState('');
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    async function buscar() {
      const { data: resultado } = await supabase
        .from('rachas')
        .select('*')
        .eq('id', rachaId)
        .single();

      if (resultado) {
        setRacha(resultado);
        setNome(resultado.nome);
        setData(resultado.data);
        setLocal(resultado.local);
      }
      setCarregando(false);
    }
    buscar();
  }, [rachaId]);

  async function salvar(e: React.FormEvent) {
    e.preventDefault();
    if (!local.trim()) {
      setErro('Preencha o local do racha.');
      return;
    }

    setSalvando(true);
    setErro(null);

    const { error } = await supabase
      .from('rachas')
      .update({ nome: nome.trim() || 'Racha Super Resenha', data, local: local.trim() })
      .eq('id', rachaId);

    setSalvando(false);

    if (error) {
      setErro('Erro ao salvar. Tenta de novo.');
      return;
    }

    router.push(`/racha/${rachaId}`);
  }

  if (carregando) {
    return <p className="text-white/40 text-sm">Carregando...</p>;
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
        <Link href={`/racha/${rachaId}`} className="text-white/40 text-sm hover:text-racha-yellow">
          ← Voltar para o racha
        </Link>
        <h2 className="font-display font-extrabold text-2xl text-racha-yellow mt-1">
          Editar racha
        </h2>
      </div>

      <form onSubmit={salvar} className="card-racha p-4 flex flex-col gap-3">
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

        <button type="submit" disabled={salvando} className="btn-racha py-2.5 mt-1 disabled:opacity-50">
          {salvando ? 'Salvando...' : 'Salvar alterações'}
        </button>
      </form>
    </div>
  );
}
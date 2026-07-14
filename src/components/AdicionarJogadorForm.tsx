'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { Jogador } from '@/lib/database.types';

export default function AdicionarJogadorForm({
  rachaId,
  jogadoresCadastrados,
  idsJaNoRacha,
  onAdicionado,
}: {
  rachaId: string;
  jogadoresCadastrados: Jogador[];
  idsJaNoRacha: Set<string>;
  onAdicionado: () => void;
}) {
  const [nome, setNome] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const disponiveis = jogadoresCadastrados.filter((j) => !idsJaNoRacha.has(j.id));

  async function adicionar(e: React.FormEvent) {
    e.preventDefault();
    const nomeLimpo = nome.trim();
    if (!nomeLimpo) return;

    setEnviando(true);
    setErro(null);

    // Verifica se já existe um jogador com esse nome (case-insensitive)
    const existente = jogadoresCadastrados.find(
      (j) => j.nome.toLowerCase() === nomeLimpo.toLowerCase()
    );

    let jogadorId = existente?.id;

    if (!jogadorId) {
      // Jogador novo: cadastra na tabela global
      const { data: novoJogador, error: erroJogador } = await supabase
        .from('jogadores')
        .insert({ nome: nomeLimpo })
        .select()
        .single();

      if (erroJogador || !novoJogador) {
        setErro('Erro ao cadastrar jogador. Tenta de novo.');
        setEnviando(false);
        return;
      }
      jogadorId = novoJogador.id;
    } else if (idsJaNoRacha.has(jogadorId)) {
      setErro(`${existente!.nome} já está nesse racha.`);
      setEnviando(false);
      return;
    }

    // Adiciona o jogador como participante desse racha
    const { error: erroParticipante } = await supabase
      .from('racha_jogadores')
      .insert({ racha_id: rachaId, jogador_id: jogadorId });

    setEnviando(false);

    if (erroParticipante) {
      setErro('Erro ao adicionar jogador no racha. Tenta de novo.');
      return;
    }

    setNome('');
    onAdicionado();
  }

  return (
    <form onSubmit={adicionar} className="card-racha p-4 flex flex-col gap-2">
      <label className="text-sm text-white/60">Adicionar jogador</label>
      <div className="flex gap-2">
        <input
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          list="jogadores-cadastrados"
          placeholder="Nome do jogador"
          className="flex-1 bg-racha-black border border-white/10 rounded-lg px-3 py-2 focus:border-racha-yellow outline-none"
        />
        <datalist id="jogadores-cadastrados">
          {disponiveis.map((j) => (
            <option key={j.id} value={j.nome} />
          ))}
        </datalist>
        <button type="submit" disabled={enviando || !nome.trim()} className="btn-racha px-4 disabled:opacity-50">
          {enviando ? '...' : '+'}
        </button>
      </div>
      {erro && <p className="text-red-400 text-sm">{erro}</p>}
      <p className="text-xs text-white/30">
        Digite um nome já cadastrado (aparece sugestão) ou um nome novo pra cadastrar na hora.
      </p>
    </form>
  );
}
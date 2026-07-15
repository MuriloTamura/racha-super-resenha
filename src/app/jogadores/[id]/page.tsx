'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import type { Jogador } from '@/lib/database.types';

function iniciais(nome: string) {
  const partes = nome.trim().split(/\s+/);
  const primeira = partes[0]?.[0] ?? '';
  const ultima = partes.length > 1 ? partes[partes.length - 1][0] : '';
  return (primeira + ultima).toUpperCase();
}

export default function EditarJogadorPage() {
  const params = useParams();
  const router = useRouter();
  const jogadorId = params.id as string;
  const inputFotoRef = useRef<HTMLInputElement>(null);

  const [jogador, setJogador] = useState<Jogador | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [nome, setNome] = useState('');
  const [previewFoto, setPreviewFoto] = useState<string | null>(null);
  const [arquivoFoto, setArquivoFoto] = useState<File | null>(null);
  const [salvando, setSalvando] = useState(false);
  const [enviandoFoto, setEnviandoFoto] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState(false);

  useEffect(() => {
    async function buscar() {
      const { data } = await supabase.from('jogadores').select('*').eq('id', jogadorId).single();
      if (data) {
        setJogador(data);
        setNome(data.nome);
      }
      setCarregando(false);
    }
    buscar();
  }, [jogadorId]);

  function handleSelecionarFoto(e: React.ChangeEvent<HTMLInputElement>) {
    const arquivo = e.target.files?.[0];
    if (!arquivo) return;

    if (arquivo.size > 5 * 1024 * 1024) {
      setErro('A foto precisa ter no máximo 5MB.');
      return;
    }

    setErro(null);
    setArquivoFoto(arquivo);
    setPreviewFoto(URL.createObjectURL(arquivo));
  }

  async function salvar(e: React.FormEvent) {
    e.preventDefault();
    if (!nome.trim() || !jogador) return;

    setSalvando(true);
    setErro(null);
    setSucesso(false);

    let fotoUrl = jogador.foto_url;

    // Se escolheu uma foto nova, faz o upload pro Storage primeiro
    if (arquivoFoto) {
      setEnviandoFoto(true);
      const extensao = arquivoFoto.name.split('.').pop();
      const caminho = `${jogadorId}-${Date.now()}.${extensao}`;

      const { error: erroUpload } = await supabase.storage
        .from('avatars')
        .upload(caminho, arquivoFoto, { upsert: true });

      setEnviandoFoto(false);

      if (erroUpload) {
        setErro('Erro ao enviar a foto. Tenta de novo.');
        setSalvando(false);
        return;
      }

      const { data: urlPublica } = supabase.storage.from('avatars').getPublicUrl(caminho);
      fotoUrl = urlPublica.publicUrl;
    }

    const { error: erroUpdate } = await supabase
      .from('jogadores')
      .update({ nome: nome.trim(), foto_url: fotoUrl })
      .eq('id', jogadorId);

    setSalvando(false);

    if (erroUpdate) {
      setErro('Erro ao salvar. Tenta de novo.');
      return;
    }

    setSucesso(true);
    setJogador({ ...jogador, nome: nome.trim(), foto_url: fotoUrl });
    setArquivoFoto(null);
  }

  if (carregando) {
    return <p className="text-white/40 text-sm">Carregando...</p>;
  }

  if (!jogador) {
    return (
      <div className="text-center py-10">
        <p className="text-white/60">Jogador não encontrado.</p>
        <Link href="/jogadores" className="text-racha-yellow underline text-sm mt-2 inline-block">
          Voltar para jogadores
        </Link>
      </div>
    );
  }

  const fotoExibida = previewFoto ?? jogador.foto_url;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link href="/jogadores" className="text-white/40 text-sm hover:text-racha-yellow">
          ← Todos os jogadores
        </Link>
        <h2 className="font-display font-extrabold text-2xl text-racha-yellow mt-1">
          Editar jogador
        </h2>
      </div>

      <form onSubmit={salvar} className="card-racha p-5 flex flex-col gap-5">
        {/* Foto */}
        <div className="flex flex-col items-center gap-3">
          <button
            type="button"
            onClick={() => inputFotoRef.current?.click()}
            className="relative group"
          >
            {fotoExibida ? (
              <img
                src={fotoExibida}
                alt={nome}
                className="w-28 h-28 rounded-full object-cover border-2 border-racha-yellow/40"
              />
            ) : (
              <div className="w-28 h-28 rounded-full bg-racha-yellow/10 border-2 border-racha-yellow/30 flex items-center justify-center font-display font-extrabold text-3xl text-racha-yellow">
                {iniciais(nome || '?')}
              </div>
            )}
            <div className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-sm font-semibold">
              Trocar
            </div>
          </button>
          <input
            ref={inputFotoRef}
            type="file"
            accept="image/*"
            onChange={handleSelecionarFoto}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => inputFotoRef.current?.click()}
            className="text-sm text-racha-yellow underline"
          >
            {jogador.foto_url ? 'Trocar foto' : 'Adicionar foto'}
          </button>
        </div>

        {/* Nome */}
        <div>
          <label className="text-sm text-white/60 block mb-1">Nome</label>
          <input
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            required
            className="w-full bg-racha-black border border-white/10 rounded-lg px-3 py-2 focus:border-racha-yellow outline-none"
          />
        </div>

        {/* Estatísticas (somente leitura, referência) */}
        <div className="grid grid-cols-3 gap-2 text-center bg-racha-black/50 rounded-xl py-3">
          <div>
            <p className="font-display font-bold text-lg text-racha-yellow">{jogador.gols}</p>
            <p className="text-[10px] text-white/40">⚽ Gols</p>
          </div>
          <div>
            <p className="font-display font-bold text-lg text-racha-yellow">
              {jogador.assistencias}
            </p>
            <p className="text-[10px] text-white/40">🎯 Assist.</p>
          </div>
          <div>
            <p className="font-display font-bold text-lg text-racha-yellow">{jogador.defesas}</p>
            <p className="text-[10px] text-white/40">🧤 Defesas</p>
          </div>
        </div>

        {erro && <p className="text-red-400 text-sm">{erro}</p>}
        {sucesso && <p className="text-green-400 text-sm">Salvo com sucesso! ✅</p>}

        <button type="submit" disabled={salvando} className="btn-racha py-3 disabled:opacity-50">
          {enviandoFoto ? 'Enviando foto...' : salvando ? 'Salvando...' : 'Salvar alterações'}
        </button>
      </form>
    </div>
  );
}
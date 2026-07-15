import Link from 'next/link';
import type { Jogador } from '@/lib/database.types';

// Pega as iniciais do nome pra usar como avatar quando não tem foto
function iniciais(nome: string) {
  const partes = nome.trim().split(/\s+/);
  const primeira = partes[0]?.[0] ?? '';
  const ultima = partes.length > 1 ? partes[partes.length - 1][0] : '';
  return (primeira + ultima).toUpperCase();
}

export default function JogadorCard({
  jogador,
  jogos,
}: {
  jogador: Jogador;
  jogos: number;
}) {
  const ga = jogador.gols + jogador.assistencias;

  return (
    <Link
      href={`/jogadores/${jogador.id}`}
      className="card-racha p-4 flex flex-col gap-3 hover:border-racha-yellow/50 transition-colors group"
    >
      <div className="flex items-center gap-3">
        {jogador.foto_url ? (
          <img
            src={jogador.foto_url}
            alt={jogador.nome}
            className="w-14 h-14 rounded-full object-cover border-2 border-racha-yellow/40"
          />
        ) : (
          <div className="w-14 h-14 rounded-full bg-racha-yellow/10 border-2 border-racha-yellow/30 flex items-center justify-center font-display font-extrabold text-racha-yellow">
            {iniciais(jogador.nome)}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="font-display font-bold text-white truncate group-hover:text-racha-yellow transition-colors">
            {jogador.nome}
          </p>
          <p className="text-xs text-white/40">
            🗓️ {jogos} {jogos === 1 ? 'jogo' : 'jogos'}
          </p>
        </div>
        <span className="text-white/20 text-lg group-hover:text-racha-yellow transition-colors">
          ✎
        </span>
      </div>

      <div className="grid grid-cols-4 gap-1 text-center">
        <div>
          <p className="font-display font-extrabold text-lg text-racha-yellow">{jogador.gols}</p>
          <p className="text-[10px] text-white/40">⚽ Gols</p>
        </div>
        <div>
          <p className="font-display font-extrabold text-lg text-racha-yellow">
            {jogador.assistencias}
          </p>
          <p className="text-[10px] text-white/40">🎯 Assist.</p>
        </div>
        <div>
          <p className="font-display font-extrabold text-lg text-racha-yellow">
            {jogador.defesas}
          </p>
          <p className="text-[10px] text-white/40">🧤 Defesas</p>
        </div>
        <div>
          <p className="font-display font-extrabold text-lg text-white">{ga}</p>
          <p className="text-[10px] text-white/40">G/A</p>
        </div>
      </div>
    </Link>
  );
}
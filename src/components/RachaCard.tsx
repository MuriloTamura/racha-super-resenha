import Link from 'next/link';
import type { Racha } from '@/lib/database.types';

function formatarData(dataISO: string) {
  const [ano, mes, dia] = dataISO.split('-');
  return `${dia}/${mes}/${ano}`;
}

export default function RachaCard({ racha }: { racha: Racha }) {
  return (
    <Link
      href={`/racha/${racha.id}`}
      className="card-racha flex items-center justify-between p-4 hover:border-racha-yellow/50 transition-colors group"
    >
      <div>
        <p className="font-display font-bold text-racha-yellow group-hover:text-racha-yellow-soft">
          {racha.nome}
        </p>
        <p className="text-sm text-white/60 mt-0.5">
          📅 {formatarData(racha.data)} &nbsp;•&nbsp; 📍 {racha.local}
        </p>
      </div>
      <span className="text-racha-yellow text-xl group-hover:translate-x-1 transition-transform">
        →
      </span>
    </Link>
  );
}
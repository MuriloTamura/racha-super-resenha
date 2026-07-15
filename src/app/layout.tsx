import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Racha Super Resenha',
  description: 'Estatísticas em tempo real do Racha Super Resenha ⚽',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body>
        <header className="border-b border-racha-yellow/20 bg-racha-black/80 backdrop-blur sticky top-0 z-20">
          <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-3">
            <a href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-racha-yellow flex items-center justify-center text-xl font-black text-racha-black shrink-0">
                ⚽
              </div>
              <div>
                <h1 className="font-display font-extrabold text-lg leading-tight text-racha-yellow tracking-tight">
                  RACHA SUPER RESENHA
                </h1>
                <p className="text-xs text-white/50 leading-tight">
                  Estatísticas em tempo real
                </p>
              </div>
            </a>
            <a
              href="/jogadores"
              className="ml-auto text-sm font-semibold text-white/70 hover:text-racha-yellow border border-white/10 hover:border-racha-yellow/40 rounded-lg px-3 py-1.5 transition-colors"
            >
              👥 Jogadores
            </a>
            <a
              href="/ranking"
              className="text-sm font-semibold text-white/70 hover:text-racha-yellow border border-white/10 hover:border-racha-yellow/40 rounded-lg px-3 py-1.5 transition-colors"
            >
              🏆 Ranking
            </a>
          </div>
        </header>

        <main className="max-w-3xl mx-auto px-4 py-6">{children}</main>

        <footer className="max-w-3xl mx-auto px-4 py-8 text-center text-xs text-white/30">
          Racha Super Resenha ⚽🖤💛
        </footer>
      </body>
    </html>
  );
}
// Tipos que espelham as tabelas do Supabase (schema criado na Parte 1)

export type Jogador = {
  id: string;
  nome: string;
  gols: number;
  assistencias: number;
  defesas: number;
  foto_url: string | null;
  created_at: string;
};

export type Racha = {
  id: string;
  nome: string;
  data: string; // formato YYYY-MM-DD
  local: string;
  created_at: string;
};

export type RachaJogador = {
  id: string;
  racha_id: string;
  jogador_id: string;
  gols: number;
  assistencias: number;
  defesas: number;
  created_at: string;
};

// Usado na tela do racha: participante + dados do jogador (nome, saldo total)
export type ParticipanteComJogador = RachaJogador & {
  jogadores: Jogador;
};

export type TipoStat = 'gols' | 'assistencias' | 'defesas';

// Tipagem completa do schema, usada ao criar o client do Supabase
export type Database = {
  public: {
    Tables: {
      jogadores: {
        Row: Jogador;
        Insert: Partial<Omit<Jogador, 'id' | 'created_at'>> & { nome: string };
        Update: Partial<Jogador>;
        Relationships: [];
      };
      rachas: {
        Row: Racha;
        Insert: Partial<Omit<Racha, 'id' | 'created_at'>> & {
          data: string;
          local: string;
        };
        Update: Partial<Racha>;
        Relationships: [];
      };
      racha_jogadores: {
        Row: RachaJogador;
        Insert: Partial<Omit<RachaJogador, 'id' | 'created_at'>> & {
          racha_id: string;
          jogador_id: string;
        };
        Update: Partial<RachaJogador>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      incrementar_stat: {
        Args: {
          p_racha_id: string;
          p_jogador_id: string;
          p_tipo_stat: TipoStat;
          p_delta?: number;
        };
        Returns: void;
      };
      remover_participante: {
        Args: {
          p_participante_id: string;
        };
        Returns: void;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
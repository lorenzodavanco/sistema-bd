export interface Usuario {
  idUsuario: number;
  nome: string;
  email: string;
  cargo: string;
  departamento: string;
}

export interface Avaliacao {
  idAvaliacao: number;
  titulo: string;
  descricao?: string;
  dataInicio: string;
  dataFim: string;
}

export type TipoQuestao = 'MULTIPLA_ESCOLHA' | 'TEXTO_LIVRE';

export interface Alternativa {
  idQuestao: number;
  idAlternativa: number;
  texto: string;
}

export interface Questao {
  idQuestao: number;
  enunciado: string;
  tipoQuestao: TipoQuestao;
}

export interface QuestaoComAlternativas extends Questao {
  alternativas?: Alternativa[];
}

export interface ComposicaoItem {
  idQuestao: number;
  enunciado?: string;
  tipoQuestao?: string;
  peso: number;
}

export interface Designacao {
  idDesignacao: number;
  idAvaliacao: number;
  idAvaliador: number;
  idAvaliado: number;
  avaliacaoTitulo?: string;
  avaliadorNome?: string;
  avaliadorCargo?: string;
  avaliadorDepartamento?: string;
  avaliadoNome?: string;
  avaliadoCargo?: string;
  avaliadoDepartamento?: string;
  respondida?: boolean;
}

export interface RespostaItem {
  idQuestao: number;
  valorResposta: string;
}

export interface Resposta {
  idResposta: number;
  idDesignacao: number;
  idQuestao: number;
  valorResposta: string;
}

// Relatórios
export interface RelatorioConsolidado {
  id_usuario: number;
  nome: string;
  cargo: string;
  departamento: string;
  media_ponderada: number;
  total_avaliadores: number;
  total_respostas_computadas: number;
}

export interface RelatorioRadar {
  id_questao: number;
  competencia: string;
  peso: number;
  media_avaliado: number;
  media_geral_empresa: number;
  total_avaliacoes_recebidas: number;
}

export interface RelatorioEvolucao {
  id_avaliacao: number;
  ciclo: string;
  data_inicio: string;
  data_fim: string;
  media_ponderada: number;
  total_avaliadores: number;
}

export interface RelatorioPendencia {
  id_designacao: number;
  avaliacao: string;
  id_avaliador: number;
  avaliador_nome: string;
  avaliador_email: string;
  avaliador_departamento: string;
  id_avaliado: number;
  avaliado_nome: string;
  avaliado_cargo: string;
  avaliado_departamento: string;
}

export interface RelatorioRanking {
  posicao_ranking: number;
  id_usuario: number;
  nome: string;
  cargo: string;
  departamento: string;
  media_ponderada: number;
  total_avaliadores: number;
}

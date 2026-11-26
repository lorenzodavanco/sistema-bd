import type {
  Usuario,
  Avaliacao,
  Questao,
  Alternativa,
  ComposicaoItem,
  Designacao,
  Resposta,
  RelatorioConsolidado,
  RelatorioRadar,
  RelatorioEvolucao,
  RelatorioPendencia,
  RelatorioRanking,
} from '../types';

const BASE_URL = '/api';

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${BASE_URL}${endpoint}`;
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const errorText = await response.text();
    let message = errorText;
    try {
      const parsed = JSON.parse(errorText);
      message = parsed.mensagem || parsed.message || parsed.erro || parsed.error || errorText;
    } catch {
      // Keep errorText
    }
    throw new Error(message || `Erro ${response.status}: ${response.statusText}`);
  }

  // If response has no content (204 or empty body)
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return response.json();
  }
  return {} as T;
}

export const api = {
  // Autenticação / Identificação
  auth: {
    login: (email: string) =>
      request<Usuario>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email }),
      }),
  },

  // Usuários
  usuarios: {
    listar: () => request<Usuario[]>('/usuarios'),
    buscarPorId: (id: number) => request<Usuario>(`/usuarios/${id}`),
    criar: (dados: Omit<Usuario, 'idUsuario'>) =>
      request<Usuario>('/usuarios', {
        method: 'POST',
        body: JSON.stringify(dados),
      }),
    atualizar: (id: number, dados: Partial<Usuario>) =>
      request<Usuario>(`/usuarios/${id}`, {
        method: 'PUT',
        body: JSON.stringify(dados),
      }),
    remover: (id: number) =>
      request<void>(`/usuarios/${id}`, {
        method: 'DELETE',
      }),
  },

  // Questões (RF1)
  questoes: {
    listar: () => request<Questao[]>('/questoes'),
    buscarPorId: (id: number) => request<Questao>(`/questoes/${id}`),
    listarAlternativas: (id: number) => request<Alternativa[]>(`/questoes/${id}/alternativas`),
    criar: (dados: {
      enunciado: string;
      tipoQuestao: string;
      alternativas?: { idAlternativa: number; texto: string }[];
    }) =>
      request<Questao>('/questoes', {
        method: 'POST',
        body: JSON.stringify(dados),
      }),
    atualizar: (
      id: number,
      dados: {
        enunciado: string;
        tipoQuestao: string;
        alternativas?: { idAlternativa: number; texto: string }[];
      }
    ) =>
      request<Questao>(`/questoes/${id}`, {
        method: 'PUT',
        body: JSON.stringify(dados),
      }),
    remover: (id: number) =>
      request<void>(`/questoes/${id}`, {
        method: 'DELETE',
      }),
  },

  // Avaliações (RF2 e RF3)
  avaliacoes: {
    listar: () => request<Avaliacao[]>('/avaliacoes'),
    buscarPorId: (id: number) => request<Avaliacao>(`/avaliacoes/${id}`),
    criar: (dados: Omit<Avaliacao, 'idAvaliacao'>) =>
      request<Avaliacao>('/avaliacoes', {
        method: 'POST',
        body: JSON.stringify(dados),
      }),
    atualizar: (id: number, dados: Partial<Avaliacao>) =>
      request<Avaliacao>(`/avaliacoes/${id}`, {
        method: 'PUT',
        body: JSON.stringify(dados),
      }),
    remover: (id: number) =>
      request<void>(`/avaliacoes/${id}`, {
        method: 'DELETE',
      }),
    // Composição com Pesos (RF3 + RF6)
    listarQuestoes: (idAvaliacao: number) =>
      request<ComposicaoItem[]>(`/avaliacoes/${idAvaliacao}/questoes`),
    salvarComposicao: (
      idAvaliacao: number,
      questoes: { idQuestao: number; peso: number }[]
    ) =>
      request<void>(`/avaliacoes/${idAvaliacao}/questoes`, {
        method: 'PUT',
        body: JSON.stringify({ questoes }),
      }),
    removerQuestao: (idAvaliacao: number, idQuestao: number) =>
      request<void>(`/avaliacoes/${idAvaliacao}/questoes/${idQuestao}`, {
        method: 'DELETE',
      }),
  },

  // Designações (RF4 e RF5)
  designacoes: {
    listar: (params?: { idAvaliacao?: number; idAvaliador?: number; idAvaliado?: number }) => {
      const search = new URLSearchParams();
      if (params?.idAvaliacao) search.set('idAvaliacao', params.idAvaliacao.toString());
      if (params?.idAvaliador) search.set('idAvaliador', params.idAvaliador.toString());
      if (params?.idAvaliado) search.set('idAvaliado', params.idAvaliado.toString());
      const query = search.toString() ? `?${search.toString()}` : '';
      return request<Designacao[]>(`/designacoes${query}`);
    },
    criar: (dados: { idAvaliacao: number; idAvaliador: number; idAvaliado: number }) =>
      request<Designacao>('/designacoes', {
        method: 'POST',
        body: JSON.stringify(dados),
      }),
    remover: (id: number) =>
      request<void>(`/designacoes/${id}`, {
        method: 'DELETE',
      }),
    // Respostas (RF5)
    listarRespostas: (idDesignacao: number) =>
      request<Resposta[]>(`/designacoes/${idDesignacao}/respostas`),
    submeterRespostas: (
      idDesignacao: number,
      respostas: { idQuestao: number; valorResposta: string }[]
    ) =>
      request<void>(`/designacoes/${idDesignacao}/respostas`, {
        method: 'POST',
        body: JSON.stringify({ respostas }),
      }),
  },

  // Relatórios Analíticos (RF7)
  relatorios: {
    consolidado: (idAvaliacao: number, minAvaliadores?: number) => {
      const search = new URLSearchParams({ idAvaliacao: idAvaliacao.toString() });
      if (minAvaliadores) search.set('minAvaliadores', minAvaliadores.toString());
      return request<RelatorioConsolidado[]>(`/relatorios/consolidado?${search.toString()}`);
    },
    competencias: (idAvaliacao: number, idAvaliado: number) =>
      request<RelatorioRadar[]>(
        `/relatorios/competencias?idAvaliacao=${idAvaliacao}&idAvaliado=${idAvaliado}`
      ),
    evolucao: (idAvaliado: number, dataInicio?: string, dataFim?: string) => {
      const search = new URLSearchParams({ idAvaliado: idAvaliado.toString() });
      if (dataInicio) search.set('dataInicio', dataInicio);
      if (dataFim) search.set('dataFim', dataFim);
      return request<RelatorioEvolucao[]>(`/relatorios/evolucao?${search.toString()}`);
    },
    pendencias: (idAvaliacao: number, departamentos: string[] = []) => {
      const search = new URLSearchParams({ idAvaliacao: idAvaliacao.toString() });
      departamentos.forEach((dep) => search.append('departamentos', dep));
      return request<RelatorioPendencia[]>(`/relatorios/pendencias?${search.toString()}`);
    },
    ranking: (idAvaliacao: number, departamento?: string, limite?: number) => {
      const search = new URLSearchParams({ idAvaliacao: idAvaliacao.toString() });
      if (departamento) search.set('departamento', departamento);
      if (limite) search.set('limite', limite.toString());
      return request<RelatorioRanking[]>(`/relatorios/ranking?${search.toString()}`);
    },
  },
};

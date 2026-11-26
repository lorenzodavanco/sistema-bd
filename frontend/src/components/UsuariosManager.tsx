import React, { useEffect, useState } from 'react';
import {
  Users,
  UserPlus,
  Trash2,
  Edit2,
  Search,
  CheckCircle,
  AlertCircle,
  X,
  Building2,
  Briefcase,
  Mail,
} from 'lucide-react';
import type { Usuario } from '../types';
import { api } from '../services/api';

interface UsuariosManagerProps {
  onRefreshUsuarios?: () => void;
}

export const UsuariosManager: React.FC<UsuariosManagerProps> = ({ onRefreshUsuarios }) => {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState('');
  const [filtroDept, setFiltroDept] = useState<string>('TODOS');
  const [feedback, setFeedback] = useState<{ tipo: 'sucesso' | 'erro'; texto: string } | null>(null);

  const [modalAberto, setModalAberto] = useState(false);
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [cargo, setCargo] = useState('');
  const [departamento, setDepartamento] = useState('');
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    carregarUsuarios();
  }, []);

  const carregarUsuarios = async () => {
    setLoading(true);
    try {
      const data = await api.usuarios.listar();
      setUsuarios(data);
    } catch (err: any) {
      setFeedback({ tipo: 'erro', texto: err.message || 'Erro ao carregar colaboradores' });
    } finally {
      setLoading(false);
    }
  };

  const departamentosUnicos = Array.from(new Set(usuarios.map((u) => u.departamento))).filter(Boolean);

  const abrirModalCriar = () => {
    setEditandoId(null);
    setNome('');
    setEmail('');
    setCargo('');
    setDepartamento(departamentosUnicos[0] || 'Tecnologia');
    setModalAberto(true);
  };

  const abrirModalEditar = (u: Usuario) => {
    setEditandoId(u.idUsuario);
    setNome(u.nome);
    setEmail(u.email);
    setCargo(u.cargo);
    setDepartamento(u.departamento);
    setModalAberto(true);
  };

  const handleSalvar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim() || !email.trim() || !cargo.trim() || !departamento.trim()) {
      setFeedback({ tipo: 'erro', texto: 'Todos os campos são obrigatórios.' });
      return;
    }

    setSalvando(true);
    try {
      const payload = {
        nome: nome.trim(),
        email: email.trim(),
        cargo: cargo.trim(),
        departamento: departamento.trim(),
      };

      if (editandoId) {
        await api.usuarios.atualizar(editandoId, payload);
        setFeedback({ tipo: 'sucesso', texto: 'Colaborador atualizado com sucesso!' });
      } else {
        await api.usuarios.criar(payload);
        setFeedback({ tipo: 'sucesso', texto: 'Colaborador cadastrado com sucesso!' });
      }

      setModalAberto(false);
      await carregarUsuarios();
      if (onRefreshUsuarios) onRefreshUsuarios();
    } catch (err: any) {
      setFeedback({ tipo: 'erro', texto: err.message || 'Falha ao salvar colaborador' });
    } finally {
      setSalvando(false);
    }
  };

  const handleExcluir = async (id: number, nomeColaborador: string) => {
    if (
      !window.confirm(
        `Tem certeza que deseja excluir o colaborador "${nomeColaborador}"? Suas designações e respostas também serão removidas.`
      )
    ) {
      return;
    }

    try {
      await api.usuarios.remover(id);
      setFeedback({ tipo: 'sucesso', texto: 'Colaborador removido com sucesso!' });
      await carregarUsuarios();
      if (onRefreshUsuarios) onRefreshUsuarios();
    } catch (err: any) {
      setFeedback({ tipo: 'erro', texto: err.message || 'Erro ao excluir colaborador' });
    }
  };

  const usuariosFiltrados = usuarios.filter((u) => {
    const matchDept = filtroDept === 'TODOS' || u.departamento === filtroDept;
    const termo = busca.toLowerCase();
    const matchBusca =
      !busca ||
      u.nome.toLowerCase().includes(termo) ||
      u.email.toLowerCase().includes(termo) ||
      u.cargo.toLowerCase().includes(termo) ||
      u.idUsuario.toString() === busca.trim();
    return matchDept && matchBusca;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs text-slate-500 font-semibold">
              Total: {usuarios.length} registrados
            </span>
          </div>
          <h2 className="text-xl font-extrabold text-[#171a4a] mt-1">
            Gestão de Usuários
          </h2>
        </div>

        <button
          onClick={abrirModalCriar}
          className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl text-sm font-bold text-[#000020] shadow transition hover:opacity-95 cursor-pointer self-start sm:self-auto"
          style={{ backgroundColor: '#ff9800' }}
        >
          <UserPlus size={18} />
          <span>Novo Colaborador</span>
        </button>
      </div>

      {feedback && (
        <div
          className={`flex items-center justify-between p-4 rounded-xl text-xs font-semibold ${
            feedback.tipo === 'sucesso'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}
        >
          <div className="flex items-center space-x-2">
            {feedback.tipo === 'sucesso' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
            <span>{feedback.texto}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="cursor-pointer">
            <X size={16} />
          </button>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por nome, email, cargo ou ID..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#ff9800]"
          />
        </div>

        <div className="flex items-center space-x-2">
          <Building2 size={18} className="text-slate-400 hidden sm:block" />
          <select
            value={filtroDept}
            onChange={(e) => setFiltroDept(e.target.value)}
            className="px-3 py-2 bg-white rounded-xl border border-slate-200 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#ff9800]"
          >
            <option value="TODOS">Todos os Departamentos ({usuarios.length})</option>
            {departamentosUnicos.map((dept) => (
              <option key={dept} value={dept}>
                {dept} ({usuarios.filter((u) => u.departamento === dept).length})
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-sm text-slate-500">Carregando colaboradores...</div>
      ) : usuariosFiltrados.length === 0 ? (
        <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center text-sm text-slate-500">
          Nenhum colaborador encontrado com os critérios de busca.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {usuariosFiltrados.map((u) => {
            const iniciais = u.nome
              .split(' ')
              .map((n) => n[0])
              .slice(0, 2)
              .join('')
              .toUpperCase();

            return (
              <div
                key={u.idUsuario}
                className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div
                        className="w-11 h-11 rounded-xl flex items-center justify-center font-bold text-white text-sm shadow"
                        style={{ backgroundColor: '#2f2c79' }}
                      >
                        {iniciais}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-[#171a4a] leading-tight">
                          {u.nome}
                        </h4>
                        <span className="text-[11px] text-slate-400 font-mono">ID #{u.idUsuario}</span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => abrirModalEditar(u)}
                        title="Editar Colaborador"
                        className="p-1 text-slate-400 hover:text-[#2f2c79] transition cursor-pointer"
                      >
                        <Edit2 size={15} />
                      </button>
                      <button
                        onClick={() => handleExcluir(u.idUsuario, u.nome)}
                        title="Excluir Colaborador"
                        className="p-1 text-slate-300 hover:text-rose-600 transition cursor-pointer"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-600 mb-3">
                    <div className="flex items-center space-x-2">
                      <Mail size={13} className="text-slate-400 shrink-0" />
                      <span className="truncate">{u.email}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Briefcase size={13} className="text-slate-400 shrink-0" />
                      <span className="truncate">{u.cargo}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <span
                    className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                    style={{
                      backgroundColor: '#ffcc50',
                      color: '#000020',
                    }}
                  >
                    {u.departamento}
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium">Ativo no AvaliaMAX</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {modalAberto && (
        <div className="fixed inset-0 z-50 bg-[#000020]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-slate-200">
            <div
              className="px-6 py-4 flex items-center justify-between text-white rounded-t-2xl"
              style={{ backgroundColor: '#171a4a' }}
            >
              <div className="flex items-center space-x-2">
                <Users size={20} style={{ color: '#ffcc50' }} />
                <h3 className="font-bold text-base">
                  {editandoId ? `Editar Colaborador #${editandoId}` : 'Novo Colaborador'}
                </h3>
              </div>
              <button
                onClick={() => setModalAberto(false)}
                className="text-slate-300 hover:text-white cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSalvar} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Nome Completo *
                </label>
                <input
                  type="text"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Ex: Carlos Eduardo Silva"
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#ff9800]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  E-mail Corporativo * (Único)
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Ex: carlos.silva@empresa.com"
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#ff9800]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Cargo *
                  </label>
                  <input
                    type="text"
                    value={cargo}
                    onChange={(e) => setCargo(e.target.value)}
                    placeholder="Ex: Tech Lead"
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#ff9800]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Departamento *
                  </label>
                  <input
                    type="text"
                    value={departamento}
                    onChange={(e) => setDepartamento(e.target.value)}
                    placeholder="Ex: Tecnologia"
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#ff9800]"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalAberto(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={salvando}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold text-[#000020] shadow transition hover:opacity-95 disabled:opacity-50 cursor-pointer"
                  style={{ backgroundColor: '#ff9800' }}
                >
                  {salvando ? 'Salvando...' : editandoId ? 'Atualizar' : 'Cadastrar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

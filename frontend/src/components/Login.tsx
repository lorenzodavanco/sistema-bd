import React, { useState } from 'react';
import { LogIn, AlertCircle } from 'lucide-react';
import type { Usuario } from '../types';
import { api } from '../services/api';

interface LoginProps {
  onLogin: (usuario: Usuario) => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);

  const entrar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setErro('Informe seu email.');
      return;
    }
    setCarregando(true);
    setErro('');
    try {
      const usuario = await api.auth.login(email.trim());
      onLogin(usuario);
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Não foi possível entrar.');
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: 'linear-gradient(135deg, #171a4a 0%, #2f2c79 65%, #000020 100%)' }}
    >
      <form onSubmit={entrar} className="w-full max-w-sm bg-white rounded-2xl shadow-2xl p-8 space-y-5">
        <div className="flex flex-col items-center space-y-3">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-md font-black text-white text-2xl"
            style={{ backgroundColor: '#ff9800' }}
          >
            360°
          </div>
          <h1 className="text-xl font-extrabold text-[#171a4a]">Avaliações 360°</h1>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="email" className="text-xs font-bold text-slate-600 uppercase tracking-wider">
            Email
          </label>
          <input
            id="email"
            type="email"
            autoFocus
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="ana.souza@empresa.com"
            className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#ff9800] focus:border-transparent"
          />
        </div>

        {erro && (
          <div className="flex items-start space-x-2 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs">
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
            <span>{erro}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={carregando}
          className="w-full flex items-center justify-center space-x-2 py-2.5 rounded-xl text-sm font-bold text-[#000020] shadow-md transition hover:brightness-105 disabled:opacity-60 cursor-pointer"
          style={{ backgroundColor: '#ff9800' }}
        >
          <LogIn size={16} />
          <span>{carregando ? 'Entrando...' : 'Entrar'}</span>
        </button>
      </form>
    </div>
  );
};

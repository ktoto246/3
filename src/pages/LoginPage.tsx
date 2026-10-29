import React, { useState } from 'react';
import { User, Page } from '../types';
import { Lock, User as UserIcon, Phone, AlertCircle, ArrowRight } from 'lucide-react';
import { db } from '../database';

interface LoginPageProps {
  onLoginSuccess: (user: User) => void;
  onNavigate: (page: Page) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onLoginSuccess,
  onNavigate,
}) => {
  const [tab, setTab] = useState<'login' | 'register'>('login');

  // Login form state
  const [username, setUsername] = useState('client');
  const [password, setPassword] = useState('123');

  // Register form state
  const [regUsername, setRegUsername] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regName, setRegName] = useState('');
  const [regPhone, setRegPhone] = useState('+7 ');
  const [regEmail, setRegEmail] = useState('');

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setErrorMessage('Введите логин и пароль');
      return;
    }

    setLoading(true);
    setErrorMessage('');

    try {
      const res = db.login(username.trim(), password.trim());
      if (res.success && res.user) {
        onLoginSuccess(res.user);
        onNavigate('profile');
      } else {
        setErrorMessage(res.error || 'Неверный логин или пароль');
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Ошибка входа');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regUsername.trim() || !regPassword.trim() || !regName.trim() || regPhone.trim().length < 8) {
      setErrorMessage('Заполните обязательные поля: логин, пароль, имя и телефон');
      return;
    }

    setLoading(true);
    setErrorMessage('');

    try {
      const res = db.register({
        username: regUsername.trim(),
        pass: regPassword.trim(),
        name: regName.trim(),
        phone: regPhone.trim(),
        email: regEmail.trim() || undefined,
      });

      if (res.success && res.user) {
        onLoginSuccess(res.user);
        onNavigate('profile');
      } else {
        setErrorMessage(res.error || 'Ошибка при регистрации');
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Ошибка регистрации');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFill = (u: string, p: string) => {
    setUsername(u);
    setPassword(p);
  };

  return (
    <div className="py-12 max-w-md mx-auto px-4 space-y-6">
      {/* Box */}
      <div className="bg-white border border-neutral-200 rounded-3xl p-6 sm:p-8 shadow-md">
        {/* Switcher */}
        <div className="flex border-b border-neutral-200 mb-6 pb-2">
          <button
            onClick={() => {
              setTab('login');
              setErrorMessage('');
            }}
            className={`flex-1 py-2 text-xs font-bold transition-colors cursor-pointer text-center ${
              tab === 'login'
                ? 'text-neutral-950 border-b-2 border-neutral-950 font-black'
                : 'text-neutral-500 hover:text-neutral-900'
            }`}
          >
            Вход по логину
          </button>
          <button
            onClick={() => {
              setTab('register');
              setErrorMessage('');
            }}
            className={`flex-1 py-2 text-xs font-bold transition-colors cursor-pointer text-center ${
              tab === 'register'
                ? 'text-neutral-950 border-b-2 border-neutral-950 font-black'
                : 'text-neutral-500 hover:text-neutral-900'
            }`}
          >
            Регистрация клиента
          </button>
        </div>

        {errorMessage && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-800 rounded-xl text-xs flex items-center gap-2 mb-4">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* LOGIN FORM */}
        {tab === 'login' ? (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-neutral-800 uppercase tracking-wider mb-1">
                Логин
              </label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-neutral-400 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  placeholder="Ваш логин"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 text-xs bg-neutral-50 border border-neutral-300 rounded-xl focus:outline-none focus:border-amber-500 font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-800 uppercase tracking-wider mb-1">
                Пароль
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-neutral-400 absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  placeholder="Ваш пароль"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 text-xs bg-neutral-50 border border-neutral-300 rounded-xl focus:outline-none focus:border-amber-500 font-mono"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-neutral-950 hover:bg-amber-500 hover:text-neutral-950 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
            >
              <span>{loading ? 'Проверка...' : 'Войти в систему'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        ) : (
          /* REGISTER FORM */
          <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-bold text-neutral-800 uppercase tracking-wider mb-1">
                ФИО или название компании *
              </label>
              <input
                type="text"
                required
                placeholder="Иван Иванов / ООО «Заря»"
                value={regName}
                onChange={(e) => setRegName(e.target.value)}
                className="w-full p-2.5 text-xs bg-neutral-50 border border-neutral-300 rounded-xl focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-800 uppercase tracking-wider mb-1">
                Телефон *
              </label>
              <input
                type="tel"
                required
                placeholder="+7 (905) 000-00-00"
                value={regPhone}
                onChange={(e) => setRegPhone(e.target.value)}
                className="w-full p-2.5 text-xs bg-neutral-50 border border-neutral-300 rounded-xl focus:outline-none focus:border-amber-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-800 uppercase tracking-wider mb-1">
                Придумайте логин *
              </label>
              <input
                type="text"
                required
                placeholder="ivan_client"
                value={regUsername}
                onChange={(e) => setRegUsername(e.target.value)}
                className="w-full p-2.5 text-xs bg-neutral-50 border border-neutral-300 rounded-xl focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-800 uppercase tracking-wider mb-1">
                Придумайте пароль *
              </label>
              <input
                type="password"
                required
                placeholder="Пароль"
                value={regPassword}
                onChange={(e) => setRegPassword(e.target.value)}
                className="w-full p-2.5 text-xs bg-neutral-50 border border-neutral-300 rounded-xl focus:outline-none focus:border-amber-500 font-mono"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-neutral-950 hover:bg-amber-500 hover:text-neutral-950 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 mt-2"
            >
              <span>{loading ? 'Создание...' : 'Зарегистрироваться'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}
      </div>

      {/* Demo Credentials Helper Box (Essential for testing and presentation) */}
      <div className="bg-neutral-100 border border-neutral-200 rounded-2xl p-5 text-xs space-y-3">
        <div className="font-bold text-neutral-800 text-[11px] uppercase tracking-wider">
          Тестовые аккаунты для демонстрации ролей:
        </div>
        <div className="grid grid-cols-2 gap-2 text-[11px]">
          <button
            type="button"
            onClick={() => handleQuickFill('client', '123')}
            className="p-2 bg-white rounded-lg border border-neutral-200 text-left hover:border-amber-400 cursor-pointer"
          >
            <div className="font-bold text-neutral-900">1. Заказчик (Клиент)</div>
            <div className="font-mono text-neutral-500">client / 123</div>
          </button>

          <button
            type="button"
            onClick={() => handleQuickFill('manager', '123')}
            className="p-2 bg-white rounded-lg border border-neutral-200 text-left hover:border-amber-400 cursor-pointer"
          >
            <div className="font-bold text-neutral-900">2. Диспетчер / Менеджер</div>
            <div className="font-mono text-neutral-500">manager / 123</div>
          </button>

          <button
            type="button"
            onClick={() => handleQuickFill('master', '123')}
            className="p-2 bg-white rounded-lg border border-neutral-200 text-left hover:border-amber-400 cursor-pointer"
          >
            <div className="font-bold text-neutral-900">3. Мастер цеха</div>
            <div className="font-mono text-neutral-500">master / 123</div>
          </button>

          <button
            type="button"
            onClick={() => handleQuickFill('admin', '123')}
            className="p-2 bg-white rounded-lg border border-neutral-200 text-left hover:border-amber-400 cursor-pointer"
          >
            <div className="font-bold text-neutral-900">4. Администратор</div>
            <div className="font-mono text-neutral-500">admin / 123</div>
          </button>
        </div>
        <p className="text-[10px] text-neutral-500">
          Нажмите на любой аккаунт выше, чтобы подставить логин и пароль.
        </p>
      </div>
    </div>
  );
};

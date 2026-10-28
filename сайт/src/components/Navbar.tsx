import React from 'react';
import { Page, User } from '../types';
import { ShoppingCart, User as UserIcon, LogOut, Menu, X, Layers, Wrench, Shield, Database } from 'lucide-react';

interface NavbarProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
  cartCount: number;
  currentUser: User | null;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentPage,
  onNavigate,
  cartCount,
  currentUser,
  onLogout,
}) => {
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const handleNav = (p: Page) => {
    onNavigate(p);
    setMobileOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-neutral-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-4">
          {/* Brand */}
          <button
            onClick={() => {
              if (!currentUser || currentUser.role === 'client') handleNav('home');
              else handleNav('profile');
            }}
            className="flex items-center gap-2.5 text-left cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-lg bg-neutral-950 text-white flex items-center justify-center font-black text-lg group-hover:bg-amber-500 transition-colors">
              А
            </div>
            <div>
              <span className="text-lg font-black tracking-tight text-neutral-950">
                АЛФАВИТ
              </span>
              <span className="hidden sm:inline-block text-[11px] font-mono text-neutral-500 ml-2">
                г. Балашов
              </span>
            </div>
          </button>

          {/* Desktop Navigation Links (STRICTLY ROLE-BASED) */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-semibold text-neutral-700">
            {/* GUEST (NOT LOGGED IN): Only Home and Services */}
            {!currentUser && (
              <>
                <button
                  onClick={() => handleNav('home')}
                  className={`hover:text-amber-600 transition-colors cursor-pointer py-1 ${
                    currentPage === 'home' ? 'text-amber-600 border-b-2 border-amber-500' : ''
                  }`}
                >
                  Главная
                </button>
                <button
                  onClick={() => handleNav('services')}
                  className={`hover:text-amber-600 transition-colors cursor-pointer py-1 ${
                    currentPage === 'services' ? 'text-amber-600 border-b-2 border-amber-500' : ''
                  }`}
                >
                  Услуги и цены
                </button>
              </>
            )}

            {/* CLIENT: Home, Services, My Orders */}
            {currentUser && currentUser.role === 'client' && (
              <>
                <button
                  onClick={() => handleNav('home')}
                  className={`hover:text-amber-600 transition-colors cursor-pointer py-1 ${
                    currentPage === 'home' ? 'text-amber-600 border-b-2 border-amber-500' : ''
                  }`}
                >
                  Главная
                </button>
                <button
                  onClick={() => handleNav('services')}
                  className={`hover:text-amber-600 transition-colors cursor-pointer py-1 ${
                    currentPage === 'services' ? 'text-amber-600 border-b-2 border-amber-500' : ''
                  }`}
                >
                  Каталог услуг
                </button>
                <button
                  onClick={() => handleNav('orders')}
                  className={`hover:text-amber-600 transition-colors cursor-pointer py-1 ${
                    currentPage === 'orders' ? 'text-amber-600 border-b-2 border-amber-500' : ''
                  }`}
                >
                  Мои заказы
                </button>
              </>
            )}

            {/* MANAGER / DISPATCHER: ONLY 1 single workspace tab! */}
            {currentUser && currentUser.role === 'manager' && (
              <button
                onClick={() => handleNav('profile')}
                className={`flex items-center gap-2 hover:text-amber-600 transition-colors cursor-pointer py-1 font-bold ${
                  currentPage === 'profile' ? 'text-amber-600 border-b-2 border-amber-500' : ''
                }`}
              >
                <Layers className="w-4 h-4 text-amber-600" />
                <span>Диспетчерская заказов</span>
              </button>
            )}

            {/* MASTER: ONLY 1 single workspace tab! */}
            {currentUser && currentUser.role === 'master' && (
              <button
                onClick={() => handleNav('profile')}
                className={`flex items-center gap-2 hover:text-amber-600 transition-colors cursor-pointer py-1 font-bold ${
                  currentPage === 'profile' ? 'text-amber-600 border-b-2 border-amber-500' : ''
                }`}
              >
                <Wrench className="w-4 h-4 text-amber-600" />
                <span>Заказы в цехе</span>
              </button>
            )}

            {/* ADMIN: Management & Materials */}
            {currentUser && currentUser.role === 'admin' && (
              <>
                <button
                  onClick={() => handleNav('profile')}
                  className={`flex items-center gap-2 hover:text-amber-600 transition-colors cursor-pointer py-1 font-bold ${
                    currentPage === 'profile' ? 'text-amber-600 border-b-2 border-amber-500' : ''
                  }`}
                >
                  <Shield className="w-4 h-4 text-amber-600" />
                  <span>Управление предприятием</span>
                </button>
                <button
                  onClick={() => handleNav('materials')}
                  className={`flex items-center gap-2 hover:text-amber-600 transition-colors cursor-pointer py-1 font-bold ${
                    currentPage === 'materials' ? 'text-amber-600 border-b-2 border-amber-500' : ''
                  }`}
                >
                  <Database className="w-4 h-4 text-neutral-600" />
                  <span>Склад материалов</span>
                </button>
              </>
            )}
          </nav>

          {/* Right Controls: Cart & Profile */}
          <div className="flex items-center gap-3">
            {/* Cart Button: ONLY visible for logged in client! (Not for guest or staff) */}
            {currentUser && currentUser.role === 'client' && (
              <button
                onClick={() => handleNav('cart')}
                className={`relative p-2.5 rounded-xl border transition-all cursor-pointer flex items-center gap-2 ${
                  currentPage === 'cart'
                    ? 'border-amber-500 bg-amber-50 text-neutral-950'
                    : 'border-neutral-200 bg-neutral-50 text-neutral-700 hover:bg-neutral-100'
                }`}
                title="Корзина заказа"
              >
                <ShoppingCart className="w-4 h-4" />
                <span className="text-xs font-bold hidden sm:inline">Корзина</span>
                {cartCount > 0 && (
                  <span className="w-5 h-5 rounded-full bg-amber-500 text-neutral-950 text-[11px] font-black flex items-center justify-center font-mono">
                    {cartCount}
                  </span>
                )}
              </button>
            )}

            {/* Profile / Login */}
            {currentUser ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleNav('profile')}
                  className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 border ${
                    currentPage === 'profile'
                      ? 'border-neutral-950 bg-neutral-950 text-white'
                      : 'border-neutral-200 bg-white text-neutral-800 hover:border-neutral-300'
                  }`}
                >
                  <UserIcon className="w-3.5 h-3.5 text-amber-500" />
                  <span className="max-w-[130px] truncate">{currentUser.name.split(' ')[0]}</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-neutral-100 text-neutral-700 uppercase">
                    {currentUser.role === 'admin'
                      ? 'Админ'
                      : currentUser.role === 'manager'
                      ? 'Диспетчер'
                      : currentUser.role === 'master'
                      ? 'Мастер'
                      : 'Клиент'}
                  </span>
                </button>

                <button
                  onClick={onLogout}
                  title="Выйти из системы"
                  className="p-2 text-neutral-400 hover:text-neutral-900 rounded-lg hover:bg-neutral-100 cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => handleNav('login')}
                className="px-4 py-2 text-xs font-bold text-white bg-neutral-950 hover:bg-amber-500 hover:text-neutral-950 rounded-xl transition-colors cursor-pointer flex items-center gap-2"
              >
                <UserIcon className="w-3.5 h-3.5" />
                <span>Войти в систему</span>
              </button>
            )}

            {/* Mobile Hamburger */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 text-neutral-700 hover:bg-neutral-100 rounded-lg"
              aria-label="Меню"
            >
              {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="md:hidden border-t border-neutral-200 bg-white px-4 py-4 space-y-2">
          {!currentUser && (
            <>
              <button
                onClick={() => handleNav('home')}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm font-semibold ${
                  currentPage === 'home' ? 'bg-amber-50 text-amber-800' : 'text-neutral-800'
                }`}
              >
                Главная
              </button>
              <button
                onClick={() => handleNav('services')}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm font-semibold ${
                  currentPage === 'services' ? 'bg-amber-50 text-amber-800' : 'text-neutral-800'
                }`}
              >
                Услуги и цены
              </button>
              <button
                onClick={() => handleNav('login')}
                className="w-full text-left px-3 py-2 rounded-lg text-sm font-bold text-amber-700"
              >
                Войти в систему
              </button>
            </>
          )}

          {currentUser && currentUser.role === 'client' && (
            <>
              <button
                onClick={() => handleNav('home')}
                className="w-full text-left px-3 py-2 rounded-lg text-sm font-semibold text-neutral-800"
              >
                Главная
              </button>
              <button
                onClick={() => handleNav('services')}
                className="w-full text-left px-3 py-2 rounded-lg text-sm font-semibold text-neutral-800"
              >
                Каталог услуг
              </button>
              <button
                onClick={() => handleNav('orders')}
                className="w-full text-left px-3 py-2 rounded-lg text-sm font-semibold text-neutral-800"
              >
                Мои заказы
              </button>
              <button
                onClick={() => handleNav('cart')}
                className="w-full text-left px-3 py-2 rounded-lg text-sm font-semibold flex items-center justify-between text-neutral-800"
              >
                <span>Корзина</span>
                {cartCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-amber-500 text-neutral-950 font-bold text-xs">
                    {cartCount}
                  </span>
                )}
              </button>
              <button
                onClick={() => handleNav('profile')}
                className="w-full text-left px-3 py-2 rounded-lg text-sm font-semibold text-neutral-800"
              >
                Профиль ({currentUser.name})
              </button>
            </>
          )}

          {currentUser && currentUser.role === 'manager' && (
            <button
              onClick={() => handleNav('profile')}
              className="w-full text-left px-3 py-2 rounded-lg text-sm font-bold text-amber-700"
            >
              Диспетчерская заказов
            </button>
          )}

          {currentUser && currentUser.role === 'master' && (
            <button
              onClick={() => handleNav('profile')}
              className="w-full text-left px-3 py-2 rounded-lg text-sm font-bold text-amber-700"
            >
              Заказы в цехе
            </button>
          )}

          {currentUser && currentUser.role === 'admin' && (
            <>
              <button
                onClick={() => handleNav('profile')}
                className="w-full text-left px-3 py-2 rounded-lg text-sm font-bold text-amber-700"
              >
                Управление предприятием
              </button>
              <button
                onClick={() => handleNav('materials')}
                className="w-full text-left px-3 py-2 rounded-lg text-sm font-semibold text-neutral-800"
              >
                Склад материалов
              </button>
            </>
          )}
        </div>
      )}
    </header>
  );
};

import React, { useState, useEffect } from 'react';
import { Page, User, CartItem } from './types';
import { Navbar } from './components/Navbar';
import { HomePage } from './pages/HomePage';
import { ServicesPage } from './pages/ServicesPage';
import { OrdersPage } from './pages/OrdersPage';
import { CartPage } from './pages/CartPage';
import { ProfilePage } from './pages/ProfilePage';
import { LoginPage } from './pages/LoginPage';
import { MaterialsPage } from './pages/MaterialsPage';

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem('alfavit_user');
      if (saved) return JSON.parse(saved);
    } catch {
      //
    }
    return null; // Guest mode by default as requested!
  });

  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('alfavit_cart');
      if (saved) return JSON.parse(saved);
    } catch {
      //
    }
    return [];
  });

  const [highlightOrderCode, setHighlightOrderCode] = useState<string | null>(null);

  useEffect(() => {
    try {
      if (currentUser) {
        localStorage.setItem('alfavit_user', JSON.stringify(currentUser));
      } else {
        localStorage.removeItem('alfavit_user');
      }
    } catch {
      //
    }
  }, [currentUser]);

  useEffect(() => {
    try {
      localStorage.setItem('alfavit_cart', JSON.stringify(cart));
    } catch {
      //
    }
  }, [cart]);

  const handleAddToCart = (item: CartItem) => {
    setCart((prev) => [...prev, item]);
  };

  const handleRemoveFromCart = (itemId: string) => {
    setCart((prev) => prev.filter((it) => it.id !== itemId));
  };

  const handleClearCart = () => {
    setCart([]);
  };

  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    setCurrentPage('profile');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentPage('home');
  };

  const handleOrderSuccess = (orderCode: string) => {
    setHighlightOrderCode(orderCode);
  };

  const handleNavigate = (page: Page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900 flex flex-col font-sans">
      {/* Role-based Top Navbar */}
      <Navbar
        currentPage={currentPage}
        onNavigate={handleNavigate}
        cartCount={cart.length}
        currentUser={currentUser}
        onLogout={handleLogout}
      />

      {/* Page Routing */}
      <main className="flex-1">
        {currentPage === 'home' && (
          <HomePage onNavigate={handleNavigate} currentUser={currentUser} />
        )}

        {currentPage === 'services' && (
          <ServicesPage
            onAddToCart={handleAddToCart}
            onNavigate={handleNavigate}
            cartCount={cart.length}
            currentUser={currentUser}
          />
        )}

        {currentPage === 'cart' && (
          <CartPage
            cartItems={cart}
            onRemoveItem={handleRemoveFromCart}
            onClearCart={handleClearCart}
            currentUser={currentUser}
            onNavigate={handleNavigate}
            onOrderSuccess={handleOrderSuccess}
          />
        )}

        {currentPage === 'orders' && (
          <OrdersPage
            currentUser={currentUser}
            onNavigate={handleNavigate}
            highlightCode={highlightOrderCode}
          />
        )}

        {currentPage === 'profile' && (
          currentUser ? (
            <ProfilePage
              currentUser={currentUser}
              onLogout={handleLogout}
              onNavigate={handleNavigate}
              onUpdateCurrentUser={(updated) => setCurrentUser(updated)}
            />
          ) : (
            <LoginPage
              onLoginSuccess={handleLoginSuccess}
              onNavigate={handleNavigate}
            />
          )
        )}

        {currentPage === 'materials' && (
          <MaterialsPage onNavigate={handleNavigate} />
        )}

        {currentPage === 'login' && (
          <LoginPage
            onLoginSuccess={handleLoginSuccess}
            onNavigate={handleNavigate}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-neutral-900 text-neutral-400 text-xs py-8 border-t border-neutral-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <div className="font-bold text-white text-sm">ООО Рекламно-производственное агентство «Алфавит»</div>
            <div className="text-[11px] text-neutral-500 mt-0.5">г. Балашов, ул. Володарского, 32 · Тел: +7 (84545) 4-12-80</div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <a
              href="/presentation_alfavit.html"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 bg-neutral-800 hover:bg-amber-500 hover:text-neutral-950 text-neutral-200 rounded-lg font-bold transition-colors flex items-center gap-1.5"
            >
              <span>📊 Презентация (.html)</span>
            </a>
            <a
              href="/poyasnitelnaya_zapiska_alfavit.docx"
              download
              className="px-3 py-1.5 bg-neutral-800 hover:bg-amber-500 hover:text-neutral-950 text-neutral-200 rounded-lg font-bold transition-colors flex items-center gap-1.5"
            >
              <span>📄 Записка (.docx)</span>
            </a>
            <a
              href="/poyasnitelnaya_zapiska_alfavit.txt"
              download
              className="px-3 py-1.5 bg-neutral-800 hover:bg-amber-500 hover:text-neutral-950 text-neutral-200 rounded-lg font-bold transition-colors flex items-center gap-1.5"
            >
              <span>📝 Текст (.txt)</span>
            </a>
            <a
              href="/standalone_alfavit.html"
              download
              className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-neutral-950 rounded-lg font-black transition-colors"
            >
              <span>⚡ Автономный сайт (.html)</span>
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

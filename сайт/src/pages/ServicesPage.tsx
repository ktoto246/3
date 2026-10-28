import React, { useState, useEffect } from 'react';
import { Service, CartItem, Page, User } from '../types';
import { db } from '../database';
import { ShoppingCart, Check, Plus, Minus, ArrowRight, LogIn } from 'lucide-react';

interface ServicesPageProps {
  onAddToCart: (item: CartItem) => void;
  onNavigate: (page: Page) => void;
  cartCount: number;
  currentUser: User | null;
}

export const ServicesPage: React.FC<ServicesPageProps> = ({
  onAddToCart,
  onNavigate,
  cartCount,
  currentUser,
}) => {
  const [services, setServices] = useState<Service[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [addedNotice, setAddedNotice] = useState<string | null>(null);

  useEffect(() => {
    const list = db.getServices();
    setServices(list);
    const initialQty: Record<string, number> = {};
    list.forEach((s: Service) => {
      initialQty[s.id] = s.defaultQty;
    });
    setQuantities(initialQty);
  }, []);

  const categories = ['all', 'Полиграфия', 'Наружная реклама', 'Широкоформатная печать', 'Сувениры'];

  const filteredServices = activeCategory === 'all'
    ? services
    : services.filter((s) => s.category === activeCategory);

  const handleQtyChange = (serviceId: string, delta: number, minQty: number, step: number) => {
    setQuantities((prev) => {
      const current = prev[serviceId] || minQty;
      const next = Math.max(minQty, current + delta * step);
      return { ...prev, [serviceId]: next };
    });
  };

  const handleManualQtyChange = (serviceId: string, val: number, minQty: number) => {
    setQuantities((prev) => ({
      ...prev,
      [serviceId]: Math.max(minQty, val),
    }));
  };

  const handleAdd = (service: Service) => {
    if (!currentUser) {
      onNavigate('login');
      return;
    }

    const qty = quantities[service.id] || service.defaultQty;
    const note = notes[service.id] || '';
    const totalPrice = Math.round(qty * service.unitPrice);

    const cartItem: CartItem = {
      id: `cart-${Date.now()}-${Math.random()}`,
      serviceId: service.id,
      title: service.title,
      category: service.category,
      quantity: qty,
      unit: service.unit,
      unitPrice: service.unitPrice,
      totalPrice,
      customNotes: note.trim() || undefined,
    };

    onAddToCart(cartItem);
    setAddedNotice(`«${service.title}» (${qty} ${service.unit}) добавлено в корзину!`);
    setTimeout(() => setAddedNotice(null), 3000);
  };

  return (
    <div className="py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-neutral-200 pb-6">
        <div>
          <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">
            Каталог рекламно-производственных услуг
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-neutral-950 mt-1">
            Выбор услуг и формирование заказа
          </h1>
          <p className="text-xs sm:text-sm text-neutral-600 mt-1">
            Выберите количество визиток, площадь баннера или число световых букв и добавьте в заказ.
          </p>
        </div>

        {currentUser && cartCount > 0 && (
          <button
            onClick={() => onNavigate('cart')}
            className="inline-flex items-center gap-2 px-5 py-3 bg-neutral-950 hover:bg-amber-500 hover:text-neutral-950 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shrink-0"
          >
            <ShoppingCart className="w-4 h-4" />
            <span>Перейти в корзину ({cartCount})</span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </button>
        )}
      </div>

      {!currentUser && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <span className="text-amber-900 font-medium">
            Вы просматриваете каталог без авторизации. Чтобы добавлять услуги в корзину и оформлять заказ, войдите в систему.
          </span>
          <button
            onClick={() => onNavigate('login')}
            className="px-4 py-2 bg-neutral-950 hover:bg-amber-600 text-white font-bold rounded-xl transition-colors cursor-pointer shrink-0 flex items-center gap-1.5"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Войти в аккаунт</span>
          </button>
        </div>
      )}

      {/* Added notice banner */}
      {addedNotice && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl text-xs font-semibold flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>{addedNotice}</span>
          </div>
          <button
            onClick={() => onNavigate('cart')}
            className="text-xs font-bold text-emerald-800 hover:underline cursor-pointer"
          >
            Открыть корзину →
          </button>
        </div>
      )}

      {/* Category Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-colors cursor-pointer whitespace-nowrap ${
              activeCategory === cat
                ? 'bg-neutral-950 text-white shadow-sm'
                : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
            }`}
          >
            {cat === 'all' ? 'Все категории' : cat}
          </button>
        ))}
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredServices.map((service) => {
          const currentQty = quantities[service.id] ?? service.defaultQty;
          const currentTotal = Math.round(currentQty * service.unitPrice);

          return (
            <div
              key={service.id}
              className="bg-white border border-neutral-200 rounded-2xl p-6 flex flex-col justify-between hover:border-amber-400 hover:shadow-md transition-all space-y-4 shadow-xs"
            >
              {/* ИЗображение услуги - ДОБАВЛЕНО */}
              {service.imageUrl && (
                <div className="mb-3 overflow-hidden rounded-xl border border-neutral-200">
                  <img 
                    src={service.imageUrl} 
                    alt={service.title}
                    className="w-full h-48 object-cover hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                </div>
              )}

              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-mono text-neutral-500 uppercase">
                    {service.category}
                  </span>
                  {service.badge && (
                    <span className="text-[10px] font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
                      {service.badge}
                    </span>
                  )}
                </div>

                <h3 className="text-base font-bold text-neutral-950 leading-snug">
                  {service.title}
                </h3>

                <p className="text-xs text-neutral-600 leading-relaxed">
                  {service.description}
                </p>

                <div className="pt-2 text-xs">
                  <span className="text-neutral-500">Базовая цена: </span>
                  <span className="font-mono font-bold text-neutral-950">
                    {service.unitPrice} ₽ / {service.unit}
                  </span>
                </div>
              </div>

              {/* Quantity Selector & Note */}
              <div className="pt-4 border-t border-neutral-100 space-y-3">
                <div>
                  <label className="block text-[11px] font-bold text-neutral-700 uppercase tracking-wider mb-1.5">
                    Количество ({service.unit}):
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleQtyChange(service.id, -1, service.minQty, service.stepQty)}
                      className="w-9 h-9 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-bold flex items-center justify-center cursor-pointer transition-colors"
                      title="Уменьшить"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>

                    <input
                      type="number"
                      min={service.minQty}
                      step={service.stepQty}
                      value={currentQty}
                      onChange={(e) =>
                        handleManualQtyChange(service.id, Number(e.target.value), service.minQty)
                      }
                      className="flex-1 text-center font-mono font-bold text-sm bg-neutral-50 border border-neutral-300 rounded-lg py-2 focus:outline-none focus:border-amber-500"
                    />

                    <button
                      onClick={() => handleQtyChange(service.id, 1, service.minQty, service.stepQty)}
                      className="w-9 h-9 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-bold flex items-center justify-center cursor-pointer transition-colors"
                      title="Увеличить"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-neutral-700 uppercase tracking-wider mb-1">
                    Пожелания к заказу / размеры:
                  </label>
                  <input
                    type="text"
                    placeholder="Например: надпись, размеры или цвет"
                    value={notes[service.id] || ''}
                    onChange={(e) => setNotes({ ...notes, [service.id]: e.target.value })}
                    className="w-full text-xs p-2 bg-neutral-50 border border-neutral-300 rounded-lg focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="pt-2 flex items-center justify-between">
                  <div>
                    <div className="text-[10px] text-neutral-500">Итого за позицию:</div>
                    <div className="font-mono text-base font-black text-neutral-950">
                      {currentTotal.toLocaleString('ru-RU')} ₽
                    </div>
                  </div>

                  <button
                    onClick={() => handleAdd(service)}
                    className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-neutral-950 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 shadow-sm"
                  >
                    <ShoppingCart className="w-3.5 h-3.5" />
                    <span>{currentUser ? 'В корзину' : 'Войти и заказать'}</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
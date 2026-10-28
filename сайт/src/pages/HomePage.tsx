import React from 'react';
import { Page, User } from '../types';
import { ArrowRight, CheckCircle2, MapPin, Phone, Clock, Layers, Sparkles, Printer } from 'lucide-react';

interface HomePageProps {
  onNavigate: (page: Page) => void;
  currentUser: User | null;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate, currentUser }) => {
  return (
    <div className="space-y-12 py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Clean Light Hero Block (No black banner!) */}
      <section className="bg-white border border-neutral-200 rounded-3xl p-8 sm:p-12 lg:p-16 relative overflow-hidden shadow-xs">
        <div className="max-w-3xl space-y-6 relative z-10">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-700 uppercase tracking-wider">
            <span>Рекламно-производственное предприятие</span>
            <span aria-hidden="true">·</span>
            <span>г. Балашов</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-neutral-950 leading-tight">
            Производство наружной рекламы, вывесок и полиграфии в Балашове
          </h1>

          <p className="text-base sm:text-lg text-neutral-600 font-normal leading-relaxed">
            Собственный производственный цех в г. Балашов на ул. Володарского. Изготавливаем световые объемные буквы, лайтбоксы, баннеры, печатаем визитки и брендируем автотранспорт без посредников с 2012 года.
          </p>

          {/* Key Advantages */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-sm text-neutral-800">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Собственный станочный парк ЧПУ в Балашове</span>
            </div>
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Монтаж вывесок автовышкой и альпинистами</span>
            </div>
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Широкоформатная печать от 1 рабочего дня</span>
            </div>
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Прямые заводские цены без посредников</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-4 pt-4">
            <button
              onClick={() => onNavigate('services')}
              className="px-6 py-3.5 bg-neutral-950 hover:bg-amber-500 hover:text-neutral-950 text-white font-bold text-sm rounded-xl transition-colors flex items-center gap-2 cursor-pointer shadow-sm"
            >
              <span>Посмотреть каталог услуг</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {currentUser ? (
              <button
                onClick={() => onNavigate('orders')}
                className="px-6 py-3.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-semibold text-sm rounded-xl transition-colors cursor-pointer"
              >
                Мои заказы
              </button>
            ) : (
              <button
                onClick={() => onNavigate('login')}
                className="px-6 py-3.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-semibold text-sm rounded-xl transition-colors cursor-pointer"
              >
                Войти в личный кабинет
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Production Categories */}
      <section className="space-y-6">
        <div>
          <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">
            Производственные направления
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-neutral-950 mt-1">
            Что мы производим в нашем цехе
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 bg-white border border-neutral-200 rounded-2xl hover:border-amber-400 transition-all space-y-3 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-neutral-950">Наружная реклама</h3>
            <p className="text-xs text-neutral-600 leading-relaxed">
              Световые объемные буквы (лицевое и контражурное свечение), световые короба (лайтбоксы), фасадные таблички и вывески с гарантией на светотехнику.
            </p>
          </div>

          <div className="p-6 bg-white border border-neutral-200 rounded-2xl hover:border-amber-400 transition-all space-y-3 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-neutral-100 text-neutral-900 flex items-center justify-center font-bold">
              <Printer className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-neutral-950">Широкоформатная печать</h3>
            <p className="text-xs text-neutral-600 leading-relaxed">
              Печать на баннерной ткани плотностью 440г и 510г, самоклеящейся пленке Oracal для витрин и авто, постеры и холсты с разрешением до 1440 dpi.
            </p>
          </div>

          <div className="p-6 bg-white border border-neutral-200 rounded-2xl hover:border-amber-400 transition-all space-y-3 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-neutral-100 text-neutral-900 flex items-center justify-center font-bold">
              <Layers className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-neutral-950">Оперативная полиграфия</h3>
            <p className="text-xs text-neutral-600 leading-relaxed">
              Визитки от 100 до 5000 шт., рекламные листовки, флаеры, буклеты и меню для заведений Балашова на плотном мелованном картоне.
            </p>
          </div>
        </div>
      </section>

      {/* Real Contacts Card (Matches user screenshots & verified data) */}
      <section className="bg-white border border-neutral-200 rounded-2xl p-6 sm:p-8 space-y-4 shadow-xs">
        <h3 className="text-xl font-black text-neutral-950">Контакты и расположение в Балашове</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
          <div className="flex items-start gap-3">
            <MapPin className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <div className="text-xs font-bold text-neutral-500 uppercase">Адрес производства</div>
              <div className="text-sm font-semibold text-neutral-900 mt-0.5">г. Балашов, ул. Володарского, 32</div>
              <div className="text-xs text-neutral-500">Удобный подъезд для забора крупных вывесок</div>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Phone className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <div className="text-xs font-bold text-neutral-500 uppercase">Связь с отделом заказов</div>
              <div className="text-sm font-semibold text-neutral-900 mt-0.5 font-mono">+7 (84545) 4-12-80</div>
              <div className="text-xs text-neutral-500 font-mono">+7 (905) 381-00-55 (WhatsApp / Telegram)</div>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Clock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <div className="text-xs font-bold text-neutral-500 uppercase">Режим работы</div>
              <div className="text-sm font-semibold text-neutral-900 mt-0.5">Пн – Пт: 09:00 – 18:00</div>
              <div className="text-xs text-neutral-500">Суббота: 10:00 – 15:00, Вс: выходной</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

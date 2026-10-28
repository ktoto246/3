import React, { useState, useEffect } from 'react';
import { Order, User, Page } from '../types';
import { Clock, CheckCircle2, Search, Calendar, UserCheck, RefreshCw, Package, ArrowRight, LogIn, FileText } from 'lucide-react';
import { db } from '../database';
import { ReceiptModal } from '../components/ReceiptModal';

interface OrdersPageProps {
  currentUser: User | null;
  onNavigate: (page: Page) => void;
  highlightCode?: string | null;
}

export const OrdersPage: React.FC<OrdersPageProps> = ({
  currentUser,
  onNavigate,
  highlightCode,
}) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>(highlightCode || '');
  const [viewingReceiptOrder, setViewingReceiptOrder] = useState<Order | null>(null);

  const fetchOrders = () => {
    setLoading(true);
    try {
      const all = db.getOrders();
      if (currentUser?.role === 'client') {
        const clientOrders = all.filter(
          (o) =>
            o.clientUsername === currentUser.username ||
            o.clientPhone.replace(/\D/g, '') === currentUser.phone.replace(/\D/g, '')
        );
        setOrders(clientOrders);
      } else {
        setOrders(all);
      }
    } catch (err) {
      console.error('Failed to load orders', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [currentUser]);

  // If user is guest and hasn't searched yet, show search prompt
  const isGuest = !currentUser;

  const filteredOrders = orders.filter((o) => {
    if (isGuest) {
      if (!searchQuery.trim()) return false; // In guest mode, only show if searched by code or phone
      const q = searchQuery.toLowerCase().trim();
      return (
        o.code.toLowerCase().includes(q) ||
        o.clientPhone.replace(/\D/g, '').includes(q.replace(/\D/g, ''))
      );
    }

    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      o.code.toLowerCase().includes(q) ||
      o.clientName.toLowerCase().includes(q) ||
      o.items.some((it) => it.title.toLowerCase().includes(q))
    );
  });

  const getStatusBadge = (status: Order['status'], text: string) => {
    switch (status) {
      case 'new':
        return (
          <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-neutral-100 text-neutral-800 border border-neutral-300">
            {text}
          </span>
        );
      case 'assigned':
        return (
          <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-blue-50 text-blue-800 border border-blue-200">
            {text}
          </span>
        );
      case 'in_progress':
        return (
          <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-amber-50 text-amber-900 border border-amber-300">
            {text}
          </span>
        );
      case 'ready':
        return (
          <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-300">
            {text}
          </span>
        );
      case 'completed':
        return (
          <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-neutral-800 text-white">
            {text}
          </span>
        );
      case 'cancelled':
        return (
          <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-red-50 text-red-800 border border-red-200">
            {text}
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-neutral-100 text-neutral-700">
            {text}
          </span>
        );
    }
  };

  return (
    <div className="py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-neutral-200 pb-6">
        <div>
          <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">
            Отслеживание производства
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-neutral-950 mt-1">
            {currentUser?.role === 'client' ? 'Мои заказы в РА «Алфавит»' : 'Поиск и трекинг заказа'}
          </h1>
          <p className="text-xs sm:text-sm text-neutral-600 mt-1">
            Контролируйте готовность изделий, назначенного мастера и дату завершения работ в цехе Балашова.
          </p>
        </div>

        <button
          onClick={fetchOrders}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-neutral-100 hover:bg-neutral-200 rounded-xl text-xs font-semibold text-neutral-700 transition-colors cursor-pointer self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Обновить</span>
        </button>
      </div>

      {/* Guest Notice */}
      {isGuest && (
        <div className="p-4 bg-neutral-100 border border-neutral-200 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <span className="text-neutral-700">
            Для быстрого поиска введите номер вашего заказа (например, <strong>ALF-2026-101</strong>) или телефон. Либо войдите в свой аккаунт, чтобы видеть все ваши заказы.
          </span>
          <button
            onClick={() => onNavigate('login')}
            className="px-4 py-2 bg-neutral-950 hover:bg-amber-500 hover:text-neutral-950 text-white font-bold rounded-xl transition-colors cursor-pointer shrink-0 flex items-center gap-1.5"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Войти в профиль</span>
          </button>
        </div>
      )}

      {/* Search Input */}
      <div className="space-y-2">
        <div className="relative max-w-md">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Введите номер заказа (#ALF-...) или телефон..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2.5 text-xs bg-white border border-neutral-300 rounded-xl focus:outline-none focus:border-amber-500 font-medium"
          />
        </div>

        {/* Quick test buttons */}
        <div className="flex flex-wrap items-center gap-2 text-[11px] text-neutral-500">
          <span>Примеры кодов:</span>
          {['ALF-2026-101', 'ALF-2026-102', 'ALF-2026-103', 'ALF-2026-104'].map((c) => (
            <button
              key={c}
              onClick={() => setSearchQuery(c)}
              className="px-2 py-0.5 rounded bg-white border border-neutral-200 hover:border-amber-400 text-neutral-700 font-mono cursor-pointer"
            >
              #{c}
            </button>
          ))}
        </div>
      </div>

      {/* Orders List */}
      {isGuest && !searchQuery.trim() ? (
        <div className="py-16 text-center bg-white rounded-2xl border border-neutral-200 p-8 space-y-3">
          <Package className="w-10 h-10 text-neutral-300 mx-auto" />
          <h3 className="text-base font-bold text-neutral-800">Введите номер вашего заказа выше</h3>
          <p className="text-xs text-neutral-500 max-w-sm mx-auto">
            Для конфиденциальности заказы отображаются по коду квитанции или номеру телефона клиента.
          </p>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="py-16 text-center bg-white rounded-2xl border border-neutral-200 p-8 space-y-3">
          <Package className="w-10 h-10 text-neutral-300 mx-auto" />
          <h3 className="text-base font-bold text-neutral-800">Заказы не найдены</h3>
          <p className="text-xs text-neutral-500 max-w-sm mx-auto">
            {searchQuery
              ? 'По указанному номеру заказ не найден. Проверьте правильность ввода кода.'
              : 'У вас пока нет оформленных заказов. Перейдите в каталог для выбора услуг.'}
          </p>
          <div className="pt-2">
            <button
              onClick={() => onNavigate('services')}
              className="px-4 py-2 bg-neutral-950 text-white rounded-xl text-xs font-bold hover:bg-amber-500 hover:text-neutral-950 cursor-pointer"
            >
              Перейти к выбору услуг
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredOrders.map((order) => (
            <div
              key={order.id}
              className={`bg-white border rounded-2xl p-6 sm:p-8 space-y-6 transition-all shadow-xs ${
                highlightCode === order.code
                  ? 'border-amber-500 ring-2 ring-amber-400/30'
                  : 'border-neutral-200'
              }`}
            >
              {/* Order Card Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-100 pb-4">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="text-lg font-black font-mono text-neutral-950">
                    #{order.code}
                  </span>
                  {getStatusBadge(order.status, order.statusText)}
                  {order.paymentInfo && (
                    <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                      {order.paymentInfo}
                    </span>
                  )}
                  <button
                    onClick={() => setViewingReceiptOrder(order)}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-neutral-100 hover:bg-amber-100 hover:text-neutral-950 text-neutral-800 transition-colors cursor-pointer border border-neutral-300"
                    title="Посмотреть и распечатать чек"
                  >
                    <FileText className="w-3.5 h-3.5 text-neutral-600" />
                    <span>Чек</span>
                  </button>
                </div>

                <div className="flex items-center gap-4 text-xs text-neutral-500">
                  <span>Оформлен: <strong className="text-neutral-800 font-mono">{order.createdAt}</strong></span>
                  <span>Сумма: <strong className="text-amber-600 font-mono font-bold text-sm">{order.totalAmount.toLocaleString('ru-RU')} ₽</strong></span>
                </div>
              </div>

              {/* Master assignment & planned completion highlight */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 p-4 bg-neutral-50 rounded-xl border border-neutral-200 text-xs">
                <div>
                  <div className="text-[11px] text-neutral-500 font-semibold uppercase">Ответственный мастер цеха:</div>
                  <div className="font-bold text-neutral-900 mt-0.5 flex items-center gap-1.5">
                    <UserCheck className="w-3.5 h-3.5 text-amber-600" />
                    <span>{order.assignedMasterName || 'Назначается диспетчером'}</span>
                  </div>
                </div>

                <div>
                  <div className="text-[11px] text-neutral-500 font-semibold uppercase">Срок готовности цеха:</div>
                  <div className="font-bold text-neutral-900 mt-0.5 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-amber-600" />
                    <span>
                      {order.plannedCompletionDate
                        ? new Date(order.plannedCompletionDate).toLocaleDateString('ru-RU', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                          })
                        : 'Согласовывается мастером'}
                    </span>
                  </div>
                </div>

                <div className="sm:col-span-2 lg:col-span-1">
                  <div className="text-[11px] text-neutral-500 font-semibold uppercase">Получение / Адрес:</div>
                  <div className="font-medium text-neutral-800 mt-0.5 truncate">
                    {order.deliveryAddress || 'г. Балашов'}
                  </div>
                </div>
              </div>

              {/* Items List inside the Order */}
              <div className="space-y-2">
                <div className="text-xs font-bold text-neutral-700 uppercase tracking-wider">
                  Состав заказа ({order.items.length} поз.):
                </div>
                <div className="divide-y divide-neutral-100 border border-neutral-200 rounded-xl overflow-hidden">
                  {order.items.map((it, idx) => (
                    <div key={idx} className="p-3.5 bg-white flex items-center justify-between text-xs gap-4">
                      <div>
                        <span className="font-bold text-neutral-950">{it.title}</span>
                        <div className="text-[11px] text-neutral-500">
                          {it.quantity} {it.unit} × {it.unitPrice} ₽
                          {it.customNotes && ` · Примечание: ${it.customNotes}`}
                        </div>
                      </div>
                      <span className="font-mono font-bold text-neutral-950 shrink-0">
                        {it.totalPrice.toLocaleString('ru-RU')} ₽
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* History timeline */}
              <div className="space-y-2 pt-2 border-t border-neutral-100">
                <div className="text-xs font-bold text-neutral-700 uppercase tracking-wider">
                  Хронология выполнения:
                </div>
                <div className="space-y-1.5">
                  {order.history.map((h, i) => (
                    <div key={i} className="text-xs flex items-start gap-2 text-neutral-600">
                      <span className="font-mono text-[11px] text-neutral-400 shrink-0">[{h.timestamp}]</span>
                      <span className="font-semibold text-neutral-800">{h.authorRole}:</span>
                      <span>{h.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {viewingReceiptOrder && (
        <ReceiptModal
          order={viewingReceiptOrder}
          onClose={() => setViewingReceiptOrder(null)}
        />
      )}
    </div>
  );
};

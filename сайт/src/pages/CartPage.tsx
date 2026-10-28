import React, { useState, useEffect } from 'react';
import { CartItem, User, Page, Order } from '../types';
import { Trash2, ShoppingCart, CreditCard, Lock, CheckCircle2, ArrowLeft, AlertCircle, FileText, Printer } from 'lucide-react';
import { db } from '../database';
import { ReceiptModal } from '../components/ReceiptModal';

interface CartPageProps {
  cartItems: CartItem[];
  onRemoveItem: (id: string) => void;
  onClearCart: () => void;
  currentUser: User | null;
  onNavigate: (page: Page) => void;
  onOrderSuccess: (orderCode: string) => void;
}

export const CartPage: React.FC<CartPageProps> = ({
  cartItems,
  onRemoveItem,
  onClearCart,
  currentUser,
  onNavigate,
  onOrderSuccess,
}) => {
  const [clientName, setClientName] = useState(currentUser?.name || '');
  const [clientPhone, setClientPhone] = useState(currentUser?.phone || '+7 ');
  const [deliveryAddress, setDeliveryAddress] = useState(currentUser?.address || '');

  // Bank Card fields
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');
  const [cardHolder, setCardHolder] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [createdOrder, setCreatedOrder] = useState<Order | null>(null);
  const [showReceipt, setShowReceipt] = useState<boolean>(false);
  const [successOrderCode, setSuccessOrderCode] = useState<string | null>(null);
  const [paidLast4, setPaidLast4] = useState<string>('');

  useEffect(() => {
    if (currentUser) {
      if (currentUser.name && !clientName) setClientName(currentUser.name);
      if (currentUser.phone && clientPhone === '+7 ') setClientPhone(currentUser.phone);
      if (currentUser.address && !deliveryAddress) setDeliveryAddress(currentUser.address);
    }
  }, [currentUser]);

  const totalAmount = cartItems.reduce((acc, it) => acc + it.totalPrice, 0);

  // Format card number as 0000 0000 0000 0000
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, '').slice(0, 16);
    const formatted = digits.replace(/(\d{4})(?=\d)/g, '$1 ');
    setCardNumber(formatted);
  };

  // Format expiry as MM/YY
  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, '').slice(0, 4);
    if (digits.length >= 3) {
      setCardExpiry(`${digits.slice(0, 2)}/${digits.slice(2, 4)}`);
    } else {
      setCardExpiry(digits);
    }
  };

  // Format CVC as 3 digits
  const handleCvcChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, '').slice(0, 3);
    setCardCvc(digits);
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName.trim() || clientPhone.trim().length < 8) {
      setErrorMessage('Укажите ваше имя и контактный номер телефона для связи');
      return;
    }

    if (!deliveryAddress.trim()) {
      setErrorMessage('Пожалуйста, укажите адрес доставки / монтажа в Балашове или Самовывоз');
      return;
    }

    const rawCardDigits = cardNumber.replace(/\D/g, '');
    if (rawCardDigits.length < 16) {
      setErrorMessage('Введите полный 16-значный номер банковской карты');
      return;
    }

    if (cardExpiry.length < 5) {
      setErrorMessage('Укажите срок действия карты в формате ММ/ГГ');
      return;
    }

    if (cardCvc.length < 3) {
      setErrorMessage('Введите 3-значный код CVC/CVV с обратной стороны карты');
      return;
    }

    setSubmitting(true);
    setErrorMessage('');
    const last4 = rawCardDigits.slice(-4);

    try {
      const newOrder = db.createOrder({
        clientUsername: currentUser?.username || 'client',
        clientName: clientName.trim(),
        clientPhone: clientPhone.trim(),
        deliveryAddress: deliveryAddress.trim(),
        items: cartItems,
        cardLast4: last4,
      });

      setPaidLast4(last4);
      setCreatedOrder(newOrder);
      setSuccessOrderCode(newOrder.code);
      onClearCart();
      onOrderSuccess(newOrder.code);
    } catch (err: any) {
      setErrorMessage(err?.message || 'Ошибка при сохранении заказа');
    } finally {
      setSubmitting(false);
    }
  };

  if (successOrderCode) {
    return (
      <div className="py-16 max-w-2xl mx-auto px-4 text-center space-y-6">
        <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-600">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <div>
          <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            Оплата прошла успешно (карта **** {paidLast4})
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-neutral-950 mt-3">
            Номер заказа #{successOrderCode}
          </h1>
          <p className="mt-2 text-sm text-neutral-600 leading-relaxed max-w-md mx-auto">
            Ваш заказ оплачен и передан в диспетчерскую службу РА «Алфавит». Вы можете скачать фискальный чек или отслеживать этапы производства.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-3 pt-4">
          <button
            onClick={() => setShowReceipt(true)}
            className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-black text-xs rounded-xl transition-all shadow-md cursor-pointer flex items-center gap-2"
          >
            <FileText className="w-4 h-4" />
            <span>Открыть кассовый чек / PDF</span>
          </button>
          <button
            onClick={() => onNavigate('orders')}
            className="px-6 py-3 bg-neutral-950 hover:bg-neutral-800 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer"
          >
            Перейти в раздел «Мои заказы»
          </button>
          <button
            onClick={() => onNavigate('services')}
            className="px-6 py-3 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-semibold text-xs rounded-xl transition-colors cursor-pointer"
          >
            В каталог услуг
          </button>
        </div>

        {showReceipt && (
          <ReceiptModal order={createdOrder} onClose={() => setShowReceipt(false)} />
        )}
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="py-20 max-w-xl mx-auto px-4 text-center space-y-4">
        <div className="w-14 h-14 bg-neutral-100 rounded-2xl flex items-center justify-center mx-auto text-neutral-400">
          <ShoppingCart className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-bold text-neutral-900">Ваша корзина пуста</h2>
        <p className="text-xs text-neutral-500 max-w-sm mx-auto">
          Перейдите в каталог услуг, выберите нужное количество визиток, баннеров или вывесок и добавьте их в заказ.
        </p>
        <div className="pt-2">
          <button
            onClick={() => onNavigate('services')}
            className="px-5 py-2.5 bg-neutral-950 hover:bg-amber-500 hover:text-neutral-950 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
          >
            Перейти к выбору услуг
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-neutral-200 pb-4">
        <div>
          <button
            onClick={() => onNavigate('services')}
            className="inline-flex items-center gap-1.5 text-xs text-neutral-500 hover:text-neutral-900 cursor-pointer mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Вернуться в каталог</span>
          </button>
          <h1 className="text-2xl sm:text-3xl font-black text-neutral-950">
            Корзина и оплата заказа ({cartItems.length} поз.)
          </h1>
        </div>

        <button
          onClick={onClearCart}
          className="text-xs text-neutral-500 hover:text-red-600 transition-colors cursor-pointer"
        >
          Очистить корзину
        </button>
      </div>

      {errorMessage && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-800 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* 2-Column Split: Cart Items & Checkout + Card Payment Form */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Items List */}
        <div className="lg:col-span-6 space-y-4">
          {cartItems.map((item) => (
            <div
              key={item.id}
              className="bg-white border border-neutral-200 rounded-2xl p-5 flex items-start justify-between gap-4 shadow-xs"
            >
              <div className="space-y-1">
                <span className="text-[10px] font-mono uppercase text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
                  {item.category}
                </span>
                <h3 className="text-sm font-bold text-neutral-950 mt-1">{item.title}</h3>
                <div className="text-xs text-neutral-500">
                  {item.quantity} {item.unit} × {item.unitPrice} ₽
                </div>
                {item.customNotes && (
                  <div className="text-[11px] text-neutral-600 bg-neutral-50 p-2 rounded-lg mt-2">
                    Примечание: {item.customNotes}
                  </div>
                )}
              </div>

              <div className="flex flex-col items-end justify-between self-stretch">
                <div className="font-mono text-base font-black text-neutral-950">
                  {item.totalPrice.toLocaleString('ru-RU')} ₽
                </div>
                <button
                  onClick={() => onRemoveItem(item.id)}
                  className="p-1.5 text-neutral-400 hover:text-red-600 transition-colors cursor-pointer"
                  title="Удалить позицию"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Checkout & Bank Card Payment Card */}
        <div className="lg:col-span-6 bg-white border border-neutral-200 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xs">
          <h2 className="text-lg font-bold text-neutral-950 border-b border-neutral-200 pb-3">
            Данные получателя и оплата картой
          </h2>

          <form onSubmit={handleCheckout} className="space-y-5">
            {/* Client details */}
            <div className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
                    Ваше имя или организация *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Иван Петров или ООО «Заря»"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    className="w-full text-xs p-2.5 bg-neutral-50 border border-neutral-300 rounded-lg focus:outline-none focus:border-amber-500 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
                    Номер телефона *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="+7 (905) 000-00-00"
                    value={clientPhone}
                    onChange={(e) => setClientPhone(e.target.value)}
                    className="w-full text-xs p-2.5 bg-neutral-50 border border-neutral-300 rounded-lg focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
                  Адрес доставки / монтажа (г. Балашов) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Укажите точный адрес монтажа или Самовывоз"
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  className="w-full text-xs p-2.5 bg-neutral-50 border border-neutral-300 rounded-lg focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            {/* Bank Card Form Block */}
            <div className="pt-4 border-t border-neutral-200 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-amber-600" />
                  <span className="text-xs font-bold text-neutral-900 uppercase tracking-wider">
                    Оплата банковской картой
                  </span>
                </div>
                <span className="text-[11px] font-mono text-neutral-500">
                  МИР · Visa · Mastercard
                </span>
              </div>

              {/* Card visual box */}
              <div className="p-5 rounded-2xl bg-neutral-50 border border-neutral-200 space-y-4">
                <div>
                  <label className="block text-[11px] font-bold text-neutral-700 uppercase tracking-wider mb-1">
                    Номер карты *
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    required
                    placeholder="0000 0000 0000 0000"
                    value={cardNumber}
                    onChange={handleCardNumberChange}
                    className="w-full text-sm p-3 bg-white border border-neutral-300 rounded-xl focus:outline-none focus:border-amber-500 font-mono tracking-widest font-bold text-neutral-950"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-[11px] font-bold text-neutral-700 uppercase tracking-wider mb-1">
                      Срок действия *
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      required
                      placeholder="ММ/ГГ"
                      value={cardExpiry}
                      onChange={handleExpiryChange}
                      className="w-full text-sm p-2.5 bg-white border border-neutral-300 rounded-xl focus:outline-none focus:border-amber-500 font-mono text-center font-bold text-neutral-950"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-neutral-700 uppercase tracking-wider mb-1">
                      Код CVC / CVV *
                    </label>
                    <input
                      type="password"
                      inputMode="numeric"
                      required
                      maxLength={3}
                      placeholder="•••"
                      value={cardCvc}
                      onChange={handleCvcChange}
                      className="w-full text-sm p-2.5 bg-white border border-neutral-300 rounded-xl focus:outline-none focus:border-amber-500 font-mono text-center font-bold text-neutral-950"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-neutral-700 uppercase tracking-wider mb-1">
                    Имя держателя карты (необязательно)
                  </label>
                  <input
                    type="text"
                    placeholder="IVAN PETROV"
                    value={cardHolder}
                    onChange={(e) => setCardHolder(e.target.value.toUpperCase())}
                    className="w-full text-xs p-2.5 bg-white border border-neutral-300 rounded-xl focus:outline-none focus:border-amber-500 font-mono uppercase"
                  />
                </div>
              </div>
            </div>

            {/* Total Summary */}
            <div className="pt-3 border-t border-neutral-200 space-y-2">
              <div className="flex justify-between text-xs text-neutral-600">
                <span>Количество позиций:</span>
                <span className="font-mono font-bold text-neutral-900">{cartItems.length}</span>
              </div>
              <div className="flex justify-between items-baseline pt-1">
                <span className="text-sm font-bold text-neutral-900">К оплате по карте:</span>
                <span className="font-mono text-2xl font-black text-amber-600">
                  {totalAmount.toLocaleString('ru-RU')} ₽
                </span>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 bg-neutral-950 hover:bg-amber-500 hover:text-neutral-950 text-white font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:opacity-50"
            >
              <Lock className="w-4 h-4" />
              <span>
                {submitting
                  ? 'Проведение оплаты...'
                  : `Оплатить ${totalAmount.toLocaleString('ru-RU')} ₽ и оформить заказ`}
              </span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

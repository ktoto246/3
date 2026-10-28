import React from 'react';
import { Order } from '../types';
import { Printer, X, CheckCircle2, ShieldCheck } from 'lucide-react';

interface ReceiptModalProps {
  order: Order | null;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ order, onClose }) => {
  if (!order) return null;

  const receipt = order.receipt || {
    id: `rcp-${order.id}`,
    receiptNumber: `ФД-${order.code.replace(/\D/g, '') || '104928'}`,
    orderCode: order.code,
    date: order.createdAt,
    companyName: 'Рекламно-производственное предприятие «Алфавит»',
    inn: '644002849102',
    address: 'Саратовская обл., г. Балашов, ул. Володарского, 32',
    clientName: order.clientName,
    clientPhone: order.clientPhone,
    cardLast4: order.paymentInfo?.match(/\d{4}/)?.[0] || '8841',
    authCode: 'AUTH-849201',
    fiscalSign: 'ФП-3920194812',
    paymentType: 'Безналичная оплата банковской картой',
    items: order.items.map((it) => ({
      title: it.title,
      quantity: it.quantity,
      unit: it.unit,
      unitPrice: it.unitPrice,
      totalPrice: it.totalPrice,
    })),
    totalAmount: order.totalAmount,
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      {/* Container */}
      <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] flex flex-col shadow-2xl border border-neutral-200 overflow-hidden">
        {/* Top actions bar (hidden on print) */}
        <div className="p-4 bg-neutral-100 border-b border-neutral-200 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-xs font-bold text-neutral-800 uppercase tracking-wider">
              Электронный кассовый чек
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-neutral-950 hover:bg-amber-500 hover:text-neutral-950 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Распечатать / PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-neutral-500 hover:text-neutral-900 rounded-lg cursor-pointer hover:bg-neutral-200 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Receipt paper view */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-5 font-mono text-xs text-neutral-800 bg-white">
          {/* Header */}
          <div className="text-center space-y-1 border-b border-dashed border-neutral-300 pb-4">
            <div className="text-sm font-black uppercase text-neutral-950 font-sans tracking-wide">
              {receipt.companyName}
            </div>
            <div className="text-[11px] text-neutral-600">ИП Смирнов А.В. · ИНН: {receipt.inn}</div>
            <div className="text-[11px] text-neutral-600">{receipt.address}</div>
            <div className="text-[10px] text-neutral-400 mt-1">тел. +7 (84545) 4-12-80 · сайт: alfavit64.ru</div>
          </div>

          {/* Doc metadata */}
          <div className="space-y-1 text-[11px] border-b border-dashed border-neutral-300 pb-3">
            <div className="flex justify-between">
              <span className="text-neutral-500">Кассовый документ:</span>
              <span className="font-bold text-neutral-950">{receipt.receiptNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-500">Заказ в производстве:</span>
              <span className="font-bold text-neutral-950">#{receipt.orderCode}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-500">Дата и время:</span>
              <span>{receipt.date}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-500">Покупатель / плательщик:</span>
              <span className="font-semibold text-neutral-900 truncate max-w-[200px] text-right">{receipt.clientName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-500">Контактный телефон:</span>
              <span>{receipt.clientPhone}</span>
            </div>
          </div>

          {/* Items table */}
          <div className="space-y-2 border-b border-dashed border-neutral-300 pb-4">
            <div className="text-[10px] uppercase font-bold text-neutral-500 tracking-wider">
              Наименование товаров / услуг:
            </div>
            <div className="space-y-2">
              {receipt.items.map((it, idx) => (
                <div key={idx} className="space-y-0.5">
                  <div className="font-bold text-neutral-950 font-sans text-xs">
                    {idx + 1}. {it.title}
                  </div>
                  <div className="flex justify-between text-[11px] text-neutral-600">
                    <span>
                      {it.quantity} {it.unit} × {it.unitPrice.toLocaleString('ru-RU')} ₽
                    </span>
                    <span className="font-bold text-neutral-950">
                      {it.totalPrice.toLocaleString('ru-RU')} ₽
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Total & Payment Details */}
          <div className="space-y-2 border-b border-dashed border-neutral-300 pb-4 text-xs">
            <div className="flex justify-between items-baseline text-sm font-black text-neutral-950 font-sans">
              <span>ИТОГО К ОПЛАТЕ:</span>
              <span className="text-base text-amber-700 font-mono">
                {receipt.totalAmount.toLocaleString('ru-RU')} ₽
              </span>
            </div>
            <div className="flex justify-between text-[11px] text-neutral-600">
              <span>Форма расчетов:</span>
              <span>Безналичными (онлайн)</span>
            </div>
            <div className="flex justify-between text-[11px] text-neutral-600">
              <span>Банковская карта:</span>
              <span className="font-bold text-neutral-950">**** **** **** {receipt.cardLast4}</span>
            </div>
            <div className="flex justify-between text-[11px] text-neutral-600">
              <span>Код авторизации банка:</span>
              <span className="font-bold">{receipt.authCode}</span>
            </div>
            <div className="flex justify-between text-[11px] text-neutral-600">
              <span>Фискальный признак (ФП):</span>
              <span>{receipt.fiscalSign}</span>
            </div>
          </div>

          {/* Footer note */}
          <div className="text-center space-y-1 pt-1 text-[10px] text-neutral-500">
            <div className="inline-flex items-center gap-1 text-emerald-700 font-bold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>ОПЛАТА ПОДТВЕРЖДЕНА БАНКОМ-ЭКВАЙЕРОМ</span>
            </div>
            <p>Спасибо за заказ в рекламно-производственном агентстве «Алфавит»!</p>
            <p>Электронный чек сформирован в соответствии с ФЗ № 54-ФЗ.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

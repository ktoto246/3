import React, { useState, useEffect } from 'react';
import { MaterialStock, ProcurementRecord, Page, SupplyRequest } from '../types';
import { Database, AlertTriangle, CheckCircle2, ArrowLeft, RefreshCw, Plus, Truck, FileText, X, DollarSign, Package } from 'lucide-react';
import { db } from '../database';

interface MaterialsPageProps {
  onNavigate: (page: Page) => void;
}

export const MaterialsPage: React.FC<MaterialsPageProps> = ({ onNavigate }) => {
  const [activeTab, setActiveTab] = useState<'stock' | 'requests' | 'procurements'>('stock');
  const [materials, setMaterials] = useState<MaterialStock[]>([]);
  const [procurements, setProcurements] = useState<ProcurementRecord[]>([]);
  const [supplyRequests, setSupplyRequests] = useState<SupplyRequest[]>([]);
  const [activeFulfillRequestId, setActiveFulfillRequestId] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [feedbackMsg, setFeedbackMsg] = useState<string>('');

  // Modal 1: Add new material
  const [showAddMatModal, setShowAddMatModal] = useState<boolean>(false);
  const [newMatName, setNewMatName] = useState('');
  const [newMatCategory, setNewMatCategory] = useState('Листовые материалы');
  const [newMatUnit, setNewMatUnit] = useState('листов');
  const [newMatStock, setNewMatStock] = useState<number>(10);
  const [newMatThreshold, setNewMatThreshold] = useState<number>(5);
  const [newMatSupplier, setNewMatSupplier] = useState('Гельветика-Поволжье');

  // Modal 2: Record procurement / replenishment
  const [showProcureModal, setShowProcureModal] = useState<boolean>(false);
  const [procureMaterialId, setProcureMaterialId] = useState<string>('');
  const [procureQuantity, setProcureQuantity] = useState<number>(10);
  const [procureUnitCost, setProcureUnitCost] = useState<number>(1000);
  const [procureSupplier, setProcureSupplier] = useState<string>('Гельветика-Поволжье');
  const [procureInvoice, setProcureInvoice] = useState<string>('');
  const [procureReceiver, setProcureReceiver] = useState<string>('Алексей Смирнов');
  const [procureNotes, setProcureNotes] = useState<string>('');
  const [procureError, setProcureError] = useState<string>('');

  const loadData = () => {
    setLoading(true);
    try {
      const mats = db.getMaterials();
      const procs = db.getProcurements();
      const reqs = db.getSupplyRequests();
      setMaterials(mats);
      setProcurements(procs);
      setSupplyRequests(reqs);
      if (mats.length > 0 && !procureMaterialId) {
        setProcureMaterialId(mats[0].id);
        setProcureSupplier(mats[0].supplier);
      }
    } catch (err) {
      console.error('Failed to load materials data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Handle Add New Material Submit
  const handleAddMaterialSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMatName.trim()) return;

    db.addMaterial({
      name: newMatName.trim(),
      category: newMatCategory,
      unit: newMatUnit,
      inStock: Number(newMatStock) || 0,
      minThreshold: Number(newMatThreshold) || 5,
      supplier: newMatSupplier.trim() || 'Поставщик',
    });

    setFeedbackMsg(`Материал «${newMatName.trim()}» успешно внесен в номенклатуру склада!`);
    setShowAddMatModal(false);
    setNewMatName('');
    loadData();
    setTimeout(() => setFeedbackMsg(''), 4000);
  };

  // Open procurement modal for a specific supply request
  const handleOpenProcureForRequest = (req: SupplyRequest) => {
    setActiveFulfillRequestId(req.id);
    setProcureMaterialId(req.materialId);
    setProcureQuantity(req.quantity);
    const mat = materials.find((m) => m.id === req.materialId);
    setProcureSupplier(mat?.supplier || 'Гельветика-Поволжье');
    setProcureUnitCost(1200);
    setProcureInvoice(`УПД-${Math.floor(1000 + Math.random() * 9000)}`);
    setProcureNotes(`По заявке мастера ${req.masterName} для заказа #${req.orderCode}`);
    setProcureError('');
    setShowProcureModal(true);
  };

  // Reject supply request
  const handleRejectSupplyRequest = (req: SupplyRequest) => {
    const reason = prompt(`Причина отклонения заявки по заказу #${req.orderCode}:`, 'Имеются резервы на складе цеха');
    if (reason === null) return;
    const res = db.rejectSupplyRequest(req.id, 'Снабжение/Склад', reason);
    if (res.success) {
      setFeedbackMsg(`Заявка по заказу #${req.orderCode} отклонена.`);
      loadData();
      setTimeout(() => setFeedbackMsg(''), 3500);
    }
  };

  // Handle Record Procurement Submit (both standalone and satisfying supply request)
  const handleProcureSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!procureMaterialId || procureQuantity <= 0) {
      setProcureError('Выберите материал и укажите положительное количество');
      return;
    }

    if (activeFulfillRequestId) {
      // Fulfill master request
      const res = db.fulfillSupplyRequest(activeFulfillRequestId, {
        unitCost: Number(procureUnitCost),
        supplier: procureSupplier,
        invoiceNumber: procureInvoice || `УПД-${Math.floor(1000 + Math.random() * 9000)}`,
        fulfilledByName: procureReceiver,
        notes: procureNotes,
      });

      if (res.success && res.procurement) {
        setFeedbackMsg(`Заявка мастера выполнена! На склад оприходовано ${procureQuantity} ед. сырья и передано в производство цеха.`);
        setShowProcureModal(false);
        setActiveFulfillRequestId(null);
        setProcureError('');
        setProcureNotes('');
        setProcureInvoice('');
        loadData();
        setTimeout(() => setFeedbackMsg(''), 4500);
      } else {
        setProcureError(res.error || 'Ошибка оприходования сырья');
      }
    } else {
      // Standalone procurement
      const res = db.recordProcurement({
        materialId: procureMaterialId,
        quantity: Number(procureQuantity),
        unitCost: Number(procureUnitCost),
        supplier: procureSupplier,
        invoiceNumber: procureInvoice || `УПД-${Math.floor(1000 + Math.random() * 9000)}`,
        receivedByName: procureReceiver,
        notes: procureNotes,
      });

      if (res.success && res.material) {
        setFeedbackMsg(`Поступление сырья оформлено! На склад «${res.material.name}» добавлено ${procureQuantity} ${res.material.unit}.`);
        setShowProcureModal(false);
        setProcureError('');
        setProcureNotes('');
        setProcureInvoice('');
        loadData();
        setTimeout(() => setFeedbackMsg(''), 4000);
      } else {
        setProcureError(res.error || 'Ошибка при оформлении закупки');
      }
    }
  };

  const lowStockCount = materials.filter((m) => m.inStock <= m.minThreshold).length;
  const totalProcurementSum = procurements.reduce((acc, p) => acc + p.totalCost, 0);

  return (
    <div className="py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-neutral-200 pb-6">
        <div>
          <button
            onClick={() => onNavigate('profile')}
            className="inline-flex items-center gap-1.5 text-xs text-neutral-500 hover:text-neutral-900 cursor-pointer mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Вернуться в управление</span>
          </button>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black text-neutral-950">
              Склад и закупки сырья РА «Алфавит»
            </h1>
            <span className="text-xs font-mono font-bold bg-amber-100 text-amber-900 px-2.5 py-0.5 rounded">
              Учет материалов
            </span>
          </div>
          <p className="text-xs sm:text-sm text-neutral-600 mt-1">
            Контроль остатков листовых пластиков, пленок, светодиодов, регистрация новых материалов и поступлений от поставщиков.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => {
              setShowAddMatModal(true);
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-neutral-950 hover:bg-amber-500 hover:text-neutral-950 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Новый материал</span>
          </button>

          <button
            onClick={() => {
              setShowProcureModal(true);
              setProcureError('');
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-neutral-950 rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-xs"
          >
            <Truck className="w-3.5 h-3.5" />
            <span>Оформить закупку сырья</span>
          </button>

          <button
            onClick={loadData}
            className="p-2 bg-neutral-100 hover:bg-neutral-200 rounded-xl text-neutral-700 transition-colors cursor-pointer"
            title="Обновить данные склада"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {feedbackMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-xl text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{feedbackMsg}</span>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-white border border-neutral-200 rounded-2xl shadow-xs">
          <div className="text-xs text-neutral-500 font-semibold uppercase">Номенклатура на складе:</div>
          <div className="text-2xl font-black font-mono mt-1 text-neutral-950">{materials.length} поз.</div>
        </div>
        <div className="p-4 bg-white border border-neutral-200 rounded-2xl shadow-xs">
          <div className="text-xs text-neutral-500 font-semibold uppercase">Требуется пополнить запас:</div>
          <div className={`text-2xl font-black font-mono mt-1 ${lowStockCount > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
            {lowStockCount} поз.
          </div>
        </div>
        <div className="p-4 bg-white border border-neutral-200 rounded-2xl shadow-xs">
          <div className="text-xs text-neutral-500 font-semibold uppercase">Сумма оформленных закупок:</div>
          <div className="text-2xl font-black font-mono mt-1 text-neutral-950">
            {totalProcurementSum.toLocaleString('ru-RU')} ₽
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-neutral-200">
        <button
          onClick={() => setActiveTab('stock')}
          className={`py-3 px-5 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
            activeTab === 'stock'
              ? 'border-neutral-950 text-neutral-950 font-black'
              : 'border-transparent text-neutral-500 hover:text-neutral-900'
          }`}
        >
          Текущие остатки сырья ({materials.length})
        </button>
        <button
          onClick={() => setActiveTab('requests')}
          className={`py-3 px-5 text-xs font-bold border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
            activeTab === 'requests'
              ? 'border-neutral-950 text-neutral-950 font-black'
              : 'border-transparent text-neutral-500 hover:text-neutral-900'
          }`}
        >
          <span>Заявки мастеров на сырье ({supplyRequests.length})</span>
          {supplyRequests.filter((r) => r.status === 'pending').length > 0 && (
            <span className="px-1.5 py-0.5 rounded text-[10px] font-black bg-amber-500 text-neutral-950">
              {supplyRequests.filter((r) => r.status === 'pending').length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('procurements')}
          className={`py-3 px-5 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
            activeTab === 'procurements'
              ? 'border-neutral-950 text-neutral-950 font-black'
              : 'border-transparent text-neutral-500 hover:text-neutral-900'
          }`}
        >
          Журнал закупок и накладные ({procurements.length})
        </button>
      </div>

      {/* TAB 1: STOCK TABLE */}
      {activeTab === 'stock' && (
        <div className="bg-white border border-neutral-200 rounded-2xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-100 text-neutral-600 uppercase text-[10px] tracking-wider font-bold">
                <tr>
                  <th className="p-3.5">Наименование материала</th>
                  <th className="p-3.5">Категория</th>
                  <th className="p-3.5">Текущий остаток</th>
                  <th className="p-3.5">Минимум</th>
                  <th className="p-3.5">Расход за прошлый месяц</th>
                  <th className="p-3.5">Поставщик</th>
                  <th className="p-3.5">Состояние</th>
                  <th className="p-3.5 text-right">Действие</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                {materials.map((m) => {
                  const isLow = m.inStock <= m.minThreshold;

                  return (
                    <tr key={m.id} className="hover:bg-neutral-50">
                      <td className="p-3.5 font-bold text-neutral-900">{m.name}</td>
                      <td className="p-3.5 text-neutral-500 font-mono text-[11px]">{m.category}</td>
                      <td className="p-3.5 font-mono font-bold text-neutral-950 text-sm">
                        {m.inStock} <span className="text-[11px] font-normal text-neutral-500">{m.unit}</span>
                      </td>
                      <td className="p-3.5 font-mono text-neutral-600">
                        {m.minThreshold} {m.unit}
                      </td>
                      <td className="p-3.5 font-mono font-bold text-amber-700">
                        {m.consumedLastMonth} {m.unit}
                      </td>
                      <td className="p-3.5 text-neutral-700">{m.supplier}</td>
                      <td className="p-3.5">
                        {isLow ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-300">
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                            <span>Требуется закупка</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>В норме</span>
                          </span>
                        )}
                      </td>
                      <td className="p-3.5 text-right">
                        <button
                          onClick={() => {
                            setProcureMaterialId(m.id);
                            setProcureSupplier(m.supplier);
                            setShowProcureModal(true);
                          }}
                          className="px-2.5 py-1 bg-neutral-100 hover:bg-amber-100 hover:text-neutral-950 text-neutral-700 rounded-lg text-xs font-semibold cursor-pointer transition-colors"
                        >
                          + Пополнить
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB: SUPPLY REQUESTS FROM MASTERS */}
      {activeTab === 'requests' && (
        <div className="bg-white border border-neutral-200 rounded-2xl overflow-hidden shadow-xs">
          {supplyRequests.length === 0 ? (
            <div className="p-10 text-center text-xs text-neutral-500">
              Заявок мастеров цеха на закупку сырья нет. Все заказы обеспечены материалами.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-neutral-100 text-neutral-600 uppercase text-[10px] tracking-wider font-bold">
                  <tr>
                    <th className="p-3.5">Срочность</th>
                    <th className="p-3.5">Заказ</th>
                    <th className="p-3.5">Мастер цеха</th>
                    <th className="p-3.5">Материал</th>
                    <th className="p-3.5">Требуемое кол-во</th>
                    <th className="p-3.5">Причина / Обоснование мастера</th>
                    <th className="p-3.5">Дата запроса</th>
                    <th className="p-3.5 whitespace-nowrap">Статус</th>
                    <th className="p-3.5 text-right whitespace-nowrap">Действие снабжения</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200">
                  {supplyRequests.map((req) => (
                    <tr key={req.id} className="hover:bg-neutral-50">
                      <td className="p-3.5 whitespace-nowrap">
                        {req.urgency === 'urgent' ? (
                          <span className="inline-block whitespace-nowrap px-2 py-0.5 rounded text-[10px] font-black bg-red-100 text-red-800 border border-red-200 uppercase">
                            Срочно
                          </span>
                        ) : (
                          <span className="inline-block whitespace-nowrap px-2 py-0.5 rounded text-[10px] font-semibold bg-neutral-100 text-neutral-700">
                            Планово
                          </span>
                        )}
                      </td>
                      <td className="p-3.5 font-mono font-bold text-neutral-950 whitespace-nowrap">#{req.orderCode}</td>
                      <td className="p-3.5 font-semibold text-neutral-900 whitespace-nowrap">{req.masterName}</td>
                      <td className="p-3.5 font-bold text-neutral-900 whitespace-nowrap">{req.materialName}</td>
                      <td className="p-3.5 font-mono font-bold text-amber-700 text-sm whitespace-nowrap">
                        {req.quantity} <span className="text-[11px] font-normal text-neutral-500">{req.unit}</span>
                      </td>
                      <td className="p-3.5 max-w-xs text-neutral-700 leading-relaxed text-[11px]">{req.reason}</td>
                      <td className="p-3.5 font-mono text-neutral-500 text-[11px] whitespace-nowrap">{req.createdAt}</td>
                      <td className="p-3.5 whitespace-nowrap">
                        {req.status === 'pending' && (
                          <span className="inline-block whitespace-nowrap px-2.5 py-1 rounded text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                            Ожидает закупки
                          </span>
                        )}
                        {req.status === 'fulfilled' && (
                          <div className="whitespace-nowrap space-y-0.5">
                            <span className="inline-block whitespace-nowrap px-2.5 py-1 rounded text-[11px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-300">
                              Закуплено и выдано
                            </span>
                            <div className="text-[10px] text-neutral-500 font-mono whitespace-nowrap">
                              {req.fulfilledAt} ({req.fulfilledByName})
                            </div>
                          </div>
                        )}
                        {req.status === 'rejected' && (
                          <span className="inline-block whitespace-nowrap px-2.5 py-1 rounded text-[11px] font-bold bg-red-100 text-red-900 border border-red-300">
                            Отклонено
                          </span>
                        )}
                      </td>
                      <td className="p-3.5 text-right">
                        {req.status === 'pending' ? (
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleOpenProcureForRequest(req)}
                              className="px-3 py-1.5 bg-neutral-950 hover:bg-emerald-600 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer shadow-xs whitespace-nowrap"
                            >
                              Одобрить и закупить
                            </button>
                            <button
                              onClick={() => handleRejectSupplyRequest(req)}
                              className="px-2.5 py-1.5 text-neutral-500 hover:text-red-700 hover:bg-red-50 rounded-lg text-xs font-semibold cursor-pointer"
                            >
                              Отклонить
                            </button>
                          </div>
                        ) : (
                          <span className="text-neutral-400 text-[11px]">Обработано</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: PROCUREMENTS LOG */}
      {activeTab === 'procurements' && (
        <div className="bg-white border border-neutral-200 rounded-2xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-100 text-neutral-600 uppercase text-[10px] tracking-wider font-bold">
                <tr>
                  <th className="p-3.5">Дата поступления</th>
                  <th className="p-3.5">Накладная / УПД</th>
                  <th className="p-3.5">Материал</th>
                  <th className="p-3.5">Поставщик</th>
                  <th className="p-3.5">Количество</th>
                  <th className="p-3.5">Цена за ед.</th>
                  <th className="p-3.5">Сумма закупки</th>
                  <th className="p-3.5">Принял на склад</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                {procurements.map((p) => (
                  <tr key={p.id} className="hover:bg-neutral-50">
                    <td className="p-3.5 font-mono text-neutral-600">{p.date}</td>
                    <td className="p-3.5 font-mono font-bold text-neutral-950">{p.invoiceNumber}</td>
                    <td className="p-3.5 font-bold text-neutral-900">{p.materialName}</td>
                    <td className="p-3.5 text-neutral-700">{p.supplier}</td>
                    <td className="p-3.5 font-mono font-bold text-neutral-950">
                      +{p.quantity} <span className="text-[11px] font-normal text-neutral-500">{p.unit}</span>
                    </td>
                    <td className="p-3.5 font-mono text-neutral-600">{p.unitCost} ₽</td>
                    <td className="p-3.5 font-mono font-black text-amber-700 text-sm">
                      {p.totalCost.toLocaleString('ru-RU')} ₽
                    </td>
                    <td className="p-3.5 text-neutral-600">{p.receivedByName}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL 1: ADD NEW MATERIAL */}
      {showAddMatModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-neutral-200 space-y-5">
            <div className="flex items-center justify-between border-b border-neutral-200 pb-3">
              <h3 className="text-base font-bold text-neutral-950">Добавление нового материала на склад</h3>
              <button onClick={() => setShowAddMatModal(false)} className="p-1 text-neutral-400 hover:text-neutral-900 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddMaterialSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
                  Наименование материала *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Например: Пленка светорассеивающая Oracal 8500"
                  value={newMatName}
                  onChange={(e) => setNewMatName(e.target.value)}
                  className="w-full text-xs p-2.5 bg-neutral-50 border border-neutral-300 rounded-lg focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
                    Категория *
                  </label>
                  <select
                    value={newMatCategory}
                    onChange={(e) => setNewMatCategory(e.target.value)}
                    className="w-full text-xs p-2.5 bg-neutral-50 border border-neutral-300 rounded-lg focus:outline-none focus:border-amber-500 cursor-pointer"
                  >
                    <option value="Листовые материалы">Листовые материалы</option>
                    <option value="Рулонные материалы">Рулонные материалы</option>
                    <option value="Светотехника">Светотехника</option>
                    <option value="Крепеж и профили">Крепеж и профили</option>
                    <option value="Краски и химия">Краски и химия</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
                    Единица учета *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="листов / рулонов / шт"
                    value={newMatUnit}
                    onChange={(e) => setNewMatUnit(e.target.value)}
                    className="w-full text-xs p-2.5 bg-neutral-50 border border-neutral-300 rounded-lg focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
                    Начальный остаток
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={newMatStock}
                    onChange={(e) => setNewMatStock(Number(e.target.value))}
                    className="w-full text-xs p-2.5 bg-neutral-50 border border-neutral-300 rounded-lg font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
                    Неснижаемый минимум
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={newMatThreshold}
                    onChange={(e) => setNewMatThreshold(Number(e.target.value))}
                    className="w-full text-xs p-2.5 bg-neutral-50 border border-neutral-300 rounded-lg font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
                  Основной поставщик *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Гельветика-Поволжье / Зенон-Саратов / ВМТ"
                  value={newMatSupplier}
                  onChange={(e) => setNewMatSupplier(e.target.value)}
                  className="w-full text-xs p-2.5 bg-neutral-50 border border-neutral-300 rounded-lg focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setShowAddMatModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-neutral-600 hover:bg-neutral-100 rounded-lg cursor-pointer"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-neutral-950 hover:bg-amber-500 hover:text-neutral-950 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
                >
                  Сохранить материал
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: RECORD PROCUREMENT / REPLENISHMENT */}
      {showProcureModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-neutral-200 space-y-5">
            <div className="flex items-center justify-between border-b border-neutral-200 pb-3">
              <div>
                <h3 className="text-base font-bold text-neutral-950 flex items-center gap-2">
                  <Truck className="w-5 h-5 text-amber-600" />
                  <span>{activeFulfillRequestId ? 'Закупка по заявке мастера цеха' : 'Оформление закупки / поступления сырья'}</span>
                </h3>
                <p className="text-xs text-neutral-500">
                  {activeFulfillRequestId
                    ? 'Сырье будет зачислено на склад, привязано к заказу и выдано мастеру'
                    : 'Поступление будет зачислено на склад и отражено в журнале'}
                </p>
              </div>
              <button
                onClick={() => {
                  setShowProcureModal(false);
                  setActiveFulfillRequestId(null);
                }}
                className="p-1 text-neutral-400 hover:text-neutral-900 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {procureError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-800 rounded-xl text-xs">
                {procureError}
              </div>
            )}

            <form onSubmit={handleProcureSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
                  Выберите материал для закупки *
                </label>
                <select
                  required
                  value={procureMaterialId}
                  onChange={(e) => {
                    setProcureMaterialId(e.target.value);
                    const found = materials.find((m) => m.id === e.target.value);
                    if (found) setProcureSupplier(found.supplier);
                  }}
                  className="w-full text-xs p-2.5 bg-neutral-50 border border-neutral-300 rounded-lg focus:outline-none focus:border-amber-500 cursor-pointer font-medium"
                >
                  {materials.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} (текущий остаток: {m.inStock} {m.unit})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
                    Поступившее кол-во *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={procureQuantity}
                    onChange={(e) => setProcureQuantity(Number(e.target.value))}
                    className="w-full text-xs p-2.5 bg-neutral-50 border border-neutral-300 rounded-lg font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
                    Цена закупки за ед. (₽)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={procureUnitCost}
                    onChange={(e) => setProcureUnitCost(Number(e.target.value))}
                    className="w-full text-xs p-2.5 bg-neutral-50 border border-neutral-300 rounded-lg font-mono font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
                    Поставщик *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Гельветика / Зенон / ВМТ"
                    value={procureSupplier}
                    onChange={(e) => setProcureSupplier(e.target.value)}
                    className="w-full text-xs p-2.5 bg-neutral-50 border border-neutral-300 rounded-lg focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
                    Номер накладной / УПД
                  </label>
                  <input
                    type="text"
                    placeholder="УПД-1029"
                    value={procureInvoice}
                    onChange={(e) => setProcureInvoice(e.target.value)}
                    className="w-full text-xs p-2.5 bg-neutral-50 border border-neutral-300 rounded-lg font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
                  Ответственный сотрудник (кто принял) *
                </label>
                <input
                  type="text"
                  required
                  value={procureReceiver}
                  onChange={(e) => setProcureReceiver(e.target.value)}
                  className="w-full text-xs p-2.5 bg-neutral-50 border border-neutral-300 rounded-lg focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
                  Примечание к партии
                </label>
                <input
                  type="text"
                  placeholder="Например: поступило на стеллаж № 2 цеха"
                  value={procureNotes}
                  onChange={(e) => setProcureNotes(e.target.value)}
                  className="w-full text-xs p-2.5 bg-neutral-50 border border-neutral-300 rounded-lg"
                />
              </div>

              {/* Total calculation */}
              <div className="p-3 bg-neutral-100 rounded-xl flex justify-between items-baseline text-xs">
                <span className="text-neutral-600 font-bold uppercase">Итоговая сумма по накладной:</span>
                <span className="font-mono text-base font-black text-amber-700">
                  {(procureQuantity * procureUnitCost).toLocaleString('ru-RU')} ₽
                </span>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setShowProcureModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-neutral-600 hover:bg-neutral-100 rounded-lg cursor-pointer"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-neutral-950 rounded-lg text-xs font-bold transition-colors cursor-pointer shadow-sm"
                >
                  Зачислить на склад
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

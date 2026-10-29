import React, { useState, useEffect } from 'react';
import { User, Order, Page, SupplyRequest, MaterialStock } from '../types';
import { UserCheck, Shield, Wrench, Send, CheckCircle2, Clock, Calendar, LogOut, ArrowRight, RefreshCw, AlertCircle, Edit3, Save, Phone, MapPin, Mail, Layers, UserPlus, X, AlertTriangle, Package, Check, XCircle, ShoppingCart } from 'lucide-react';
import { db } from '../database';

interface ProfilePageProps {
  currentUser: User;
  onLogout: () => void;
  onNavigate: (page: Page) => void;
  onUpdateCurrentUser?: (updated: User) => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({
  currentUser,
  onLogout,
  onNavigate,
  onUpdateCurrentUser,
}) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [staffList, setStaffList] = useState<User[]>([]);
  const [supplyRequests, setSupplyRequests] = useState<SupplyRequest[]>([]);
  const [materials, setMaterials] = useState<MaterialStock[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Client profile editing state
  const [isEditingProfile, setIsEditingProfile] = useState<boolean>(false);
  const [editName, setEditName] = useState(currentUser.name);
  const [editPhone, setEditPhone] = useState(currentUser.phone);
  const [editEmail, setEditEmail] = useState(currentUser.email || '');
  const [editAddress, setEditAddress] = useState(currentUser.address || '');
  const [savingProfile, setSavingProfile] = useState<boolean>(false);

  // Add staff modal state
  const [showAddStaffModal, setShowAddStaffModal] = useState<boolean>(false);
  const [newStaffName, setNewStaffName] = useState('');
  const [newStaffRole, setNewStaffRole] = useState<'master' | 'manager' | 'admin'>('master');
  const [newStaffTitle, setNewStaffTitle] = useState('Мастер цеха наружной рекламы');
  const [newStaffPhone, setNewStaffPhone] = useState('+7 ');
  const [newStaffEmail, setNewStaffEmail] = useState('');
  const [newStaffUsername, setNewStaffUsername] = useState('');
  const [newStaffPassword, setNewStaffPassword] = useState('123');
  const [addStaffError, setAddStaffError] = useState('');

  // Manager state for assigning
  const [selectedOrderToAssign, setSelectedOrderToAssign] = useState<Order | null>(null);
  const [selectedMasterId, setSelectedMasterId] = useState<string>('');
  const [managerNotes, setManagerNotes] = useState<string>('');
  const [assigningLoading, setAssigningLoading] = useState<boolean>(false);
  const [assignError, setAssignError] = useState<string>('');

  // Master state for taking into work
  const [selectedOrderToWork, setSelectedOrderToWork] = useState<Order | null>(null);
  const [plannedDate, setPlannedDate] = useState<string>('');
  const [masterNotes, setMasterNotes] = useState<string>('');
  const [masterActionLoading, setMasterActionLoading] = useState<boolean>(false);

  // Master requesting materials replenishment
  const [showSupplyModal, setShowSupplyModal] = useState<boolean>(false);
  const [supplyOrder, setSupplyOrder] = useState<Order | null>(null);
  const [supplyMaterialId, setSupplyMaterialId] = useState<string>('');
  const [supplyQuantity, setSupplyQuantity] = useState<number>(1);
  const [supplyUrgency, setSupplyUrgency] = useState<'normal' | 'urgent'>('normal');
  const [supplyReason, setSupplyReason] = useState<string>('');
  const [supplyLoading, setSupplyLoading] = useState<boolean>(false);
  const [supplyError, setSupplyError] = useState<string>('');

  // Manager/Admin fulfilling supply request modal
  const [showFulfillModal, setShowFulfillModal] = useState<boolean>(false);
  const [fulfillingRequest, setFulfillingRequest] = useState<SupplyRequest | null>(null);
  const [fulfillUnitCost, setFulfillUnitCost] = useState<number>(1200);
  const [fulfillSupplier, setFulfillSupplier] = useState<string>('');
  const [fulfillInvoice, setFulfillInvoice] = useState<string>('');
  const [fulfillNotes, setFulfillNotes] = useState<string>('');
  const [fulfillLoading, setFulfillLoading] = useState<boolean>(false);
  const [fulfillError, setFulfillError] = useState<string>('');

  // Notification message
  const [feedbackMsg, setFeedbackMsg] = useState<string>('');

  const loadData = () => {
    setLoading(true);
    try {
      const allOrders = db.getOrders();
      const allUsers = db.getUsers();
      const allReqs = db.getSupplyRequests();
      const allMats = db.getMaterials();

      // Decorate staff with workload / busy status
      const decorated = allUsers.map((u) => {
        if (u.role === 'master') {
          const activeOrder = allOrders.find(
            (o) =>
              o.assignedMasterId === u.id &&
              (o.status === 'assigned' || o.status === 'in_progress')
          );
          return {
            ...u,
            isBusy: !!activeOrder,
            activeOrderCode: activeOrder ? activeOrder.code : undefined,
          };
        }
        return u;
      });

      setOrders(allOrders);
      setStaffList(decorated);
      setSupplyRequests(allReqs);
      setMaterials(allMats);
      if (allMats.length > 0 && !supplyMaterialId) {
        setSupplyMaterialId(allMats[0].id);
      }
    } catch (err) {
      console.error('Failed to load profile data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [currentUser]);

  // Handle Client Saving Profile
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const updated = db.updateProfile(currentUser.username, {
        name: editName,
        phone: editPhone,
        email: editEmail,
        address: editAddress,
      });

      if (updated) {
        setIsEditingProfile(false);
        setFeedbackMsg('Ваши контактные данные успешно обновлены!');
        if (onUpdateCurrentUser) onUpdateCurrentUser(updated);
        loadData();
        setTimeout(() => setFeedbackMsg(''), 3500);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSavingProfile(false);
    }
  };

  // Handle Add Staff Member
  const handleAddStaffSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStaffName.trim() || !newStaffUsername.trim() || newStaffPhone.trim().length < 8) {
      setAddStaffError('Заполните обязательные поля: ФИО, логин и телефон сотрудника');
      return;
    }

    const res = db.addEmployee({
      username: newStaffUsername.trim(),
      password: newStaffPassword.trim() || '123',
      role: newStaffRole,
      name: newStaffName.trim(),
      phone: newStaffPhone.trim(),
      email: newStaffEmail.trim() || undefined,
      address: 'г. Балашов',
      roleTitle: newStaffTitle.trim() || (newStaffRole === 'master' ? 'Мастер цеха' : newStaffRole === 'manager' ? 'Диспетчер цеха' : 'Администратор'),
    });

    if (res.success && res.user) {
      setFeedbackMsg(`Сотрудник «${res.user.name}» (${res.user.roleTitle}) успешно добавлен в штат предприятия!`);
      setShowAddStaffModal(false);
      setNewStaffName('');
      setNewStaffUsername('');
      setNewStaffPhone('+7 ');
      setNewStaffEmail('');
      loadData();
      setTimeout(() => setFeedbackMsg(''), 4500);
    } else {
      setAddStaffError(res.error || 'Ошибка при добавлении сотрудника');
    }
  };

  // Handle Manager Assigning order to Master (Strict 1 order per master!)
  const handleAssignSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrderToAssign || !selectedMasterId) return;

    setAssigningLoading(true);
    setAssignError('');

    try {
      const res = db.assignMaster(selectedOrderToAssign.id, selectedMasterId, managerNotes);

      if (res.success && res.order) {
        setFeedbackMsg(`Заказ #${selectedOrderToAssign.code} успешно передан мастеру!`);
        setSelectedOrderToAssign(null);
        setSelectedMasterId('');
        setManagerNotes('');
        loadData();
        setTimeout(() => setFeedbackMsg(''), 4000);
      } else {
        setAssignError(res.error || 'Ошибка при передаче заказа');
      }
    } catch (err: any) {
      setAssignError(err?.message || 'Ошибка при передаче заказа');
    } finally {
      setAssigningLoading(false);
    }
  };

  // Handle Master taking order into work
  const handleWorkSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrderToWork) return;

    setMasterActionLoading(true);
    try {
      const res = db.takeIntoWork(selectedOrderToWork.id, plannedDate, masterNotes);

      if (res.success) {
        setFeedbackMsg(`Заказ #${selectedOrderToWork.code} взят в работу. Плановый срок: ${plannedDate}`);
        setSelectedOrderToWork(null);
        setPlannedDate('');
        setMasterNotes('');
        loadData();
        setTimeout(() => setFeedbackMsg(''), 4000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setMasterActionLoading(false);
    }
  };

  // Master marks order as READY (Direct reliable 1-click execution)
  const handleMarkReadyDirect = (orderId: string, orderCode: string) => {
    try {
      const res = db.markOrderReady(orderId);

      if (res.success) {
        setFeedbackMsg(`Заказ #${orderCode} успешно завершен! Статус изменен на «Готов к выдаче».`);
        loadData();
        setTimeout(() => setFeedbackMsg(''), 4000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Manager or Admin changes status
  const handleStatusChange = (orderId: string, newStatus: any) => {
    try {
      const res = db.updateOrderStatus(orderId, newStatus, currentUser.roleTitle, currentUser.name);

      if (res) {
        setFeedbackMsg(`Статус заказа успешно обновлен.`);
        loadData();
        setTimeout(() => setFeedbackMsg(''), 3000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Master opens material replenishment request modal
  const handleOpenSupplyModal = (order: Order) => {
    setSupplyOrder(order);
    if (materials.length > 0) {
      setSupplyMaterialId(materials[0].id);
    }
    setSupplyQuantity(1);
    setSupplyUrgency('normal');
    setSupplyReason('');
    setSupplyError('');
    setShowSupplyModal(true);
  };

  // Master submits replenishment request
  const handleSupplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!supplyOrder || !supplyMaterialId) {
      setSupplyError('Выберите материал');
      return;
    }
    if (supplyQuantity <= 0) {
      setSupplyError('Укажите количество больше нуля');
      return;
    }

    setSupplyLoading(true);
    setSupplyError('');

    try {
      const res = db.createSupplyRequest({
        orderId: supplyOrder.id,
        materialId: supplyMaterialId,
        quantity: Number(supplyQuantity),
        urgency: supplyUrgency,
        reason: supplyReason.trim() || 'Недостаточно сырья в цехе для исполнения заказа',
        masterId: currentUser.id,
        masterName: currentUser.name,
      });

      if (res.success && res.request) {
        setFeedbackMsg(`Заявка на сырье «${res.request.materialName}» оформлена и передана в отдел снабжения!`);
        setShowSupplyModal(false);
        loadData();
        setTimeout(() => setFeedbackMsg(''), 4500);
      } else {
        setSupplyError(res.error || 'Ошибка при создании заявки');
      }
    } catch (err: any) {
      setSupplyError(err?.message || 'Ошибка при оформлении заявки');
    } finally {
      setSupplyLoading(false);
    }
  };

  // Manager/Admin opens fulfill modal
  const handleOpenFulfillModal = (req: SupplyRequest) => {
    setFulfillingRequest(req);
    const mat = materials.find((m) => m.id === req.materialId);
    setFulfillSupplier(mat?.supplier || 'Гельветика-Поволжье');
    setFulfillUnitCost(1200);
    setFulfillInvoice(`ТН-${Math.floor(1000 + Math.random() * 9000)}`);
    setFulfillNotes(`Закупка по заявке мастера ${req.masterName} для заказа ${req.orderCode}`);
    setFulfillError('');
    setShowFulfillModal(true);
  };

  // Manager/Admin submits fulfillment
  const handleFulfillSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fulfillingRequest) return;

    setFulfillLoading(true);
    setFulfillError('');

    try {
      const res = db.fulfillSupplyRequest(fulfillingRequest.id, {
        unitCost: Number(fulfillUnitCost),
        supplier: fulfillSupplier,
        invoiceNumber: fulfillInvoice,
        fulfilledByName: currentUser.name,
        notes: fulfillNotes,
      });

      if (res.success && res.procurement) {
        setFeedbackMsg(`Сырье успешно оприходовано на склад и передано в производство цеха! Накладная: ${res.procurement.invoiceNumber}`);
        setShowFulfillModal(false);
        loadData();
        setTimeout(() => setFeedbackMsg(''), 4500);
      } else {
        setFulfillError(res.error || 'Ошибка оприходования сырья');
      }
    } catch (err: any) {
      setFulfillError(err?.message || 'Ошибка оприходования сырья');
    } finally {
      setFulfillLoading(false);
    }
  };

  // Manager/Admin rejects request
  const handleRejectRequest = (req: SupplyRequest) => {
    const reason = prompt(`Укажите причину отклонения заявки по заказу ${req.orderCode}:`, 'Имеются остатки аналогичного материала на складе');
    if (reason === null) return; // user cancelled

    const res = db.rejectSupplyRequest(req.id, currentUser.name, reason);
    if (res.success) {
      setFeedbackMsg(`Заявка мастера на сырье отклонена.`);
      loadData();
      setTimeout(() => setFeedbackMsg(''), 3500);
    }
  };

  const masters = staffList.filter((u) => u.role === 'master');

  return (
    <div className="py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      {/* User Header Profile Card */}
      <div className="bg-white border border-neutral-200 rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-xs">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-neutral-950 text-white flex items-center justify-center font-bold text-2xl">
            {currentUser.name[0]}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-neutral-950">
                {currentUser.name}
              </h1>
              <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                {currentUser.roleTitle}
              </span>
            </div>
            <div className="text-xs text-neutral-500 font-mono mt-1 space-x-3">
              <span>Логин: <strong>{currentUser.username}</strong></span>
              <span>Тел: <strong>{currentUser.phone}</strong></span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadData}
            className="p-2.5 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 rounded-xl transition-colors cursor-pointer"
            title="Обновить данные"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={onLogout}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-neutral-100 hover:bg-red-50 hover:text-red-700 text-neutral-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Выйти из профиля</span>
          </button>
        </div>
      </div>

      {feedbackMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-xl text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{feedbackMsg}</span>
        </div>
      )}

      {/* ===================== ROLE 1: CLIENT ===================== */}
      {currentUser.role === 'client' && (
        <div className="space-y-6">
          {/* Profile details & editing form */}
          <div className="bg-white border border-neutral-200 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xs">
            <div className="flex items-center justify-between border-b border-neutral-200 pb-4">
              <div>
                <h2 className="text-lg font-bold text-neutral-950">
                  Данные заказчика
                </h2>
                <p className="text-xs text-neutral-500">
                  Эти данные автоматически используются при формировании заявок на вывески и полиграфию
                </p>
              </div>

              {!isEditingProfile && (
                <button
                  onClick={() => setIsEditingProfile(true)}
                  className="px-4 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Редактировать данные</span>
                </button>
              )}
            </div>

            {isEditingProfile ? (
              <form onSubmit={handleSaveProfile} className="space-y-4 max-w-xl">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
                    ФИО или Название организации *
                  </label>
                  <input
                    type="text"
                    required
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full text-xs p-2.5 bg-neutral-50 border border-neutral-300 rounded-lg focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
                      Контактный телефон *
                    </label>
                    <input
                      type="tel"
                      required
                      value={editPhone}
                      onChange={(e) => setEditPhone(e.target.value)}
                      className="w-full text-xs p-2.5 bg-neutral-50 border border-neutral-300 rounded-lg focus:outline-none focus:border-amber-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      value={editEmail}
                      onChange={(e) => setEditEmail(e.target.value)}
                      className="w-full text-xs p-2.5 bg-neutral-50 border border-neutral-300 rounded-lg focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
                    Адрес объекта / доставки в Балашове
                  </label>
                  <input
                    type="text"
                    placeholder="г. Балашов, ул. Володарского, 28"
                    value={editAddress}
                    onChange={(e) => setEditAddress(e.target.value)}
                    className="w-full text-xs p-2.5 bg-neutral-50 border border-neutral-300 rounded-lg focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="submit"
                    disabled={savingProfile}
                    className="px-5 py-2.5 bg-neutral-950 hover:bg-amber-500 hover:text-neutral-950 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <Save className="w-4 h-4" />
                    <span>{savingProfile ? 'Сохранение...' : 'Сохранить изменения'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditingProfile(false)}
                    className="px-4 py-2.5 text-xs text-neutral-600 hover:bg-neutral-100 rounded-xl"
                  >
                    Отмена
                  </button>
                </div>
              </form>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-200">
                  <div className="text-neutral-500 font-semibold mb-1 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5" /> Телефон для связи:
                  </div>
                  <div className="font-mono font-bold text-neutral-900">{currentUser.phone}</div>
                </div>

                <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-200">
                  <div className="text-neutral-500 font-semibold mb-1 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5" /> Email:
                  </div>
                  <div className="font-medium text-neutral-900">{currentUser.email || 'Не указан'}</div>
                </div>

                <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-200">
                  <div className="text-neutral-500 font-semibold mb-1 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5" /> Адрес объекта:
                  </div>
                  <div className="font-medium text-neutral-900">{currentUser.address || 'г. Балашов'}</div>
                </div>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap gap-4">
            <button
              onClick={() => onNavigate('services')}
              className="px-6 py-3 bg-neutral-950 hover:bg-amber-500 hover:text-neutral-950 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-2 shadow-sm"
            >
              <span>Сделать новый заказ из каталога</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => onNavigate('orders')}
              className="px-6 py-3 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              Перейти к моим заказам
            </button>
          </div>
        </div>
      )}

      {/* ===================== ROLE 2: MANAGER / DISPATCHER ===================== */}
      {currentUser.role === 'manager' && (
        <div className="space-y-6">
          <div className="border-b border-neutral-200 pb-3 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-black text-neutral-950">
                Диспетчерская служба: Управление заказами и цехом
              </h2>
              <p className="text-xs text-neutral-500 mt-0.5">
                Правило цеха: Мастер может выполнять только 1 заказ единовременно. Занятым мастерам новый заказ передать нельзя.
              </p>
            </div>
          </div>

          {/* New incoming orders requiring assignment */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-neutral-800 uppercase tracking-wider">
              Новые нераспределенные заявки ({orders.filter((o) => o.status === 'new').length})
            </h3>

            {orders.filter((o) => o.status === 'new').length === 0 ? (
              <div className="p-6 text-center bg-neutral-50 rounded-xl border border-neutral-200 text-xs text-neutral-500">
                Все поступившие заявки обработаны и переданы мастерам цеха.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {orders
                  .filter((o) => o.status === 'new')
                  .map((order) => (
                    <div
                      key={order.id}
                      className="bg-white border-2 border-amber-400 rounded-2xl p-5 space-y-4 shadow-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-black text-base text-neutral-950">
                          #{order.code}
                        </span>
                        <span className="text-[10px] font-bold uppercase bg-amber-100 text-amber-900 px-2 py-0.5 rounded">
                          Новая заявка
                        </span>
                      </div>

                      <div className="text-xs space-y-1">
                        <div>Клиент: <strong className="text-neutral-900">{order.clientName}</strong> ({order.clientPhone})</div>
                        <div className="text-neutral-500 truncate">Адрес: {order.deliveryAddress}</div>
                        <div className="font-bold text-amber-600 font-mono text-sm pt-1">
                          Сумма: {order.totalAmount.toLocaleString('ru-RU')} ₽
                        </div>
                      </div>

                      {/* Items */}
                      <div className="text-[11px] bg-neutral-50 p-2.5 rounded-lg space-y-1">
                        {order.items.map((it, idx) => (
                          <div key={idx} className="flex justify-between">
                            <span className="font-medium text-neutral-800">{it.title} ({it.quantity} {it.unit})</span>
                            <span className="font-mono">{it.totalPrice} ₽</span>
                          </div>
                        ))}
                      </div>

                      <button
                        onClick={() => {
                          setSelectedOrderToAssign(order);
                          setAssignError('');
                        }}
                        className="w-full py-2.5 bg-neutral-950 hover:bg-amber-500 hover:text-neutral-950 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
                      >
                        <UserCheck className="w-4 h-4" />
                        <span>Назначить свободного мастера</span>
                      </button>
                    </div>
                  ))}
              </div>
            )}
          </div>

          {/* Master workload visual strip */}
          <div className="bg-white border border-neutral-200 rounded-2xl p-5 space-y-3 shadow-xs">
            <h4 className="text-xs font-bold text-neutral-700 uppercase tracking-wider">
              Загруженность мастеров цеха (Лимит: 1 активный заказ):
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              {masters.map((m) => (
                <div
                  key={m.id}
                  className={`p-3 rounded-xl border ${
                    m.isBusy
                      ? 'bg-amber-50/70 border-amber-300 text-amber-950'
                      : 'bg-emerald-50/70 border-emerald-300 text-emerald-950'
                  }`}
                >
                  <div className="font-bold">{m.name}</div>
                  <div className="text-[11px] text-neutral-600 mt-0.5">{m.roleTitle}</div>
                  <div className="mt-2 text-[11px] font-semibold">
                    {m.isBusy ? (
                      <span className="text-amber-800">Занят заказом #{m.activeOrderCode}</span>
                    ) : (
                      <span className="text-emerald-700">Свободен для нового заказа</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* All orders management table for Dispatcher */}
          <div className="bg-white border border-neutral-200 rounded-2xl p-6 space-y-4 shadow-xs">
            <h3 className="text-sm font-bold text-neutral-900 uppercase tracking-wider">
              Управление статусами всех заказов
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-neutral-100 text-neutral-600 uppercase text-[10px]">
                  <tr>
                    <th className="p-3">Номер</th>
                    <th className="p-3">Клиент</th>
                    <th className="p-3">Мастер</th>
                    <th className="p-3">Сумма</th>
                    <th className="p-3">Текущий статус</th>
                    <th className="p-3">Действие диспетчера</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200">
                  {orders.map((o) => (
                    <tr key={o.id} className="hover:bg-neutral-50">
                      <td className="p-3 font-mono font-bold">{o.code}</td>
                      <td className="p-3">
                        <div className="font-semibold text-neutral-900">{o.clientName}</div>
                        <div className="text-neutral-500 font-mono text-[11px]">{o.clientPhone}</div>
                      </td>
                      <td className="p-3">
                        {o.assignedMasterName ? (
                          <div>
                            <span className="font-medium text-neutral-900">{o.assignedMasterName}</span>
                            {o.plannedCompletionDate && (
                              <div className="text-[10px] text-amber-700 font-mono">срок: {o.plannedCompletionDate}</div>
                            )}
                          </div>
                        ) : (
                          <span className="text-neutral-400">Не назначен</span>
                        )}
                      </td>
                      <td className="p-3 font-mono font-bold text-neutral-900">
                        {o.totalAmount.toLocaleString('ru-RU')} ₽
                      </td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-neutral-100 text-neutral-800">
                          {o.statusText}
                        </span>
                      </td>
                      <td className="p-3">
                        <select
                          value={o.status}
                          onChange={(e) => handleStatusChange(o.id, e.target.value)}
                          className="bg-white border border-neutral-300 rounded px-2 py-1 text-xs cursor-pointer focus:outline-none focus:border-amber-500"
                        >
                          <option value="new">1. Новая заявка</option>
                          <option value="assigned">2. Назначен мастер</option>
                          <option value="in_progress">3. В работе в цехе</option>
                          <option value="ready">4. Готов к выдаче</option>
                          <option value="completed">5. Завершен и сдан</option>
                          <option value="cancelled">6. Отменен</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Supply requests management block for Dispatcher */}
          <div className="bg-white border border-neutral-200 rounded-2xl p-6 space-y-4 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-100 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-neutral-900 uppercase tracking-wider">
                    Заявки мастеров на закупку и пополнение сырья
                  </h3>
                  {supplyRequests.filter((r) => r.status === 'pending').length > 0 && (
                    <span className="px-2 py-0.5 rounded text-[11px] font-black bg-amber-500 text-neutral-950 animate-pulse">
                      {supplyRequests.filter((r) => r.status === 'pending').length} в ожидании
                    </span>
                  )}
                </div>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Запросы мастеров цеха, когда остатков на складе не хватает для завершения заказа
                </p>
              </div>

              <button
                onClick={() => onNavigate('materials')}
                className="text-xs text-amber-700 hover:text-amber-800 font-bold underline cursor-pointer"
              >
                Склад материалов и накладные →
              </button>
            </div>

            {supplyRequests.length === 0 ? (
              <div className="p-6 text-center text-xs text-neutral-500 bg-neutral-50 rounded-xl border border-neutral-200">
                Запросов на закупку сырья нет. Все заказы цеха обеспечены материалами.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-neutral-100 text-neutral-600 uppercase text-[10px]">
                    <tr>
                      <th className="p-3">Срочность</th>
                      <th className="p-3">Заказ</th>
                      <th className="p-3">Мастер</th>
                      <th className="p-3">Материал и объем</th>
                      <th className="p-3">Обоснование мастера</th>
                      <th className="p-3">Статус</th>
                      <th className="p-3 text-right">Действие снабжения</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-200">
                    {supplyRequests.map((req) => (
                      <tr key={req.id} className="hover:bg-neutral-50">
                        <td className="p-3">
                          {req.urgency === 'urgent' ? (
                            <span className="px-2 py-0.5 rounded text-[10px] font-black bg-red-100 text-red-800 border border-red-200 uppercase">
                              Срочно
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-neutral-100 text-neutral-700">
                              Планово
                            </span>
                          )}
                        </td>
                        <td className="p-3 font-mono font-bold text-neutral-950">
                          #{req.orderCode}
                        </td>
                        <td className="p-3">
                          <span className="font-semibold text-neutral-900">{req.masterName}</span>
                          <div className="text-[10px] text-neutral-500">{req.createdAt}</div>
                        </td>
                        <td className="p-3">
                          <div className="font-bold text-neutral-900">{req.materialName}</div>
                          <div className="text-amber-800 font-mono font-bold">
                            {req.quantity} {req.unit}
                          </div>
                        </td>
                        <td className="p-3 max-w-xs text-neutral-700">
                          <span className="text-[11px] leading-relaxed">{req.reason}</span>
                        </td>
                        <td className="p-3 whitespace-nowrap">
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
                                {req.fulfilledAt}
                              </div>
                            </div>
                          )}
                          {req.status === 'rejected' && (
                            <span className="inline-block whitespace-nowrap px-2.5 py-1 rounded text-[11px] font-bold bg-red-100 text-red-900 border border-red-300">
                              Отклонено
                            </span>
                          )}
                        </td>
                        <td className="p-3 text-right">
                          {req.status === 'pending' ? (
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleOpenFulfillModal(req)}
                                className="px-3 py-1.5 bg-neutral-950 hover:bg-emerald-600 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer shadow-xs whitespace-nowrap"
                              >
                                Одобрить и закупить
                              </button>
                              <button
                                onClick={() => handleRejectRequest(req)}
                                className="px-2.5 py-1.5 text-neutral-500 hover:text-red-700 hover:bg-red-50 rounded-lg text-xs font-semibold cursor-pointer"
                              >
                                Отклонить
                              </button>
                            </div>
                          ) : (
                            <span className="text-neutral-400 text-[11px]">Действий не требуется</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ===================== ROLE 3: MASTER ===================== */}
      {currentUser.role === 'master' && (
        <div className="space-y-6">
          <div className="border-b border-neutral-200 pb-3">
            <h2 className="text-xl font-black text-neutral-950">
              Рабочее место мастера цеха ({currentUser.name})
            </h2>
            <p className="text-xs text-neutral-500 mt-0.5">
              В работе может находиться только 1 активный заказ. Если сырья на складе недостаточно — оформите заявку на пополнение.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {orders
              .filter((o) => o.assignedMasterId === currentUser.id)
              .map((order) => {
                const orderSupplyReqs = supplyRequests.filter((r) => r.orderId === order.id);

                return (
                  <div
                    key={order.id}
                    className="bg-white border border-neutral-200 rounded-2xl p-6 space-y-4 shadow-xs"
                  >
                    <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
                      <span className="font-mono font-black text-lg text-neutral-950">
                        #{order.code}
                      </span>
                      <span className={`text-[11px] font-bold uppercase px-2.5 py-0.5 rounded ${
                        order.status === 'in_progress'
                          ? 'bg-amber-100 text-amber-900 border border-amber-300'
                          : order.status === 'ready'
                          ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                          : 'bg-blue-100 text-blue-900 border border-blue-300'
                      }`}>
                        {order.statusText}
                      </span>
                    </div>

                    <div className="text-xs space-y-1.5">
                      <div>Заказчик: <strong className="text-neutral-900">{order.clientName}</strong> ({order.clientPhone})</div>
                      <div>Адрес: <span className="text-neutral-700">{order.deliveryAddress}</span></div>
                      {order.plannedCompletionDate && (
                        <div className="text-amber-800 font-semibold flex items-center gap-1.5 pt-1">
                          <Calendar className="w-4 h-4 text-amber-600" />
                          <span>Плановый срок сдачи цеха: {order.plannedCompletionDate}</span>
                        </div>
                      )}
                      {order.managerNotes && (
                        <div className="text-neutral-700 bg-neutral-50 p-2.5 rounded-lg border border-neutral-200 text-[11px]">
                          Задание диспетчера: {order.managerNotes}
                        </div>
                      )}
                    </div>

                    {/* Order items to craft */}
                    <div className="text-xs bg-neutral-50 p-3.5 rounded-xl space-y-1.5 border border-neutral-200">
                      <div className="font-bold text-neutral-700 uppercase text-[10px]">К изготовлению в цехе:</div>
                      {order.items.map((it, idx) => (
                        <div key={idx} className="text-neutral-900 font-medium">
                          • {it.title} — <strong>{it.quantity} {it.unit}</strong> {it.customNotes && `(${it.customNotes})`}
                        </div>
                      ))}
                    </div>

                    {/* Existing Supply Requests for this order */}
                    {orderSupplyReqs.length > 0 && (
                      <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-3.5 space-y-2">
                        <div className="text-[11px] font-bold text-amber-950 uppercase tracking-wider flex items-center gap-1.5">
                          <Package className="w-3.5 h-3.5 text-amber-700" />
                          <span>Заявки на сырье ({orderSupplyReqs.length}):</span>
                        </div>
                        <div className="space-y-1.5">
                          {orderSupplyReqs.map((req) => (
                            <div key={req.id} className="p-2.5 bg-white rounded-lg border border-amber-100 text-xs space-y-1">
                              <div className="flex items-center justify-between font-bold">
                                <span className="text-neutral-900">{req.materialName}</span>
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                  req.status === 'fulfilled'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : req.status === 'rejected'
                                    ? 'bg-red-100 text-red-800'
                                    : 'bg-amber-100 text-amber-900'
                                }`}>
                                  {req.status === 'fulfilled'
                                    ? 'Закуплено и поступило в цех'
                                    : req.status === 'rejected'
                                    ? 'Отклонено'
                                    : 'Ожидает снабжение'}
                                </span>
                              </div>
                              <div className="text-neutral-700 text-[11px]">
                                Требуется: <strong>{req.quantity} {req.unit}</strong>
                                {req.urgency === 'urgent' && (
                                  <span className="text-red-600 font-bold ml-1.5">(СРОЧНО)</span>
                                )}
                              </div>
                              <div className="text-[10px] text-neutral-500 italic">Причина: {req.reason}</div>
                              {req.fulfilledAt && (
                                <div className="text-[10px] text-emerald-700 font-semibold pt-0.5">
                                  ✓ Сырье выдано в цех: {req.fulfilledAt} ({req.fulfilledByName})
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Master Actions */}
                    <div className="space-y-2 pt-2">
                      {order.status === 'assigned' && (
                        <button
                          onClick={() => setSelectedOrderToWork(order)}
                          className="w-full py-3 bg-neutral-950 hover:bg-amber-500 hover:text-neutral-950 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-sm"
                        >
                          <Wrench className="w-4 h-4" />
                          <span>Взять в работу и указать плановую дату</span>
                        </button>
                      )}

                      {order.status === 'in_progress' && (
                        <button
                          onClick={() => handleMarkReadyDirect(order.id, order.code)}
                          className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-sm"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Подтвердить готовность (Готово к выдаче / монтажу)</span>
                        </button>
                      )}

                      {(order.status === 'assigned' || order.status === 'in_progress') && (
                        <button
                          onClick={() => handleOpenSupplyModal(order)}
                          className="w-full py-2.5 bg-amber-50 hover:bg-amber-100 text-amber-950 border border-amber-300 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-2"
                        >
                          <Package className="w-4 h-4 text-amber-700" />
                          <span>Запросить нехватку сырья / пополнение склада</span>
                        </button>
                      )}

                      {order.status === 'ready' && (
                        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-center text-xs font-bold text-emerald-800 flex items-center justify-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span>Изделие изготовлено и ждет выдачи заказчику</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* ===================== ROLE 4: ADMIN ===================== */}
      {currentUser.role === 'admin' && (
        <div className="space-y-6">
          <div className="border-b border-neutral-200 pb-3 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-black text-neutral-950">
                Панель управления предприятием РА «Алфавит»
              </h2>
              <p className="text-xs text-neutral-500 mt-0.5">
                Сводные показатели за текущий (октябрь 2026) и прошлый месяц (сентябрь 2026).
              </p>
            </div>

            <button
              onClick={() => onNavigate('materials')}
              className="px-4 py-2 bg-neutral-950 hover:bg-amber-500 hover:text-neutral-950 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              Склад и расход материалов →
            </button>
          </div>

          {/* Stats overview */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 bg-white border border-neutral-200 rounded-xl shadow-xs">
              <div className="text-xs text-neutral-500 font-medium">Всего заказов в базе</div>
              <div className="text-2xl font-black font-mono mt-1">{orders.length}</div>
            </div>
            <div className="p-4 bg-white border border-neutral-200 rounded-xl shadow-xs">
              <div className="text-xs text-neutral-500 font-medium">В производстве цеха</div>
              <div className="text-2xl font-black font-mono text-amber-600 mt-1">
                {orders.filter((o) => o.status === 'in_progress').length}
              </div>
            </div>
            <div className="p-4 bg-white border border-neutral-200 rounded-xl shadow-xs">
              <div className="text-xs text-neutral-500 font-medium">Готовы / Сданы</div>
              <div className="text-2xl font-black font-mono text-emerald-600 mt-1">
                {orders.filter((o) => o.status === 'ready' || o.status === 'completed').length}
              </div>
            </div>
            <div className="p-4 bg-white border border-neutral-200 rounded-xl shadow-xs">
              <div className="text-xs text-neutral-500 font-medium">Суммарный оборот</div>
              <div className="text-xl font-black font-mono text-neutral-950 mt-1">
                {orders.reduce((acc, curr) => acc + curr.totalAmount, 0).toLocaleString('ru-RU')} ₽
              </div>
            </div>
          </div>

          {/* Staff directory */}
          <div className="bg-white border border-neutral-200 rounded-2xl p-6 space-y-4 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-neutral-900 uppercase tracking-wider">
                  Штатное расписание и сотрудники ({staffList.length} чел.)
                </h3>
                <p className="text-xs text-neutral-500">
                  Управление персоналом производственных участков и диспетчерской
                </p>
              </div>

              <button
                onClick={() => {
                  setShowAddStaffModal(true);
                  setAddStaffError('');
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-neutral-950 hover:bg-amber-500 hover:text-neutral-950 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer self-start sm:self-auto shadow-xs"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>+ Добавить сотрудника</span>
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              {staffList.map((st) => (
                <div key={st.id} className="p-3.5 bg-neutral-50 border border-neutral-200 rounded-xl space-y-1">
                  <div className="font-bold text-neutral-900">{st.name}</div>
                  <div className="text-amber-700 font-semibold">{st.roleTitle}</div>
                  <div className="text-neutral-500 font-mono text-[11px]">{st.phone}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Admin Orders Table */}
          <div className="bg-white border border-neutral-200 rounded-2xl p-6 space-y-4 shadow-xs">
            <h3 className="text-sm font-bold text-neutral-900 uppercase tracking-wider">
              Все заказы предприятия (Аудит и контроль)
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-neutral-100 text-neutral-600 uppercase text-[10px]">
                  <tr>
                    <th className="p-3">Код</th>
                    <th className="p-3">Дата</th>
                    <th className="p-3">Клиент</th>
                    <th className="p-3">Мастер</th>
                    <th className="p-3">Сумма</th>
                    <th className="p-3">Статус</th>
                    <th className="p-3">Сменить статус</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200">
                  {orders.map((o) => (
                    <tr key={o.id} className="hover:bg-neutral-50">
                      <td className="p-3 font-mono font-bold">{o.code}</td>
                      <td className="p-3 text-neutral-500 font-mono text-[11px]">{o.createdAt}</td>
                      <td className="p-3 font-semibold text-neutral-900">{o.clientName}</td>
                      <td className="p-3 text-neutral-800">{o.assignedMasterName || '—'}</td>
                      <td className="p-3 font-mono font-bold text-neutral-900">
                        {o.totalAmount.toLocaleString('ru-RU')} ₽
                      </td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-neutral-100 text-neutral-800">
                          {o.statusText}
                        </span>
                      </td>
                      <td className="p-3">
                        <select
                          value={o.status}
                          onChange={(e) => handleStatusChange(o.id, e.target.value)}
                          className="bg-white border border-neutral-300 rounded px-2 py-1 text-xs cursor-pointer focus:outline-none focus:border-amber-500"
                        >
                          <option value="new">Новая заявка</option>
                          <option value="assigned">Назначен мастер</option>
                          <option value="in_progress">В работе у мастера</option>
                          <option value="ready">Готов к выдаче</option>
                          <option value="completed">Сдан клиенту</option>
                          <option value="cancelled">Отменен</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Manager Assigns Order with Strict 1-Master-1-Order Check */}
      {selectedOrderToAssign && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-neutral-200">
            <h3 className="text-base font-bold text-neutral-950 mb-1">
              Назначение мастера на заказ #{selectedOrderToAssign.code}
            </h3>
            <p className="text-xs text-neutral-500 mb-4">
              По регламенту РА «Алфавит», мастер может вести только 1 заказ единовременно.
            </p>

            {assignError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-800 rounded-xl text-xs flex items-center gap-2 mb-4">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{assignError}</span>
              </div>
            )}

            <form onSubmit={handleAssignSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
                  Выберите свободного мастера цеха *
                </label>
                <select
                  required
                  value={selectedMasterId}
                  onChange={(e) => {
                    setSelectedMasterId(e.target.value);
                    setAssignError('');
                  }}
                  className="w-full text-xs p-2.5 bg-neutral-50 border border-neutral-300 rounded-lg focus:outline-none focus:border-amber-500 cursor-pointer"
                >
                  <option value="">-- Выберите мастера цеха --</option>
                  {masters.map((m) => (
                    <option
                      key={m.id}
                      value={m.id}
                      disabled={m.isBusy}
                      className={m.isBusy ? 'text-neutral-400 bg-neutral-100' : ''}
                    >
                      {m.name} ({m.roleTitle}) — {m.isBusy ? `[ЗАНЯТ заказом #${m.activeOrderCode}]` : '[СВОБОДЕН]'}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
                  Инструкция диспетчера (материалы, приоритет)
                </label>
                <textarea
                  rows={3}
                  placeholder="Например: акрил 3мм в цехе, начать сборку сразу после раскроя..."
                  value={managerNotes}
                  onChange={(e) => setManagerNotes(e.target.value)}
                  className="w-full text-xs p-2.5 bg-neutral-50 border border-neutral-300 rounded-lg focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedOrderToAssign(null)}
                  className="px-4 py-2 text-xs font-semibold text-neutral-600 hover:bg-neutral-100 rounded-lg cursor-pointer"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  disabled={assigningLoading || !selectedMasterId}
                  className="px-5 py-2 bg-neutral-950 hover:bg-amber-500 hover:text-neutral-950 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer disabled:opacity-50"
                >
                  {assigningLoading ? 'Отправка...' : 'Передать в работу'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Master Takes into Work and Sets Planned Date */}
      {selectedOrderToWork && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-neutral-200">
            <h3 className="text-base font-bold text-neutral-950 mb-1">
              Взять заказ #{selectedOrderToWork.code} в работу
            </h3>
            <p className="text-xs text-neutral-500 mb-4">
              Укажите дату завершения работ в цехе. Клиент сразу увидит её в своем кабинете.
            </p>

            <form onSubmit={handleWorkSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
                  Плановая дата готовности *
                </label>
                <input
                  type="date"
                  required
                  value={plannedDate}
                  onChange={(e) => setPlannedDate(e.target.value)}
                  className="w-full text-xs p-2.5 bg-neutral-50 border border-neutral-300 rounded-lg focus:outline-none focus:border-amber-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
                  Примечание мастера цеха
                </label>
                <textarea
                  rows={2}
                  placeholder="Например: подготовлен к фрезеровке, сборка завтра"
                  value={masterNotes}
                  onChange={(e) => setMasterNotes(e.target.value)}
                  className="w-full text-xs p-2.5 bg-neutral-50 border border-neutral-300 rounded-lg focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedOrderToWork(null)}
                  className="px-4 py-2 text-xs font-semibold text-neutral-600 hover:bg-neutral-100 rounded-lg cursor-pointer"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  disabled={masterActionLoading || !plannedDate}
                  className="px-5 py-2 bg-neutral-950 hover:bg-amber-500 hover:text-neutral-950 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer disabled:opacity-50"
                >
                  {masterActionLoading ? 'Сохранение...' : 'Подтвердить срок и начать'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD NEW EMPLOYEE */}
      {showAddStaffModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-neutral-200 space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-200 pb-3">
              <div>
                <h3 className="text-base font-bold text-neutral-950">Добавление сотрудника в штат</h3>
                <p className="text-xs text-neutral-500">Назначение учетной записи для работы с заказами</p>
              </div>
              <button
                onClick={() => setShowAddStaffModal(false)}
                className="p-1 text-neutral-400 hover:text-neutral-900 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {addStaffError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-800 rounded-xl text-xs">
                {addStaffError}
              </div>
            )}

            <form onSubmit={handleAddStaffSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
                  ФИО сотрудника *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Например: Роман Григорьев"
                  value={newStaffName}
                  onChange={(e) => {
                    setNewStaffName(e.target.value);
                    if (!newStaffUsername && e.target.value.length > 2) {
                      // Suggest login
                      const translit = e.target.value.toLowerCase().split(' ')[0] || 'worker';
                      setNewStaffUsername(translit);
                    }
                  }}
                  className="w-full text-xs p-2.5 bg-neutral-50 border border-neutral-300 rounded-lg focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
                    Роль в системе *
                  </label>
                  <select
                    value={newStaffRole}
                    onChange={(e) => {
                      const r = e.target.value as any;
                      setNewStaffRole(r);
                      if (r === 'master') setNewStaffTitle('Мастер цеха наружной рекламы');
                      else if (r === 'manager') setNewStaffTitle('Диспетчер смены / Менеджер');
                      else if (r === 'admin') setNewStaffTitle('Заместитель директора');
                    }}
                    className="w-full text-xs p-2.5 bg-neutral-50 border border-neutral-300 rounded-lg focus:outline-none focus:border-amber-500 cursor-pointer font-medium"
                  >
                    <option value="master">3. Мастер цеха</option>
                    <option value="manager">2. Диспетчер / Менеджер</option>
                    <option value="admin">1. Администратор</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
                    Телефон *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="+7 (927) 000-00-00"
                    value={newStaffPhone}
                    onChange={(e) => setNewStaffPhone(e.target.value)}
                    className="w-full text-xs p-2.5 bg-neutral-50 border border-neutral-300 rounded-lg font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
                  Должность / Специализация *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Оператор ЧПУ / Сборщик букв / Диспетчер"
                  value={newStaffTitle}
                  onChange={(e) => setNewStaffTitle(e.target.value)}
                  className="w-full text-xs p-2.5 bg-neutral-50 border border-neutral-300 rounded-lg focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
                    Логин для входа *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="roman_master"
                    value={newStaffUsername}
                    onChange={(e) => setNewStaffUsername(e.target.value.toLowerCase().replace(/\s/g, ''))}
                    className="w-full text-xs p-2.5 bg-neutral-50 border border-neutral-300 rounded-lg font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
                    Пароль *
                  </label>
                  <input
                    type="text"
                    required
                    value={newStaffPassword}
                    onChange={(e) => setNewStaffPassword(e.target.value)}
                    className="w-full text-xs p-2.5 bg-neutral-50 border border-neutral-300 rounded-lg font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
                  Рабочий Email
                </label>
                <input
                  type="email"
                  placeholder="employee@alfavit64.ru"
                  value={newStaffEmail}
                  onChange={(e) => setNewStaffEmail(e.target.value)}
                  className="w-full text-xs p-2.5 bg-neutral-50 border border-neutral-300 rounded-lg"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setShowAddStaffModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-neutral-600 hover:bg-neutral-100 rounded-lg cursor-pointer"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-neutral-950 hover:bg-amber-500 hover:text-neutral-950 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer shadow-sm"
                >
                  Внести в штат
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Master Requests Material Replenishment */}
      {showSupplyModal && supplyOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-neutral-200 space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-200 pb-3">
              <div>
                <h3 className="text-base font-bold text-neutral-950 flex items-center gap-2">
                  <Package className="w-5 h-5 text-amber-600" />
                  <span>Запрос нехватающего сырья для заказа</span>
                </h3>
                <p className="text-xs text-neutral-500 font-mono mt-0.5">
                  Заказ: #{supplyOrder.code} ({supplyOrder.clientName})
                </p>
              </div>
              <button
                onClick={() => setShowSupplyModal(false)}
                className="p-1 text-neutral-400 hover:text-neutral-900 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {supplyError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-800 rounded-xl text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{supplyError}</span>
              </div>
            )}

            <form onSubmit={handleSupplySubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
                  Необходимый материал со склада *
                </label>
                <select
                  required
                  value={supplyMaterialId}
                  onChange={(e) => setSupplyMaterialId(e.target.value)}
                  className="w-full text-xs p-2.5 bg-neutral-50 border border-neutral-300 rounded-lg focus:outline-none focus:border-amber-500 cursor-pointer font-medium"
                >
                  {materials.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} (остаток: {m.inStock} {m.unit})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
                    Требуемое количество *
                  </label>
                  <input
                    type="number"
                    min="0.1"
                    step="any"
                    required
                    value={supplyQuantity}
                    onChange={(e) => setSupplyQuantity(parseFloat(e.target.value) || 0)}
                    className="w-full text-xs p-2.5 bg-neutral-50 border border-neutral-300 rounded-lg font-mono font-bold"
                  />
                  {supplyMaterialId && (
                    <div className="text-[11px] text-neutral-500 mt-1">
                      Ед. изм.: {materials.find((m) => m.id === supplyMaterialId)?.unit}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
                    Приоритет заявки *
                  </label>
                  <select
                    value={supplyUrgency}
                    onChange={(e) => setSupplyUrgency(e.target.value as any)}
                    className="w-full text-xs p-2.5 bg-neutral-50 border border-neutral-300 rounded-lg focus:outline-none focus:border-amber-500 cursor-pointer font-bold"
                  >
                    <option value="normal">Плановая закупка</option>
                    <option value="urgent">СРОЧНО (остановка работы цеха)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
                  Причина нехватки / Обоснование для снабжения *
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Например: Перерасход акрила из-за сложного фигурного раскроя объемных букв, требуется 3 листа для завершения лицевой подсветки."
                  value={supplyReason}
                  onChange={(e) => setSupplyReason(e.target.value)}
                  className="w-full text-xs p-2.5 bg-neutral-50 border border-neutral-300 rounded-lg focus:outline-none focus:border-amber-500 leading-relaxed"
                />
              </div>

              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-[11px] text-amber-900 leading-relaxed">
                Заявка поступит диспетчеру и в отдел снабжения. Запись о запросе сырья будет автоматически зафиксирована в хронологии заказа #{supplyOrder.code}.
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setShowSupplyModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-neutral-600 hover:bg-neutral-100 rounded-lg cursor-pointer"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  disabled={supplyLoading}
                  className="px-5 py-2 bg-neutral-950 hover:bg-amber-500 hover:text-neutral-950 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer shadow-sm disabled:opacity-50 flex items-center gap-1.5"
                >
                  <Package className="w-4 h-4" />
                  <span>{supplyLoading ? 'Отправка...' : 'Отправить заявку в снабжение'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Manager/Admin Fulfilling Supply Request & Procuring Material */}
      {showFulfillModal && fulfillingRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-neutral-200 space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-200 pb-3">
              <div>
                <h3 className="text-base font-bold text-neutral-950 flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5 text-emerald-600" />
                  <span>Закупка и выдача сырья в цех</span>
                </h3>
                <p className="text-xs text-neutral-500 mt-0.5">
                  По заявке мастера: <strong className="text-neutral-900">{fulfillingRequest.masterName}</strong> (Заказ #{fulfillingRequest.orderCode})
                </p>
              </div>
              <button
                onClick={() => setShowFulfillModal(false)}
                className="p-1 text-neutral-400 hover:text-neutral-900 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {fulfillError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-800 rounded-xl text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{fulfillError}</span>
              </div>
            )}

            <div className="p-3.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-neutral-500">Материал:</span>
                <span className="font-bold text-neutral-950">{fulfillingRequest.materialName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Количество к закупке:</span>
                <span className="font-mono font-bold text-amber-700">
                  {fulfillingRequest.quantity} {fulfillingRequest.unit}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Обоснование мастера:</span>
                <span className="text-neutral-800 italic max-w-xs text-right">«{fulfillingRequest.reason}»</span>
              </div>
            </div>

            <form onSubmit={handleFulfillSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
                    Цена за ед. (₽) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={fulfillUnitCost}
                    onChange={(e) => setFulfillUnitCost(parseFloat(e.target.value) || 0)}
                    className="w-full text-xs p-2.5 bg-neutral-50 border border-neutral-300 rounded-lg font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
                    Сумма поставки
                  </label>
                  <div className="p-2.5 bg-neutral-100 border border-neutral-200 rounded-lg font-mono font-bold text-neutral-900 text-xs">
                    {(fulfillUnitCost * fulfillingRequest.quantity).toLocaleString('ru-RU')} ₽
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
                    Поставщик *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Гельветика-Поволжье"
                    value={fulfillSupplier}
                    onChange={(e) => setFulfillSupplier(e.target.value)}
                    className="w-full text-xs p-2.5 bg-neutral-50 border border-neutral-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
                    Номер накладной / УПД *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="УПД-1049"
                    value={fulfillInvoice}
                    onChange={(e) => setFulfillInvoice(e.target.value)}
                    className="w-full text-xs p-2.5 bg-neutral-50 border border-neutral-300 rounded-lg font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
                  Примечание / Комментарий снабжения
                </label>
                <input
                  type="text"
                  placeholder="Доставлено в цех курьером поставщика"
                  value={fulfillNotes}
                  onChange={(e) => setFulfillNotes(e.target.value)}
                  className="w-full text-xs p-2.5 bg-neutral-50 border border-neutral-300 rounded-lg"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setShowFulfillModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-neutral-600 hover:bg-neutral-100 rounded-lg cursor-pointer"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  disabled={fulfillLoading}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer shadow-sm disabled:opacity-50 flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>{fulfillLoading ? 'Оприходование...' : 'Оприходовать и передать в цех'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

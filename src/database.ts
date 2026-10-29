/**
 * Локальная база данных РА «Алфавит» (г. Балашов)
 * Работает в браузере через LocalStorage, не требует сторонних серверов.
 */

import { Role, User, Service, CartItem, Order, OrderHistoryEvent, MaterialStock, ProcurementRecord, Receipt, SupplyRequest } from './types';

const INITIAL_PROCUREMENTS: ProcurementRecord[] = [
  {
    id: 'prc-01',
    materialId: 'mat-1',
    materialName: 'Акрил светорассеивающий Plexiglas 3мм (белый)',
    quantity: 10,
    unit: 'листов (2.05×3.05м)',
    unitCost: 6200,
    totalCost: 62000,
    supplier: 'Гельветика-Поволжье',
    invoiceNumber: 'УПД-4819',
    date: '2026-10-18',
    receivedByName: 'Алексей Смирнов',
    notes: 'Партия для объемных световых букв к заказам октября',
  },
  {
    id: 'prc-02',
    materialId: 'mat-6',
    materialName: 'Светодиодные линзованные модули ELF 2835 160° (IP67)',
    quantity: 1000,
    unit: 'модулей (шт)',
    unitCost: 28,
    totalCost: 28000,
    supplier: 'ELF Led Systems',
    invoiceNumber: 'СФ-9281',
    date: '2026-10-21',
    receivedByName: 'Виктор Кузнецов',
    notes: 'Линзованные диоды холодного белого свечения 5000K',
  },
  {
    id: 'prc-03',
    materialId: 'mat-4',
    materialName: 'Баннерная ткань литая Frontlit 510г (ширина 3.2м)',
    quantity: 150,
    unit: 'пог. метров (рулоны)',
    unitCost: 195,
    totalCost: 29250,
    supplier: 'Зенон-Саратов',
    invoiceNumber: 'ТН-1104',
    date: '2026-10-23',
    receivedByName: 'Андрей Васильев',
    notes: 'Рулоны для широкоформатного сольвентного плоттера',
  },
];

const INITIAL_USERS: User[] = [
  {
    id: 'usr-admin',
    username: 'admin',
    password: '123',
    role: 'admin',
    name: 'Алексей Смирнов',
    phone: '+7 (84545) 4-12-80',
    email: 'admin@alfavit64.ru',
    address: 'г. Балашов, ул. Володарского, 32',
    roleTitle: 'Директор / Главный администратор',
  },
  {
    id: 'usr-admin2',
    username: 'director',
    password: '123',
    role: 'admin',
    name: 'Екатерина Морозова',
    phone: '+7 (905) 381-00-55',
    email: 'morozova@alfavit64.ru',
    address: 'г. Балашов',
    roleTitle: 'Зам. директора по производству',
  },
  {
    id: 'usr-manager',
    username: 'manager',
    password: '123',
    role: 'manager',
    name: 'Елена Ковалева',
    phone: '+7 (905) 381-00-55',
    email: 'elena.manager@alfavit64.ru',
    address: 'г. Балашов, ул. Карла Маркса',
    roleTitle: 'Диспетчер заказов / Менеджер',
  },
  {
    id: 'usr-manager2',
    username: 'dispatcher',
    password: '123',
    role: 'manager',
    name: 'Светлана Орлова',
    phone: '+7 (927) 115-30-44',
    email: 'svetlana@alfavit64.ru',
    address: 'г. Балашов, ул. Ленина',
    roleTitle: 'Менеджер клиентского сервиса',
  },
  {
    id: 'usr-master1',
    username: 'master',
    password: '123',
    role: 'master',
    name: 'Виктор Кузнецов',
    phone: '+7 (927) 441-20-11',
    email: 'kuznetsov@alfavit64.ru',
    address: 'г. Балашов, ул. 30 лет Победы',
    roleTitle: 'Мастер сборочного цеха вывесок',
  },
  {
    id: 'usr-master2',
    username: 'master_print',
    password: '123',
    role: 'master',
    name: 'Андрей Васильев',
    phone: '+7 (906) 152-33-88',
    email: 'vasiliev.print@alfavit64.ru',
    address: 'г. Балашов, ул. Советская',
    roleTitle: 'Мастер широкоформатной печати',
  },
  {
    id: 'usr-master3',
    username: 'master_cnc',
    password: '123',
    role: 'master',
    name: 'Сергей Пономарев',
    phone: '+7 (937) 639-01-22',
    email: 'cnc.ponomarev@alfavit64.ru',
    address: 'г. Балашов, ул. Ленинская',
    roleTitle: 'Оператор-мастер ЧПУ раскроя',
  },
  {
    id: 'usr-master4',
    username: 'master_mount',
    password: '123',
    role: 'master',
    name: 'Денис Мартынов',
    phone: '+7 (905) 320-77-90',
    email: 'martynov.mount@alfavit64.ru',
    address: 'г. Балашов, ул. Пушкина',
    roleTitle: 'Бригадир монтажно-сварочного участка',
  },
  {
    id: 'usr-client',
    username: 'client',
    password: '123',
    role: 'client',
    name: 'Михаил Соколов',
    phone: '+7 (905) 381-44-22',
    email: 'sokolov@mail.ru',
    address: 'г. Балашов, ул. Володарского, 28 (Магазин «Уют»)',
    roleTitle: 'Заказчик',
  },
  {
    id: 'usr-client2',
    username: 'anna',
    password: '123',
    role: 'client',
    name: 'Анна Васильева',
    phone: '+7 (927) 124-99-10',
    email: 'anna.boutique@yandex.ru',
    address: 'г. Балашов, ул. Ленина, 45 (Бутик «Мода»)',
    roleTitle: 'Заказчик',
  },
];

const INITIAL_SERVICES: Service[] = [
  {
    id: 'biz_cards',
    title: 'Визитки фирменные (300 г/м²)',
    category: 'Полиграфия',
    description: 'Качественная цифровая печать деловых визиток на плотном картоне.',
    unitPrice: 3.2,
    unit: 'шт',
    defaultQty: 500,
    minQty: 100,
    stepQty: 100,
    badge: 'Популярно',
    imageUrl: '/images/1.png',
  },
  {
    id: 'flyers_a6',
    title: 'Рекламные листовки (А6, 130 г/м²)',
    category: 'Полиграфия',
    description: 'Яркие флаеры для промо-раздачи и почтовой рассылки по г. Балашов.',
    unitPrice: 2.4,
    unit: 'шт',
    defaultQty: 1000,
    minQty: 200,
    stepQty: 200,
    badge: 'Хит',
    imageUrl: '/images/2.png',
  },
  {
    id: 'chan_letters',
    title: 'Объемные световые буквы (LED)',
    category: 'Наружная реклама',
    description: 'Акриловый световой фронт, профиль ALS, яркие герметичные линзованные диоды ELF.',
    unitPrice: 3400,
    unit: 'буква',
    defaultQty: 6,
    minQty: 1,
    stepQty: 1,
    badge: 'Собственный цех',
    imageUrl: '/images/3.png',
  },
  {
    id: 'lightbox',
    title: 'Световой короб (лайтбокс)',
    category: 'Наружная реклама',
    description: 'Металлокаркас, алюминиевый композит, светопропускающий светорассеивающий акрил.',
    unitPrice: 8500,
    unit: 'м²',
    defaultQty: 2,
    minQty: 1,
    stepQty: 1,
    imageUrl: '/images/4.png',
  },
  {
    id: 'banner_laminated',
    title: 'Баннер ламинированный 440г',
    category: 'Широкоформатная печать',
    description: 'Широкоформатная печать 720 dpi для временных уличных и интерьерных акций.',
    unitPrice: 420,
    unit: 'м²',
    defaultQty: 6,
    minQty: 1,
    stepQty: 1,
    imageUrl: '/images/5.png',
  },
  {
    id: 'banner_cast',
    title: 'Баннер литой особопрочный 510г',
    category: 'Широкоформатная печать',
    description: 'Ветроустойчивый плотный баннер с люверсами через каждые 30 см.',
    unitPrice: 580,
    unit: 'м²',
    defaultQty: 8,
    minQty: 1,
    stepQty: 1,
    badge: 'Долговечный',
    imageUrl: '/images/6.png',
  },
  {
    id: 'signs_pvc',
    title: 'Фасадная табличка / Режим работы',
    category: 'Наружная реклама',
    description: 'Пластик ПВХ 5мм, прямая УФ печать или накатка пленки с ламинацией.',
    unitPrice: 1600,
    unit: 'шт (40×60 см)',
    defaultQty: 1,
    minQty: 1,
    stepQty: 1,
    imageUrl: '/images/7.png',
  },
  {
    id: 'car_sticker',
    title: 'Наклейки и брендирование авто',
    category: 'Широкоформатная печать',
    description: 'Пленка Oracal с защитной ламинацией от сколов и реагентов.',
    unitPrice: 1100,
    unit: 'м²',
    defaultQty: 4,
    minQty: 1,
    stepQty: 1,
    imageUrl: '/images/8.png',
  },
  {
    id: 'souvenir_mugs',
    title: 'Кружки с фирменным логотипом',
    category: 'Сувениры',
    description: 'Сублимационная полноцветная печать на керамических кружках.',
    unitPrice: 290,
    unit: 'шт',
    defaultQty: 30,
    minQty: 10,
    stepQty: 10,
    imageUrl: '/images/9.png',
  },
];

const INITIAL_ORDERS: Order[] = [
  {
    id: 'ord-101',
    code: 'ALF-2026-101',
    clientUsername: 'client',
    clientName: 'Михаил Соколов',
    clientPhone: '+7 (905) 381-44-22',
    deliveryAddress: 'г. Балашов, ул. Володарского, 28 (Магазин «Уют»)',
    items: [
      {
        id: 'item-1',
        serviceId: 'chan_letters',
        title: 'Объемные световые буквы',
        category: 'Наружная реклама',
        quantity: 8,
        unit: 'букв',
        unitPrice: 3400,
        totalPrice: 27200,
        customNotes: 'Высота букв 35 см, диоды ELF 5000K, надпись «ПЕКАРНЯ»',
      },
      {
        id: 'item-2',
        serviceId: 'banner_cast',
        title: 'Баннер литой особопрочный 510г',
        category: 'Широкоформатная печать',
        quantity: 6,
        unit: 'м²',
        unitPrice: 580,
        totalPrice: 3480,
        customNotes: 'Люверсы по периметру с шагом 30 см',
      },
    ],
    totalAmount: 30680,
    status: 'in_progress',
    statusText: 'В работе у мастера',
    assignedMasterId: 'usr-master1',
    assignedMasterName: 'Виктор Кузнецов',
    plannedCompletionDate: '2026-10-29',
    masterNotes: 'Раскрой акрила на лазере завершен. Идет сборка бортов и пайка светодиодов.',
    managerNotes: 'Предоплата 50% получена в офисе',
    isPaid: true,
    paymentInfo: 'Оплачено картой **** 4482',
    createdAt: '2026-10-24 11:30',
    history: [
      {
        timestamp: '2026-10-24 11:30',
        text: 'Заказ оформлен клиентом через каталог и оплачен онлайн',
        authorRole: 'Клиент',
        authorName: 'Михаил Соколов',
      },
      {
        timestamp: '2026-10-24 14:10',
        text: 'Диспетчер Елена Ковалева назначила мастера Виктора Кузнецова',
        authorRole: 'Диспетчер',
        authorName: 'Елена Ковалева',
      },
      {
        timestamp: '2026-10-25 09:15',
        text: 'Мастер взял заказ в работу. Установлен срок готовности: 29.10.2026',
        authorRole: 'Мастер цеха',
        authorName: 'Виктор Кузнецов',
      },
    ],
  },
  {
    id: 'ord-102',
    code: 'ALF-2026-102',
    clientUsername: 'client',
    clientName: 'Михаил Соколов',
    clientPhone: '+7 (905) 381-44-22',
    deliveryAddress: 'г. Балашов, ул. Карла Маркса, 19',
    items: [
      {
        id: 'item-3',
        serviceId: 'biz_cards',
        title: 'Визитки фирменные (300 г/м²)',
        category: 'Полиграфия',
        quantity: 1000,
        unit: 'шт',
        unitPrice: 3.2,
        totalPrice: 3200,
        customNotes: 'Двусторонняя печать 4+4, макет утвержден',
      },
      {
        id: 'item-4',
        serviceId: 'flyers_a6',
        title: 'Рекламные листовки (А6, 130 г/м²)',
        category: 'Полиграфия',
        quantity: 1000,
        unit: 'шт',
        unitPrice: 2.4,
        totalPrice: 2400,
        customNotes: 'Бумага мелованная глянцевая',
      },
    ],
    totalAmount: 5600,
    status: 'new',
    statusText: 'Новая заявка',
    isPaid: true,
    paymentInfo: 'Оплачено картой **** 9104',
    createdAt: '2026-10-27 09:15',
    history: [
      {
        timestamp: '2026-10-27 09:15',
        text: 'Заказ поступил в диспетчерскую службу РА «Алфавит»',
        authorRole: 'Клиент',
        authorName: 'Михаил Соколов',
      },
    ],
  },
  {
    id: 'ord-103',
    code: 'ALF-2026-103',
    clientUsername: 'anna',
    clientName: 'Анна Васильева',
    clientPhone: '+7 (927) 124-99-10',
    deliveryAddress: 'г. Балашов, ул. Ленина, 45 (Бутик «Мода»)',
    items: [
      {
        id: 'item-5',
        serviceId: 'car_sticker',
        title: 'Наклейки и брендирование авто',
        category: 'Широкоформатная печать',
        quantity: 4,
        unit: 'м²',
        unitPrice: 1100,
        totalPrice: 4400,
        customNotes: 'Пленка Oracal с ламинацией на борта Lada Granta',
      },
    ],
    totalAmount: 4400,
    status: 'assigned',
    statusText: 'Передан мастеру: Андрей Васильев',
    assignedMasterId: 'usr-master2',
    assignedMasterName: 'Андрей Васильев',
    managerNotes: 'Пленка Oracal 551 есть на стеллаже печати',
    isPaid: true,
    paymentInfo: 'Оплачено картой **** 7712',
    createdAt: '2026-10-26 15:40',
    history: [
      {
        timestamp: '2026-10-26 15:40',
        text: 'Заказ оформлен онлайн',
        authorRole: 'Клиент',
        authorName: 'Анна Васильева',
      },
      {
        timestamp: '2026-10-26 16:30',
        text: 'Диспетчер передал заказ мастеру Андрею Васильеву',
        authorRole: 'Диспетчер',
        authorName: 'Елена Ковалева',
      },
    ],
  },
  {
    id: 'ord-104',
    code: 'ALF-2026-104',
    clientUsername: 'anna',
    clientName: 'Анна Васильева',
    clientPhone: '+7 (927) 124-99-10',
    deliveryAddress: 'Самовывоз из цеха: г. Балашов, ул. Володарского, 32',
    items: [
      {
        id: 'item-6',
        serviceId: 'signs_pvc',
        title: 'Фасадная табличка / Режим работы',
        category: 'Наружная реклама',
        quantity: 2,
        unit: 'шт (40×60 см)',
        unitPrice: 1600,
        totalPrice: 3200,
        customNotes: 'ПВХ 5мм, прямая УФ печать, режим работы 10:00-20:00',
      },
    ],
    totalAmount: 3200,
    status: 'ready',
    statusText: 'Готов к выдаче / монтажу',
    assignedMasterId: 'usr-master3',
    assignedMasterName: 'Сергей Пономарев',
    plannedCompletionDate: '2026-10-26',
    masterNotes: 'Таблички упакованы в пленку с крепежом, лежат на стойке выдачи',
    isPaid: true,
    paymentInfo: 'Оплачено картой **** 1290',
    createdAt: '2026-10-22 10:00',
    history: [
      {
        timestamp: '2026-10-22 10:00',
        text: 'Заказ принят в работу',
        authorRole: 'Клиент',
        authorName: 'Анна Васильева',
      },
      {
        timestamp: '2026-10-25 16:20',
        text: 'Мастер завершил изготовление. Изделие упаковано и готово к выдаче.',
        authorRole: 'Мастер цеха',
        authorName: 'Сергей Пономарев',
      },
    ],
  },
  // Previous month orders (September 2026)
  {
    id: 'ord-091',
    code: 'ALF-2026-091',
    clientUsername: 'client',
    clientName: 'Михаил Соколов',
    clientPhone: '+7 (905) 381-44-22',
    deliveryAddress: 'г. Балашов, ул. Володарского, 28',
    items: [
      {
        id: 'item-7',
        serviceId: 'lightbox',
        title: 'Световой короб (лайтбокс)',
        category: 'Наружная реклама',
        quantity: 3,
        unit: 'м²',
        unitPrice: 8500,
        totalPrice: 25500,
        customNotes: 'Короб из алюминиевого композита с инкрустацией акрилом 10мм',
      },
    ],
    totalAmount: 25500,
    status: 'completed',
    statusText: 'Завершен и сдан клиенту',
    assignedMasterId: 'usr-master4',
    assignedMasterName: 'Денис Мартынов',
    plannedCompletionDate: '2026-09-24',
    masterNotes: 'Монтаж выполнен автовышкой, акт подписан',
    isPaid: true,
    paymentInfo: 'Оплачено картой **** 4482',
    createdAt: '2026-09-18 14:20',
    history: [
      {
        timestamp: '2026-09-18 14:20',
        text: 'Заказ оформлен и согласован',
        authorRole: 'Клиент',
        authorName: 'Михаил Соколов',
      },
      {
        timestamp: '2026-09-24 17:00',
        text: 'Монтаж завершен. Заказчик принял работы без замечаний.',
        authorRole: 'Мастер цеха',
        authorName: 'Денис Мартынов',
      },
    ],
  },
];

const INITIAL_MATERIALS: MaterialStock[] = [
  {
    id: 'mat-1',
    name: 'Акрил светорассеивающий Plexiglas 3мм (белый)',
    category: 'Листовые материалы',
    unit: 'листов (2.05×3.05м)',
    inStock: 14,
    minThreshold: 5,
    consumedLastMonth: 22,
    supplier: 'Гельветика-Поволжье',
  },
  {
    id: 'mat-2',
    name: 'Алюминиевый композит (АКП) 3мм / 0.3 (черный/серебро)',
    category: 'Листовые материалы',
    unit: 'листов (1.5×4.0м)',
    inStock: 9,
    minThreshold: 4,
    consumedLastMonth: 16,
    supplier: 'Зенон-Саратов',
  },
  {
    id: 'mat-3',
    name: 'Пластик вспененный ПВХ Uniext 5мм',
    category: 'Листовые материалы',
    unit: 'листов (2.05×3.05м)',
    inStock: 18,
    minThreshold: 6,
    consumedLastMonth: 28,
    supplier: 'Гельветика-Поволжье',
  },
  {
    id: 'mat-4',
    name: 'Баннерная ткань литая Frontlit 510г (ширина 3.2м)',
    category: 'Рулонные материалы',
    unit: 'пог. метров (рулоны)',
    inStock: 240,
    minThreshold: 80,
    consumedLastMonth: 410,
    supplier: 'Зенон-Саратов',
  },
  {
    id: 'mat-5',
    name: 'Самоклеящаяся пленка Oracal 641 (глянец/мат)',
    category: 'Рулонные материалы',
    unit: 'пог. метров (рулоны)',
    inStock: 195,
    minThreshold: 50,
    consumedLastMonth: 320,
    supplier: 'ВМТ-Саратов',
  },
  {
    id: 'mat-6',
    name: 'Светодиодные линзованные модули ELF 2835 160° (IP67)',
    category: 'Светотехника',
    unit: 'модулей (шт)',
    inStock: 1250,
    minThreshold: 300,
    consumedLastMonth: 2100,
    supplier: 'ELF Led Systems',
  },
  {
    id: 'mat-7',
    name: 'Блоки питания герметичные Mean Well 12V 200W',
    category: 'Светотехника',
    unit: 'шт',
    inStock: 16,
    minThreshold: 5,
    consumedLastMonth: 24,
    supplier: 'ПромЭлектро Балашов',
  },
];

const INITIAL_SUPPLY_REQUESTS: SupplyRequest[] = [
  {
    id: 'req-101',
    orderId: 'ord-101',
    orderCode: 'ALF-2026-101',
    materialId: 'mat-1',
    materialName: 'Акрил светорассеивающий Plexiglas 3мм (белый)',
    quantity: 3,
    unit: 'листов (2.05×3.05м)',
    urgency: 'urgent',
    reason: 'Не хватает 3 листов для фрезеровки объемных световых букв «Уют» (большой перерасход по криволинейному контуру)',
    masterId: 'usr-master1',
    masterName: 'Виктор Кузнецов',
    status: 'pending',
    createdAt: '2026-10-26 11:20',
  },
  {
    id: 'req-091',
    orderId: 'ord-091',
    orderCode: 'ALF-2026-091',
    materialId: 'mat-7',
    materialName: 'Блоки питания герметичные Mean Well 12V 200W',
    quantity: 2,
    unit: 'шт',
    urgency: 'normal',
    reason: 'Дополнительные блоки питания для резервирования подсветки лайтбокса на объекте',
    masterId: 'usr-master4',
    masterName: 'Денис Мартынов',
    status: 'fulfilled',
    createdAt: '2026-09-20 10:15',
    fulfilledAt: '2026-09-21 14:00',
    fulfilledByName: 'Елена Ковалева',
    procurementId: 'prc-05',
  },
];

class LocalDatabase {
  private usersKey = 'alfavit_users_v2';
  private ordersKey = 'alfavit_orders_v2';
  private servicesKey = 'alfavit_services_v2';
  private materialsKey = 'alfavit_materials_v2';
  private procurementsKey = 'alfavit_procurements_v2';
  private supplyRequestsKey = 'alfavit_supply_requests_v2';
  private cartKey = 'alfavit_cart_v2';
  private sessionUserKey = 'alfavit_session_user_v2';

  constructor() {
    this.init();
  }

  private init() {
    if (!localStorage.getItem(this.usersKey)) {
      localStorage.setItem(this.usersKey, JSON.stringify(INITIAL_USERS));
    }
    if (!localStorage.getItem(this.servicesKey)) {
      localStorage.setItem(this.servicesKey, JSON.stringify(INITIAL_SERVICES));
    }
    if (!localStorage.getItem(this.ordersKey)) {
      localStorage.setItem(this.ordersKey, JSON.stringify(INITIAL_ORDERS));
    }
    if (!localStorage.getItem(this.materialsKey)) {
      localStorage.setItem(this.materialsKey, JSON.stringify(INITIAL_MATERIALS));
    }
    if (!localStorage.getItem(this.procurementsKey)) {
      localStorage.setItem(this.procurementsKey, JSON.stringify(INITIAL_PROCUREMENTS));
    }
    if (!localStorage.getItem(this.supplyRequestsKey)) {
      localStorage.setItem(this.supplyRequestsKey, JSON.stringify(INITIAL_SUPPLY_REQUESTS));
    }
  }

  // Session
  getCurrentUser(): User | null {
    try {
      const data = localStorage.getItem(this.sessionUserKey);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  }

  setCurrentUser(user: User | null): void {
    if (user) {
      localStorage.setItem(this.sessionUserKey, JSON.stringify(user));
    } else {
      localStorage.removeItem(this.sessionUserKey);
    }
  }

  // Users
  getUsers(): User[] {
    try {
      const data = localStorage.getItem(this.usersKey);
      return data ? JSON.parse(data) : INITIAL_USERS;
    } catch {
      return INITIAL_USERS;
    }
  }

  login(username: string, pass: string): { success: boolean; user?: User; error?: string } {
    const users = this.getUsers();
    const found = users.find(
      (u) => u.username.toLowerCase() === username.trim().toLowerCase() && u.password === pass.trim()
    );
    if (!found) {
      return { success: false, error: 'Неверный логин или пароль' };
    }
    this.setCurrentUser(found);
    return { success: true, user: found };
  }

  register(uData: { username: string; pass: string; name: string; phone: string; email?: string; address?: string }): { success: boolean; user?: User; error?: string } {
    const users = this.getUsers();
    if (users.some((u) => u.username.toLowerCase() === uData.username.trim().toLowerCase())) {
      return { success: false, error: 'Пользователь с таким логином уже существует' };
    }

    const newUser: User = {
      id: `usr-${Date.now()}`,
      username: uData.username.trim(),
      password: uData.pass.trim(),
      role: 'client',
      name: uData.name.trim(),
      phone: uData.phone.trim(),
      email: uData.email ? uData.email.trim() : undefined,
      address: uData.address ? uData.address.trim() : undefined,
      roleTitle: 'Заказчик',
    };

    users.push(newUser);
    localStorage.setItem(this.usersKey, JSON.stringify(users));
    this.setCurrentUser(newUser);
    return { success: true, user: newUser };
  }

  addEmployee(data: {
    username: string;
    password?: string;
    role: Role;
    name: string;
    phone: string;
    email?: string;
    address?: string;
    roleTitle: string;
  }): { success: boolean; user?: User; error?: string } {
    const users = this.getUsers();
    if (users.some((u) => u.username.toLowerCase() === data.username.trim().toLowerCase())) {
      return { success: false, error: 'Сотрудник с таким логином уже существует в системе' };
    }

    const newStaff: User = {
      id: `usr-${Date.now()}`,
      username: data.username.trim(),
      password: data.password?.trim() || '123',
      role: data.role,
      name: data.name.trim(),
      phone: data.phone.trim(),
      email: data.email?.trim() || undefined,
      address: data.address?.trim() || 'г. Балашов',
      roleTitle: data.roleTitle.trim(),
    };

    users.push(newStaff);
    localStorage.setItem(this.usersKey, JSON.stringify(users));
    return { success: true, user: newStaff };
  }

  updateProfile(username: string, updates: Partial<User>): User | null {
    const users = this.getUsers();
    const user = users.find((u) => u.username === username);
    if (!user) return null;

    if (updates.name) user.name = updates.name.trim();
    if (updates.phone) user.phone = updates.phone.trim();
    if (updates.email !== undefined) user.email = updates.email.trim();
    if (updates.address !== undefined) user.address = updates.address.trim();

    localStorage.setItem(this.usersKey, JSON.stringify(users));

    const current = this.getCurrentUser();
    if (current && current.username === username) {
      this.setCurrentUser(user);
    }

    // Sync client name in orders
    const orders = this.getOrders();
    orders.forEach((o) => {
      if (o.clientUsername === username) {
        if (updates.name) o.clientName = updates.name.trim();
        if (updates.phone) o.clientPhone = updates.phone.trim();
      }
    });
    localStorage.setItem(this.ordersKey, JSON.stringify(orders));

    return user;
  }

  // Services
  getServices(): Service[] {
    try {
      const data = localStorage.getItem(this.servicesKey);
      return data ? JSON.parse(data) : INITIAL_SERVICES;
    } catch {
      return INITIAL_SERVICES;
    }
  }

  // Orders
  getOrders(): Order[] {
    try {
      const data = localStorage.getItem(this.ordersKey);
      return data ? JSON.parse(data) : INITIAL_ORDERS;
    } catch {
      return INITIAL_ORDERS;
    }
  }

  createOrder(data: {
    clientUsername: string;
    clientName: string;
    clientPhone: string;
    deliveryAddress: string;
    items: CartItem[];
    cardLast4: string;
  }): Order {
    const orders = this.getOrders();
    const totalAmount = data.items.reduce((acc, it) => acc + it.totalPrice, 0);
    const code = `ALF-2026-${Math.floor(100 + Math.random() * 900)}`;
    const nowString = new Date().toLocaleString('ru-RU', { timeZone: 'Europe/Saratov' });
    const paymentInfo = `Оплачено картой **** ${data.cardLast4}`;

    const fiscalReceipt: Receipt = {
      id: `rcp-${Date.now()}`,
      receiptNumber: `ФД-${Math.floor(100000 + Math.random() * 900000)}`,
      fiscalSign: `ФП-${Math.floor(1000000000 + Math.random() * 9000000000)}`,
      authCode: `AUTH-${Math.floor(100000 + Math.random() * 900000)}`,
      orderCode: code,
      date: nowString,
      companyName: 'Рекламно-производственное предприятие «Алфавит»',
      inn: '644002849102',
      address: 'Саратовская обл., г. Балашов, ул. Володарского, 32',
      clientName: data.clientName.trim(),
      clientPhone: data.clientPhone.trim(),
      cardLast4: data.cardLast4,
      paymentType: 'Безналичная оплата банковской картой',
      items: data.items.map((it) => ({
        title: it.title,
        quantity: it.quantity,
        unit: it.unit,
        unitPrice: it.unitPrice,
        totalPrice: it.totalPrice,
      })),
      totalAmount,
    };

    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      code,
      clientUsername: data.clientUsername || 'client',
      clientName: data.clientName.trim(),
      clientPhone: data.clientPhone.trim(),
      deliveryAddress: data.deliveryAddress.trim(),
      items: data.items,
      totalAmount,
      status: 'new',
      statusText: 'Новая заявка (Оплачено)',
      isPaid: true,
      paymentInfo,
      receipt: fiscalReceipt,
      createdAt: nowString,
      history: [
        {
          timestamp: nowString,
          text: `Заказ #${code} оформлен клиентом и оплачен онлайн (${paymentInfo}, сумма: ${totalAmount} ₽, чек: ${fiscalReceipt.receiptNumber})`,
          authorRole: 'Клиент',
          authorName: data.clientName,
        },
      ],
    };

    orders.unshift(newOrder);
    localStorage.setItem(this.ordersKey, JSON.stringify(orders));
    return newOrder;
  }

  assignMaster(orderId: string, masterId: string, managerNotes?: string): { success: boolean; error?: string; order?: Order } {
    const orders = this.getOrders();
    const order = orders.find((o) => o.id === orderId);
    if (!order) return { success: false, error: 'Заказ не найден' };

    const users = this.getUsers();
    const master = users.find((u) => u.id === masterId && u.role === 'master');
    if (!master) return { success: false, error: 'Выбранный мастер не найден' };

    // STRICT CHECK: 1 master = 1 active order limit
    const busyWith = orders.find(
      (o) =>
        o.id !== orderId &&
        o.assignedMasterId === master.id &&
        (o.status === 'assigned' || o.status === 'in_progress')
    );

    if (busyWith) {
      return {
        success: false,
        error: `Мастер ${master.name} сейчас занят заказом #${busyWith.code}. По регламенту предприятия РА «Алфавит», пока мастер не выполнит текущий заказ, передавать ему новый нельзя!`,
      };
    }

    const nowString = new Date().toLocaleString('ru-RU', { timeZone: 'Europe/Saratov' });
    order.assignedMasterId = master.id;
    order.assignedMasterName = master.name;
    order.status = 'assigned';
    order.statusText = `Передан мастеру: ${master.name}`;
    if (managerNotes) order.managerNotes = managerNotes;

    order.history.push({
      timestamp: nowString,
      text: `Диспетчер передал заказ мастеру цеха: ${master.name}${
        managerNotes ? ` (инструкция: ${managerNotes})` : ''
      }`,
      authorRole: 'Диспетчер',
      authorName: 'Елена Ковалева',
    });

    localStorage.setItem(this.ordersKey, JSON.stringify(orders));
    return { success: true, order };
  }

  takeIntoWork(orderId: string, plannedDate: string, masterNotes?: string): { success: boolean; order?: Order } {
    const orders = this.getOrders();
    const order = orders.find((o) => o.id === orderId);
    if (!order) return { success: false };

    const nowString = new Date().toLocaleString('ru-RU', { timeZone: 'Europe/Saratov' });
    order.status = 'in_progress';
    order.statusText = 'В работе у мастера';
    order.plannedCompletionDate = plannedDate;
    if (masterNotes) order.masterNotes = masterNotes;

    order.history.push({
      timestamp: nowString,
      text: `Мастер взял в работу. Срок завершения по плану цеха: ${plannedDate}${
        masterNotes ? `. Примечание: ${masterNotes}` : ''
      }`,
      authorRole: 'Мастер цеха',
      authorName: order.assignedMasterName || 'Мастер',
    });

    localStorage.setItem(this.ordersKey, JSON.stringify(orders));
    return { success: true, order };
  }

  markOrderReady(orderId: string): { success: boolean; order?: Order } {
    const orders = this.getOrders();
    const order = orders.find((o) => o.id === orderId);
    if (!order) return { success: false };

    const nowString = new Date().toLocaleString('ru-RU', { timeZone: 'Europe/Saratov' });
    order.status = 'ready';
    order.statusText = 'Готов к выдаче / монтажу';

    order.history.push({
      timestamp: nowString,
      text: 'Мастер завершил изготовление. Изделие проверено и готово к выдаче или выезду на монтаж.',
      authorRole: 'Мастер цеха',
      authorName: order.assignedMasterName || 'Мастер',
    });

    localStorage.setItem(this.ordersKey, JSON.stringify(orders));
    return { success: true, order };
  }

  updateOrderStatus(orderId: string, newStatus: Order['status'], authorRole: string, authorName: string): Order | null {
    const orders = this.getOrders();
    const order = orders.find((o) => o.id === orderId);
    if (!order) return null;

    const nowString = new Date().toLocaleString('ru-RU', { timeZone: 'Europe/Saratov' });
    order.status = newStatus;

    const statusMap: Record<string, string> = {
      new: 'Новая заявка',
      assigned: 'Назначен мастер',
      in_progress: 'В работе у мастера',
      ready: 'Готов к выдаче / монтажу',
      completed: 'Завершен и сдан клиенту',
      cancelled: 'Отменен диспетчером',
    };

    order.statusText = statusMap[newStatus] || newStatus;
    order.history.push({
      timestamp: nowString,
      text: `Статус изменен на "${order.statusText}"`,
      authorRole,
      authorName,
    });

    localStorage.setItem(this.ordersKey, JSON.stringify(orders));
    return order;
  }

  // Materials
  getMaterials(): MaterialStock[] {
    try {
      const data = localStorage.getItem(this.materialsKey);
      return data ? JSON.parse(data) : INITIAL_MATERIALS;
    } catch {
      return INITIAL_MATERIALS;
    }
  }

  addMaterial(data: {
    name: string;
    category: string;
    unit: string;
    inStock: number;
    minThreshold: number;
    supplier: string;
  }): MaterialStock {
    const materials = this.getMaterials();
    const newMat: MaterialStock = {
      id: `mat-${Date.now()}`,
      name: data.name.trim(),
      category: data.category.trim(),
      unit: data.unit.trim(),
      inStock: Number(data.inStock) || 0,
      minThreshold: Number(data.minThreshold) || 5,
      consumedLastMonth: 0,
      supplier: data.supplier.trim() || 'Поставщик',
    };
    materials.push(newMat);
    localStorage.setItem(this.materialsKey, JSON.stringify(materials));
    return newMat;
  }

  // Procurements (Поступление и закупка сырья)
  getProcurements(): ProcurementRecord[] {
    try {
      const data = localStorage.getItem(this.procurementsKey);
      return data ? JSON.parse(data) : INITIAL_PROCUREMENTS;
    } catch {
      return INITIAL_PROCUREMENTS;
    }
  }

  recordProcurement(data: {
    materialId: string;
    quantity: number;
    unitCost: number;
    supplier: string;
    invoiceNumber: string;
    receivedByName: string;
    notes?: string;
  }): { success: boolean; error?: string; procurement?: ProcurementRecord; material?: MaterialStock } {
    const materials = this.getMaterials();
    const mat = materials.find((m) => m.id === data.materialId);
    if (!mat) return { success: false, error: 'Выбранный материал не найден на складе' };

    const qty = Number(data.quantity);
    if (isNaN(qty) || qty <= 0) {
      return { success: false, error: 'Количество поступившего материала должно быть больше нуля' };
    }

    mat.inStock = Number((mat.inStock + qty).toFixed(1));
    if (data.supplier && data.supplier.trim()) {
      mat.supplier = data.supplier.trim();
    }
    localStorage.setItem(this.materialsKey, JSON.stringify(materials));

    const procurements = this.getProcurements();
    const nowString = new Date().toISOString().slice(0, 10);
    const unitCost = Number(data.unitCost) || 0;
    const totalCost = Math.round(unitCost * qty);

    const newProc: ProcurementRecord = {
      id: `prc-${Date.now()}`,
      materialId: mat.id,
      materialName: mat.name,
      quantity: qty,
      unit: mat.unit,
      unitCost,
      totalCost,
      supplier: data.supplier.trim() || mat.supplier,
      invoiceNumber: data.invoiceNumber.trim() || `ТН-${Math.floor(1000 + Math.random() * 9000)}`,
      date: nowString,
      receivedByName: data.receivedByName.trim() || 'Кладовщик',
      notes: data.notes?.trim(),
    };

    procurements.unshift(newProc);
    localStorage.setItem(this.procurementsKey, JSON.stringify(procurements));

    return { success: true, procurement: newProc, material: mat };
  }

  // Supply Requests (Заявки мастеров на нехватку сырья)
  getSupplyRequests(): SupplyRequest[] {
    try {
      const data = localStorage.getItem(this.supplyRequestsKey);
      return data ? JSON.parse(data) : INITIAL_SUPPLY_REQUESTS;
    } catch {
      return INITIAL_SUPPLY_REQUESTS;
    }
  }

  createSupplyRequest(data: {
    orderId: string;
    materialId: string;
    quantity: number;
    urgency: 'normal' | 'urgent';
    reason: string;
    masterId: string;
    masterName: string;
  }): { success: boolean; error?: string; request?: SupplyRequest } {
    const orders = this.getOrders();
    const order = orders.find((o) => o.id === data.orderId);
    if (!order) return { success: false, error: 'Заказ не найден' };

    const materials = this.getMaterials();
    const mat = materials.find((m) => m.id === data.materialId);
    if (!mat) return { success: false, error: 'Материал не найден в каталоге' };

    const qty = Number(data.quantity);
    if (isNaN(qty) || qty <= 0) {
      return { success: false, error: 'Укажите корректное количество требуемого сырья' };
    }

    const nowString = new Date().toLocaleString('ru-RU', { timeZone: 'Europe/Saratov' });

    const newReq: SupplyRequest = {
      id: `req-${Date.now()}`,
      orderId: order.id,
      orderCode: order.code,
      materialId: mat.id,
      materialName: mat.name,
      quantity: qty,
      unit: mat.unit,
      urgency: data.urgency,
      reason: data.reason.trim() || 'Недостаточно сырья на складе для завершения заказа',
      masterId: data.masterId,
      masterName: data.masterName,
      status: 'pending',
      createdAt: nowString,
    };

    const requests = this.getSupplyRequests();
    requests.unshift(newReq);
    localStorage.setItem(this.supplyRequestsKey, JSON.stringify(requests));

    // Order timeline event
    order.history.push({
      timestamp: nowString,
      text: `Мастер цеха запросил пополнение сырья (${data.urgency === 'urgent' ? 'СРОЧНО' : 'планово'}): ${mat.name} — ${qty} ${mat.unit}. Причина: ${newReq.reason}`,
      authorRole: 'Мастер цеха',
      authorName: data.masterName,
    });
    localStorage.setItem(this.ordersKey, JSON.stringify(orders));

    return { success: true, request: newReq };
  }

  fulfillSupplyRequest(
    requestId: string,
    procurementData: {
      unitCost: number;
      supplier?: string;
      invoiceNumber?: string;
      fulfilledByName: string;
      notes?: string;
    }
  ): { success: boolean; error?: string; request?: SupplyRequest; procurement?: ProcurementRecord } {
    const requests = this.getSupplyRequests();
    const req = requests.find((r) => r.id === requestId);
    if (!req) return { success: false, error: 'Заявка на сырье не найдена' };
    if (req.status === 'fulfilled') return { success: false, error: 'Заявка уже выполнена' };

    // Record procurement directly replenishing stock
    const procResult = this.recordProcurement({
      materialId: req.materialId,
      quantity: req.quantity,
      unitCost: procurementData.unitCost,
      supplier: procurementData.supplier || '',
      invoiceNumber: procurementData.invoiceNumber || '',
      receivedByName: procurementData.fulfilledByName,
      notes: `По заявке мастера ${req.masterName} для заказа ${req.orderCode}. ${procurementData.notes || ''}`.trim(),
    });

    if (!procResult.success || !procResult.procurement) {
      return { success: false, error: procResult.error || 'Ошибка оприходования сырья' };
    }

    const nowString = new Date().toLocaleString('ru-RU', { timeZone: 'Europe/Saratov' });
    req.status = 'fulfilled';
    req.fulfilledAt = nowString;
    req.fulfilledByName = procurementData.fulfilledByName;
    req.procurementId = procResult.procurement.id;
    localStorage.setItem(this.supplyRequestsKey, JSON.stringify(requests));

    // Update Order history
    const orders = this.getOrders();
    const order = orders.find((o) => o.id === req.orderId);
    if (order) {
      order.history.push({
        timestamp: nowString,
        text: `Снабжение: Заявка на сырье удовлетворена. Поступило ${req.materialName} (${req.quantity} ${req.unit}) в цех. Накладная: ${procResult.procurement.invoiceNumber}`,
        authorRole: 'Отдел снабжения',
        authorName: procurementData.fulfilledByName,
      });
      localStorage.setItem(this.ordersKey, JSON.stringify(orders));
    }

    return { success: true, request: req, procurement: procResult.procurement };
  }

  rejectSupplyRequest(requestId: string, rejectedByName: string, reason: string): { success: boolean; error?: string } {
    const requests = this.getSupplyRequests();
    const req = requests.find((r) => r.id === requestId);
    if (!req) return { success: false, error: 'Заявка не найдена' };

    const nowString = new Date().toLocaleString('ru-RU', { timeZone: 'Europe/Saratov' });
    req.status = 'rejected';
    localStorage.setItem(this.supplyRequestsKey, JSON.stringify(requests));

    const orders = this.getOrders();
    const order = orders.find((o) => o.id === req.orderId);
    if (order) {
      order.history.push({
        timestamp: nowString,
        text: `Заявка на сырье отклонена (${reason || 'нет обоснования'}). Мастеру необходимо связаться с диспетчером.`,
        authorRole: 'Диспетчер',
        authorName: rejectedByName,
      });
      localStorage.setItem(this.ordersKey, JSON.stringify(orders));
    }

    return { success: true };
  }

  // Cart
  getCart(): CartItem[] {
    try {
      const data = localStorage.getItem(this.cartKey);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  saveCart(items: CartItem[]): void {
    localStorage.setItem(this.cartKey, JSON.stringify(items));
  }
}

export const db = new LocalDatabase();

import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export type Role = 'admin' | 'manager' | 'master' | 'client';

export interface User {
  id: string;
  username: string;
  password: string;
  role: Role;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  roleTitle: string;
  activeOrderCount?: number;
}

export interface OrderItem {
  id: string;
  serviceId: string;
  title: string;
  category: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  totalPrice: number;
  customNotes?: string;
}

export interface Order {
  id: string;
  code: string;
  clientUsername: string;
  clientName: string;
  clientPhone: string;
  deliveryAddress: string;
  items: OrderItem[];
  totalAmount: number;
  status: 'new' | 'assigned' | 'in_progress' | 'ready' | 'completed' | 'cancelled';
  statusText: string;
  assignedMasterId?: string;
  assignedMasterName?: string;
  plannedCompletionDate?: string;
  masterNotes?: string;
  managerNotes?: string;
  isPaid?: boolean;
  paymentInfo?: string;
  createdAt: string;
  history: Array<{
    timestamp: string;
    text: string;
    authorRole: string;
    authorName: string;
  }>;
}

export interface MaterialStock {
  id: string;
  name: string;
  category: string;
  unit: string;
  inStock: number;
  minThreshold: number;
  consumedLastMonth: number;
  supplier: string;
}

// 1. Expanded Staff Database
const usersDb: User[] = [
  // Administrators
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

  // Managers / Dispatchers
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

  // Masters (Workshop)
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

  // Clients
  {
    id: 'usr-client',
    username: 'client',
    password: '123',
    role: 'client',
    name: 'Михаил Соколов',
    phone: '+7 (905) 381-44-22',
    email: 'sokolov@mail.ru',
    address: 'г. Балашов, ул. Володарского, 28 (Магазин «Уют»)',
    roleTitle: 'Клиент (Магазин «Уют»)',
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
    roleTitle: 'Клиент (Бутик «Мода»)',
  },
];

// 2. Comprehensive Orders Database (Current and Previous Month)
const ordersDb: Order[] = [
  // Order 1 (In Progress with Master Victor Kuznetsov)
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
    createdAt: '2026-10-24 11:30',
    history: [
      {
        timestamp: '2026-10-24 11:30',
        text: 'Заказ оформлен клиентом через каталог',
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

  // Order 2 (New, Awaiting Dispatcher assignment)
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

  // Order 3 (Assigned to Master Andrey Vasiliev)
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

  // Order 4 (Ready for pickup)
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
    createdAt: '2026-10-22 10:00',
    history: [
      {
        timestamp: '2026-10-22 10:00',
        text: 'Заказ принят в работу',
        authorRole: 'Клиент',
        authorName: 'Анна Васильева',
      },
      {
        timestamp: '2026-10-22 14:00',
        text: 'Передан мастеру Сергею Пономареву',
        authorRole: 'Диспетчер',
        authorName: 'Елена Ковалева',
      },
      {
        timestamp: '2026-10-23 09:00',
        text: 'Мастер взял в работу на фрезерном ЧПУ',
        authorRole: 'Мастер цеха',
        authorName: 'Сергей Пономарев',
      },
      {
        timestamp: '2026-10-25 16:20',
        text: 'Мастер завершил изготовление. Изделие упаковано и готово к выдаче.',
        authorRole: 'Мастер цеха',
        authorName: 'Сергей Пономарев',
      },
    ],
  },

  // Order 5 (Completed - Previous Month: September 2026)
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
    createdAt: '2026-09-18 14:20',
    history: [
      {
        timestamp: '2026-09-18 14:20',
        text: 'Заказ оформлен и согласован',
        authorRole: 'Клиент',
        authorName: 'Михаил Соколов',
      },
      {
        timestamp: '2026-09-19 10:00',
        text: 'Передан бригадиру монтажно-сварочного участка Денису Мартынову',
        authorRole: 'Диспетчер',
        authorName: 'Елена Ковалева',
      },
      {
        timestamp: '2026-09-24 17:00',
        text: 'Монтаж завершен. Заказчик принял работы без замечаний.',
        authorRole: 'Мастер цеха',
        authorName: 'Денис Мартынов',
      },
    ],
  },

  // Order 6 (Completed - Previous Month: September 2026)
  {
    id: 'ord-092',
    code: 'ALF-2026-092',
    clientUsername: 'anna',
    clientName: 'Анна Васильева',
    clientPhone: '+7 (927) 124-99-10',
    deliveryAddress: 'г. Балашов, ул. Ленина, 45',
    items: [
      {
        id: 'item-8',
        serviceId: 'souvenir_mugs',
        title: 'Кружки с фирменным логотипом',
        category: 'Сувениры',
        quantity: 50,
        unit: 'шт',
        unitPrice: 290,
        totalPrice: 14500,
        customNotes: 'Полноцветная сублимация к открытию бутика',
      },
    ],
    totalAmount: 14500,
    status: 'completed',
    statusText: 'Завершен и сдан клиенту',
    assignedMasterId: 'usr-master2',
    assignedMasterName: 'Андрей Васильев',
    plannedCompletionDate: '2026-09-28',
    createdAt: '2026-09-25 12:00',
    history: [
      {
        timestamp: '2026-09-25 12:00',
        text: 'Заказ принят в производство',
        authorRole: 'Клиент',
        authorName: 'Анна Васильева',
      },
      {
        timestamp: '2026-09-28 15:30',
        text: 'Тираж передан заказчику, оплата 100%',
        authorRole: 'Мастер цеха',
        authorName: 'Андрей Васильев',
      },
    ],
  },
];

// 3. Materials Warehouse Database (Stock & Consumption)
const materialsStockDb: MaterialStock[] = [
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

// Services Catalog
const servicesCatalog = [
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
  },
];

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json());

  // AUTH ROUTES
  app.post('/api/auth/login', (req, res) => {
    const { username, password } = req.body;
    const user = usersDb.find(
      (u) => u.username.toLowerCase() === username?.trim().toLowerCase() && u.password === password?.trim()
    );

    if (!user) {
      return res.status(401).json({ success: false, error: 'Неверный логин или пароль' });
    }

    res.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        name: user.name,
        phone: user.phone,
        email: user.email,
        address: user.address,
        roleTitle: user.roleTitle,
      },
    });
  });

  app.post('/api/auth/register', (req, res) => {
    const { username, password, name, phone, email, address } = req.body;
    if (!username || !password || !name || !phone) {
      return res.status(400).json({ success: false, error: 'Заполните обязательные поля: логин, пароль, имя и телефон' });
    }

    const existing = usersDb.find((u) => u.username.toLowerCase() === username.trim().toLowerCase());
    if (existing) {
      return res.status(400).json({ success: false, error: 'Пользователь с таким логином уже существует' });
    }

    const newUser: User = {
      id: `usr-${Date.now()}`,
      username: username.trim(),
      password: password.trim(),
      role: 'client',
      name: name.trim(),
      phone: phone.trim(),
      email: email ? email.trim() : undefined,
      address: address ? address.trim() : undefined,
      roleTitle: 'Заказчик',
    };

    usersDb.push(newUser);

    res.status(201).json({
      success: true,
      user: {
        id: newUser.id,
        username: newUser.username,
        role: newUser.role,
        name: newUser.name,
        phone: newUser.phone,
        email: newUser.email,
        address: newUser.address,
        roleTitle: newUser.roleTitle,
      },
    });
  });

  // Client updates profile data
  app.patch('/api/auth/profile', (req, res) => {
    const { username, name, phone, email, address } = req.body;
    const user = usersDb.find((u) => u.username === username);
    if (!user) {
      return res.status(404).json({ success: false, error: 'Пользователь не найден' });
    }

    if (name) user.name = name.trim();
    if (phone) user.phone = phone.trim();
    if (email !== undefined) user.email = email.trim();
    if (address !== undefined) user.address = address.trim();

    // Also sync client name in orders
    ordersDb.forEach((o) => {
      if (o.clientUsername === username) {
        if (name) o.clientName = name.trim();
        if (phone) o.clientPhone = phone.trim();
      }
    });

    res.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        name: user.name,
        phone: user.phone,
        email: user.email,
        address: user.address,
        roleTitle: user.roleTitle,
      },
    });
  });

  // Staff list with active workload calculation (for 1 order per master constraint)
  app.get('/api/auth/users', (_req, res) => {
    const enrichedUsers = usersDb.map((u) => {
      let activeOrderCount = 0;
      let activeOrderCode = '';
      if (u.role === 'master') {
        const activeOrder = ordersDb.find(
          (o) => o.assignedMasterId === u.id && (o.status === 'assigned' || o.status === 'in_progress')
        );
        if (activeOrder) {
          activeOrderCount = 1;
          activeOrderCode = activeOrder.code;
        }
      }

      return {
        id: u.id,
        username: u.username,
        role: u.role,
        name: u.name,
        phone: u.phone,
        email: u.email,
        address: u.address,
        roleTitle: u.roleTitle,
        activeOrderCount,
        activeOrderCode,
        isBusy: activeOrderCount > 0,
      };
    });

    res.json({ success: true, users: enrichedUsers });
  });

  // SERVICES
  app.get('/api/services', (_req, res) => {
    res.json({ success: true, services: servicesCatalog });
  });

  // MATERIALS / WAREHOUSE
  app.get('/api/materials', (_req, res) => {
    res.json({ success: true, materials: materialsStockDb });
  });

  // ORDERS
  app.get('/api/orders', (req, res) => {
    const { role, username, phone } = req.query;

    if (role === 'client') {
      const clientOrders = ordersDb.filter(
        (o) => (username && o.clientUsername === username) || (phone && o.clientPhone === phone)
      );
      return res.json({ success: true, orders: clientOrders });
    }

    if (role === 'master' && username) {
      const currentMaster = usersDb.find((u) => u.username === username);
      const masterOrders = ordersDb.filter(
        (o) => o.assignedMasterId === currentMaster?.id
      );
      return res.json({ success: true, orders: masterOrders });
    }

    // Manager and Admin see all orders
    res.json({ success: true, orders: ordersDb });
  });

  // Create order
  app.post('/api/orders', (req, res) => {
    try {
      const { clientUsername, clientName, clientPhone, deliveryAddress, items, cardLast4 } = req.body;

      if (!items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ success: false, error: 'Корзина пуста' });
      }

      if (!clientName || !clientPhone) {
        return res.status(400).json({ success: false, error: 'Укажите контактное имя и телефон' });
      }

      const totalAmount = items.reduce((acc, it) => acc + (Number(it.totalPrice) || 0), 0);
      const randomCodeNum = Math.floor(100 + Math.random() * 900);
      const code = `ALF-2026-${randomCodeNum}`;
      const nowString = new Date().toLocaleString('ru-RU', { timeZone: 'Europe/Saratov' });
      const paymentInfo = cardLast4 ? `Оплачено картой **** ${cardLast4}` : 'Оплачено картой онлайн';

      const newOrder: Order = {
        id: `ord-${Date.now()}`,
        code,
        clientUsername: clientUsername || 'client',
        clientName: clientName.trim(),
        clientPhone: clientPhone.trim(),
        deliveryAddress: deliveryAddress ? deliveryAddress.trim() : 'Самовывоз: г. Балашов, ул. Володарского, 32',
        items,
        totalAmount,
        status: 'new',
        statusText: 'Новая заявка (Оплачено)',
        isPaid: true,
        paymentInfo,
        createdAt: nowString,
        history: [
          {
            timestamp: nowString,
            text: `Заказ #${code} оформлен и оплачен онлайн (${paymentInfo}, сумма: ${totalAmount} ₽)`,
            authorRole: 'Клиент',
            authorName: clientName,
          },
        ],
      };

      ordersDb.unshift(newOrder);

      res.status(201).json({
        success: true,
        order: newOrder,
        message: `Заказ #${code} успешно оплачен и зарегистрирован!`,
      });
    } catch {
      res.status(500).json({ success: false, error: 'Ошибка сохранения заказа' });
    }
  });

  // Manager assigns order to master (WITH STRICT 1-ORDER-PER-MASTER CHECK!)
  app.patch('/api/orders/:id/assign', (req, res) => {
    const { id } = req.params;
    const { masterId, managerNotes } = req.body;

    const order = ordersDb.find((o) => o.id === id);
    if (!order) {
      return res.status(404).json({ success: false, error: 'Заказ не найден' });
    }

    const master = usersDb.find((u) => u.id === masterId && u.role === 'master');
    if (!master) {
      return res.status(400).json({ success: false, error: 'Выбранный мастер не найден' });
    }

    // CHECK WORKLOAD: Can this master take an order?
    const busyWithOrder = ordersDb.find(
      (o) =>
        o.id !== id &&
        o.assignedMasterId === master.id &&
        (o.status === 'assigned' || o.status === 'in_progress')
    );

    if (busyWithOrder) {
      return res.status(400).json({
        success: false,
        error: `Мастер ${master.name} сейчас занят заказом #${busyWithOrder.code}. По регламенту предприятия РА «Алфавит», пока мастер не выполнит текущий заказ, передавать ему новый нельзя!`,
      });
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

    res.json({ success: true, order });
  });

  // Master takes into work OR marks as Ready
  app.patch('/api/orders/:id/work', (req, res) => {
    const { id } = req.params;
    const { plannedDate, masterNotes, status } = req.body;

    const order = ordersDb.find((o) => o.id === id);
    if (!order) {
      return res.status(404).json({ success: false, error: 'Заказ не найден' });
    }

    const nowString = new Date().toLocaleString('ru-RU', { timeZone: 'Europe/Saratov' });

    if (status === 'ready') {
      order.status = 'ready';
      order.statusText = 'Готов к выдаче / монтажу';
      order.history.push({
        timestamp: nowString,
        text: 'Мастер завершил изготовление. Изделие проверено и готово к выдаче или выезду на монтаж.',
        authorRole: 'Мастер цеха',
        authorName: order.assignedMasterName || 'Мастер',
      });
    } else {
      order.status = 'in_progress';
      order.statusText = 'В работе у мастера';
      if (plannedDate) order.plannedCompletionDate = plannedDate;
      if (masterNotes) order.masterNotes = masterNotes;

      order.history.push({
        timestamp: nowString,
        text: `Мастер взял в работу. Срок завершения по плану цеха: ${plannedDate || 'Уточняется'}${
          masterNotes ? `. Примечание: ${masterNotes}` : ''
        }`,
        authorRole: 'Мастер цеха',
        authorName: order.assignedMasterName || 'Мастер',
      });
    }

    res.json({ success: true, order });
  });

  // Manager or Admin changes status
  app.patch('/api/orders/:id/status', (req, res) => {
    const { id } = req.params;
    const { status, note, authorRole, authorName } = req.body;

    const order = ordersDb.find((o) => o.id === id);
    if (!order) {
      return res.status(404).json({ success: false, error: 'Заказ не найден' });
    }

    const nowString = new Date().toLocaleString('ru-RU', { timeZone: 'Europe/Saratov' });
    order.status = status;

    const statusMap: Record<string, string> = {
      new: 'Новая заявка',
      assigned: 'Назначен мастер',
      in_progress: 'В работе у мастера',
      ready: 'Готов к выдаче / монтажу',
      completed: 'Завершен и сдан клиенту',
      cancelled: 'Отменен диспетчером',
    };

    order.statusText = statusMap[status] || status;

    order.history.push({
      timestamp: nowString,
      text: note || `Статус изменен на "${order.statusText}"`,
      authorRole: authorRole || 'Диспетчер',
      authorName: authorName || 'Администрация РА «Алфавит»',
    });

    res.json({ success: true, order });
  });

  // Production and Vite Middlewares
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Alfavit Fullstack Server] running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Server launch failed:', err);
});

import { getDb } from '../../config/database';
import { v4 as uuidv4 } from 'uuid';
import { userRole } from '../../../shared/types/user';
import { hashPassword } from '../../utils/passwordHash';
import dotenv from 'dotenv';

dotenv.config();

// Gerar IDs com UUID
const categoryBebidasId = uuidv4();
const categoryComidasId = uuidv4();

const categories = [
  // Removido o campo slug
  { id: categoryBebidasId, name: 'Bebidas' },
  { id: categoryComidasId, name: 'Comidas' },
];

const userIds = Array.from({ length: 4 }, () => uuidv4());

const users = [
  {
    id: userIds[0],
    name: 'Carlos Silva',
    username: 'carlos.silva',
    role: userRole.ADMIN,
  },
  {
    id: userIds[1],
    name: 'Ana Santos',
    username: 'ana.santos',
    role: userRole.ADMIN,
  },
  {
    id: userIds[2],
    name: 'Pedro Costa',
    username: 'pedro.costa',
    role: userRole.ADMIN,
  },
  {
    id: userIds[3],
    name: 'Romulo',
    username: 'romulo',
    role: userRole.WAITER,
  },
];

const productIds = Array.from({ length: 10 }, () => uuidv4());

const products = [
  {
    id: productIds[0],
    category_id: categoryBebidasId,
    name: 'Água Mineral',
    description: 'Água mineral 500ml',
    price: 500,
    image_path: '/img/agua-mineral.jpg',
    is_active: true,
    preparation_time: 2, // 2 minutos
  },
  {
    id: productIds[1],
    category_id: categoryBebidasId,
    name: 'Refrigerante',
    description: 'Refrigerante 350ml (Vários sabores)',
    price: 800,
    image_path: '/img/refrigerante.jpg',
    is_active: true,
    preparation_time: 2,
  },
  {
    id: productIds[2],
    category_id: categoryBebidasId,
    name: 'Suco Natural',
    description: 'Suco natural de laranja 350ml',
    price: 1000,
    image_path: '/img/suco-natural.jpg',
    is_active: true,
    preparation_time: 10,
  },
  {
    id: productIds[3],
    category_id: categoryBebidasId,
    name: 'Café Expresso',
    description: 'Café expresso italiano',
    price: 600,
    image_path: '/img/cafe-expresso.jpg',
    is_active: true,
    preparation_time: 5,
  },
  {
    id: productIds[4],
    category_id: categoryBebidasId,
    name: 'Cerveja',
    description: 'Cerveja long neck gelada',
    price: 900,
    image_path: '/img/cerveja.jpg',
    is_active: true,
    preparation_time: 3,
  },
  {
    id: productIds[5],
    category_id: categoryComidasId,
    name: 'Hambúrguer',
    description: 'Hambúrguer artesanal com fritas',
    price: 2500,
    image_path: '/img/hamburguer.jpg',
    is_active: true,
    preparation_time: 20,
  },
  {
    id: productIds[6],
    category_id: categoryComidasId,
    name: 'Pizza Margherita',
    description: 'Pizza margherita tradicional',
    price: 3500,
    image_path: '/img/pizza-margherita.jpg',
    is_active: true,
    preparation_time: 25,
  },
  {
    id: productIds[7],
    category_id: categoryComidasId,
    name: 'Salada Caesar',
    description: 'Salada caesar com frango grelhado',
    price: 1800,
    image_path: '/img/salada-caesar.jpg',
    is_active: true,
    preparation_time: 15,
  },
  {
    id: productIds[8],
    category_id: categoryComidasId,
    name: 'Filé à Parmegiana',
    description: 'Filé à parmegiana com arroz e fritas',
    price: 4200,
    image_path: '/img/file-parmegiana.jpg',
    is_active: true,
    preparation_time: 30,
  },
  {
    id: productIds[9],
    category_id: categoryComidasId,
    name: 'Pastel Assado',
    description: 'Pastel assado (3 unidades)',
    price: 1500,
    image_path: '/img/pastel-assado.jpg',
    is_active: true,
    preparation_time: 12,
  },
];

// Mesas e Pedidos permanecem iguais (mas preciso manter no arquivo para não quebrar)
const tableIds = Array.from({ length: 10 }, () => uuidv4());
const tables = [
  { id: tableIds[0], number: 1, status: 'AVAILABLE' },
  { id: tableIds[1], number: 2, status: 'AVAILABLE' },
  { id: tableIds[2], number: 3, status: 'AVAILABLE' },
  { id: tableIds[3], number: 4, status: 'AVAILABLE' },
  { id: tableIds[4], number: 5, status: 'AVAILABLE' },
  { id: tableIds[5], number: 6, status: 'OCCUPIED', waiter_id: userIds[0] },
  { id: tableIds[6], number: 7, status: 'OCCUPIED', waiter_id: userIds[1] },
  { id: tableIds[7], number: 8, status: 'OCCUPIED', waiter_id: userIds[2] },
  { id: tableIds[8], number: 9, status: 'OCCUPIED', waiter_id: userIds[0] },
  { id: tableIds[9], number: 10, status: 'OCCUPIED', waiter_id: userIds[1] },
];

const orderIds = Array.from({ length: 10 }, () => uuidv4());
const orders = [
  { id: orderIds[0], table_id: tableIds[5], user_id: userIds[0], status: 'OPEN', total: 0, opened_at: new Date('2026-01-30T10:00:00'), closed_at: null as Date | null },
  { id: orderIds[1], table_id: tableIds[6], user_id: userIds[1], status: 'OPEN', total: 0, opened_at: new Date('2026-01-30T10:30:00'), closed_at: null as Date | null },
  { id: orderIds[2], table_id: tableIds[7], user_id: userIds[2], status: 'OPEN', total: 0, opened_at: new Date('2026-01-30T11:00:00'), closed_at: null as Date | null },
  { id: orderIds[3], table_id: tableIds[8], user_id: userIds[0], status: 'OPEN', total: 0, opened_at: new Date('2026-01-30T11:30:00'), closed_at: null as Date | null },
  { id: orderIds[4], table_id: tableIds[9], user_id: userIds[1], status: 'OPEN', total: 0, opened_at: new Date('2026-01-30T12:00:00'), closed_at: null as Date | null },
  { id: orderIds[5], table_id: tableIds[0], user_id: userIds[0], status: 'CLOSED', total: 6600, tip: 660, opened_at: new Date('2026-01-29T14:00:00'), closed_at: new Date('2026-01-29T15:30:00') as Date | null },
  { id: orderIds[6], table_id: tableIds[1], user_id: userIds[1], status: 'CLOSED', total: 8100, tip: 810, opened_at: new Date('2026-01-29T16:00:00'), closed_at: new Date('2026-01-29T17:15:00') as Date | null },
  { id: orderIds[7], table_id: tableIds[2], user_id: userIds[2], status: 'CLOSED', total: 4900, tip: 490, opened_at: new Date('2026-01-29T18:00:00'), closed_at: new Date('2026-01-29T19:00:00') as Date | null },
  { id: orderIds[8], table_id: tableIds[3], user_id: userIds[0], status: 'CLOSED', total: 9200, tip: 920, opened_at: new Date('2026-01-30T08:00:00'), closed_at: new Date('2026-01-30T09:15:00') as Date | null },
  { id: orderIds[9], table_id: tableIds[4], user_id: userIds[1], status: 'CLOSED', total: 5700, tip: 570, opened_at: new Date('2026-01-30T09:30:00'), closed_at: new Date('2026-01-30T10:45:00') as Date | null },
];

const orderItems = [
  { id: uuidv4(), order_id: orderIds[0], product_id: productIds[5], quantity: 2, unit_price: 2500 },
  { id: uuidv4(), order_id: orderIds[0], product_id: productIds[1], quantity: 2, unit_price: 800 },
  { id: uuidv4(), order_id: orderIds[1], product_id: productIds[6], quantity: 1, unit_price: 3500 },
  { id: uuidv4(), order_id: orderIds[1], product_id: productIds[4], quantity: 3, unit_price: 900 },
  { id: uuidv4(), order_id: orderIds[2], product_id: productIds[8], quantity: 1, unit_price: 4200 },
  { id: uuidv4(), order_id: orderIds[2], product_id: productIds[2], quantity: 1, unit_price: 1000 },
  { id: uuidv4(), order_id: orderIds[3], product_id: productIds[7], quantity: 2, unit_price: 1800 },
  { id: uuidv4(), order_id: orderIds[3], product_id: productIds[0], quantity: 2, unit_price: 500 },
  { id: uuidv4(), order_id: orderIds[4], product_id: productIds[9], quantity: 3, unit_price: 1500 },
  { id: uuidv4(), order_id: orderIds[4], product_id: productIds[3], quantity: 2, unit_price: 600 },
  { id: uuidv4(), order_id: orderIds[5], product_id: productIds[5], quantity: 2, unit_price: 2500 },
  { id: uuidv4(), order_id: orderIds[5], product_id: productIds[1], quantity: 2, unit_price: 800 },
  { id: uuidv4(), order_id: orderIds[6], product_id: productIds[8], quantity: 1, unit_price: 4200 },
  { id: uuidv4(), order_id: orderIds[6], product_id: productIds[2], quantity: 2, unit_price: 1000 },
  { id: uuidv4(), order_id: orderIds[6], product_id: productIds[4], quantity: 2, unit_price: 900 },
  { id: uuidv4(), order_id: orderIds[7], product_id: productIds[9], quantity: 2, unit_price: 1500 },
  { id: uuidv4(), order_id: orderIds[7], product_id: productIds[4], quantity: 2, unit_price: 900 },
  { id: uuidv4(), order_id: orderIds[8], product_id: productIds[6], quantity: 2, unit_price: 3500 },
  { id: uuidv4(), order_id: orderIds[8], product_id: productIds[1], quantity: 3, unit_price: 800 },
  { id: uuidv4(), order_id: orderIds[9], product_id: productIds[7], quantity: 2, unit_price: 1800 },
  { id: uuidv4(), order_id: orderIds[9], product_id: productIds[3], quantity: 3, unit_price: 600 },
  { id: uuidv4(), order_id: orderIds[9], product_id: productIds[0], quantity: 1, unit_price: 500 },
];

export const runSeeds = async () => {
  const db = await getDb();
  try {
    const existingCategories = await db.get('SELECT COUNT(*) as count FROM categories');
    if (existingCategories.count > 0) {
      console.log('⚠️  Seeds já foram executados anteriormente. Pulando...');
      return;
    }

    const plainPassword = process.env.SEED_PASSWORD || '123456';
    const hashedPassword = await hashPassword(plainPassword);

    // Inserir categorias (SEM SLUG)
    for (const category of categories) {
      await db.run('INSERT INTO categories (id, name) VALUES (?, ?)', [
        category.id,
        category.name,
      ]);
    }
    console.log('✓ Categorias inseridas');

    // Inserir produtos (COM PREPARATION TIME)
    for (const product of products) {
      await db.run(
        `INSERT INTO products (id, category_id, name, description, price, image_path, is_active, preparation_time)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          product.id,
          product.category_id,
          product.name,
          product.description,
          product.price,
          product.image_path,
          product.is_active ? 1 : 0,
          product.preparation_time
        ],
      );
    }
    console.log('✓ Produtos inseridos');

    // Usuários
    for (const user of users) {
      await db.run(
        `INSERT INTO users (id, name, username, password_hash, role)
          VALUES (?, ?, ?, ?, ?)`,
        [user.id, user.name, user.username, hashedPassword, user.role],
      );
    }
    console.log('✓ Usuários inseridos');

    // Mesas
    for (const table of tables) {
      await db.run(
        'INSERT INTO restaurant_tables (id, number, status, waiter_id) VALUES (?, ?, ?, ?)',
        [table.id, table.number, table.status, table.waiter_id || null],
      );
    }
    console.log('✓ Mesas inseridas');

    // Pedidos
    for (const order of orders) {
      await db.run(
        `INSERT INTO orders (id, table_id, user_id, status, total, tip, opened_at, closed_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          order.id,
          order.table_id,
          order.user_id,
          order.status,
          order.total,
          order.tip || 0,
          order.opened_at.toISOString(),
          order.closed_at ? order.closed_at.toISOString() : null,
        ],
      );
    }
    console.log('✓ Pedidos inseridos');

    // Itens
    for (const item of orderItems) {
      await db.run(
        `INSERT INTO order_items (id, order_id, product_id, quantity, unit_price)
          VALUES (?, ?, ?, ?, ?)`,
        [
          item.id,
          item.order_id,
          item.product_id,
          item.quantity,
          item.unit_price,
        ],
      );
    }
    console.log('✓ Itens dos pedidos inseridos');

    console.log('\n✅ Todos os seeds foram inseridos com sucesso!');
  } catch (error) {
    console.error('❌ Erro ao inserir seeds:', error);
    throw error;
  }
};

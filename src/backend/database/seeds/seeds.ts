import { getDb } from '../../config/database';
import { v4 as uuidv4 } from 'uuid';
import { userRole } from '../../../shared/types/user';
import { hashPassword } from '../../utils/passwordHash';

// Gerar IDs com UUID
const categoryBebidasId = uuidv4();
const categoryComidasId = uuidv4();

const categories = [
  { id: categoryBebidasId, name: 'Bebidas', slug: 'bebidas' },
  { id: categoryComidasId, name: 'Comidas', slug: 'comidas' },
];

const adminId = uuidv4();
const waiterId = uuidv4();

// Gerar IDs dos produtos (7 bebidas + 10 comidas = 17 produtos)
const productIds = Array.from({ length: 17 }, () => uuidv4());

const products = [
  // Bebidas (7 produtos)
  {
    id: productIds[0],
    category_id: categoryBebidasId,
    name: 'Água Mineral',
    description: 'Água mineral sem gás 500ml',
    price: 500,
    image_path: '/img/drink/agua.webp',
    is_active: true,
  },
  {
    id: productIds[1],
    category_id: categoryBebidasId,
    name: 'Café Expresso',
    description: 'Café expresso intenso',
    price: 600,
    image_path: '/img/drink/cafe.webp',
    is_active: true,
  },
  {
    id: productIds[2],
    category_id: categoryBebidasId,
    name: 'Caipirinha',
    description: 'Caipirinha tradicional de limão',
    price: 1500,
    image_path: '/img/drink/caipirinha.webp',
    is_active: true,
  },
  {
    id: productIds[3],
    category_id: categoryBebidasId,
    name: 'Cerveja Artesanal',
    description: 'Cerveja artesanal gelada',
    price: 1200,
    image_path: '/img/drink/cerveja.webp',
    is_active: true,
  },
  {
    id: productIds[4],
    category_id: categoryBebidasId,
    name: 'Milkshake',
    description: 'Milkshake cremoso de chocolate',
    price: 1800,
    image_path: '/img/drink/milkshake.webp',
    is_active: true,
  },
  {
    id: productIds[5],
    category_id: categoryBebidasId,
    name: 'Refrigerante',
    description: 'Refrigerante lata 350ml',
    price: 800,
    image_path: '/img/drink/refrigerante.webp',
    is_active: true,
  },
  {
    id: productIds[6],
    category_id: categoryBebidasId,
    name: 'Suco Natural',
    description: 'Suco natural de frutas da estação',
    price: 1000,
    image_path: '/img/drink/suco.webp',
    is_active: true,
  },
  // Comidas (10 produtos)
  {
    id: productIds[7],
    category_id: categoryComidasId,
    name: 'Açaí com Peixe',
    description: 'Açaí tradicional com peixe frito',
    price: 3500,
    image_path: '/img/food/acai-peixe.webp',
    is_active: true,
  },
  {
    id: productIds[8],
    category_id: categoryComidasId,
    name: 'Spaghetti Carbonara',
    description: 'Massa italiana clássica com pancetta e ovos',
    price: 4200,
    image_path: '/img/food/carbonara.webp',
    is_active: true,
  },
  {
    id: productIds[9],
    category_id: categoryComidasId,
    name: 'Carne Assada',
    description: 'Carne assada suculenta com batatas rústicas',
    price: 4500,
    image_path: '/img/food/carne-assada.webp',
    is_active: true,
  },
  {
    id: productIds[10],
    category_id: categoryComidasId,
    name: 'Frango no Tucupi',
    description: 'Prato típico com frango e tucupi',
    price: 3800,
    image_path: '/img/food/frango-tucupi.webp',
    is_active: true,
  },
  {
    id: productIds[11],
    category_id: categoryComidasId,
    name: 'Gyoza',
    description: 'Porção de 6 unidades de Gyoza',
    price: 2200,
    image_path: '/img/food/gyoza.webp',
    is_active: true,
  },
  {
    id: productIds[12],
    category_id: categoryComidasId,
    name: 'Maniçoba',
    description: 'Prato tradicional paraense',
    price: 4000,
    image_path: '/img/food/manicoba.webp',
    is_active: true,
  },
  {
    id: productIds[13],
    category_id: categoryComidasId,
    name: 'Pizza Calabresa',
    description: 'Pizza de calabresa com cebola e queijo',
    price: 3500,
    image_path: '/img/food/pizza.webp',
    is_active: true,
  },
  {
    id: productIds[14],
    category_id: categoryComidasId,
    name: 'Salada Caesar',
    description: 'Salada leve com frango grelhado e molho especial',
    price: 2800,
    image_path: '/img/food/salada-frango.webp',
    is_active: true,
  },
  {
    id: productIds[15],
    category_id: categoryComidasId,
    name: 'Combinado Sushi',
    description: 'Seleção especial de sushis e sahimis',
    price: 6500,
    image_path: '/img/food/sushi.webp',
    is_active: true,
  },
  {
    id: productIds[16],
    category_id: categoryComidasId,
    name: 'Tacacá',
    description: 'Tacacá quente com jambu e camarão',
    price: 2500,
    image_path: '/img/food/tacaca.webp',
    is_active: true,
  },
];

// Gerar IDs das mesas (10 mesas: 5 desocupadas + 5 ocupadas)
const tableIds = Array.from({ length: 10 }, () => uuidv4());

const tables = [
  // 5 mesas desocupadas
  { id: tableIds[0], number: 1, status: 'AVAILABLE' },
  { id: tableIds[1], number: 2, status: 'AVAILABLE' },
  { id: tableIds[2], number: 3, status: 'AVAILABLE' },
  { id: tableIds[3], number: 4, status: 'AVAILABLE' },
  { id: tableIds[4], number: 5, status: 'AVAILABLE' },
  // 5 mesas ocupadas
  { id: tableIds[5], number: 6, status: 'OCCUPIED', waiter_id: waiterId },
  { id: tableIds[6], number: 7, status: 'OCCUPIED', waiter_id: waiterId },
  { id: tableIds[7], number: 8, status: 'OCCUPIED', waiter_id: waiterId },
  { id: tableIds[8], number: 9, status: 'OCCUPIED', waiter_id: waiterId },
  { id: tableIds[9], number: 10, status: 'OCCUPIED', waiter_id: waiterId },
];

// Gerar IDs dos pedidos (10 pedidos: 5 abertos + 5 fechados)
const orderIds = Array.from({ length: 10 }, () => uuidv4());

const orders = [
  // Pedidos Abertos (Mesas 6-10)
  {
    id: orderIds[0],
    table_id: tableIds[5],
    user_id: waiterId,
    status: 'OPEN',
    total: 5900,
    opened_at: new Date('2026-02-04T13:00:00'),
    closed_at: null as Date | null,
  },
  {
    id: orderIds[1],
    table_id: tableIds[6],
    user_id: waiterId,
    status: 'OPEN',
    total: 8500,
    opened_at: new Date('2026-02-04T13:10:00'),
    closed_at: null as Date | null,
  },
  {
    id: orderIds[2],
    table_id: tableIds[7],
    user_id: waiterId,
    status: 'OPEN',
    total: 3100,
    opened_at: new Date('2026-02-04T13:20:00'),
    closed_at: null as Date | null,
  },
  {
    id: orderIds[3],
    table_id: tableIds[8],
    user_id: waiterId,
    status: 'OPEN',
    total: 3800,
    opened_at: new Date('2026-02-04T13:30:00'),
    closed_at: null as Date | null,
  },
  {
    id: orderIds[4],
    table_id: tableIds[9],
    user_id: waiterId,
    status: 'OPEN',
    total: 4700,
    opened_at: new Date('2026-02-04T13:40:00'),
    closed_at: null as Date | null,
  },
  // Pedidos Fechados (Mesas 1-5 que agora estão Available)
  {
    id: orderIds[5],
    table_id: tableIds[0],
    user_id: waiterId,
    status: 'CLOSED',
    total: 8600,
    tip: 860,
    opened_at: new Date('2026-02-04T13:00:00'),
    closed_at: new Date('2026-02-04T13:15:00') as Date | null,
  },
  {
    id: orderIds[6],
    table_id: tableIds[1],
    user_id: waiterId,
    status: 'CLOSED',
    total: 8100,
    tip: 810,
    opened_at: new Date('2026-02-04T13:10:00'),
    closed_at: new Date('2026-02-04T13:25:00') as Date | null,
  },
  {
    id: orderIds[7],
    table_id: tableIds[2],
    user_id: waiterId,
    status: 'CLOSED',
    total: 9500,
    tip: 950,
    opened_at: new Date('2026-02-04T13:20:00'),
    closed_at: new Date('2026-02-04T13:35:00') as Date | null,
  },
  {
    id: orderIds[8],
    table_id: tableIds[3],
    user_id: waiterId,
    status: 'CLOSED',
    total: 7300,
    tip: 730,
    opened_at: new Date('2026-02-04T13:30:00'),
    closed_at: new Date('2026-02-04T13:45:00') as Date | null,
  },
  {
    id: orderIds[9],
    table_id: tableIds[4],
    user_id: waiterId,
    status: 'CLOSED',
    total: 4500,
    tip: 450,
    opened_at: new Date('2026-02-04T13:40:00'),
    closed_at: new Date('2026-02-04T13:55:00') as Date | null,
  },
];

// Itens dos pedidos
const orderItems = [
  // Pedido 0 (Aberto) -> 2x Cerveja + 1x Pizza Calabresa
  {
    id: uuidv4(),
    order_id: orderIds[0],
    product_id: productIds[3],
    quantity: 2,
    unit_price: 1200,
    delivered_at: null as Date | null,
  },
  {
    id: uuidv4(),
    order_id: orderIds[0],
    product_id: productIds[13],
    quantity: 1,
    unit_price: 3500,
    delivered_at: null as Date | null,
  },
  // Pedido 1 (Aberto) -> 2x Suco + 1x Sushi
  {
    id: uuidv4(),
    order_id: orderIds[1],
    product_id: productIds[6],
    quantity: 2,
    unit_price: 1000,
    delivered_at: null as Date | null,
  },
  {
    id: uuidv4(),
    order_id: orderIds[1],
    product_id: productIds[15],
    quantity: 1,
    unit_price: 6500,
    delivered_at: null as Date | null,
  },
  // Pedido 2 (Aberto) -> 1x Cafe + 1x Tacaca
  {
    id: uuidv4(),
    order_id: orderIds[2],
    product_id: productIds[1],
    quantity: 1,
    unit_price: 600,
    delivered_at: null as Date | null,
  },
  {
    id: uuidv4(),
    order_id: orderIds[2],
    product_id: productIds[16],
    quantity: 1,
    unit_price: 2500,
    delivered_at: null as Date | null,
  },
  // Pedido 3 (Aberto) -> 2x Refri + 1x Gyoza
  {
    id: uuidv4(),
    order_id: orderIds[3],
    product_id: productIds[5],
    quantity: 2,
    unit_price: 800,
    delivered_at: null as Date | null,
  },
  {
    id: uuidv4(),
    order_id: orderIds[3],
    product_id: productIds[11],
    quantity: 1,
    unit_price: 2200,
    delivered_at: null as Date | null,
  },
  // Pedido 4 (Aberto) -> 1x Agua + 1x Carbonara
  {
    id: uuidv4(),
    order_id: orderIds[4],
    product_id: productIds[0],
    quantity: 1,
    unit_price: 500,
    delivered_at: null as Date | null,
  },
  {
    id: uuidv4(),
    order_id: orderIds[4],
    product_id: productIds[8],
    quantity: 1,
    unit_price: 4200,
    delivered_at: null as Date | null,
  },

  // Pedido 5 (Fechado) -> 2x Pizza + 2x Refri
  {
    id: uuidv4(),
    order_id: orderIds[5],
    product_id: productIds[13],
    quantity: 2,
    unit_price: 3500,
    delivered_at: new Date('2026-02-04T13:10:00'),
  },
  {
    id: uuidv4(),
    order_id: orderIds[5],
    product_id: productIds[5],
    quantity: 2,
    unit_price: 800,
    delivered_at: new Date('2026-02-04T13:10:00'),
  },
  // Pedido 6 (Fechado) -> 1x Carne Assada + 2x Milkshake
  {
    id: uuidv4(),
    order_id: orderIds[6],
    product_id: productIds[9],
    quantity: 1,
    unit_price: 4500,
    delivered_at: new Date('2026-02-04T13:20:00'),
  },
  {
    id: uuidv4(),
    order_id: orderIds[6],
    product_id: productIds[4],
    quantity: 2,
    unit_price: 1800,
    delivered_at: new Date('2026-02-04T13:20:00'),
  },
  // Pedido 7 (Fechado) -> 1x Sushi + 2x Caipirinha
  {
    id: uuidv4(),
    order_id: orderIds[7],
    product_id: productIds[15],
    quantity: 1,
    unit_price: 6500,
    delivered_at: new Date('2026-02-04T13:30:00'),
  },
  {
    id: uuidv4(),
    order_id: orderIds[7],
    product_id: productIds[2],
    quantity: 2,
    unit_price: 1500,
    delivered_at: new Date('2026-02-04T13:30:00'),
  },
  // Pedido 8 (Fechado) -> 1x Frango Tucupi + 1x Acai
  {
    id: uuidv4(),
    order_id: orderIds[8],
    product_id: productIds[10],
    quantity: 1,
    unit_price: 3800,
    delivered_at: new Date('2026-02-04T13:40:00'),
  },
  {
    id: uuidv4(),
    order_id: orderIds[8],
    product_id: productIds[7],
    quantity: 1,
    unit_price: 3500,
    delivered_at: new Date('2026-02-04T13:40:00'),
  },
  // Pedido 9 (Fechado) -> 1x Manicoba + 1x Agua
  {
    id: uuidv4(),
    order_id: orderIds[9],
    product_id: productIds[12],
    quantity: 1,
    unit_price: 4000,
    delivered_at: new Date('2026-02-04T13:50:00'),
  },
  {
    id: uuidv4(),
    order_id: orderIds[9],
    product_id: productIds[0],
    quantity: 1,
    unit_price: 500,
    delivered_at: new Date('2026-02-04T13:50:00'),
  },
];

export const runSeeds = async () => {
  const db = await getDb();

  const managerPasswordHash = await hashPassword(
    process.env.MANAGER_PASSWORD as string,
  );
  const waiterPasswordHash = await hashPassword(
    process.env.WAITER_PASSWORD as string,
  );
  const totemPasswordHash = await hashPassword(
    process.env.TOTEM_PASSWORD as string,
  );

  const users = [
    {
      id: adminId,
      name: process.env.MANAGER_NAME,
      username: process.env.MANAGER_USERNAME,
      password_hash: managerPasswordHash,
      role: userRole.MANAGER,
    },
    {
      id: waiterId,
      name: process.env.WAITER_NAME,
      username: process.env.WAITER_USERNAME,
      password_hash: waiterPasswordHash,
      role: userRole.WAITER,
    },
    {
      id: uuidv4(),
      name: process.env.TOTEM_NAME || 'Totem',
      username: process.env.TOTEM_USERNAME || 'totem',
      password_hash: totemPasswordHash,
      role: userRole.WAITER, // Totem acts as a waiter
    },
  ];

  try {
    // Verificar se já existem dados
    const existingCategories = await db.get(
      'SELECT COUNT(*) as count FROM categories',
    );

    if (existingCategories.count > 0) {
      console.log('⚠️  Seeds já foram executados anteriormente. Pulando...');
      return;
    }

    // Inserir categorias
    for (const category of categories) {
      await db.run('INSERT INTO categories (id, name, slug) VALUES (?, ?, ?)', [
        category.id,
        category.name,
        category.slug,
      ]);
    }
    console.log('✓ Categorias inseridas');

    // Inserir produtos
    for (const product of products) {
      await db.run(
        `INSERT INTO products (id, category_id, name, description, price, image_path, is_active)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          product.id,
          product.category_id,
          product.name,
          product.description,
          product.price,
          product.image_path,
          product.is_active ? 1 : 0,
        ],
      );
    }
    console.log('✓ Produtos inseridos');

    // Inserir usuários
    for (const user of users) {
      await db.run(
        `INSERT INTO users (id, name, username, password_hash, role)
         VALUES (?, ?, ?, ?, ?)`,
        [user.id, user.name, user.username, user.password_hash, user.role],
      );
    }
    console.log('✓ Usuários inseridos');

    // Inserir mesas
    for (const table of tables) {
      await db.run(
        'INSERT INTO restaurant_tables (id, number, status, waiter_id) VALUES (?, ?, ?, ?)',
        [table.id, table.number, table.status, table.waiter_id || null],
      );
    }
    console.log('✓ Mesas inseridas');

    // Inserir pedidos
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

    // Inserir itens do pedido
    for (const item of orderItems) {
      await db.run(
        `INSERT INTO order_items (id, order_id, product_id, quantity, unit_price, delivered_at)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          item.id,
          item.order_id,
          item.product_id,
          item.quantity,
          item.unit_price,
          item.delivered_at ? item.delivered_at.toISOString() : null,
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

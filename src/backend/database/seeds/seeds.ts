import { getDb } from '../../config/database';
import { v4 as uuidv4 } from 'uuid';
import { userRole } from '../../../shared/types/user';

// Gerar IDs com UUID
const categoryBebidasId = uuidv4();
const categoryComidasId = uuidv4();

const categories = [
  { id: categoryBebidasId, name: 'Bebidas', slug: 'bebidas' },
  { id: categoryComidasId, name: 'Comidas', slug: 'comidas' },
];

// Gerar IDs dos produtos
const productIds = Array.from({ length: 25 }, () => uuidv4());

const products = [
  // Bebidas
  {
    id: productIds[0],
    category_id: categoryBebidasId,
    name: 'Água Mineral',
    description: 'Água mineral 500ml',
    price: 5.0,
    image_path: '/img/agua-mineral.jpg',
    is_active: true,
  },
  {
    id: productIds[1],
    category_id: categoryBebidasId,
    name: 'Refrigerante',
    description: 'Refrigerante 350ml (Vários sabores)',
    price: 8.0,
    image_path: '/img/refrigerante.jpg',
    is_active: true,
  },
  {
    id: productIds[2],
    category_id: categoryBebidasId,
    name: 'Suco Natural',
    description: 'Suco natural de laranja 350ml',
    price: 10.0,
    image_path: '/img/suco-natural.jpg',
    is_active: true,
  },
  {
    id: productIds[3],
    category_id: categoryBebidasId,
    name: 'Café Expresso',
    description: 'Café expresso italiano',
    price: 6.0,
    image_path: '/img/cafe-expresso.jpg',
    is_active: true,
  },
  {
    id: productIds[4],
    category_id: categoryBebidasId,
    name: 'Vinho Tinto',
    description: 'Vinho tinto da região',
    price: 45.0,
    image_path: '/img/vinho-tinto.jpg',
    is_active: true,
  },
  // Comidas - Entradas
  {
    id: productIds[5],
    category_id: categoryComidasId,
    name: 'Bruschettas',
    description: 'Bruschettas variadas com tomate e queijo',
    price: 25.0,
    image_path: '/img/bruschettas.jpg',
    is_active: true,
  },
  {
    id: productIds[6],
    category_id: categoryComidasId,
    name: 'Camarões à Alho',
    description: 'Camarões frescos ao alho e azeite',
    price: 35.0,
    image_path: '/img/camaroes-alho.jpg',
    is_active: true,
  },
  {
    id: productIds[7],
    category_id: categoryComidasId,
    name: 'Queijos e Embutidos',
    description: 'Tábua variada de queijos e embutidos importados',
    price: 42.0,
    image_path: '/img/queijos-embutidos.jpg',
    is_active: true,
  },
  {
    id: productIds[8],
    category_id: categoryComidasId,
    name: 'Pão de Alho',
    description: 'Pão caseiro com alho e manteiga',
    price: 12.0,
    image_path: '/img/pao-alho.jpg',
    is_active: true,
  },
  {
    id: productIds[9],
    category_id: categoryComidasId,
    name: 'Sardinha Assada',
    description: 'Sardinha fresca assada na brasa',
    price: 28.0,
    image_path: '/img/sardinha-assada.jpg',
    is_active: true,
  },
  // Comidas - Pratos Principais
  {
    id: productIds[10],
    category_id: categoryComidasId,
    name: 'Filet Mignon',
    description: 'Filet mignon grelhado com molho madeira',
    price: 89.0,
    image_path: '/img/filet-mignon.jpg',
    is_active: true,
  },
  {
    id: productIds[11],
    category_id: categoryComidasId,
    name: 'Salmão Grelhado',
    description: 'Salmão fresco com limão siciliano',
    price: 72.0,
    image_path: '/img/salmao-grelhado.jpg',
    is_active: true,
  },
  {
    id: productIds[12],
    category_id: categoryComidasId,
    name: 'Frango à Parmegiana',
    description: 'Frango empanado com molho de tomate e queijo derretido',
    price: 48.0,
    image_path: '/img/frango-parmegiana.jpg',
    is_active: true,
  },
  {
    id: productIds[13],
    category_id: categoryComidasId,
    name: 'Risoto de Cogumelos',
    description: 'Risoto cremoso com cogumelos frescos',
    price: 55.0,
    image_path: '/img/risoto-cogumelos.jpg',
    is_active: true,
  },
  {
    id: productIds[14],
    category_id: categoryComidasId,
    name: 'Costela BBQ',
    description: 'Costela assada com molho BBQ especial da casa',
    price: 65.0,
    image_path: '/img/costela-bbq.jpg',
    is_active: true,
  },
  // Comidas - Sobremesas
  {
    id: productIds[15],
    category_id: categoryComidasId,
    name: 'Tiramisu',
    description: 'Tiramisu clássico italiano',
    price: 18.0,
    image_path: '/img/tiramisu.jpg',
    is_active: true,
  },
  {
    id: productIds[16],
    category_id: categoryComidasId,
    name: 'Sorvete Artesanal',
    description: 'Sorvete artesanal (2 sabores a escolher)',
    price: 15.0,
    image_path: '/img/sorvete-artesanal.jpg',
    is_active: true,
  },
  {
    id: productIds[17],
    category_id: categoryComidasId,
    name: 'Chocolate Quente',
    description: 'Chocolate quente com calda de chocolate derretido',
    price: 14.0,
    image_path: '/img/chocolate-quente.jpg',
    is_active: true,
  },
  {
    id: productIds[18],
    category_id: categoryComidasId,
    name: 'Pavê de Chocolate',
    description: 'Pavê de chocolate caseiro',
    price: 16.0,
    image_path: '/img/pave-chocolate.jpg',
    is_active: true,
  },
  {
    id: productIds[19],
    category_id: categoryComidasId,
    name: 'Frutas Frescas',
    description: 'Tábua com frutas frescas da estação',
    price: 22.0,
    image_path: '/img/frutas-frescas.jpg',
    is_active: true,
  },
  // Comidas - Acompanhamentos
  {
    id: productIds[20],
    category_id: categoryComidasId,
    name: 'Batata Frita',
    description: 'Batata frita crocante',
    price: 12.0,
    image_path: '/img/batata-frita.jpg',
    is_active: true,
  },
  {
    id: productIds[21],
    category_id: categoryComidasId,
    name: 'Arroz Branco',
    description: 'Arroz branco cozido na manteiga',
    price: 8.0,
    image_path: '/img/arroz-branco.jpg',
    is_active: true,
  },
  {
    id: productIds[22],
    category_id: categoryComidasId,
    name: 'Feijão Carioca',
    description: 'Feijão carioca temperado',
    price: 7.0,
    image_path: '/img/feijao-carioca.jpg',
    is_active: true,
  },
  {
    id: productIds[23],
    category_id: categoryComidasId,
    name: 'Legumes Grelhados',
    description: 'Mix de legumes grelhados com azeite',
    price: 14.0,
    image_path: '/img/legumes-grelhados.jpg',
    is_active: true,
  },
  {
    id: productIds[24],
    category_id: categoryComidasId,
    name: 'Salada Verde',
    description: 'Salada mista com alface, rúcula e tomate',
    price: 11.0,
    image_path: '/img/salada-verde.jpg',
    is_active: true,
  },
];

// Gerar IDs dos usuários
const userIds = Array.from({ length: 5 }, () => uuidv4());

const users = [
  {
    id: userIds[0],
    name: 'Admin Sistema',
    username: 'admin',
    password_hash:
      '$2b$10$uxzd8zB2dPQPvhR8KS1nGO5c7xB9kV3cM5xQ2d1E6xL9w9Y8zB2jm', // password: admin123
    role: userRole.ADMIN,
  },
  {
    id: userIds[1],
    name: 'João Silva',
    username: 'joao.silva',
    password_hash:
      '$2b$10$uxzd8zB2dPQPvhR8KS1nGO5c7xB9kV3cM5xQ2d1E6xL9w9Y8zB2jm', // password: admin123
    role: userRole.MANAGER,
  },
  {
    id: userIds[2],
    name: 'Maria Santos',
    username: 'maria.santos',
    password_hash:
      '$2b$10$uxzd8zB2dPQPvhR8KS1nGO5c7xB9kV3cM5xQ2d1E6xL9w9Y8zB2jm', // password: admin123
    role: userRole.WAITER,
  },
  {
    id: userIds[3],
    name: 'Carlos Oliveira',
    username: 'carlos.oliveira',
    password_hash:
      '$2b$10$uxzd8zB2dPQPvhR8KS1nGO5c7xB9kV3cM5xQ2d1E6xL9w9Y8zB2jm', // password: admin123
    role: userRole.WAITER,
  },
  {
    id: userIds[4],
    name: 'Ana Costa',
    username: 'ana.costa',
    password_hash:
      '$2b$10$uxzd8zB2dPQPvhR8KS1nGO5c7xB9kV3cM5xQ2d1E6xL9w9Y8zB2jm', // password: admin123
    role: userRole.WAITER,
  },
];

// Gerar IDs das mesas
const tableIds = Array.from({ length: 5 }, () => uuidv4());

const tables = [
  { id: tableIds[0], number: 1, status: 'AVAILABLE' },
  { id: tableIds[1], number: 2, status: 'OCCUPIED' },
  { id: tableIds[2], number: 3, status: 'AVAILABLE' },
  { id: tableIds[3], number: 4, status: 'RESERVED' },
  { id: tableIds[4], number: 5, status: 'AVAILABLE' },
];

// Gerar IDs dos pedidos
const orderIds = Array.from({ length: 5 }, () => uuidv4());

const orders = [
  {
    id: orderIds[0],
    table_id: tableIds[1],
    user_id: userIds[1],
    status: 'OPEN',
    total: 0,
    opened_at: new Date('2026-01-27T11:30:00'),
    closed_at: null,
  },
  {
    id: orderIds[1],
    table_id: tableIds[0],
    user_id: userIds[2],
    status: 'COMPLETED',
    total: 156.5,
    opened_at: new Date('2026-01-27T11:15:00'),
    closed_at: new Date('2026-01-27T12:30:00'),
  },
  {
    id: orderIds[2],
    table_id: tableIds[2],
    user_id: userIds[1],
    status: 'OPEN',
    total: 0,
    opened_at: new Date('2026-01-27T12:00:00'),
    closed_at: null,
  },
  {
    id: orderIds[3],
    table_id: tableIds[1],
    user_id: userIds[2],
    status: 'COMPLETED',
    total: 234.8,
    opened_at: new Date('2026-01-27T10:45:00'),
    closed_at: new Date('2026-01-27T11:45:00'),
  },
  {
    id: orderIds[4],
    table_id: tableIds[4],
    user_id: userIds[1],
    status: 'OPEN',
    total: 0,
    opened_at: new Date('2026-01-27T12:15:00'),
    closed_at: null,
  },
];

const orderItems = [
  // Order 001 items
  {
    id: uuidv4(),
    order_id: orderIds[0],
    product_id: productIds[10],
    quantity: 2,
    unit_price: 89.0,
  },
  {
    id: uuidv4(),
    order_id: orderIds[0],
    product_id: productIds[20],
    quantity: 2,
    unit_price: 12.0,
  },
  {
    id: uuidv4(),
    order_id: orderIds[0],
    product_id: productIds[15],
    quantity: 2,
    unit_price: 18.0,
  },
  {
    id: uuidv4(),
    order_id: orderIds[0],
    product_id: productIds[1],
    quantity: 2,
    unit_price: 8.0,
  },
  // Order 002 items
  {
    id: uuidv4(),
    order_id: orderIds[1],
    product_id: productIds[11],
    quantity: 1,
    unit_price: 72.0,
  },
  {
    id: uuidv4(),
    order_id: orderIds[1],
    product_id: productIds[21],
    quantity: 1,
    unit_price: 8.0,
  },
  {
    id: uuidv4(),
    order_id: orderIds[1],
    product_id: productIds[6],
    quantity: 1,
    unit_price: 35.0,
  },
  {
    id: uuidv4(),
    order_id: orderIds[1],
    product_id: productIds[16],
    quantity: 1,
    unit_price: 15.0,
  },
  {
    id: uuidv4(),
    order_id: orderIds[1],
    product_id: productIds[2],
    quantity: 2,
    unit_price: 10.0,
  },
  // Order 003 items
  {
    id: uuidv4(),
    order_id: orderIds[2],
    product_id: productIds[12],
    quantity: 1,
    unit_price: 48.0,
  },
  {
    id: uuidv4(),
    order_id: orderIds[2],
    product_id: productIds[24],
    quantity: 1,
    unit_price: 11.0,
  },
  // Order 004 items
  {
    id: uuidv4(),
    order_id: orderIds[3],
    product_id: productIds[10],
    quantity: 1,
    unit_price: 89.0,
  },
  {
    id: uuidv4(),
    order_id: orderIds[3],
    product_id: productIds[11],
    quantity: 1,
    unit_price: 72.0,
  },
  {
    id: uuidv4(),
    order_id: orderIds[3],
    product_id: productIds[20],
    quantity: 2,
    unit_price: 12.0,
  },
  // Order 005 items
  {
    id: uuidv4(),
    order_id: orderIds[4],
    product_id: productIds[13],
    quantity: 2,
    unit_price: 55.0,
  },
  {
    id: uuidv4(),
    order_id: orderIds[4],
    product_id: productIds[22],
    quantity: 2,
    unit_price: 7.0,
  },
  {
    id: uuidv4(),
    order_id: orderIds[4],
    product_id: productIds[17],
    quantity: 2,
    unit_price: 14.0,
  },
];

export const runSeeds = async () => {
  const db = await getDb();

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
        'INSERT INTO restaurant_tables (id, number, status) VALUES (?, ?, ?)',
        [table.id, table.number, table.status],
      );
    }
    console.log('✓ Mesas inseridas');

    // Inserir pedidos
    for (const order of orders) {
      await db.run(
        `INSERT INTO orders (id, table_id, user_id, status, total, opened_at, closed_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          order.id,
          order.table_id,
          order.user_id,
          order.status,
          order.total,
          order.opened_at.toISOString(),
          order.closed_at?.toISOString() || null,
        ],
      );
    }
    console.log('✓ Pedidos inseridos');

    // Inserir itens do pedido
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

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


const users = [
  {
    id: uuidv4(),
    name: 'Admin Sistema',
    username: 'admin',
    password: 'admin123',
    role: userRole.ADMIN,
  },
  {
    id: uuidv4(),
    name: 'Waiter',
    username: 'waiter',
    password: 'waiter123',
    role: userRole.WAITER,
  }
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

    // Inserir usuários com senhas hasheadas
    for (const user of users) {
      const password_hash = await hashPassword(user.password);
      await db.run(
        `INSERT INTO users (id, name, username, password_hash, role)
         VALUES (?, ?, ?, ?, ?)`,
        [user.id, user.name, user.username, password_hash, user.role],
      );
    }
    console.log('✓ Usuários inseridos');

    console.log('\n✅ Todos os seeds foram inseridos com sucesso!');
  } catch (error) {
    console.error('❌ Erro ao inserir seeds:', error);
    throw error;
  }
};

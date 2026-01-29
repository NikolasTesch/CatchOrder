import { Request, Response } from 'express';
import { hashPassword } from '../utils/passwordHash';
import { UserModel } from '../models/userModel';
import type { CreateUserDTO, UpdateUserDTO } from '../../shared/dtos/userDto';

type IdParam = { id: string };

const userModel = new UserModel();

/**
 * Controller responsável pelas operações relacionadas a usuários
 */
class UsersController {
  /**
   * Lista todos os usuários
   * GET /users
   */
  async index(req: Request, res: Response): Promise<Response> {
    try {
      const users = await userModel.findAll();
      return res.status(200).json({
        message: 'Lista de usuários',
        data: users
      });
    } catch (error) {
      return res.status(500).json({
        message: 'Erro ao listar usuários',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  /**
   * Busca um usuário específico por ID
   * GET /users/:id
   */
  async show(req: Request<IdParam>, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const user = await userModel.findById(id);

      if (!user) {
        return res.status(404).json({ message: 'Usuário não encontrado' });
      }

      return res.status(200).json({
        message: `Usuário com ID ${id}`,
        data: user
      });
    } catch (error) {
      return res.status(500).json({
        message: 'Erro ao buscar usuário',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  /**
   * Cria um novo usuário
   * POST /users
   */
  async store(req: Request, res: Response): Promise<Response> {
    try {
      const { name, username, password, role } = req.body;

      if (!name || !username || !password || !role) {
        return res.status(400).json({ message: 'Todos os campos são obrigatórios' });
      }

      // Check if user already exists
      const existingUser = await userModel.findByUsername(username);
      if (existingUser) {
        return res.status(409).json({ message: 'Usuário já existe' });
      }

      const password_hash = await hashPassword(password);

      const newUser: CreateUserDTO = {
        name,
        username,
        password_hash,
        role
      };

      const userId = await userModel.create(newUser);

      return res.status(201).json({
        message: 'Usuário criado com sucesso',
        data: { id: userId, name, username, role }
      });
    } catch (error) {
      return res.status(500).json({
        message: 'Erro ao criar usuário',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  /**
   * Atualiza um usuário existente
   * PUT /users/:id
   */
  async update(req: Request<IdParam>, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const userData: UpdateUserDTO & { password?: string } = req.body;

      // Prevent password update via this method if not intended, or handle hashing if involved.
      // For now, assuming standard update. If password is included, it should be hashed.
      if (userData.password) {
        userData.password_hash = await hashPassword(userData.password);
        delete userData.password;
      }

      const updated = await userModel.update(id, userData);

      if (!updated) {
        return res.status(404).json({ message: 'Usuário não encontrado ou sem alterações' });
      }

      return res.status(200).json({
        message: `Usuário ${id} atualizado com sucesso`,
        data: userData
      });
    } catch (error) {
      return res.status(500).json({
        message: 'Erro ao atualizar usuário',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  /**
   * Remove um usuário
   * DELETE /users/:id
   */
  async delete(req: Request<IdParam>, res: Response): Promise<Response> {
    try {
      const { id } = req.params;

      const deleted = await userModel.delete(id);

      if (!deleted) {
        return res.status(404).json({ message: 'Usuário não encontrado' });
      }

      return res.status(200).json({
        message: `Usuário ${id} removido com sucesso`
      });
    } catch (error) {
      return res.status(500).json({
        message: 'Erro ao remover usuário',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }
}

// Exporta a classe para testes unitários
export { UsersController };

// Exporta uma instância para uso nas rotas
export default new UsersController();

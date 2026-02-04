import { Request, Response } from 'express';
import { hashPassword } from '../utils/passwordHash';
import { UserModel } from '../models/userModel';
import type { CreateUserDTO, UpdateUserDTO } from '../../shared/dtos/userDto';

import { userRole } from "../../shared/types/user";

type IdParam = { id: string };

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
      const users = await UserModel.findAll();
      return res.status(200).json({
        message: "Lista de usuários",
        data: users,
      });
    } catch (error) {
      return res.status(500).json({
        message: "Erro ao listar usuários",
        error: error instanceof Error ? error.message : "Erro desconhecido",
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
      const user = await UserModel.findById(id);

      if (!user) {
        return res.status(404).json({ message: "Usuário não encontrado" });
      }

      return res.status(200).json({
        message: `Usuário com ID ${id}`,
        data: user,
      });
    } catch (error) {
      return res.status(500).json({
        message: "Erro ao buscar usuário",
        error: error instanceof Error ? error.message : "Erro desconhecido",
      });
    }
  }

  /**
   * Cria um novo usuário
   * POST /users
   */
  async store(req: Request, res: Response): Promise<Response> {
    try {
      const { name, username, password, role, image_url } = req.body;

      // Validate character limits (max 20 characters)
      const CHAR_LIMIT_REGEX = /^.{1,20}$/;
      if (
        !CHAR_LIMIT_REGEX.test(name) ||
        !CHAR_LIMIT_REGEX.test(username) ||
        !CHAR_LIMIT_REGEX.test(password)
      ) {
        return res.status(400).json({
          message: "Nome, usuário e senha devem ter no máximo 20 caracteres.",
        });
      }

      // Check if user already exists
      const existingUser = await UserModel.findByUsername(username);
      if (existingUser) {
        return res.status(409).json({ message: "Usuário já existe" });
      }

      const password_hash = await hashPassword(password);

      const newUser: CreateUserDTO = {
        name,
        username,
        password_hash,
        role,
        image_url,
      };

      const createdUser = await UserModel.create(newUser);

      return res.status(201).json({
        message: "Usuário criado com sucesso",
        data: createdUser,
      });
    } catch (error) {
      return res.status(500).json({
        message: "Erro ao criar usuário",
        error: error instanceof Error ? error.message : "Erro desconhecido",
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
      const currentUser = req.user;

      if (currentUser) {
        // Restriction 1: User cannot change their own role
        if (
          currentUser.id === id &&
          userData.role &&
          userData.role !== currentUser.role
        ) {
          return res.status(403).json({
            message: "Você não pode alterar seu próprio cargo.",
          });
        }


      }

      // Prevent password update via this method if not intended, or handle hashing if involved.
      // For now, assuming standard update. If password is included, it should be hashed.
      if (userData.password) {
        userData.password_hash = await hashPassword(userData.password);
        delete userData.password;
      }

      const updated = await UserModel.update(id, userData);

      if (!updated) {
        return res
          .status(404)
          .json({ message: "Usuário não encontrado ou sem alterações" });
      }

      return res.status(200).json({
        message: `Usuário ${id} atualizado com sucesso`,
        data: userData,
      });
    } catch (error) {
      return res.status(500).json({
        message: "Erro ao atualizar usuário",
        error: error instanceof Error ? error.message : "Erro desconhecido",
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

      const deleted = await UserModel.delete(id);

      if (!deleted) {
        return res.status(404).json({ message: "Usuário não encontrado" });
      }

      return res.status(200).json({
        message: `Usuário ${id} removido com sucesso`,
      });
    } catch (error) {
      return res.status(500).json({
        message: "Erro ao remover usuário",
        error: error instanceof Error ? error.message : "Erro desconhecido",
      });
    }
  }
}

// Exporta a classe para testes unitários
export { UsersController };

// Exporta uma instância para uso nas rotas
export default new UsersController();

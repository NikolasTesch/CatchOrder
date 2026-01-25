import { Request, Response } from 'express';
import usersController from '../../src/backend/controllers/users.controller';

/**
 * Testes unitários para o UsersController
 * 
 * Estes testes verificam o comportamento de cada método do controller
 * de forma isolada, usando mocks para Request e Response do Express.
 */

describe('UsersController', () => {
  // Mock de Request e Response
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let responseObject: any;

  // Executado antes de cada teste
  beforeEach(() => {
    // Cria um objeto de resposta simulado
    responseObject = {
      message: '',
      data: null,
      error: ''
    };

    // Mock do Request
    mockRequest = {
      params: {},
      body: {}
    };

    // Mock do Response
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnValue(responseObject)
    };
  });

  /**
   * Testes do método index() - Listar todos os usuários
   */
  describe('index - Listar usuários', () => {
    it('deve retornar status 200 e uma lista vazia de usuários', async () => {
      await usersController.index(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Lista de usuários',
        data: []
      });
    });
  });

  /**
   * Testes do método show() - Buscar usuário por ID
   */
  describe('show - Buscar usuário por ID', () => {
    it('deve retornar status 200 e dados do usuário solicitado', async () => {
      mockRequest.params = { id: '123' };

      await usersController.show(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Usuário com ID 123',
        data: null
      });
    });

    it('deve extrair corretamente o ID dos params', async () => {
      mockRequest.params = { id: 'abc-456' };

      await usersController.show(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Usuário com ID abc-456'
        })
      );
    });
  });

  /**
   * Testes do método store() - Criar novo usuário
   */
  describe('store - Criar usuário', () => {
    it('deve retornar status 201 ao criar um usuário', async () => {
      const userData = {
        name: 'João Silva',
        email: 'joao@example.com'
      };

      mockRequest.body = userData;

      await usersController.store(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Usuário criado com sucesso',
        data: userData
      });
    });

    it('deve retornar os mesmos dados enviados no body', async () => {
      const userData = {
        name: 'Maria',
        email: 'maria@test.com',
        role: 'admin'
      };

      mockRequest.body = userData;

      await usersController.store(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          data: userData
        })
      );
    });
  });

  /**
   * Testes do método update() - Atualizar usuário
   */
  describe('update - Atualizar usuário', () => {
    it('deve retornar status 200 ao atualizar um usuário', async () => {
      const userData = {
        name: 'João Silva Atualizado',
        email: 'joao.novo@example.com'
      };

      mockRequest.params = { id: '123' };
      mockRequest.body = userData;

      await usersController.update(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Usuário 123 atualizado com sucesso',
        data: userData
      });
    });

    it('deve usar o ID correto na mensagem de resposta', async () => {
      mockRequest.params = { id: 'user-789' };
      mockRequest.body = { name: 'Teste' };

      await usersController.update(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Usuário user-789 atualizado com sucesso'
        })
      );
    });
  });

  /**
   * Testes do método delete() - Remover usuário
   */
  describe('delete - Remover usuário', () => {
    it('deve retornar status 200 ao remover um usuário', async () => {
      mockRequest.params = { id: '123' };

      await usersController.delete(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Usuário 123 removido com sucesso'
      });
    });

    it('deve usar o ID correto na mensagem de resposta', async () => {
      mockRequest.params = { id: 'delete-456' };

      await usersController.delete(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Usuário delete-456 removido com sucesso'
        })
      );
    });
  });
});

import { Request, Response } from 'express';
import { getDb } from '../config/database';
import { verifyPassword } from '../utils/passwordHash';
import jwt from 'jsonwebtoken';

class AuthController {
  async login(req: Request, res: Response): Promise<Response> {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        return res.status(400).json({ message: 'Username e password são obrigatórios' });
      }

      const db = await getDb();
      const user = await db.get('SELECT * FROM users WHERE username = ?', [username]);

      if (!user) {
        return res.status(401).json({ message: 'Credenciais inválidas' });
      }

      const isPasswordValid = await verifyPassword(password, user.password_hash);

      if (!isPasswordValid) {
        return res.status(401).json({ message: 'Credenciais inválidas' });
      }

      const secret = process.env.JWT_SECRET;

      if (!secret) {
        console.error('JWT_SECRET is not defined');
        return res.status(500).json({ message: 'Erro interno do servidor' });
      }

      const token = jwt.sign(
        { id: user.id, email: user.username, role: user.role },
        secret,
        { expiresIn: '1h' }
      );


      const { password_hash, ...userSafe } = user;


      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 3600000 // 1 hora
      });

      return res.status(200).json({
        message: 'Login realizado com sucesso',
        token,
        user: userSafe,
      });
    } catch (error) {
      console.error("Login error:", error);
      return res.status(500).json({
        message: "Erro ao realizar login",
        error: error instanceof Error ? error.message : "Erro desconhecido",
      });
    }
  }


  async logout(req: Request, res: Response): Promise<Response> {
    try {
      res.clearCookie("token", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
      });

      return res.status(200).json({
        message: "Logout realizado com sucesso",
      });
    } catch (error) {
      console.error("Logout error:", error);
      return res.status(500).json({
        message: "Erro ao realizar logout",
        error: error instanceof Error ? error.message : "Erro desconhecido",
      });
    }
  }

  async me(req: Request, res: Response): Promise<Response> {
    try {

      if (!req.user) {
        return res.status(401).json({ message: "Usuário não autenticado" });
      }

      // Busca os dados completos do usuário no banco
      const db = await getDb();
      const user = await db.get(
        "SELECT id, name, username, role, created_at, updated_at FROM users WHERE id = ?",
        [req.user.id],
      );

      if (!user) {
        return res.status(404).json({ message: "Usuário não encontrado" });
      }

      return res.status(200).json({
        message: "Dados do usuário recuperados com sucesso",
        user,
      });
    } catch (error) {
      console.error("Me error:", error);
      return res.status(500).json({
        message: "Erro ao buscar dados do usuário",
        error: error instanceof Error ? error.message : "Erro desconhecido",
      });
    }
  }
}

export default new AuthController();

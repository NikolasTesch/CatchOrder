import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UserPayload } from '../../shared/types/user';

export const authenticateToken = (req: Request, res: Response, next: NextFunction): void => {
  const token = req.cookies.token || req.headers['authorization']?.split(' ')[1];

  if (!token) {
    res.status(401).json({ message: 'Access denied. No token provided.' });
    return;
  }

  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      console.error('JWT_SECRET is not defined in environment variables.');
      res.status(500).json({ message: 'Internal Server Error' });
      return;
    }

    const decoded = jwt.verify(token, secret) as UserPayload;
    req.user = decoded;
    next();
  } catch (error) {
    res.status(403).json({ message: 'Invalid token.' });
    return;
  }
};

export const authenticatePage = (req: Request, res: Response, next: NextFunction): void => {
  const token = req.cookies.token;

  if (!token) {
    res.redirect('landingPage.html');
    return;
  }

  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      console.error('JWT_SECRET is not defined');
      res.status(500).send('Internal Server Error');
      return;
    }

    jwt.verify(token, secret);
    next();
  } catch (error) {
    res.redirect('landingPage.html');
    return;
  }
};

import { Request, Response, NextFunction } from 'express';
import { userRole } from '../../shared/types/user';

export const requireRole = (...allowedRoles: userRole[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const user = req.user;

    if (!user) {
      res
        .status(401)
        .json({ message: 'Access denied. No user authenticated.' });
      return;
    }

    if (!allowedRoles.includes(user.role)) {
      res.status(403).json({ message: 'Forbidden. Insufficient permissions.' });
      return;
    }

    next();
  };
};

export const isAdmin = requireRole(userRole.ADMIN);
export const isManager = requireRole(userRole.MANAGER);
export const isWaiter = requireRole(userRole.WAITER);
export const isAdminOrManager = requireRole(userRole.ADMIN, userRole.MANAGER);

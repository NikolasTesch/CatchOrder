import { body, param, query, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';

/**
 * Middleware de validação de inputs
 * Usa express-validator para validar e sanitizar dados
 * 
 * Best Practice: Sempre validar inputs do usuário
 */

/**
 * Validações para criação de usuário
 */
export const validateUserCreation = [
  body('name')
    .trim()
    .notEmpty().withMessage('Nome é obrigatório')
    .isLength({ min: 2, max: 100 }).withMessage('Nome deve ter entre 2 e 100 caracteres')
    .matches(/^[a-zA-ZÀ-ÿ\s]+$/).withMessage('Nome deve conter apenas letras'),
  
  body('email')
    .trim()
    .notEmpty().withMessage('Email é obrigatório')
    .isEmail().withMessage('Email inválido')
    .normalizeEmail()
    .isLength({ max: 255 }).withMessage('Email muito longo'),
  
  body('password')
    .optional()
    .isLength({ min: 8 }).withMessage('Senha deve ter no mínimo 8 caracteres')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Senha deve conter maiúscula, minúscula, número e caractere especial'),
  
  body('phone')
    .optional()
    .trim()
    .matches(/^[\d\s\-\+\(\)]+$/).withMessage('Telefone inválido'),
  
  handleValidationErrors,
];

/**
 * Validações para atualização de usuário
 */
export const validateUserUpdate = [
  param('id')
    .trim()
    .notEmpty().withMessage('ID é obrigatório')
    .isLength({ min: 1, max: 50 }).withMessage('ID inválido'),
  
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 }).withMessage('Nome deve ter entre 2 e 100 caracteres')
    .matches(/^[a-zA-ZÀ-ÿ\s]+$/).withMessage('Nome deve conter apenas letras'),
  
  body('email')
    .optional()
    .trim()
    .isEmail().withMessage('Email inválido')
    .normalizeEmail()
    .isLength({ max: 255 }).withMessage('Email muito longo'),
  
  body('phone')
    .optional()
    .trim()
    .matches(/^[\d\s\-\+\(\)]+$/).withMessage('Telefone inválido'),
  
  handleValidationErrors,
];

/**
 * Validações para ID de recurso
 */
export const validateResourceId = [
  param('id')
    .trim()
    .notEmpty().withMessage('ID é obrigatório')
    .isLength({ min: 1, max: 50 }).withMessage('ID inválido')
    .matches(/^[a-zA-Z0-9\-_]+$/).withMessage('ID contém caracteres inválidos'),
  
  handleValidationErrors,
];

/**
 * Validações para paginação
 */
export const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1, max: 10000 }).withMessage('Página deve ser um número entre 1 e 10000')
    .toInt(),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage('Limite deve ser um número entre 1 e 100')
    .toInt(),
  
  query('sort')
    .optional()
    .trim()
    .isIn(['asc', 'desc', 'ASC', 'DESC']).withMessage('Ordenação deve ser asc ou desc'),
  
  handleValidationErrors,
];

/**
 * Validações para busca/filtros
 */
export const validateSearch = [
  query('search')
    .optional()
    .trim()
    .isLength({ min: 1, max: 200 }).withMessage('Termo de busca muito longo')
    .escape(), // Escapa caracteres HTML
  
  query('filter')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('Filtro muito longo'),
  
  handleValidationErrors,
];

/**
 * Middleware para processar erros de validação
 */
function handleValidationErrors(req: Request, res: Response, next: NextFunction) {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: {
        message: 'Erro de validação',
        statusCode: 400,
        details: errors.array().map(err => ({
          field: err.type === 'field' ? (err as any).path : 'unknown',
          message: err.msg,
        })),
      },
    });
  }
  
  next();
}

/**
 * Validação customizada para arquivos de upload
 */
export const validateFileUpload = (req: Request, res: Response, next: NextFunction) => {
  if (!req.file) {
    return next();
  }

  const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'];
  const maxSize = 5 * 1024 * 1024; // 5MB

  if (!allowedMimeTypes.includes(req.file.mimetype)) {
    return res.status(400).json({
      success: false,
      error: {
        message: 'Tipo de arquivo não permitido',
        allowedTypes: allowedMimeTypes,
      },
    });
  }

  if (req.file.size > maxSize) {
    return res.status(400).json({
      success: false,
      error: {
        message: 'Arquivo muito grande',
        maxSize: '5MB',
      },
    });
  }

  next();
};

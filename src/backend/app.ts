import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { usersRoutes } from './routes/usersRoutes';
import { errorHandler } from './middlewares/errorHandler';
import { corsConfig, helmetConfig, customSecurityHeaders } from './config/security';
import { generalLimiter } from './middlewares/rateLimiter';
import { 
  sanitizeData, 
  preventParameterPollution, 
  sanitizeInput,
  payloadSizeLimit 
} from './middlewares/sanitization';
import { requestLogger, logSuspiciousActivity } from './middlewares/securityLogger';

const app = express();

/**
 * Middlewares de Segurança - Camada 1: Headers e Proteções Base
 * 
 * ORDEM CRÍTICA - NÃO ALTERAR!
 * 1. Helmet - Headers de segurança HTTP
 * 2. CORS - Controle de acesso cross-origin
 * 3. Custom Security Headers - Headers adicionais
 * 4. Rate Limiting - Proteção contra DDoS
 * 5. Request Logging - Auditoria
 */

// 1. Helmet - Proteção contra vulnerabilidades web comuns
app.use(helmet(helmetConfig));

// 2. CORS - Configurado com origens permitidas específicas
app.use(cors(corsConfig));

// 3. Headers de segurança customizados
app.use(customSecurityHeaders);

// 4. Rate Limiting - Proteção contra força bruta e DDoS
app.use(generalLimiter);

// 5. Logging de requisições e atividades suspeitas
app.use(requestLogger);
app.use(logSuspiciousActivity);

/**
 * Middlewares de Segurança - Camada 2: Sanitização e Validação
 */

// Validação de tamanho do payload
app.use(payloadSizeLimit);

// Middlewares de parsing com limite de tamanho
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Sanitização contra NoSQL Injection
app.use(sanitizeData);

// Proteção contra HTTP Parameter Pollution
app.use(preventParameterPollution);

// Sanitização de inputs (XSS prevention)
app.use(sanitizeInput);

/**
 * Rotas da aplicação
 */
app.use('/users', usersRoutes);

/**
 * Middleware de tratamento de erros (DEVE ser o último)
 */
app.use(errorHandler);

export { app };

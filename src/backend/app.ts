import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { routes } from './routes';
import { staticRoutes } from './routes/staticRoutes';
import { securityHeaders } from './middlewares/securityHeaders';
import {
  generalRateLimiter,
  mutationRateLimiter,
} from './middlewares/rateLimiter';
import { hppProtection } from './middlewares/hppProtection';
import { sanitizeInput } from './middlewares/sanitizeInput';

const app = express();

// 1. Security Headers (primeiro - protege toda resposta)
app.use(securityHeaders);

// 2. Middleware: Normalize URL to remove double slashes (Fix for proxy issues)
app.use((req, res, next) => {
  if (req.url.startsWith('//')) {
    req.url = req.url.replace(/^\/+/, '/');
  }
  next();
});

// Security: CORS configuration
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'https://lab.alphaedtech.org.br',
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, Postman)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  }),
);

// 4. Rate Limiting (antes de processar requisições)
// app.use('/api/', generalRateLimiter);
// app.use('/api/', mutationRateLimiter);

// 5. HPP Protection (antes de sanitizar)
app.use(hppProtection);

// 6. Sanitize Input (antes de parsear JSON)
app.use(sanitizeInput);

// 7. Body Parser com limite de tamanho
app.use(express.json({ limit: '50kb' }));
app.use(cookieParser());

app.use(staticRoutes);
app.use('/api', routes);

export { app };

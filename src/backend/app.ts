import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { routes } from './routes';
import { staticRoutes } from './routes/staticRoutes';

const app = express();

// Security: iFrame protection
app.use((req, res, next) => {
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  next();
});

// Middleware: Normalize URL to remove double slashes (Fix for proxy issues)
app.use((req, res, next) => {
  if (req.url.startsWith('//')) {
    req.url = req.url.replace(/^\/+/, '/');
  }
  next();
});

// Security: CORS configuration
const allowedOrigins = ['http://localhost:3000', 'http://localhost:3001', 'https://lab.alphaedtech.org.br'];

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

// Middlewares
app.use(express.json());
app.use(cookieParser());

app.use(staticRoutes);
app.use('/api', routes);

export { app };

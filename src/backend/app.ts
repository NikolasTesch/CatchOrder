import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { usersRoutes } from './routes/users.routes';
import { errorHandler } from './middlewares/errorHandler';

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(cookieParser());

// Rotas
app.use('/users', usersRoutes);

// Middleware de tratamento de erros (DEVE ser o último)
app.use(errorHandler);

export { app };

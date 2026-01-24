import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(cookieParser());

export { app };

import dotenv from 'dotenv';
import { app } from './app';
import { runMigrations } from './database/migrations/migrations';

dotenv.config();

const PORT = process.env.PORT || 3000;

const startServer = async () => {
    try {
        await runMigrations();

        app.listen(PORT, () => {
            console.log(`Servidor rodando na porta ${PORT}`);
            console.log(`Acesse: http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error('Erro ao iniciar servidor:', error);
    }
};

startServer();
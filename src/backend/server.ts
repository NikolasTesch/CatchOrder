import 'dotenv/config';
import { app } from './app';
import { runMigrations } from './database/migrations/migrations';


const PORT = process.env.PORT || 3000;
console.log('Ambiente carregado. BASE_PATH:', process.env.BASE_PATH);

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
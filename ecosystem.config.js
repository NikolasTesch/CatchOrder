module.exports = {
    apps: [{
        name: "desafio-restaurante",
        script: "./dist/backend/server.js",
        instances: 1,
        autorestart: true,
        watch: false,
        max_memory_restart: '1G',
        env: {
            NODE_ENV: "production",
            // O BASE_PATH será lido do arquivo .env, mas pode ser forçado aqui se necessário
            // BASE_PATH: "/server09" 
        }
    }]
};

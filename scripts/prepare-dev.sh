#!/bin/bash

echo "🧹 Limpando banco de dados antigo..."
rm -f src/backend/database/restaurante.sqlite

echo "🏗️  Compilando frontend..."
npm run build:front

echo "✅ Preparação concluída!"
echo "🚀 Iniciando servidor de desenvolvimento..."

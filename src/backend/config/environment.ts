/**
 * Configuração centralizada de variáveis de ambiente
 * 
 * Best Practices:
 * - Nunca commitar .env no Git
 * - Sempre validar variáveis no startup
 * - Usar valores default seguros
 * - Documentar todas as variáveis necessárias
 */

import dotenv from 'dotenv';

// Carrega variáveis de ambiente do arquivo .env
dotenv.config();

interface EnvironmentConfig {
  // Server
  NODE_ENV: string;
  PORT: number;
  HOST: string;
  
  // Security
  JWT_SECRET: string;
  JWT_EXPIRES_IN: string;
  BCRYPT_ROUNDS: number;
  
  // Database
  DB_TYPE: string;
  DB_PATH: string;
  
  // CORS
  CORS_ORIGIN: string[];
  
  // Rate Limiting
  RATE_LIMIT_WINDOW: number;
  RATE_LIMIT_MAX_REQUESTS: number;
  
  // Logging
  LOG_LEVEL: string;
  LOG_FILE_PATH: string;
}

/**
 * Valida e carrega variáveis de ambiente
 */
function loadEnvironment(): EnvironmentConfig {
  // Validação de variáveis críticas
  const requiredVars = ['NODE_ENV'];
  const missing = requiredVars.filter(varName => !process.env[varName]);
  
  if (missing.length > 0) {
    console.warn(`⚠️  Variáveis de ambiente ausentes: ${missing.join(', ')}`);
  }

  return {
    // Server
    NODE_ENV: process.env.NODE_ENV || 'development',
    PORT: parseInt(process.env.PORT || '3000', 10),
    HOST: process.env.HOST || '0.0.0.0',
    
    // Security
    JWT_SECRET: process.env.JWT_SECRET || 'change-me-in-production-' + Math.random().toString(36),
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
    BCRYPT_ROUNDS: parseInt(process.env.BCRYPT_ROUNDS || '10', 10),
    
    // Database
    DB_TYPE: process.env.DB_TYPE || 'sqlite',
    DB_PATH: process.env.DB_PATH || './database/database.sqlite',
    
    // CORS
    CORS_ORIGIN: process.env.CORS_ORIGIN 
      ? process.env.CORS_ORIGIN.split(',')
      : ['http://localhost:3000', 'http://localhost:3001'],
    
    // Rate Limiting
    RATE_LIMIT_WINDOW: parseInt(process.env.RATE_LIMIT_WINDOW || '900000', 10), // 15 min
    RATE_LIMIT_MAX_REQUESTS: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
    
    // Logging
    LOG_LEVEL: process.env.LOG_LEVEL || 'info',
    LOG_FILE_PATH: process.env.LOG_FILE_PATH || './logs/app.log',
  };
}

/**
 * Valida a segurança da configuração em produção
 */
function validateProductionSecurity(config: EnvironmentConfig): void {
  if (config.NODE_ENV === 'production') {
    const warnings: string[] = [];
    
    // Verifica JWT_SECRET
    if (config.JWT_SECRET.includes('change-me') || config.JWT_SECRET.length < 32) {
      warnings.push('JWT_SECRET deve ser uma string forte em produção (mínimo 32 caracteres)');
    }
    
    // Verifica CORS
    if (config.CORS_ORIGIN.includes('http://localhost')) {
      warnings.push('CORS_ORIGIN não deve incluir localhost em produção');
    }
    
    // Verifica BCRYPT_ROUNDS
    if (config.BCRYPT_ROUNDS < 10) {
      warnings.push('BCRYPT_ROUNDS deve ser no mínimo 10 em produção');
    }
    
    if (warnings.length > 0) {
      console.error('❌ CONFIGURAÇÃO DE SEGURANÇA INADEQUADA PARA PRODUÇÃO:');
      warnings.forEach(warning => console.error(`   - ${warning}`));
      process.exit(1);
    }
  }
}

// Carrega e valida configuração
export const env = loadEnvironment();

// Valida segurança em produção
validateProductionSecurity(env);

// Log de inicialização
console.log(`🔧 Ambiente: ${env.NODE_ENV}`);
console.log(`🔧 Porta: ${env.PORT}`);
console.log(`🔧 Database: ${env.DB_TYPE} (${env.DB_PATH})`);
console.log(`🔧 CORS Origins: ${env.CORS_ORIGIN.join(', ')}`);

// Exporta para uso em outros módulos
export default env;

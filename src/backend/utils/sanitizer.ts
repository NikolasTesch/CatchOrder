/**
 * Utilitário de sanitização de input customizado
 * Protege contra XSS e SQL Injection (SQLite)
 */

/**
 * Escapa caracteres HTML perigosos
 */
export function escapeHTML(str: string): string {
  if (typeof str !== 'string') return str;

  const htmlEscapeMap: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
  };

  return str.replace(/[&<>"'/]/g, (char) => htmlEscapeMap[char]);
}

/**
 * Remove tags HTML e scripts de uma string
 */
export function stripHTML(str: string): string {
  if (typeof str !== 'string') return str;

  // Remove tags HTML
  let cleaned = str.replace(/<[^>]*>/g, '');

  // Remove event handlers (onclick, onerror, etc)
  cleaned = cleaned.replace(/on\w+\s*=\s*["'][^"']*["']/gi, '');

  // Remove javascript: protocol
  cleaned = cleaned.replace(/javascript:/gi, '');

  return cleaned;
}

/**
 * Sanitiza string removendo caracteres perigosos para SQL
 * Adaptado para SQLite
 */
export function sanitizeSQL(str: string): string {
  if (typeof str !== 'string') return str;

  // Remove ou escapa caracteres perigosos para SQL injection
  // Nota: O ideal é usar prepared statements (que o projeto já usa)
  // Esta é uma camada adicional de proteção

  // Remove comentários SQL
  let cleaned = str.replace(/--/g, '');
  cleaned = cleaned.replace(/\/\*/g, '');
  cleaned = cleaned.replace(/\*\//g, '');

  // Remove múltiplos espaços
  cleaned = cleaned.replace(/\s+/g, ' ');

  // Remove ponto e vírgula no final (previne múltiplas queries)
  cleaned = cleaned.replace(/;\s*$/g, '');

  return cleaned;
}

/**
 * Previne SQL Injection removendo padrões perigosos
 * Específico para SQLite
 */
export function preventSQLInjection(obj: any): any {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (typeof obj === 'string') {
    // Remove padrões perigosos de SQL injection
    let cleaned = obj;

    // Remove UNION attacks
    cleaned = cleaned.replace(/\bUNION\b/gi, '');

    // Remove comandos SQL perigosos
    const dangerousPatterns = [
      /\bDROP\s+TABLE\b/gi,
      /\bDELETE\s+FROM\b/gi,
      /\bINSERT\s+INTO\b/gi,
      /\bUPDATE\s+\w+\s+SET\b/gi,
      /\bEXEC\b/gi,
      /\bEXECUTE\b/gi,
      /\bALTER\s+TABLE\b/gi,
      /\bCREATE\s+TABLE\b/gi,
      /\bTRUNCATE\b/gi,
    ];

    for (const pattern of dangerousPatterns) {
      cleaned = cleaned.replace(pattern, '');
    }

    return cleaned;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => preventSQLInjection(item));
  }

  if (typeof obj === 'object') {
    const sanitized: any = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        // Sanitiza a chave também
        const sanitizedKey = preventSQLInjection(key);
        sanitized[sanitizedKey] = preventSQLInjection(obj[key]);
      }
    }
    return sanitized;
  }

  return obj;
}

/**
 * Sanitiza uma string removendo caracteres perigosos
 */
export function sanitizeString(input: string): string {
  if (typeof input !== 'string') return input;

  // Remove tags HTML
  let sanitized = stripHTML(input);

  // Escapa caracteres HTML restantes
  sanitized = escapeHTML(sanitized);

  // Remove null bytes
  sanitized = sanitized.replace(/\0/g, '');

  return sanitized.trim();
}

/**
 * Sanitiza recursivamente um objeto
 */
export function sanitizeObject(obj: any): any {
  if (obj === null || obj === undefined) {
    return obj;
  }

  // Tipos primitivos que não precisam sanitização
  if (typeof obj === 'number' || typeof obj === 'boolean') {
    return obj;
  }

  if (typeof obj === 'string') {
    return sanitizeString(obj);
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => sanitizeObject(item));
  }

  if (typeof obj === 'object') {
    const sanitized: any = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        // Sanitiza a chave
        const sanitizedKey = sanitizeString(key);
        // Sanitiza o valor
        sanitized[sanitizedKey] = sanitizeObject(obj[key]);
      }
    }
    return sanitized;
  }

  return obj;
}

/**
 * Valida e sanitiza URL
 */
export function sanitizeURL(url: string): string | null {
  if (typeof url !== 'string') return null;

  try {
    const parsed = new URL(url);

    // Apenas permite http e https
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return null;
    }

    return parsed.toString();
  } catch {
    return null;
  }
}

/**
 * Remove caracteres de controle e não-printáveis
 */
export function removeControlCharacters(str: string): string {
  if (typeof str !== 'string') return str;

  // Remove caracteres de controle (exceto newline, tab, carriage return)
  return str.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
}

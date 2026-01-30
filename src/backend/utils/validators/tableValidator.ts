import { TableStatus } from '../../../shared/types/table';

// Validação de Mesa
export interface Table {
  number: number;
}

export interface TableCreationData {
  number: number;
  status?: TableStatus;
}

export interface TableUpdateData {
  number?: number;
  status?: TableStatus;
}

export class TableValidator {
  static validate(table: Table): { valido: boolean; error: string[] } {
    const error: string[] = [];

    if (table.number === undefined || table.number === null) {
      error.push('Número da mesa é obrigatório');
    } else if (!Number.isInteger(table.number)) {
      error.push('Número da mesa deve ser um número inteiro');
    } else if (table.number <= 0) {
      error.push('Número da mesa deve ser um número positivo');
    }

    return {
      valido: error.length === 0,
      error,
    };
  }

  static validateCreation(table: any): { valido: boolean; error: string[] } {
    const error: string[] = [];

    // Validar number (obrigatório)
    if (table.number === undefined || table.number === null) {
      error.push('Número da mesa é obrigatório');
    } else {
      const number = Number(table.number);
      if (!Number.isInteger(number)) {
        error.push('Número da mesa deve ser um número inteiro');
      } else if (number <= 0) {
        error.push('Número da mesa deve ser um número positivo');
      } else if (number > 9999) {
        error.push('Número da mesa deve ser menor que 10000');
      }
    }

    // Validar status (opcional)
    if (table.status !== undefined) {
      if (!Object.values(TableStatus).includes(table.status)) {
        error.push('Status deve ser AVAILABLE, OCCUPIED ou RESERVED');
      }
    }

    return {
      valido: error.length === 0,
      error,
    };
  }

  static validateUpdate(table: any): { valido: boolean; error: string[] } {
    const error: string[] = [];

    // Validar number (opcional)
    if (table.number !== undefined) {
      const number = Number(table.number);
      if (!Number.isInteger(number)) {
        error.push('Número da mesa deve ser um número inteiro');
      } else if (number <= 0) {
        error.push('Número da mesa deve ser um número positivo');
      } else if (number > 9999) {
        error.push('Número da mesa deve ser menor que 10000');
      }
    }

    // Validar status (opcional)
    if (table.status !== undefined) {
      if (!Object.values(TableStatus).includes(table.status)) {
        error.push('Status deve ser AVAILABLE, OCCUPIED ou RESERVED');
      }
    }

    return {
      valido: error.length === 0,
      error,
    };
  }
}

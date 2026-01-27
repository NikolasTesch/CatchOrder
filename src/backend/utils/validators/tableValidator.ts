// Validação de Mesa
export interface Table {
  number: number;
}

export class TableValidator {
  static validate(table: Table): { valido: boolean; error: string[] } {
    const error: string[] = [];

    if (table.number === undefined || table.number === null) {
      error.push("Número da mesa é obrigatório");
    } else if (!Number.isInteger(table.number)) {
      error.push("Número da mesa deve ser um número inteiro");
    } else if (table.number <= 0) {
      error.push("Número da mesa deve ser um número positivo");
    }

    return {
      valido: error.length === 0,
      error,
    };
  }
}


// Validação de Categoria
export interface Category {
  name: string;
}

export interface CategoryCreationData {
  name: string;
}

export interface CategoryUpdateData {
  name?: string;
}

export class CategoryValidator {
  static validateCreation(category: any): { valido: boolean; error: string[] } {
    const error: string[] = [];

    // Validar name (obrigatório)
    if (!category.name || typeof category.name !== 'string') {
      error.push('Nome da categoria é obrigatório');
    } else if (category.name.trim().length === 0) {
      error.push('Nome da categoria não pode ser vazio');
    } else if (category.name.trim().length < 3) {
      error.push('Nome da categoria deve ter pelo menos 3 caracteres');
    } else if (category.name.trim().length > 20) {
      error.push('Nome da categoria deve ter no máximo 20 caracteres');
    }

    return {
      valido: error.length === 0,
      error,
    };
  }

  static validateUpdate(category: any): { valido: boolean; error: string[] } {
    const error: string[] = [];

    // Validar name (opcional)
    if (category.name !== undefined) {
      if (
        typeof category.name !== 'string' ||
        category.name.trim().length === 0
      ) {
        error.push('Nome da categoria não pode ser vazio');
      } else if (category.name.trim().length < 3) {
        error.push('Nome da categoria deve ter pelo menos 3 caracteres');
      } else if (category.name.trim().length > 20) {
        error.push('Nome da categoria deve ter no máximo 20 caracteres');
      }
    }

    return {
      valido: error.length === 0,
      error,
    };
  }
}

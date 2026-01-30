// Validação de Produto
export interface Product {
  name: string;
  description: string;
  price: number;
  category: string;
  active: boolean;
}

export interface ProductCreationData {
  category_id: string;
  name: string;
  description: string;
  price: number;
  image_path?: string;
  is_active?: boolean;
}

export interface ProductUpdateData {
  category_id?: string;
  name?: string;
  description?: string;
  price?: number;
  image_path?: string;
  is_active?: boolean;
}

export class ProductValidator {
  static validate(product: Product): { valido: boolean; error: string[] } {
    const error: string[] = [];

    if (!product.name || product.name.trim().length === 0) {
      error.push('Nome é obrigatório');
    } else if (product.name.trim().length < 3) {
      error.push('Nome deve ter pelo menos 3 caracteres');
    } else if (product.name.trim().length > 100) {
      error.push('Nome deve ter no máximo 100 caracteres');
    }

    if (!product.description || product.description.trim().length === 0) {
      error.push('Descrição é obrigatória');
    } else if (product.description.trim().length < 3) {
      error.push('Descrição deve ter pelo menos 3 caracteres');
    }

    if (product.price === undefined || product.price === null) {
      error.push('Preço é obrigatório');
    } else if (product.price <= 0) {
      error.push('Preço deve ser maior que 0');
    } else if (!Number.isFinite(product.price)) {
      error.push('Preço deve ser um número');
    } else if (!Number.isInteger(product.price)) {
      error.push('Preço deve ser um número inteiro (em centavos)');
    }

    if (!product.category || product.category.trim().length === 0) {
      error.push('Categoria é obrigatória');
    } else if (product.category.trim().length < 3) {
      error.push('Categoria deve ter pelo menos 3 caracteres');
    }

    if (typeof product.active !== 'boolean') {
      error.push('Ativo é obrigatório');
    }

    return {
      valido: error.length === 0,
      error,
    };
  }

  static validateCreation(data: any): { valido: boolean; error: string[] } {
    const error: string[] = [];

    if (!data.category_id || typeof data.category_id !== 'string') {
      error.push('Category ID é obrigatório');
    }

    if (!data.name || data.name.trim().length === 0) {
      error.push('Nome é obrigatório');
    } else if (data.name.trim().length < 3) {
      error.push('Nome deve ter pelo menos 3 caracteres');
    } else if (data.name.trim().length > 100) {
      error.push('Nome deve ter no máximo 100 caracteres');
    }

    if (!data.description || data.description.trim().length === 0) {
      error.push('Descrição é obrigatória');
    } else if (data.description.trim().length < 3) {
      error.push('Descrição deve ter pelo menos 3 caracteres');
    }

    if (data.price === undefined || data.price === null) {
      error.push('Preço é obrigatório');
    } else if (typeof data.price !== 'number' || data.price <= 0) {
      error.push('Preço deve ser maior que 0');
    } else if (!Number.isInteger(data.price)) {
      error.push('Preço deve ser um número inteiro (em centavos)');
    }

    return {
      valido: error.length === 0,
      error,
    };
  }

  static validateUpdate(data: any): { valido: boolean; error: string[] } {
    const error: string[] = [];

    if (data.name !== undefined) {
      if (data.name.trim().length < 3) {
        error.push('Nome deve ter pelo menos 3 caracteres');
      } else if (data.name.trim().length > 100) {
        error.push('Nome deve ter no máximo 100 caracteres');
      }
    }

    if (data.description !== undefined) {
      if (data.description.trim().length < 3) {
        error.push('Descrição deve ter pelo menos 3 caracteres');
      }
    }

    if (data.price !== undefined) {
      if (typeof data.price !== 'number' || data.price <= 0) {
        error.push('Preço deve ser maior que 0');
      } else if (!Number.isInteger(data.price)) {
        error.push('Preço deve ser um número inteiro (em centavos)');
      }
    }

    if (data.category_id !== undefined && typeof data.category_id !== 'string') {
      error.push('Category ID inválido');
    }

    return {
      valido: error.length === 0,
      error,
    };
  }
}

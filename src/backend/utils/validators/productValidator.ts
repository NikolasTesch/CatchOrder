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

  static validateCreation(product: any): { valido: boolean; error: string[] } {
    const error: string[] = [];

    // Validar category_id (UUID)
    if (!product.category_id || typeof product.category_id !== 'string') {
      error.push('ID da categoria é obrigatório');
    } else {
      const uuidRegex =
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(product.category_id)) {
        error.push('ID da categoria deve ser um UUID válido');
      }
    }

    // Validar name
    if (!product.name || typeof product.name !== 'string') {
      error.push('Nome é obrigatório');
    } else if (product.name.trim().length < 3) {
      error.push('Nome deve ter pelo menos 3 caracteres');
    } else if (product.name.trim().length > 100) {
      error.push('Nome deve ter no máximo 100 caracteres');
    }

    // Validar description
    if (!product.description || typeof product.description !== 'string') {
      error.push('Descrição é obrigatória');
    } else if (product.description.trim().length < 3) {
      error.push('Descrição deve ter pelo menos 3 caracteres');
    } else if (product.description.trim().length > 500) {
      error.push('Descrição deve ter no máximo 500 caracteres');
    }

    // Validar price
    if (product.price === undefined || product.price === null) {
      error.push('Preço é obrigatório');
    } else {
      const price = Number(product.price);
      if (isNaN(price) || !Number.isFinite(price)) {
        error.push('Preço deve ser um número válido');
      } else if (price <= 0) {
        error.push('Preço deve ser maior que 0');
      }
    }

    // Validar is_active (opcional, padrão true)
    if (
      product.is_active !== undefined &&
      typeof product.is_active !== 'boolean'
    ) {
      error.push("Campo 'is_active' deve ser um booleano");
    }

    // Validar image_path (opcional)
    if (
      product.image_path !== undefined &&
      typeof product.image_path !== 'string'
    ) {
      error.push('Caminho da imagem deve ser uma string');
    }

    return {
      valido: error.length === 0,
      error,
    };
  }

  static validateUpdate(product: any): { valido: boolean; error: string[] } {
    const error: string[] = [];

    // Validar category_id (UUID) - opcional
    if (product.category_id !== undefined) {
      if (typeof product.category_id !== 'string') {
        error.push('ID da categoria deve ser uma string');
      } else {
        const uuidRegex =
          /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(product.category_id)) {
          error.push('ID da categoria deve ser um UUID válido');
        }
      }
    }

    // Validar name - opcional
    if (product.name !== undefined) {
      if (
        typeof product.name !== 'string' ||
        product.name.trim().length === 0
      ) {
        error.push('Nome não pode ser vazio');
      } else if (product.name.trim().length < 3) {
        error.push('Nome deve ter pelo menos 3 caracteres');
      } else if (product.name.trim().length > 100) {
        error.push('Nome deve ter no máximo 100 caracteres');
      }
    }

    // Validar description - opcional
    if (product.description !== undefined) {
      if (
        typeof product.description !== 'string' ||
        product.description.trim().length === 0
      ) {
        error.push('Descrição não pode ser vazia');
      } else if (product.description.trim().length < 3) {
        error.push('Descrição deve ter pelo menos 3 caracteres');
      } else if (product.description.trim().length > 500) {
        error.push('Descrição deve ter no máximo 500 caracteres');
      }
    }

    // Validar price - opcional
    if (product.price !== undefined) {
      const price = Number(product.price);
      if (isNaN(price) || !Number.isFinite(price)) {
        error.push('Preço deve ser um número válido');
      } else if (price <= 0) {
        error.push('Preço deve ser maior que 0');
      }
    }

    // Validar is_active - opcional
    if (
      product.is_active !== undefined &&
      typeof product.is_active !== 'boolean'
    ) {
      error.push("Campo 'is_active' deve ser um booleano");
    }

    // Validar image_path - opcional
    if (
      product.image_path !== undefined &&
      typeof product.image_path !== 'string'
    ) {
      error.push('Caminho da imagem deve ser uma string');
    }

    return {
      valido: error.length === 0,
      error,
    };
  }
}

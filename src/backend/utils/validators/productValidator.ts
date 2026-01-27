// Validação de Produto
export interface Product {
  name: string;
  description: string;
  price: number;
  category: string;
  active: boolean;
}

export class ProductValidator {
  static validate(product: Product): { valido: boolean; error: string[] } {
    const error: string[] = [];

    if (!product.name || product.name.trim().length === 0) {
      error.push("Nome é obrigatório");
    } else if (product.name.trim().length < 3) {
      error.push("Nome deve ter pelo menos 3 caracteres");
    } else if (product.name.trim().length > 100) {
      error.push("Nome deve ter no máximo 100 caracteres");
    }

    if (!product.description || product.description.trim().length === 0) {
      error.push("Descrição é obrigatória");
    } else if (product.description.trim().length < 3) {
      error.push("Descrição deve ter pelo menos 3 caracteres");
    }

    if (product.price === undefined || product.price === null) {
      error.push("Preço é obrigatório");
    } else if (product.price <= 0) {
      error.push("Preço deve ser maior que 0");
    } else if (!Number.isFinite(product.price)) {
      error.push("Preço deve ser um número");
    }

    if (!product.category || product.category.trim().length === 0) {
      error.push("Categoria é obrigatória");
    } else if (product.category.trim().length < 3) {
      error.push("Categoria deve ter pelo menos 3 caracteres");
    }

    if (typeof product.active !== "boolean") {
      error.push("Ativo é obrigatório");
    }

    return {
      valido: error.length === 0,
      error,
    };
  }
}


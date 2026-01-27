// Validação de Item de Pedido
export interface OrderItem {
  product_id: string;
  quantity: number;
  price: number;
}

export class OrderItemValidator {
  static validate(orderItem: OrderItem): { valido: boolean; error: string[] } {
    const error: string[] = [];

    if (!orderItem.product_id || orderItem.product_id.trim().length === 0) {
      error.push("ID do produto é obrigatório");
    }

    if (orderItem.quantity === undefined || orderItem.quantity === null) {
      error.push("Quantidade é obrigatória");
    } else if (orderItem.quantity < 1) {
      error.push("Quantidade deve ser pelo menos 1");
    } else if (!Number.isInteger(orderItem.quantity)) {
      error.push("Quantidade deve ser um número inteiro");
    }

    if (orderItem.price === undefined || orderItem.price === null) {
      error.push("Preço é obrigatório");
    } else if (orderItem.price <= 0) {
      error.push("Preço deve ser maior que 0");
    } else if (!Number.isFinite(orderItem.price)) {
      error.push("Preço deve ser um número");
    }

    return {
      valido: error.length === 0,
      error,
    };
  }
}

// Validação múltipla de itens
export function validateOrderItems(
  items: OrderItem[]
): { valido: boolean; error: string[] } {
  const error: string[] = [];

  if (!Array.isArray(items)) {
    error.push("Itens devem ser um array");
    return { valido: false, error };
  }
  if (items.length === 0) {
    error.push("Itens não podem estar vazios");
    return { valido: false, error };
  }
  items.forEach((item, index) => {
    const resultado = OrderItemValidator.validate(item);
    if (!resultado.valido) {
      error.push(`Item ${index + 1}: ${resultado.error.join(", ")}`);
    }
  });

  return {
    valido: error.length === 0,
    error,
  };
}


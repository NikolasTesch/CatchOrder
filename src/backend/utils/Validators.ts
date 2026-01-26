//validações de dados

//validação para produtos
export interface product {
  name: string;
  description: string;
  price: number;
  category: string;
  active: boolean;
}

export class product {
  static validate(product: product): { valido: boolean; error: string[] } {
    const error: string[] = [];

    if (!product.name || product.name.trim().length === 0) {
      error.push("Name is required");
    } else if (product.name.trim().length < 3) {
      error.push("Name must have at least 3 characters");
    } else if (product.name.trim().length > 100) {
      error.push("Name must have at most 100 characters");
    }

    if (!product.description || product.description.trim().length === 0) {
      error.push("description is required");
    } else if (product.description.trim().length < 3) {
      error.push("description must have at least 3 characters");
    }

    if (!product.price || product.price <= 0) {
      error.push("price is required");
    } else if (product.price < 0) {
      error.push("price must be greater than 0");
    } else if (product.price === 0 || product.price === null) {
      error.push("price must be greater than 0");
    } else if (!Number.isFinite(product.price)) {
      error.push("price must be a number");
    }

    if (!product.category || product.category.trim().length === 0) {
      error.push("category is required");
    } else if (product.category.trim().length < 3) {
      error.push("category must have at least 3 characters");
    }

    if (typeof product.active !== "boolean") {
      error.push("active is required");
    }

    return {
      valido: error.length === 0,
      error,
    };
  }
}

//validação para pedidos (order)
export interface order {
  status: string;
  total: number;
  oppened_at: Date; 
  closed_at?: Date | string | null;
}
export class order {
  private static statusValidos = [
    "ABERTA",
    "EM_PREPARO",
    "PRONTA",
    "ENTREGUE",
    "CANCELADA",
    "FECHADA",
  ];

  static validate(order: order): { valido: boolean; error: string[] } {
    const error: string[] = [];

    if (!order.status || order.status.trim().length === 0) {
      error.push("status is required");
    } else if (!this.statusValidos.includes(order.status)) {
      error.push("status must be one of: " + this.statusValidos.join(", "));
    }

    if (!order.total || order.total <= 0) {
      error.push("total is required");
    } else if (order.total < 0) {
      error.push("total must be greater than 0");
    } else if (order.total === 0 || order.total === null) {
      error.push("total must be greater than 0");
    } else if (!Number.isFinite(order.total)) {
      error.push("total must be a number");
    }

    if (!order.oppened_at) {
      error.push("oppened_at is required");
    } else if (!(order.oppened_at instanceof Date)) {
      error.push("oppened_at must be a date");
    } else if (order.oppened_at > new Date()) {
      error.push("oppened_at does not allow future dates");
    }

    return {
      valido: error.length === 0,
      error,
    };
  }
}
 // validação para itens de pedido (order_item)
export interface order_item {
  product_id: string;
  quantity: number;
  price: number;
}

export class order_item {
  static validate(order_item: order_item): { valido: boolean; error: string[] } {
    const error: string[] = [];

    if (!order_item.product_id || order_item.product_id.trim().length === 0) {
      error.push("product_id is required");
    }

    if (!order_item.quantity || order_item.quantity <= 0) {
      error.push("quantity is required");
    } else if (order_item.quantity < 1) {
      error.push("quantity must be at least 1");
    } else if (!Number.isInteger(order_item.quantity)) {
      error.push("quantity must be an integer");
    }

    if (!order_item.price || order_item.price <= 0) {
      error.push("price is required");
    } else if (order_item.price < 0) {
      error.push("price must be greater than 0");
    } else if (!Number.isFinite(order_item.price)) {
      error.push("price must be a number");
    }

    return {
      valido: error.length === 0,
      error,
    };
  }
}

// validação multipla
export function validateOrderItems(
  items: order_item[]
): { valido: boolean; error: string[] } {
  const error: string[] = [];

  if (!Array.isArray(items)) {
    error.push("items must be an array");
    return { valido: false, error };
  }
  if (items.length === 0) {
    error.push("items must not be empty");
    return { valido: false, error };
  }
  items.forEach((item, index) => {
    const resultado = order_item.validate(item);
    if (!resultado.valido) {
      error.push(`Item ${index + 1}: ${resultado.error.join(", ")}`);
    }
  });

  return {
    valido: error.length === 0,
    error,
  };
}

// validação para usuário (user)
export interface user {
  name: string;
  email: string;
  password: string;
  role: string;
}

export class user {
  private static rolesValidos = ["ADMIN", "GARCOM", "COZINHA"];

  static validate(user: user): { valido: boolean; error: string[] } {
    const error: string[] = [];

    if (!user.name || user.name.trim().length === 0) {
      error.push("name is required");
    } else if (user.name.trim().length < 3) {
      error.push("name must have at least 3 characters");
    } else if (user.name.trim().length > 100) {
      error.push("name must have at most 100 characters");
    }

    if (!user.email || user.email.trim().length === 0) {
      error.push("email is required");
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(user.email)) {
      error.push("email must be a valid email address");
    }

    if (!user.password || user.password.trim().length === 0) {
      error.push("password is required");
    } else if (user.password.length < 6) {
      error.push("password must have at least 6 characters");
    }

    if (!user.role || user.role.trim().length === 0) {
      error.push("role is required");
    } else if (!this.rolesValidos.includes(user.role)) {
      error.push("role must be one of: " + this.rolesValidos.join(", "));
    }

    return {
      valido: error.length === 0,
      error,
    };
  }
}

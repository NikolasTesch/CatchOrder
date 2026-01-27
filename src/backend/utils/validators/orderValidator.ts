// Validação de Pedido
export interface Order {
  status: string;
  total: number;
  oppened_at: Date;
  closed_at?: Date | string | null;
}

export class OrderValidator {
  private static statusValidos = [
    "ABERTA",
    "EM_PREPARO",
    "PRONTA",
    "ENTREGUE",
    "CANCELADA",
    "FECHADA",
  ];

  static validate(order: Order): { valido: boolean; error: string[] } {
    const error: string[] = [];

    if (!order.status || order.status.trim().length === 0) {
      error.push("Status é obrigatório");
    } else if (!this.statusValidos.includes(order.status)) {
      error.push("Status deve ser um dos seguintes: " + this.statusValidos.join(", "));
    }

    if (order.total === undefined || order.total === null) {
      error.push("Total é obrigatório");
    } else if (order.total <= 0) {
      error.push("Total deve ser maior que 0");
    } else if (!Number.isFinite(order.total)) {
      error.push("Total deve ser um número");
    }

    if (!order.oppened_at) {
      error.push("Data de abertura é obrigatória");
    } else if (!(order.oppened_at instanceof Date)) {
      error.push("Data de abertura deve ser uma data");
    } else if (order.oppened_at > new Date()) {
      error.push("Data de abertura não permite datas futuras");
    }

    return {
      valido: error.length === 0,
      error,
    };
  }
}


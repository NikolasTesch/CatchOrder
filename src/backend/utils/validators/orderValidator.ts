// Validação de Pedido
export interface Order {
  status: string;
  total: number;
  tip?: number;
  oppened_at: Date;
  closed_at?: Date | string | null;
}

export interface OrderCreationData {
  table_id: string;
  user_id: string;
}

export interface OrderUpdateData {
  status?: string;
  total?: number;
  closed_at?: Date | string | null;
}

export class OrderValidator {
  private static statusValidos = [
    'ABERTA',
    'EM_PREPARO',
    'PRONTA',
    'ENTREGUE',
    'CANCELADA',
    'FECHADA',
  ];

  static validate(order: Order): { valido: boolean; error: string[] } {
    const error: string[] = [];

    if (!order.status || order.status.trim().length === 0) {
      error.push('Status é obrigatório');
    } else if (!this.statusValidos.includes(order.status)) {
      error.push(
        'Status deve ser um dos seguintes: ' + this.statusValidos.join(', '),
      );
    }

    if (order.total === undefined || order.total === null) {
      error.push('Total é obrigatório');
    } else if (order.total <= 0) {
      error.push('Total deve ser maior que 0');
    } else if (!Number.isFinite(order.total)) {
      error.push('Total deve ser um número');
    } else if (!Number.isInteger(order.total)) {
      error.push('Total deve ser um número inteiro (em centavos)');
    }

    if (!order.oppened_at) {
      error.push('Data de abertura é obrigatória');
    } else if (!(order.oppened_at instanceof Date)) {
      error.push('Data de abertura deve ser uma data');
    } else if (order.oppened_at > new Date()) {
      error.push('Data de abertura não permite datas futuras');
    }

    // Validação opcional de gorjeta
    if (order.tip !== undefined && order.tip !== null) {
      if (typeof order.tip !== 'number' || !Number.isFinite(order.tip)) {
        error.push('Gorjeta deve ser um número válido');
      } else if (order.tip < 0) {
        error.push('Gorjeta não pode ser negativa');
      } else if (!Number.isInteger(order.tip)) {
        error.push('Gorjeta deve ser um número inteiro (em centavos)');
      }
    }

    return {
      valido: error.length === 0,
      error,
    };
  }
}

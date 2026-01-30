// Validação de Pedido
export interface Order {
  status: string;
  total: number;
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
    }

    if (!order.oppened_at) {
      error.push('Data de abertura é obrigatória');
    } else if (!(order.oppened_at instanceof Date)) {
      error.push('Data de abertura deve ser uma data');
    } else if (order.oppened_at > new Date()) {
      error.push('Data de abertura não permite datas futuras');
    }

    return {
      valido: error.length === 0,
      error,
    };
  }

  static validateCreation(order: any): { valido: boolean; error: string[] } {
    const error: string[] = [];

    // Validar table_id (UUID)
    if (!order.table_id || typeof order.table_id !== 'string') {
      error.push('ID da mesa é obrigatório');
    } else {
      const uuidRegex =
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(order.table_id)) {
        error.push('ID da mesa deve ser um UUID válido');
      }
    }

    // Validar user_id (UUID)
    if (!order.user_id || typeof order.user_id !== 'string') {
      error.push('ID do usuário é obrigatório');
    } else {
      const uuidRegex =
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(order.user_id)) {
        error.push('ID do usuário deve ser um UUID válido');
      }
    }

    return {
      valido: error.length === 0,
      error,
    };
  }

  static validateUpdate(order: any): { valido: boolean; error: string[] } {
    const error: string[] = [];

    // Validar status (opcional)
    if (order.status !== undefined) {
      if (
        typeof order.status !== 'string' ||
        order.status.trim().length === 0
      ) {
        error.push('Status não pode ser vazio');
      } else if (!this.statusValidos.includes(order.status)) {
        error.push(
          'Status deve ser um dos seguintes: ' + this.statusValidos.join(', '),
        );
      }
    }

    // Validar total (opcional)
    if (order.total !== undefined) {
      const total = Number(order.total);
      if (isNaN(total) || !Number.isFinite(total)) {
        error.push('Total deve ser um número válido');
      } else if (total < 0) {
        error.push('Total não pode ser negativo');
      }
    }

    // Validar closed_at (opcional)
    if (order.closed_at !== undefined && order.closed_at !== null) {
      const closedAt = new Date(order.closed_at);
      if (isNaN(closedAt.getTime())) {
        error.push('Data de fechamento deve ser uma data válida');
      }
    }

    return {
      valido: error.length === 0,
      error,
    };
  }
}

// Mock functions for testing (extracted from waiterMain.ts)
function formatCurrentDate(): string {
  const days = [
    'Domingo',
    'Segunda-feira',
    'Terça-feira',
    'Quarta-feira',
    'Quinta-feira',
    'Sexta-feira',
    'Sábado',
  ];
  const months = [
    'Janeiro',
    'Fevereiro',
    'Março',
    'Abril',
    'Maio',
    'Junho',
    'Julho',
    'Agosto',
    'Setembro',
    'Outubro',
    'Novembro',
    'Dezembro',
  ];

  const now = new Date();
  const dayOfWeek = days[now.getDay()];
  const day = now.getDate();
  const month = months[now.getMonth()];
  const year = now.getFullYear();

  return `${dayOfWeek}, ${day} de ${month} de ${year}`;
}

function formatCurrency(cents: number): string {
  const reais = cents / 100;
  return reais.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

describe('Waiter Dashboard - Date Formatting', () => {
  it('should format current date in Portuguese format', () => {
    const result = formatCurrentDate();
    // Should match pattern: "Dia-semana, DD de Mês de AAAA"
    expect(result).toMatch(
      /^(Domingo|Segunda-feira|Terça-feira|Quarta-feira|Quinta-feira|Sexta-feira|Sábado), \d{1,2} de (Janeiro|Fevereiro|Março|Abril|Maio|Junho|Julho|Agosto|Setembro|Outubro|Novembro|Dezembro) de \d{4}$/,
    );
  });

  it('should include correct day of week', () => {
    const result = formatCurrentDate();
    const validDays = [
      'Domingo',
      'Segunda-feira',
      'Terça-feira',
      'Quarta-feira',
      'Quinta-feira',
      'Sexta-feira',
      'Sábado',
    ];
    const startsWithValidDay = validDays.some((day) => result.startsWith(day));
    expect(startsWithValidDay).toBe(true);
  });
});

describe('Waiter Dashboard - Currency Formatting', () => {
  it('should convert cents to reais with PT formatting', () => {
    const result = formatCurrency(1250);
    // toLocaleString uses non-breaking space (\u00A0) instead of regular space
    expect(result.replace(/\s/g, ' ')).toBe('R$ 12,50');
  });

  it('should handle zero correctly', () => {
    const result = formatCurrency(0);
    expect(result.replace(/\s/g, ' ')).toBe('R$ 0,00');
  });

  it('should handle large values', () => {
    const result = formatCurrency(100000);
    expect(result.replace(/\s/g, ' ')).toBe('R$ 1.000,00');
  });

  it('should handle single digit cents', () => {
    const result = formatCurrency(105);
    expect(result.replace(/\s/g, ' ')).toBe('R$ 1,05');
  });

  it('should handle values without decimal', () => {
    const result = formatCurrency(500);
    expect(result.replace(/\s/g, ' ')).toBe('R$ 5,00');
  });
});

describe('Waiter Dashboard - Tips Calculation', () => {
  interface Order {
    id: string;
    user_id: string;
    status: string;
    tip: number;
    created_at: string;
  }

  const mockOrders: Order[] = [
    {
      id: '1',
      user_id: 'waiter1',
      status: 'CLOSED',
      tip: 500,
      created_at: new Date().toISOString(),
    },
    {
      id: '2',
      user_id: 'waiter1',
      status: 'CLOSED',
      tip: 750,
      created_at: new Date().toISOString(),
    },
    {
      id: '3',
      user_id: 'waiter2',
      status: 'CLOSED',
      tip: 300,
      created_at: new Date().toISOString(),
    },
    {
      id: '4',
      user_id: 'waiter1',
      status: 'OPEN',
      tip: 200,
      created_at: new Date().toISOString(),
    },
  ];

  it('should calculate total tips for specific waiter', () => {
    const waiter1Tips = mockOrders
      .filter((o) => o.user_id === 'waiter1' && o.status === 'CLOSED')
      .reduce((sum, order) => sum + order.tip, 0);

    expect(waiter1Tips).toBe(1250); // 500 + 750
  });

  it('should filter only closed orders', () => {
    const closedOrders = mockOrders.filter((o) => o.status === 'CLOSED');
    expect(closedOrders.length).toBe(3);
  });

  it("should filter by today's date", () => {
    const today = new Date().toDateString();
    const todayOrders = mockOrders.filter((o) => {
      const orderDate = new Date(o.created_at).toDateString();
      return orderDate === today;
    });
    expect(todayOrders.length).toBe(4); // All mock orders are from today
  });
});

describe('Waiter Dashboard - Table Rendering', () => {
  interface Table {
    id: string;
    number: number;
    status: 'AVAILABLE' | 'OCCUPIED' | 'RESERVED';
  }

  const mockTables: Table[] = [
    { id: '1', number: 1, status: 'OCCUPIED' },
    { id: '2', number: 2, status: 'AVAILABLE' },
    { id: '3', number: 3, status: 'OCCUPIED' },
    { id: '4', number: 4, status: 'RESERVED' },
    { id: '5', number: 5, status: 'AVAILABLE' },
  ];

  it('should filter only occupied tables', () => {
    const occupied = mockTables.filter((t) => t.status === 'OCCUPIED');
    expect(occupied.length).toBe(2);
    expect(occupied.every((t) => t.status === 'OCCUPIED')).toBe(true);
  });

  it('should filter only available tables', () => {
    const available = mockTables.filter((t) => t.status === 'AVAILABLE');
    expect(available.length).toBe(2);
    expect(available.every((t) => t.status === 'AVAILABLE')).toBe(true);
  });

  it('should not include reserved tables in available section', () => {
    const available = mockTables.filter((t) => t.status === 'AVAILABLE');
    expect(available.some((t) => t.status === 'RESERVED')).toBe(false);
  });
});

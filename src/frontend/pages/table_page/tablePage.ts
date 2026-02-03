import './style.css';

interface TableData {
  id: number;
  status: 'disponível' | 'ocupado';
}

const STORAGE_KEYS = {
  TABLE: 'catchorder_table_id',
  SESSION_STATUS: 'catchorder_session_active'
};

class TableSelector {
  private gridContainer: HTMLElement;
  private confirmButton: HTMLButtonElement;
  private selectedTableId: number | null = null;

  // Dados Mockados
  private tables: TableData[] = [
    { id: 1, status: 'disponível' },
    { id: 2, status: 'ocupado' },
    { id: 3, status: 'disponível' },
    { id: 4, status: 'disponível' },
    { id: 5, status: 'ocupado' },
    { id: 6, status: 'disponível' },
    { id: 7, status: 'disponível' },
    { id: 8, status: 'disponível' },
    { id: 9, status: 'disponível' }
  ];

  constructor() {
    this.gridContainer = document.getElementById('tablesGrid') as HTMLElement;
    this.confirmButton = document.getElementById('btnConfirm') as HTMLButtonElement;
    this.init();
  }

  private init(): void {
    this.renderTables();
    if (this.confirmButton) {
      this.confirmButton.addEventListener('click', () => this.handleConfirm());
    }
    this.checkUrlParams();
  }

  // Função auxiliar para formatar 1 -> "01"
  private formatNumber(num: number): string {
    return num < 10 ? `0${num}` : num.toString();
  }

  private renderTables(): void {
    if (!this.gridContainer) return;
    this.gridContainer.innerHTML = '';

    this.tables.forEach(table => {
      const card = document.createElement('div');
      card.className = `table-card ${table.status === 'ocupado' ? 'disabled' : ''}`;
      card.dataset.id = table.id.toString();

      // 1. Número (01, 02...)
      const numberEl = document.createElement('span');
      numberEl.className = 'table-number';
      numberEl.textContent = this.formatNumber(table.id);

      // 2. Label "MESA" (Adicionado para ficar igual à imagem)
      const labelEl = document.createElement('span');
      labelEl.className = 'table-label';
      labelEl.textContent = 'MESA';

      // 3. Badge (Disponível/Ocupada)
      const badgeEl = document.createElement('span');
      badgeEl.className = `status-badge ${table.status === 'disponível' ? 'status-available' : 'status-occupied'}`;
      badgeEl.textContent = table.status === 'disponível' ? 'Disponível' : 'Ocupada';

      // Montagem
      card.appendChild(numberEl);
      card.appendChild(labelEl);
      card.appendChild(badgeEl);

      if (table.status === 'disponível') {
        card.addEventListener('click', () => this.handleTableSelect(table.id, card));
      }

      this.gridContainer.appendChild(card);
    });
  }

  private handleTableSelect(id: number, cardElement: HTMLElement): void {
    const previousSelected = document.querySelector('.table-card.selected');
    if (previousSelected) {
      previousSelected.classList.remove('selected');
    }

    if (this.selectedTableId === id) {
      this.selectedTableId = null;
      this.updateButtonState(false);
    } else {
      this.selectedTableId = id;
      cardElement.classList.add('selected');
      this.updateButtonState(true);
    }
  }

  private updateButtonState(isEnabled: boolean): void {
    if (this.confirmButton) {
      this.confirmButton.disabled = !isEnabled;
      this.confirmButton.textContent = isEnabled
        ? `Confirmar Mesa ${this.formatNumber(this.selectedTableId!)}`
        : 'Selecionar Mesa';
    }
  }

  // ... (checkUrlParams e handleConfirm permanecem iguais)
  private checkUrlParams(): void {
    const urlParams = new URLSearchParams(window.location.search);
    const tableParam = urlParams.get('mesa');
    if (tableParam) {
      const id = parseInt(tableParam, 10);
      const card = document.querySelector(`.table-card[data-id="${id}"]`) as HTMLElement;
      if (card && !card.classList.contains('disabled')) {
        this.handleTableSelect(id, card);
      }
    }
  }

  private handleConfirm(): void {
    if (!this.selectedTableId) return;
    sessionStorage.setItem(STORAGE_KEYS.TABLE, this.selectedTableId.toString());
    sessionStorage.setItem(STORAGE_KEYS.SESSION_STATUS, 'true');
    window.location.href = '/pages/menuPage.html';
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new TableSelector();
});
import './style.css';
import { ApiService } from '../../services/apiService';

interface TableData {
  id: string; // Backend uses UUID
  number: number;
  status: 'AVAILABLE' | 'OCCUPIED' | 'RESERVED';
}

const STORAGE_KEYS = {
  TABLE: 'catchorder_table_id',
  TABLE_NUMBER: 'catchorder_table_number',
  SESSION_STATUS: 'catchorder_session_active'
};

class TableSelector {
  private gridContainer: HTMLElement;
  private confirmButton: HTMLButtonElement;
  private selectedTableId: string | null = null;
  private selectedTableNumber: number | null = null;
  private tables: TableData[] = [];

  constructor() {
    this.gridContainer = document.getElementById('tablesGrid') as HTMLElement;
    this.confirmButton = document.getElementById('btnConfirm') as HTMLButtonElement;
    this.init();
  }

  private async init(): Promise<void> {
    await this.fetchTables();
    if (this.confirmButton) {
      this.confirmButton.addEventListener('click', () => this.handleConfirm());
    }
    this.checkUrlParams();
  }

  private async fetchTables(): Promise<void> {
    try {
      if (this.gridContainer) {
        this.gridContainer.innerHTML = '<div class="loading-state">Carregando mesas...</div>';
      }

      // Fetch tables from API
      const response = await ApiService.get<{ message: string, data: TableData[] }>('/tables');

      // Sort tables by number
      this.tables = response.data.sort((a, b) => a.number - b.number);

      this.renderTables();
    } catch (error) {
      console.error('Error fetching tables:', error);
      if (this.gridContainer) {
        this.gridContainer.innerHTML = '<div class="error-state">Erro ao carregar mesas. Tente novamente.</div>';
      }
    }
  }

  // Função auxiliar para formatar 1 -> "01"
  private formatNumber(num: number): string {
    return num < 10 ? `0${num}` : num.toString();
  }

  private renderTables(): void {
    if (!this.gridContainer) return;
    this.gridContainer.innerHTML = '';

    if (this.tables.length === 0) {
      this.gridContainer.innerHTML = '<div class="empty-state">Nenhuma mesa encontrada.</div>';
      return;
    }

    this.tables.forEach(table => {
      const card = document.createElement('div');
      // Map backend status to frontend classes
      const isOccupied = table.status === 'OCCUPIED' || table.status === 'RESERVED';
      card.className = `table-card ${isOccupied ? 'disabled' : ''}`;
      card.dataset.id = table.id; // Use UUID

      // 1. Número (01, 02...)
      const numberEl = document.createElement('span');
      numberEl.className = 'table-number';
      numberEl.textContent = this.formatNumber(table.number);

      // 2. Label "MESA"
      const labelEl = document.createElement('span');
      labelEl.className = 'table-label';
      labelEl.textContent = 'MESA';

      // 3. Badge (Disponível/Ocupada)
      const badgeEl = document.createElement('span');

      let statusText = 'Disponível';
      let statusClass = 'status-available';

      if (table.status === 'OCCUPIED') {
        statusText = 'Ocupada';
        statusClass = 'status-occupied';
      } else if (table.status === 'RESERVED') {
        statusText = 'Reservada';
        statusClass = 'status-occupied'; // Use occupied style for reserved for now or add specific style
      }

      badgeEl.className = `status-badge ${statusClass}`;
      badgeEl.textContent = statusText;

      // Montagem
      card.appendChild(numberEl);
      card.appendChild(labelEl);
      card.appendChild(badgeEl);

      if (!isOccupied) {
        card.addEventListener('click', () => this.handleTableSelect(table.id, table.number, card));
      }

      this.gridContainer.appendChild(card);
    });
  }

  private handleTableSelect(id: string, number: number, cardElement: HTMLElement): void {
    const previousSelected = document.querySelector('.table-card.selected');
    if (previousSelected) {
      previousSelected.classList.remove('selected');
    }

    if (this.selectedTableId === id) {
      this.selectedTableId = null;
      this.selectedTableNumber = null;
      this.updateButtonState(false, 0);
    } else {
      this.selectedTableId = id;
      this.selectedTableNumber = number;
      cardElement.classList.add('selected');
      this.updateButtonState(true, number);
    }
  }

  private updateButtonState(isEnabled: boolean, number: number): void {
    if (this.confirmButton) {
      this.confirmButton.disabled = !isEnabled;
      this.confirmButton.textContent = isEnabled
        ? `Confirmar Mesa ${this.formatNumber(number)}`
        : 'Selecionar Mesa';
    }
  }

  private checkUrlParams(): void {
    const urlParams = new URLSearchParams(window.location.search);
    const tableId = urlParams.get('mesa'); // Expecting UUID or handling legacy number param might be tricky without mapping?
    // Assuming URL param might be just for deep linking, but typically user selects manually.
    // Given the ID is UUID now, URL params with "mesa=1" won't match "mesa=uuid". 
    // I will skip complex URL param handling for ID matching unless requested, 
    // or assume the user navigates here to select.

    // Legacy support attempt: if param is small number, find by number?
    if (tableId) {
      // Try finding by UUID first
      let card = document.querySelector(`.table-card[data-id="${tableId}"]`) as HTMLElement;

      // If not found and tableId is short (number), try finding by text content of table-number? 
      // Better to just stick to ID for now.
      if (card && !card.classList.contains('disabled')) {
        // We need the number for the button text, which we can get from the sorted logic if we refactored slightly,
        // or just grab it from the DOM element we found.
        const numberText = card.querySelector('.table-number')?.textContent || '00';
        this.handleTableSelect(tableId, parseInt(numberText), card);
      }
    }
  }

  private handleConfirm(): void {
    if (!this.selectedTableId) return;
    sessionStorage.setItem(STORAGE_KEYS.TABLE, this.selectedTableId);
    if (this.selectedTableNumber !== null) {
      sessionStorage.setItem(STORAGE_KEYS.TABLE_NUMBER, this.selectedTableNumber.toString());
    }
    sessionStorage.setItem(STORAGE_KEYS.SESSION_STATUS, 'true');
    window.location.href = '/pages/menuPage.html';
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new TableSelector();
});

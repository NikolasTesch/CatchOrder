export class ModalService {
  /**
   * replaces window.alert with a styled modal
   * @param title Title of the modal
   * @param message Message content
   * @param type 'success' | 'error' | 'warning' | 'info'
   * @param onOk Optional callback when OK is clicked
   */
  static alert(
    title: string,
    message: string,
    type: 'success' | 'error' | 'warning' | 'info' = 'info',
    onOk?: () => void
  ): void {
    ModalService.show(title, message, type, onOk);
  }

  /**
   * replaces window.confirm with a styled modal
   * @param title Title of the modal
   * @param message Message content
   * @param onConfirm Callback when Confirm is clicked
   * @param onCancel Optional callback when Cancel is clicked
   */
  static confirm(
    title: string,
    message: string,
    onConfirm: () => void,
    onCancel?: () => void
  ): void {
    ModalService.show(title, message, 'warning', onConfirm, true, onCancel);
  }

  private static show(
    title: string,
    message: string,
    type: 'success' | 'error' | 'warning' | 'info',
    onOk?: () => void,
    isConfirm: boolean = false,
    onCancel?: () => void
  ): void {
    // Create Backdrop
    const backdrop = document.createElement('div');
    backdrop.className = 'modal-backdrop active';
    backdrop.style.zIndex = '9999';

    // Create Modal Container
    const modal = document.createElement('div');
    modal.className = 'modal';

    // Icon handling
    let iconName = 'info';
    let iconClass = 'info';

    switch (type) {
      case 'success':
        iconName = 'check_circle';
        iconClass = 'success';
        break;
      case 'error':
        iconName = 'error';
        iconClass = 'danger';
        break;
      case 'warning':
        iconName = 'warning';
        iconClass = 'warning';
        break;
      case 'info':
      default:
        iconName = 'info';
        iconClass = 'info';
        break;
    }

    // Modal Content
    modal.innerHTML = `
      <div class="modal-header">
        <span class="material-symbols-outlined modal-icon ${iconClass}">${iconName}</span>
        <h3 class="modal-title">${title}</h3>
      </div>
      <div class="modal-body">
        <p class="modal-message">${message}</p>
      </div>
      <div class="modal-footer">
        ${isConfirm ? `<button class="btn btn-outline" id="modal-cancel-btn">Cancelar</button>` : ''}
        <button class="btn btn-primary" id="modal-ok-btn">${isConfirm ? 'Confirmar' : 'OK'}</button>
      </div>
    `;

    backdrop.appendChild(modal);
    document.body.appendChild(backdrop);

    const close = () => {
      backdrop.classList.remove('active');
      setTimeout(() => {
        if (document.body.contains(backdrop)) {
          document.body.removeChild(backdrop);
        }
      }, 300);
    };

    // OK / Confirm Button
    const okBtn = modal.querySelector('#modal-ok-btn') as HTMLButtonElement;
    if (okBtn) {
      okBtn.focus();
      okBtn.onclick = () => {
        close();
        if (onOk) setTimeout(onOk, 300);
      };
    }

    // Cancel Button
    if (isConfirm) {
      const cancelBtn = modal.querySelector('#modal-cancel-btn') as HTMLButtonElement;
      if (cancelBtn) {
        cancelBtn.onclick = () => {
          close();
          if (onCancel) setTimeout(onCancel, 300);
        };
      }
    }

    // Handle Keys
    const handleKeydown = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        okBtn.click();
        document.removeEventListener('keydown', handleKeydown);
      } else if (e.key === 'Escape') {
        e.preventDefault();
        if (isConfirm && onCancel) onCancel();
        close();
        document.removeEventListener('keydown', handleKeydown);
      }
    };

    document.addEventListener('keydown', handleKeydown);
  }
}

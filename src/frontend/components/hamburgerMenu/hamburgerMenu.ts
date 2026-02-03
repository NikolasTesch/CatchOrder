/**
 * Hamburger Menu Component
 *
 * Centralized component for managing sidebar navigation menu.
 * Provides accessibility features (ARIA, keyboard navigation) and
 * multiple closing methods (ESC key, outside click, navigation).
 *
 * @example
 * import { initHamburgerMenu } from '../../components/hamburgerMenu/hamburgerMenu';
 * initHamburgerMenu();
 */

export interface HamburgerMenuOptions {
  menuBtnId?: string;
  sidebarId?: string;
  overlayId?: string;
  closeOnOutsideClick?: boolean;
  closeOnEscape?: boolean;
  closeOnNavigation?: boolean;
}

const DEFAULT_OPTIONS: HamburgerMenuOptions = {
  menuBtnId: "menuBtn",
  sidebarId: "sidebar",
  overlayId: "sidebarOverlay",
  closeOnOutsideClick: true,
  closeOnEscape: true,
  closeOnNavigation: true,
};

export function initHamburgerMenu(options: Partial<HamburgerMenuOptions> = {}) {
  const config = { ...DEFAULT_OPTIONS, ...options };

  const menuBtn = document.getElementById(config.menuBtnId!);
  const sidebar = document.getElementById(config.sidebarId!);

  if (!menuBtn || !sidebar) {
    console.warn(
      `[HamburgerMenu] Elements not found: menuBtn=${!!menuBtn}, sidebar=${!!sidebar}`,
    );
    return;
  }

  // Create overlay if it doesn't exist
  let overlay = document.getElementById(config.overlayId!);
  if (!overlay && config.closeOnOutsideClick) {
    overlay = createOverlay(config.overlayId!);
    document.body.appendChild(overlay);
  }

  // State
  let isOpen = false;

  // Functions
  const openMenu = () => {
    isOpen = true;
    sidebar.classList.add("active");
    overlay?.classList.add("active");
    menuBtn.setAttribute("aria-expanded", "true");
    sidebar.setAttribute("aria-hidden", "false");

    // Focus on first focusable element
    const firstFocusable = sidebar.querySelector<HTMLElement>(
      "button, a, [tabindex]:not([tabindex='-1'])",
    );
    firstFocusable?.focus();
  };

  const closeMenu = () => {
    isOpen = false;
    sidebar.classList.remove("active");
    overlay?.classList.remove("active");
    menuBtn.setAttribute("aria-expanded", "false");
    sidebar.setAttribute("aria-hidden", "true");

    // Return focus to menu button
    menuBtn.focus();
  };

  const toggleMenu = () => {
    if (isOpen) {
      closeMenu();
    } else {
      openMenu();
    }
  };

  // Event Listeners

  // 1. Menu button click
  menuBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    toggleMenu();
  });

  // 2. Overlay click (outside menu)
  if (config.closeOnOutsideClick && overlay) {
    overlay.addEventListener("click", closeMenu);
  }

  // 3. ESC key
  if (config.closeOnEscape) {
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && isOpen) {
        closeMenu();
      }
    });
  }

  // 4. Navigation (click on menu items)
  if (config.closeOnNavigation) {
    const navItems = sidebar.querySelectorAll<HTMLElement>(
      ".nav-item, .sidebar-menu a, .sidebar-menu button",
    );
    navItems.forEach((item) => {
      item.addEventListener("click", () => {
        // Small delay to allow navigation before closing
        setTimeout(closeMenu, 100);
      });
    });
  }

  // Initialize ARIA attributes
  menuBtn.setAttribute("aria-expanded", "false");
  menuBtn.setAttribute("aria-controls", config.sidebarId!);
  sidebar.setAttribute("aria-hidden", "true");

  // Return public API (optional)
  return {
    open: openMenu,
    close: closeMenu,
    toggle: toggleMenu,
    isOpen: () => isOpen,
  };
}

function createOverlay(id: string): HTMLElement {
  const overlay = document.createElement("div");
  overlay.id = id;
  overlay.className = "sidebar-overlay";
  overlay.setAttribute("aria-hidden", "true");
  return overlay;
}

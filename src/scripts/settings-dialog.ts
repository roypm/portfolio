const settingsPortal = document.querySelector<HTMLElement>("[data-settings]");
if (settingsPortal && settingsPortal.parentElement?.closest("[data-nav-cluster]")) {
  document.body.appendChild(settingsPortal);
}

const openButton = document.querySelector<HTMLButtonElement>("[data-settings-open]");
const root = document.querySelector<HTMLElement>("[data-settings]");
const panel = document.querySelector<HTMLElement>("[data-settings-panel]");
const backdrop = document.querySelector<HTMLElement>("[data-settings-backdrop]");
const closeButton = document.querySelector<HTMLButtonElement>("[data-settings-close]");

if (openButton && root && panel && backdrop && closeButton) {
  let closeTimer = 0;
  const closeDelay = () => (document.documentElement.classList.contains("fx-motion") ? 320 : 0);

  const focusable = () =>
    [...panel.querySelectorAll<HTMLElement>("a[href], button:not([disabled])")];

  const setOpen = (open: boolean) => {
    window.clearTimeout(closeTimer);
    openButton.setAttribute("aria-expanded", String(open));
    if (open) {
      root.hidden = false;
      requestAnimationFrame(() => root.setAttribute("data-open", ""));
      closeButton.focus({ preventScroll: true });
    } else {
      root.removeAttribute("data-open");
      closeTimer = window.setTimeout(() => {
        root.hidden = true;
      }, closeDelay());
      openButton.focus({ preventScroll: true });
    }
  };

  openButton.addEventListener("click", () => setOpen(Boolean(root.hidden)));

  closeButton.addEventListener("click", () => setOpen(false));

  backdrop.addEventListener("click", () => setOpen(false));

  document.addEventListener("keydown", (event) => {
    if (root.hidden) return;
    if (event.key === "Escape") {
      setOpen(false);
      return;
    }
    if (event.key !== "Tab") return;
    const items = focusable();
    if (items.length === 0) return;
    const first = items[0];
    const last = items[items.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus({ preventScroll: true });
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus({ preventScroll: true });
    }
  });
}

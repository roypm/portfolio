const paletteOptions = [...document.querySelectorAll<HTMLButtonElement>("[data-palette-option]")];

function readPalette(value: string | null | undefined) {
  if (value === "blossom" || value === "garnet" || value === "slate" || value === "night") return value;
  return "slate";
}

function applyPalette(palette: "blossom" | "garnet" | "slate" | "night", persist: boolean) {
  document.documentElement.dataset.palette = palette;
  for (const option of paletteOptions) {
    const selected = option.dataset.paletteOption === palette;
    option.setAttribute("aria-checked", String(selected));
    option.tabIndex = selected ? 0 : -1;
  }
  if (!persist) return;
  try {
    localStorage.setItem("palette", palette);
  } catch {
    // Storage can be unavailable. The choice still applies for this visit.
  }
}

if (paletteOptions.length > 0) {
  applyPalette(readPalette(document.documentElement.dataset.palette), false);

  for (const option of paletteOptions) {
    option.addEventListener("click", () => {
      applyPalette(readPalette(option.dataset.paletteOption), true);
    });
  }

  const paletteGroup = paletteOptions[0]?.closest<HTMLElement>("[role='radiogroup']");
  paletteGroup?.addEventListener("keydown", (event) => {
    const current = document.activeElement;
    if (!(current instanceof HTMLButtonElement) || !paletteOptions.includes(current)) return;
    const index = paletteOptions.indexOf(current);
    let next = index;
    if (event.key === "ArrowDown" || event.key === "ArrowRight") next = (index + 1) % paletteOptions.length;
    else if (event.key === "ArrowUp" || event.key === "ArrowLeft")
      next = (index - 1 + paletteOptions.length) % paletteOptions.length;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = paletteOptions.length - 1;
    else return;
    event.preventDefault();
    const target = paletteOptions[next];
    if (!target) return;
    applyPalette(readPalette(target.dataset.paletteOption), true);
    target.focus({ preventScroll: true });
  });
}

const motionSwitch = document.querySelector<HTMLButtonElement>("[data-motion-switch]");

function readMotion(value: string | null | undefined) {
  if (value === "off") return "off";
  return "on";
}

function applyMotion(motion: "on" | "off", persist: boolean) {
  const root = document.documentElement;
  root.dataset.motion = motion;
  root.classList.toggle("fx-motion", motion === "on");
  motionSwitch?.setAttribute("aria-checked", motion === "on" ? "true" : "false");
  if (!persist) return;
  try {
    localStorage.setItem("motion", motion);
  } catch {
    // Storage can be unavailable. The choice still applies for this visit.
  }
  root.dispatchEvent(new CustomEvent("motionchange"));
}

if (motionSwitch) {
  applyMotion(readMotion(document.documentElement.dataset.motion), false);

  motionSwitch.addEventListener("click", () => {
    applyMotion(motionSwitch.getAttribute("aria-checked") === "true" ? "off" : "on", true);
  });
}

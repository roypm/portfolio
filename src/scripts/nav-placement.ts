const placementOptions = [
  ...document.querySelectorAll<HTMLButtonElement>("[data-nav-placement-option]"),
];

function readPlacement(value: string | null | undefined) {
  if (value === "left" || value === "right" || value === "top") return value;
  return "top";
}

const navCluster = document.querySelector<HTMLElement>("[data-nav-cluster]");
let navTravelMarker: HTMLElement | undefined;
let navTravelAnimation: Animation | undefined;
let navArrivalAnimation: Animation | undefined;

function applyPlacement(placement: "top" | "left" | "right", persist: boolean) {
  const previousPlacement = readPlacement(document.documentElement.dataset.navPlacement);
  const shouldAnimate =
    persist &&
    navCluster &&
    previousPlacement !== placement &&
    document.documentElement.classList.contains("fx-motion");
  const oldRect = shouldAnimate ? navCluster.getBoundingClientRect() : null;

  navTravelAnimation?.cancel();
  navArrivalAnimation?.cancel();
  navTravelMarker?.remove();
  navTravelMarker = undefined;
  if (oldRect && navCluster) {
    navCluster.style.visibility = "hidden";
    const marker = document.createElement("span");
    marker.className = "nav-travel-marker";
    marker.style.left = `${oldRect.left + oldRect.width / 2}px`;
    marker.style.top = `${oldRect.top + oldRect.height / 2}px`;
    navTravelMarker = marker;
    document.body.appendChild(marker);
  } else if (navCluster) {
    navCluster.style.visibility = "";
  }

  document.documentElement.dataset.navPlacement = placement;
  for (const option of placementOptions) {
    const selected = option.dataset.navPlacementOption === placement;
    option.setAttribute("aria-checked", String(selected));
    option.tabIndex = selected ? 0 : -1;
  }

  const marker = navTravelMarker;
  if (oldRect && navCluster && marker) {
    requestAnimationFrame(() => {
      const newRect = navCluster.getBoundingClientRect();
      navTravelAnimation = marker.animate(
        [
          {
            left: marker.style.left,
            top: marker.style.top,
          },
          {
            left: `${newRect.left + newRect.width / 2}px`,
            top: `${newRect.top + newRect.height / 2}px`,
          },
        ],
        {
          duration: 620,
          easing: "cubic-bezier(0.22, 1, 0.36, 1)",
        },
      );
      navTravelAnimation.addEventListener("finish", () => {
        marker.remove();
        navTravelMarker = undefined;
        navCluster.style.visibility = "";
        navArrivalAnimation = navCluster.animate(
          [
            { opacity: 0, transform: "scale(0.86)" },
            { opacity: 1, transform: "scale(1)" },
          ],
          {
            duration: 260,
            easing: "cubic-bezier(0.22, 1, 0.36, 1)",
          },
        );
      });
    });
  }

  if (!persist) return;
  try {
    localStorage.setItem("nav-placement", placement);
  } catch {
    // Storage can be unavailable. The choice still applies for this visit.
  }
}

if (placementOptions.length > 0) {
  applyPlacement(readPlacement(document.documentElement.dataset.navPlacement), false);

  for (const option of placementOptions) {
    option.addEventListener("click", () => {
      applyPlacement(readPlacement(option.dataset.navPlacementOption), true);
    });
  }

  const group = placementOptions[0]?.closest<HTMLElement>("[role='radiogroup']");
  group?.addEventListener("keydown", (event) => {
    const current = document.activeElement;
    if (!(current instanceof HTMLButtonElement) || !placementOptions.includes(current)) return;
    const index = placementOptions.indexOf(current);
    let next = index;
    if (event.key === "ArrowDown" || event.key === "ArrowRight") next = (index + 1) % placementOptions.length;
    else if (event.key === "ArrowUp" || event.key === "ArrowLeft")
      next = (index - 1 + placementOptions.length) % placementOptions.length;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = placementOptions.length - 1;
    else return;
    event.preventDefault();
    const target = placementOptions[next];
    if (!target) return;
    applyPlacement(readPlacement(target.dataset.navPlacementOption), true);
    target.focus({ preventScroll: true });
  });
}

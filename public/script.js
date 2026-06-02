const timelineSection = document.querySelector(".timeline-section");
const jumpLeft = document.querySelector(".edge-jump-left");
const jumpRight = document.querySelector(".edge-jump-right");
let isDragging = false;
let dragStartX = 0;
let scrollStartX = 0;
let lastDragX = 0;
let lastDragTime = 0;
let velocity = 0;
let frameId = 0;
let travelFrameId = 0;

const isMobile = () => window.matchMedia("(max-width: 760px)").matches;

const stopMomentum = () => {
  if (frameId) {
    cancelAnimationFrame(frameId);
    frameId = 0;
  }
  if (travelFrameId) {
    cancelAnimationFrame(travelFrameId);
    travelFrameId = 0;
  }
};

const startMomentum = () => {
  stopMomentum();

  const step = () => {
    if (!timelineSection || Math.abs(velocity) < 0.12) {
      velocity = 0;
      frameId = 0;
      return;
    }

    timelineSection.scrollLeft += velocity;
    velocity *= 0.92;
    frameId = requestAnimationFrame(step);
  };

  frameId = requestAnimationFrame(step);
};

const travelTo = (targetLeft) => {
  if (!timelineSection) {
    return;
  }

  stopMomentum();
  velocity = 0;

  const startLeft = timelineSection.scrollLeft;
  const distance = targetLeft - startLeft;
  if (Math.abs(distance) < 1) {
    return;
  }

  const maxDistance = Math.max(1, timelineSection.scrollWidth - timelineSection.clientWidth);
  const duration = Math.max(450, 3000 * (Math.abs(distance) / maxDistance));
  const startTime = performance.now();
  const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

  const step = (now) => {
    if (!timelineSection) {
      travelFrameId = 0;
      return;
    }

    const progress = Math.min(1, (now - startTime) / duration);
    timelineSection.scrollLeft = startLeft + distance * easeOutCubic(progress);

    if (progress >= 1) {
      timelineSection.scrollLeft = targetLeft;
      travelFrameId = 0;
      return;
    }

    travelFrameId = requestAnimationFrame(step);
  };

  travelFrameId = requestAnimationFrame(step);
};

document.addEventListener(
  "wheel",
  (event) => {
    if (!timelineSection || isMobile() || event.ctrlKey) {
      return;
    }

    const delta = Math.abs(event.deltaY) >= Math.abs(event.deltaX)
      ? event.deltaY
      : event.deltaX;

    if (delta === 0) {
      return;
    }

    event.preventDefault();
    velocity += delta * 0.16;
    velocity = Math.max(-90, Math.min(90, velocity));
    startMomentum();
  },
  { passive: false },
);

timelineSection?.addEventListener("pointerdown", (event) => {
  if (isMobile()) {
    return;
  }

  isDragging = true;
  dragStartX = event.clientX;
  lastDragX = event.clientX;
  lastDragTime = performance.now();
  scrollStartX = timelineSection.scrollLeft;
  velocity = 0;
  stopMomentum();
  timelineSection.setPointerCapture(event.pointerId);
  timelineSection.classList.add("is-dragging");
});

timelineSection?.addEventListener("pointermove", (event) => {
  if (!isDragging || isMobile()) {
    return;
  }

  const now = performance.now();
  const dx = event.clientX - lastDragX;
  const dt = Math.max(1, now - lastDragTime);

  timelineSection.scrollLeft = scrollStartX - (event.clientX - dragStartX);
  velocity = -(dx / dt) * 16;
  lastDragX = event.clientX;
  lastDragTime = now;
});

timelineSection?.addEventListener("pointerup", () => {
  isDragging = false;
  timelineSection?.classList.remove("is-dragging");
  startMomentum();
});

timelineSection?.addEventListener("pointercancel", () => {
  isDragging = false;
  timelineSection?.classList.remove("is-dragging");
  startMomentum();
});

jumpLeft?.addEventListener("click", () => {
  if (!timelineSection) {
    return;
  }

  velocity = 0;
  stopMomentum();
  travelTo(0);
});

jumpRight?.addEventListener("click", () => {
  if (!timelineSection) {
    return;
  }

  velocity = 0;
  stopMomentum();
  travelTo(timelineSection.scrollWidth - timelineSection.clientWidth);
});

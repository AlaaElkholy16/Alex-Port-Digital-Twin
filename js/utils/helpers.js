export function el(tag, className, textContent) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (textContent !== undefined) element.textContent = textContent;
  return element;
}

export function formatNumber(value) {
  return new Intl.NumberFormat('en-US', { maximumFractionDigits: 1 }).format(value);
}

export function formatTimestamp(isoString) {
  const date = new Date(isoString);
  return date.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

export function attachTooltip(element, contentProvider) {
  const tooltip = document.getElementById('tooltip');
  if (!tooltip) return;

  element.addEventListener('pointerenter', (event) => {
    const html = contentProvider(event);
    if (!html) return;
    tooltip.innerHTML = html;
    tooltip.classList.remove('hidden');
    moveTooltip(event, tooltip);
  });

  element.addEventListener('pointermove', (event) => moveTooltip(event, tooltip));

  element.addEventListener('pointerleave', () => {
    tooltip.classList.add('hidden');
    tooltip.innerHTML = '';
  });
}

function moveTooltip(event, tooltip) {
  const offset = 16;
  tooltip.style.left = `${event.clientX + offset}px`;
  tooltip.style.top = `${event.clientY + offset}px`;
}

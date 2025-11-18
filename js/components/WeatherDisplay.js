import { el } from '../utils/helpers.js';

export class WeatherDisplay {
  constructor(container, constraints) {
    this.container = container;
    this.render(constraints);
  }

  render(constraints) {
    if (!this.container) return;
    this.container.innerHTML = '';
    const title = el('h1', 'weather-title', 'Port Weather & Limits');
    const list = el('ul', 'weather-list');
    list.append(
      this.weatherItem('Wind Limit', `${constraints.wind_limit_knots} kn`),
      this.weatherItem('Wave Limit', `${constraints.wave_limit_m} m`),
      this.weatherItem('Visibility', `${constraints.visibility_limit_nm} nm`)
    );

    const now = new Date();
    const meta = el(
      'p',
      'weather-meta',
      `Updated ${now.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}`
    );
    this.container.append(title, list, meta);
  }

  weatherItem(label, value) {
    const item = el('li', 'weather-item');
    item.append(el('span', 'weather-label', label), el('span', 'weather-value', value));
    return item;
  }
}

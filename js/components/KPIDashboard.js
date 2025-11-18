import { el, formatNumber } from '../utils/helpers.js';

export class KPIDashboard {
  constructor(container, data) {
    this.container = container;
    this.render(data);
  }

  render(data) {
    if (!this.container) return;
    this.container.innerHTML = '';

    const title = el('h2', 'panel-title', 'Port KPIs');
    this.container.appendChild(title);

    const primaryGrid = el('div', 'kpi-grid');
    primaryGrid.append(
      this.metricCard('Berth Occupancy', `${data.berth_occupancy}%`),
      this.metricCard('Crane Productivity', `${data.crane_productivity} moves/hr`),
      this.metricCard('Vessel Turnaround', `${data.vessel_turnaround_time} hrs`),
      this.metricCard('Yard Utilization', `${data.yard_utilization}%`),
      this.metricCard('Gate Traffic', `${data.gate_traffic} trucks/hr`)
    );
    this.container.appendChild(primaryGrid);

    const throughput = el('div', 'kpi-section');
    throughput.appendChild(el('h3', 'panel-subtitle', 'Container Throughput')); 
    const throughputList = el('ul', 'kpi-list');
    throughputList.append(
      this.listItem('Daily', `${formatNumber(data.container_throughput.daily)} TEU`),
      this.listItem('Monthly', `${formatNumber(data.container_throughput.monthly)} TEU`),
      this.listItem('Yearly', `${formatNumber(data.container_throughput.yearly)} TEU`)
    );
    throughput.appendChild(throughputList);
    this.container.appendChild(throughput);
  }

  metricCard(label, value) {
    const card = el('div', 'kpi-card');
    card.append(el('span', 'kpi-label', label), el('span', 'kpi-value', value));
    return card;
  }

  listItem(label, value) {
    const item = el('li', 'kpi-list-item');
    item.append(el('span', 'kpi-list-label', label), el('span', 'kpi-list-value', value));
    return item;
  }
}

import { el, formatTimestamp } from '../utils/helpers.js';

export class ScenarioPlayer {
  constructor(container, scenarios, vesselTracker) {
    this.container = container;
    this.scenarios = scenarios;
    this.vesselTracker = vesselTracker;
    this.activeScenarioKey = null;
    this.render();
  }

  render() {
    if (!this.container) return;
    this.container.innerHTML = '';

    const header = el('div', 'scenario-header');
    header.appendChild(el('h2', 'panel-title', 'Scenario Controls'));
    this.statusLabel = el('span', 'scenario-status', 'Select a scenario');
    header.appendChild(this.statusLabel);
    this.container.appendChild(header);

    const buttonsRow = el('div', 'scenario-buttons');
    Object.keys(this.scenarios).forEach((key) => {
      const button = el('button', 'scenario-button', this.labelForScenario(key));
      button.addEventListener('click', () => this.playScenario(key));
      buttonsRow.appendChild(button);
    });
    this.container.appendChild(buttonsRow);

    this.details = el('div', 'scenario-details');
    this.container.appendChild(this.details);
  }

  labelForScenario(key) {
    return key
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase());
  }

  playScenario(key) {
    const scenario = this.scenarios[key];
    if (!scenario) return;
    this.activeScenarioKey = key;
    this.statusLabel.textContent = `Playing ${this.labelForScenario(key)} (${formatTimestamp(
      scenario.timestamp
    )})`;

    this.renderScenarioDetails(scenario);
    if (scenario.route) {
      this.vesselTracker.playRoute(scenario.route);
    }
  }

  renderScenarioDetails(scenario) {
    this.details.innerHTML = '';

    if (scenario.vessel) {
      const vesselCard = el('div', 'scenario-card');
      vesselCard.appendChild(el('h3', 'panel-subtitle', scenario.vessel.name));
      vesselCard.appendChild(
        el(
          'p',
          'scenario-text',
          `${scenario.vessel.type} • ${scenario.vessel.length_m} m • Draft ${scenario.vessel.draft_m} m`
        )
      );
      this.details.appendChild(vesselCard);
    }

    if (scenario.waiting_vessels) {
      const waitCard = el('div', 'scenario-card');
      waitCard.appendChild(el('h3', 'panel-subtitle', 'Waiting Vessels'));
      const list = el('ul', 'kpi-list');
      scenario.waiting_vessels.forEach((vessel) => {
        const item = el('li', 'kpi-list-item');
        item.append(
          el('span', 'kpi-list-label', `${vessel.name}`),
          el('span', 'kpi-list-value', `${vessel.waiting_time_hours} hrs`)
        );
        list.appendChild(item);
      });
      waitCard.appendChild(list);
      this.details.appendChild(waitCard);
    }

    if (scenario.kpi_impact) {
      const impactCard = el('div', 'scenario-card');
      impactCard.appendChild(el('h3', 'panel-subtitle', 'KPI Impact'));
      const list = el('ul', 'kpi-list');
      Object.entries(scenario.kpi_impact).forEach(([label, value]) => {
        const formattedLabel = label.replace(/_/g, ' ');
        const item = el('li', 'kpi-list-item');
        item.append(el('span', 'kpi-list-label', formattedLabel), el('span', 'kpi-list-value', value));
        list.appendChild(item);
      });
      impactCard.appendChild(list);
      this.details.appendChild(impactCard);
    }
  }
}

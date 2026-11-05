import { NoiseSensor } from './models/NoiseSensor.js';
import { MobileNoiseSensor } from './models/MobileNoiseSensor.js';
import { MonitoringSystem } from './services/MonitoringSystem.js';
import { initialSensorsData } from './data/sensorsData.js';
import { runPrototypeExperiments } from './prototype-demo.js';
import { NOISE_STATUS } from './config/thresholds.js';

const system = new MonitoringSystem('Акустична варта — Київ');

initialSensorsData.forEach(item => {
    let sensor;
    if (item.type === 'mobile') {
        sensor = new MobileNoiseSensor(
            item.id,
            item.district,
            item.location,
            item.noiseLevel,
            item.batteryLevel
        );
    } else {
        sensor = new NoiseSensor(
            item.id,
            item.district,
            item.location,
            item.noiseLevel
        );
    }
    system.addSensor(sensor);
});

function getBadgeClass(status) {
    switch (status) {
        case NOISE_STATUS.NORMAL:
            return 'badge-success';
        case NOISE_STATUS.WARNING:
            return 'badge-warning';
        case NOISE_STATUS.CRITICAL:
            return 'badge-danger';
        default:
            return 'badge-secondary';
    }
}

function renderSensorCard(sensor) {
    const status = sensor.getStatus();
    const statusLabel = sensor.getStatusLabel();
    const badgeClass = getBadgeClass(status);
    const isMobile = sensor instanceof MobileNoiseSensor;

    const article = document.createElement('article');
    article.className = `metric-card sensor-card sensor-${status}`;
    article.setAttribute('data-sensor-id', sensor.id);

    article.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
            <span class="metric-title">${sensor.id} • ${sensor.district}</span>
            <span class="${badgeClass}">${statusLabel}</span>
        </div>
        <h3 class="metric-value">${sensor.noiseLevel} дБ</h3>
        <p class="metric-desc" title="${sensor.location}">${sensor.location}</p>
        ${isMobile ? `<small style="margin-top: 8px; color: #64748b; font-size: 11px;">🔋 Батарея: ${sensor.batteryLevel}% (Мобільний)</small>` : ''}
        <div style="margin-top: 12px; display: flex; gap: 6px;">
            <button class="simulate-btn" data-action="decrease" style="padding: 4px 8px; font-size: 12px; border-radius: 4px; border: 1px solid #cbd5e1; background: #fff; cursor: pointer;">-5 дБ</button>
            <button class="simulate-btn" data-action="increase" style="padding: 4px 8px; font-size: 12px; border-radius: 4px; border: 1px solid #cbd5e1; background: #fff; cursor: pointer;">+5 дБ</button>
        </div>
    `;

    return article;
}

function renderTableRows(sensors) {
    const tbody = document.querySelector('.table-container tbody');
    if (!tbody) return;

    tbody.innerHTML = '';
    const nowFormatted = new Date().toLocaleDateString('uk-UA') + ' ' + new Date().toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' });

    sensors.forEach(sensor => {
        const tr = document.createElement('tr');
        const status = sensor.getStatus();
        const statusClass = status === NOISE_STATUS.CRITICAL 
            ? 'danger-status' 
            : status === NOISE_STATUS.WARNING 
                ? 'warning-status' 
                : 'success-status';

        const textClass = status === NOISE_STATUS.CRITICAL ? 'danger-text' : '';

        tr.innerHTML = `
            <td>${nowFormatted}</td>
            <td>${sensor.location} (${sensor.district})</td>
            <td class="${textClass}">${sensor.noiseLevel} дБ</td>
            <td class="${statusClass}">${sensor.getStatusLabel()}</td>
        `;
        tbody.appendChild(tr);
    });
}

function renderUI() {
    const grid = document.querySelector('.metrics-grid');
    if (!grid) return;

    grid.innerHTML = '';
    const sensors = system.getAllSensors();

    sensors.forEach(sensor => {
        grid.appendChild(renderSensorCard(sensor));
    });

    renderTableRows(sensors);

    const alertBox = document.querySelector('.alert-box');
    const criticals = system.getCriticalSensors();
    if (alertBox) {
        if (criticals.length > 0) {
            alertBox.style.display = 'block';
            const list = criticals.map(s => `${s.id} (${s.location}) — ${s.noiseLevel} дБ`).join('; ');
            alertBox.innerHTML = `
                <h3>Увага! Зафіксовано критичні рівні шуму!</h3>
                <p>Критичні сенсори: ${list}.</p>
            `;
        } else {
            alertBox.innerHTML = `
                <h3 style="color: #16a34a;">Усі показники в межах норми</h3>
                <p>Критичних перевищень у місті наразі не виявлено. Середній рівень: ${system.getAverageNoiseLevel()} дБ.</p>
            `;
            alertBox.style.borderColor = '#bbf7d0';
            alertBox.style.background = '#f0fdf4';
        }
    }
}

function setupEventListeners() {
    const grid = document.querySelector('.metrics-grid');
    if (grid) {
        grid.addEventListener('click', (event) => {
            const btn = event.target.closest('.simulate-btn');
            if (!btn) return;

            const card = btn.closest('.sensor-card');
            const sensorId = card?.dataset.sensorId;
            const action = btn.dataset.action;

            const sensor = system.findSensorById(sensorId);
            if (!sensor) return;

            try {
                const step = action === 'increase' ? 5 : -5;
                const newLevel = Math.max(30, Math.min(130, sensor.noiseLevel + step));
                sensor.updateNoiseLevel(newLevel);
                console.log(`[Оновлено ${sensor.id}]: новий рівень = ${newLevel} дБ, статус = ${sensor.getStatus()}`);
                renderUI();
            } catch (error) {
                console.error(`Помилка оновлення сенсора:`, error.message);
            }
        });
    }

    const btnAll = document.getElementById('btn-all');
    const btnCritical = document.getElementById('btn-critical');
    const btnStats = document.getElementById('btn-stats');

    if (btnAll) {
        btnAll.addEventListener('click', () => {
            renderUI();
            btnAll.style.background = '#16a34a';
            btnAll.style.color = '#fff';
            if (btnCritical) {
                btnCritical.style.background = '#fff';
                btnCritical.style.color = '#dc2626';
            }
        });
    }

    if (btnCritical) {
        btnCritical.addEventListener('click', () => {
            const criticals = system.getCriticalSensors();
            const grid = document.querySelector('.metrics-grid');
            if (!grid) return;
            grid.innerHTML = '';
            if (criticals.length === 0) {
                grid.innerHTML = '<p style="padding: 16px; color: #16a34a; font-weight: bold;">Критичних датчиків наразі немає!</p>';
            } else {
                criticals.forEach(s => grid.appendChild(renderSensorCard(s)));
            }
            btnCritical.style.background = '#dc2626';
            btnCritical.style.color = '#fff';
            if (btnAll) {
                btnAll.style.background = '#fff';
                btnAll.style.color = '#16a34a';
            }
        });
    }

    if (btnStats) {
        btnStats.addEventListener('click', () => {
            console.group("Статистика системи моніторингу (MonitoringSystem)");
            console.log("Загальна кількість:", system.getTotalCount());
            console.log("Середній рівень шуму:", system.getAverageNoiseLevel(), "дБ");
            console.log("Критичні датчики:", system.getCriticalSensors().map(s => `${s.id}: ${s.noiseLevel} дБ`));
            console.table(system.getStatistics());
            console.groupEnd();
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    console.log("Ініціалізація системи моніторингу на базі класів ES6...");
    console.log("Завантажено сенсорів:", system.getTotalCount());
    console.log("Середній рівень шуму:", system.getAverageNoiseLevel(), "дБ");

    runPrototypeExperiments();

    renderUI();
    setupEventListeners();

    console.log("Колекція сенсорів у системі:");
    console.table(system.getAllSensors().map(s => ({
        ID: s.id,
        Район: s.district,
        Рівень: `${s.noiseLevel} дБ`,
        Статус: s.getStatusLabel(),
        Тип: s instanceof MobileNoiseSensor ? 'Mobile' : 'Stationary'
    })));
});

window.acousticWatch = {
    system,
    NoiseSensor,
    MobileNoiseSensor,
    renderUI
};

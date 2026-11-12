import { sensors } from './data/sensorsData.js';

const sensorList = document.querySelector(".sensor-list");
const districtFilter = document.querySelector("#district-filter");
const criticalFilter = document.querySelector("#critical-filter");

function getStatusColor(status) {
    switch (status) {
        case "normal":   return "#16a34a";
        case "warning":  return "#eab308";
        case "critical": return "#dc2626";
        default:         return "#6b7280";
    }
}

function getNoiseColor(status) {
    switch (status) {
        case "normal":   return "#16a34a";
        case "warning":  return "#d97706";
        case "critical": return "#dc2626";
        default:         return "#2d2d2d";
    }
}

function createSensorCard(sensor) {
    const card = document.createElement("article");
    card.className = `sensor-card sensor-card--${sensor.status}`;

    const header = document.createElement("div");
    header.className = "sensor-card__header";

    const sensorId = document.createElement("h3");
    sensorId.className = "sensor-card__id";
    sensorId.textContent = sensor.id;

    const badge = document.createElement("span");
    badge.className = `sensor-card__badge sensor-card__badge--${sensor.status}`;
    badge.textContent = sensor.status;

    const dot = document.createElement("span");
    dot.className = "sensor-card__dot";
    dot.style.backgroundColor = getStatusColor(sensor.status);
    badge.prepend(dot);

    header.appendChild(sensorId);
    header.appendChild(badge);

    const body = document.createElement("div");
    body.className = "sensor-card__body";

    const districtLine = document.createElement("p");
    districtLine.className = "sensor-card__info";
    districtLine.innerHTML = `<span class="sensor-card__icon">📍</span> ${sensor.district}`;

    const locationLine = document.createElement("p");
    locationLine.className = "sensor-card__info";
    locationLine.innerHTML = `<span class="sensor-card__icon">🏠</span> ${sensor.location}`;

    const noiseLine = document.createElement("p");
    noiseLine.className = "sensor-card__noise";
    noiseLine.innerHTML = `<span class="sensor-card__icon">🔊</span> Рівень шуму: <strong style="color: ${getNoiseColor(sensor.status)}">${sensor.noiseLevel} дБ</strong>`;

    body.appendChild(districtLine);
    body.appendChild(locationLine);
    body.appendChild(noiseLine);

    card.appendChild(header);
    card.appendChild(body);

    return card;
}

function renderSensors(sensorArray) {
    sensorList.innerHTML = "";

    if (sensorArray.length === 0) {
        const empty = document.createElement("p");
        empty.className = "sensor-list__empty";
        empty.textContent = "Сенсорів за вибраними фільтрами не знайдено.";
        sensorList.appendChild(empty);
        return;
    }

    sensorArray.forEach(sensor => {
        const card = createSensorCard(sensor);
        sensorList.appendChild(card);
    });
}

function populateDistrictFilter() {
    const districts = [...new Set(sensors.map(s => s.district))];
    districts.forEach(district => {
        const option = document.createElement("option");
        option.value = district;
        option.textContent = district;
        districtFilter.appendChild(option);
    });
}

function applyFilters() {
    const selectedDistrict = districtFilter.value;
    const onlyCritical = criticalFilter.checked;

    const filtered = sensors.filter(sensor => {
        const matchesDistrict = selectedDistrict === "" || sensor.district === selectedDistrict;
        const matchesStatus = !onlyCritical || sensor.status === "critical";
        return matchesDistrict && matchesStatus;
    });

    renderSensors(filtered);
}

districtFilter.addEventListener("change", applyFilters);
criticalFilter.addEventListener("change", applyFilters);

populateDistrictFilter();
renderSensors(sensors);

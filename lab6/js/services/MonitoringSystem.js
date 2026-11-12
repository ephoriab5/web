import { NoiseSensor } from '../models/NoiseSensor.js';
import { NOISE_STATUS } from '../config/thresholds.js';

export class MonitoringSystem {
    constructor(title = 'Акустична варта') {
        this.title = title;
        this.sensors = [];
    }

    addSensor(sensor) {
        if (!(sensor instanceof NoiseSensor)) {
            throw new TypeError("Об'єкт повинен бути екземпляром NoiseSensor або його нащадка");
        }

        const isDuplicate = this.sensors.some(existing => existing.id === sensor.id);
        if (isDuplicate) {
            throw new Error(`Сенсор з id="${sensor.id}" вже існує в системі`);
        }

        this.sensors.push(sensor);
        return sensor;
    }

    addSensors(sensorsArray) {
        if (!Array.isArray(sensorsArray)) {
            throw new TypeError("Очікується масив сенсорів");
        }
        sensorsArray.forEach(sensor => this.addSensor(sensor));
        return this.sensors.length;
    }

    findSensorById(id) {
        const stringId = String(id);
        return this.sensors.find(sensor => sensor.id === stringId) || null;
    }

    getSensorsByDistrict(district) {
        if (!district) return [];
        const query = district.trim().toLowerCase();
        return this.sensors.filter(sensor => 
            sensor.district.toLowerCase().includes(query)
        );
    }

    getCriticalSensors() {
        return this.sensors.filter(sensor => 
            sensor.getStatus() === NOISE_STATUS.CRITICAL
        );
    }

    getAverageNoiseLevel() {
        const activeSensors = this.sensors.filter(s => s.noiseLevel > 0);
        if (activeSensors.length === 0) {
            return 0;
        }

        const sum = activeSensors.reduce((total, sensor) => total + sensor.noiseLevel, 0);
        return Number((sum / activeSensors.length).toFixed(1));
    }

    getAllSensors() {
        return [...this.sensors];
    }

    getTotalCount() {
        return this.sensors.length;
    }

    removeSensor(id) {
        const stringId = String(id);
        const index = this.sensors.findIndex(sensor => sensor.id === stringId);
        if (index === -1) {
            return false;
        }
        this.sensors.splice(index, 1);
        return true;
    }

    getStatistics() {
        const normal = this.sensors.filter(s => s.getStatus() === NOISE_STATUS.NORMAL).length;
        const warning = this.sensors.filter(s => s.getStatus() === NOISE_STATUS.WARNING).length;
        const critical = this.sensors.filter(s => s.getStatus() === NOISE_STATUS.CRITICAL).length;

        return {
            total: this.sensors.length,
            average: this.getAverageNoiseLevel(),
            normal,
            warning,
            critical
        };
    }
}


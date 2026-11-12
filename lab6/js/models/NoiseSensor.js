import { NOISE_THRESHOLDS, NOISE_STATUS } from '../config/thresholds.js';
import { NoiseMeasurement } from './NoiseMeasurement.js';

export class NoiseSensor {
    constructor(id, district, location, noiseLevel = 0) {
        if (!id) {
            throw new Error("Ідентифікатор сенсора (id) є обов'язковим");
        }

        this.id = String(id);
        this.district = district || 'Невідомий район';
        this.location = location || 'Локація не вказана';
        this.measurements = [];

        if (NoiseSensor.isValidNoiseLevel(noiseLevel)) {
            this.noiseLevel = Number(noiseLevel);
            this.measurements.push(new NoiseMeasurement(this.noiseLevel));
        } else {
            this.noiseLevel = 0;
        }
    }

    getStatus() {
        if (this.noiseLevel <= NOISE_THRESHOLDS.WARNING_LIMIT) {
            return NOISE_STATUS.NORMAL;
        }
        if (this.noiseLevel <= NOISE_THRESHOLDS.CRITICAL_LIMIT) {
            return NOISE_STATUS.WARNING;
        }
        return NOISE_STATUS.CRITICAL;
    }

    getStatusLabel() {
        const status = this.getStatus();
        switch (status) {
            case NOISE_STATUS.NORMAL:
                return 'Норма';
            case NOISE_STATUS.WARNING:
                return 'Попередження';
            case NOISE_STATUS.CRITICAL:
                return 'Критичний';
            default:
                return 'Невідомо';
        }
    }

    updateNoiseLevel(value) {
        if (!NoiseSensor.isValidNoiseLevel(value)) {
            throw new Error(`Некоректний рівень шуму: ${value}. Допустимий діапазон: ${NOISE_THRESHOLDS.MIN_VALID}..${NOISE_THRESHOLDS.MAX_VALID} дБ`);
        }

        this.noiseLevel = Number(value);
        const measurement = new NoiseMeasurement(this.noiseLevel);
        this.measurements.push(measurement);
        return measurement;
    }

    addMeasurement(measurement) {
        if (measurement instanceof NoiseMeasurement) {
            this.measurements.push(measurement);
            this.noiseLevel = measurement.value;
        } else if (NoiseSensor.isValidNoiseLevel(measurement)) {
            this.updateNoiseLevel(measurement);
        } else {
            throw new Error("Некоректний формат вимірювання");
        }
    }

    getHistory() {
        return [...this.measurements];
    }

    static isValidNoiseLevel(value) {
        return typeof value === 'number' &&
               Number.isFinite(value) &&
               value >= NOISE_THRESHOLDS.MIN_VALID &&
               value <= NOISE_THRESHOLDS.MAX_VALID;
    }

    static fromObject(data) {
        if (!data || typeof data !== 'object') {
            throw new Error("Дані мають бути об'єктом");
        }

        const sensor = new NoiseSensor(
            data.id,
            data.district,
            data.location,
            data.noiseLevel ?? data.level
        );

        if (Array.isArray(data.measurements)) {
            data.measurements.forEach(m => {
                if (m instanceof NoiseMeasurement) {
                    sensor.measurements.push(m);
                } else if (typeof m === 'object' && m.value !== undefined) {
                    sensor.measurements.push(new NoiseMeasurement(m.value, m.timestamp));
                }
            });
        }

        return sensor;
    }
}


import { NOISE_THRESHOLDS, NOISE_STATUS } from '../config/thresholds.js';

export class NoiseMeasurement {
    constructor(value, timestamp = new Date()) {
        this.value = Number(value);
        this.timestamp = timestamp instanceof Date ? timestamp : new Date(timestamp);
    }

    getStatus() {
        if (this.value <= NOISE_THRESHOLDS.WARNING_LIMIT) {
            return NOISE_STATUS.NORMAL;
        }
        if (this.value <= NOISE_THRESHOLDS.CRITICAL_LIMIT) {
            return NOISE_STATUS.WARNING;
        }
        return NOISE_STATUS.CRITICAL;
    }

    getFormattedTime() {
        return this.timestamp.toLocaleTimeString('uk-UA', {
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    toString() {
        return `${this.value} дБ (${this.getFormattedTime()})`;
    }
}


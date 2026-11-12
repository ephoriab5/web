import { NoiseSensor } from './NoiseSensor.js';

export class MobileNoiseSensor extends NoiseSensor {
    constructor(id, district, location, noiseLevel = 0, batteryLevel = 100, gps = null) {
        super(id, district, location, noiseLevel);

        this.batteryLevel = Math.max(0, Math.min(100, Number(batteryLevel) || 0));
        this.gps = gps || { lat: 50.4501, lng: 30.5234 };
    }

    isBatteryLow() {
        return this.batteryLevel < 20;
    }

    charge(amount = 100) {
        this.batteryLevel = Math.min(100, this.batteryLevel + Number(amount));
        return this.batteryLevel;
    }

    updateNoiseLevel(value) {
        if (this.batteryLevel <= 0) {
            throw new Error(`Мобільний сенсор ${this.id} розряджений! Оновлення неможливе.`);
        }

        const measurement = super.updateNoiseLevel(value);
        this.batteryLevel = Math.max(0, this.batteryLevel - 1);
        return measurement;
    }
}


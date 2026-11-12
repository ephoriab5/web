import { NoiseSensor } from './models/NoiseSensor.js';
import { MobileNoiseSensor } from './models/MobileNoiseSensor.js';

export function runPrototypeExperiments() {
    console.groupCollapsed("Експерименти з прототипами та наслідуванням (Крок 6)");

    const baseSensor = new NoiseSensor('S-BASE', 'Печерський', 'вул. Інститутська', 52);
    const anotherBaseSensor = new NoiseSensor('S-BASE-2', 'Подільський', 'вул. Сагайдачного', 61);
    const mobileSensor = new MobileNoiseSensor('M-01', 'Шевченківський', 'Патруль №3', 68, 85);

    console.log("1. Перевірка ланцюжка прототипів (instanceof):");
    console.log("mobileSensor instanceof MobileNoiseSensor:", mobileSensor instanceof MobileNoiseSensor);
    console.log("mobileSensor instanceof NoiseSensor:", mobileSensor instanceof NoiseSensor);
    console.log("baseSensor instanceof MobileNoiseSensor:", baseSensor instanceof MobileNoiseSensor);

    console.log("2. Перевірка спільних методів у прототипі (пам'ять):");
    console.log(
        "baseSensor.getStatus === anotherBaseSensor.getStatus:",
        baseSensor.getStatus === anotherBaseSensor.getStatus
    );

    console.log("3. Перевірка власних (own) vs прототипних властивостей (Object.hasOwn):");
    console.log("Власна властивість 'id':", Object.hasOwn(baseSensor, 'id'));
    console.log("Власна властивість 'noiseLevel':", Object.hasOwn(baseSensor, 'noiseLevel'));
    console.log("Власна властивість 'batteryLevel' у mobile:", Object.hasOwn(mobileSensor, 'batteryLevel'));
    console.log("Чи є 'getStatus' власною властивістю екземпляра:", Object.hasOwn(baseSensor, 'getStatus'));
    console.log("Чи є 'getStatus' у прототипі NoiseSensor:", Object.hasOwn(NoiseSensor.prototype, 'getStatus'));

    console.groupEnd();
}


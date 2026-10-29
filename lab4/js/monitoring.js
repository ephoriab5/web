const warningLevel = 70;
const criticalLevel = 85;
const minValid = 30;
const maxValid = 130;

const noiseLevels = [
    45, 68, 72, 88, 65, 40, 140, 25, 71, 69, 86, 60, 55, 
    62, 75, 80, 91, 74, 68, 65, 59, -1, 70, 85, 86, 64, 141, 58
];

const formatDb = value => `${value} dB`;

const isValidLevel = (level, min, max) => 
    typeof level === 'number' && Number.isFinite(level) && level >= min && level <= max;

const countByCategory = function(levels, warnLimit, critLimit, minL, maxL) {
    let normal = 0;
    let warning = 0;
    let critical = 0;

    for (const level of levels) {
        if (!isValidLevel(level, minL, maxL)) {
            continue;
        }

        if (level <= warnLimit) {
            normal++;
        } else if (level <= critLimit) {
            warning++;
        } else {
            critical++;
        }
    }

    return { normal, warning, critical };
};

function calculateStats(levels, minL, maxL) {
    let sum = 0;
    let count = 0;
    let min = null;
    let max = null;

    for (const level of levels) {
        if (!isValidLevel(level, minL, maxL)) {
            continue;
        }

        sum += level;
        count++;

        if (min === null) {
            min = level;
            max = level;
        } else {
            if (level < min) min = level;
            if (level > max) max = level;
        }
    }

    if (count === 0) {
        return { average: null, min: null, max: null };
    }

    const average = Number((sum / count).toFixed(2));
    return { average, min, max };
}

function findFirstCritical(levels, critLimit, minL, maxL) {
    for (let i = 0; i < levels.length; i++) {
        const level = levels[i];
        if (isValidLevel(level, minL, maxL) && level > critLimit) {
            return { value: level, position: i + 1 };
        }
    }
    return null;
}

function findRecovery(levels, startIndex, warnLimit, minL, maxL) {
    if (startIndex === null || startIndex >= levels.length) {
        return null;
    }

    let safeStreak = 0;
    let i = startIndex;

    while (i < levels.length) {
        const level = levels[i];
        const isSafe = isValidLevel(level, minL, maxL) && level <= warnLimit;

        if (isSafe) {
            safeStreak++;
            if (safeStreak === 3) {
                return i + 1;
            }
        } else {
            safeStreak = 0;
        }
        i++;
    }

    return null;
}

function findFirstValid(levels, minL, maxL) {
    if (!levels || levels.length === 0) {
        return null;
    }

    let i = 0;
    do {
        const level = levels[i];
        if (isValidLevel(level, minL, maxL)) {
            return { value: level, position: i + 1 };
        }
        i++;
    } while (i < levels.length);

    return null;
}

function runAnalysisWithCallback(levels, callbackFunction) {
    return callbackFunction(levels, warningLevel, criticalLevel, minValid, maxValid);
}

function generateReport(levels) {
    console.group("Акустична варта -- звіт моніторингу");

    console.log(`Пороги: попередження > ${formatDb(warningLevel)}; критичний рівень > ${formatDb(criticalLevel)}`);

    let invalidItems = [];
    let warningExceededCount = 0;

    for (let i = 0; i < levels.length; i++) {
        const val = levels[i];
        if (!isValidLevel(val, minValid, maxValid)) {
            invalidItems.push(`позиція ${i + 1} (${formatDb(val)})`);
        } else if (val > warningLevel) {
            warningExceededCount++;
        }
    }

    const totalCount = levels.length;
    const invalidCount = invalidItems.length;
    const validCount = totalCount - invalidCount;

    console.log(`Усього вимірювань: ${totalCount}`);
    console.log(`Коректних: ${validCount}`);
    console.log(`Некоректних: ${invalidCount}`);

    const categories = runAnalysisWithCallback(levels, countByCategory);

    console.table([
        { "Категорія": "Без перевищення", "Кількість": categories.normal },
        { "Категорія": "Попередження", "Кількість": categories.warning },
        { "Категорія": "Критичні", "Кількість": categories.critical }
    ]);

    const stats = calculateStats(levels, minValid, maxValid);
    if (stats.average !== null) {
        console.log(`Середній рівень: ${stats.average.toString().replace('.', ',')} dB`);
        console.log(`Мінімальний рівень: ${formatDb(stats.min)}`);
        console.log(`Максимальний рівень: ${formatDb(stats.max)}`);
    } else {
        console.log("Середній рівень: null");
        console.log("Мінімальний рівень: null");
        console.log("Максимальний рівень: null");
    }

    const firstCrit = findFirstCritical(levels, criticalLevel, minValid, maxValid);
    if (firstCrit !== null) {
        console.log(`Перше критичне вимірювання: ${formatDb(firstCrit.value)}, позиція ${firstCrit.position}`);
    } else {
        console.log("Перше критичне вимірювання: не знайдено");
    }

    const recoveryPos = firstCrit !== null 
        ? findRecovery(levels, firstCrit.position, warningLevel, minValid, maxValid) 
        : null;

    if (recoveryPos !== null) {
        console.log(`Відновлення -- три безпечні вимірювання поспіль: позиція ${recoveryPos}`);
    } else {
        console.log("Відновлення -- три безпечні вимірювання поспіль: не знайдено");
    }

    if (warningExceededCount > 0) {
        console.warn(`Поріг ${warningLevel} dB перевищено у ${warningExceededCount} вимірюваннях.`);
    }

    if (invalidItems.length > 0) {
        console.error(`Некоректні дані: ${invalidItems.join(", ")}.`);
    }

    const recoverySummary = recoveryPos !== null 
        ? `відновлення зафіксовано на позиції ${recoveryPos}` 
        : "після першого з них стійкого відновлення не виявлено";

    console.log(`Висновок: зафіксовано ${categories.critical} критичні вимірювання; ${recoverySummary}.`);

    console.groupEnd();
}

generateReport(noiseLevels);

const testArrays = [
    { label: "Порожній масив []", list: [] },
    { label: "Некоректні дані [-1, 141]", list: [-1, 141] },
    { label: "Нормальні дані [70, 85, 86]", list: [70, 85, 86] }
];

testArrays.forEach(test => {
    generateReport(test.list);
});

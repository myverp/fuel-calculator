// Функція для перемикання між вкладками
function openTab(tabName) {
    var tabs = document.querySelectorAll('[id^="fuelCalculator"], [id^="mazutCalculator"]');
    tabs.forEach(function (tab) {
        tab.style.display = "none";
    });

    document.getElementById(tabName).style.display = "block";
}

class FuelCalculator {
    constructor() {
        this.elements = {
            hydrogen: 'fuelHydrogen',
            carbon: 'fuelCarbon',
            sulfur: 'fuelSulfur',
            nitrogen: 'fuelNitrogen',
            oxygen: 'fuelOxygen',
            humidity: 'fuelHumidity',
            ash: 'fuelAsh'
        };
    }

    // Отримання значеннь
    getElementValue(id) {
        return parseFloat(document.getElementById(id).value);
    }
    // Обчислення суми елементів для перевірки
    sumComponents(components) {
        return Object.values(components).reduce((sum, value) => sum + value, 0);
    }

    // Розрахунок коефіцієнтів: з робочої на суху, з робочої на горючу і з горючої на робочу
    calculateXWorkToDry(humidity) {
        return 100 / (100 - humidity);
    }

    calculateXWorkToFlammable(humidity, ash) {
        return 100 / (100 - humidity - ash);
    }


    // Обчислення сухого складу
    calculateDryMassComposition(components, xWorkToDry) {
        const excludedComponents = ['humidity']; // Виключення 
        const filteredValues = Object.entries(components).filter(([key]) => !excludedComponents.includes(key));

        const compositions = filteredValues.map(([key, value]) => {
            const substance = key.charAt(0).toUpperCase() + key.slice(1);
            
            let formattedValue;
            
            if (key === 'humidity') {
                formattedValue = value.toFixed(2);
            } else {
                formattedValue = (value * xWorkToDry).toFixed(2);
            }
            
            return `${substance}: ${formattedValue}${key === 'humidity' ? '' : '%'}`;
        });

        return compositions.join(', ');
    }

    // Обчислення горючого складу
    calculateCombustibleMassComposition(components, xWorkToFlammable) {
        const excludedComponents = ['humidity', 'ash']; // Виключення
        const filteredValues = Object.entries(components).filter(([key]) => !excludedComponents.includes(key));

        const compositions = filteredValues.map(([key, value]) => {
            const substance = key.charAt(0).toUpperCase() + key.slice(1);
            
            let formattedValue;

           if (key === 'humidity' || key === 'ash') {
                formattedValue = value.toFixed(2);
            } else {
                formattedValue = (value * xWorkToFlammable).toFixed(2);
            }

            return `${substance}: ${formattedValue}${(key === 'humidity' || key === 'ash') ? '' : '%'}`;
        });

        return compositions.join(', ');
    }

    // Обчислення нижніх теплот згорання
    calculateLowerHeatOfWork(components, humidity) {
        return (339 * components.carbon + 1030 * components.hydrogen - 108.8 * (components.oxygen - components.sulfur) - 25 * humidity) / 1000;
    }

    calculateLowerHeatOfDry(lowerHeatOfWork, humidity) {
        return (lowerHeatOfWork + 0.025 * humidity) * (100 / (100 - humidity)) ;
    }

    calculateLowerHeatOfFlammable(lowerHeatOfWork, humidity, ash) {
        return (lowerHeatOfWork + 0.025 * humidity) * (100 / (100 - humidity - ash)) ;
    }
    
    calculateFuel() {
        const components = Object.fromEntries(Object.entries(this.elements).map(([key, value]) => [key, this.getElementValue(value)])); // Введені значення
        
        // Перевірка на ввід
        if (this.sumComponents(components) !== 100) {
            alert("Сума введених даних має дорівнювати 100. Будь ласка, введіть дані знову.");
            return;
        }
        
        // Коефіцієнти переведення складу
        const xWorkToDry = this.calculateXWorkToDry(components.humidity).toFixed(2);
        const xWorkToFlammable = this.calculateXWorkToFlammable(components.humidity, components.ash).toFixed(2);

        // Обчислення складу
        const dryMassComposition = this.calculateDryMassComposition(components, xWorkToDry);
        const combustibleMassComposition = this.calculateCombustibleMassComposition(components, xWorkToFlammable);

        //Обчислення теплот
        const lowerHeatOfWork = this.calculateLowerHeatOfWork(components, components.humidity);
        const lowerHeatOfDry = this.calculateLowerHeatOfDry(lowerHeatOfWork, components.humidity);
        const lowerHeatOfFlammable = this.calculateLowerHeatOfFlammable(lowerHeatOfWork, components.humidity, components.ash);

        this.showFuelResults(xWorkToDry, xWorkToFlammable, dryMassComposition, combustibleMassComposition, lowerHeatOfWork.toFixed(2), lowerHeatOfDry.toFixed(2), lowerHeatOfFlammable.toFixed(2));
    }
    
    // Вивід
    showFuelResults(xWorkToDry, xWorkToFlammable, dryMassComposition, combustibleMassComposition, lowerCalorificValueWork, lowerCalorificValueDry, lowerCalorificValueFlammable) {
        document.getElementById('fuelResults').innerHTML = `
            <h3>Fuel Results</h3>
            <p>Kоефіцієнт переходу від робочої до сухої маси становить: ${xWorkToDry}</p>
            <p>Kоефіцієнт переходу від робочої до горючої маси становить: ${xWorkToFlammable}</p>
            <p>Склад сухої маси палива становитиме: ${dryMassComposition}</p>
            <p>Склад горючої маси палива становитиме: ${combustibleMassComposition}</p>
            <p>Нижча теплота згоряння для робочої маси за заданим складом компонентів палива становить: ${lowerCalorificValueWork} MДж/кг;</p>
            <p>Нижча теплота згоряння для сухої маси за заданим складом компонентів палива становить: ${lowerCalorificValueDry} MДж/кг;</p>
            <p>Нижча теплота згоряння для горючої маси за заданим складом компонентів палива становить: ${lowerCalorificValueFlammable} MДж/кг.</p>
        `;
    }
}

class MazutCalculator {
    constructor() {
        this.elements = {
            carbon: 'mazutCarbon',
            hydrogen: 'mazutHydrogen',
            oxygen: 'mazutOxygen',
            sulfur: 'mazutSulfur',
            qDaf: 'mazutQDaf',
            humidity: 'mazutHumidity',
            ash: 'mazutAsh',
            vanadium: 'mazutVanadium'
        };
    }

    getElementValue(id) {
        return parseFloat(document.getElementById(id).value);
    }

    // Обчислення коефіцієнтів
    calculateXFlammableToWork(humidity, ash) {
        return ((100 - humidity - ash) / 100);
    }

    calculateXFlammableToWorkWithoutAsh(humidity) {
        return ((100 - humidity) / 100);
    }

    // Обчислення складу
    calculateWorkMassComposition(components, xFlammableToWork, XFlammableToWorkWithoutAsh) {
        const excludedComponents = ['qDaf', 'humidity']; // Виключення нижчої теплоти згоряння горючої маси мазуту та вологості
        const filteredValues = Object.entries(components).filter(([key]) => !excludedComponents.includes(key));

        const compositions = filteredValues.map(([key, value]) => {
            let substance;
            let formattedValue;

            substance = key.charAt(0).toUpperCase() + key.slice(1); // Перша літера - верхнього регістру

            if (key === 'vanadium') {
                formattedValue = (value * XFlammableToWorkWithoutAsh).toFixed(2); 
                substance += `: ${formattedValue} mg/kg`; // запис Ванадію з mg/kg
            }
            else if (key === 'ash') {
                formattedValue = (value * XFlammableToWorkWithoutAsh).toFixed(2);
                substance += `: ${formattedValue}%`;            
            } else {
                formattedValue = (value * xFlammableToWork).toFixed(2);
                substance += `: ${formattedValue}%`;
            }

            return substance;
        });

        return compositions.join(', ');
    }

    // Нижча теплота згоряння
    calculateLowerHeatOfCombustionFromFlamToWork(qDaf, humidity, ash) {
        return qDaf * ((100 - humidity - ash) / 100) - 0.025 * humidity;
    }    

    calculateMazut() {
        const components = Object.fromEntries(Object.entries(this.elements).map(([key, value]) => [key, this.getElementValue(value)]));
        
    
        const xFlammableToWork = this.calculateXFlammableToWork(components.humidity, components.ash);

        const XFlammableToWorkWithoutAsh = this.calculateXFlammableToWorkWithoutAsh(components.humidity);
        
        const workMassComposition = this.calculateWorkMassComposition(components, xFlammableToWork, XFlammableToWorkWithoutAsh);

        const lowerHeatOfWork = this.calculateLowerHeatOfCombustionFromFlamToWork(components.qDaf, components.humidity, components.ash);

        this.showMazutResults(workMassComposition, lowerHeatOfWork.toFixed(2));
    }
    // Вивід
    showMazutResults(workMassComposition, lowerHeatOfWork) {
        document.getElementById('mazutResults').innerHTML = `
            <h3>Mazut Results</h3>
            <p>Склад робочої маси мазуту становитиме: ${workMassComposition}</p>
            <p>Нижча теплота згоряння для робочої маси мазуту становить: ${lowerHeatOfWork} MДж/кг;</p>
        `;
    }
}

const fuelCalculator = new FuelCalculator();
const mazutCalculator = new MazutCalculator();

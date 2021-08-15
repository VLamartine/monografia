// 785deecc-30f0-44b9-90dc-b0b69dc9a546
// ce74e3f1-df74-4460-8cb0-012f91fa9308
const getDrawFromServer = async () => {
    const path = this.location.pathname.split("/");
    const language = path[1];

    const elemnt = document.getElementById('keyInput');
    const key = elemnt.value;
    if (!key) {
        alert(language === "pt" ? "Por favor, informe a chave" : "Please enter the key");
        return;
    }
    clearAll();
    const r = await fetch(`https://monografia-server.herokuapp.com/${key}`);
    const response = await r.json();
    if (!response.value) {
        alert(language === "pt" ? "Chave incorreta" : "Incorrect key");
    }
    const data = JSON.parse(response.value)

    switch (data.drawType) {
        case 'weighted':
            setWeightedData(data);
            break;
        case 'normal':
            setNormalData(data);
            break;
    }
}

const setSeedOrigin = (seedOrigin) => {
    let elemnt = document.getElementById('seedOrigin');
    if (seedOrigin === "nist" || seedOrigin === "inmetro") {
        elemnt.textContent = seedOrigin.toUpperCase();
    } else if (seedOrigin === "uchile") {
        elemnt.textContent = "Universidad de Chile"
    } else if (seedOrigin === "user") {
        elemnt.textContent = "Manual"
    }
}

const setSeed = (seed) => {
    let element = document.getElementById('seed');
    element.textContent = seed.toUpperCase();
}

const setSeedPulse = (pulseIndex) => {
    document.getElementById('seedPulse').textContent = pulseIndex;
}

const setWeightedData = (data) => {
    setSeedOrigin(data.seedOrigin);
    setSeed(data.seed);
    setSeedPulse(data.pulseIndex);

    const list = document.getElementById('itens');
    const resultsList = document.getElementById('itensResult')

    removeClass('weightColumn', 'display-none');
    removeClass('weightResultColumn', 'display-none');
    removeClass('chanceColumn', 'display-none');
    removeClass('intervalColumn', 'display-none');
    data.weightedValues.forEach((value, index) => {
        const trItens = document.createElement('tr');
        const tdIndex = document.createElement('td');
        tdIndex.textContent = index + 1;
        tdIndex.classList.add('bordered');
        tdIndex.classList.add('w-50px');
        tdIndex.classList.add('ta-center');

        const tdItem = document.createElement('td');
        tdItem.textContent = value.item;
        tdItem.classList.add('bordered');
        tdItem.classList.add('min-w-200');

        const tdPeso = document.createElement('td');
        tdPeso.textContent = value.weight;
        tdPeso.classList.add('bordered');
        tdPeso.classList.add('w-50px');
        tdPeso.classList.add('ta-center');

        trItens.appendChild(tdIndex);
        trItens.appendChild(tdItem);
        trItens.appendChild(tdPeso);
        list.appendChild(trItens);
    });

    data.weightedValues.forEach((value, index) => {
        const trResult = document.createElement('tr');
        const tdIndex = document.createElement('td');
        tdIndex.textContent = index + 1;
        tdIndex.classList.add('bordered');
        tdIndex.classList.add('w-50px');
        tdIndex.classList.add('ta-center');

        const tdItem = document.createElement('td');
        tdItem.textContent = value.item;
        tdItem.classList.add('bordered');
        tdItem.classList.add('min-w-200');

        const tdPeso = document.createElement('td');
        tdPeso.textContent = value.weight;
        tdPeso.classList.add('bordered');
        tdPeso.classList.add('w-50px');
        tdPeso.classList.add('ta-center');

        trResult.appendChild(tdIndex);
        trResult.appendChild(tdItem);
        trResult.appendChild(tdPeso);

        const tdChance = document.createElement('td');
        tdChance.textContent = value.chance;
        tdChance.classList.add('bordered');
        tdChance.classList.add('w-100px');
        tdChance.classList.add('ta-center');

        const tdInterval = document.createElement('td');
        tdInterval.textContent = `[${value.chance == 0 ? '-' : value.min}, ${value.chance == 0 ? '-' : value.max}]`;
        tdInterval.classList.add('bordered');
        tdInterval.classList.add('w-200px');
        tdInterval.classList.add('ta-center');

        trResult.appendChild(tdChance);
        trResult.appendChild(tdInterval);
        if (data.winner >= value.min && data.winner <= value.max) {
            trResult.classList.add('bold')
            trResult.classList.add('winner')
        }

        resultsList.appendChild(trResult);
    });

    const e = document.getElementById('weightResult')
    e.textContent = `- ${data.winner}`;
    e.classList.remove('display-none');

    removeClass('content', 'display-none')
}

const setNormalData = (data) => {
    console.log(data);
    setSeedOrigin(data.seedOrigin);
    setSeed(data.seed);
    setSeedPulse(data.pulseIndex);

    const list = document.getElementById('itens');
    const resultsList = document.getElementById('itensResult');

    removeClass('hashColumn', 'display-none');

    data.rawData.forEach((value, index) => {
        const trItens = document.createElement('tr');
        const tdIndex = document.createElement('td');
        tdIndex.textContent = index + 1;
        tdIndex.classList.add('bordered');
        tdIndex.classList.add('w-50px');
        tdIndex.classList.add('ta-center');

        const tdItem = document.createElement('td');
        tdItem.textContent = value;
        tdItem.classList.add('bordered');
        tdItem.classList.add('min-w-200');

        trItens.appendChild(tdIndex);
        trItens.appendChild(tdItem);
        list.appendChild(trItens);
    });

    data.data.forEach((value, index) => {
        const trItens = document.createElement('tr');
        const tdIndex = document.createElement('td');
        tdIndex.textContent = index + 1;
        tdIndex.classList.add('bordered');
        tdIndex.classList.add('w-50px');
        tdIndex.classList.add('ta-center');

        const tdItem = document.createElement('td');
        tdItem.textContent = value.value;
        tdItem.classList.add('bordered');
        tdItem.classList.add('min-w-200');

        const tdHash = document.createElement('td');
        tdHash.textContent = value.hash;
        tdHash.classList.add('bordered');
        tdHash.classList.add('min-w-200');

        trItens.appendChild(tdIndex);
        trItens.appendChild(tdItem);
        trItens.appendChild(tdHash);
        resultsList.appendChild(trItens);
    });
    removeClass('content', 'display-none')
}

const addClass = (elementId, className) => {
    document.getElementById(elementId).classList.add(className);
}

const removeClass = (elementId, className) => {
    document.getElementById(elementId).classList.remove(className);
}

const clearAll = () => {
    ['seed', 'seedOrigin', 'seedPulse', 'itens', 'itensResult'].forEach(id => {
        document.getElementById(id).textContent = '';
    });
    ['weightColumn', 'weightResultColumn', 'chanceColumn', 'intervalColumn', 'hashColumn'].forEach(column => {
        addClass(column, 'display-none')
    })
}
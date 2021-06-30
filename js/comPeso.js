const MAX_ITENS = 50

const handleChangeNumberItems = ({ value }) => {
    if (value > MAX_ITENS) return;
    const previousValues = [];

    const rows = document.getElementsByName("drawItem");
    rows.forEach(row => {
        const item = row.querySelector('input[name="item"]');
        const weight = row.querySelector('input[name="weight"]');
        previousValues.push({
            item: item?.value,
            weight: weight?.value
        });
    });

    const tableBody = document.getElementById("options");
    tableBody.innerHTML = '';
    for (let i = 0; i < value; ++i) {
        const tr = document.createElement('tr');
        tr.setAttribute("name", "drawItem");
        tr.innerHTML = `
            <td class="bordered">${i + 1}</td>
            <td class="bordered w-75"><input type="text" class="item-input w-90" name="item" value=${previousValues[i] ? previousValues[i].item : ""}></td>
            <td class="bordered"><input type="number" name="weight" value=${previousValues[i] ? previousValues[i].weight : 0}></td>
        `;
        tableBody.appendChild(tr);
    }
}

const shuffle = async () => {

    const { seedOrigin, seedTime, values } = getFormData();

    if (values.every(value => value.item == "")) return;
    if (values.every(value => value.weight == 0)) {
        alert("Você deve definir o peso dos itens");
        return;
    }
    let seed;
    let pulseIndex = null;
    switch (seedOrigin) {
        case 'user':
            seed = getUserSeed();
            break;
        default:
            const data = await getBeaconSeed(seedOrigin, seedTime);
            seed = data.value;
            pulseIndex = data.index;
            break;
    }

    totalWeight = values.reduce((acc, value) => value.item != "" ? +value.weight + acc : acc, 0);
    weightedValues = calculateProbability(values, totalWeight);

    winner = await calculateWinner(seed, values.length);

    winnerIndex = weightedValues.findIndex(item => {
        return winner >= item.min && winner <= item.max;
    });

    showResultDetails(seed, winner, weightedValues[winnerIndex], pulseIndex)
    printResultList(weightedValues, winnerIndex);
}

const calculateProbability = (values, totalWeight) => {
    weightedValues = [];
    weightedValuesLen = 0;

    values.forEach((value) => {
        if (value.item == "") {
            return
        }

        const chance = +((value.weight / totalWeight) * 100).toPrecision(6);
        const min = weightedValuesLen == 0 ? 0 : +(weightedValues[weightedValuesLen - 1].max + 0.0001).toPrecision(6);
        const max = weightedValuesLen == 0 ? +(min + chance).toPrecision(6) : +(min + chance - 0.0001).toPrecision(6);
        weightedValuesLen++;

        weightedValues.push({
            ...value,
            chance,
            min,
            max: max > 100 ? 100 : max
        })
    });

    return weightedValues;
}

const calculateWinner = async (seed, numberItems) => {
    const sentence = `${seed}${numberItems}`;
    const hashed = Number(`0x${await sha256(sentence)}`);
    const result = 100 * (hashed / (Math.pow(2, 256)));
    return +result.toPrecision(6);
}
const getFormData = () => {
    const seedOrigin = document.getElementById('seedOrigin').value;
    const rows = document.getElementsByName('drawItem');
    const seedTime = document.querySelector(`input[type='radio'][name='time']:checked`).value;

    const values = []
    rows.forEach(row => {
        values.push({
            item: row.querySelector('input[name="item"]').value,
            weight: row.querySelector('input[name="weight"]').value
        });
    });
    return { seedOrigin, seedTime, values };
}

const showResultDetails = (seed, number, winner, index) => {
    removeClass('result-details', 'display-none');
    document.getElementById("baseSeed").textContent = seed;
    document.getElementById("number").textContent = number;
    document.getElementById("winner").textContent = `${winner.item} [${winner.min.toFixed(4)}, ${winner.max.toFixed(4)}]`;
    if (index) {
        removeClass('pulse', 'display-none');
        document.getElementById("pulseIndex").textContent = index;
    } else {
        addClass('pulse', 'display-none');
    }
}

const printResultList = (items, winnerIndex) => {
    removeClass('resultsTable', 'display-none');
    const table = document.getElementById('results-list');
    table.innerHTML = '';

    items.forEach((item, index) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td class="bordered ${index == winnerIndex ? 'bold' : ''}">${index + 1}</td>
            <td class="bordered ${index == winnerIndex ? 'bold' : ''}">${item.item}</td>
            <td class="bordered ${index == winnerIndex ? 'bold' : ''}">${item.chance.toFixed(4)}</td>
            <td class="bordered ${index == winnerIndex ? 'bold' : ''}">[${item.chance == 0 ? '-' : item.min.toFixed(4)}, ${item.chance == 0 ? '-' : item.max.toFixed(4)}]</td>
        `;
        table.appendChild(tr);
    });
}

window.onload = e => {
    handleChangeNumberItems({ value: 12 });
};
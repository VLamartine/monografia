const urls = {
    nist: 'https://beacon.nist.gov/beacon/2.0/pulse/time/',
    inmetro: 'https://beacon.inmetro.gov.br/beacon/2.0/pulse/time/',
    uchile: 'https://random.uchile.cl/beacon/2.0/pulse/time/',
}

const lastPulseUrls = {
    nist: 'https://beacon.nist.gov/beacon/2.0/pulse/last',
    inmetro: 'https://beacon.inmetro.gov.br/beacon/2.0/pulse/last',
}

const PRECISION = 4;

const shuffle = async () => {
    const { seedOrigin, items } = getFormData();
    let seed;
    addClass('winner', 'display-none');

    if (seedOrigin === 'user') {
        seed = document.getElementById('seed').value || Date.now();
        addClass('msg', 'display-none');
        addClass('pulse', 'display-none');
    } else {

        const shuffle = {
            timestamp: Date.now(),
            date: new Date(Date.now()),
            element: document.getElementById("dateShuffle")
        }
        let waitTime = 60 - shuffle.date.getSeconds();
        const pulse = getPulseTimestamp(shuffle.timestamp, waitTime);

        const { value } = document.querySelector(`input[type='radio'][name='time']:checked`);
        let url;

        if (value === "last") {
            url = lastPulseUrls[seedOrigin]
        } else {
            url = urls[seedOrigin];

            if (value === "future") {
                url += 'previous/';
                removeClass('msg', 'display-none');

                shuffle.element.textContent = `${shuffle.date.getHours()}:${shuffle.date.getMinutes() < 10 ? "0" + shuffle.date.getMinutes().toString() : shuffle.date.getMinutes()}`
                pulse.element.textContent = `${pulse.date.getHours()}:${pulse.date.getMinutes() < 10 ? "0" + pulse.date.getMinutes().toString() : pulse.date.getMinutes()}`;

                const remainingTimeElement = document.getElementById("remainingTime");

                remainingTimeElement.textContent = waitTime

                const interval = setInterval(() => {
                    remainingTimeElement.textContent = waitTime
                    waitTime--;
                }, 1000);

                await wait((waitTime + 1) * 1000);
                addClass('msg', 'display-none');

                clearInterval(interval);
            }

            url += pulse.timestamp;
        }
        const { outputValue, pulseIndex } = await fetchPulse(url);

        seed = outputValue;
        removeClass('pulse', 'display-none');
        document.getElementById('pulseIndex').textContent = pulseIndex;
    }

    const itemsArray = formatItems(items);

    const numberItems = itemsArray.length

    const selectedNumber = await calculateSelection(numberItems, seed);
    document.getElementById('valor').textContent = selectedNumber;
    removeClass('winner', 'display-none');

    const selectedIndex = itemsArray.findIndex(item => {
        return selectedNumber >= item.min && selectedNumber <= item.max
    });

    displayListSelectItem(itemsArray, selectedIndex);
    // const hashedItems = await hashItems(items.split("\n").length, seed);

    // hashedItems.sort((a, b) => a.hash.localeCompare(b.hash));

    document.getElementById('baseSeed').textContent = `${seed}`;
    // displayList(hashedItems);
}

const formatItems = (items) => {
    const arr = items.split('\n');
    const numberItems = arr.length;

    const step = (100 / numberItems).toFixed(4);
    let intervalStart = 0;
    let intervalEnd = intervalStart + (+step) - 0.0001;
    return arr.map((item, index) => {
        const minValue = intervalStart;
        let maxValue = intervalEnd;
        intervalStart += +step;
        intervalEnd += +step;

        return {
            item,
            min: +minValue,
            max: maxValue <= 100 ? maxValue : 100
        }
    })
}
const getPulseTimestamp = (timestamp, waitTime) => {
    const { value } = document.querySelector(`input[type='radio'][name='time']:checked`);

    if (value === "future") {
        return {
            timestamp: timestamp + waitTime * 1000,
            date: new Date(timestamp + waitTime * 1000),
            element: document.getElementById("datePulse")
        }
    } else {
        const [year, month, day] = document.getElementById('date').value.split('-');
        const [hour, minute] = document.getElementById('time').value.split(':');

        const date = new Date(year, month - 1, day, hour, minute);

        return {
            date,
            timestamp: date.getTime(),
            element: document.getElementById("datePulse")
        }
    }
}

const fetchPulse = async (url) => {
    const json = await fetch(url);
    const response = await json.json();

    return response.pulse;
}

const hashItems = (items, seed) => {
    removeClass('formatedData', 'display-none');
    const tableElement = document.getElementById('formatedDataTable');
    tableElement.innerHTML = '';

    return Promise.all(items.map(async (item, i) => {
        const sentence = `${seed}${i + 1}`;
        // const sentence = `${i+1}${item}${seed}`;
        const hashed = await sha256(sentence);
        const row = document.createElement('tr');
        const sentenceTD = document.createElement('td');
        sentenceTD.appendChild(document.createTextNode(sentence));
        const hashedTD = document.createElement('td');
        hashedTD.appendChild(document.createTextNode(hashed));
        row.appendChild(sentenceTD);
        row.appendChild(hashedTD);
        tableElement.appendChild(row);
        return {
            hash: hashed,
            value: item
        };
    }))
}

const calculateSelection = async (numberItems, seed) => {
    const sentence = `${seed}${numberItems}`;
    const hashed = Number(`0x${await sha256(sentence)}`);
    const result = 100 * (hashed / (Math.pow(2, 256)));
    return result.toFixed(PRECISION);
}
const sha256 = async (message) => {
    // encode as UTF-8
    const msgBuffer = new TextEncoder().encode(message);

    // hash the message
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);

    // convert ArrayBuffer to Array
    const hashArray = Array.from(new Uint8Array(hashBuffer));

    // convert bytes to hex string                  
    const hashHex = hashArray.map(b => ('00' + b.toString(16)).slice(-2)).join('');
    return hashHex;
}

const handleSeedOriginChange = (element) => {
    if (element.value === 'user') {
        document.getElementById('seed_label').classList.remove('display-none');
        document.getElementById('timeSeed').classList.add('display-none');
    } else {
        document.getElementById('seed_label').classList.add('display-none');
        document.getElementById('timeSeed').classList.remove('display-none');
    }
}

const setMaxDate = () => {
    const today = new Date();
    let dd = today.getDate();
    let mm = today.getMonth() + 1;
    let yyyy = today.getFullYear();

    if (dd < 10) dd = '0' + dd;
    if (mm < 10) mm = '0' + mm;
    document.getElementById('date').setAttribute('max', `${yyyy}-${mm}-${dd}`);
}

const handleTimeChange = () => {

    const time = document.getElementById('time').value;
    const date = document.getElementById('date').value;

    if (!time || !date) return;

    const [hour, minutes] = time.split(':');

    const today = new Date();

    today.setHours(hour);
    today.setMinutes(minutes);

    let dd = today.getDate();
    let mm = today.getMonth() + 1;
    let yyyy = today.getFullYear();
    if (dd < 10) dd = '0' + dd;
    if (mm < 10) mm = '0' + mm;

    if (date && date == `${yyyy}-${mm}-${dd}` && today.getTime() > Date.now()) {
        removeClass('timeError', 'display-none');
        document.getElementById("submit").setAttribute('disabled', true);
    } else {
        document.getElementById("submit").removeAttribute('disabled');
        addClass('timeError', 'display-none');
    }
}

const handlePulseTimeChange = ({ value }) => {
    if (value == "past") {
        document.getElementById('datetime').classList.remove('display-none');
    } else {
        document.getElementById('datetime').classList.add('display-none');
    }
}

const displayList = (items) => {
    const list = document.getElementById('resultList');
    list.innerHTML = '';

    items.forEach(item => {
        const li = document.createElement("li");
        const value = document.createTextNode(`(0x${item.hash.substr(0, 10).toUpperCase()}...) ${item.value}`);
        li.appendChild(value);

        list.appendChild(li);
    });

    list.classList.remove('display-none');
}

const displayListSelectItem = (items, selectedIndex) => {

    const winner = items[selectedIndex];
    document.getElementById('winnerItem').textContent = `${winner.item} - [${winner.min}, ${winner.max}]`


    const list = document.getElementById('resultList');
    list.innerHTML = '';
    items.forEach((item, index) => {
        const li = document.createElement("li");
        let string = `${item.item} - [${item.min}, ${item.max}]`;
        if (index == selectedIndex) {
            li.classList.add('bold')
        }
        const value = document.createTextNode(string);
        li.appendChild(value);
        list.appendChild(li);
    })

    removeClass('resultList', 'display-none');
    addClass('resultList', 'list-no-style');
}

const wait = (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms))
}

const changeLanguage = (language) => {
    this.location.pathname = this.location.pathname.replace(/\/[a-z]{2}\//, `/${language.value}/`);
}

const getFormData = () => {
    const seedOrigin = document.getElementById('seedOrigin').value;
    const items = document.getElementById('items').value;
    return { seedOrigin, items };
}

const addClass = (elementId, className) => {
    document.getElementById(elementId).classList.add(className);
}

const removeClass = (elementId, className) => {
    document.getElementById(elementId).classList.remove(className);
}

window.onload = e => {
    setMaxDate();
};

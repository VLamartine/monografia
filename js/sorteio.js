const urls = {
  nist: 'https://beacon.nist.gov/beacon/2.0/pulse/time/',
  inmetro: 'https://beacon.inmetro.gov.br/beacon/2.0/pulse/time/',
  uchile: 'https://random.uchile.cl/beacon/2.0/pulse/time/',
}

const lastPulseUrls = {
  nist: 'https://beacon.nist.gov/beacon/2.0/pulse/last',
  inmetro: 'https://beacon.inmetro.gov.br/beacon/2.0/pulse/last',
  uchile: 'https://random.uchile.cl/beacon/2.0/pulse/last'
}

const shuffle = async () => {
  const { seedOrigin, items } = getFormData();
  const body = { seedOrigin };
  addClass('hash-buttons', 'display-none');
  let seed;
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
    body['pulseIndex'] = pulseIndex;
    seed = outputValue;
    removeClass('pulse', 'display-none');
    document.getElementById('pulseIndex').textContent = pulseIndex;
  }

  const hashedItems = await hashItems(items.split("\n"), seed);

  body['rawData'] = items.split('\n');
  hashedItems.sort((a, b) => a.hash.localeCompare(b.hash));

  body['data'] = hashedItems;
  body['seed'] = seed;
  body['drawType'] = 'normal'

  document.getElementById('baseSeed').textContent = seed;
  const keyResponse = await sendDrawToServer(body);
  document.getElementById('key').innerText = keyResponse.key;
  removeClass('hash-buttons', 'display-none');
  displayList(hashedItems);
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

const hashItems = (items, seed) => {
  removeClass('formatedData', 'display-none');
  const tableElement = document.getElementById('formatedDataTable');
  tableElement.innerHTML = '';

  return Promise.all(items.map(async (item, i) => {
    const sentence = `${i + 1}${item}${seed}`;
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

const displayList = (items) => {
  const list = document.getElementById('resultList');
  list.innerHTML = '';

  items.forEach(item => {
    const li = document.createElement("li");
    li.innerHTML = `<span name='resultItemHash' class='display-none'>(0x${item.hash.substr(0, 10).toUpperCase()}...) </span>${item.value}`;

    list.appendChild(li);
  });

  list.classList.remove('display-none');
}


const toggleHash = (show) => {
  elements = document.getElementsByName('resultItemHash');
  if (show) {
    elements.forEach(element => {
      element.classList.remove('display-none');
    })
    addClass('hash-button-show', 'display-none');
    removeClass('hash-button-hide', 'display-none');
  } else {
    elements.forEach(element => {
      element.classList.add('display-none');
    })
    removeClass('hash-button-show', 'display-none');
    addClass('hash-button-hide', 'display-none');
  }
}
const getFormData = () => {
  const seedOrigin = document.getElementById('seedOrigin').value;
  const items = document.getElementById('items').value;
  return { seedOrigin, items };
}
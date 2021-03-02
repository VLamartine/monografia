const urls = {
  nist: 'https://beacon.nist.gov/beacon/2.0/pulse/time/previous/',
  inmetro: 'https://beacon.inmetro.gov.br/beacon/2.0/pulse/time/previous/',
  uchile: 'https://random.uchile.cl/beacon/2.0/pulse/time/previous/',
}
const shuffle = async () => {
  const seedOrigin = document.getElementById("seedOrigin").value;
  let seed;
  if(seedOrigin === 'user'){
    seed = document.getElementById('seed').value || Date.now();
    document.getElementById('msg').classList.add('display-none');
    document.getElementById('pulse').classList.add('display-none');
  } else {
    const timestampShuffle = Date.now();
    const dateShuffle = new Date(timestampShuffle);

    let remainingTime = waitTime = 60 - dateShuffle.getSeconds()
    const timestampPulse = timestampShuffle + remainingTime * 1000;
    const datePulse = new Date(timestampPulse);

    console.log(`timeRemaining: ${remainingTime}`)
    console.log(`dateShuffle`)
    console.log(dateShuffle);
    console.log(dateShuffle.getSeconds());
    console.log(`datePulse`)
    console.log(datePulse);
    console.log(dateShuffle.getSeconds());
    // const url = urls[seedOrigin] + timestampShuffle;
    const url = urls[seedOrigin] + timestampPulse;
    const msgElemnt = document.getElementById('msg'); 
    msgElemnt.classList.remove('display-none');

    

    const interval = setInterval(() => {
      const msg = `O sorteio foi configurado às ${dateShuffle.getHours()}:${dateShuffle.getMinutes() < 10 ? "0" + dateShuffle.getMinutes().toString() : dateShuffle.getMinutes()}.
      A semente utilizada será o pulso gerado às ${datePulse.getHours()}:${datePulse.getMinutes() < 10 ? "0" + datePulse.getMinutes().toString() : datePulse.getMinutes()}.
      \nSorteio em ${remainingTime} segundos.
      `
      msgElemnt.textContent = msg;
      remainingTime--;
      
    }, 1000);


    await wait((remainingTime+1) * 1000);

    clearInterval(interval);

    const response = await fetch(url);
    const pulse = (await response.json()).pulse;
    seed = pulse.outputValue;
    document.getElementById('pulse').classList.remove('display-none');
    document.getElementById('pulseIndex').textContent = pulse.pulseIndex;
  }
  const items = document.getElementById('items').value.split('\n');

  const hashedItems = await Promise.all(items.map(async (item, i) => {
    return {
      hash: await sha256(`${i+1}${item}${seed}`),
      value: item
    };
  }));

  hashedItems.sort((a, b) => a.hash.localeCompare(b.hash));

  const list = document.getElementById('resultList');
  const usedSeed = document.getElementById('baseSeed');

  list.innerHTML = '';

  hashedItems.forEach(item => {
    const li = document.createElement("li");
    const value = document.createTextNode(`(0x${item.hash.substr(0, 10).toUpperCase()}...) ${item.value}`);
    li.appendChild(value);

    list.appendChild(li);
  });

  usedSeed.textContent = seed;
  list.classList.remove('display-none');
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
  if(element.value === 'user'){
    document.getElementById('seed_label').classList.remove('display-none');
  } else {
    document.getElementById('seed_label').classList.add('display-none');
  }
}

const wait = (ms) => {
  return new Promise(resolve => setTimeout(resolve, ms))
}

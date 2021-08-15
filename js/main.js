const URLS = {
    nist: {
        specificTime: 'https://beacon.nist.gov/beacon/2.0/pulse/time/',
        next: 'https://beacon.nist.gov/beacon/2.0/pulse/time/previous/',
        last: 'https://beacon.nist.gov/beacon/2.0/pulse/last'
    },
    inmetro: {
        specificTime: 'https://beacon.inmetro.gov.br/beacon/2.0/pulse/time/',
        next: 'https://beacon.inmetro.gov.br/beacon/2.0/pulse/time/previous/',
        last: 'https://beacon.inmetro.gov.br/beacon/2.0/pulse/last'
    },
    uchile: {
        specificTime: 'https://random.uchile.cl/beacon/2.0/pulse/time/',
        next: 'https://random.uchile.cl/beacon/2.0/pulse/time/previous/',
        last: 'https://random.uchile.cl/beacon/2.0/pulse/last'
    },
}

const getUserSeed = () => {
    return document.getElementById('seed').value || Date.now();
}

const getBeaconSeed = async (beacon, time) => {
    let url, pulseTimestamp;

    switch (time) {
        case 'last':
            url = URLS[beacon].last;
            break;
        case 'future':

            pulseTimestamp = calculatePulseTimestamp();
            let now = new Date(Date.now())
            now = now.toLocaleTimeString(navigator.language, { hour: '2-digit', minute: '2-digit' });
            let pulseTime = new Date(pulseTimestamp)
            pulseTime = pulseTime.toLocaleTimeString(navigator.language, { hour: '2-digit', minute: '2-digit' });
            const waitTime = pulseTimestamp - Date.now() + 1000;
            const countdown = printCountdown(waitTime, now, pulseTime);
            await wait(waitTime);
            removeCountdown(countdown);
            url = URLS[beacon].next + pulseTimestamp;
            break;
        default:
            pulseTimestamp = calculatePulseTimestamp('specific')
            url = URLS[beacon].specificTime + pulseTimestamp;
    }

    const pulse = await fetchPulse(url);
    return { value: pulse.outputValue, index: pulse.pulseIndex }
}

const calculatePulseTimestamp = (time = 'future') => {
    if (time === 'future') {
        currentTime = Date.now();
        currentDate = new Date(currentTime);
        return currentTime + (60 - currentDate.getSeconds()) * 1000
    } else if (time === 'specific') {
        const [year, month, day] = document.getElementById('date').value.split('-');
        const [hour, minute] = document.getElementById('time').value.split(':');
        const date = new Date(year, month - 1, day, hour, minute);

        return date.getTime();
    }
}

const fetchPulse = async (url) => {
    const json = await fetch(url);
    const response = await json.json();

    return response.pulse;
}


const handleSeedOriginChange = (element) => {
    if (element.value === 'user') {
        document.getElementById('user-seed').classList.remove('display-none');
        document.getElementById('beacon-seed').classList.add('display-none');
    } else {
        document.getElementById('user-seed').classList.add('display-none');
        document.getElementById('beacon-seed').classList.remove('display-none');
    }
}

const handlePulseTimeChange = ({ value }) => {
    if (value == "past") {
        document.getElementById('datetime').classList.remove('display-none');
    } else {
        document.getElementById('datetime').classList.add('display-none');
    }
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

window.onload = e => {
    setMaxDate();
};
// Helpers
const changeLanguage = (language) => {
    this.location.pathname = this.location.pathname.replace(/\/[a-z]{2}\//, `/${language.value}/`);
}


const addClass = (elementId, className) => {
    document.getElementById(elementId).classList.add(className);
}

const removeClass = (elementId, className) => {
    document.getElementById(elementId).classList.remove(className);
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

const printCountdown = (time, timeConfigured, timePulse) => {
    removeClass('msg', 'display-none');
    document.getElementById("dateShuffle").textContent = timeConfigured;
    document.getElementById("datePulse").textContent = timePulse;

    countdownElement = document.getElementById("remainingTime");

    remainingTime = Math.floor(time / 1000);
    countdownElement.textContent = remainingTime;


    return setInterval(() => {
        countdownElement.textContent = remainingTime;
        remainingTime--;
    }, 1000);
}

const removeCountdown = (countdownId) => {
    clearInterval(countdownId);
    addClass('msg', 'display-none');
}
const wait = (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms))
}

const sendDrawToServer = async (body) => {
    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
            // 'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: JSON.stringify(body)
    }
    const url = 'https://monografia-server.herokuapp.com';
    const response = await fetch(url, options);
    return response.json();
}
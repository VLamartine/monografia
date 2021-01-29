const shuffle = async () => {
  const seed = document.getElementById('seed').value;
  const items = document.getElementById('items').value.split('\n');

  const hashedItems = await Promise.all(items.map(async (item, i) => {
    return {
      hash: await sha256(`${i+1}${item}${seed}`),
      value: item
    };
  }));

  hashedItems.sort((a, b) => a.hash.localeCompare(b.hash));

  const list = document.getElementById('resultList');
  hashedItems.forEach(item => {
    const li = document.createElement("li");
    const value = document.createTextNode(`(0x${item.hash.substr(0, 10).toUpperCase()}...) ${item.value}`);
    li.appendChild(value);

    list.appendChild(li);
  });
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


/*
Item 1
Item 2
Item 3
Item 4
Item 5
Item 6
Item 7
Item 8
Item 9
Item 10
Item 11
Item 12
Item 13
Item 14
Item 15
*/
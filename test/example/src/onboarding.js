var xhr = new XMLHttpRequest();
xhr.open('GET', 'help.txt', true);
xhr.onreadystatechange = function () {
  if (xhr.readyState == XMLHttpRequest.DONE && xhr.status == 200) {
    document.getElementById('app').innerHTML = xhr.responseText.replace(/\n/g, '<br/>');
  }
};
xhr.send();
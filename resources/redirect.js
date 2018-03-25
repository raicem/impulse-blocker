function rewriteBlockMsg() {
  const locationUrl = new URL(window.location);
  const targetString = locationUrl.searchParams.get('target');

  if (targetString == null) {
    return;
  }

  const target = new URL(targetString);
  const blockMessage = document.createElement('h2');
  const blockPre = document.createTextNode('Your impulse to visit ');
  const targetLink = document.createElement('a');
  targetLink.setAttribute('href', target);
  targetLink.textContent = target.hostname;
  const blockPost = document.createTextNode(' is successfully blocked!');
  blockMessage.appendChild(blockPre);
  blockMessage.appendChild(targetLink);
  blockMessage.appendChild(blockPost);
  const impulseMsg = document.getElementById('impulse-msg');

  while (impulseMsg.firstChild) {
    impulseMsg.removeChild(impulseMsg.firstChild);
  }
  impulseMsg.appendChild(blockMessage);
}

rewriteBlockMsg();

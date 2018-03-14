function rewriteBlockMsg() {
  const location_url = new URL(window.location);
  const tgt_string = location_url.searchParams.get('target');
  if (tgt_string == null) { return; } // This should probably never happen?
  const target = new URL(tgt_string);
  const block_msg = document.createElement('h2');
  const block_pre = document.createTextNode('Your impulse to visit ');
  const target_link = document.createElement('a');
  target_link.setAttribute('href', target);
  target_link.textContent = target.hostname;
  const block_post = document.createTextNode(' is successfully blocked!');
  block_msg.appendChild(block_pre);
  block_msg.appendChild(target_link);
  block_msg.appendChild(block_post);
  const impulseMsg = document.getElementById('impulse-msg');
  while (impulseMsg.firstChild) {
    impulseMsg.removeChild(impulseMsg.firstChild);
  }
  impulseMsg.appendChild(block_msg);
}

rewriteBlockMsg();

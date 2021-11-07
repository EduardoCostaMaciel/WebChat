const client = window.io('http://localhost:3000');

const nick = document.querySelector('#nickname'); // input-nickname
const btnNickname = document.querySelector('#btn-nickname'); // button-nickname
const ulNicknames = document.querySelector('#nicknames'); // ul-nickname

const message = document.querySelector('#message'); // input-message
const ulMessages = document.querySelector('#messages'); // ul-messages
const btnMessage = document.querySelector('#btn-message'); // btn-message

const createNickName = (nicknames) => { // Cria as li-Nick-Name
  const nickClient = client.id.substring(0, 16);

  nicknames.forEach((nickname) => {
    const li = document.createElement('li');
    li.setAttribute('data-testid', 'online-user');
    li.innerHTML = nickname;
    li.classList.add('online-user');

    if (nickClient === nickname) return ulNicknames.prepend(li); // joga para a primeira posição "length = 0"

    ulNicknames.appendChild(li);
  });
};

const createMessage = (msg) => { // Cria a li-Message
  const li = document.createElement('li');
  li.setAttribute('data-testid', 'message');
  li.innerHTML = msg;
  return li;
};

client.on('message', (msg) => { // Escuta a Message
  ulMessages.appendChild(createMessage(msg));
});

let nickname = '';

btnNickname.addEventListener('click', (e) => { // Emite o Nik-Name
  e.preventDefault();
  nickname = nick.value;
  if (nick.value.length) {
    client.emit('nickname', nickname);
    nick.value = '';
  }
});

btnMessage.addEventListener('click', (e) => { // Emite a Message
  e.preventDefault();
  const chatMessage = message.value;
  if (message.value.length) {
    client.emit('message', { chatMessage, nickname });
    message.value = '';
  }
});

client.on('connectUser', (nicknames) => { // Escuta o Nick-Name
  const liNicks = document.querySelectorAll('.online-user');
  liNicks.forEach((liNick) => liNick.remove()); // remove todos para criar novos

  createNickName(nicknames); // cria novos
});

window.onbeforeunload = () => {
  client.disconnect();
};

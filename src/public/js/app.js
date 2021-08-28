// io function은 알아서 socket.io를 실행하고 있는 서버를 찾음
const socket = io();

const welcome = document.querySelector('#welcome');
const form = welcome.querySelector('form');
const room = document.querySelector('#room');

room.hidden = true;

let roomName;

function addMessage(message) {
    const ul = room.querySelector('ul');
    const li = document.createElement('li');
    li.innerText = message;
    ul.appendChild(li);
}

function handleMessageSubmit(event) {
    event.preventDefault();
    const input = room.querySelector('#msg input');
    const value = input.value;
    socket.emit('new_message', input.value, roomName, () => {
        addMessage(`You: ${value}`);
    });
    input.value = '';
}

function handleNicknameSubmit(event) {
    event.preventDefault();
    const input = room.querySelector('#name input');
    socket.emit('nickname', input.value);
}

function showRoom() {
    welcome.hidden = true;
    room.hidden = false;
    const h3 = room.querySelector('h3');
    h3.innerText = `Room ${roomName}`;
    const msgForm = room.querySelector('#msg');
    const nameForm = room.querySelector('#name');
    msgForm.addEventListener('submit', handleMessageSubmit);
    nameForm.addEventListener('submit', handleNicknameSubmit);
}

function handleRoomSubmit(event) {
    event.preventDefault();
    const input = form.querySelector('input');
    // socket.emit 첫번째인자는 커스텀이벤트, 두번재는 보내고싶은 payload 세번째는 서버에서 해당함수를 호출해서 프론트에서 발생
    socket.emit('enter_room', input.value, showRoom);
    roomName = input.value;
    input.value = '';
}

form.addEventListener('submit', handleRoomSubmit);

socket.on('welcome', (user, newCount) => {
    const h3 = room.querySelector('h3');
    h3.innerText = `Room ${roomName} (${newCount})`;
    addMessage(`${user} arrived!`);
});
socket.on('bye', (left, newCount) => {
    const h3 = room.querySelector('h3');
    h3.innerText = `Room ${roomName} (${newCount})`;
    addMessage(`${left} left...`);
});
socket.on('new_message', addMessage);
socket.on('room_change', rooms => {
    const roomList = welcome.querySelector('ul');
    roomList.innerHTML = '';
    if (rooms.length === 0) {
        return;
    }
    rooms.forEach(room => {
        const li = document.createElement('li');
        li.innerText = room;
        roomList.append(li);
    });
});
// const messageList = document.querySelector('ul');
// const nickForm = document.querySelector('#nick');
// const messageForm = document.querySelector('#message');
// // socket는 서버로의 연결을 뜻함, 해당 서버에 백엔드를 연결
// const socket = new WebSocket(`ws://${window.location.host}`);

// function makeMessage(type, payload) {
//     const msg = { type, payload };
//     return JSON.stringify(msg);
// }

// // open은  socket이 connection을 open햇을 때 발생함
// socket.addEventListener('open', () => {
//     console.log('Connected to Sever');
// });

// // message는 서버로부터 메세지를 받을 때 발생
// socket.addEventListener('message', message => {
//     // console.log('New messsage: ', message.data);
//     const li = document.createElement('li');
//     li.innerText = message.data;
//     messageList.append(li);
// });

// // close는 서버가 죽었을 때
// socket.addEventListener('close', () => {
//     console.log('서버와 연결되지 않음');
// });

// // // 프론트에서 백으로 메세지보냄
// // setTimeout(() => {
// //     socket.send('hello from the browser!');
// // }, 3000);

// function handleSubmit(event) {
//     event.preventDefault();
//     const input = messageForm.querySelector('input');
//     socket.send(makeMessage('new_message', input.value));
//     const li = document.createElement('li');
//     li.innerText = `You: ${input.value}`;
//     messageList.append(li);
//     input.value = '';
// }

// function handleNickSubmit(event) {
//     event.preventDefault();
//     const input = nickForm.querySelector('input');
//     socket.send(makeMessage('nickname', input.value));
//     input.value = '';
// }

// messageForm.addEventListener('submit', handleSubmit);
// nickForm.addEventListener('submit', handleNickSubmit);

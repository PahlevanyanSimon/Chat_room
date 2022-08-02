const chatForm = document.getElementById('chat-form')
const chatMessages = document.querySelector('.chat-messages');
const roomName = document.getElementById('room-name');
const userList = document.getElementById('users');


// url-ic name
const { username, room } = Qs.parse(location.search, {
    ignoreQueryPrefix: true
})

const socket = io();

// Join chatroom

socket.emit('joinRoom', { username, room})

socket.on('roomUsers', ({room, users}) => {
    outputRoomName(room);
    outputUsers(users);
})




// Message from server
socket.on('message', message => {
    console.log(message)
    outputMessage(message);

// Scroll
    chatMessages.scrollTop = chatMessages.scrollHeight;
})


chatForm.addEventListener('submit', (e) => {
    e.preventDefault();

    // msg text
    const msg = e.target.elements.msg.value;

    // emit message to server
    socket.emit('chatMessage', msg);

    e.target.elements.msg.value = '';
    e.target.elements.msg.focus();

})

// Output message
function outputMessage(message) {
    const div = document.createElement('div')
    div.classList.add('message');
    div.innerHTML = ` <p class="meta">${message.username} <span>${message.time}</span></p>
        <p class="text">
          ${message.text}
        </p> `;
    document.querySelector('.chat-messages').appendChild(div);

}

function outputRoomName(room) {
    roomName.innerText = room;
}

function outputUsers(users) {
  userList.innerHTML = `
  ${users.map(user => `<li>${user.username}</li>`).join('')}
  `
}

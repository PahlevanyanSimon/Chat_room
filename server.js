const express = require('express');
const http = require('http');
const path = require('path')
const socketio = require('socket.io');
const formatMessage = require('./utils/messages')
const { userJoin, getCurrentUser, userLeave, getRoomUsers } = require('./utils/users')


const app = express();
const server = http.createServer(app)
const io = socketio(server);

const botName = 'Chat'

io.on('connection', socket => {
    socket.on('joinRoom', ({ username, room }) => {
        const user = userJoin(socket.id, username, room)

        socket.join(user.room)

        socket.emit('message',formatMessage(botName,'Welcome to chat'))

        // when user connect
        socket.broadcast
            .to(user.room)
            .emit(
                'message',
                formatMessage(botName,`${user.username} has joined  the  chat`));

        // users rooms info

        io.to(user.room).emit('roomUsers', {
            room: user.room,
            users: getRoomUsers(user.room)
        })


        // chatMessage
        socket.on('chatMessage', (msg) => {
            const user = getCurrentUser(socket.id);

            io.to(user.room).emit('message', formatMessage(user.username, msg) )
        })
    })

    // when user disconnect
    socket.on('disconnect', () => {
        const user = userLeave(socket.id)

        if (user) {
            io.to(user.room).emit('message', formatMessage(botName, `${user.username} has left the chat`))
        }

        io.to(user.room).emit('roomUsers', {
            room: user.room,
            users: getRoomUsers(user.room)
        })

    })
} )

app.use(express.static(path.resolve(__dirname,'public')))

app.get('/trial', (req, res) => {
    return res.send("Trial")
})

server.listen(process.env.PORT || 5000, console.log('Server running in port 5000'));

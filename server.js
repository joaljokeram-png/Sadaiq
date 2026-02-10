const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: "*" }
});

let onlineUsers = {};

io.on('connection', (socket) => {
    socket.on('join', (data) => {
        socket.join(data.room || "العامة");
        onlineUsers[socket.id] = {
            id: socket.id,
            name: data.user,
            rank: data.rank || "عضو",
            avatar: data.avatar || "",
            room: data.room || "العامة"
        };
        io.emit('update_users', Object.values(onlineUsers));
    });

    socket.on('message', (data) => {
        io.to(data.room).emit('new_message', {
            user: data.user,
            text: data.text,
            rank: data.rank,
            avatar: data.avatar,
            style: data.style,
            time: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })
        });
    });

    socket.on('disconnect', () => {
        delete onlineUsers[socket.id];
        io.emit('update_users', Object.values(onlineUsers));
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server is running on port ${PORT}`));

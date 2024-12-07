const express = require('express');
const { createServer } = require('node:http');
const { join } = require('node:path');
const { Server } = require('socket.io');
const { PrismaClient } = require('@prisma/client');
const { availableParallelism } = require('node:os');
const cluster = require('node:cluster');
const { createAdapter, setupPrimary } = require('@socket.io/cluster-adapter');
const prisma = new PrismaClient();

if (cluster.isPrimary) {
    const numCPUs = availableParallelism();
    // create one worker per available core
    for (let i = 0; i < numCPUs; i++) {
        cluster.fork({
            PORT: 3000 + i
        });
    }

    // set up the adapter on the primary thread
    return setupPrimary();
}

let counter = 0;
const app = express();
const server = createServer(app);
const io = new Server(server, {
    connectionStateRecovery: {},
    // set up the adapter on each worker thread
    adapter: createAdapter(),
});

app.get('/', (req, res) => {
    res.sendFile(join(__dirname, 'index.html'));
})

const onlineUsers = new Map();

io.on('connection', async (socket) => {

    // Handle user connection
    socket.on('userConnected', (username, callback) => {
        console.log('Connected user!')
        onlineUsers.set(socket.id, username);
        console.log(`${username} connected`);

        const usersDetails = Array.from(onlineUsers.entries()).map(([id, username]) => ({ id, username }))

        io.emit('updateUsers', usersDetails);
        callback();
    })



    // Handle private messages
    socket.on('privateMessage', ({ recipient, message, sender }) => {
        const recipientSocketId = onlineUsers.get(recipient)
    })

    // Implement private message

    socket.on('username change', (username, callback) => {
        onlineUsers.set(socket.id, username);

        const usersDetails = Array.from(onlineUsers.entries()).map(([id, username]) => ({ id, username }))

        io.emit('updateUsers', usersDetails);
        callback();
    })

    socket.on('typing', (username, callback) => {
        counter++
        socket.broadcast.emit('user typing', username);
        callback({ status: 'ok' });
        console.log('Typing counter: ', counter, username)
    })

    socket.on('stop typing', (callback) => {
        counter++
        socket.broadcast.emit('user stop typing');
        callback({ status: 'ok' });
        console.log('stop typing: ', counter)
    });

    io.emit('connectDisconnect', `*User connected`)

    // Load existing messages and send them to the client
    const messages = await prisma.message.findMany({
        orderBy: { createdAt: 'asc' }
    });



    socket.on('chat message', async (msg, username, clientOffset, callback) => {
        let newMessage;
        counter++
        try {
            // Store the message in the database
            newMessage = await prisma.message.create({
                data: {
                    content: msg,
                    clientOffset: clientOffset,
                    username: username,
                },
            });
        } catch (e) {
            // Check if the error is a unique constraint violation
            if (e.code === 'P2002' && e.meta?.target?.includes('clientOffset')) {
                // The message was already inserted, so we notify the client
                callback({ status: 'rejected' });
            } else {
                // Log unexpected errors
                console.error('Unexpected error:', e);
                // Let the client retry
            }
            return;
        }

        socket.broadcast.emit('chat message', msg, username, newMessage.id);
        console.log('message sent!: ', counter)
        // acknowledge the event
        callback({ status: 'success', id: newMessage.id });
    });

    if (!socket.recovered) {
        try {
            const messages = await prisma.message.findMany({
                where: { id: { gt: socket.handshake.auth.serverOffset || 0 } },
                select: { id: true, content: true, username: true }
            })

            //  Emit the recovery messages
            messages.forEach((message) => {
                socket.emit('chat message', message.content, message.username, message.id);
            });

        } catch (e) {
            console.log('Failed to recover')
        }
    }

    // Handle user disconnection
    socket.on('disconnect', () => {
        const username = onlineUsers.get(socket.id);
        onlineUsers.delete(socket.id); // Remove from online users
        console.log(`${username} disconnected`);

        const usersDetails = Array.from(onlineUsers.entries()).map(([id, username]) => ({ id, username }))

        // Broadcast updated user list
        io.emit('updateUsers', usersDetails);
    })


});

const port = process.env.PORT;

server.listen(port, () => {
    console.log(`server running at http://localhost:${port}`);
});


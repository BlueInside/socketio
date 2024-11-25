const express = require('express');
const { createServer } = require('node:http');
const { join } = require('node:path');
const { Server } = require('socket.io');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();


const app = express();
const server = createServer(app);
const io = new Server(server, {
    connectionStateRecovery: {}
});

app.get('/', (req, res) => {
    res.sendFile(join(__dirname, 'index.html'));
})

io.on('connection', async (socket) => {
    console.log('a user connected');

    // Load existing messages and send them to the client
    const messages = await prisma.message.findMany({
        orderBy: { createdAt: 'asc' }
    });

    socket.on('chat message', async (msg) => {
        let newMessage;
        try {
            // Store the message in the database
            newMessage = await prisma.message.create({
                data: {
                    content: msg,
                },
            });
        } catch (e) {
            console.error('Failed to save message:', e)
        }

        io.emit('chat message', msg, newMessage.id);
    });

    if (!socket.recovered) {
        try {
            const messages = await prisma.message.findMany({
                where: { id: { gt: socket.handshake.auth.serverOffset || 0 } },
                select: { id: true, content: true }
            })

            //  Emit the recovery messages
            messages.forEach((message) => {
                socket.emit('chat message', message.content, message.id);
            });

        } catch (e) {
            console.log('Failed to recover')
        }
    }

    socket.on('disconnect', () => {
        console.log('User disconnected');
    })
})


server.listen(3000, () => {
    console.log('Server running at port 3000');
})
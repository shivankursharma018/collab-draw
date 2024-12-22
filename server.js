const express = require('express')
const http = require('http')
const { Server } = require('socket.io')
const next = require('next')

const dev = process.env.NODE_ENV !== 'production'
const nextApp = next({ dev })
const nextHandler = nextApp.getRequestHandler()

nextApp.prepare().then(() => {
  const app = express()
  const server = http.createServer(app)
  const io = new Server(server, {
    cors: {
      origin: "http://localhost:3000",
      methods: ["GET", "POST"]
    }
  })

  io.on('connection', (socket) => {
    console.log('A user connected:', socket.id)

    socket.on('joinRoom', (roomId) => {
      socket.join(roomId)
      console.log(`User ${socket.id} joined room: ${roomId}`)
      // Notify the client that they've successfully joined the room
      socket.emit('roomJoined', roomId)
    })

    socket.on('drawing', (data) => {
      console.log(`Drawing event received in room ${data.roomId} from user ${socket.id}`)
      // Broadcast to all clients in the room, including the sender
      io.in(data.roomId).emit('drawing', data)
    })

    socket.on('disconnect', () => {
      console.log('A user disconnected:', socket.id)
    })
  })

  app.all('*', (req, res) => nextHandler(req, res))

  const port = 3000
  server.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`)
  })
})


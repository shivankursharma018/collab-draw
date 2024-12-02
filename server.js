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
    console.log('A user connected')

    socket.on('joinRoom', (roomId) => {
      socket.join(roomId)
      console.log(`User joined room: ${roomId}`)
    })

    socket.on('drawing', (data) => {
      console.log(`Drawing event received in room: ${data.roomId}`)
      // Broadcast the drawing data to all clients in the room, except the sender
      socket.to(data.roomId).emit('drawing', data)
    })

    socket.on('disconnect', () => {
      console.log('A user disconnected')
    })
  })

  app.all('*', (req, res) => nextHandler(req, res))

  const port = 3000
  server.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`)
  })
})


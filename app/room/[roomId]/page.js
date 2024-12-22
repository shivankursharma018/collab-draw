'use client'

import React, { useEffect, useRef, useState, useCallback } from 'react'
import { io } from 'socket.io-client'

export default function Room({ params: paramsPromise }) {
  const params = React.use(paramsPromise)
  const roomId = params.roomId
  const canvasRef = useRef(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [socket, setSocket] = useState(null)
  const contextRef = useRef(null)

  useEffect(() => {
    const newSocket = io('http://localhost:3000', {
      transports: ['websocket'],
      upgrade: false
    })
    setSocket(newSocket)

    newSocket.on('connect', () => {
      console.log('Connected to server')
      newSocket.emit('joinRoom', roomId)
    })

    newSocket.on('connect_error', (error) => {
      console.error('Connection error:', error)
    })

    newSocket.on('roomJoined', (joinedRoomId) => {
      console.log(`Successfully joined room: ${joinedRoomId}`)
    })

    return () => {
      newSocket.off('connect')
      newSocket.off('connect_error')
      newSocket.off('roomJoined')
      newSocket.close()
    }
  }, [roomId])

  useEffect(() => {
    if (!canvasRef.current) return

    const canvas = canvasRef.current
    canvas.width = canvas.offsetWidth
    canvas.height = canvas.offsetHeight

    const context = canvas.getContext('2d')
    context.lineCap = 'round'
    context.strokeStyle = 'black'
    context.lineWidth = 2
    contextRef.current = context

    const handleResize = () => {
      canvas.width = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
      context.lineCap = 'round'
      context.strokeStyle = 'black'
      context.lineWidth = 2
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    if (!socket) return

    const handleRemoteDrawing = (data) => {
      if (!contextRef.current) return
      const { startX, startY, endX, endY } = data
      contextRef.current.beginPath()
      contextRef.current.moveTo(startX, startY)
      contextRef.current.lineTo(endX, endY)
      contextRef.current.stroke()
    }

    socket.on('drawing', handleRemoteDrawing)

    return () => {
      socket.off('drawing', handleRemoteDrawing)
    }
  }, [socket])

  const startDrawing = useCallback((event) => {
    if (!contextRef.current) return
    const { offsetX, offsetY } = event.nativeEvent
    contextRef.current.beginPath()
    contextRef.current.moveTo(offsetX, offsetY)
    setIsDrawing(true)
  }, [])

  const draw = useCallback((event) => {
    if (!isDrawing || !contextRef.current || !socket) return
    const { offsetX, offsetY } = event.nativeEvent
    contextRef.current.lineTo(offsetX, offsetY)
    contextRef.current.stroke()

    socket.emit('drawing', {
      startX: offsetX,
      startY: offsetY,
      endX: offsetX,
      endY: offsetY,
      roomId: roomId
    })
  }, [isDrawing, socket, roomId])

  const stopDrawing = useCallback(() => {
    if (!contextRef.current) return
    contextRef.current.closePath()
    setIsDrawing(false)
  }, [])

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="mb-4 text-2xl font-bold text-black">Room: {roomId}</h1>
      <canvas
        ref={canvasRef}
        className="border border-gray-300 bg-white cursor-crosshair"
        style={{ width: '800px', height: '600px' }}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseOut={stopDrawing}
      />
      <p className="mt-4 text-sm text-black">
        Start drawing to collaborate with others in this room.
      </p>
    </div>
  )
}


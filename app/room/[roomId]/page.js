'use client'

import React, { useEffect, useRef, useState, useCallback } from 'react'
import { io } from 'socket.io-client'

export default function Room({ params: paramsPromise }) {
  const params = React.use(paramsPromise)
  const roomId = params.roomId
  const canvasRef = useRef(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [socket, setSocket] = useState(null)
  const [context, setContext] = useState(null)
  const lastPositionRef = useRef({ x: 0, y: 0 })

  useEffect(() => {
    const newSocket = io('http://localhost:3000')
    setSocket(newSocket)

    newSocket.emit('joinRoom', roomId)

    return () => newSocket.close()
  }, [roomId])

  useEffect(() => {
    if (canvasRef.current) {
      const canvas = canvasRef.current
      const ctx = canvas.getContext('2d')
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
      ctx.strokeStyle = 'black'
      ctx.lineWidth = 2
      setContext(ctx)
    }
  }, [])

  useEffect(() => {
    if (!socket || !context) return

    const handleRemoteDrawing = (data) => {
      drawLine(data.startX, data.startY, data.endX, data.endY)
    }

    socket.on('drawing', handleRemoteDrawing)

    return () => {
      socket.off('drawing', handleRemoteDrawing)
    }
  }, [socket, context])

  const drawLine = useCallback((startX, startY, endX, endY) => {
    if (!context) return

    context.beginPath()
    context.moveTo(startX, startY)
    context.lineTo(endX, endY)
    context.stroke()
  }, [context])

  const startDrawing = useCallback((e) => {
    setIsDrawing(true)
    const { offsetX, offsetY } = e.nativeEvent
    lastPositionRef.current = { x: offsetX, y: offsetY }
  }, [])

  const stopDrawing = useCallback(() => {
    setIsDrawing(false)
  }, [])

  const draw = useCallback((e) => {
    if (!isDrawing || !context || !socket) return

    const { offsetX, offsetY } = e.nativeEvent
    const startX = lastPositionRef.current.x
    const startY = lastPositionRef.current.y
    const endX = offsetX
    const endY = offsetY

    drawLine(startX, startY, endX, endY)

    socket.emit('drawing', {
      startX,
      startY,
      endX,
      endY,
      roomId: roomId,
    })

    lastPositionRef.current = { x: endX, y: endY }
  }, [isDrawing, context, socket, roomId, drawLine])

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="mb-4 text-2xl font-bold text-black">Room: {roomId}</h1>
      <canvas
        ref={canvasRef}
        width={800}
        height={600}
        className="border border-gray-300 bg-white cursor-crosshair"
        onMouseDown={startDrawing}
        onMouseUp={stopDrawing}
        onMouseOut={stopDrawing}
        onMouseMove={draw}
        aria-label="Collaborative whiteboard"
        role="img"
      />
      <p className="mt-4 text-sm text-black">
        Start drawing to collaborate with others in this room.
      </p>
    </div>
  )
}


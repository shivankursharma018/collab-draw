
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function Home() {
  const [roomId, setRoomId] = useState('')
  const router = useRouter()

  const handleCreateRoom = () => {
    const newRoomId = Math.random().toString(36).substring(7)
    router.push(`/room/${newRoomId}`)
  }

  const handleJoinRoom = (e) => {
    e.preventDefault()
    if (roomId.trim()) {
      router.push(`/room/${roomId}`)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="p-8 bg-white rounded-lg shadow-md">
        <h1 className="mb-6 text-3xl font-bold text-center">Realtime Whiteboard</h1>
        <div className="space-y-4">
          <button
            onClick={handleCreateRoom}
            className="w-full px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600"
          >
            Create Room
          </button>
          <form onSubmit={handleJoinRoom} className="space-y-2">
            <input
              type="text"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              placeholder="Enter Room ID"
              className="w-full px-4 py-2 border rounded"
            />
            <button
              type="submit"
              className="w-full px-4 py-2 text-white bg-green-500 rounded hover:bg-green-600"
            >
              Join Room
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}


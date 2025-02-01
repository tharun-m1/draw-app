import { Loader2, X } from 'lucide-react'
import React from 'react'

interface JoinRoomModalProps {
    setShowJoinModal: (b: boolean) => void;
    handleJoinRoom: (e: React.FormEvent) => void;
    roomCode: string;
    setRoomCode: (s: string) => void;
    isLoading: boolean
}

function JoinRoomModal({setShowJoinModal, handleJoinRoom, roomCode, setRoomCode, isLoading}: JoinRoomModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-100">Join Room</h2>
              <button
                onClick={() => setShowJoinModal(false)}
                className="text-gray-400 hover:text-gray-300"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleJoinRoom}>
              <input
                type="text"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value)}
                placeholder="Enter room code"
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-4"
              />
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowJoinModal(false)}
                  className="px-4 py-2 text-gray-300 hover:text-gray-100"
                  disabled={isLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
                  disabled={isLoading}
                >
                  {isLoading && <Loader2 className="animate-spin h-4 w-4 mr-2" />}
                  Join
                </button>
              </div>
            </form>
          </div>
        </div>
  )
}

export default JoinRoomModal

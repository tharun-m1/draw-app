import { Loader2, X } from 'lucide-react';
import React from 'react'

interface CreateRoomModalProps {
    setShowCreateModal: (b: boolean) => void;
    handleCreateRoom: (e: React.FormEvent) => void;
    newRoomName: string;
    setNewRoomName: (s: string) => void;
    isLoading: boolean;
}

function CreateRoomModal({setShowCreateModal,handleCreateRoom, newRoomName, setNewRoomName, isLoading}: CreateRoomModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-100">
                Create New Room
              </h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-gray-300"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleCreateRoom}>
              <input
                type="text"
                value={newRoomName}
                onChange={(e) => setNewRoomName(e.target.value)}
                placeholder="Enter room name"
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-4"
              />
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
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
                  {isLoading && (
                    <Loader2 className="animate-spin h-4 w-4 mr-2" />
                  )}
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
  )
}

export default CreateRoomModal

"use client";
import React, { useEffect, useState } from "react";
import { Plus, Share, Search } from "lucide-react";
import RoomTab from "@/components/RoomTab";
import JoinRoomModal from "@/components/JoinRoomModal";
import CreateRoomModal from "@/components/CreateRoomModal";
import Header from "@/components/Header";
import toast from "react-hot-toast";
import axios from "axios";
import { BACKEND_URL } from "@/config";

interface Room {
  id: string;
  name: string;
  lastAccessed: string;
  participants: number;
  createdAt: string;
}

const Dashboard: React.FC = () => {
  // States
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [roomCode, setRoomCode] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [newRoomName, setNewRoomName] = useState("");
  const [rooms, setRooms] = useState([]);



  // Handlers
  const handleJoinRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate API call
      console.log("Joining room with code:", roomCode);
      setShowJoinModal(false);
      setRoomCode("");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    for (let c = 0; c < newRoomName.length; c++) {
      if (newRoomName.charAt(c) == " ") {
        toast.error("Cannot have Spaces", { id: "VALIDATION_FAILED" });
        setIsLoading(false)
        return;
      }
    }
    try {
      const res = await axios.post(
        `${BACKEND_URL}/room/create`,
        {
          room: newRoomName,
        },
        {
          headers: {
            Authorization: localStorage.getItem("token"),
          },
        }
      );
      setShowCreateModal(false);
      setNewRoomName("");
      return res.data.roomId;
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteRoom = async(roomId: string) => {
    try {
        const res = await axios.delete(`${BACKEND_URL}/room/delete/${roomId}`, {
          headers:{
            Authorization:localStorage.getItem("token")
          }
        })
        return res.data.roomId;
    } catch (error) {
      console.log(error)
      toast.error("Failed to Delete.", {id:"DELETE_FAILED"})
    }
  }

  useEffect(() => {
    const get_rooms = async () => {
      try {
        const res = await axios.get(`${BACKEND_URL}/room/all/rooms`, {
          headers: {
            Authorization: localStorage.getItem("token"),
          },
        });
        setRooms(res.data.rooms);
      } catch (error) {
        toast.error("Unable to load rooms.", {id:"GET_FAILED"});
      }
    };

    get_rooms();
  }, [handleCreateRoom, handleDeleteRoom]);

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <Header />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Action Buttons and Search */}
        <div className="flex flex-col sm:flex-row justify-between gap-4 mb-8">
          <div className="flex flex-wrap gap-4">
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-5 w-5 mr-2" />
              Create Room
            </button>
            <button
              onClick={() => setShowJoinModal(true)}
              className="flex items-center px-4 py-2 border border-gray-700 text-gray-300 rounded-lg hover:bg-gray-800 transition-colors"
            >
              <Share className="h-5 w-5 mr-2" />
              Join Room
            </button>
          </div>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
              <input
                type="text"
                placeholder="Search rooms..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Rooms Grid */}
        <div>
          <h2 className="text-xl font-semibold text-gray-100 mb-4">
            Your Rooms{" "}
            {rooms.length > 0 &&
              `(${rooms.length})`}
          </h2>
          {rooms.length === 0 ? (
            <div className="text-center py-12 bg-gray-800 rounded-lg">
              <p className="text-gray-400">No rooms found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {rooms?.map((room) => <RoomTab deleteRoom={handleDeleteRoom} key={room.id} room={room} />)}
            </div>
          )}
        </div>
      </main>

      {/* Join Room Modal */}
      {showJoinModal && (
        <JoinRoomModal
          setShowJoinModal={setShowJoinModal}
          handleJoinRoom={handleJoinRoom}
          roomCode={roomCode}
          setRoomCode={setRoomCode}
          isLoading={isLoading}
        />
      )}

      {/* Create Room Modal */}
      {showCreateModal && (
        <CreateRoomModal
          setShowCreateModal={setShowCreateModal}
          handleCreateRoom={handleCreateRoom}
          newRoomName={newRoomName}
          setNewRoomName={setNewRoomName}
          isLoading={isLoading}
        />
      )}
    </div>
  );
};

export default Dashboard;


import { Clock, Trash2,  Users } from "lucide-react";
import React from "react";

interface RoomTabProps {
  room:any;
  deleteRoom: (s: string) => void;
}

function RoomTab({ room, deleteRoom }: RoomTabProps) {

  return (
    <div
      key={room.id}
      className="bg-gray-800 rounded-lg p-4 hover:bg-gray-750 transition-colors"
    >
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-lg font-medium text-gray-100">{room.slug}</h3>
        {/* <div className="flex items-center text-gray-400">
          <Users className="h-4 w-4 mr-1" />
          <span className="text-sm">{room.participants}</span>
        </div> */}
      </div>
      {/* <div className="flex items-center text-sm text-gray-400">
        <Clock className="h-4 w-4 mr-1" />
        <span>Last accessed {room.lastAccessed}</span>
      </div> */}
      <div className="mt-2 flex items-center gap-3">
        <button className="bg-green-700 px-6 py-1 rounded-lg text-white tracking-wide font-semibold">Join Now</button>
        <button onClick={() => deleteRoom(room.id)}>
            <Trash2 className="text-red-700" />
        </button>
      </div>
    </div>
  );
}

export default RoomTab;

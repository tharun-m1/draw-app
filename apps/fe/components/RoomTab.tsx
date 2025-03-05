import { Clock, Loader2, Trash2, Users } from "lucide-react";
import { useRouter } from "next/navigation";

import React, { useState } from "react";
import toast from "react-hot-toast";

interface RoomTabProps {
  room: any;
  deleteRoom: (s: string) => void;
}

function RoomTab({ room, deleteRoom }: RoomTabProps) {
  const [loading, setLoading] = useState<Boolean>(false)
  const router = useRouter()
  const handleJoin = () => {
    setLoading(true)
    localStorage.setItem("passKey", room.passKey)
    router.push(`/canvas/${room.slug}`)
    setLoading(false)
    return;
  }
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
        <button
          onClick={() => {
            navigator.clipboard.writeText(room.passKey);
            toast.success("Copied!")
          }}
          className=" text-white border border-zinc-300 px-2 py-1 text-[0.75rem] rounded-md"
        >
          Copy Pass Key
        </button>
      </div>

      <div className="mt-2 flex items-center gap-3">
        <button onClick={handleJoin} className="bg-green-700 px-6 py-1 rounded-lg text-white tracking-wide font-semibold">
          Join Now
        </button>
        <button title="Deletes instantly" onClick={() => deleteRoom(room.id)}>
          <Trash2 className="text-red-700" />
        </button>
      </div>
    </div>
  );
}

export default RoomTab;

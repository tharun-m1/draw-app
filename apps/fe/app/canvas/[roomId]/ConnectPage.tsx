"use client";
import Canvas from "@/components/Canvas";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { BACKEND_URL, WS_URL } from "@/config";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

interface ConnectPageProps {
  slugId: string;
}

function ConnectPage({ slugId }: ConnectPageProps) {
  const [roomId, setRoomId] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const router = useRouter();

  const connect = async () => {
    try {
      setLoading(true);
      const token = window.localStorage.getItem("token");
      const res = await axios.get(`${BACKEND_URL}/room/${slugId}`, {
        headers: {
          Authorization: token,
        },
      });
      setRoomId(res.data.roomId);
      const ws = new WebSocket(`${WS_URL}?token=${token}`);
      ws.onopen = () => {
        setSocket(ws);
        const data = JSON.stringify({
          type: "join_room",
          roomId: res.data.roomId,
          passKey: localStorage.getItem("passKey"),
        });

        ws.send(data);
      };
      ws.onclose = (event) => {
        const key = localStorage.getItem("passKey");
        if (!key) {
          toast.error("No Pass Key Provided!", { id: "NO_PASSKEY" });
        } else {
          toast.error("Server Disconnected!", { id: "DISCONNECTED" });
        }
        console.log(event.reason)
        router.replace("/dashboard");
      };
    } catch (error) {
      console.log(error);
      router.back();
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    connect();
  }, []);

  useEffect(() => {}, []);
  if (loading) {
    return <div className="h-[100vh] w-full flex justify-center items-center text-white bg-black text-xl">Connecting...</div>;
  }

  return <Canvas roomId={roomId} ws={socket} />;
}

export default ConnectPage;

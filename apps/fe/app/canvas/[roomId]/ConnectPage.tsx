"use client";
import Canvas from "@/components/Canvas";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { BACKEND_URL, WS_URL } from "@/config";
import { useRouter } from "next/navigation";

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
      const token = window.localStorage.getItem("token")
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
        });

        ws.send(data);
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
    return <div>Connecting...</div>;
  }

  return <Canvas roomId={roomId} ws={socket} />;
}

export default ConnectPage;

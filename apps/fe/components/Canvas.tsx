"use client";

type tool = "rect" | "pointer" | "circle" | "line";

import Tool from "@/components/Tool";

// import { initDraw } from "@/draw";
import { Game } from "@/draw/logic";
import useScreenSize from "@/hooks/useScreenSize";
import { Circle, Minus, MousePointer, Square } from "lucide-react";

import React, { useEffect, useRef, useState } from "react";

interface CanvasProps {
  roomId: string | null;
  ws: WebSocket | null;
}

function Canvas({ roomId, ws }: CanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const toolbarRef = useRef<HTMLDivElement>(null);
  const [game, setGame] = useState<Game | null>(null);
  const [selectedTool, setSelectedTool] = useState<tool>("pointer");
  const {width, height} = useScreenSize()

  const handleToolSelect = (tool: tool) => {
    setSelectedTool(tool);
  };

  const getLeft = () => {
    if(toolbarRef.current){
      const toolbar = toolbarRef.current;
      const tW = parseInt(window.getComputedStyle(toolbar).width, 10)
      const left = width - tW

      return `${left/2}px`
    }
  }

  useEffect(() => {
    if (canvasRef.current) {
      if (!ws) {
        return;
      }
      const g = new Game(canvasRef.current, ws, roomId);
      setGame(g);

      return () => {
        g?.destroy();
      };
    }
  }, [canvasRef, ws, width, height]);

  useEffect(() => {
    game?.setSelectedTool(selectedTool);
  }, [selectedTool, game]);
  return (
    <div className="h-full w-full">
      <canvas ref={canvasRef} width={width} height={height}></canvas>
      {/* <div className="fixed top-4 w-full flex justify-center  text-white"> */}
        <div ref={toolbarRef} style={{
          left: getLeft()
        }} className="bg-zinc-700 flex gap-4 px-3 py-1 rounded-lg z-50 absolute top-4 text-white">
          <Tool
            changeTool={() => handleToolSelect("circle")}
            isSelected={selectedTool === "circle"}
          >
            <Circle />
          </Tool>
          <Tool
            changeTool={() => handleToolSelect("rect")}
            isSelected={selectedTool === "rect"}
          >
            <Square />
          </Tool>
          <Tool
            changeTool={() => handleToolSelect("line")}
            isSelected={selectedTool === "line"}
          >
            <Minus />
          </Tool>
          <Tool
            changeTool={() => handleToolSelect("pointer")}
            isSelected={selectedTool === "pointer"}
          >
            <MousePointer />
          </Tool>
        {/* </div> */}
      </div>
    </div>
  );
}

export default Canvas;

import { ReactNode } from "react"

interface ToolProps {
    children: ReactNode;
    isSelected: boolean;
    changeTool: () => void;
}


function Tool({children, isSelected, changeTool}: ToolProps) {
  return (
    <button onClick={changeTool} className={`hover:bg-zinc-800 p-2 rounded-lg ${isSelected && "bg-zinc-800"}`}>{children}</button>
  )
}

export default Tool

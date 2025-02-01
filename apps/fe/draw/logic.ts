import { BACKEND_URL } from "@/config";
import axios from "axios";

type SelectedTool = "rect" | "circle" | "line" | "pointer"
type Shape = {
    type: "rect";
    startX: number;
    startY: number;
    width: number;
    height: number;
} | null | {
    type: "circle";
    centerX: number;
    centerY: number;
    radiusX: number;
    radiusY: number;
    rotation: number;
    startAngle: number;
    endAngle: number;
} | {
    type: "line";
    startX: number;
    startY: number;
    endX: number;
    endY: number;
}


export class Game {

    private canvas;
    private ctx;
    private ws: WebSocket | null;
    private clicked: boolean = false;
    private startX: number = 0;
    private startY: number = 0;
    private width: number = 0;
    private heigth: number = 0;
    private selectedTool: string = "pointer";
    private existingShapes: Shape[] = [];
    private roomId: string | null = null

    constructor(canvas: HTMLCanvasElement, ws: WebSocket | null, roomId: string | null) {
        const ctx = canvas.getContext("2d")
        this.ctx = ctx;
        this.ws = ws;
        this.canvas = canvas
        this.roomId = roomId
        this.init();
    }
    setSelectedTool(selectedTool: SelectedTool) {
        this.selectedTool = selectedTool
    }

    private init() {
        if (!this.ctx) return;
        this.ctx.fillStyle = "rgba(0, 0, 0)"
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)
        this.ctx.strokeStyle = "rgba(255, 255, 255)"
        this.initHandlers();
        this.initShapes();
    }

    private drawStrokeRect(s: number, e: number, w: number, h: number) {
        if (!this.ctx) return;
        this.ctx.strokeStyle = "rgba(255, 255, 255)"
        this.ctx?.strokeRect(s, e, w, h)
    }
    private drawStrokeCircle(centerX: number, centerY: number, radiusX: number, radiusY: number, rotation: number, startAngle: number, endAngle: number) {
        if (!this.ctx) return;
        this.ctx.beginPath()
        this.ctx.ellipse(centerX, centerY, Math.abs(radiusX), Math.abs(radiusY), rotation, startAngle, endAngle)
        this.ctx.stroke()
    }
    private drawLine(x1: number, y1: number, x2: number, y2: number) {
        if (!this.ctx) return;
        this.ctx?.beginPath();
        this.ctx?.moveTo(x1, y1)
        this.ctx?.lineTo(x2, y2)
        this.ctx?.stroke()
    }

    async initShapes() {
        try {
            const shapes = await this.getShapes()
            this.existingShapes = shapes
            this.clearCanvas();
        } catch (error) {
            console.log(error)
        }
    }

    destroy() {
        this.canvas.removeEventListener("mousedown", this.mouseDownHandler)
        this.canvas.removeEventListener("mousemove", this.mouseMoveHandler)

        this.canvas.removeEventListener("mouseup", this.mouseUpHandler)
    }

    private mouseDownHandler = (e: MouseEvent) => {
        if (this.selectedTool === "pointer") return;
        this.clicked = true;
        this.startX = e.clientX;
        this.startY = e.clientY;
    }

    private mouseMoveHandler = (e: MouseEvent) => {
        if (this.selectedTool === "pointer") return;
        if (!this.ctx) return;
        if (!this.clicked) return;

        this.width = e.clientX - this.startX
        this.heigth = e.clientY - this.startY
        this.clearCanvas()
        this.ctx.strokeStyle = "rgba(255, 255, 255)"

        if (this.selectedTool === "rect") {
            this.drawStrokeRect(this.startX, this.startY, this.width, this.heigth)
        }
        if (this.selectedTool === "circle") {
            const centerX = this.startX + this.width / 2
            const centerY = this.startY + this.heigth / 2;
            const radiusX = this.width / 2;
            const radiusY = this.heigth / 2
            const rotation = 0;
            const startAngle = 0;
            const endAngle = 2 * Math.PI
            this.drawStrokeCircle(centerX, centerY, (radiusX), (radiusY), rotation, startAngle, endAngle)
        }
        if (this.selectedTool === "line") {
            this.drawLine(this.startX, this.startY, e.clientX, e.clientY)
        }

    }

    private mouseUpHandler = (e: MouseEvent) => {
        if (this.selectedTool === "pointer") return;
        this.clicked = false
        this.width = e.clientX - this.startX
        this.heigth = e.clientY - this.startY
        let newShape: Shape = null;
        if (this.selectedTool === "rect") {
            newShape = {
                type: "rect",
                startX: this.startX,
                startY: this.startY,
                width: this.width,
                height: this.heigth,

            }
        }
        if (this.selectedTool === "circle") {
            newShape = {
                type: "circle",
                centerX: this.startX + this.width / 2,
                centerY: this.startY + this.heigth / 2,
                radiusX: this.width / 2,
                radiusY: this.heigth / 2,
                rotation: 0,
                startAngle: 0,
                endAngle: 2 * Math.PI
            }
        }
        if (this.selectedTool === "line") {
            newShape = {
                type: "line",
                startX: this.startX,
                startY: this.startY,
                endX: e.clientX,
                endY: e.clientY
            }
        }

        if (!newShape) return;

        this.existingShapes.push(newShape)
        if (!this.ws) {
            alert("Disconnected.")
            return;
        }
        this.ws.send(JSON.stringify({
            type: "chat",
            message: JSON.stringify({ ...newShape }),
            roomId: this.roomId
        }))

    }



    private initHandlers() {

        this.canvas.addEventListener("mousedown", this.mouseDownHandler)

        this.canvas.addEventListener("mousemove", this.mouseMoveHandler)

        this.canvas.addEventListener("mouseup", this.mouseUpHandler)
        if (!this.ws) {
            alert("no ws")
            return;
        }
        this.ws.onmessage = (e) => {
            const message = JSON.parse(e.data)
            if (message.type === "chat") {
                const shape = JSON.parse(message.message)
                this.existingShapes.push(shape)
                this.clearCanvas();
            }

        }

    }

    private async getShapes() {
        const res = await axios.get(`${BACKEND_URL}/room/chats/${this.roomId}`, {
            headers: {
                Authorization: localStorage.getItem("token")
            }
        })
        const messages = res.data.messages
        const shapes = messages.map((msg: any) => {
            const shape = JSON.parse(msg.message)
            return shape
        })
        return shapes
    }

    private clearCanvas() {
        if (!this.ctx) return;
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
        this.ctx.fillStyle = "rgba(0, 0, 0)"
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)
        this.ctx.strokeStyle = "rgba(255, 255, 255)"
        this.existingShapes?.map((shape: any) => {

            if (shape.type === "rect") {
                this.drawStrokeRect(shape.startX, shape.startY, shape.width, shape.height)
            }
            else if (shape.type === "circle") {
                this.drawStrokeCircle(shape.centerX, shape.centerY, shape.radiusX, shape.radiusY, shape.rotation, shape.startAngle, shape.endAngle)
            }
            else if (shape.type === "line") {
                this.drawLine(shape.startX, shape.startY, shape.endX, shape.endY)
            }

        })
    }
}
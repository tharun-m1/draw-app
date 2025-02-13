import { BACKEND_URL } from "@/config";
import axios from "axios";

type SelectedTool = "rect" | "circle" | "line" | "pointer" | "pen" | "text";
type Shape =
  | {
      type: "rect";
      startX: number;
      startY: number;
      width: number;
      height: number;
    }
  | null
  | {
      type: "circle";
      centerX: number;
      centerY: number;
      radiusX: number;
      radiusY: number;
      rotation: number;
      startAngle: number;
      endAngle: number;
    }
  | {
      type: "line";
      startX: number;
      startY: number;
      endX: number;
      endY: number;
    }
  | {
      type: "pen";
      points: Point[];
    }
  | {
      type: "text";
      content: string;
      startX: number;
      startY: number;
    };

interface Point {
  x: number;
  y: number;
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
  private roomId: string | null = null;
  private points: Point[] = [];
  private inputbox: HTMLTextAreaElement | null = null;
  private content: string = "";

  constructor(
    canvas: HTMLCanvasElement,
    ws: WebSocket | null,
    roomId: string | null
  ) {
    const ctx = canvas.getContext("2d");
    this.ctx = ctx;
    this.ws = ws;
    this.canvas = canvas;
    this.roomId = roomId;
    this.init();
  }
  setSelectedTool(selectedTool: SelectedTool) {
    this.selectedTool = selectedTool;
  }

  private init() {
    if (!this.ctx) return;
    this.ctx.fillStyle = "rgba(0, 0, 0)";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.strokeStyle = "rgba(255, 255, 255)";
    this.initHandlers();
    this.initShapes();
  }

  private drawStrokeRect(s: number, e: number, w: number, h: number) {
    if (!this.ctx) return;
    this.ctx.strokeStyle = "rgba(255, 255, 255)";
    this.ctx?.strokeRect(s, e, w, h);
  }
  private drawStrokeCircle(
    centerX: number,
    centerY: number,
    radiusX: number,
    radiusY: number,
    rotation: number,
    startAngle: number,
    endAngle: number
  ) {
    if (!this.ctx) return;
    this.ctx.beginPath();
    this.ctx.ellipse(
      centerX,
      centerY,
      Math.abs(radiusX),
      Math.abs(radiusY),
      rotation,
      startAngle,
      endAngle
    );
    this.ctx.stroke();
  }
  private drawLine(x1: number, y1: number, x2: number, y2: number) {
    if (!this.ctx) return;
    this.ctx?.beginPath();
    this.ctx?.moveTo(x1, y1);
    this.ctx?.lineTo(x2, y2);
    this.ctx?.stroke();
  }

  private freeHand(points: any) {
    if (!this.ctx) return;
    this.ctx.lineWidth = 2;
    this.ctx?.beginPath();
    this.ctx?.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length - 1; i++) {
      const xc = (points[i].x + points[i + 1].x) / 2;
      const yc = (points[i].y + points[i + 1].y) / 2;
      this.ctx.quadraticCurveTo(points[i].x, points[i].y, xc, yc);
    }

    this.ctx.stroke();
    this.ctx.lineWidth = 2;
    this.ctx.lineCap = "round";
    this.ctx.lineJoin = "round";
  }

  async initShapes() {
    try {
      const shapes = await this.getShapes();
      this.existingShapes = shapes;
      this.clearCanvas();
    } catch (error) {
      console.log(error);
    }
  }

  private createInputbox() {
    if (this.inputbox) {
      return;
    }
    if (this.canvas.width - this.startX <= 10) return;
    const inputbox = document.createElement("textarea");
    inputbox.setAttribute("id", "inputbox");
    inputbox.style.border = "2px solid white";
    inputbox.style.position = "absolute";
    inputbox.style.left = this.startX + "px";
    inputbox.style.top = this.startY + "px";
    inputbox.style.background = "transparent";
    inputbox.style.resize = "none";
    inputbox.style.color = "white";
    inputbox.style.lineHeight = "1.5";
    inputbox.style.padding = "10px";
    inputbox.style.overflow = "hidden";
    inputbox.style.width =
      this.startX + 300 < window.innerWidth
        ? "300px"
        : `${this.canvas.width - this.startX - 10}px`;
    inputbox.style.height = "auto";
    document.body.appendChild(inputbox);
    setTimeout(() => inputbox.focus(), 0);
    inputbox.addEventListener("input", this.handleTextChange.bind(this));
    inputbox.addEventListener("blur", this.saveText.bind(this));
    this.inputbox = inputbox;
  }

  private handleTextChange(e: any) {
    //find event type here
    if (!this.inputbox) return;
    this.content = e.target.value;
    this.inputbox.style.height = "auto";
    this.inputbox.style.height = this.inputbox.scrollHeight + "px";
  }

  private saveText() {
    const inputbox = document.getElementById("inputbox");

    if (!this.inputbox) return;
    const styles = getComputedStyle(this.inputbox);
    this.drawText(
      this.content,
      parseFloat(styles.left),
      parseFloat(styles.top),
      parseFloat(styles.width)
    );
    const newShape: Shape = {
      type: "text",
      content: this.content,
      startX: parseFloat(styles.left),
      startY: parseFloat(styles.top),
    };
    this.existingShapes.push(newShape);
    this.ws?.send(JSON.stringify({
      type:"chat",
      message:JSON.stringify({...newShape}),
      roomId: this.roomId
    }))
    if (inputbox) {
      document.body.removeChild(inputbox);
    }
    this.inputbox = null;
    this.content = "";
  }
  private drawText(text: string, x: number, y: number, maxWidth: number) {
    if (!this.ctx) return;
    const words = text.split(" ");
    let x_offset = x;
    let y_offset = y;
    let line = "";
    let fontSize = 16;
    let lineHeight = fontSize * 1.5;
    this.ctx.font = `${fontSize}px sans`;
    this.ctx.fillStyle = "rgba(255, 255, 255)";
    this.ctx.letterSpacing = "2px";

    for (let i = 0; i < words.length; i++) {
      line = line + words[i] + " ";
      let metrics = this.ctx.measureText(line);
      if (metrics.width >= maxWidth && i > 0) {
        this.ctx.fillText(line, x_offset, y_offset);
        y_offset += lineHeight;
        line = "";
      }
    }

    this.ctx.fillText(line, x_offset, y_offset);
  }

  destroy() {
    this.canvas.removeEventListener("mousedown", this.mouseDownHandler);
    this.canvas.removeEventListener("mousemove", this.mouseMoveHandler);
    this.canvas.removeEventListener("mouseup", this.mouseUpHandler);
  }

  private mouseDownHandler = (e: MouseEvent) => {
    if (this.selectedTool === "pointer") return;
    this.clicked = true;
    this.startX = e.clientX;
    this.startY = e.clientY;
    if (this.selectedTool === "pen") {
      this.ctx?.beginPath();
    }
    if (this.selectedTool === "text") {
      this.clicked = false;
      this.createInputbox();
    }
  };

  private mouseMoveHandler = (e: MouseEvent) => {
    if (this.selectedTool === "pointer") return;
    if (!this.ctx) return;
    if (!this.clicked) return;

    this.width = e.clientX - this.startX;
    this.heigth = e.clientY - this.startY;
    this.clearCanvas();
    this.ctx.strokeStyle = "rgba(255, 255, 255)";

    if (this.selectedTool === "rect") {
      this.drawStrokeRect(this.startX, this.startY, this.width, this.heigth);
    }
    if (this.selectedTool === "circle") {
      const centerX = this.startX + this.width / 2;
      const centerY = this.startY + this.heigth / 2;
      const radiusX = this.width / 2;
      const radiusY = this.heigth / 2;
      const rotation = 0;
      const startAngle = 0;
      const endAngle = 2 * Math.PI;
      this.drawStrokeCircle(
        centerX,
        centerY,
        radiusX,
        radiusY,
        rotation,
        startAngle,
        endAngle
      );
    }
    if (this.selectedTool === "line") {
      this.drawLine(this.startX, this.startY, e.clientX, e.clientY);
    }

    if (this.selectedTool === "pen") {
      this.points.push({ x: e.clientX, y: e.clientY });
      this.freeHand(this.points);
    }
  };

  private mouseUpHandler = (e: MouseEvent) => {
    if (this.selectedTool === "pointer") return;
    this.clicked = false;
    this.width = e.clientX - this.startX;
    this.heigth = e.clientY - this.startY;
    let newShape: Shape = null;
    if (this.selectedTool === "rect") {
      newShape = {
        type: "rect",
        startX: this.startX,
        startY: this.startY,
        width: this.width,
        height: this.heigth,
      };
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
        endAngle: 2 * Math.PI,
      };
    }
    if (this.selectedTool === "line") {
      newShape = {
        type: "line",
        startX: this.startX,
        startY: this.startY,
        endX: e.clientX,
        endY: e.clientY,
      };
    }
    if (this.selectedTool === "pen") {
      newShape = {
        type: "pen",
        points: this.points,
      };
      this.points = [];
    }

    if (!newShape) return;

    this.existingShapes.push(newShape);
    if (!this.ws) {
      alert("Disconnected.");
      return;
    }
    this.ws.send(
      JSON.stringify({
        type: "chat",
        message: JSON.stringify({ ...newShape }),
        roomId: this.roomId,
      })
    );
  };

  private initHandlers() {
    this.canvas.addEventListener("mousedown", this.mouseDownHandler);

    this.canvas.addEventListener("mousemove", this.mouseMoveHandler);

    this.canvas.addEventListener("mouseup", this.mouseUpHandler);
    if (!this.ws) {
      alert("no ws");
      return;
    }
    this.ws.onmessage = (e) => {
      const message = JSON.parse(e.data);
      if (message.type === "chat") {
        const shape = JSON.parse(message.message);
        this.existingShapes.push(shape);
        this.clearCanvas();
      }
    };
  }

  private async getShapes() {
    const res = await axios.get(`${BACKEND_URL}/room/chats/${this.roomId}`, {
      headers: {
        Authorization: localStorage.getItem("token"),
      },
    });
    const messages = res.data.messages;
    const shapes = messages.map((msg: any) => {
      const shape = JSON.parse(msg.message);
      return shape;
    });
    return shapes;
  }

  private clearCanvas() {
    if (!this.ctx) return;
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.fillStyle = "rgba(0, 0, 0)";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.strokeStyle = "rgba(255, 255, 255)";
    this.existingShapes?.map((shape: any) => {
      if (shape.type === "rect") {
        this.drawStrokeRect(
          shape.startX,
          shape.startY,
          shape.width,
          shape.height
        );
      } else if (shape.type === "circle") {
        this.drawStrokeCircle(
          shape.centerX,
          shape.centerY,
          shape.radiusX,
          shape.radiusY,
          shape.rotation,
          shape.startAngle,
          shape.endAngle
        );
      } else if (shape.type === "line") {
        this.drawLine(shape.startX, shape.startY, shape.endX, shape.endY);
      } else if (shape.type === "pen") {
        this.ctx?.beginPath();
        this.freeHand(shape.points);
      } else if (shape.type === "text") {
        this.drawText(shape.content, shape.startX, shape.startY, 300);
      }
    });
  }
}

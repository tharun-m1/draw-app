import { BACKEND_URL } from "@/config";
import axios from "axios";
import { Key } from "react";

type SelectedTool =
  | "rect"
  | "circle"
  | "line"
  | "pointer"
  | "pen"
  | "text"
  | "erase";
type Shape =
  | {
      shapeId: string;
      type: "rect";
      startX: number;
      startY: number;
      width: number;
      height: number;
    }
  | null
  | {
      shapeId: string;
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
      shapeId: string;
      type: "line";
      startX: number;
      startY: number;
      endX: number;
      endY: number;
    }
  | {
      shapeId: string;
      type: "pen";
      points: Point[];
    }
  | {
      shapeId: string;
      type: "text";
      content: string;
      startX: number;
      startY: number;
    };

interface Point {
  x: number;
  y: number;
}
type ShapeWithoutId = Omit<Shape, "id"> | null;

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
    if (selectedTool === "pointer") {
      this.canvas.style.cursor = "move";
    } else {
      this.canvas.style.cursor = "auto";
    }
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
    if (this.content.trim().length !== 0) {
      const shapeId = crypto.randomUUID();
      this.existingShapes.push(newShape);
      this.ws?.send(
        JSON.stringify({
          type: "chat",
          message: JSON.stringify({ ...newShape }),
          roomId: this.roomId,
          shapeId,
        })
      );
    }

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

  private eraseShape(shapeId: string) {
    // console.log("shapeId: ", shape)
    this.existingShapes = this.existingShapes.filter(
      (shape: Shape) => shape?.shapeId !== shapeId
    );
    // console.log(this.existingShapes)
    this.ws?.send(
      JSON.stringify({
        type: "erase",
        roomId: this.roomId,
        shapeId: shapeId,
      })
    );
    this.clearCanvas();
  }

  private eraseRect(
    x: number,
    y: number,
    shape: Extract<Shape, { type: "rect" }>
  ) {
    // Horizontal lines
    if (x >= shape.startX && x <= shape.startX + shape.width) {
      if (
        (y >= shape.startY - 3 && y <= shape.startY + 3) ||
        (y >= shape.startY + shape.height - 3 &&
          y <= shape.startY + shape.height + 3)
      ) {
        this.eraseShape(shape.shapeId);
        // console.log("a rectangle");
        return true;
      }
    }
    // Vertical lines
    if (y >= shape.startY && y <= shape.startY + shape.height) {
      if (
        (x >= shape.startX - 3 && x <= shape.startX + 3) ||
        (x >= shape.startX + shape.width - 3 &&
          x <= shape.startX + shape.width + 3)
      ) {
        this.eraseShape(shape.shapeId);
        // console.log("a rectangle");
        return true;
      }
    }
    return false
  }

  private eraseLine(
    x: number,
    y: number,
    shape: Extract<Shape, { type: "line" }>
  ) {
    const x1 = shape.startX;
    const y1 = shape.startY;
    const x2 = shape.endX;
    const y2 = shape.endY;
    const A = y2 - y1;
    const B = x1 - x2;
    const C = x2 * y1 - x1 * y2;
    const numerator = Math.abs(A * x + B * y + C);
    const denominator = Math.sqrt(A * A + B * B);
    const d = numerator / denominator;
    if (d <= 3) {
      this.eraseShape(shape.shapeId);
      return true;
    }
    return false;
  }

  private eraseCircle(
    x: number,
    y: number,
    shape: Extract<Shape, { type: "circle" }>
  ) {
    const cx = shape.centerX;
    const cy = shape.centerY;
    const rx = shape.radiusX;
    const ry = shape.radiusY;
    const dx = x - cx;
    const dy = y - cy;
    const eq =
      Math.abs((dx * dx) / (rx * rx) + (dy * dy) / (ry * ry) - 1) *
      Math.min(rx, ry);
    if (eq <= 5) {
      this.eraseShape(shape.shapeId);
      return true;
    }
    return false
  }

  private eraseFreeHandDrawing(
    x: number,
    y: number,
    shape: Extract<Shape, { type: "pen" }>
  ) {
    shape.points.forEach((point) => {
      const cx = point.x;
      const cy = point.y;
      const radius = 2;
      const dx = x - cx;
      const dy = y - cy;
      const res = dx * dx + dy * dy - radius * radius;
      if (res <= 0) {
        this.eraseShape(shape.shapeId);
        return true;
      }
    });
    return false
  }

  private eraseText(
    x: number,
    y: number,
    shape: Extract<Shape, { type: "text" }>
  ) {
    if (!this.ctx) return;

    const words = shape?.content.split(" ");
    let x_offset = shape.startX;
    let y_offset = shape.startY;
    let line = "";
    const fontSize = 16;
    const lineHeight = fontSize * 1.5; // Assuming 1.5 is the line height multiplier
    let no_of_lines = 1;

    for (let i = 0; i < words.length; i++) {
      line = line + words[i] + " ";
      let metrics = this.ctx.measureText(line);
      if (metrics.width >= 300 && i > 0) {
        y_offset += lineHeight;
        no_of_lines += 1;
        line = "";
      }
    }
    const total_height = no_of_lines * lineHeight;
    // console.log("total_height:", total_height);
    // this.ctx.strokeRect(shape.startX, shape.startY - 10, 300, total_height);
    if (
      x >= shape.startX &&
      x <= shape.startX + 300 &&
      y >= shape.startY - 10 &&
      y <= shape.startY + total_height
    ) {
      this.eraseShape(shape.shapeId)
      return true;
    }
    return false;
  }

  private mouseDownHandler = (e: MouseEvent) => {
    if (this.selectedTool === "pointer") {
      return;
    }
    if (this.selectedTool === "erase") {
      const x = e.clientX;
      const y = e.clientY;
      let current_index = 0;
      for (let shape of this.existingShapes) {
        
        if (shape?.type === "rect") {
          const erased = this.eraseRect(x, y, shape);
          if(erased) return;
        } else if (shape?.type === "line") {
          const erased = this.eraseLine(x, y, shape);
          if(erased) return;
        } else if (shape?.type === "circle") {
          const erased = this.eraseCircle(x, y, shape);
          if(erased) return;
        } else if (shape?.type === "pen") {
          const erased = this.eraseFreeHandDrawing(x, y, shape);
          if(erased) return;
        } else if (shape?.type === "text") {
          const erased = this.eraseText(x, y, shape);
          if(erased) return;
        }
        current_index++;
      }
      return;
    }
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
    this.ctx.lineWidth = 3;
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
    let newShape: ShapeWithoutId = null;
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
    const shapeId = crypto.randomUUID();
    this.existingShapes.push({ ...newShape, shapeId: shapeId } as Shape);
    if (!this.ws) {
      alert("Disconnected.");
      return;
    }
    this.ws.send(
      JSON.stringify({
        type: "chat",
        shapeId: shapeId,
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
      } else if (message.type === "erase") {
        this.existingShapes = this.existingShapes.filter(
          (shape) => shape?.shapeId !== message.shapeId
        );
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
      return { ...shape, shapeId: msg.shapeId };
    });
    return shapes;
  }

  private clearCanvas() {
    if (!this.ctx) return;
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.fillStyle = "rgba(0, 0, 0)";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.strokeStyle = "rgba(255, 255, 255)";
    this.ctx.lineWidth = 3;
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

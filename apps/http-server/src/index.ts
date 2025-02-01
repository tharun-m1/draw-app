import express from "express"
import rootRouter from "./routes"
import cors from "cors"



const app = express()
app.use(cors())
app.use(express.json())

app.use("/api/v1", rootRouter)



app.listen(4000, () => {
    console.log("App running at port: 4000")
})
import express from "express"
import rootRouter from "./routes"



const app = express()
app.use(express.json())

app.use("/api/v1", rootRouter)



app.listen(4000, () => {
    console.log("App running at port: 4000")
})
import express, { json } from "express"
import cors from "cors"

const app = express()
app.use(json())
app.use(cors())

const port = process.env.PORT || 5000
app.listen(port, () => console.log(`Server running on port ${port}`))
import express from "express"

const app = express()
const PORT = 3000

app.use(express.static("public"))

app.listen(PORT, () => {
    console.log("Started webserver on port:", PORT)
})
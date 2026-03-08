const express = require("express")
const path = require("path")
const adminRouter = require("./src/routes/admin")
const apiRouter = require("./src/routes/api")
const staticRouter = require("./src/routes/static")
const errorRoutes = require("./src/controller/404")
const app = express()
const PORT = process.env.PORT || 3000

app.use(express.static(path.join(__dirname, "public")))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))

app.use("/admin", adminRouter)
app.use("/api", apiRouter)
app.use(staticRouter)

app.use(errorRoutes.errorPage)

const startServer = async () => {
  try {
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`)
    })
  } catch (err) {
    console.error("Failed to start server:", err)
    process.exit(1)
  }
}

startServer()

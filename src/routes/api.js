const express = require("express")
const router = express.Router()
const adminController = require("../controller/admin")

router.post("/login", adminController.handleLogin)
router.post("/events", adminController.addEvent)
router.get("/events", adminController.getEvents)
router.get("/events/:id", adminController.getEventById)
router.put("/events/:id", adminController.editEvent)
router.delete("/events/:id", adminController.deleteEvent)

module.exports = router

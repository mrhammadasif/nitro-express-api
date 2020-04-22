import { body } from "express-validator"
import { Router } from "express"
const controller = Router()

// got getting user
controller.get("/", (req, res) => {
  res.send("Le le bhai, tu book le le...")
})

controller.post(
  "/",
  [
    body("name").exists()
  ],
  (req, res) => {
    res.send("De dia na? Pura book? ...")
  }
)
export default controller

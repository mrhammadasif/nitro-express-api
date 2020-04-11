import { Router } from "express"
import UserCtrl from "./controllers/UserCtrl"
import BookCtrl from "./controllers/BookCtrl"
import AdminCtrl from "./controllers/AdminCtrl"

const baseRouter = Router()

// DEFINE YOUR CONTROLLERS HERE
baseRouter.use("/admin", AdminCtrl)
baseRouter.use("/user", UserCtrl)
baseRouter.use("/book", BookCtrl)

export default baseRouter

import { Application, Router } from "express"

export default class BaseRouter {

  private App: Application

  constructor (App: Application) {
    this.App = App
  }

  public initApp = (): Application => {
    const App: Application = this.App
    const MyRouter: Router = Router()

    MyRouter.options("*", (req, res, next) => res.status(200).send())
    MyRouter.use((req, res, next) => {
      res.setHeader("Content-type", "application/json")
      next()
    })

    MyRouter.use("/", new (require("../controllers/api-controller")).Controller()
      .getRouter())

    App.use("/", MyRouter)
    return App
  }
}

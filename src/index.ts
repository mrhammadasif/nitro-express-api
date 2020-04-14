import * as bodyParser from "body-parser"
import * as cors from "cors"
import * as express from "express"
import "express-async-errors"
import * as exphbs from "express-handlebars"
import { parseInt } from "lodash"
import * as methodOverride from "method-override"
import * as mime from "mime"
import * as mongoose from "mongoose"
import * as uniqueValidator from "mongoose-unique-validator"
import * as morgan from "morgan"
import * as path from "path"
const nocache = require("nocache")
import "source-map-support/register"
import ntxErrorHandler from "./core/error-handler"
import BaseRouter from "./router"
require("dotenv").config()

export class Server {

  public app: express.Application

  constructor () {
    this.app = express()
    this.loadConfig()

    this.load3rdPartyMiddlewares()
    this.loadDb()
    this.app.use(morgan("combined"))

    this.loadRoutes(this.app)
    this.initialPublicFolder(this.app)

    // at the end set up ouwer error handler
    this.setUpErrorHandler(this.app)
  }

  loadConfig () {
    // support for .env files
    this.app.set("superSecret", process.env.SECRET)
    this.app.set("views", path.join(__dirname, "../views"))

    this.app.engine(
      "hbs", exphbs({
        defaultLayout: "main",
        layoutsDir: path.join(__dirname, "../views/layouts"),
        extname: ".hbs"
      }) as any
    )
    this.app.set("view engine", "hbs")
    this.app.set("json spaces", 2)
    this.app.set("trust proxy", true)
    this.app.set("trust proxy", "loopback")
    this.app.use(nocache())
  }

  load3rdPartyMiddlewares () {
    // allow for X-HTTP-METHOD-OVERRIDE header
    this.app.use(methodOverride())

    // use body parser so we can get info from POST and/or URL parameters
    this.app.use(bodyParser.urlencoded({ extended: false }))
    this.app.use(
      bodyParser.json({
        limit: "10MB",
        verify (req, res, buf) {
          if (req.url.toLowerCase().includes("webhook")) {
            (req as any).rawBody = buf.toString()
          }
        }
      })
    )

    this.app.use(cors())
    this.app.use(this.setOwnHeader)

    this.app.use((req, res, next) => {
      res.setHeader("Content-type", "application/json")
      next()
    })
  }

  initialPublicFolder (app: express.Application) {
    app.use(
      "/",
      express.static(__dirname + "/../public", {
        setHeaders (res, path) {
          console.info(path)
          res.setHeader("content-type", mime.getType(path))
        }
      })
    )
  }

  setUpErrorHandler (app: express.Application) {
    // in case nothing is resolved, we will show 404 page to the user
    app.use("/", (req, res, next) => {
      res.header("Content-type", "text/html")
      res.status(404).render("404", {
        reqUrl: req.originalUrl
      })
    })

    // otherwise use logger with ourErrorHandler
    app.use(ntxErrorHandler)
  }

  setOwnHeader (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) {
    res.header("Server", "NitroNode")
    res.header("X-Powered-By", "NitroNode")
    res.header("Access-Control-Expose-Headers", "count, page, pages")

    const timeOut = parseInt(process.env.TIMEOUT) || 30000 // 30 sec
    res.setTimeout(timeOut, () => {
      res
        .status(504)
        .send("Timeout -> nothing to show")
    })
    next()
  }

  loadDb () {
    if (!process.env.DB_NAME && !process.env.DB_CONNECTION_STRING) {
      throw "DB Configuration is missing"
    }
    mongoose.plugin(uniqueValidator)
    mongoose.set("useUnifiedTopology", true)
    mongoose.set("useNewUrlParser", true)
    mongoose.set("useFindAndModify", false)
    mongoose.set("useCreateIndex", true)
    mongoose.connect(
      process.env.DB_CONNECTION_STRING,
      {
        dbName: process.env.DB_NAME,
        useNewUrlParser: true,
        autoIndex: true,
        useCreateIndex: true
      },
      (err) => {
        if (err) {
          console.error(err)
          this.gracefulExit()
          // this.loadDb()
        }
        // here we're running loginScripts
        require("./core/bootstrap-db").default()
        console.info("Database Connected. API is LIVE now!")
      }
    )
    // If the Node process ends, close the Mongoose connection
    process.on("SIGINT", this.gracefulExit).on("SIGTERM", this.gracefulExit)
  }

  gracefulExit () {
    mongoose.connection.close(function () {
      console.info(
        "Mongoose default connection is disconnected through app termination"
      )
      process.exit(0)
    })
  }

  loadRoutes (app: express.Application) {
    app.use(BaseRouter)
  }

  startServer () {
    // kicking off: Server
    const portNo = process.env.PORT || 8080
    this.app.listen(portNo, () => {
      console.clear()
      console.info(`Server started at http://localhost:${portNo}`)
      console.info("Connecting with Database...")
    })
  }
}
try {
  const server = new Server()
  server.startServer()
} catch (exception) {
  console.error(exception)
}

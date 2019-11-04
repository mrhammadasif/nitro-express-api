import * as bodyParser from "body-parser"
import * as cookieParser from "cookie-parser"
import * as cors from "cors"
import * as express from "express"
import "express-async-errors"
import * as exphbs from "express-handlebars"
import * as expressSession from "express-session"
import { parseInt } from "lodash"
import * as methodOverride from "method-override"
import * as mime from "mime"
import * as mongoose from "mongoose"
import * as uniqueValidator from "mongoose-unique-validator"
import * as morgan from "morgan"
import * as path from "path"
import "source-map-support/register"
import ntxErrorHandler from "./core/error-handler"
import BaseRouter from "./routes/base"

const MongoDBStore = require("connect-mongodb-session")(expressSession)

export class Server {
  public app: express.Application

  constructor () {
    this.app = express()
    this.loadConfig()

    this.load3rdPartyMiddlewares()
    this.loadDb()

    this.loadRoutes(this.app)
    this.setUpErrorHandler(this.app)
  }

  loadConfig () {
    // support for .env files
    require("dotenv").config()
    this.app.set("superSecret", process.env.SECRET)
    this.app.set("views", path.join(__dirname, "../views"))

    this.app.engine(
      "hbs", exphbs() as any
    )
    this.app.set("view engine", "hbs")
    this.app.set("json spaces", 2)
    this.app.set("trust proxy", true)
    this.app.set("trust proxy", "loopback")
  }

  load3rdPartyMiddlewares () {
    // allow for X-HTTP-METHOD-OVERRIDE header
    this.app.use(methodOverride())
    // express flash setup
    const store = new MongoDBStore({
      uri: process.env.DB_CONNECTION_STRING,
      databaseName: process.env.DB_NAME || "nitrodb",
      collection: "ionSessions"
    })

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
    this.app.use(bodyParser.text())

    this.app.use(cors())
    // requested by stripe
    // this.app.use(bodyParser.raw({type: "*/*"}))
    this.app.use(this.setOwnHeader)
  }

  setUpErrorHandler (app: express.Application) {
    if (process.env.NODE_ENV === "dev") {
      // error Handler
      app.use(morgan("dev"))
    }
    app.use(ntxErrorHandler)
  }

  setOwnHeader (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) {
    res.header("Server", "NitroNode")
    res.header("X-Powered-By", "NitroNode")
    res.setTimeout(parseInt(process.env.TIMEOUT || "20000"), () => {
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
        // autoIndex: process.env.NODE_ENV === 'dev',
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
        console.info("connected to the server")
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
    const baseRouter = new BaseRouter(app)
    app = baseRouter.initApp()

    app.use(
      "/public",
      express.static(__dirname + "/../public", {
        setHeaders (res, path) {
          console.info(path)
          res.setHeader("content-type", mime.getType(path))
        }
      })
    )
    app.use("/", (req, res, next) => {
      res.header("Content-type", "text/html")
      res.status(404).render("404", {
        reqUrl: req.originalUrl
      })
    })
  }

  startServer () {
    // kicking off: Server
    const portNo = process.env.PORT || 8080
    this.app.listen(portNo, () => {
      console.info(`Server started at http://localhost:${portNo}`)
    })
  }
}
try {
  const server = new Server()
  server.startServer()
} catch (exception) {
  console.error(exception)
}

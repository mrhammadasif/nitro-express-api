// @ts-check
const gulp = require("gulp")
const { watch } = require("gulp")
const concat = require("gulp-concat")
const gulpClean = require("gulp-clean")
const nodemon = require("gulp-nodemon")
const ts = require("gulp-typescript")
const tsProject = ts.createProject("tsconfig.json")
const sourcemaps = require("gulp-sourcemaps")

// const pckg = require("./package.json")
const path = require("path")
const fs = require("fs")
const chance = require("chance")()
const pathOfConf = path.join(__dirname, ".env")
const { parsed } = require("dotenv").config()
const flatMap = require("lodash/flatMap")
// utils functions
const serializeEnv = (obj) => flatMap(obj, (v, k) => `${k.toString()}="${v.toString()}"`)
// const replaceEnv = (obj, name, val) => {}

let nodemonInstance = {}

gulp.task("clean", function clean () {
  return gulp
    .src([
      "./public/css",
      "./public/js",
      "./dist"
    ], {
      read: false,
      allowEmpty: true
    })
    .pipe(gulpClean())
})

gulp.task("tsc", function (done) {
  tsProject
    .src()
    .pipe(sourcemaps.init())
    .pipe(tsProject())
    .js
    .pipe(sourcemaps.write())
    .pipe(gulp.dest("./dist"))
    .on("finish", () => {
      //   done()
      // })
      // .on("finish", () => {
      if (nodemonInstance) {
        if (typeof nodemonInstance.emit != "undefined") {
          nodemonInstance.emit("restart", 0)
        }
      }
      done()
    })
  //   console.log(nodemonInstance)
  //   done()

  // })
})

gulp.task("watchTsc", function (){
  return watch([
    "src/**/*.ts",
    "src/*.ts"
  ], gulp.series("tsc"))
})

gulp.task("server", function () {
  nodemonInstance = nodemon({
    script: "dist/index.js",
    ext: "js",
    ignore: ["*"]
  })
})

gulp.task("renew-salt", function (done) {
  parsed.SECRET = `${chance.guid()}#@${chance.hash()}`
  fs.writeFileSync(pathOfConf, serializeEnv(parsed).join("\n"))
  done()
})

gulp.task(
  "dev",
  gulp.series(
    "clean",
    "tsc",
    gulp.parallel("watchTsc", "server")
  )
)

gulp.task(
  "build",
  gulp.series(
    (d) => {
      process.env.NODE_ENV = "production"
      d()
    },
    "clean",
    "tsc",
  )
)

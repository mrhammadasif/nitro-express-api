import validator from "../core/validator"
import * as multer from "multer"
import * as crypto from "crypto"
import * as path from "path"
import { existsSync, mkdirSync, unlinkSync } from "fs"
import * as sharp from "sharp"
import moment = require("moment")

export const fileResizer =  (file) => {
  const isImageFile = path.extname(file.filename).match(/\.(jpg|jpeg|png|gif)$/i)
  const isVideoFile = path.extname(file.filename).match(/\.(mp4|mov)$/i)
  let pathGenerated = `/uploads/${isImageFile ? "images" : isVideoFile ? "videos" : "documents"}/${file.filename}`

  // compress jpeg image here
  if (isImageFile) {
    //removing original file here

    const pathGenerated2 = path.join(__dirname, "/../../public/uploads/") + `/${isImageFile ? "images" : isVideoFile ? "videos" : "documents"}/o-${file.filename}`
    const thumbnail = path.join(__dirname, "/../../public/uploads/") + `/${isImageFile ? "images" : isVideoFile ? "videos" : "documents"}/t-${file.filename}`
    Promise.all([
      sharp(file.path)
        .resize(1920, 1920, {
          withoutEnlargement: true,
          fit: "inside"
        })
        .jpeg({ quality: 50 })
        .toFile(pathGenerated2),
      sharp(file.path)
        .resize(150, 150)
        .jpeg({ quality: 40 })
        .toFile(thumbnail)
    ]).then((e) => {
      unlinkSync(path.join(__dirname, "/../../public/", pathGenerated))
      pathGenerated = pathGenerated2
    }).catch((e) => {
      console.error("unable to process image file")
    })
  }
  return pathGenerated
}

export const upload = (validatorFn = () => validator.imageFilter) => {
  return multer({
    dest: path.join(__dirname, "/../../public/uploads/"),
    limits: {
      fileSize: 25 * 1024 * 1024 // 25mb
    },
    storage: multer.diskStorage({
      destination (req, file, cb) {
        const isImageFile = path.extname(file.originalname).match(/\.(jpg|jpeg|png|gif)$/i)
        const isVideoFile = path.extname(file.originalname).match(/\.(mp4|mov)$/i)
        const folderDestination = path.join(__dirname, `/../../public/uploads/${isImageFile ? "images" : isVideoFile ? "videos" : "documents"}`)
        if (!existsSync(folderDestination)) {
          mkdirSync(folderDestination, { recursive: true })
        }
        cb(null, folderDestination)
      },
      filename (req, file, cb) {
        const customFileName = crypto.randomBytes(32).toString("hex") + "_" + moment().format("YYYYMMDDHHmmSS")
        const fileExtensionSplit = file.originalname.split(".")

        cb(null, customFileName + "." + fileExtensionSplit[fileExtensionSplit.length - 1])
      }
    }),
    fileFilter: validatorFn
  })
}

export function uploadFields (obj, validatorFn) { return upload(validatorFn).fields(obj) }
export function uploadMultiple (fieldName, maxNumberOfAttachments, validatorFn) {
  return upload(validatorFn).array(fieldName, maxNumberOfAttachments)
}
export function uploadSingle (fieldName, validatorFn) { return upload(validatorFn).single(fieldName) }

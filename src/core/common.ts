import * as crypto from "crypto"
import { capitalize, parseInt, replace, startCase } from "lodash"
const chance = require("chance")()

const privateFile = () => {
  const pv = process.env.SECRET
  if (!pv) {
    console.error("You need to Set SECRET variable in your .env file")
  }
  return pv
}

export function capitalizeWords (val): string {
  return startCase(capitalize(val))
}

export function convertEnumToStringArray (Enum: any): string[] {
  return Object.keys(Enum).filter((elem) => !parseInt(elem) && elem !== "0")
}

export function removeSpace (value: string) {
  return replace(value, /\W/gi, "")
}

export function encrypt (obj): string {
  const text = JSON.stringify(obj) || ""
  const cipher = crypto.createCipher("aes-256-ctr", privateFile())
  let crypted = cipher.update(text, "utf8", "hex")
  crypted += cipher.final("hex")
  return crypted
}

export function decrypt (text: string = ""): string {
  const decipher = crypto.createDecipher("aes-256-ctr", privateFile())
  let dec = decipher.update(text, "hex", "utf8")
  dec += decipher.final("utf8")
  try {
    text = JSON.parse(dec)
  } catch (e) {
    console.error(e)
    text = ""
  }
  return text
}

export function shortCode () {
  const a = chance.string({
    length: 8,
    alpha: true,
    numeric: true,
    symbols: false
  })
  return `${a.substring(0, 2)}-${a.substring(2)}`
}
// return the hashed value of given value
export function hashPassword (value: string): string {
  return !!value
    ? crypto
    .createHmac("sha512", privateFile())
    .update(value, "utf8")
    .digest("hex")
    : void 0
}

export function generateToken (value: string = null): string {
  const uniqVal = !value ? new Date().toString() : value
  return crypto
  .createHash("sha256")
  .update(uniqVal.toString(), "utf8")
  .digest("hex")
}

export function randPassword (length: number = 10): string {
  return chance.string({
    length
  })
}

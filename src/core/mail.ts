import * as nodemailer from "nodemailer"
const myApp = require("../../package.json")

const smtpConfig = {
  host: "smtp.gmail.com",
  port: 465,
  // TLS: true,
  tls: {
    // do not fail on invalid certs
    rejectUnauthorized: false
  },
  secure: true, // use SSL
  auth: {
    user: "",
    pass: ""
  }
}

const transport = nodemailer.createTransport({
  sendmail: true,
  path: "/usr/sbin/sendmail"
} as any)

const gmailTransport = nodemailer.createTransport(smtpConfig)

export const sendMail = function (to: string, subject: string, html: string, attachments = []) {
  gmailTransport.sendMail(
    {
      // replyTo: "info@isvmarket.com",
      from: `noreply-${myApp.name}@nitroxis.com`,
      to,
      subject: `${subject}`,
      html,
      attachments
    },
    (err, info) => {
      if (err) {
        console.error(err)
      }
      return info
    }
  )
}

export default sendMail

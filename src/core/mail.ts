import * as nodemailer from "nodemailer"

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
    user: process.env.GMAIL_USER || "",
    pass: process.env.GMAIL_PASS || ""
  }
}

// uncomment this if you want to use sendmail instead of gmail
// const transport = nodemailer.createTransport({
//   sendmail: true,
//   path: "/usr/sbin/sendmail"
// } as any)

const gmailTransport = nodemailer.createTransport(smtpConfig)

export const sendMail = function (to: string, subject: string, html: string, attachments = []) {
  gmailTransport.sendMail(
    {
      from: process.env.ADMIN_EMAIL,
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

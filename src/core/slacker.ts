import axios from "axios"

export default function (p: string) {
  const dataString = {
    text: p
  }

  const headers = {
    "Content-Type": "application/json"
  }

  return axios.post(process.env.SLACK_HOOK, dataString, {
    headers
  })
}

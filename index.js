const { default: makeWASocket, useMultiFileAuthState, fetchLatestBaileysVersion } = require("@whiskeysockets/baileys")
const express = require("express")

const app = express()
app.use(express.json())

let sock, latestQR = ""

async function startSock() {
  const { state, saveCreds } = await useMultiFileAuthState("auth")
  const { version } = await fetchLatestBaileysVersion()

  sock = makeWASocket({
    auth: state,
    version,
    browser: ["VIMA MD", "Chrome", "1.0"]
  })

  sock.ev.on("creds.update", saveCreds)

  sock.ev.on("connection.update", ({ qr, connection }) => {
    if (qr) latestQR = qr
    if (connection === "open") console.log("✅ Connected")
  })
}

startSock()

app.post("/pair", async (req, res) => {
  try {
    const code = await sock.requestPairingCode(req.body.number)
    res.json({ code })
  } catch {
    res.json({ error: "failed" })
  }
})

app.get("/qr", (req, res) => {
  res.json({ qr: latestQR })
})

app.listen(3000, () => console.log("🚀 VIMA MD running"))

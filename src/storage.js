const isNetlify = !!process.env.NETLIFY

async function getCredentials() {
  if (isNetlify) {
    const { getStore } = require("@netlify/blobs")
    const store = getStore("data")
    const data = await store.get("credentials", { type: "json" })
    if (data) return data
    // Default credentials when the blob store has no data yet
    return { username: "admin", password: "29ByEVsZi37px2E-fYgW" }
  }

  const fs = require("fs/promises")
  const path = require("path")
  const dataPath = path.join(__dirname, "data/admin.json")
  try {
    const raw = await fs.readFile(dataPath, "utf-8")
    return JSON.parse(raw)
  } catch (error) {
    console.error("Erro ao ler credenciais:", error)
    return null
  }
}

async function getEvents() {
  if (isNetlify) {
    const { getStore } = require("@netlify/blobs")
    const store = getStore("data")
    const data = await store.get("events", { type: "json" })
    return data || []
  }

  const fs = require("fs/promises")
  const path = require("path")
  const eventsDataPath = path.join(__dirname, "data/events.json")
  try {
    const raw = await fs.readFile(eventsDataPath, { encoding: "utf-8" })
    if (!raw.trim()) return []
    return JSON.parse(raw)
  } catch (error) {
    if (error.code === "ENOENT") {
      await fs.writeFile(eventsDataPath, JSON.stringify([], null, 2))
      return []
    }
    console.error("Error reading events file:", error)
    return []
  }
}

async function setEvents(events) {
  if (isNetlify) {
    const { getStore } = require("@netlify/blobs")
    const store = getStore("data")
    await store.setJSON("events", events)
    return
  }

  const fs = require("fs/promises")
  const path = require("path")
  const eventsDataPath = path.join(__dirname, "data/events.json")
  await fs.writeFile(eventsDataPath, JSON.stringify(events, null, 2))
}

module.exports = { getCredentials, getEvents, setEvents }

import { getStore } from "@netlify/blobs"
import { v4 as uuidv4 } from "uuid"

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" }
  })
}

export default async (request, context) => {
  const url = new URL(request.url)
  const path = url.pathname
  const method = request.method
  const store = getStore("data")

  try {
    // POST /api/login
    if (method === "POST" && path === "/api/login") {
      const { username, password } = await request.json()
      const creds = await store.get("credentials", { type: "json" })
      const stored = creds || { username: "admin", password: "29ByEVsZi37px2E-fYgW" }

      if (username !== stored.username || password !== stored.password) {
        return json({ message: "Credenciais inválidas" }, 401)
      }
      return json({ message: "Login bem-sucedido", redirectUrl: "/admin/dashboard" })
    }

    // GET /api/events
    if (method === "GET" && path === "/api/events") {
      const events = await store.get("events", { type: "json" })
      return json(events || [])
    }

    // POST /api/events
    if (method === "POST" && path === "/api/events") {
      const newEvent = await request.json()
      if (!newEvent?.local || !newEvent?.data || !newEvent?.hora || !newEvent?.nome) {
        return json({ message: "Dados do evento incompletos" }, 400)
      }
      const events = (await store.get("events", { type: "json" })) || []
      newEvent.id = uuidv4()
      events.push(newEvent)
      await store.setJSON("events", events)
      return json({ message: "Evento adicionado com sucesso!", event: newEvent }, 201)
    }

    // Routes with :id parameter — /api/events/:id
    const idMatch = path.match(/^\/api\/events\/(.+)$/)
    if (idMatch) {
      const id = idMatch[1]

      // GET /api/events/:id
      if (method === "GET") {
        const events = (await store.get("events", { type: "json" })) || []
        const evento = events.find(ev => ev.id === id)
        if (!evento) return json({ message: "Evento não encontrado" }, 404)
        return json(evento)
      }

      // PUT /api/events/:id
      if (method === "PUT") {
        const updateEvent = await request.json()
        if (!updateEvent?.local || !updateEvent?.data || !updateEvent?.hora || !updateEvent?.nome) {
          return json({ message: "Dados inválidos para edição" }, 400)
        }
        const events = (await store.get("events", { type: "json" })) || []
        const idx = events.findIndex(ev => ev.id === id)
        if (idx === -1) return json({ message: "Evento não encontrado" }, 404)
        updateEvent.id = id
        events[idx] = updateEvent
        await store.setJSON("events", events)
        return json({ message: "Evento editado com sucesso!", event: updateEvent })
      }

      // DELETE /api/events/:id
      if (method === "DELETE") {
        const events = (await store.get("events", { type: "json" })) || []
        const filtered = events.filter(ev => ev.id !== id)
        if (filtered.length === events.length) {
          return json({ message: "Evento não encontrado para remoção." }, 404)
        }
        await store.setJSON("events", filtered)
        return json({ message: "Evento removido com sucesso!" })
      }
    }

    return json({ message: "Not Found" }, 404)

  } catch (error) {
    console.error("API error:", error)
    return json({ message: "Erro interno do servidor" }, 500)
  }
}

export const config = {
  path: "/api/*"
}

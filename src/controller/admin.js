const path = require("path")
const { v4: uuidv4 } = require("uuid")
const storage = require("../storage")

exports.renderLogin = (req, res) => {
  res.sendFile(path.join(__dirname, "../../public/views/login.html"))
}

exports.handleLogin = async (req, res) => {
  const { username, password } = req.body
  const storedCredentials = await storage.getCredentials()

  if (!storedCredentials) {
    return res
      .status(500)
      .json({ message: "Erro interno ao verificar credenciais." })
  }

  const { username: storedUsername, password: storedPassword } =
    storedCredentials

  const ok = username === storedUsername && password === storedPassword

  if (!ok) {
    return res.status(401).json({ message: "Credenciais inválidas" })
  }

  res
    .status(200)
    .json({ message: "Login bem-sucedido", redirectUrl: "/admin/dashboard" })
}

exports.renderDashboard = (req, res) =>
  res.sendFile(path.join(__dirname, "../../public/views/admin.html"))

exports.addEvent = async (req, res) => {
  const newEvent = req.body
  if (!newEvent || !newEvent.local || !newEvent.data || !newEvent.hora || !newEvent.nome) {
    return res.status(400).json({ message: "Dados do evento incompletos" })
  }

  try {
    const storedEvents = await storage.getEvents()
    newEvent.id = uuidv4()
    storedEvents.push(newEvent)
    await storage.setEvents(storedEvents)

    res.status(201).json({ message: "Evento adicionado com sucesso!", event: newEvent})
  } catch (error) {
    console.error("Error in addEvent handler:", error)
    res.status(500).json({ message: error.message || "Erro o salvar o evento"})
  }
}

exports.getEvents = async (req, res) => {
  try {
    const storedEvents = await storage.getEvents()
    res.status(200).json(storedEvents)
  } catch (error) {
    console.error("Error in getEvents handler:", error)
    res.status(500).json({ message: "Erro ao buscar eventos." })
  }
}

exports.getEventById = async (req, res) => {
  const id = req.params.id
  try {
    const storedEvents = await storage.getEvents()
    const evento = storedEvents.find(ev => ev.id === id)
    if (!evento) return res.status(404).json({ message: "Evento não encontrado" })
    res.status(200).json(evento)
  } catch (error) {
    res.status(500).json({ message: "Erro ao buscar evento" })
  }
}

exports.editEvent = async (req, res) => {
  const id = req.params.id
  const updateEvent = req.body

  if (
    !id ||
    !updateEvent ||
    !updateEvent.local ||
    !updateEvent.data ||
    !updateEvent.hora ||
    !updateEvent.nome
  ) {
    return res.status(400).json({ message: "Dados inválidos para edição"})
  }

  try {
    const storedEvents = await storage.getEvents()
    const idx = storedEvents.findIndex(ev => ev.id === id)

    if (idx === -1) {
      return res.status(404).json({ message: "Evento não encontrado" }) 
    } 

    updateEvent.id = id
    storedEvents[idx] = updateEvent
    await storage.setEvents(storedEvents)
    res.status(200).json({ message: "Evento editado com sucesso!", event: updateEvent })
    
    } catch (error) {
      console.error("Error in editEvent handler:", error)
      res.status(500).json({ message: "Erro ao editar evento" })
  }
}

exports.deleteEvent = async (req, res) => {
  const id = req.params.id
  if (!id) {
    return res.status(400).json({ message: "ID do evento não fornecido." })
  }

  try {
    const storedEvents = await storage.getEvents()
    const initialLength = storedEvents.length

    const filteredEvents = storedEvents.filter(ev => ev.id !== id)

    if (filteredEvents.length === initialLength) {
      return res.status(404).json({ message: "Evento não encontrado para remoção." })
    }

  await storage.setEvents(filteredEvents)

  res.status(200).json({ message: "Evento removido com sucesso!"})

  } catch (error) {
    console.error("Error in deleteEvent handler:", error)
    res.status(500).json({ message: "Erro interno ao remover o evento." })
  }
}
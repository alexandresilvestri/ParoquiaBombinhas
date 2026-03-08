import { parse } from "date-fns"
import flatpickr from "flatpickr"
import "flatpickr/dist/flatpickr.min.css"

let eventos = []

async function fetchAndRenderEvents() {
  try {
    const response = await fetch('/api/events')
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    const fetchedEvents = await response.json()
    eventos = Array.isArray(fetchedEvents) ? fetchedEvents : [];
    renderEventos()

  } catch (error) {
    console.error("Erro ao buscar eventos:", error)
    alert("Não foi possível carregar os eventos existentes")
    eventos = []
    renderEventos()
  }
}

document.getElementById("eventForm").addEventListener("submit", async function (e) {
  e.preventDefault()

  const localInput = document.getElementById("eventLocal")
  const dataInput = document.getElementById("eventDate")
  const horaInput = document.getElementById("eventHour")
  const nomeInput = document.getElementById("eventName")
  const descriptionInput = document.getElementById("eventDescription")

  const eventData = { local: localInput.value,
    data: dataInput.value,
    hora: horaInput.value,
    nome: nomeInput.value,
    description: descriptionInput.value || ""
  }

  try {
    const response = await fetch('/api/events', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',  
      },
      body: JSON.stringify(eventData)
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
    }

    const result = await response.json()
    alert("Evento adicionado com sucesso!")
    
    eventos.push(result.event)
    renderEventos()
    this.reset()

  } catch (error) {
    console.error("Erro ao adicionar evento:", error)
    alert(`Falha ao adicionar evento: ${error.message}`)
  }

})

flatpickr("#eventDate", {
  dateFormat: "d/m/Y",
  minDate: "today",
  enableTime: false,
})

const hourInput = document.getElementById("eventHour")
hourInput.addEventListener('input', (e) => {
  let value = e.target.value.replace(/\D/g, '')
  if (value.length > 2) {
    value = value.slice(0, 2) + 'h' + value.slice(2, 4)
  }

  if (value.length === 5) {
    const parts = value.split('h')
    const hours = parseInt(parts[0], 10)
    const minutes = parseInt(parts[1], 10)
    if (hours > 23 || minutes > 59) {
      value = value.slice(0, -1)
    }
    e.target.value = value.slice(0, 5)
  }
})

function renderEventos() {
  const adminEventList = document.getElementById("adminEventList")

  if (!adminEventList) {
    console.error("Could not find element with ID 'adminEventList")
    return
  }

  adminEventList.innerHTML = ""

  if (!Array.isArray(eventos)) {
    console.error("renderEventos called but 'eventos' is not and array")
    eventos = []
  }

  eventos.sort((a, b) => {
    try {
      const dateA = a.data ? parse(a.data, "dd/MM/yyyy", new Date()) : new Date(0)
      const dateB = b.data ? parse(b.data, "dd/mm/yyyy", new Date()) : new Date(0)
      return dateA - dateB
    } catch (e) {
      console.error("Error parsing date for sorting:", e, "Event A:", a, "Event B:", b)
      return 0
    }
  })

  eventos.forEach((evento) => {
    if (!evento || typeof evento !== 'object') {
      console.warn("Skipping invalid item in eventos array:", evento)
      return
    }

    const li = document.createElement("li")
    li.className =
      "list-group-item d-flex justify-content-between align-items-center gap-list"

    const local = evento.local || 'N/A'
    const data = evento.data || 'N/A'
    const hora = evento.hora || 'N/A'
    const nome = evento.nome || 'N/A'
    const description = evento.description || 'N/A'

    const descriptionHtml = description ? `, <strong>Descrição:</strong> ${description}` : ''

    li.innerHTML = `<span>
    <strong>Local:</strong> ${local},
    <strong>Data:</strong> ${data},
    <strong>Hora:</strong> ${hora},
    <strong>Nome:</strong> ${nome}${descriptionHtml}
    </span>
    <span>
      <button class="btn btn-sm btn-warning m-2" onclick="window.location.href='/views/edit-event.html?id=${evento.id}'">Editar</button>
      <button class="btn btn-sm btn-danger" data-remove="${evento.id}">Remover</button>
    </span>`

    adminEventList.appendChild(li)
  })
}

 async function removerEvento(id) {
  try {
    const response = await fetch(`/api/events/${id}`, {
      method: 'DELETE'
    })

    if (!response.ok) {
      let errorMessage = `HTTP error! status: ${response.status}`
      try {
        const errorData = await response.json()
        errorMessage = errorData.message || errorMessage
      } catch (e) {
        
      }
      throw new Error(errorMessage)
    }

    eventos = eventos.filter(evento => evento.id !== id)

    renderEventos()
    alert('Evento removido com sucesso!')

  } catch (error) {
    console.error('Erro ao remover evento:', error)
    alert(`Falha ao remover evento: ${ error.message }`)
  } 
}

document.addEventListener('DOMContentLoaded', () => {
  const adminEventList = document.getElementById("adminEventList")
  if (adminEventList) {
    adminEventList.addEventListener('click', (event) => {
      if (event.target.matches('button[data-remove]')) {
        const eventId = event.target.getAttribute('data-remove')
        if (confirm('Tem certeza que deseja remover este evento?')) {
          removerEvento(eventId)
        }
      }
    })
  } else {
    console.error("Elemento 'adminEventList' não encontrado para adicionar listener de remoção")
  }

  fetchAndRenderEvents()
})


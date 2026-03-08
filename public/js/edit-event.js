import flatpickr from "flatpickr"
import "flatpickr/dist/flatpickr.min.css"

document.addEventListener("DOMContentLoaded", async () => {
  const params = new URLSearchParams(window.location.search)
  const id = params.get("id")
  if (!id) {
    alert("Evento não encontrado!")
    window.location.href = "/admin/dashboard"
    return
  }

  let evento
  try {
    const res = await fetch(`/api/events/${id}`)
    evento = await res.json()
    if (!evento) throw new Error("Evento não encontrado")
  } catch (err) {
    alert("Erro ao carregar evento")
    window.location.href = "/admin/dashboard"
    return
  }

  document.getElementById("editEventLocal").value = evento.local
  const dateInput = document.getElementById("editEventDate")
  const hourInput = document.getElementById("editEventHour")
  document.getElementById("editEventName").value = evento.nome
  document.getElementById("editEventDescription").value =
    evento.description || ""

  dateInput.value = evento.data
  hourInput.value = evento.hora

  flatpickr(dateInput, {
    dateFormat: "d/m/Y",
    allowInput: true,
  })

  hourInput.addEventListener("input", (e) => {
    let value = e.target.value.replace(/\D/g, "")
    if (value.length > 2) {
      value = value.slice(0, 2) + "h" + value.slice(2, 4)
    }

    if (value.length === 5) {
      const parts = value.split("h")
      const hours = parseInt(parts[0], 10)
      const minutes = parseInt(parts[1], 10)
      if (hours > 23 || minutes > 59) {
        value = value.slice(0, -1)
      }
      e.target.value = value.slice(0, 5)
    }
  })

  document
    .getElementById("eventForm")
    .addEventListener("submit", async function (e) {
      e.preventDefault()
      const updatedEvent = {
        local: document.getElementById("editEventLocal").value,
        data: dateInput.value,
        hora: hourInput.value,
        nome: document.getElementById("editEventName").value,
        description:
          document.getElementById("editEventDescription").value || "",
      }
      try {
        const response = await fetch(`/api/events/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatedEvent),
        })
        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.message || "Erro ao editar evento")
        }
        alert("Evento editado com sucesso!")
        window.location.href = "/admin/dashboard"
      } catch (error) {
        alert(error.message)
      }
    })
})

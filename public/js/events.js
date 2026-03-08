import { parse } from 'date-fns'

async function fetchAndDisplayEvents() {
    const eventList = document.getElementById('eventList')

    eventList.innerHTML = '<li class="list-group-item">Carregando eventos...</li>'

    try {
        const response = await fetch('/api/events')
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`)
        }
        let eventos = await response.json()

        if (!Array.isArray(eventos)) {
            console.error("Received non-array data from API:", eventos)
            eventos = []
        }

        eventos.sort((a, b) => {
            try {
                const dateA = a.data ? parse(a.data, "dd/MM/yyyy", new Date()) : new Date(0)
                const dateB = b.data ? parse(b.data, "dd/MM/yyyy", new Date()) : new Date(0)

                if (isNaN(dateA.getTime())) return 1
                if (isNaN(dateB.getTime())) return -1

                return dateA - dateB
            } catch (e) {
                console.error("Error parsing date for sorting in events.js:", e, a, b)
                return 0
            }
        });

        eventList.innerHTML = ''

        if (eventos.length === 0) {
            eventList.innerHTML = '<li class="list-group-item">Nenhum evento programado no momento.</li>'
            return
        }

        eventos.forEach(evento => {
            const li = document.createElement('li')
            li.className = 'list-group-item'

            const local = evento.local || 'N/A'
            const data = evento.data || 'N/A'
            const hora = evento.hora || 'N/A'
            const nome = evento.nome || 'N/A'
            const description = evento.description || 'Sem descrição adicional.'

            li.innerHTML = `
                <strong>Local: </strong>${local}<br>
                <strong>Data:</strong> ${data}<br>
                <strong>Hora:</strong> ${hora}<br>
                <strong>Evento:</strong> ${nome}<br>
                <strong>Descrição:</strong> ${description}
            `
            eventList.appendChild(li)
        })

    } catch (error) {
        console.error('Erro ao buscar ou processar eventos:', error)
        eventList.innerHTML = '<li class="list-group-item text-danger">Erro ao carregar eventos. Tente novamente mais tarde.</li>'
    }
}

document.addEventListener('DOMContentLoaded', fetchAndDisplayEvents)

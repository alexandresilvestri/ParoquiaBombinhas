document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("loginForm")
  const errorMessage = document.getElementById("error") 

  if (loginForm) {
    loginForm.addEventListener("submit", async (event) => {
      event.preventDefault()
      if (errorMessage) {
        errorMessage.textContent = ""
        errorMessage.classList.add("d-none") 
      }

      const username = document.getElementById("username").value
      const password = document.getElementById("password").value

      try {
        const response = await fetch("/api/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ username, password }),
        })

        const result = await response.json()

        if (response.ok) {
          window.location.href = result.redirectUrl
        } else {
          if (errorMessage) {
            errorMessage.textContent =
              result.message || "Erro desconhecido no login."
            errorMessage.classList.remove("d-none") 
          }
        }
      } catch (error) {
        console.error("Erro ao tentar fazer login:", error)
        if (errorMessage) {
          errorMessage.textContent = "Erro ao conectar com o servidor."
          errorMessage.classList.remove("d-none") 
        }
      }
    })
  }
})

document.getElementById("loginForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    
    const login = document.getElementById("login").value;
    const senha = document.getElementById("senha").value;
    
    try {
        const response = await fetch("http://localhost:8080/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ login, senha }),
        });

        const data = await response.json();
        
        if (response.ok) {
            // Armazena os dados do morador no localStorage
            localStorage.setItem("morador", JSON.stringify(data));
            // Redireciona para a tela principal
            window.location.href = "texas-connect.html";
        } else {
            document.getElementById("message").textContent = data.message || "Login falhou.";
        }
    } catch (error) {
        console.error("Erro:", error);
        document.getElementById("message").textContent = "Erro ao conectar ao servidor.";
    }
});
document.getElementById("cadastroForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    
    const morador = {
        nome: document.getElementById("nome").value,
        apartamento: document.getElementById("apartamento").value,
        bloco: document.getElementById("bloco").value,
        senha: document.getElementById("senha").value,
        contato: document.getElementById("contato").value || null
    };

    try {
        const response = await fetch("https://condominio-cc5u.onrender.com/api/auth/cadastrar", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(morador),
        });

        const data = await response.json();
        
        if (response.ok) {
            document.getElementById("message").textContent = "Cadastro realizado com sucesso!";
            document.getElementById("message").style.color = "green";
            // Limpa o formulário
            document.getElementById("cadastroForm").reset();
            // Redireciona após 2 segundos
            setTimeout(() => {
                window.location.href = "index.html";
            }, 2000);
        } else {
            document.getElementById("message").textContent = data.message || "Erro no cadastro.";
            document.getElementById("message").style.color = "red";
        }
    } catch (error) {
        console.error("Erro:", error);
        document.getElementById("message").textContent = "Erro ao conectar ao servidor.";
        document.getElementById("message").style.color = "red";
    }
});
document.getElementById("cadastroForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    
    const morador = {
        nome: document.getElementById("nome").value,
        apartamento: document.getElementById("apartamento").value,
        bloco: document.getElementById("bloco").value,
        senha: document.getElementById("senha").value,
        contato: document.getElementById("contato").value || "" // Campo opcional
    };

    console.log("Dados sendo enviados:", morador); // Para debug

    try {
        const response = await fetch("http://localhost:8080/api/auth/cadastrar", {
            method: "POST",
            headers: { 
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            body: JSON.stringify(morador)
        });

        const data = await response.json();
        console.log("Resposta do servidor:", data); // Para debug

        if (response.ok) {
            document.getElementById("message").textContent = 
                `Cadastro realizado! Seu login é: ${data.login}`;
            document.getElementById("message").style.color = "green";
        } else {
            document.getElementById("message").textContent = 
                data.message || "Erro ao cadastrar. Verifique os dados.";
            document.getElementById("message").style.color = "red";
        }
    } catch (error) {
        console.error("Erro na requisição:", error); // Log detalhado
        document.getElementById("message").textContent = 
            "Erro ao conectar ao servidor. Verifique o console para detalhes.";
        document.getElementById("message").style.color = "red";
    }
});
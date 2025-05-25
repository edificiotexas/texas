document.addEventListener("DOMContentLoaded", () => {
    // Verifica se o usuário está logado
    const morador = JSON.parse(localStorage.getItem("morador"));
    if (!morador) {
        window.location.href = "index.html";
        return;
    }

    // Carrega os avisos existentes
    carregarAvisos();

    // Formulário de novo aviso
    document.getElementById("formAviso").addEventListener("submit", async (e) => {
        e.preventDefault();
        
        const aviso = {
            titulo: document.getElementById("titulo").value,
            conteudo: document.getElementById("conteudo").value
        };

        try {
            const response = await fetch("http://localhost:8080/api/avisos", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(aviso),
            });

            if (response.ok) {
                alert("Aviso publicado com sucesso!");
                document.getElementById("formAviso").reset();
                carregarAvisos();
            } else {
                alert("Erro ao publicar aviso.");
            }
        } catch (error) {
            console.error("Erro:", error);
            alert("Erro ao conectar ao servidor.");
        }
    });
});

async function carregarAvisos() {
    try {
        const response = await fetch("http://localhost:8080/api/avisos");
        const avisos = await response.json();
        
        const lista = document.getElementById("listaAvisos");
        lista.innerHTML = "";
        
        avisos.forEach(aviso => {
            const dataFormatada = new Date(aviso.data).toLocaleDateString('pt-BR');
            lista.innerHTML += `
                <div class="aviso-card">
                    <h3>${aviso.titulo}</h3>
                    <p>${aviso.conteudo}</p>
                    <small>Publicado em: ${dataFormatada}</small>
                </div>
            `;
        });
    } catch (error) {
        console.error("Erro ao carregar avisos:", error);
    }
}

function carregarAvisos() {
    fetch("http://localhost:8080/api/avisos")
        .then(response => response.json())
        .then(avisos => {
            const lista = document.getElementById("listaAvisos");
            lista.innerHTML = "";
            
            avisos.forEach(aviso => {
                const dataFormatada = new Date(aviso.data).toLocaleDateString('pt-BR');
                lista.innerHTML += `
                    <div class="aviso-card" data-id="${aviso.id}">
                        <h3>${aviso.titulo}</h3>
                        <p>${aviso.conteudo}</p>
                        <small>Publicado em: ${dataFormatada}</small>
                        <div class="acoes-aviso">
                            <button class="btn-editar" onclick="abrirModalEdicao(${aviso.id}, '${aviso.titulo}', '${aviso.conteudo}')">Editar</button>
                            <button class="btn-remover" onclick="removerAviso(${aviso.id})">Remover</button>
                        </div>
                    </div>
                `;
            });
        });
}

function abrirModalEdicao(id, titulo, conteudo) {
    document.getElementById("editarId").value = id;
    document.getElementById("editarTitulo").value = titulo;
    document.getElementById("editarConteudo").value = conteudo;
    document.getElementById("modalEdicao").style.display = "block";
}

function fecharModalEdicao() {
    document.getElementById("modalEdicao").style.display = "none";
}

// Formulário de edição
document.getElementById("formEdicao").addEventListener("submit", function(e) {
    e.preventDefault();
    
    const avisoAtualizado = {
        id: document.getElementById("editarId").value,
        titulo: document.getElementById("editarTitulo").value,
        conteudo: document.getElementById("editarConteudo").value
    };

    fetch(`http://localhost:8080/api/avisos/${avisoAtualizado.id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(avisoAtualizado),
    })
    .then(response => {
        if (response.ok) {
            fecharModalEdicao();
            carregarAvisos();
            alert("Aviso atualizado com sucesso!");
        }
    })
    .catch(error => console.error("Erro:", error));
});

function removerAviso(id) {
    if (confirm("Tem certeza que deseja remover este aviso?")) {
        fetch(`http://localhost:8080/api/avisos/${id}`, {
            method: "DELETE",
        })
        .then(response => {
            if (response.ok) {
                carregarAvisos();
                alert("Aviso removido com sucesso!");
            }
        })
        .catch(error => console.error("Erro:", error));
    }
}

// Fechar modal ao clicar no X
document.querySelector(".close").addEventListener("click", fecharModalEdicao);

// Fechar modal ao clicar fora dele
window.addEventListener("click", function(event) {
    const modal = document.getElementById("modalEdicao");
    if (event.target === modal) {
        fecharModalEdicao();
    }
});
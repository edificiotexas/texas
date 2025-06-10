document.addEventListener('DOMContentLoaded', async () => {
    // Verificar autenticação
    const usuario = JSON.parse(localStorage.getItem('usuario'));
    if (!usuario) {
        window.location.href = 'login.html';
        return;
    }

    // Carregar avisos
    await carregarAvisos();

    // Configurar formulário
    document.getElementById('formAviso').addEventListener('submit', async (e) => {
        e.preventDefault();
        await enviarAviso();
    });
});

async function carregarAvisos() {
    try {
        const response = await fetch('https://condominio-cc5u.onrender.com/api/avisos');
        const avisos = await response.json();
        
        const listaAvisos = document.getElementById('listaAvisos');
        listaAvisos.innerHTML = '';
        
        if (avisos.length === 0) {
            listaAvisos.innerHTML = '<p>Nenhum aviso encontrado.</p>';
            return;
        }
        
        avisos.forEach(aviso => {
            const avisoElement = document.createElement('div');
            avisoElement.className = 'aviso';
            avisoElement.innerHTML = `
                <h3>${aviso.titulo}</h3>
                <p class="data">${formatarData(aviso.data)}</p>
                <p class="autor">Publicado por: ${aviso.autor}</p> <!-- Linha adicionada -->
                <p class="mensagem">${aviso.mensagem}</p>
            `;
            listaAvisos.appendChild(avisoElement);
        });
    } catch (error) {
        console.error('Erro ao carregar avisos:', error);
        document.getElementById('listaAvisos').innerHTML = 
            '<p>Erro ao carregar avisos. Tente novamente mais tarde.</p>';
    }
}

async function enviarAviso() {
    const usuario = JSON.parse(localStorage.getItem('usuario'));
    const titulo = document.getElementById('titulo').value;
    const mensagem = document.getElementById('mensagem').value;
    
    try {
        const response = await fetch('https://condominio-cc5u.onrender.com/api/avisos', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${usuario.token}`
            },
            body: JSON.stringify({
                titulo,
                mensagem,
                autor: usuario.nome
            })
        });
        
        if (response.ok) {
            document.getElementById('formAviso').reset();
            await carregarAvisos();
        } else {
            alert('Erro ao enviar aviso');
        }
    } catch (error) {
        console.error('Erro:', error);
        alert('Erro ao conectar com o servidor');
    }
}

function formatarData(dataString) {
    const data = new Date(dataString);
    const dia = String(data.getDate()).padStart(2, '0');
    const mes = String(data.getMonth() + 1).padStart(2, '0'); // Mês começa em 0
    const ano = data.getFullYear();
    const horas = String(data.getHours()).padStart(2, '0');
    const minutos = String(data.getMinutes()).padStart(2, '0');

    return `${dia}/${mes}/${ano}, ${horas}:${minutos}`;
}
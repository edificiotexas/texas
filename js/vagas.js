// Arquivo: js/vagas.js
document.addEventListener('DOMContentLoaded', async () => {
    // Verificar autenticação
    const usuario = JSON.parse(localStorage.getItem('usuario'));
    if (!usuario) {
        window.location.href = 'login.html';
        return;
    }
    
    // Carregar próximas vagas
    await carregarProximasVagas();
});

async function carregarProximasVagas() {
    try {
        const response = await fetch('https://condominio-cc5u.onrender.com/api/vagas-visitantes/disponibilidade?apartamento=' + 
            encodeURIComponent(usuario.apartamento + usuario.bloco));
        
        const data = await response.json();
        if (response.ok) {
            const resultadoDiv = document.getElementById('resultadoConsulta');
            resultadoDiv.innerHTML = `<p>${data.mensagem}</p>`;
        }
    } catch (error) {
        console.error('Erro ao carregar vagas:', error);
    }
}

async function consultarDisponibilidade() {
    const usuario = JSON.parse(localStorage.getItem('usuario'));
    if (!usuario) {
        window.location.href = 'login.html';
        return;
    }
    
    try {
        const response = await fetch('https://condominio-cc5u.onrender.com/api/vagas-visitantes/disponibilidade?apartamento=' + 
            encodeURIComponent(usuario.apartamento + usuario.bloco));
        
        const data = await response.json();
        const resultadoDiv = document.getElementById('resultadoConsulta');
        
        if (response.ok) {
            if (data.semana) {
                resultadoDiv.innerHTML = `
                    <div class="semana-vaga">
                        <h4>Semana ${data.semana}</h4>
                        <p>${data.mensagem}</p>
                        <p>Data de início: ${await obterDataInicioSemana(data.semana)}</p>
                    </div>
                `;
            } else {
                resultadoDiv.innerHTML = `<p>${data.mensagem}</p>`;
            }
        } else {
            resultadoDiv.innerHTML = '<p>Erro ao consultar disponibilidade.</p>';
        }
    } catch (error) {
        console.error('Erro:', error);
        document.getElementById('resultadoConsulta').innerHTML = 
            '<p>Erro ao conectar com o servidor.</p>';
    }
}

async function obterDataInicioSemana(semana) {
    try {
        const response = await fetch(`https://condominio-cc5u.onrender.com/api/vagas-visitantes/semana/${semana}`);
        const data = await response.json();
        return data.dataInicio;
    } catch (error) {
        console.error('Erro ao obter data:', error);
        return "Data não disponível";
    }
}

function sair() {
    localStorage.removeItem('usuario');
    window.location.href = 'login.html';
}
document.addEventListener('DOMContentLoaded', async () => {
    // Verificar autenticação do usuário
    const usuario = JSON.parse(localStorage.getItem('usuario'));
    if (!usuario) {
        window.location.href = 'login.html';
        return;
    }

    // Carregar os eventos fixos da agenda
    await carregarEventosFixos();
});

/**
 * Busca os eventos fixos da API e os exibe na página.
 */
async function carregarEventosFixos() {
    const containerEventos = document.getElementById('listaEventos');
    
    try {
        // Faz a requisição para a nova API de eventos fixos
        const response = await fetch('https://condominio-cc5u.onrender.com/api/eventos-fixos');
        const eventos = await response.json();
        
        // Limpa o container
        containerEventos.innerHTML = '';
        
        if (eventos.length === 0) {
            containerEventos.innerHTML = '<p>Nenhum evento fixo cadastrado na agenda.</p>';
            return;
        }
        
        // Cria um card para cada evento e o adiciona ao container
        eventos.forEach(evento => {
            const eventoElement = document.createElement('div');
            eventoElement.className = 'evento-card';
            
            eventoElement.innerHTML = `
                <h3>${evento.titulo}</h3>
                <p><strong>Dias:</strong> ${evento.dias}</p>
                <p><strong>Horário:</strong> ${evento.horario}</p>
                <p><strong>Categoria:</strong> <span class="categoria">${evento.categoria}</span></p>
            `;
            
            containerEventos.appendChild(eventoElement);
        });

    } catch (error) {
        console.error('Erro ao carregar a agenda de eventos:', error);
        containerEventos.innerHTML = 
            '<p>Erro ao carregar a agenda. Tente novamente mais tarde.</p>';
    }
}
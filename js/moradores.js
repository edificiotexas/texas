document.addEventListener('DOMContentLoaded', async () => {
    // Verificar autenticação
    const usuario = JSON.parse(localStorage.getItem('usuario'));
    if (!usuario) {
        window.location.href = 'login.html';
        return;
    }

    // Carregar moradores
    await carregarMoradores();

    // Configurar filtros
    document.getElementById('busca').addEventListener('input', filtrarMoradores);
    document.getElementById('bloco').addEventListener('change', filtrarMoradores);
});

async function carregarMoradores() {
    try {
        const usuario = JSON.parse(localStorage.getItem('usuario'));
        const response = await fetch('https://condominio-cc5u.onrender.com/api/moradores', {
            headers: {
                'Authorization': `Bearer ${usuario.token}`
            }
        });
        
        const moradores = await response.json();
        localStorage.setItem('moradores', JSON.stringify(moradores));
        exibirMoradores(moradores);
    } catch (error) {
        console.error('Erro ao carregar moradores:', error);
        document.getElementById('listaMoradores').innerHTML = 
            '<p>Erro ao carregar moradores. Tente novamente mais tarde.</p>';
    }
}

function exibirMoradores(moradores) {
    const listaMoradores = document.getElementById('listaMoradores');
    
    if (moradores.length === 0) {
        listaMoradores.innerHTML = '<p>Nenhum morador encontrado.</p>';
        return;
    }
    
    listaMoradores.innerHTML = '';
    
    moradores.forEach(morador => {
        const moradorElement = document.createElement('div');
        moradorElement.className = 'morador';
        moradorElement.innerHTML = `
            <p><strong>${morador.nome}</strong></p>
            <p>Apartamento: ${morador.apartamento}${morador.bloco ? ' - Bloco ' + morador.bloco : ''}</p>
            ${morador.contato ? `<p>Contato: ${morador.contato}</p>` : ''}
            <hr>
        `;
        listaMoradores.appendChild(moradorElement);
    });
}

function filtrarMoradores() {
    const termoBusca = document.getElementById('busca').value.toLowerCase();
    const blocoSelecionado = document.getElementById('bloco').value;
    const moradores = JSON.parse(localStorage.getItem('moradores')) || [];
    
    const moradoresFiltrados = moradores.filter(morador => {
        const nomeMatch = morador.nome.toLowerCase().includes(termoBusca);
        const aptoMatch = morador.apartamento.toLowerCase().includes(termoBusca);
        const blocoMatch = !blocoSelecionado || morador.bloco === blocoSelecionado;
        
        return (nomeMatch || aptoMatch) && blocoMatch;
    });
    
    exibirMoradores(moradoresFiltrados);
}
document.addEventListener('DOMContentLoaded', () => {
    // Proteger a página: verificar se o usuário é admin
    // (Esta é uma verificação simples, a segurança real deve estar no backend)
    const usuario = JSON.parse(localStorage.getItem('usuario'));
    if (!usuario || !usuario.isAdmin) { // Supondo que o objeto de usuário tenha uma flag 'isAdmin'
        // alert('Acesso negado. Você precisa ser administrador.');
        // window.location.href = 'index.html';
        // return;
    }

    const form = document.getElementById('formEvento');
    const formTitulo = document.getElementById('formTitulo');
    const eventoIdInput = document.getElementById('eventoId');
    const btnCancelar = document.getElementById('btnCancelar');

    // Carregar a lista de eventos ao iniciar
    carregarEventos();

    // Listener para o formulário
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        await salvarEvento();
    });

    // Listener para o botão de cancelar edição
    btnCancelar.addEventListener('click', limparFormulario);
});

const API_URL = 'https://condominio-cc5u.onrender.com/api/eventos-fixos';
const usuario = JSON.parse(localStorage.getItem('usuario'));
const TOKEN = usuario ? `Bearer ${usuario.token}` : '';

// CARREGA E EXIBE A LISTA DE EVENTOS
async function carregarEventos() {
    const listaContainer = document.getElementById('listaEventosAdmin');
    try {
        const response = await fetch(API_URL);
        const eventos = await response.json();
        
        listaContainer.innerHTML = '';
        if (eventos.length === 0) {
            listaContainer.innerHTML = '<p>Nenhum evento cadastrado.</p>';
            return;
        }

        eventos.forEach(evento => {
            const item = document.createElement('div');
            item.className = 'item';
            item.innerHTML = `
                <div class="item-info">
                    <strong>${evento.titulo}</strong>
                    <p>${evento.dias} - ${evento.horario} (${evento.categoria})</p>
                </div>
                <div class="item-acoes">
                    <button class="btn-edit" onclick="prepararEdicao(${evento.id}, '${evento.titulo}', '${evento.dias}', '${evento.horario}', '${evento.categoria}')">Editar</button>
                    <button class="btn-delete" onclick="excluirEvento(${evento.id})">Excluir</button>
                </div>
            `;
            listaContainer.appendChild(item);
        });
    } catch (error) {
        console.error('Erro ao carregar eventos:', error);
        listaContainer.innerHTML = '<p>Falha ao carregar eventos.</p>';
    }
}

// SALVA (CRIA OU ATUALIZA) UM EVENTO
async function salvarEvento() {
    const id = document.getElementById('eventoId').value;
    const evento = {
        titulo: document.getElementById('titulo').value,
        dias: document.getElementById('dias').value,
        horario: document.getElementById('horario').value,
        categoria: document.getElementById('categoria').value,
    };

    const isUpdate = !!id;
    const url = isUpdate ? `${API_URL}/${id}` : API_URL;
    const method = isUpdate ? 'PUT' : 'POST';

    try {
        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': TOKEN // Essencial para a segurança no backend
            },
            body: JSON.stringify(evento)
        });

        if (response.ok) {
            alert(`Evento ${isUpdate ? 'atualizado' : 'criado'} com sucesso!`);
            limparFormulario();
            await carregarEventos();
        } else {
            throw new Error('Falha ao salvar o evento.');
        }
    } catch (error) {
        console.error('Erro ao salvar evento:', error);
        alert('Ocorreu um erro. Tente novamente.');
    }
}

// PREPARA O FORMULÁRIO PARA EDIÇÃO
function prepararEdicao(id, titulo, dias, horario, categoria) {
    document.getElementById('formTitulo').textContent = 'Editar Evento';
    document.getElementById('eventoId').value = id;
    document.getElementById('titulo').value = titulo;
    document.getElementById('dias').value = dias;
    document.getElementById('horario').value = horario;
    document.getElementById('categoria').value = categoria;
    document.getElementById('btnCancelar').style.display = 'inline-block';
    window.scrollTo(0, 0); // Rola a página para o topo para focar no formulário
}

// EXCLUI UM EVENTO
async function excluirEvento(id) {
    if (!confirm('Tem certeza que deseja excluir este evento? A ação não pode ser desfeita.')) {
        return;
    }

    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': TOKEN }
        });

        if (response.ok) {
            alert('Evento excluído com sucesso!');
            await carregarEventos();
        } else {
            throw new Error('Falha ao excluir o evento.');
        }
    } catch (error) {
        console.error('Erro ao excluir evento:', error);
        alert('Ocorreu um erro ao excluir. Tente novamente.');
    }
}

// LIMPA O FORMULÁRIO E O RECONFIGURA PARA "ADICIONAR"
function limparFormulario() {
    document.getElementById('formTitulo').textContent = 'Adicionar Novo Evento';
    document.getElementById('formEvento').reset();
    document.getElementById('eventoId').value = '';
    document.getElementById('btnCancelar').style.display = 'none';
}
document.addEventListener('DOMContentLoaded', async () => {
    // Verificar autenticação
    const usuario = JSON.parse(localStorage.getItem('usuario'));
    if (!usuario) {
        window.location.href = 'login.html';
        return;
    }

    // Configurar data mínima (hoje)
    const hoje = new Date().toISOString().split('T')[0];
    document.getElementById('dataReserva').min = hoje;

    // Carregar reservas do usuário
    await carregarMinhasReservas(usuario.id);

    // Configurar eventos
    document.getElementById('btnBuscarVagas').addEventListener('click', buscarVagasDisponiveis);
    document.getElementById('formDadosVisitante').addEventListener('submit', async (e) => {
        e.preventDefault();
        await enviarReserva(usuario);
    });
});

async function buscarVagasDisponiveis() {
    const data = document.getElementById('dataReserva').value;
    if (!data) {
        alert('Por favor, selecione uma data');
        return;
    }

    try {
        const usuario = JSON.parse(localStorage.getItem('usuario'));
        const response = await fetch(`https://seu-backend/api/vagas-visitantes/disponiveis?data=${data}`, {
            headers: {
                'Authorization': `Bearer ${usuario.token}`
            }
        });
        
        if (!response.ok) {
            throw new Error('Erro ao buscar vagas');
        }
        
        const vagas = await response.json();
        const container = document.getElementById('tabelaVagas');
        
        if (vagas.length === 0) {
            container.innerHTML = `
                <div class="alert alert-info">
                    Não há vagas disponíveis para a data selecionada.
                </div>
            `;
            return;
        }

        let html = `
            <table>
                <thead>
                    <tr>
                        <th>Horário</th>
                        <th>Vagas Disponíveis</th>
                        <th>Ação</th>
                    </tr>
                </thead>
                <tbody>
        `;

        vagas.forEach(vaga => {
            const horaInicio = vaga.horaInicio.substring(0, 5);
            const horaFim = vaga.horaFim.substring(0, 5);
            
            html += `
                <tr>
                    <td>${horaInicio} - ${horaFim}</td>
                    <td>${vaga.vagasDisponiveis}</td>
                    <td>
                        <button class="btn-reservar" 
                                onclick="prepararReserva('${vaga.id}', '${data}', '${horaInicio}-${horaFim}')">
                            Reservar
                        </button>
                    </td>
                </tr>
            `;
        });

        html += `</tbody></table>`;
        container.innerHTML = html;
    } catch (error) {
        console.error('Erro ao buscar vagas:', error);
        document.getElementById('tabelaVagas').innerHTML = `
            <div class="alert alert-error">
                Erro ao carregar vagas. Tente novamente mais tarde.
            </div>
        `;
    }
}

function prepararReserva(vagaId, data, horario) {
    document.getElementById('vagaId').value = vagaId;
    document.getElementById('infoData').textContent = `Data: ${formatarData(data)}`;
    document.getElementById('infoHorario').textContent = `Horário: ${horario}`;
    
    document.getElementById('tabelaVagas').style.display = 'none';
    document.getElementById('formReserva').style.display = 'block';
    document.getElementById('nomeVisitante').focus();
}

function cancelarReserva() {
    document.getElementById('formDadosVisitante').reset();
    document.getElementById('formReserva').style.display = 'none';
    document.getElementById('tabelaVagas').style.display = 'block';
}

async function enviarReserva(usuario) {
    const vagaId = document.getElementById('vagaId').value;
    const nomeVisitante = document.getElementById('nomeVisitante').value.trim();
    const documentoVisitante = document.getElementById('documentoVisitante').value.trim();

    if (!nomeVisitante || !documentoVisitante) {
        alert('Por favor, preencha todos os campos');
        return;
    }

    try {
        const response = await fetch('https://seu-backend/api/reservas-visitantes', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${usuario.token}`
            },
            body: JSON.stringify({
                vaga: { id: vagaId },
                morador: { id: usuario.id },
                nomeVisitante,
                documentoVisitante
            })
        });

        if (response.ok) {
            alert('Reserva realizada com sucesso!');
            cancelarReserva();
            await carregarMinhasReservas(usuario.id);
            await buscarVagasDisponiveis();
        } else {
            const error = await response.json();
            alert(`Erro: ${error.message || 'Não foi possível completar a reserva'}`);
        }
    } catch (error) {
        console.error('Erro:', error);
        alert('Erro ao conectar com o servidor');
    }
}

async function carregarMinhasReservas(moradorId) {
    try {
        const usuario = JSON.parse(localStorage.getItem('usuario'));
        const response = await fetch(`https://seu-backend/api/reservas-visitantes/morador/${moradorId}`, {
            headers: {
                'Authorization': `Bearer ${usuario.token}`
            }
        });
        
        if (!response.ok) {
            throw new Error('Erro ao carregar reservas');
        }
        
        const reservas = await response.json();
        const container = document.querySelector('.reservas-list');
        
        if (reservas.length === 0) {
            container.innerHTML = '<p>Você não possui reservas ativas.</p>';
            return;
        }
        
        let html = `
            <table class="reservas-table">
                <thead>
                    <tr>
                        <th>Data</th>
                        <th>Horário</th>
                        <th>Visitante</th>
                        <th>Documento</th>
                        <th>Status</th>
                        <th>Ação</th>
                    </tr>
                </thead>
                <tbody>
        `;
        
        reservas.forEach(reserva => {
            const data = new Date(reserva.vaga.data);
            const dataFormatada = data.toLocaleDateString('pt-BR');
            const statusClass = reserva.status.toLowerCase();
            
            html += `
                <tr>
                    <td>${dataFormatada}</td>
                    <td>${reserva.vaga.horaInicio.substring(0, 5)} - ${reserva.vaga.horaFim.substring(0, 5)}</td>
                    <td>${reserva.nomeVisitante}</td>
                    <td>${reserva.documentoVisitante}</td>
                    <td class="status ${statusClass}">${reserva.status}</td>
                    <td>
                        ${reserva.status === 'CONFIRMADA' ? 
                            `<button class="btn-cancelar-reserva" onclick="cancelarMinhaReserva('${reserva.id}')">
                                Cancelar
                            </button>` : ''}
                    </td>
                </tr>
            `;
        });
        
        html += `</tbody></table>`;
        container.innerHTML = html;
    } catch (error) {
        console.error('Erro ao carregar reservas:', error);
        document.querySelector('.reservas-list').innerHTML = `
            <div class="alert alert-error">
                Erro ao carregar reservas. Tente novamente mais tarde.
            </div>
        `;
    }
}

async function cancelarMinhaReserva(reservaId) {
    if (!confirm('Tem certeza que deseja cancelar esta reserva?')) return;
    
    try {
        const usuario = JSON.parse(localStorage.getItem('usuario'));
        const response = await fetch(`https://seu-backend/api/reservas-visitantes/${reservaId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${usuario.token}`
            }
        });
        
        if (response.ok) {
            alert('Reserva cancelada com sucesso!');
            await carregarMinhasReservas(usuario.id);
            await buscarVagasDisponiveis();
        } else {
            alert('Erro ao cancelar reserva');
        }
    } catch (error) {
        console.error('Erro:', error);
        alert('Erro ao conectar com o servidor');
    }
}

function formatarData(dataString) {
    const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
    return new Date(dataString).toLocaleDateString('pt-BR', options);
}
document.addEventListener('DOMContentLoaded', async () => {
    // Verificar autenticação
    const usuario = JSON.parse(localStorage.getItem('usuario'));
    if (!usuario) {
        window.location.href = 'login.html';
        return;
    }

    // Carregar reservas do usuário
    await carregarMinhasReservas(usuario.id);

    // Configurar eventos
    document.getElementById('btnBuscar').addEventListener('click', buscarVagasDisponiveis);
    document.getElementById('formDadosVisitante').addEventListener('submit', async (e) => {
        e.preventDefault();
        await enviarReserva(usuario);
    });
});

async function buscarVagasDisponiveis() {
    const data = document.getElementById('dataAgenda').value;
    if (!data) {
        alert('Selecione uma data');
        return;
    }

    try {
        const response = await fetch(`https://seu-backend/api/vagas-visitantes/disponiveis?data=${data}`);
        const vagas = await response.json();
        
        if (vagas.length === 0) {
            document.getElementById('tabelaVagas').innerHTML = `
                <p>Não há vagas disponíveis para a data selecionada.</p>
                <p>Entre em contato com a administração para mais informações.</p>
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
                        <button onclick="prepararReserva('${vaga.id}', '${data}', '${horaInicio}-${horaFim}')">
                            Reservar
                        </button>
                    </td>
                </tr>
            `;
        });

        html += `</tbody></table>`;
        document.getElementById('tabelaVagas').innerHTML = html;
    } catch (error) {
        console.error('Erro ao buscar vagas:', error);
        document.getElementById('tabelaVagas').innerHTML = `
            <p class="error">Erro ao carregar vagas. Tente novamente.</p>
        `;
    }
}

function prepararReserva(vagaId, data, horario) {
    document.getElementById('vagaId').value = vagaId;
    document.getElementById('infoData').textContent = `Data: ${formatarData(data)}`;
    document.getElementById('infoHorario').textContent = `Horário: ${horario}`;
    
    document.getElementById('tabelaVagas').style.display = 'none';
    document.getElementById('formReserva').style.display = 'block';
}

function cancelarReserva() {
    document.getElementById('formDadosVisitante').reset();
    document.getElementById('formReserva').style.display = 'none';
    document.getElementById('tabelaVagas').style.display = 'block';
}

async function enviarReserva(usuario) {
    const vagaId = document.getElementById('vagaId').value;
    const nomeVisitante = document.getElementById('nomeVisitante').value;
    const documentoVisitante = document.getElementById('documentoVisitante').value;

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
            document.getElementById('formDadosVisitante').reset();
            document.getElementById('formReserva').style.display = 'none';
            document.getElementById('tabelaVagas').style.display = 'block';
            await carregarMinhasReservas(usuario.id);
            await buscarVagasDisponiveis();
        } else {
            const error = await response.json();
            alert(`Erro: ${error.message || 'Erro ao fazer reserva'}`);
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
        
        const reservas = await response.json();
        const container = document.getElementById('minhasReservas');
        container.innerHTML = '<h3>Minhas Reservas</h3>';
        
        if (reservas.length === 0) {
            container.innerHTML += '<p>Nenhuma reserva encontrada.</p>';
            return;
        }
        
        let html = `
            <table>
                <thead>
                    <tr>
                        <th>Data</th>
                        <th>Horário</th>
                        <th>Visitante</th>
                        <th>Status</th>
                        <th>Ação</th>
                    </tr>
                </thead>
                <tbody>
        `;
        
        reservas.forEach(reserva => {
            const data = new Date(reserva.vaga.data);
            const dataFormatada = data.toLocaleDateString('pt-BR');
            
            html += `
                <tr>
                    <td>${dataFormatada}</td>
                    <td>${reserva.vaga.horaInicio.substring(0, 5)} - ${reserva.vaga.horaFim.substring(0, 5)}</td>
                    <td>${reserva.nomeVisitante}</td>
                    <td class="status-${reserva.status.toLowerCase()}">${reserva.status}</td>
                    <td>
                        ${reserva.status === 'CONFIRMADA' ? 
                            `<button onclick="cancelarMinhaReserva('${reserva.id}')">Cancelar</button>` : ''}
                    </td>
                </tr>
            `;
        });
        
        html += `</tbody></table>`;
        container.innerHTML += html;
    } catch (error) {
        console.error('Erro ao carregar reservas:', error);
        document.getElementById('minhasReservas').innerHTML = 
            '<p>Erro ao carregar reservas. Tente novamente mais tarde.</p>';
    }
}

async function cancelarMinhaReserva(reservaId) {
    if (!confirm('Deseja realmente cancelar esta reserva?')) return;
    
    try {
        const usuario = JSON.parse(localStorage.getItem('usuario'));
        const response = await fetch(`https://seu-backend/api/reservas-visitantes/${reservaId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${usuario.token}`
            }
        });
        
        if (response.ok) {
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
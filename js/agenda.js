document.addEventListener('DOMContentLoaded', async () => {
    // Verificar autenticação
    const usuario = JSON.parse(localStorage.getItem('usuario'));
    if (!usuario) {
        window.location.href = 'login.html';
        return;
    }

    // Carregar reservas
    await carregarReservas();

    // Configurar formulário
    document.getElementById('formReserva').addEventListener('submit', async (e) => {
        e.preventDefault();
        await enviarReserva();
    });
});

async function carregarReservas() {
    try {
        const usuario = JSON.parse(localStorage.getItem('usuario'));
        const response = await fetch('https://seu-backend.onrender.com/api/reservas', {
            headers: {
                'Authorization': `Bearer ${usuario.token}`
            }
        });
        
        const reservas = await response.json();
        const minhasReservas = document.getElementById('minhasReservas');
        minhasReservas.innerHTML = '<h3>Minhas Reservas</h3>';
        
        if (reservas.length === 0) {
            minhasReservas.innerHTML += '<p>Nenhuma reserva encontrada.</p>';
            return;
        }
        
        reservas.forEach(reserva => {
            const reservaElement = document.createElement('div');
            reservaElement.className = 'reserva';
            reservaElement.innerHTML = `
                <p><strong>${formatarEspaco(reserva.espaco)}</strong></p>
                <p>Data: ${formatarData(reserva.data)}</p>
                <p>Horário: ${reserva.horario}</p>
                <p>Status: <span class="status">${reserva.status}</span></p>
                ${reserva.status === 'pendente' ? 
                    `<button onclick="cancelarReserva('${reserva.id}')">Cancelar</button>` : ''}
                <hr>
            `;
            minhasReservas.appendChild(reservaElement);
        });
    } catch (error) {
        console.error('Erro ao carregar reservas:', error);
        document.getElementById('minhasReservas').innerHTML = 
            '<p>Erro ao carregar reservas. Tente novamente mais tarde.</p>';
    }
}

async function enviarReserva() {
    const usuario = JSON.parse(localStorage.getItem('usuario'));
    const espaco = document.getElementById('espaco').value;
    const data = document.getElementById('data').value;
    const horario = document.getElementById('horario').value;
    
    try {
        const response = await fetch('https://condominio-cc5u.onrender.com/api/reservas', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${usuario.token}`
            },
            body: JSON.stringify({
                espaco,
                data,
                horario,
                moradorId: usuario.id
            })
        });
        
        if (response.ok) {
            document.getElementById('formReserva').reset();
            await carregarReservas();
            alert('Reserva solicitada com sucesso!');
        } else {
            alert('Erro ao fazer reserva');
        }
    } catch (error) {
        console.error('Erro:', error);
        alert('Erro ao conectar com o servidor');
    }
}

async function cancelarReserva(reservaId) {
    if (!confirm('Deseja realmente cancelar esta reserva?')) return;
    
    try {
        const usuario = JSON.parse(localStorage.getItem('usuario'));
        const response = await fetch(`https://condominio-cc5u.onrender.com/api/reservas/${reservaId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${usuario.token}`
            }
        });
        
        if (response.ok) {
            await carregarReservas();
        } else {
            alert('Erro ao cancelar reserva');
        }
    } catch (error) {
        console.error('Erro:', error);
        alert('Erro ao conectar com o servidor');
    }
}

function formatarEspaco(espaco) {
    const espacos = {
        salao: 'Salão de Festas',
        churrasqueira: 'Churrasqueira',
        piscina: 'Piscina'
    };
    return espacos[espaco] || espaco;
}

function formatarData(dataString) {
    const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
    return new Date(dataString).toLocaleDateString('pt-BR', options);
}
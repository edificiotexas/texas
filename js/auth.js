// Alternar entre login e registro
function mostrarRegistro() {
    document.getElementById('loginForm').classList.add('hidden');
    document.getElementById('registroForm').classList.remove('hidden');
}

function mostrarLogin() {
    document.getElementById('registroForm').classList.add('hidden');
    document.getElementById('loginForm').classList.remove('hidden');
}

// Função de login
async function fazerLogin() {
    const login = document.getElementById('login').value;
    const senha = document.getElementById('senha').value;
    
    try {
        const response = await fetch('https://condominio-cc5u.onrender.com/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ login, senha })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            localStorage.setItem('usuario', JSON.stringify(data));
            window.location.href = 'index.html';
        } else {
            alert(data.message || 'Erro no login');
        }
    } catch (error) {
        alert('Erro ao conectar com o servidor');
        console.error(error);
    }
}

// Função de registro
async function fazerRegistro() {
    const usuario = {
        nome: document.getElementById('regNome').value,
        apartamento: document.getElementById('regApto').value,
        bloco: document.getElementById('regBloco').value,
        senha: document.getElementById('regSenha').value
    };
    
    try {
        const response = await fetch('https://condominio-cc5u.onrender.com/api/auth/cadastrar', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(usuario)
        });
        
        const data = await response.json();
        
        if (response.ok) {
            alert('Registro realizado com sucesso!');
            mostrarLogin();
        } else {
            alert(data.message || 'Erro no registro');
        }
    } catch (error) {
        alert('Erro ao conectar com o servidor');
        console.error(error);
    }
}
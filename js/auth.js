document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('loginForm').classList.add('active');
    document.getElementById('registroForm').classList.remove('active');
});

// Alternar entre login e registro
function mostrarRegistro() {
    document.getElementById('loginForm').classList.remove('active');
    document.getElementById('registroForm').classList.add('active');
}

function mostrarLogin() {
    document.getElementById('registroForm').classList.remove('active');
    document.getElementById('loginForm').classList.add('active');
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

// Verificar se o apartamento/bloco já está cadastrado
async function verificarLoginExistente(apartamento, bloco) {
    const login = apartamento + bloco;
    
    try {
        const response = await fetch('https://condominio-cc5u.onrender.com/api/auth/verificar-login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ login })
        });
        
        return await response.json();
    } catch (error) {
        console.error('Erro ao verificar login:', error);
        return { existe: false };
    }
}

function verificarLoginEmTempoReal() {
    const apartamento = document.getElementById('regApto').value;
    const bloco = document.getElementById('regBloco').value;
    const errorElement = document.getElementById('aptoError');
    
    if (apartamento && bloco) {
        verificarLoginExistente(apartamento, bloco)
            .then(verificacao => {
                if (verificacao.existe) {
                    errorElement.textContent = 'Este apartamento/bloco já está cadastrado!';
                    errorElement.style.display = 'block';
                } else {
                    errorElement.style.display = 'none';
                }
            });
    } else {
        errorElement.style.display = 'none';
    }
}

// Função de registro
// Modificada a função de registro para verificar se o login já existe antes de cadastradar.
async function fazerRegistro() {
    const apartamento = document.getElementById('regApto').value;
    const bloco = document.getElementById('regBloco').value;
    
    // Verificar se o login já existe
    const verificacao = await verificarLoginExistente(apartamento, bloco);
    
    if (verificacao.existe) {
        alert('Já existe um morador cadastrado com este apartamento/bloco!');
        return;
    }

    const usuario = {
        nome: document.getElementById('regNome').value,
        apartamento: apartamento,
        bloco: bloco,
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

document.getElementById('regApto').addEventListener('blur', verificarLoginEmTempoReal);
document.getElementById('regBloco').addEventListener('blur', verificarLoginEmTempoReal);

async function verificarLoginEmTempoReal() {
    const apartamento = document.getElementById('regApto').value;
    const bloco = document.getElementById('regBloco').value;
    
    if (apartamento && bloco) {
        const verificacao = await verificarLoginExistente(apartamento, bloco);
        if (verificacao.existe) {
            alert('Atenção: Este apartamento/bloco já está cadastrado!');
        }
    }
}
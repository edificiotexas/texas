document.addEventListener('DOMContentLoaded', function() {
    // Inicializa mostrando o formulário de login
    mostrarLogin();
    
    // Configura os event listeners para verificação em tempo real
    document.getElementById('regApto').addEventListener('blur', verificarLoginEmTempoReal);
    document.getElementById('regBloco').addEventListener('blur', verificarLoginEmTempoReal);
});

// Alternar entre login e registro usando sistema de abas
function mostrarRegistro() {
    // Atualiza botões das abas
    document.querySelectorAll('.tab-button').forEach(button => {
        button.classList.remove('active');
    });
    document.querySelector('.tab-button:nth-child(2)').classList.add('active');
    
    // Atualiza conteúdo das abas
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    document.getElementById('registroForm').classList.add('active');
}

function mostrarLogin() {
    // Atualiza botões das abas
    document.querySelectorAll('.tab-button').forEach(button => {
        button.classList.remove('active');
    });
    document.querySelector('.tab-button:nth-child(1)').classList.add('active');
    
    // Atualiza conteúdo das abas
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    document.getElementById('loginForm').classList.add('active');
}

// Função de login
async function fazerLogin() {
    const login = document.getElementById('login').value;
    const senha = document.getElementById('senha').value;
    
    // Validação básica
    if (!login || !senha) {
        alert('Por favor, preencha todos os campos');
        return;
    }
    
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
            alert(data.message || 'Erro no login. Verifique suas credenciais.');
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

// Verificação em tempo real durante o registro
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
async function fazerRegistro() {
    const apartamento = document.getElementById('regApto').value;
    const bloco = document.getElementById('regBloco').value;
    const nome = document.getElementById('regNome').value;
    const senha = document.getElementById('regSenha').value;
    
    // Validação básica
    if (!nome || !apartamento || !bloco || !senha) {
        alert('Por favor, preencha todos os campos');
        return;
    }
    
    if (senha.length < 6) {
        alert('A senha deve ter pelo menos 6 caracteres');
        return;
    }
    
    // Verificar se o login já existe
    const verificacao = await verificarLoginExistente(apartamento, bloco);
    
    if (verificacao.existe) {
        alert('Já existe um morador cadastrado com este apartamento/bloco!');
        return;
    }

    const usuario = {
        nome: nome,
        apartamento: apartamento,
        bloco: bloco,
        senha: senha
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
            mostrarLogin(); // Volta para a aba de login após registro
        } else {
            alert(data.message || 'Erro no registro');
        }
    } catch (error) {
        alert('Erro ao conectar com o servidor');
        console.error(error);
    }
}
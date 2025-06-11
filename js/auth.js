document.addEventListener('DOMContentLoaded', function() {
    // Verifica se estamos na página de login/registro
    if (document.getElementById('loginForm')) {
        mostrarLogin();
        
        // Configura os event listeners apenas se os elementos existirem
        const regApto = document.getElementById('regApto');
        const regBloco = document.getElementById('regBloco');
        if (regApto && regBloco) {
            regApto.addEventListener('blur', verificarLoginEmTempoReal);
            regBloco.addEventListener('blur', verificarLoginEmTempoReal);
        }
    }
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

// Verificação em tempo real durante o registro
function verificarLoginEmTempoReal() {
    const apartamento = document.getElementById('regApto').value.trim();
    const bloco = document.getElementById('regBloco').value;
    const errorElement = document.getElementById('aptoError');
    
    if (apartamento && bloco) {
        verificarLoginExistente(apartamento, bloco)
            .then(verificacao => {
                if (verificacao.existe) {
                    errorElement.textContent = '⚠️ Já existe um morador cadastrado com este apartamento e bloco!';
                    errorElement.style.display = 'block';
                    errorElement.style.color = '#d9534f';
                } else {
                    errorElement.textContent = '✓ Disponível';
                    errorElement.style.display = 'block';
                    errorElement.style.color = '#5cb85c';
                }
            })
            .catch(error => {
                errorElement.style.display = 'none';
            });
    } else {
        errorElement.style.display = 'none';
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
    
    // Mostrar loading
    const btnRegistrar = document.querySelector('#registroForm button');
    btnRegistrar.disabled = true;
    btnRegistrar.textContent = 'Registrando...';
    
    try {
        // Verificar se o login já existe
        const verificacao = await verificarLoginExistente(apartamento, bloco);
        
        if (verificacao.existe) {
            alert('Já existe um morador cadastrado com este apartamento e bloco. Por favor, verifique os dados ou entre em contato com o síndico.');
            return;
        }

        const usuario = {
            nome: nome,
            apartamento: apartamento,
            bloco: bloco,
            senha: senha
        };
        
        const response = await fetch('https://condominio-cc5u.onrender.com/api/auth/cadastrar', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(usuario)
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Erro no registro');
        }
        
        alert('Registro realizado com sucesso! Seu login é: ' + apartamento + bloco);
        mostrarLogin(); // Volta para a aba de login após registro
    } catch (error) {
        if (error.message.includes('Já existe um morador')) {
            alert('Erro: ' + error.message);
        } else {
            alert('Erro ao cadastrar: ' + error.message);
        }
        console.error(error);
    } finally {
        // Restaurar botão
        btnRegistrar.disabled = false;
        btnRegistrar.textContent = 'Registrar';
    }
}
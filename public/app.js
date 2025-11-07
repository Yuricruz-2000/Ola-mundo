document.addEventListener("DOMContentLoaded", () => {
    // Seletores dos elementos
    const formCadastro = document.getElementById("form-cadastro");
    const formLogin = document.getElementById("form-login");
    const linkLogin = document.getElementById("link-login");
    const linkCadastro = document.getElementById("link-cadastro");
    const btnCadastrar = document.getElementById("btn-cadastrar");
    const btnLogar = document.getElementById("btn-logar");
    const mensagem = document.getElementById("mensagem");

    // Funções para alternar formulários
    linkLogin.addEventListener("click", (e) => {
        e.preventDefault();
        formCadastro.style.display = "none";
        formLogin.style.display = "block";
        mensagem.textContent = "";
    });

    linkCadastro.addEventListener("click", (e) => {
        e.preventDefault();
        formCadastro.style.display = "block";
        formLogin.style.display = "none";
        mensagem.textContent = "";
    });

    // --- CADASTRO ---
    btnCadastrar.addEventListener("click", async () => {
        const email = document.getElementById("cadastro-email").value;
        const senha = document.getElementById("cadastro-senha").value;

        if (!email || !senha) {
            mensagem.textContent = "Por favor, preencha todos os campos.";
            return;
        }

        try {
            // Esta é a chamada para o nosso Back-End!
            const response = await fetch('/api/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, senha }),
            });

            const data = await response.json();

            if (response.ok) {
                mensagem.textContent = data.message;
                // Limpa os campos e muda para o login
                document.getElementById("cadastro-email").value = "";
                document.getElementById("cadastro-senha").value = "";
                linkLogin.click(); // Simula clique no link de login
            } else {
                mensagem.textContent = data.message;
            }
        } catch (error) {
            mensagem.textContent = "Erro ao conectar com o servidor.";
        }
    });

    // --- LOGIN ---
    btnLogar.addEventListener("click", async () => {
        const email = document.getElementById("login-email").value;
        const senha = document.getElementById("login-senha").value;

        if (!email || !senha) {
            mensagem.textContent = "Por favor, preencha todos os campos.";
            return;
        }

        try {
            // Chamada para o Back-End
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, senha }),
            });

            const data = await response.json();

            if (response.ok) {
                // Login bem-sucedido!
                // Em um app real, você receberia um "token" e o salvaria.
                mensagem.textContent = `Bem-vindo, ${data.email}! Login bem-sucedido.`;
                mensagem.style.color = "green";
                // Aqui você redirecionaria para a página principal
                // window.location.href = "/dashboard.html";
            } else {
                mensagem.textContent = data.message;
                mensagem.style.color = "red";
            }
        } catch (error) {
            mensagem.textContent = "Erro ao conectar com o servidor.";
            mensagem.style.color = "red";
        }
    });
});
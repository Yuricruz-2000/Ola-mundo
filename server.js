const express = require('express');
const cors = require('cors');
const path = require('path');
const sqlite3 = require('sqlite3').verbose(); // Novo: Importar o sqlite3

const app = express();
const PORT = 3000;

// Novo: Conectar ao banco de dados SQLite
// O arquivo 'database.db' será criado na sua pasta se não existir
const db = new sqlite3.Database('./database.db', (err) => {
    if (err) {
        console.error(err.message);
    }
    console.log('Conectado ao banco de dados SQLite.');
});

// Novo: Criar a tabela de usuários (só executa se a tabela não existir)
db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS usuarios (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE,
        senha TEXT
    )`, (err) => {
        if (err) {
            console.error("Erro ao criar tabela: ", err.message);
        }
    });
});

// === O "Banco de Dados" Falso foi REMOVIDO ===
// const usuarios = []; (Não precisamos mais disso)
// ============================================

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// --- ROTAS DA API ---

// Rota de Cadastro (POST) - Agora com SQL
app.post('/api/register', (req, res) => {
    const { email, senha } = req.body;

    // ATENÇÃO: Em um app real, NUNCA armazene senhas em texto puro.
    // Você deve usar 'bcrypt' para criar um "hash" da senha.
    
    // Novo: Usar SQL para INSERIR o usuário
    // Usamos '?' para evitar "SQL Injection"
    const sql = "INSERT INTO usuarios (email, senha) VALUES (?, ?)";

    db.run(sql, [email, senha], function(err) {
        if (err) {
            // 'err.message.includes('UNIQUE')' é o jeito de checar se o email já existe
            if (err.message.includes('UNIQUE constraint failed')) {
                return res.status(400).json({ message: 'Email já cadastrado.' });
            }
            console.error(err.message);
            return res.status(500).json({ message: 'Erro ao cadastrar usuário.' });
        }
        
        // 'this.lastID' retorna o ID do usuário que acabou de ser inserido
        console.log(`Novo usuário inserido com ID: ${this.lastID}`);
        res.status(201).json({ message: 'Usuário cadastrado com sucesso!' });
    });
});

// Rota de Login (POST) - Agora com SQL
app.post('/api/login', (req, res) => {
    const { email, senha } = req.body;

    // Novo: Usar SQL para SELECIONAR (buscar) o usuário
    const sql = "SELECT * FROM usuarios WHERE email = ?";

    db.get(sql, [email], (err, row) => {
        if (err) {
            return res.status(500).json({ message: 'Erro no servidor.' });
        }

        // Se 'row' não existir, o email não foi encontrado
        if (!row) {
            return res.status(404).json({ message: 'Usuário não encontrado.' });
        }

        // ATENÇÃO: Em um app real, você compararia o hash da senha
        if (row.senha !== senha) {
            return res.status(401).json({ message: 'Senha incorreta.' });
        }

        // Login bem-sucedido
        res.status(200).json({ message: 'Login bem-sucedido!', email: row.email });
    });
});

// Rota principal (para servir o index.html)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Inicia o servidor
app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});
// Importando os módulos necessários
const express = require('express');
const fs = require('fs'); // Importe o módulo fs para operações de leitura de arquivos
const { Login } = require('./cognito');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();

// Criando uma instância do express
const app = express();
const port = 3000;

const path = require('path');

// Configurando o middleware body-parser para interpretar o corpo das requisições
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static('public'));

// Conectando ao banco de dados SQLite
const db = new sqlite3.Database('./database.db', (err) => {
    if (err) {
        console.error('Erro ao conectar ao banco de dados', err.message);
    } else {
        console.log('Conectado ao banco de dados SQLite');
    }
});

// Criando a tabela 'produtos' (se ainda não existir)
db.run(`CREATE TABLE IF NOT EXISTS produtos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    dataini TEXT,
    datafin TEXT,
    nome TEXT NOT NULL,
    carro TEXT,
    horaini TEXT,
    horafin TEXT,
    kmini TEXT,
    kmfin TEXT,
    kmpercorrido TEXT,
    destino TEXT,
    observacao TEXT
)`);


// Rota POST para login de usuarios com cognito AWS
app.post('/login', (req, res) => {
    const {user, psw} = req.body;

    Login(function(data){
       
      if(data) {
        // res.sendFile(path.join(__dirname , 'public', '/index1.html')); 
        
        console.log(data.name);
        console.log(data.group);

        // Leitura do arquivo index.html
        let html = path.join(__dirname, 'public', 'index1.html');

        // Lê o conteúdo do arquivo index.html
        let content = fs.readFileSync(html, 'utf8');

        content = content.replace(
            /{{\s*usuario\s*}}/,
            data.name
        );
        content = content.replace(
            /{{\s*empresa\s*}}/,
            data.group
        );

        if(data.group !== 'undefined'){
            // Envie a página HTML modificada para o cliente
            res.send(content);
        }
        else res.sendFile(path.join(__dirname , 'public', '/usuarioBloqueado.html'));       

      }
      else res.sendFile(path.join(__dirname , 'public', '/erroLogin.html'));

    }, user, psw); 
})

// Rota para listar todos os produtos
app.get('/produtos', (req, res) => {
    db.all('SELECT * FROM produtos ORDER BY id DESC', (err, rows) => {
        if (err) {
            console.error('Erro ao buscar produtos', err.message);
            res.status(500).send('Erro ao buscar produtos');
        } else {
            // Envia os dados como um array, mesmo que vazio
            res.send(Array.isArray(rows) ? rows : []);
        }
    });
});


// Rota para buscar um produto por ID
app.get('/produto/:id', (req, res) => {
    const id = req.params.id;
    db.get('SELECT * FROM produtos WHERE id = ?', [id], (err, row) => {
        if (err) {
            console.error('Erro ao buscar produto por ID', err.message);
            res.status(500).send(`Erro ao buscar produto com ID ${id}`);
        } else {
            if (row) {
                // Envia os dados como um array contendo apenas o objeto encontrado
                res.send(row);
            } else {
                res.status(404).send(`Produto com ID ${id} não encontrado`);
            }
        }
    });
});


// Constrói a URL da requisição com os parâmetros campo e valor
// produtos/buscar?campo=nome&valor=amanda
// Rota para buscar produtos por um campo específico
app.get('/produtos/buscar', (req, res) => {
    const { campo, valor } = req.query;

    if (!campo || !valor) {
        return res.status(400).send('É necessário fornecer "campo" e "valor" na query da requisição.');
    }

    // Verificações para evitar injeção de SQL maliciosa
    const camposPermitidos = ['id', 'nome', 'carro', 'dataini']; // Adicione outros campos conforme necessário
    if (!camposPermitidos.includes(campo)) {
        return res.status(400).send('Campo de busca não permitido.');
    }

    const sql = `SELECT * FROM produtos WHERE ${campo} LIKE ? ORDER BY id DESC`;
    db.all(sql, [`%${valor}%`], (err, rows) => {
        if (err) {
            console.error(`Erro ao buscar produtos por ${campo}`, err.message);
            return res.status(500).send(`Erro ao buscar produtos por ${campo}`);
        }

        // Envia os dados como um array, mesmo que vazio
        res.send(Array.isArray(rows) ? rows : []);
    });
});


// Rota para criar um novo produto
app.post('/produtos', (req, res) => {
    const { dataini, datafin, nome, carro, horaini, horafin, kmini, kmfin, kmpercorrido, destino, observacao } = req.body;
    db.run('INSERT INTO produtos (dataini, datafin, nome, carro, horaini, horafin, kmini, kmfin, kmpercorrido, destino, observacao) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [dataini, datafin, nome, carro, horaini, horafin, kmini, kmfin, kmpercorrido, destino, observacao ], function(err) {
        if (err) {
            console.error('Erro ao criar produto', err.message);
            res.status(500).send('Erro ao criar produto');
        } else {
            res.send(`Produto criado com ID: ${this.lastID}`);
        }
    });
});

// Rota para atualizar um produto por ID
app.put('/produtos/:id', (req, res) => {
    const id = req.params.id;
    const { dataini, datafin, nome, carro, horaini, horafin, kmini, kmfin, kmpercorrido, destino, observacao } = req.body;
    db.run('UPDATE produtos SET dataini = ?, datafin = ?, nome = ?, carro = ?, horaini = ?, horafin = ?, kmini = ?, kmfin = ?, kmpercorrido = ?, destino = ?, observacao = ? WHERE id = ?', [dataini, datafin, nome, carro, horaini, horafin, kmini, kmfin, kmpercorrido, destino, observacao, id], function(err) {
        if (err) {
            console.error('Erro ao atualizar produto', err.message);
            res.status(500).send(`Erro ao atualizar produto com ID ${id}`);
        } else {
            res.send(`Produto atualizado com ID: ${id}`);
        }
    });
});

// Rota para deletar um produto por ID
app.delete('/produtos/:id', (req, res) => {
    const id = req.params.id;
    db.run('DELETE FROM produtos WHERE id = ?', id, function(err) {
        if (err) {
            console.error('Erro ao deletar produto', err.message);
            res.status(500).send(`Erro ao deletar produto com ID ${id}`);
        } else {
            res.send(`Produto deletado com ID: ${id}`);
        }
    });
});

// Pagina Web
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname + '/public/login.html'));
});

// Iniciando o servidor
app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});

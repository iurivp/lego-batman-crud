const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');

const app = express();
const PORT = 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'bat-secret';

app.use(
  cors({
    origin: 'http://localhost:3000',
    credentials: true,
  })
);
app.use(express.json());

const dbPath = path.join(__dirname, 'lego-batman.db');
const db = new sqlite3.Database(dbPath);

const seedCharacters = [
  {
    name: 'Batman',
    description:
      'Vigilante de Gotham em versão Lego, com Batsuit preto, capa, orelhas pontudas e cinto de utilidades amarelo.',
    status: 'ativo',
  },
  {
    name: 'Robin',
    description:
      'Parceiro impulsivo porém leal do Batman, uniforme vermelho e verde, capa amarela e muita vontade de ajudar.',
    status: 'inativo',
  },
  {
    name: 'Batgirl',
    description:
      'Heroína determinada, com traje roxo e amarelo, batarang nas mãos e muita agilidade para patrulhar os telhados.',
    status: 'ativo',
  },
  {
    name: 'Coringa',
    description:
      'Principal vilão do Batman em versão Lego, cabelo verde, terno roxo e sorriso sinistro cheio de truques.',
    status: 'inativo',
  },
  {
    name: 'Arlequina',
    description:
      'Ajudante caótica do Coringa, com roupas vermelhas e pretas, marreta gigante e muita disposição para confusão.',
    status: 'ativo',
  },
  {
    name: 'Alfred Pennyworth',
    description:
      'Mordomo leal de Bruce Wayne, sempre pronto para servir chá, fazer reparos no Batsuit e dar conselhos sarcásticos.',
    status: 'ativo',
  },
  {
    name: 'Comissário Gordon',
    description:
      'Chefe da polícia de Gotham, bigode clássico, sobretudo e o Bat-sinal pronto para chamar o Cavaleiro das Trevas.',
    status: 'inativo',
  },
  {
    name: 'Mulher-Gato',
    description:
      'Ladra elegante, com máscara felina, chicote e um relacionamento complicado com o Batman.',
    status: 'ativo',
  },
  {
    name: 'Pinguim',
    description:
      'Vilão excêntrico com cartola, monóculo, guarda-chuva tecnológico e esquemas criminosos em Gotham.',
    status: 'inativo',
  },
  {
    name: 'Charada',
    description:
      'Gênio do crime obcecado por enigmas, terno verde com pontos de interrogação e armadilhas cheias de puzzles.',
    status: 'inativo',
  },
  {
    name: 'Duas-Caras',
    description:
      'Ex-promotor marcado pelo ácido, metade herói, metade vilão, decide tudo na moeda em sua versão Lego.',
    status: 'ativo',
  },
  {
    name: 'Hera Venenosa',
    description:
      'Vilã ecológica com controle sobre plantas, cabelos vermelhos e traje verde repleto de folhas.',
    status: 'inativo',
  },
  {
    name: 'Espantalho',
    description:
      'Vilão que usa toxinas do medo, chapéu de palha, máscara assustadora e frascos de gás alucinógeno.',
    status: 'ativo',
  },
  {
    name: 'Bane',
    description:
      'Brutamontes super-forte que usa veneno para ampliar a força, com máscara preta e tubos conectados ao corpo.',
    status: 'ativo',
  },
  {
    name: 'Mr. Freeze',
    description:
      'Vilão gelado, capacete transparente e arma de gelo, capaz de congelar qualquer rua de Gotham.',
    status: 'inativo',
  },
  {
    name: 'Capuz Vermelho',
    description:
      'Vigilante sombrio com capacete vermelho, jaqueta de couro e métodos bem menos delicados que os do Batman.',
    status: 'ativo',
  },
  {
    name: 'Asa Noturna',
    description:
      'Identidade heroica de Dick Grayson, com traje azul e preto, bastões de combate e muita acrobacia.',
    status: 'ativo',
  },
  {
    name: 'Ra’s al Ghul',
    description:
      'Líder da Liga das Sombras, estrategista imortal que acredita estar “salvando” o mundo destruindo Gotham.',
    status: 'inativo',
  },
  {
    name: 'Talia al Ghul',
    description:
      'Filha de Ra’s al Ghul, habilidosa em combate e com laços complexos com Bruce Wayne.',
    status: 'ativo',
  },
  {
    name: 'Policial de Gotham',
    description:
      'Oficial comum da polícia de Gotham em Lego, muitas vezes sobrecarregado até o Bat-sinal ser aceso.',
    status: 'inativo',
  },
];

db.serialize(() => {
  db.run(
    `CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL
    )`
  );

  db.run(
    `CREATE TABLE IF NOT EXISTS characters (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT NOT NULL,
      status TEXT NOT NULL CHECK (status IN ('ativo', 'inativo'))
    )`
  );

  const defaultEmail = 'batman@lego.com';
  const defaultPassword = 'batcaverna';

  db.get(
    'SELECT id FROM users WHERE email = ?',
    [defaultEmail],
    (err, row) => {
      if (err) {
        console.error('Erro ao checar usuário padrão:', err);
        return;
      }
      if (!row) {
        const hash = bcrypt.hashSync(defaultPassword, 10);
        db.run(
          'INSERT INTO users (email, password_hash) VALUES (?, ?)',
          [defaultEmail, hash],
          (err2) => {
            if (err2) {
              console.error('Erro ao criar usuário padrão:', err2);
            } else {
              console.log(
                `Usuário padrão criado: ${defaultEmail} / ${defaultPassword}`
              );
            }
          }
        );
      }
    }
  );

  db.get('SELECT COUNT(*) AS count FROM characters', (err, row) => {
    if (err) {
      console.error('Erro ao contar personagens:', err);
      return;
    }
    if (row.count === 0) {
      const stmt = db.prepare(
        'INSERT INTO characters (name, description, status) VALUES (?, ?, ?)'
      );
      seedCharacters.forEach((c) => {
        stmt.run(c.name, c.description, c.status);
      });
      stmt.finalize();
    }
  });
});

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token =
    authHeader && authHeader.startsWith('Bearer ')
      ? authHeader.split(' ')[1]
      : null;

  if (!token) {
    return res.status(401).json({ message: 'Token não enviado.' });
  }

  jwt.verify(token, JWT_SECRET, (err, payload) => {
    if (err) {
      return res
        .status(401)
        .json({ message: 'Token inválido ou expirado.' });
    }
    req.user = payload;
    next();
  });
}

app.post('/api/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res
      .status(400)
      .json({ message: 'Email e senha são obrigatórios.' });
  }

  db.get('SELECT * FROM users WHERE email = ?', [email], (err, user) => {
    if (err) {
      console.error('Erro ao buscar usuário:', err);
      return res.status(500).json({ message: 'Erro interno no servidor.' });
    }
    if (!user) {
      return res.status(401).json({ message: 'Credenciais inválidas.' });
    }

    const isValid = bcrypt.compareSync(password, user.password_hash);
    if (!isValid) {
      return res.status(401).json({ message: 'Credenciais inválidas.' });
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '2h' }
    );

    return res.json({ token });
  });
});

app.post('/api/register', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res
      .status(400)
      .json({ message: 'Email e senha são obrigatórios.' });
  }

  db.get('SELECT id FROM users WHERE email = ?', [email], (err, row) => {
    if (err) {
      console.error('Erro ao verificar usuário existente:', err);
      return res.status(500).json({ message: 'Erro interno no servidor.' });
    }
    if (row) {
      return res.status(409).json({ message: 'Email já cadastrado.' });
    }

    const hash = bcrypt.hashSync(password, 10);
    db.run(
      'INSERT INTO users (email, password_hash) VALUES (?, ?)',
      [email, hash],
      function (errInsert) {
        if (errInsert) {
          console.error('Erro ao criar usuário:', errInsert);
          if (errInsert.code === 'SQLITE_CONSTRAINT') {
            return res
              .status(409)
              .json({ message: 'Email já cadastrado.' });
          }
          return res
            .status(500)
            .json({ message: 'Erro interno no servidor.' });
        }

        const token = jwt.sign(
          { userId: this.lastID, email },
          JWT_SECRET,
          { expiresIn: '2h' }
        );

        return res.status(201).json({ token });
      }
    );
  });
});

app.get('/api/characters', authenticateToken, (req, res) => {
  const status = req.query.status;
  let sql = 'SELECT * FROM characters';
  const params = [];

  if (status === 'ativo' || status === 'inativo') {
    sql += ' WHERE status = ?';
    params.push(status);
  }

  db.all(sql, params, (err, rows) => {
    if (err) {
      console.error('Erro ao listar personagens:', err);
      return res.status(500).json({ message: 'Erro interno no servidor.' });
    }
    return res.json(rows);
  });
});

app.get('/api/characters/:id', authenticateToken, (req, res) => {
  const id = req.params.id;
  db.get('SELECT * FROM characters WHERE id = ?', [id], (err, row) => {
    if (err) {
      console.error('Erro ao buscar personagem:', err);
      return res.status(500).json({ message: 'Erro interno no servidor.' });
    }
    if (!row) {
      return res.status(404).json({ message: 'Personagem não encontrado.' });
    }
    return res.json(row);
  });
});

app.post('/api/characters', authenticateToken, (req, res) => {
  const { name, description, status } = req.body;

  if (!name || !description || !status) {
    return res.status(400).json({
      message: 'Nome, descrição e status são obrigatórios.',
    });
  }
  if (status !== 'ativo' && status !== 'inativo') {
    return res
      .status(400)
      .json({ message: "Status deve ser 'ativo' ou 'inativo'." });
  }

  db.run(
    'INSERT INTO characters (name, description, status) VALUES (?, ?, ?)',
    [name, description, status],
    function (err) {
      if (err) {
        console.error('Erro ao criar personagem:', err);
        return res
          .status(500)
          .json({ message: 'Erro interno no servidor.' });
      }
      return res.status(201).json({
        id: this.lastID,
        name,
        description,
        status,
      });
    }
  );
});

app.put('/api/characters/:id', authenticateToken, (req, res) => {
  const id = req.params.id;
  const { name, description, status } = req.body;

  if (!name || !description || !status) {
    return res.status(400).json({
      message: 'Nome, descrição e status são obrigatórios.',
    });
  }
  if (status !== 'ativo' && status !== 'inativo') {
    return res
      .status(400)
      .json({ message: "Status deve ser 'ativo' ou 'inativo'." });
  }

  db.run(
    'UPDATE characters SET name = ?, description = ?, status = ? WHERE id = ?',
    [name, description, status, id],
    function (err) {
      if (err) {
        console.error('Erro ao atualizar personagem:', err);
        return res
          .status(500)
          .json({ message: 'Erro interno no servidor.' });
      }
      if (this.changes === 0) {
        return res.status(404).json({ message: 'Personagem não encontrado.' });
      }
      return res.json({
        id: Number(id),
        name,
        description,
        status,
      });
    }
  );
});

app.delete('/api/characters/:id', authenticateToken, (req, res) => {
  const id = req.params.id;

  db.run('DELETE FROM characters WHERE id = ?', [id], function (err) {
    if (err) {
      console.error('Erro ao remover personagem:', err);
      return res
        .status(500)
        .json({ message: 'Erro interno no servidor.' });
    }
    if (this.changes === 0) {
      return res.status(404).json({ message: 'Personagem não encontrado.' });
    }
    return res.status(204).send();
  });
});

app.listen(PORT, () => {
  console.log(`Backend Lego Batman rodando em http://localhost:${PORT}`);
});

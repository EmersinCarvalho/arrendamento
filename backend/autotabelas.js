const db = require("./config/db");

async function criarTabelas() {
  const tabelas = [
    {
      nome: "utilizadores",
      sql: `
        CREATE TABLE IF NOT EXISTS utilizadores (
          id          INT AUTO_INCREMENT PRIMARY KEY,
          nome        VARCHAR(150)  NOT NULL,
          email       VARCHAR(255)  NOT NULL UNIQUE,
          password    VARCHAR(255)  NULL,
          google_id   VARCHAR(255)  NULL UNIQUE,
          foto_url    VARCHAR(500)  NULL,
          perfil      ENUM('inquilino', 'senhorio') NOT NULL DEFAULT 'inquilino',
          ativo       TINYINT(1)    NOT NULL DEFAULT 1,
          criado_em   TIMESTAMP     DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
      `,
    },
    {
      nome: "imoveis",
      sql: `
        CREATE TABLE IF NOT EXISTS imoveis (
          id              INT AUTO_INCREMENT PRIMARY KEY,
          utilizador_id   INT           NULL,
          titulo          VARCHAR(255)  NOT NULL,
          cidade          VARCHAR(100)  NOT NULL,
          tipologia       VARCHAR(10)   NOT NULL,
          preco           DECIMAL(10,2) NOT NULL,
          descricao       TEXT,
          foto            VARCHAR(500),
          disponivel      TINYINT(1)    NOT NULL DEFAULT 1,
          criado_em       TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (utilizador_id) REFERENCES utilizadores(id) ON DELETE SET NULL
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
      `,
    },
    {
      nome: "favoritos",
      sql: `
        CREATE TABLE IF NOT EXISTS favoritos (
          id              INT AUTO_INCREMENT PRIMARY KEY,
          utilizador_id   INT NOT NULL,
          imovel_id       INT NOT NULL,
          criado_em       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          UNIQUE KEY uq_favorito (utilizador_id, imovel_id),
          FOREIGN KEY (utilizador_id) REFERENCES utilizadores(id) ON DELETE CASCADE,
          FOREIGN KEY (imovel_id)     REFERENCES imoveis(id)      ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
      `,
    },
    {
      nome: "contactos",
      sql: `
        CREATE TABLE IF NOT EXISTS contactos (
          id              INT AUTO_INCREMENT PRIMARY KEY,
          imovel_id       INT          NOT NULL,
          nome            VARCHAR(150) NOT NULL,
          email           VARCHAR(255) NOT NULL,
          mensagem        TEXT         NOT NULL,
          lido            TINYINT(1)   NOT NULL DEFAULT 0,
          criado_em       TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (imovel_id) REFERENCES imoveis(id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
      `,
    },
  ];

  console.log("🔧 A verificar/criar tabelas...");

  for (const tabela of tabelas) {
    try {
      await db.execute(tabela.sql);
      console.log(`   ✅ Tabela '${tabela.nome}' OK`);
    } catch (err) {
      console.error(`   ❌ Erro na tabela '${tabela.nome}':`, err.message);
    }
  }

  const migracoes = [
    {
      descricao: "google_id em utilizadores",
      sql: "ALTER TABLE utilizadores ADD COLUMN google_id VARCHAR(255) NULL UNIQUE AFTER email",
    },
    {
      descricao: "foto_url em utilizadores",
      sql: "ALTER TABLE utilizadores ADD COLUMN foto_url VARCHAR(500) NULL AFTER google_id",
    },
    {
      descricao: "password nullable em utilizadores",
      sql: "ALTER TABLE utilizadores MODIFY COLUMN password VARCHAR(255) NULL",
    },
  ];

  for (const m of migracoes) {
    try {
      await db.execute(m.sql);
      console.log(`   ✅ Migracao OK: ${m.descricao}`);
    } catch (err) {
      if (err.errno !== 1060) {
        console.warn(`   ⚠️  Migracao '${m.descricao}': ${err.message}`);
      }
    }
  }

  console.log("🔧 Tabelas verificadas.");
}

module.exports = criarTabelas;
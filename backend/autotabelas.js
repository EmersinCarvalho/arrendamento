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
    {
      nome: "avaliacoes",
      sql: `
        CREATE TABLE IF NOT EXISTS avaliacoes (
          id            INT AUTO_INCREMENT PRIMARY KEY,
          avaliador_id  INT NOT NULL,
          avaliado_id   INT NOT NULL,
          estrelas      TINYINT NOT NULL,
          comentario    TEXT NULL,
          criado_em     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          UNIQUE KEY uq_avaliacao (avaliador_id, avaliado_id),
          FOREIGN KEY (avaliador_id) REFERENCES utilizadores(id) ON DELETE CASCADE,
          FOREIGN KEY (avaliado_id)  REFERENCES utilizadores(id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
      `,
    },
    {
      nome: "curriculo_imobiliario",
      sql: `
        CREATE TABLE IF NOT EXISTS curriculo_imobiliario (
          id                     INT AUTO_INCREMENT PRIMARY KEY,
          utilizador_id          INT          NOT NULL UNIQUE,
          situacao_profissional  VARCHAR(80)  NULL,
          tipo_contrato          VARCHAR(80)  NULL,
          profissao              VARCHAR(100) NULL,
          rendimento_mensal      DECIMAL(10,2) NULL,
          num_pessoas            INT          NULL,
          tem_animais            TINYINT(1)   NOT NULL DEFAULT 0,
          duracao_pretendida     VARCHAR(50)  NULL,
          referencias            TEXT         NULL,
          sobre_mim              TEXT         NULL,
          atualizado_em          TIMESTAMP    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (utilizador_id) REFERENCES utilizadores(id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
      `,
    },
    {
      nome: "candidaturas",
      sql: `
        CREATE TABLE IF NOT EXISTS candidaturas (
          id            INT AUTO_INCREMENT PRIMARY KEY,
          inquilino_id  INT NOT NULL,
          imovel_id     INT NOT NULL,
          lida          TINYINT(1) NOT NULL DEFAULT 0,
          criado_em     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          UNIQUE KEY uq_candidatura (inquilino_id, imovel_id),
          FOREIGN KEY (inquilino_id) REFERENCES utilizadores(id) ON DELETE CASCADE,
          FOREIGN KEY (imovel_id)    REFERENCES imoveis(id)      ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
      `,
    },
    {
      nome: "perfil_procura",
      sql: `
        CREATE TABLE IF NOT EXISTS perfil_procura (
          id                   INT AUTO_INCREMENT PRIMARY KEY,
          utilizador_id        INT          NOT NULL UNIQUE,
          objetivo             ENUM('arrendar','comprar') NOT NULL DEFAULT 'arrendar',
          tipo_imovel          VARCHAR(50)  NULL,
          cidade               VARCHAR(100) NULL,
          tipologia            VARCHAR(10)  NULL,
          preco_max            DECIMAL(10,2) NOT NULL DEFAULT 2000,
          quartos_min          INT          NOT NULL DEFAULT 0,
          aceita_pets          TINYINT(1)   NOT NULL DEFAULT 0,
          mobiliado            TINYINT(1)   NOT NULL DEFAULT 0,
          despesas_incluidas   TINYINT(1)   NOT NULL DEFAULT 0,
          prioridades          JSON         NULL,
          criado_em            TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
          atualizado_em        TIMESTAMP    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (utilizador_id) REFERENCES utilizadores(id) ON DELETE CASCADE
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
    {
      descricao: "telefone em utilizadores",
      sql: "ALTER TABLE utilizadores ADD COLUMN telefone VARCHAR(30) NULL AFTER foto_url",
    },
    {
      descricao: "bio em utilizadores",
      sql: "ALTER TABLE utilizadores ADD COLUMN bio TEXT NULL AFTER telefone",
    },
    {
      descricao: "quartos em imoveis",
      sql: "ALTER TABLE imoveis ADD COLUMN quartos INT NOT NULL DEFAULT 0 AFTER tipologia",
    },
    {
      descricao: "tipo_imovel em imoveis",
      sql: "ALTER TABLE imoveis ADD COLUMN tipo_imovel VARCHAR(50) NULL AFTER quartos",
    },
    {
      descricao: "aceita_pets em imoveis",
      sql: "ALTER TABLE imoveis ADD COLUMN aceita_pets TINYINT(1) NOT NULL DEFAULT 0 AFTER tipo_imovel",
    },
    {
      descricao: "mobiliado em imoveis",
      sql: "ALTER TABLE imoveis ADD COLUMN mobiliado TINYINT(1) NOT NULL DEFAULT 0 AFTER aceita_pets",
    },
    {
      descricao: "despesas_incluidas em imoveis",
      sql: "ALTER TABLE imoveis ADD COLUMN despesas_incluidas TINYINT(1) NOT NULL DEFAULT 0 AFTER mobiliado",
    },
    {
      descricao: "verificado em imoveis",
      sql: "ALTER TABLE imoveis ADD COLUMN verificado TINYINT(1) NOT NULL DEFAULT 0 AFTER despesas_incluidas",
    },
    {
      descricao: "area em imoveis",
      sql: "ALTER TABLE imoveis ADD COLUMN area INT NULL AFTER verificado",
    },
    {
      descricao: "casas_banho em imoveis",
      sql: "ALTER TABLE imoveis ADD COLUMN casas_banho INT NULL DEFAULT 1 AFTER area",
    },
    {
      descricao: "varanda em imoveis",
      sql: "ALTER TABLE imoveis ADD COLUMN varanda TINYINT(1) NOT NULL DEFAULT 0 AFTER casas_banho",
    },
    {
      descricao: "garagem em imoveis",
      sql: "ALTER TABLE imoveis ADD COLUMN garagem TINYINT(1) NOT NULL DEFAULT 0 AFTER varanda",
    },
    {
      descricao: "estado em imoveis",
      sql: "ALTER TABLE imoveis ADD COLUMN estado VARCHAR(50) NULL AFTER garagem",
    },
    {
      descricao: "armarios_embutidos em imoveis",
      sql: "ALTER TABLE imoveis ADD COLUMN armarios_embutidos TINYINT(1) NOT NULL DEFAULT 0 AFTER estado",
    },
    {
      descricao: "orientacao em imoveis",
      sql: "ALTER TABLE imoveis ADD COLUMN orientacao VARCHAR(100) NULL AFTER armarios_embutidos",
    },
    {
      descricao: "cozinha_equipada em imoveis",
      sql: "ALTER TABLE imoveis ADD COLUMN cozinha_equipada TINYINT(1) NOT NULL DEFAULT 0 AFTER orientacao",
    },
    {
      descricao: "aquecimento em imoveis",
      sql: "ALTER TABLE imoveis ADD COLUMN aquecimento VARCHAR(50) NULL AFTER cozinha_equipada",
    },
    {
      descricao: "cozinha_mobilada em imoveis",
      sql: "ALTER TABLE imoveis ADD COLUMN cozinha_mobilada TINYINT(1) NOT NULL DEFAULT 0 AFTER aquecimento",
    },
    {
      descricao: "tipo_edificio em imoveis",
      sql: "ALTER TABLE imoveis ADD COLUMN tipo_edificio VARCHAR(50) NULL AFTER aquecimento",
    },
    {
      descricao: "andar em imoveis",
      sql: "ALTER TABLE imoveis ADD COLUMN andar VARCHAR(30) NULL AFTER tipo_edificio",
    },
    {
      descricao: "elevador em imoveis",
      sql: "ALTER TABLE imoveis ADD COLUMN elevador TINYINT(1) NOT NULL DEFAULT 0 AFTER andar",
    },
    {
      descricao: "certificado_energetico em imoveis",
      sql: "ALTER TABLE imoveis ADD COLUMN certificado_energetico VARCHAR(5) NULL AFTER elevador",
    },
    {
      descricao: "atualizado_em em imoveis",
      sql: "ALTER TABLE imoveis ADD COLUMN atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP AFTER certificado_energetico",
    },
    {
      descricao: "meses_caucao em imoveis",
      sql: "ALTER TABLE imoveis ADD COLUMN meses_caucao INT NULL AFTER atualizado_em",
    },
    {
      descricao: "fianca em imoveis",
      sql: "ALTER TABLE imoveis ADD COLUMN fianca TINYINT(1) NOT NULL DEFAULT 0 AFTER meses_caucao",
    },
    {
      descricao: "data_disponivel em imoveis",
      sql: "ALTER TABLE imoveis ADD COLUMN data_disponivel DATE NULL AFTER fianca",
    },
    {
      descricao: "fotos em imoveis",
      sql: "ALTER TABLE imoveis ADD COLUMN fotos TEXT NULL AFTER data_disponivel",
    },
    {
      descricao: "morada em imoveis",
      sql: "ALTER TABLE imoveis ADD COLUMN morada VARCHAR(255) NULL AFTER fotos",
    },
    {
      descricao: "latitude em imoveis",
      sql: "ALTER TABLE imoveis ADD COLUMN latitude DECIMAL(10,7) NULL AFTER morada",
    },
    {
      descricao: "longitude em imoveis",
      sql: "ALTER TABLE imoveis ADD COLUMN longitude DECIMAL(10,7) NULL AFTER latitude",
    },
    {
      descricao: "visualizacoes em imoveis",
      sql: "ALTER TABLE imoveis ADD COLUMN visualizacoes INT NOT NULL DEFAULT 0 AFTER longitude",
    },
    {
      descricao: "tipo_contrato em curriculo_imobiliario",
      sql: "ALTER TABLE curriculo_imobiliario ADD COLUMN tipo_contrato VARCHAR(80) NULL AFTER situacao_profissional",
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
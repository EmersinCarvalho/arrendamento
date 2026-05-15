const mysql = require("mysql2/promise");
require("dotenv").config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  charset: "utf8mb4",
});

// Verificar ligação ao iniciar
pool.getConnection()
  .then((conn) => {
    console.log("✅ Base de dados ligada com sucesso!");
    conn.release();
  })
  .catch((err) => {
    console.error("❌ Erro ao ligar à base de dados:", err.message);
  });

module.exports = pool;

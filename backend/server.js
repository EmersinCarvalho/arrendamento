require("dotenv").config();
const express = require("express");
const cors = require("cors");
const session = require("express-session");
const passport = require("./config/passport");

const criarTabelas = require("./autotabelas");
const imoveisRoutes = require("./routes/imoveis");
const authRoutes = require("./routes/auth");

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors({ origin: process.env.FRONTEND_URL, credentials: true }));
app.use(express.json());

// Sessão temporária apenas para o fluxo OAuth (não é usada após o callback)
app.use(
  session({
    secret: process.env.JWT_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 5 * 60 * 1000 }, // 5 minutos
  })
);

// Passport
app.use(passport.initialize());
app.use(passport.session());

// Rotas
app.use("/api/imoveis", imoveisRoutes);
app.use("/api/auth", authRoutes);

// Rota raiz de verificação
app.get("/", (req, res) => {
  res.json({ mensagem: "API ArrendaHouse a funcionar!" });
});

// Iniciar servidor — cria tabelas primeiro, depois escuta
criarTabelas().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Servidor a correr em http://localhost:${PORT}`);
  });
});

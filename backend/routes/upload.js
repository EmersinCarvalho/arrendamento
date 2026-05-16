const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const verificarToken = require("../middleware/auth");

// Garantir que a pasta existe
const UPLOADS_DIR = path.join(__dirname, "..", "uploads");
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOADS_DIR),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const nome = `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`;
    cb(null, nome);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 8 * 1024 * 1024 }, // 8 MB
  fileFilter: (_req, file, cb) => {
    const permitidos = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (permitidos.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Apenas imagens JPEG, PNG, WebP ou GIF são permitidas"));
    }
  },
});

// POST /api/upload/foto — requer autenticação
router.post("/foto", verificarToken, upload.single("foto"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ erro: "Nenhum ficheiro recebido" });
  }
  const url = `${process.env.BACKEND_URL}/uploads/${req.file.filename}`;
  res.json({ url });
});

// Tratamento de erros do multer
router.use((err, _req, res, _next) => {
  if (err.code === "LIMIT_FILE_SIZE") {
    return res.status(400).json({ erro: "Ficheiro demasiado grande (máx. 8 MB)" });
  }
  res.status(400).json({ erro: err.message || "Erro no upload" });
});

module.exports = router;

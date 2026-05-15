const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const db = require("./db");

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `${process.env.BACKEND_URL}/api/auth/google/callback`,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value;
        const googleId = profile.id;
        const nome = profile.displayName;
        const fotoUrl = profile.photos?.[0]?.value || null;

        if (!email) {
          return done(new Error("Email não disponível no perfil Google"), null);
        }

        // Procurar utilizador existente por google_id ou email
        const [rows] = await db.execute(
          "SELECT * FROM utilizadores WHERE google_id = ? OR email = ?",
          [googleId, email]
        );

        let utilizador;
        let isNew = false;

        if (rows.length > 0) {
          utilizador = rows[0];
          // Atualizar google_id e foto se necessário
          await db.execute(
            "UPDATE utilizadores SET google_id = ?, foto_url = ? WHERE id = ?",
            [googleId, fotoUrl, utilizador.id]
          );
          utilizador.foto_url = fotoUrl;
        } else {
          // Criar novo utilizador
          const [result] = await db.execute(
            "INSERT INTO utilizadores (nome, email, google_id, foto_url, password) VALUES (?, ?, ?, ?, NULL)",
            [nome, email, googleId, fotoUrl]
          );
          utilizador = {
            id: result.insertId,
            nome,
            email,
            google_id: googleId,
            foto_url: fotoUrl,
            perfil: "inquilino",
          };
          isNew = true;
        }

        return done(null, { ...utilizador, isNew });
      } catch (err) {
        return done(err, null);
      }
    }
  )
);

// Necessário para o fluxo OAuth (sessão temporária apenas)
passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));

module.exports = passport;

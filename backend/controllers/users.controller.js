const { pool } = require("../db/config");

class UsersController {
  async login(req, res) {
    try {
        const { email, password } = req.body;

        const query = `SELECT * FROM users WHERE email = $1 AND password = $2`;
        const result = await pool.query(query, [email, password]);

        if (result.rows.length === 0) {
            return res.status(401).send({ message: "Credenciales inválidas" });
        }

        const user = result.rows[0];
        return res.status(200).send({ message: "Inicio de sesión exitoso", user });
    } catch (error) {
        console.error("Error in login:", error);
        res.status(500).send({ message: "Internal Server Error" });
    }
  }

  async signUp(req, res) {
    try {
      const { email, password } = req.body;

      const checkQuery = "SELECT * FROM users WHERE email = $1";
      const checkResult = await pool.query(checkQuery, [email]);

      if (checkResult.rows.length > 0) {
        return res.status(400).send({ message: "El usuario ya existe" });
      }

      const insertQuery = "INSERT INTO users (email, password) VALUES ($1, $2)";
      await pool.query(insertQuery, [email, password]);

      return res
        .status(201)
        .send({ message: "Usuario registrado correctamente" });
    } catch (error) {
      console.error("Error in signUp:", error);
      res.status(500).send({ message: "Internal Server Error" });
    }
  }

  async resetPassword(req, res) {
    try {
      const { email, newPassword } = req.body;

      const query = `SELECT * FROM users WHERE email = $1`;

      const result = await pool.query(query, [email]);

      if (result.rows.length === 0) {
        return res.status(404).send({ message: "Usuario no encontrado" });
      }

      const updateQuery = `UPDATE users SET password = $1 WHERE email = $2`;

      await pool.query(updateQuery, [newPassword, email]);

      return res
        .status(200)
        .send({ message: "Contraseña actualizada correctamente" });
    } catch (error) {
      console.error("Error in resetPassword:", error);
      res.status(500).send({ message: "Internal Server Error" });
    }
  }
}

module.exports = UsersController;

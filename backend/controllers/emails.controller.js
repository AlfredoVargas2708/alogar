const transporter = require("../emails/config");
const fs = require("fs");
const path = require("path");
const { pool } = require("../db/config");

class EmailController {
  async sendWelcomeEmailTo(email) {
    try {
      const query = "SELECT * FROM users WHERE email = $1";
      const result = await pool.query(query, [email]);

      if (result.rows.length === 0) {
        throw new Error("Email no registrado");
      }

      const htmlFilePath = path.join(__dirname, "../emails/welcome.html");

      const mailOptions = {
        from: '"Alogar" <avg072023@gmail.com>',
        to: email,
        subject: "Bienvenida a Alogar",
        text: "Bienvenido/a al sistema de ventas de Alogar",
        html: fs
          .readFileSync(htmlFilePath, "utf8")
          .replace("{{nombre}}", email),
      };

      await transporter.sendMail(mailOptions);
    } catch (error) {
      console.error("Error al enviar email:", error);
      throw error;
    }
  }

  async sendWelcomeEmail(req, res) {
    try {
      await this.sendWelcomeEmailTo(req.body.email);
      res.status(200).send({ message: "Email enviado correctamente" });
    } catch (error) {
      res.status(500).send({ message: "Fallo al enviar el email" });
    }
  }

  async sendResetEmail(req, res) {
    try {
      const { email } = req.body;

      const query = "SELECT * FROM users WHERE email = $1";
      const result = await pool.query(query, [email]);

      if (result.rows.length === 0) {
        return res.status(404).send({ message: "Email no registrado" });
      }

      const htmlFilePath = path.join(
        __dirname,
        "../emails/reset-password.html"
      );

      const mailOptions = {
        from: '"Alogar" <avg072023@gmail.com>',
        to: email,
        subject: "Restablecimiento de Contraseña",
        text: "Ingrese al siguiente link para restablecer su contraseña:\n\nhttp://localhost:4200/new-password",
        html: fs.readFileSync(htmlFilePath, "utf8").replace("{{email}}", email),
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error("Error enviando email:", error);
          return res.status(500).send({ message: "Error enviando email" });
        }
        res.status(200).send({ message: "Email enviado correctamente" });
      });
    } catch (error) {
      console.error("Error in sendResetEmail:", error);
      res.status(500).send({ message: "Internal Server Error" });
    }
  }
}

module.exports = EmailController;

const { pool } = require('../db/config');

class UsersController {
    async signUp(req, res) {
        try {
            const { email, password } = req.body;

            const query = `SELECT * FROM users WHERE email = ${email}`;

            const result = await pool.query(query);

            if (result.rows.length > 0) {
                return res.status(400).send({ message: "El usuario ya existe" });
            }

            const insertQuery =  `INSERT INTO users (email, password) VALUES (${email}, ${password})`

            await pool.query(insertQuery);

            return res.status(201).send({ message: "Usuario regitrado correctamente" });
        } catch (error) {
            console.error('Error in signUp:', error);
            res.status(500).send({ message: "Internal Server Error" });
        }
    }

    async resetPassword(req, res) {
        try {
            const { email, newPassword } = req.body;

            const query = `SELECT * FROM users WHERE email = ${email}`;

            const result = await pool.query(query);

            if (result.rows.length === 0) {
                return res.status(404).send({ message: "Usuario no encontrado"});
            }

            const updateQuery = `UPDATE users SET password = ${newPassword} WHERE email = ${email}`

            await pool.query(updateQuery);

            return res.status(200).send(({ message: "Contraseña actualizada correctamente" }));
        } catch (error) {
            console.error('Error in resetPassword:', error);
            res.status(500).send({ message: "Internal Server Error" });
        }
    }
}

module.exports = UsersController;
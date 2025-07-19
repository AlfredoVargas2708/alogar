const transporter = require('../emails/config');
const fs = require('fs');
const path = require('path');
const { pool } = require('../db/config');

class EmailController {
    async sendResetEmail(req, res) {
        try {
            const { email } = req.body;

            const query = 'SELECT * FROM users WHERE email = $1';
            const result = await pool.query(query, [email]);

            if (result.rows.length === 0) {
                return res.status(404).send({ message: "Email no registrado" });
            }

            const htmlFilePath = path.join(__dirname, '../emails/reset-password.html');

            const mailOptions = {
                from: '"Alogar" <avg072023@gmail.com>',
                to: email,
                subject: 'Password Reset Request',
                text: 'Click the link below to reset your password:\n\nhttp://localhost:4200/new-password',
                html: fs.readFileSync(htmlFilePath, 'utf8').replace('{{email}}', email)
            }

            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    console.error('Error sending email:', error);
                    return res.status(500).send({ message: "Failed to send email" });
                }
                console.log('Email sent:', info.response);
                res.status(200).send({ message: "Email sent successfully" });
            })
        } catch (error) {
            console.error('Error in sendResetEmail:', error);
            res.status(500).send({ message: "Internal Server Error" });
        }
    }
}

module.exports = EmailController;
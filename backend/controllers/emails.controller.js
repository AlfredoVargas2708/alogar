class EmailController {
    async sendResetEmail(req, res) {
        try {
            
        } catch (error) {
            console.error('Error in sendResetEmail:', error);
            res.status(500).send({ message: "Internal Server Error" });
        }
    }
}

module.exports = EmailController;
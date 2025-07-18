const nodemailer = require("nodemailer");

let transporter = nodemailer.createTransport({
  host: "smtp-relay.brevo.com",
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: "avg072023@gmail.com", // generated ethereal user
    pass: "9F7gYxaQqnMBOAID", // generated ethereal password
  },
});

module.exports = transporter;

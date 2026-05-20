const nodemailer = require('nodemailer');

async function sendEmail({ to, subject, html }) {
  const port = Number(process.env.SMTP_PORT || 587);

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure: port === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });

  const info = await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to,
    subject,
    html
  });

  console.log('Email sent:', info.messageId);

  if (nodemailer.getTestMessageUrl(info)) {
    console.log('Preview URL:', nodemailer.getTestMessageUrl(info));
  }

  return info;
}

module.exports = sendEmail;

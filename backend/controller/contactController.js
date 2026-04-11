const nodemailer = require('nodemailer');

const sendContactEmail = async (req, res) => {
  try {
    const { name, email, message } = req.body;
    
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.log(`Mock Email received from ${name} (${email}): ${message}`);
      return res.status(200).json({ message: 'Message received (Development Mode)'});
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: email,
      to: process.env.EMAIL_USER,
      subject: `DreamConnect Contact: ${name}`,
      text: `From: ${name} <${email}>\n\nMessage:\n${message}`,
    };

    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: 'Message sent successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { sendContactEmail };

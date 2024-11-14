// src/services/mail.service.js
const nodemailer = require('nodemailer');
const { AppError } = require('../middleware/error');

class MailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  }

  async sendMail(to, subject, html) {
    try {
      await this.transporter.sendMail({
        from: process.env.MAIL_FROM,
        to,
        subject,
        html
      });
    } catch (error) {
      throw new AppError('Error sending email', 500);
    }
  }

  async sendVerificationEmail(user, token) {
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;
    
    await this.sendMail(
      user.email,
      'Verify Your Email',
      `Please click here to verify your email: ${verificationUrl}`
    );
  }

  async sendPasswordResetEmail(user, token) {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
    
    await this.sendMail(
      user.email,
      'Password Reset',
      `Click here to reset your password: ${resetUrl}`
    );
  }

  async sendTransferNotification(transfer) {
    await this.sendMail(
      transfer.toOwner.email,
      'New Property Transfer Request',
      `You have received a new property transfer request for ${transfer.property.title}`
    );
  }
}

module.exports = new MailService();
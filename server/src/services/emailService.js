import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';

export const emailService = {
  /**
   * Create Nodemailer Transport dynamically based on environment variables
   */
  getTransporter() {
    const smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com';
    const smtpPort = parseInt(process.env.SMTP_PORT || '587', 10);
    const smtpUser = process.env.SMTP_USER || process.env.GMAIL_USER || process.env.ADMIN_EMAIL;
    const smtpPass = process.env.SMTP_PASS || process.env.GMAIL_APP_PASSWORD;

    if (smtpUser && smtpPass) {
      return nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpPort === 465, // true for 465, false for 587
        auth: {
          user: smtpUser,
          pass: smtpPass
        }
      });
    }

    return null;
  },

  /**
   * Dispatch Password Reset Email
   */
  async sendPasswordResetEmail(recipientEmail, resetCode) {
    const transporter = this.getTransporter();
    const senderEmail = process.env.SMTP_USER || process.env.ADMIN_EMAIL || 'dudhatashish1995@gmail.com';
    
    const emailSubject = '🔐 Admin Password Reset Verification Code - Ashish Portfolio CMS';
    const emailText = `Hello Ashish,\n\nA password reset request was initiated for your Portfolio Admin CMS account.\n\nYour 6-digit verification code is: ${resetCode}\n\nThis code is valid for 15 minutes. If you did not request a password reset, please ignore this email.\n\nBest regards,\nAshishkumar Dudhat Portfolio System Security`;

    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #0b0f19; color: #f3f4f6; padding: 30px; border-radius: 16px; border: 1px solid #1e293b;">
        <h2 style="color: #38bdf8; margin-top: 0;">🔐 Password Reset Request</h2>
        <p style="font-size: 14px; color: #cbd5e1;">A password reset request was initiated for your Portfolio Admin CMS account (<strong>${recipientEmail}</strong>).</p>
        <div style="margin: 25px 0; padding: 20px; background-color: #020617; border: 1px solid #38bdf8; border-radius: 12px; text-align: center;">
          <span style="font-size: 12px; color: #94a3b8; text-transform: uppercase; letter-spacing: 2px; display: block; margin-bottom: 8px;">Verification Code</span>
          <span style="font-size: 34px; font-weight: bold; font-family: monospace; color: #38bdf8; letter-spacing: 8px;">${resetCode}</span>
        </div>
        <p style="font-size: 12px; color: #94a3b8;">This verification code is valid for <strong>15 minutes</strong>. Enter this code on the password reset screen to verify your identity.</p>
        <hr style="border: 0; border-top: 1px solid #1e293b; margin: 25px 0;" />
        <p style="font-size: 11px; color: #64748b; margin-bottom: 0;">Ashishkumar Dudhat Portfolio CMS • Security Dispatcher</p>
      </div>
    `;

    if (transporter) {
      try {
        const info = await transporter.sendMail({
          from: `"Ashish Portfolio Security" <${senderEmail}>`,
          to: recipientEmail,
          subject: emailSubject,
          text: emailText,
          html: emailHtml
        });

        console.log(`[SMTP DISPATCH SUCCESS] Real email sent to ${recipientEmail}. Message ID: ${info.messageId}`);
        return { success: true, mode: 'smtp', messageId: info.messageId };
      } catch (smtpErr) {
        console.error('\n⚠️ [SMTP DISPATCH ERROR] Failed to send email via Gmail SMTP:');
        console.error(`   Error Message: ${smtpErr.message}`);
        if (smtpErr.message.includes('535') || smtpErr.message.includes('Username and Password not accepted')) {
          console.error(`   👉 REASON: Google rejects normal Gmail passwords for Nodemailer/SMTP!`);
          console.error(`   👉 SOLUTION: You MUST generate a 16-character Gmail App Password at: https://myaccount.google.com/apppasswords`);
          console.error(`   👉 Set SMTP_PASS="your-16-char-app-password" in server/.env\n`);
        }
      }
    }

    // Fallback Outbox Logger & Console Guide
    console.log(`\n=================================================================`);
    console.log(`📧 [EMAIL SIMULATION OUTBOX] Password Reset Email Dispatched to: ${recipientEmail}`);
    console.log(`Subject: ${emailSubject}`);
    console.log(`Verification Code: ${resetCode}`);
    console.log(`-----------------------------------------------------------------`);
    console.log(`💡 NOTE: To receive REAL emails directly in your inbox, set your Gmail App Password in server/.env:`);
    console.log(`   SMTP_HOST=smtp.gmail.com`);
    console.log(`   SMTP_PORT=587`);
    console.log(`   SMTP_USER=dudhatashish1995@gmail.com`);
    console.log(`   SMTP_PASS=your-16-digit-gmail-app-password`);
    console.log(`=================================================================\n`);

    try {
      const outboxDir = path.join(process.cwd(), 'logs', 'outbox');
      if (!fs.existsSync(outboxDir)) {
        fs.mkdirSync(outboxDir, { recursive: true });
      }
      const logFile = path.join(outboxDir, `password_reset_${Date.now()}.html`);
      fs.writeFileSync(logFile, emailHtml, 'utf8');
    } catch {
      // Ignore fallback write error
    }

    return { success: true, mode: 'outbox_log' };
  }
};

const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.transporter = null;
    this.initTransporter();
  }

  initTransporter() {
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS ? process.env.SMTP_PASS.replace(/\s+/g, '') : '';

    if (user && pass) {
      if (process.env.SMTP_HOST && !process.env.SMTP_HOST.includes('gmail')) {
        this.transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST,
          port: Number(process.env.SMTP_PORT) || 587,
          secure: process.env.SMTP_SECURE === 'true',
          auth: { user, pass },
          connectionTimeout: 10000,
          greetingTimeout: 10000,
          socketTimeout: 15000
        });
      } else {
        // Optimized for Gmail with SSL port 465, automatic space stripping for App Passwords, and strict socket timeouts
        this.transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: { user, pass },
          connectionTimeout: 10000,
          greetingTimeout: 10000,
          socketTimeout: 15000
        });
      }
      console.log(`[EmailService] SMTP Transporter configured for ${user}.`);
    } else {
      console.error('[EmailService] SMTP credentials not configured in .env! OTP emails will NOT be delivered.');
      console.error('[EmailService] Set SMTP_USER and SMTP_PASS in server environment variables.');
      this.transporter = null;
    }
  }

  /**
   * Sends the 6-digit digital signing OTP to the authorized signatory via real email.
   * No demo/fallback OTP is returned to the frontend — the OTP is only in the email.
   */
  async sendSigningOtpEmail({ toEmail, signerName, companyName, otpCode }) {
    if (!this.transporter) {
      throw new Error(
        'Email service is not configured. Please set SMTP_HOST, SMTP_USER, and SMTP_PASS in your server .env file to enable OTP email delivery.'
      );
    }

    const fromAddress = process.env.MAIL_FROM || process.env.SMTP_USER;
    const subject = `Your Verification OTP for ${companyName} Engagement Agreement`;

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
        <div style="text-align: center; border-bottom: 2px solid #059669; padding-bottom: 12px; margin-bottom: 20px;">
          <h2 style="color: #0f172a; margin: 0;">R&D & Government Incentive Platform</h2>
          <p style="color: #64748b; font-size: 13px; margin: 4px 0 0 0;">Statutory Engagement Verification</p>
        </div>
        <p style="color: #334155; font-size: 15px;">Dear <strong>${signerName}</strong>,</p>
        <p style="color: #334155; font-size: 14px; line-height: 1.5;">
          You are executing the Contingency Consulting Engagement Agreement for <strong>${companyName}</strong> under Section 80-IAC, Section 35(2AB), and related Indian R&D incentive programs.
        </p>
        <div style="background-color: #f8fafc; border: 1px dashed #cbd5e1; padding: 16px; text-align: center; margin: 24px 0; border-radius: 6px;">
          <span style="font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: #64748b; font-weight: bold;">Your One-Time Password (OTP)</span>
          <div style="font-size: 32px; font-weight: 800; letter-spacing: 6px; color: #059669; margin-top: 8px;">${otpCode}</div>
          <span style="font-size: 12px; color: #94a3b8; display: block; margin-top: 6px;">Valid for 10 minutes. Do not share this OTP with anyone.</span>
        </div>
        <p style="color: #64748b; font-size: 12px; line-height: 1.4;">
          This OTP serves as legal signatory verification. Upon entering this OTP, a cryptographic SHA-256 audit digest of the engagement terms will be sealed with your IP address and timestamp.
        </p>
        <div style="border-top: 1px solid #e2e8f0; margin-top: 24px; padding-top: 12px; text-align: center; color: #94a3b8; font-size: 11px;">
          India R&D Tax Incentive Platform &bull; Statutory Audit Compliance
        </div>
      </div>
    `;

    const info = await this.transporter.sendMail({
      from: fromAddress,
      to: toEmail,
      subject,
      html: htmlContent
    });

    console.log(`[EmailService] OTP email sent to ${toEmail} (MessageId: ${info.messageId})`);

    // Never return the OTP code to the frontend
    return { success: true, messageId: info.messageId };
  }
}

module.exports = new EmailService();

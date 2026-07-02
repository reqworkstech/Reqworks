const nodemailer = require('nodemailer');

/**
 * Helper to dispatch emails in the background using Resend HTTP API or SMTP Nodemailer.
 * Runs asynchronously and logs results, preventing route handlers from blocking.
 */
const dispatchEmail = (options) => {
  const { to, subject, html, serviceName } = options;

  const hasBrevoAPI = !!process.env.BREVO_API_KEY;
  const hasResend = !!process.env.RESEND_API_KEY;
  const hasSMTP = !!(process.env.EMAIL_USER && process.env.EMAIL_PASS && process.env.EMAIL_HOST);

  if (!hasBrevoAPI && !hasResend && !hasSMTP) {
    console.log(`[EmailService] [${serviceName}] No actual email credentials configured. Simulator mode only.`);
    return;
  }

  const sendPromise = async () => {
    const fromName = process.env.EMAIL_FROM_NAME || 'Reqworks Support';
    const fromEmail = process.env.EMAIL_FROM || 'reqworks.tech@gmail.com';

    if (hasBrevoAPI) {
      const apiKey = process.env.BREVO_API_KEY;
      const response = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'api-key': apiKey,
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          sender: { name: fromName, email: fromEmail },
          to: [{ email: to }],
          subject: subject,
          htmlContent: html
        })
      });

      let data = {};
      try {
        data = await response.json();
      } catch (e) {}

      if (!response.ok) {
        throw new Error(data.message || `Brevo HTTP API returned status ${response.status}`);
      }
      return `Brevo HTTP API (ID: ${data.messageId})`;
    } else if (hasResend) {
      const apiKey = process.env.RESEND_API_KEY;
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: `"${fromName}" <${fromEmail}>`,
          to: [to],
          subject: subject,
          html: html
        })
      });

      let data = {};
      try {
        data = await response.json();
      } catch (e) {}

      if (!response.ok) {
        throw new Error(data.message || `Resend HTTP API returned status ${response.status}`);
      }
      return `Resend HTTP API (ID: ${data.id})`;
    } else {
      const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: parseInt(process.env.EMAIL_PORT) || 587,
        secure: parseInt(process.env.EMAIL_PORT) === 465,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
      });

      const mailOptions = {
        from: `"${fromName}" <${fromEmail}>`,
        to: to,
        subject: subject,
        html: html
      };

      await transporter.sendMail(mailOptions);
      return 'SMTP Nodemailer';
    }
  };

  // Fire and forget in the background
  sendPromise()
    .then((method) => {
      console.log(`[EmailService] [${serviceName}] Email successfully dispatched to ${to} via ${method}`);
    })
    .catch((err) => {
      console.error(`[EmailService] [${serviceName}] Failed to send email to ${to}:`, err.message);
    });
};

/**
 * Shared HTML email layout helper to construct premium, high-converting dark-themed emails.
 */
const getPremiumEmailLayout = (title, bodyHtml, ctaText, ctaUrl, accentColor = '#8b5cf6', footerText = '') => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title}</title>
      <style>
        body {
          margin: 0;
          padding: 0;
          width: 100% !important;
          height: 100% !important;
          background-color: #090a0f;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          -webkit-font-smoothing: antialiased;
        }
        .wrapper {
          width: 100%;
          background-color: #090a0f;
          padding: 40px 20px;
          box-sizing: border-box;
        }
        .container {
          max-width: 580px;
          margin: 0 auto;
          background-color: #11131a;
          border-radius: 16px;
          border: 1px solid rgba(255, 255, 255, 0.08);
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4);
          overflow: hidden;
        }
        .header-bar {
          height: 4px;
          background: ${accentColor};
        }
        .content {
          padding: 40px 35px 35px 35px;
        }
        .logo-container {
          text-align: center;
          margin-bottom: 30px;
        }
        .logo-text {
          font-size: 24px;
          font-weight: 800;
          color: #ffffff;
          letter-spacing: -0.5px;
          text-decoration: none;
        }
        .logo-dot {
          color: ${accentColor};
        }
        .email-title {
          font-size: 22px;
          font-weight: 700;
          color: #ffffff;
          line-height: 1.3;
          margin: 0 0 24px 0;
          text-align: center;
        }
        .email-body {
          font-size: 15px;
          line-height: 1.6;
          color: #cbd5e1;
          margin-bottom: 30px;
        }
        .cta-container {
          text-align: center;
          margin: 32px 0;
        }
        .btn {
          display: inline-block;
          background: ${accentColor};
          color: #ffffff !important;
          text-decoration: none;
          padding: 12px 28px;
          border-radius: 8px;
          font-size: 15px;
          font-weight: 600;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
          transition: all 0.2s ease;
        }
        .divider {
          height: 1px;
          background-color: rgba(255, 255, 255, 0.08);
          margin: 30px 0;
        }
        .footer {
          font-size: 11px;
          color: #64748b;
          text-align: center;
          line-height: 1.6;
        }
        .footer a {
          color: #94a3b8;
          text-decoration: none;
        }
        .footer a:hover {
          text-decoration: underline;
        }
        @media only screen and (max-width: 480px) {
          .content {
            padding: 30px 20px 25px 20px;
          }
          .email-title {
            font-size: 20px;
          }
        }
      </style>
    </head>
    <body>
      <div class="wrapper">
        <div class="container">
          <div class="header-bar"></div>
          <div class="content">
            <div class="logo-container">
              <span class="logo-text">Reqworks<span class="logo-dot">.</span></span>
            </div>
            <h1 class="email-title">${title}</h1>
            <div class="email-body">
              ${bodyHtml}
            </div>
            ${ctaText && ctaUrl ? `
            <div class="cta-container">
              <a href="${ctaUrl}" class="btn">${ctaText}</a>
            </div>
            ` : ''}
            <div class="divider"></div>
            <div class="footer">
              ${footerText || `This is an automated operational notification sent regarding your account actions.`}
              <br>
              <span style="margin-top: 8px; display: inline-block;">&copy; ${new Date().getFullYear()} Reqworks. All rights reserved.</span>
            </div>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
};

const sendVerificationEmail = async (email, name, token, otp) => {
  const verifyUrl = `${process.env.CLIENT_URL || 'https://www.reqworks.in'}/verify-email/${token}`;
  
  // 1. Log in dev mode only (Simulator output)
  if (process.env.NODE_ENV !== 'production') {
    console.log('\n┌────────────────────────────────────────────────────────┐');
    console.log('│                    📧 EMAIL SIMULATOR                  │');
    console.log('├────────────────────────────────────────────────────────┤');
    console.log(`│ To: ${email.padEnd(51)}│`);
    console.log(`│ Name: ${name.padEnd(49)}│`);
    console.log(`│ Verification OTP: ${otp.padEnd(37)}│`);
    console.log('│                                                        │');
    console.log('│ Please verify your email by clicking the link below:   │');
    console.log(`│ ${verifyUrl.padEnd(55)} │`);
    console.log('└────────────────────────────────────────────────────────┘\n');
  }

  const bodyHtml = `
    <p>Welcome to Reqworks, <strong>${name}</strong>!</p>
    <p>Thank you for signing up. Please enter the following 6-digit verification code to confirm your email address and activate your account:</p>
    
    <div style="background-color: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 12px; padding: 24px; text-align: center; margin: 24px 0;">
      <p style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; color: #8b5cf6; margin: 0 0 10px 0;">Verification Code</p>
      <div style="font-size: 34px; font-weight: 800; letter-spacing: 8px; color: #fbbf24; font-family: 'Courier New', Courier, monospace; display: inline-block;">${otp}</div>
      <p style="font-size: 11px; color: #64748b; margin: 10px 0 0 0;">This code is valid for 30 minutes.</p>
    </div>

    <p style="text-align: center; margin-top: 16px;">Alternatively, you can verify your email address directly by clicking the link button below.</p>
  `;

  const htmlContent = getPremiumEmailLayout(
    'Verify your Reqworks account',
    bodyHtml,
    'Verify Email Address',
    verifyUrl,
    '#8b5cf6', // Violet accent
    'If you did not register for this account, you can safely ignore this email.'
  );

  // Dispatch background email send
  dispatchEmail({
    to: email,
    subject: 'Verify your Reqworks account',
    html: htmlContent,
    serviceName: 'Verification OTP Email'
  });
};

const sendPasswordResetEmail = async (email, name, token) => {
  const resetUrl = `${process.env.CLIENT_URL || 'https://www.reqworks.in'}/reset-password/${token}`;

  // Log in dev mode only (Simulator output)
  if (process.env.NODE_ENV !== 'production') {
    console.log(`\n🔑 [PASSWORD RESET SEED LOG]`);
    console.log(`User: ${name} (${email})`);
    console.log(`Reset URL: ${resetUrl}\n`);
  }

  const bodyHtml = `
    <p>Hello <strong>${name}</strong>,</p>
    <p>We received a request to reset the password for your Reqworks account. If you did not request this, you can safely ignore this email — your password will remain secure.</p>
    <p>To choose a new password and log back in, click the button below within the next hour.</p>
  `;

  const htmlContent = getPremiumEmailLayout(
    'Reset your Reqworks password',
    bodyHtml,
    'Reset Password',
    resetUrl,
    '#f59e0b', // Amber accent
    'If you did not request a password reset, no further action is required.'
  );

  // Dispatch background email send
  dispatchEmail({
    to: email,
    subject: 'Reset your Reqworks password',
    html: htmlContent,
    serviceName: 'Password Reset Email'
  });
};

module.exports = { sendVerificationEmail, sendPasswordResetEmail, getPremiumEmailLayout };

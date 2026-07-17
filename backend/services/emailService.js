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
 * Shared HTML email layout — clean dark theme, bold single-word title, card-ready body.
 */
const getPremiumEmailLayout = (title, bodyHtml, ctaText, ctaUrl, accentColor = '#8b5cf6', footerText = '') => {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title}</title>
    </head>
    <body style="margin:0;padding:0;background-color:#060811;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#060811;padding:40px 16px;">
        <tr>
          <td align="center">
            <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">

              <!-- Gradient top bar -->
              <tr>
                <td style="height:3px;background:linear-gradient(90deg,${accentColor},#6366f1,#3b82f6);border-radius:3px 3px 0 0;"></td>
              </tr>

              <!-- Card body -->
              <tr>
                <td style="background-color:#0d0f1a;border:1px solid rgba(255,255,255,0.07);border-top:none;border-radius:0 0 16px 16px;padding:36px 32px 32px;">

                  <!-- Logo -->
                  <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
                    <tr>
                      <td align="center">
                        <span style="font-size:20px;font-weight:900;color:#ffffff;letter-spacing:-0.5px;text-decoration:none;">Reqworks<span style="color:${accentColor};">.</span></span>
                      </td>
                    </tr>
                  </table>

                  <!-- Bold single-word title -->
                  <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
                    <tr>
                      <td align="center">
                        <h1 style="font-size:42px;font-weight:900;color:#ffffff;margin:0;letter-spacing:-2px;line-height:1;">${title}</h1>
                      </td>
                    </tr>
                  </table>

                  <!-- Body content (card-based HTML injected here) -->
                  <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:4px;">
                    <tr>
                      <td style="font-size:14px;line-height:1.6;color:#94a3b8;">
                        ${bodyHtml}
                      </td>
                    </tr>
                  </table>

                  ${ctaText && ctaUrl ? `
                  <!-- CTA button -->
                  <table width="100%" cellpadding="0" cellspacing="0" style="margin:28px 0 8px;">
                    <tr>
                      <td align="center">
                        <a href="${ctaUrl}" style="display:inline-block;background:${accentColor};color:#ffffff;text-decoration:none;padding:13px 32px;border-radius:8px;font-size:14px;font-weight:700;letter-spacing:0.2px;">
                          ${ctaText} →
                        </a>
                      </td>
                    </tr>
                  </table>
                  ` : ''}

                  <!-- Divider -->
                  <table width="100%" cellpadding="0" cellspacing="0" style="margin:28px 0 20px;">
                    <tr>
                      <td style="height:1px;background:rgba(255,255,255,0.06);"></td>
                    </tr>
                  </table>

                  <!-- Footer -->
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td align="center" style="font-size:11px;color:#334155;line-height:1.6;">
                        ${footerText}<br>
                        <span style="margin-top:4px;display:inline-block;">&copy; ${new Date().getFullYear()} Reqworks. All rights reserved. &nbsp;·&nbsp; <a href="https://reqworks.in" style="color:#475569;text-decoration:none;">reqworks.in</a></span>
                      </td>
                    </tr>
                  </table>

                </td>
              </tr>

            </table>
          </td>
        </tr>
      </table>
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

module.exports = { sendVerificationEmail, sendPasswordResetEmail, getPremiumEmailLayout, dispatchEmail };

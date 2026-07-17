const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const PreviewSubmission = require('../models/PreviewSubmission');
const { getPremiumEmailLayout, dispatchEmail } = require('../services/emailService');

// Rate limiter: 5 requests per IP per hour
const previewLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: { success: false, error: 'Too many requests from this IP, please try again later.' }
});

/**
 * Fire-and-forget Telegram alert to admin channel
 */
const sendTelegramAlert = (message) => {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return;

  fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text: message, parse_mode: 'Markdown' })
  })
    .then(r => r.json())
    .then(d => { if (!d.ok) console.error('[PreviewLab] Telegram send failed:', d.description); })
    .catch(err => console.error('[PreviewLab] Telegram error:', err.message));
};

/**
 * @route   POST /api/preview-lab/submit
 * @desc    Submit full preview request
 */
router.post('/submit', previewLimiter, async (req, res) => {
  try {
    const { name, email, website, businessDescription, selectedSections, styleColors, referenceWebsite, honeypot } = req.body;

    // 1. Silent honeypot rejection (bots)
    if (honeypot) {
      return res.json({ success: true, message: 'Thanks! Your preview will be emailed within 24 hours.' });
    }

    // 2. Server-side validation
    if (!name || !name.trim()) return res.status(400).json({ success: false, error: 'Name is required.' });
    if (!email || !email.trim() || !/^\S+@\S+\.\S+$/.test(email)) return res.status(400).json({ success: false, error: 'Valid email is required.' });
    if (!businessDescription || !businessDescription.trim()) return res.status(400).json({ success: false, error: 'Business description is required.' });
    if (!selectedSections || !Array.isArray(selectedSections) || selectedSections.length === 0) return res.status(400).json({ success: false, error: 'Please select at least one website section.' });
    if (selectedSections.length > 3) return res.status(400).json({ success: false, error: 'Maximum 3 sections allowed.' });

    // No strict URL validation — website and referenceWebsite are optional freeform fields

    // 3. Save to database
    const submission = new PreviewSubmission({
      type: 'full_form',
      name: name.trim(),
      email: email.trim(),
      website: website ? website.trim() : undefined,
      businessDescription: businessDescription.trim(),
      selectedSections,
      styleColors: styleColors ? styleColors.trim() : undefined,
      referenceWebsite: referenceWebsite ? referenceWebsite.trim() : undefined
    });
    await submission.save();

    // 4. Client confirmation email — clean, visual, card-based
    try {
      const sectionBadges = selectedSections.map(s =>
        `<span style="display:inline-block;background:rgba(139,92,246,0.12);border:1px solid rgba(139,92,246,0.3);color:#a78bfa;font-size:11px;font-weight:700;padding:3px 10px;border-radius:20px;margin:3px 3px 3px 0;letter-spacing:0.4px;">${s}</span>`
      ).join('');

      const clientBodyHtml = `
        <p style="margin:0 0 24px 0;font-size:15px;color:#94a3b8;">Hi <strong style="color:#e2e8f0;">${name}</strong>,</p>

        <!-- Hero confirmation banner -->
        <div style="background:linear-gradient(135deg,rgba(139,92,246,0.15),rgba(99,102,241,0.1));border:1px solid rgba(139,92,246,0.25);border-radius:14px;padding:28px 24px;text-align:center;margin-bottom:24px;">
          <div style="font-size:32px;margin-bottom:10px;">🎨</div>
          <p style="font-size:18px;font-weight:800;color:#ffffff;margin:0 0 6px 0;letter-spacing:-0.3px;">Your preview is in the queue.</p>
          <p style="font-size:13px;color:#94a3b8;margin:0;">Expect a real visual concept in your inbox within <strong style="color:#a78bfa;">24 hours</strong>.</p>
        </div>

        <!-- Section cards grid -->
        <div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.07);border-radius:12px;padding:20px 22px;margin-bottom:20px;">
          <p style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;color:#64748b;margin:0 0 12px 0;">Sections Requested</p>
          <div>${sectionBadges}</div>
        </div>

        <!-- 3 feature cards in a row -->
        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
          <tr>
            <td width="33%" style="padding:0 5px 0 0;vertical-align:top;">
              <div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.07);border-radius:10px;padding:14px 12px;text-align:center;">
                <div style="font-size:20px;margin-bottom:6px;">📐</div>
                <p style="font-size:11px;font-weight:700;color:#e2e8f0;margin:0 0 3px 0;">High-fidelity</p>
                <p style="font-size:10px;color:#64748b;margin:0;">Desktop & mobile mockups</p>
              </div>
            </td>
            <td width="33%" style="padding:0 3px;vertical-align:top;">
              <div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.07);border-radius:10px;padding:14px 12px;text-align:center;">
                <div style="font-size:20px;margin-bottom:6px;">⚡</div>
                <p style="font-size:11px;font-weight:700;color:#e2e8f0;margin:0 0 3px 0;">24 hours</p>
                <p style="font-size:10px;color:#64748b;margin:0;">Turnaround guaranteed</p>
              </div>
            </td>
            <td width="33%" style="padding:0 0 0 5px;vertical-align:top;">
              <div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.07);border-radius:10px;padding:14px 12px;text-align:center;">
                <div style="font-size:20px;margin-bottom:6px;">💰</div>
                <p style="font-size:11px;font-weight:700;color:#e2e8f0;margin:0 0 3px 0;">Zero cost</p>
                <p style="font-size:10px;color:#64748b;margin:0;">No commitment required</p>
              </div>
            </td>
          </tr>
        </table>
      `;

      const clientHtml = getPremiumEmailLayout(
        'Confirmed.',
        clientBodyHtml,
        'Visit Reqworks',
        'https://reqworks.in',
        '#8b5cf6',
        'Sent because you submitted a Preview Lab request on reqworks.in'
      );

      dispatchEmail({ to: email.trim(), subject: 'Your preview request is confirmed — Reqworks', html: clientHtml, serviceName: 'Client Preview Confirmation' });
    } catch (emailErr) {
      console.error('[PreviewLab] Client email error:', emailErr);
    }

    // 5. Admin notification email — data-dense info card layout
    try {
      const adminEmail = process.env.ADMIN_EMAIL || 'Reqworks.tech@gmail.com';

      const adminBodyHtml = `
        <!-- Lead header banner -->
        <div style="background:linear-gradient(135deg,rgba(245,158,11,0.15),rgba(251,191,36,0.08));border:1px solid rgba(245,158,11,0.25);border-radius:12px;padding:18px 20px;margin-bottom:20px;display:flex;align-items:center;">
          <span style="font-size:28px;margin-right:14px;">🧪</span>
          <div>
            <p style="font-size:16px;font-weight:800;color:#ffffff;margin:0 0 2px 0;">New Preview Lab Lead</p>
            <p style="font-size:12px;color:#94a3b8;margin:0;">${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST</p>
          </div>
        </div>

        <!-- Contact info row -->
        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:16px;">
          <tr>
            <td width="50%" style="padding:0 6px 0 0;vertical-align:top;">
              <div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.07);border-radius:10px;padding:14px 16px;">
                <p style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1.2px;color:#64748b;margin:0 0 5px 0;">Client</p>
                <p style="font-size:14px;font-weight:700;color:#f1f5f9;margin:0;">${name}</p>
                <p style="font-size:12px;color:#8b5cf6;margin:3px 0 0 0;">${email}</p>
              </div>
            </td>
            <td width="50%" style="padding:0 0 0 6px;vertical-align:top;">
              <div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.07);border-radius:10px;padding:14px 16px;">
                <p style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1.2px;color:#64748b;margin:0 0 5px 0;">Website</p>
                <p style="font-size:13px;color:#f1f5f9;margin:0;word-break:break-all;">${website || '—'}</p>
                <p style="font-size:10px;color:#64748b;margin:3px 0 0 0;">Reference: ${referenceWebsite || '—'}</p>
              </div>
            </td>
          </tr>
        </table>

        <!-- Sections badges -->
        <div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.07);border-radius:10px;padding:14px 16px;margin-bottom:16px;">
          <p style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1.2px;color:#64748b;margin:0 0 8px 0;">Sections Selected</p>
          <div>${selectedSections.map(s => `<span style="display:inline-block;background:rgba(245,158,11,0.12);border:1px solid rgba(245,158,11,0.3);color:#fbbf24;font-size:11px;font-weight:700;padding:3px 10px;border-radius:20px;margin:2px 4px 2px 0;">${s}</span>`).join('')}</div>
        </div>

        <!-- Business description -->
        <div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.07);border-radius:10px;padding:14px 16px;margin-bottom:16px;">
          <p style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1.2px;color:#64748b;margin:0 0 6px 0;">Business Description</p>
          <p style="font-size:13px;color:#cbd5e1;margin:0;line-height:1.6;">${businessDescription.replace(/\n/g, '<br/>')}</p>
        </div>

        <!-- Style notes -->
        ${styleColors ? `
        <div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.07);border-radius:10px;padding:14px 16px;">
          <p style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1.2px;color:#64748b;margin:0 0 6px 0;">Style & Brand Notes</p>
          <p style="font-size:13px;color:#cbd5e1;margin:0;line-height:1.6;">${styleColors}</p>
        </div>` : ''}
      `;

      const adminHtml = getPremiumEmailLayout(
        'New Lead.',
        adminBodyHtml,
        'Open Dashboard',
        `${process.env.CLIENT_URL || 'https://www.reqworks.in'}/admin/dashboard`,
        '#f59e0b',
        'Reqworks Preview Lab — Admin Alert System'
      );

      dispatchEmail({ to: adminEmail, subject: `🧪 Preview Lab Lead: ${name} — Reqworks`, html: adminHtml, serviceName: 'Admin Preview Alert' });

      // 6. Telegram admin alert (fire-and-forget)
      const telegramMsg =
        `🧪 *NEW PREVIEW LAB LEAD*\n\n` +
        `*Name:* ${name}\n` +
        `*Email:* ${email}\n` +
        `*Website:* ${website || '—'}\n` +
        `*Sections:* ${selectedSections.join(', ')}\n` +
        `*Style:* ${styleColors || '—'}\n` +
        `*Ref Site:* ${referenceWebsite || '—'}\n\n` +
        `📝 *Description:*\n${businessDescription.slice(0, 200)}${businessDescription.length > 200 ? '...' : ''}\n\n` +
        `👉 [Open Dashboard](${process.env.CLIENT_URL || 'https://www.reqworks.in'}/admin/dashboard)`;

      sendTelegramAlert(telegramMsg);

      // Dev console log
      if (process.env.NODE_ENV !== 'production') {
        console.log(`\n🧪 [PREVIEW LAB SUBMISSION]\nName: ${name} | Email: ${email} | Sections: ${selectedSections.join(', ')}\n`);
      }
    } catch (adminErr) {
      console.error('[PreviewLab] Admin notification error:', adminErr);
    }

    return res.json({ success: true, message: 'Thanks! Your preview will be emailed within 24 hours.' });
  } catch (err) {
    console.error('Submit preview form error:', err);
    res.status(500).json({ success: false, error: 'Server error processing your request.' });
  }
});

/**
 * @route   POST /api/preview-lab/callback
 * @desc    Submit callback request
 */
router.post('/callback', previewLimiter, async (req, res) => {
  try {
    const { name, phone, honeypot } = req.body;
    if (honeypot) return res.json({ success: true });
    if (!name || !name.trim()) return res.status(400).json({ success: false, error: 'Name is required.' });
    if (!phone || !phone.trim()) return res.status(400).json({ success: false, error: 'Phone number is required.' });

    const submission = new PreviewSubmission({ type: 'callback', name: name.trim(), phone: phone.trim() });
    await submission.save();

    // Telegram callback alert
    sendTelegramAlert(`📞 *CALLBACK REQUEST*\n\n*Name:* ${name}\n*Phone:* ${phone}\n\n_Reply to this lead within 1 hour._`);

    return res.json({ success: true, message: 'Got it! We will call you within a few hours.' });
  } catch (err) {
    console.error('Callback form error:', err);
    res.status(500).json({ success: false, error: 'Server error.' });
  }
});

module.exports = router;

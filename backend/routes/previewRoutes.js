const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const PreviewSubmission = require('../models/PreviewSubmission');
const { getPremiumEmailLayout, dispatchEmail } = require('../services/emailService');

// Custom URL validation helper
const isUrlValid = (str) => {
  if (!str) return true;
  let target = str;
  if (!/^https?:\/\//i.test(str)) {
    target = 'http://' + str;
  }
  try {
    const url = new URL(target);
    return !!url.hostname && url.hostname.includes('.');
  } catch (e) {
    return false;
  }
};

// Rate limiter: 5 requests per IP per hour
const previewLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  message: { success: false, error: 'Too many requests from this IP, please try again later.' }
});

/**
 * @route   POST /api/preview-lab/submit
 * @desc    Submit full preview request
 */
router.post('/submit', previewLimiter, async (req, res) => {
  try {
    const { name, email, website, businessDescription, selectedSections, styleColors, referenceWebsite, honeypot } = req.body;

    // 1. Silent rejection for honeypot filled (bots)
    if (honeypot) {
      console.log(`[PreviewLab] Bot detected via honeypot field. Silently ignoring submission.`);
      return res.json({ success: true, message: 'Thanks! Your preview will be emailed within 24 hours.' });
    }

    // 2. Server-side validation
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, error: 'Name is required.' });
    }
    if (!email || !email.trim() || !/^\S+@\S+\.\S+$/.test(email)) {
      return res.status(400).json({ success: false, error: 'Valid email is required.' });
    }
    if (!businessDescription || !businessDescription.trim()) {
      return res.status(400).json({ success: false, error: 'Business description is required.' });
    }
    if (!selectedSections || !Array.isArray(selectedSections) || selectedSections.length === 0) {
      return res.status(400).json({ success: false, error: 'Please select at least one website section.' });
    }
    if (selectedSections.length > 3) {
      return res.status(400).json({ success: false, error: 'Maximum 3 sections allowed.' });
    }

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

    // 4. Client email - dispatch asynchronously in try/catch to avoid failing request on email fail
    try {
      const clientSubject = 'Reqworks Preview Lab: Request Confirmed!';
      const clientBodyHtml = `
        <p>Hi <strong>${name}</strong>,</p>
        <p>Thanks for requesting a free website preview from the Reqworks Preview Lab! We've successfully received your details and our product engineering team is already analyzing your request.</p>
        
        <div style="background-color: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 12px; padding: 24px; margin: 24px 0;">
          <h3 style="color: #8b5cf6; margin-top: 0; font-size: 16px;">What you will get:</h3>
          <ul style="padding-left: 20px; color: #cbd5e1; margin: 8px 0;">
            <li>A customized, interactive high-fidelity preview of your selected sections.</li>
            <li>Clean, responsive modern layout tailored to your style inputs.</li>
            <li>Access to inspect desktop and mobile versions.</li>
          </ul>
          <h3 style="color: #8b5cf6; margin-top: 16px; font-size: 16px;">Sections selected:</h3>
          <p style="color: #fbbf24; font-weight: bold; margin: 8px 0;">${selectedSections.join(', ')}</p>
        </div>

        <p>Your interactive preview will be ready and emailed to you within 24 hours.</p>
        <p>In the meantime, feel free to watch a short explainer video showing how we design and build premium web applications.</p>
      `;

      const clientHtmlContent = getPremiumEmailLayout(
        clientSubject,
        clientBodyHtml,
        'Watch Preview Explainer',
        'https://www.loom.com/share/placeholder-stunning-landing-page-video',
        '#8b5cf6',
        'This email was sent in response to your Reqworks Preview Lab request.'
      );

      dispatchEmail({
        to: email.trim(),
        subject: clientSubject,
        html: clientHtmlContent,
        serviceName: 'Client Preview Confirmation'
      });
    } catch (emailErr) {
      console.error('[PreviewLab] Error triggering client confirmation email:', emailErr);
    }

    // 5. Admin email notification
    try {
      const adminEmail = process.env.ADMIN_EMAIL || 'Reqworks.tech@gmail.com';
      const adminSubject = `🧪 New Preview Lab Lead: ${name}`;
      const adminBodyHtml = `
        <h2 style="color: #ffffff; margin-bottom: 20px;">New Preview Lab Submission</h2>
        <div style="background-color: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 12px; padding: 24px; color: #cbd5e1; line-height: 1.6;">
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Website:</strong> ${website || 'None'}</p>
          <p><strong>Business Description:</strong><br/>${businessDescription.replace(/\n/g, '<br/>')}</p>
          <p><strong>Selected Sections:</strong> ${selectedSections.join(', ')}</p>
          <p><strong>Style & Colors Notes:</strong><br/>${styleColors || 'None'}</p>
          <p><strong>Reference Website:</strong> ${referenceWebsite || 'None'}</p>
        </div>
      `;

      const adminHtmlContent = getPremiumEmailLayout(
        adminSubject,
        adminBodyHtml,
        'Manage Leads',
        `${process.env.CLIENT_URL || 'https://www.reqworks.in'}/admin/dashboard`,
        '#f59e0b',
        'Reqworks Lead Alert System'
      );

      dispatchEmail({
        to: adminEmail,
        subject: adminSubject,
        html: adminHtmlContent,
        serviceName: 'Admin Preview Alert'
      });

      // Log a stunning card in the console in dev mode
      if (process.env.NODE_ENV !== 'production') {
        console.log(`\n🧪 [PREVIEW LAB FULL FORM SUBMISSION] 🧪`);
        console.log(`--------------------------------------------------`);
        console.log(`Client Name: ${name}`);
        console.log(`Email:       ${email}`);
        console.log(`Website:     ${website || 'N/A'}`);
        console.log(`Sections:    ${selectedSections.join(', ')}`);
        console.log(`Style:       ${styleColors || 'N/A'}`);
        console.log(`Ref Site:    ${referenceWebsite || 'N/A'}`);
        console.log(`Description: ${businessDescription}`);
        console.log(`--------------------------------------------------\n`);
      }
    } catch (adminEmailErr) {
      console.error('[PreviewLab] Error triggering admin notification email:', adminEmailErr);
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
    const { name, phone, preferredTime, honeypot } = req.body;

    // 1. Silent rejection for honeypot filled (bots)
    if (honeypot) {
      console.log(`[PreviewLab] Bot detected via honeypot field on callback route. Silently ignoring.`);
      return res.json({ success: true, message: 'Thanks! We\'ll call you within 24 hours.' });
    }

    // 2. Server-side validation
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, error: 'Name is required.' });
    }
    if (!phone || !phone.trim()) {
      return res.status(400).json({ success: false, error: 'Phone number is required.' });
    }

    const validTimes = ['morning', 'afternoon', 'evening', null];
    if (preferredTime && !validTimes.includes(preferredTime)) {
      return res.status(400).json({ success: false, error: 'Invalid preferred time.' });
    }

    // 3. Save to database
    const submission = new PreviewSubmission({
      type: 'callback_request',
      name: name.trim(),
      phone: phone.trim(),
      preferredTime: preferredTime || null
    });

    await submission.save();

    // 4. Admin email notification (no client confirmation email is sent for callbacks)
    try {
      const adminEmail = process.env.ADMIN_EMAIL || 'Reqworks.tech@gmail.com';
      const adminSubject = `📞 New Callback Request: ${name}`;
      const adminBodyHtml = `
        <h2 style="color: #ffffff; margin-bottom: 20px;">New Callback Request</h2>
        <div style="background-color: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 12px; padding: 24px; color: #cbd5e1; line-height: 1.6;">
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Phone:</strong> ${phone}</p>
          <p><strong>Preferred Time:</strong> ${preferredTime ? preferredTime.charAt(0).toUpperCase() + preferredTime.slice(1) : 'Anytime'}</p>
        </div>
      `;

      const adminHtmlContent = getPremiumEmailLayout(
        adminSubject,
        adminBodyHtml,
        'Call Client',
        `tel:${phone}`,
        '#10b981',
        'Reqworks Callback Alert System'
      );

      dispatchEmail({
        to: adminEmail,
        subject: adminSubject,
        html: adminHtmlContent,
        serviceName: 'Admin Callback Alert'
      });

      // Log a stunning card in the console in dev mode
      if (process.env.NODE_ENV !== 'production') {
        console.log(`\n📞 [PREVIEW LAB CALLBACK REQUEST] 📞`);
        console.log(`--------------------------------------------------`);
        console.log(`Client Name:    ${name}`);
        console.log(`Phone:          ${phone}`);
        console.log(`Preferred Time: ${preferredTime || 'Anytime'}`);
        console.log(`--------------------------------------------------\n`);
      }
    } catch (adminEmailErr) {
      console.error('[PreviewLab] Error triggering admin callback notification email:', adminEmailErr);
    }

    return res.json({ success: true, message: 'Thanks! We\'ll call you within 24 hours.' });
  } catch (err) {
    console.error('Submit callback error:', err);
    res.status(500).json({ success: false, error: 'Server error processing callback request.' });
  }
});

module.exports = router;

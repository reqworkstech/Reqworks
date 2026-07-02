import React, { useEffect } from 'react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

export default function PrivacyPolicyPage() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      <Navbar />
      <main style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--t1)', padding: '120px 0 80px' }}>
        <div className="wrap" style={{ maxWidth: '800px' }}>
          <div style={{ marginBottom: '48px', borderBottom: '1px solid var(--b1)', paddingBottom: '24px' }}>
            <span className="eyebrow">Legal Info</span>
            <h1 className="h1" style={{ fontSize: 'clamp(2.5rem, 5vw, 3.5rem)', marginBottom: '16px' }}>
              Privacy <span className="grad-1">Policy</span>
            </h1>
            <p className="body-lg" style={{ color: 'var(--t2)' }}>
              Last updated: June 11, 2026. Learn how we collect, use, and protect your personal information.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', lineHeight: 1.75 }}>
            <section style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <h2 className="h3" style={{ color: 'var(--t1)', fontSize: '1.4rem' }}>1. Information We Collect</h2>
              <p className="body-md">
                We collect personal information that you voluntarily provide to us when registering on our platform,
                submitting project requirements, or communicating with us. This includes:
              </p>
              <ul style={{ listStyleType: 'disc', paddingLeft: '20px', color: 'var(--t2)', fontSize: '0.95rem', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <li>Name, email address, phone number, and occupation/role.</li>
                <li>Project descriptions, files, requirements, and comments.</li>
                <li>Billing information and transaction details when making payments.</li>
              </ul>
            </section>

            <section style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <h2 className="h3" style={{ color: 'var(--t1)', fontSize: '1.4rem' }}>2. How We Use Your Information</h2>
              <p className="body-md">
                We use the information we collect to operate, maintain, and provide the features of our queue-based
                studio platform. Specifically, we use your data to:
              </p>
              <ul style={{ listStyleType: 'disc', paddingLeft: '20px', color: 'var(--t2)', fontSize: '0.95rem', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <li>Create and manage your user account, including identity verification via OTP.</li>
                <li>Provide transparent, real-time tracking of your project in the build queue.</li>
                <li>Communicate with you regarding updates, feedback, milestones, and support.</li>
                <li>Process payments and prevent fraudulent activities.</li>
              </ul>
            </section>

            <section style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <h2 className="h3" style={{ color: 'var(--t1)', fontSize: '1.4rem' }}>3. Information Sharing and Disclosure</h2>
              <p className="body-md">
                We do not sell, trade, or rent your personal information to third parties. We may share your data with
                trusted service providers (such as hosting platforms, payment processors, and email delivery services)
                who assist us in operating our platform, so long as those parties agree to keep this information confidential.
              </p>
            </section>

            <section style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <h2 className="h3" style={{ color: 'var(--t1)', fontSize: '1.4rem' }}>4. Data Security</h2>
              <p className="body-md">
                We implement a variety of security measures to maintain the safety of your personal information.
                Your data is stored behind secured networks, passwords are encrypted using industry-standard hashing
                algorithms (bcryptjs), and communication between client and server is encrypted using Secure Socket Layer (SSL) technology.
              </p>
            </section>

            <section style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <h2 className="h3" style={{ color: 'var(--t1)', fontSize: '1.4rem' }}>5. Your Rights & Contact Information</h2>
              <p className="body-md">
                You have the right to access, correct, or request the deletion of your personal data at any time.
                If you have any questions or concerns regarding this Privacy Policy, please reach out to us at{' '}
                <a href="mailto:reqworks.tech@gmail.com" style={{ color: 'var(--a1)', textDecoration: 'underline' }}>reqworks.tech@gmail.com</a>.
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

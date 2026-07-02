import React, { useEffect } from 'react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

export default function TermsOfServicePage() {
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
              Terms of <span className="grad-1">Service</span>
            </h1>
            <p className="body-lg" style={{ color: 'var(--t2)' }}>
              Last updated: June 11, 2026. Please read these terms carefully before using our platform.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', lineHeight: 1.75 }}>
            <section style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <h2 className="h3" style={{ color: 'var(--t1)', fontSize: '1.4rem' }}>1. Agreement to Terms</h2>
              <p className="body-md">
                By accessing or using Reqworks ("Platform", "we", "us", or "our"), you agree to be bound by these
                Terms of Service. If you do not agree to all terms and conditions, then you may not access or use our services.
              </p>
            </section>

            <section style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <h2 className="h3" style={{ color: 'var(--t1)', fontSize: '1.4rem' }}>2. Account Registration and Security</h2>
              <p className="body-md">
                To access certain features of the Platform (such as project booking, payment history, and queue tracking), you must
                create an account. You agree to:
              </p>
              <ul style={{ listStyleType: 'disc', paddingLeft: '20px', color: 'var(--t2)', fontSize: '0.95rem', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <li>Provide accurate, current, and complete information during registration.</li>
                <li>Verify your account via the provided email OTP mechanism.</li>
                <li>Maintain the security of your password and accept all risks of unauthorized access.</li>
              </ul>
            </section>

            <section style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <h2 className="h3" style={{ color: 'var(--t1)', fontSize: '1.4rem' }}>3. Queue-Based Studio Model & Payments</h2>
              <p className="body-md">
                Reqworks operates under a transparent, queue-based booking structure. The timeline and delivery order
                are dictated by your position in the build queue, which is displayed publicly on the platform:
              </p>
              <ul style={{ listStyleType: 'disc', paddingLeft: '20px', color: 'var(--t2)', fontSize: '0.95rem', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <li>Estimates and timelines provided during booking are subject to queue status changes.</li>
                <li>Payments must be made in accordance with the specified billing milestones (e.g. deposit, delivery).</li>
                <li>All sales are final once project work has commenced, unless specified otherwise in your direct service agreement.</li>
              </ul>
            </section>

            <section style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <h2 className="h3" style={{ color: 'var(--t1)', fontSize: '1.4rem' }}>4. Intellectual Property</h2>
              <p className="body-md">
                Upon final delivery and full payment, all custom code, assets, and source files created for your specific project
                are transferred entirely to you. Reqworks retains the right to display project screenshots/demos in our portfolio
                unless explicitly requested otherwise by the client under a non-disclosure agreement (NDA).
              </p>
            </section>

            <section style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <h2 className="h3" style={{ color: 'var(--t1)', fontSize: '1.4rem' }}>5. Limitation of Liability</h2>
              <p className="body-md">
                To the maximum extent permitted by applicable law, Reqworks shall not be liable for any indirect, incidental,
                special, consequential, or punitive damages, including loss of profits, data, use, goodwill, or other intangible
                losses resulting from your access to or use of the services.
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

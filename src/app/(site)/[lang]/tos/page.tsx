import React from 'react';
import { getSEOTags } from '@/libs/seo';
import { renderSchemaTags } from "@/libs/seo";

export const metadata = getSEOTags({
  title: `Terms of Service | ${process.env.SITE_NAME}`,
  description: 'Learn about how Nogl handles and protects your personal information, data collection practices, and your privacy rights as our user.',
  canonicalUrlRelative: "/tos", // Changed to relative URL
});

const TermsOfServicePage = () => {
  const siteName = process.env.SITE_NAME || "Nogl";
  const siteUrl = process.env.SITE_URL || "https://www.nogl.ai";

  const schemaData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Terms of Service",
    description: "Learn about how Nogl handles and protects your personal information, data collection practices, and your privacy rights as our user.",
    dateModified: new Date().toISOString().split('T')[0],
    url: `${siteUrl}/tos`,
    publisher: {
      "@type": "Organization",
      name: siteName,
      url: siteUrl,
    }
  };

  return (
    <>
      {renderSchemaTags(schemaData)}
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-3xl font-bold mb-6">Terms of Service</h1>

        <p className="text-sm text-gray-500 mb-4">Last Updated: November 12, 2024</p>

        {/* 1. Introduction */}
        <h2 className="text-2xl font-semibold mt-8 mb-4">1. Introduction</h2>
        <p>
          Welcome to Nogl ("we," "us," "our," "Platform," or "Service"). By accessing or using our website at{' '}
          <a href="https://www.nogl.ai/" className="text-blue-600 underline">
            https://www.nogl.ai/
          </a>
          , you agree to be bound by these Terms of Service ("Terms"). If you disagree with any part of these terms, you may not access our Service.
        </p>

        {/* 2. Definitions */}
        <h2 className="text-2xl font-semibold mt-8 mb-4">2. Definitions</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            <strong>Service:</strong> The Nogl platform and website accessible at{' '}
            <a href="https://www.nogl.ai/" className="text-blue-600 underline">
              https://www.nogl.ai/
            </a>
          </li>
          <li>
            <strong>User:</strong> Any individual or entity accessing or using our Service
          </li>
          <li>
            <strong>Content:</strong> All information, data, text, graphics, or other materials uploaded, downloaded, or appearing on our Service
          </li>
        </ul>

        {/* 3. Account Registration and Security */}
        <h2 className="text-2xl font-semibold mt-8 mb-4">3. Account Registration and Security</h2>
        <p>
          When you create an account with us, you must provide accurate, complete, and current information. You are responsible for:
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Maintaining the confidentiality of your account credentials</li>
          <li>All activities that occur under your account</li>
          <li>Notifying us immediately of any unauthorized access</li>
        </ul>

        {/* 4. Recording and Content Rights */}
        <h2 className="text-2xl font-semibold mt-8 mb-4">4. Recording and Content Rights</h2>

        {/* Session Recording */}
        <h3 className="text-xl font-semibold mt-6 mb-2">Session Recording</h3>
        <ul className="list-disc pl-6 space-y-2">
          <li>All sessions conducted through our platform may be recorded</li>
          <li>By using our Service, you explicitly consent to the recording of sessions</li>
          <li>We retain full ownership and rights to all recorded content</li>
        </ul>

        {/* Intellectual Property */}
        <h3 className="text-xl font-semibold mt-6 mb-2">Intellectual Property</h3>
        <ul className="list-disc pl-6 space-y-2">
          <li>All content, features, and functionality of our Service are owned by Nogl</li>
          <li>Users may not reproduce, distribute, or create derivative works without our explicit permission</li>
        </ul>

        {/* 5. User Conduct */}
        <h2 className="text-2xl font-semibold mt-8 mb-4">5. User Conduct</h2>
        <p>You agree not to:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Use our Service for any illegal purposes</li>
          <li>Interfere with or disrupt our Service</li>
          <li>Attempt to gain unauthorized access to our systems</li>
          <li>Upload or transmit malicious code</li>
          <li>Impersonate any person or entity</li>
        </ul>

        {/* 6. Data Collection and Privacy */}
        <h2 className="text-2xl font-semibold mt-8 mb-4">6. Data Collection and Privacy</h2>
        <p>
          We collect and process your data as described in our{' '}
          <a href="/privacy-policy" className="text-blue-600 underline">
            Privacy Policy
          </a>
          , available at{' '}
          <a href="https://www.nogl.ai/privacy-policy" className="text-blue-600 underline">
            https://www.nogl.ai/privacy-policy
          </a>
          . This includes:
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Personal information (name, email, payment details)</li>
          <li>Non-personal data through cookies and similar technologies</li>
        </ul>

        {/* 7. Payment Terms */}
        <h2 className="text-2xl font-semibold mt-8 mb-4">7. Payment Terms</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li>All fees are in the displayed currency and exclusive of applicable taxes</li>
          <li>Payments are processed through secure third-party payment processors</li>
          <li>We reserve the right to modify our pricing with reasonable notice</li>
        </ul>

        {/* 8. Termination */}
        <h2 className="text-2xl font-semibold mt-8 mb-4">8. Termination</h2>
        <p>We may terminate or suspend your account and access to our Service:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Immediately for violations of these Terms</li>
          <li>With reasonable notice for any other reason</li>
          <li>At your request through proper account closure procedures</li>
        </ul>

        {/* 9. Limitation of Liability */}
        <h2 className="text-2xl font-semibold mt-8 mb-4">9. Limitation of Liability</h2>
        <p>To the maximum extent permitted by law, Nogl shall not be liable for:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Any indirect, incidental, or consequential damages</li>
          <li>Any loss or damage arising from your use of our Service</li>
          <li>Service interruptions or technical issues</li>
        </ul>

        {/* 10. Changes to Terms */}
        <h2 className="text-2xl font-semibold mt-8 mb-4">10. Changes to Terms</h2>
        <p>We reserve the right to modify these Terms at any time. We will notify you of any changes by:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Sending an email to the address associated with your account</li>
          <li>Posting a notice on our website</li>
          <li>Updating the "Last Updated" date at the top of these Terms</li>
        </ul>

        {/* 11. Governing Law */}
        <h2 className="text-2xl font-semibold mt-8 mb-4">11. Governing Law</h2>
        <p>
          These Terms shall be governed by and construed in accordance with the laws of Germany, without regard to its conflict of law provisions.
        </p>

        {/* 12. Contact Information */}
        <h2 className="text-2xl font-semibold mt-8 mb-4">12. Contact Information</h2>
        <p>For any questions about these Terms, please contact us at:</p>
        <p>
          Email:{' '}
          <a href="mailto:info@nogl.tech" className="text-blue-600 underline">
            info@nogl.tech
          </a>
        </p>

        {/* Acceptance */}
        <p className="mt-8">
          By using our Service, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.
        </p>
      </div>
    </>
  );
};

export default TermsOfServicePage;

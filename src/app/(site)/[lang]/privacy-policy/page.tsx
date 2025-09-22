import React from 'react';
import Link from 'next/link';
import { getSEOTags, renderSchemaTags } from '@/libs/seo'; // Ensure renderSchemaTags is imported

export const metadata = getSEOTags({
  title: `Privacy Policy | ${process.env.SITE_NAME}`,
  description: 'Discover how Nogl safeguards your personal information, the ways we use it, and your privacy rights in our comprehensive privacy policy.',
  canonicalUrlRelative: "/privacy-policy",
});

const PrivacyPolicyPage = () => {
  const siteName = process.env.SITE_NAME || "Nogl";
  const siteUrl = process.env.SITE_URL || "https://www.nogl.ai";
  const imageBaseUrl = process.env.NEXT_PUBLIC_IMAGE_URL || siteUrl;

  const schemaData = {
    "@context": "https://schema.org",
    "@type": "PrivacyPolicy",
    "name": "Privacy Policy",
    "description": "Discover how Nogl safeguards your personal information, the ways we use it, and your privacy rights in our comprehensive privacy policy.",
    "url": `${siteUrl}/privacy-policy`,
    "dateModified": new Date().toISOString().split('T')[0], // Dynamic date
    "publisher": {
      "@type": "Organization",
      "name": siteName,
      "url": siteUrl,
      "logo": {
        "@type": "ImageObject",
        "url": `${imageBaseUrl}/logo.png`, // Ensure this path is correct
      },
    },
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "customer support",
      "telephone": "+1-800-555-1234", // Replace with your actual support number
      "email": "support@nogl.tech", // Replace with your actual support email
    },
  };

  return (
    <>
      {renderSchemaTags(schemaData)}
      <div className="container mx-auto px-4 py-8">
        <Link href="/" className="text-blue-600 underline mb-4 inline-block">
          &larr; Back to Home
        </Link>
        
        <h1 className="text-3xl font-bold mb-6">Privacy Policy for {siteName}</h1>
        <p>Effective Date: November 12, 2024</p>
        <p>
          At {siteName} ("we," "us," or "our"), accessible from{' '}
          <Link href="/" className="text-blue-600 underline">
            {siteUrl}
          </Link>
          , we prioritize the protection of your personal information and privacy
          rights. This Privacy Policy explains our practices regarding the
          collection, use, and protection of your data.
        </p>

        {/* Information Collection and Use */}
        <h2 className="text-2xl font-semibold mt-8 mb-4">
          Information Collection and Use
        </h2>

        {/* Personal Information We Collect */}
        <h3 className="text-xl font-semibold mt-6 mb-2">
          Personal Information We Collect
        </h3>
        <ul className="list-disc pl-6">
          <li>Name and contact details</li>
          <li>Email address</li>
          <li>Payment information</li>
          <li>IP addresses and device information</li>
          <li>Usage data and interactions with our website</li>
        </ul>

        {/* How We Collect Information */}
        <h3 className="text-xl font-semibold mt-6 mb-2">
          How We Collect Information
        </h3>
        <ul className="list-disc pl-6">
          <li>Direct collection through forms and registrations</li>
          <li>Automated collection through cookies and similar technologies</li>
          <li>Third-party service providers</li>
        </ul>

        {/* Purpose of Data Collection */}
        <h3 className="text-xl font-semibold mt-6 mb-2">
          Purpose of Data Collection
        </h3>
        <ul className="list-disc pl-6">
          <li>Processing and fulfilling orders</li>
          <li>Providing customer support</li>
          <li>Improving our services and user experience</li>
          <li>Marketing communications (with your consent)</li>
          <li>Legal compliance requirements</li>
        </ul>

        {/* Data Security and Protection */}
        <h2 className="text-2xl font-semibold mt-8 mb-4">
          Data Security and Protection
        </h2>
        <p>
          We implement industry-standard security measures to protect your
          personal information, including:
        </p>
        <ul className="list-disc pl-6">
          <li>Encryption of sensitive data</li>
          <li>Secure data storage systems</li>
          <li>Access controls and authentication</li>
          <li>Regular security audits</li>
        </ul>

        {/* Your Privacy Rights */}
        <h2 className="text-2xl font-semibold mt-8 mb-4">
          Your Privacy Rights
        </h2>
        <p>You have the right to:</p>
        <ul className="list-disc pl-6">
          <li>Access your personal information</li>
          <li>Request corrections to your data</li>
          <li>Delete your information</li>
          <li>Opt-out of marketing communications</li>
          <li>Withdraw consent at any time</li>
        </ul>

        {/* Data Sharing and Third Parties */}
        <h2 className="text-2xl font-semibold mt-8 mb-4">
          Data Sharing and Third Parties
        </h2>
        <p>We may share your information with:</p>
        <ul className="list-disc pl-6">
          <li>Payment processors for transaction handling</li>
          <li>Analytics providers to improve our services</li>
          <li>Service providers who assist in our operations</li>
        </ul>
        <p>
          All third-party partners are contractually obligated to protect your
          data.
        </p>

        {/* Data Retention */}
        <h2 className="text-2xl font-semibold mt-8 mb-4">Data Retention</h2>
        <p>
          We retain your personal information only for as long as necessary to:
        </p>
        <ul className="list-disc pl-6">
          <li>Fulfill the purposes outlined in this policy</li>
          <li>Comply with legal obligations</li>
          <li>Resolve disputes</li>
          <li>Enforce our agreements</li>
        </ul>

        {/* Cookie Policy */}
        <h2 className="text-2xl font-semibold mt-8 mb-4">Cookie Policy</h2>
        <p>We use cookies to:</p>
        <ul className="list-disc pl-6">
          <li>Maintain your session</li>
          <li>Remember your preferences</li>
          <li>Analyze website usage</li>
          <li>Improve user experience</li>
        </ul>
        <p>
          You can manage cookie preferences through your browser settings.
        </p>

        {/* Children's Privacy */}
        <h2 className="text-2xl font-semibold mt-8 mb-4">Children's Privacy</h2>
        <p>
          We do not knowingly collect information from children under 13. If we
          discover we have collected children's information, we will delete it
          immediately.
        </p>

        {/* Updates to This Policy */}
        <h2 className="text-2xl font-semibold mt-8 mb-4">
          Updates to This Policy
        </h2>
        <p>
          We regularly review and update this policy to reflect changes in our
          practices and legal requirements. We will notify you of significant
          changes via email or website notice.
        </p>

        {/* Contact Information */}
        <h2 className="text-2xl font-semibold mt-8 mb-4">
          Contact Information
        </h2>
        <p>For privacy-related inquiries:</p>
        <p>Email: <Link href="mailto:info@nogl.tech" className="text-blue-600 underline">info@nogl.tech</Link></p>
        <p>Address: Hamburg, Germany</p>
        <p>Data Protection Officer: Nogl GmbH</p>
      </div>
    </>
  );
};

export default PrivacyPolicyPage;

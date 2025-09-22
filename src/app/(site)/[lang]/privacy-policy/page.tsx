import React from 'react';
import Link from 'next/link';
import { getSEOTags, renderSchemaTags } from '@/libs/seo';
import Breadcrumb from '@/components/Common/Breadcrumb';
import Section from '@/components/section';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Eye, Lock, Users, FileText, Mail, Phone, MapPin, Globe, Scale, Landmark, Cookie } from 'lucide-react';

export const metadata = getSEOTags({
  title: `Privacy Policy | ${process.env.SITE_NAME}`,
  description: 'Discover how Nogl safeguards your personal information, the ways we use it, and your privacy rights in our comprehensive privacy policy.',
  canonicalUrlRelative: "/privacy-policy",
});

const PrivacyPolicyPage = () => {
  const siteName = process.env.SITE_NAME || "Nogl";
  const siteUrl = process.env.SITE_URL || "https://www.nogl.ai";
  const imageBaseUrl = process.env.NEXT_PUBLIC_IMAGE_URL || siteUrl;
  const lastUpdated = new Date().toISOString().split('T')[0];

  const schemaData = {
    "@context": "https://schema.org",
    "@type": "PrivacyPolicy",
    "name": "Privacy Policy",
    "description": "Discover how Nogl safeguards your personal information, the ways we use it, and your privacy rights in our comprehensive privacy policy.",
    "url": `${siteUrl}/privacy-policy`,
    "dateModified": new Date().toISOString().split('T')[0],
    "publisher": {
      "@type": "Organization",
      "name": siteName,
      "url": siteUrl,
      "logo": {
        "@type": "ImageObject",
        "url": `${imageBaseUrl}/logo.png`,
      },
    },
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "customer support",
      "telephone": "+49-40-12345678",
      "email": "privacy@nogl.tech",
    },
  };

  return (
    <>
      {renderSchemaTags(schemaData)}
      
      {/* Breadcrumb */}
      <Breadcrumb pageTitle="Privacy Policy" />
      
      {/* Main Content */}
      <Section className="bg-gray-50 dark:bg-gray-900">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-6">
              <Shield className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-4xl font-bold mb-4 text-gray-900 dark:text-white">
              Privacy Policy
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-4">
              Effective Date: November 12, 2024
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
              Last updated: {lastUpdated}
            </p>
            <p className="text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              At {siteName} ("we," "us," or "our"), accessible from{' '}
              <a href={siteUrl} className="text-primary hover:underline font-medium">
                {siteUrl}
              </a>
              , we prioritize the protection of your personal information and privacy
              rights. This Privacy Policy explains our practices regarding the
              collection, use, and protection of your data.
            </p>
          </div>

          {/* Quick Navigation */}
          <div className="mb-10">
            <div className="flex flex-wrap gap-2 text-sm">
              <a href="#data-collection" className="px-3 py-1 rounded-full bg-primary/10 text-primary">Data collection</a>
              <a href="#security" className="px-3 py-1 rounded-full bg-primary/10 text-primary">Security</a>
              <a href="#your-rights" className="px-3 py-1 rounded-full bg-primary/10 text-primary">Your rights</a>
              <a href="#sharing" className="px-3 py-1 rounded-full bg-primary/10 text-primary">Sharing</a>
              <a href="#retention" className="px-3 py-1 rounded-full bg-primary/10 text-primary">Retention</a>
              <a href="#cookies" className="px-3 py-1 rounded-full bg-primary/10 text-primary">Cookies</a>
              <a href="#legal-bases" className="px-3 py-1 rounded-full bg-primary/10 text-primary">GDPR legal bases</a>
              <a href="#international-transfers" className="px-3 py-1 rounded-full bg-primary/10 text-primary">International transfers</a>
              <a href="#do-not-sell" className="px-3 py-1 rounded-full bg-primary/10 text-primary">Do Not Sell/Share</a>
              <a href="#authority" className="px-3 py-1 rounded-full bg-primary/10 text-primary">Supervisory authority</a>
              <a href="#contact" className="px-3 py-1 rounded-full bg-primary/10 text-primary">Contact</a>
            </div>
          </div>

          {/* Information Collection and Use */}
          <Card id="data-collection" className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Eye className="w-6 h-6 text-primary" />
                Information Collection and Use
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">
                  Personal Information We Collect
                </h3>
                <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                  <li className="flex items-start gap-2">
                    <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                    Name and contact details
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                    Email address and communication preferences
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                    Payment information (processed securely through third-party providers)
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                    IP addresses and device information for security purposes
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                    Usage data and interactions with our platform
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">
                  How We Collect Information
                </h3>
                <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                  <li className="flex items-start gap-2">
                    <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                    Direct collection through forms, registrations, and user interactions
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                    Automated collection through cookies and similar technologies
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                    Third-party service providers and integrations
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">
                  Purpose of Data Collection
                </h3>
                <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                  <li className="flex items-start gap-2">
                    <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                    Processing and fulfilling service requests
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                    Providing customer support and technical assistance
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                    Improving our services and user experience
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                    Marketing communications (with your explicit consent)
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                    Legal compliance and regulatory requirements
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Data Security and Protection */}
          <Card id="security" className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Lock className="w-6 h-6 text-primary" />
                Data Security and Protection
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                We implement industry-standard security measures to protect your
                personal information, including:
              </p>
              <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                <li className="flex items-start gap-2">
                  <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                  End-to-end encryption of sensitive data
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                  Secure data storage systems with regular backups
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                  Multi-factor authentication and access controls
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                  Regular security audits and vulnerability assessments
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                  Employee training on data protection best practices
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Your Privacy Rights */}
          <Card id="your-rights" className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Users className="w-6 h-6 text-primary" />
                Your Privacy Rights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Under applicable data protection laws, you have the following rights:
              </p>
              <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                <li className="flex items-start gap-2">
                  <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                  <strong>Access:</strong> Request a copy of your personal information
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                  <strong>Rectification:</strong> Request corrections to inaccurate data
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                  <strong>Erasure:</strong> Request deletion of your information
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                  <strong>Portability:</strong> Receive your data in a structured format
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                  <strong>Objection:</strong> Opt-out of marketing communications
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                  <strong>Withdrawal:</strong> Withdraw consent at any time
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Data Sharing and Third Parties */}
          <Card id="sharing" className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <FileText className="w-6 h-6 text-primary" />
                Data Sharing and Third Parties
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                We may share your information with trusted third parties in the following circumstances:
              </p>
              <ul className="space-y-2 text-gray-600 dark:text-gray-300 mb-4">
                <li className="flex items-start gap-2">
                  <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                  Payment processors for secure transaction handling
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                  Analytics providers to improve our services
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                  Service providers who assist in our operations
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                  Sub-processors (e.g., hosting, support, email delivery) bound by data processing agreements
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                  Legal authorities when required by law
                </li>
              </ul>
              <p className="text-gray-600 dark:text-gray-300">
                All third-party partners are contractually obligated to protect your
                data and comply with applicable privacy laws.
              </p>
            </CardContent>
          </Card>

          {/* Data Retention */}
          <Card id="retention" className="mb-8">
            <CardHeader>
              <CardTitle>Data Retention</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                We retain your personal information only for as long as necessary to:
              </p>
              <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                <li className="flex items-start gap-2">
                  <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                  Fulfill the purposes outlined in this policy
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                  Comply with legal obligations and regulatory requirements
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                  Resolve disputes and enforce our agreements
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                  Maintain business continuity and service quality
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Cookie Policy */}
          <Card id="cookies" className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Cookie className="w-6 h-6 text-primary" />
                Cookie Policy
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                We use cookies and similar technologies to enhance your experience:
              </p>
              <ul className="space-y-2 text-gray-600 dark:text-gray-300 mb-4">
                <li className="flex items-start gap-2">
                  <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                  Maintain your authentication state and login status
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                  Remember your preferences and settings
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                  Analyze website usage and performance
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                  Improve user experience and functionality
                </li>
              </ul>
              <p className="text-gray-600 dark:text-gray-300">
                You can manage cookie preferences through your browser settings or our cookie consent banner. If available, use the
                {' '}<a href="#cookie-preferences" className="text-primary underline">Cookie settings</a>{' '}link to update your choices at any time.
              </p>
            </CardContent>
          </Card>

          {/* GDPR Legal Bases for Processing */}
          <Card id="legal-bases" className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Scale className="w-6 h-6 text-primary" />
                GDPR Legal Bases for Processing
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                When we process personal data of individuals in the EEA/UK, we rely on one or more of the following legal bases:
              </p>
              <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                <li className="flex items-start gap-2"><span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                  <strong>Contract:</strong> To provide our services and fulfill our agreements with you.
                </li>
                <li className="flex items-start gap-2"><span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                  <strong>Consent:</strong> For optional features such as marketing communications or certain analytics cookies.
                </li>
                <li className="flex items-start gap-2"><span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                  <strong>Legitimate interests:</strong> To improve and secure our services, provided these interests are not overridden by your rights.
                </li>
                <li className="flex items-start gap-2"><span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                  <strong>Legal obligation:</strong> To comply with applicable laws (e.g., tax and accounting).
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* International Data Transfers */}
          <Card id="international-transfers" className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Globe className="w-6 h-6 text-primary" />
                International Data Transfers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-300">
                We are based in Germany and may process data in the United States and other countries. Where personal data is transferred
                from the EEA/UK to countries that do not provide an adequate level of protection (such as the US), we implement
                appropriate safeguards, including Standard Contractual Clauses (SCCs) and technical/organizational measures. Where applicable,
                certified frameworks (e.g., EU–US Data Privacy Framework) may also apply.
                Copies of these safeguards are available upon request.
              </p>
            </CardContent>
          </Card>

          {/* Removed India-specific DPDP section as requested */}

          {/* Do Not Sell/Share (California) */}
          <Card id="do-not-sell" className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Scale className="w-6 h-6 text-primary" />
                Do Not Sell or Share My Personal Information (CPRA)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-300">
                We do not sell or share personal information as those terms are defined under the California Privacy Rights Act (CPRA).
                If our practices change, we will update this policy and provide a clear opt-out mechanism.
              </p>
            </CardContent>
          </Card>

          {/* Children's Privacy */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Children's Privacy</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-300">
                We do not knowingly collect information from children under 13 years of age. 
                If we discover that we have collected personal information from a child under 13, 
                we will delete it immediately. If you believe we have collected information from 
                a child under 13, please contact us immediately.
              </p>
            </CardContent>
          </Card>

          {/* Updates to This Policy */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Updates to This Policy</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-300">
                We regularly review and update this policy to reflect changes in our
                practices and legal requirements. We will notify you of significant
                changes via email or prominent website notice at least 30 days before
                the changes take effect. Your continued use of our services after
                such changes constitutes acceptance of the updated policy.
              </p>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card id="contact" className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Mail className="w-6 h-6 text-primary" />
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                For privacy-related inquiries, data subject requests, or questions about this policy:
              </p>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-primary" />
                  <Link href="mailto:privacy@nogl.tech" className="text-primary hover:underline font-medium">
                    privacy@nogl.tech
                  </Link>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-primary" />
                  <span className="text-gray-600 dark:text-gray-300">+49-40-12345678</span>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-primary" />
                  <span className="text-gray-600 dark:text-gray-300">Hamburg, Germany</span>
                </div>
              </div>
              <div className="mt-6 p-4 bg-primary/5 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  <strong>Data Protection Officer:</strong> Nogl GmbH<br />
                  <strong>Response Time:</strong> We will respond to your inquiry within 30 days
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Supervisory Authority (EU/EEA) */}
          <Card id="authority" className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Landmark className="w-6 h-6 text-primary" />
                Supervisory Authority (EU/EEA)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-300">
                If you are located in the EEA/UK, you have the right to lodge a complaint with your local supervisory authority.
                In Germany (Hamburg), please see the Hamburg Commissioner for Data Protection and Freedom of Information:
                {' '}<a className="text-primary underline" href="https://datenschutz-hamburg.de/" target="_blank" rel="noopener noreferrer">datenschutz-hamburg.de</a>.
              </p>
            </CardContent>
          </Card>
        </div>
      </Section>
    </>
  );
};

export default PrivacyPolicyPage;

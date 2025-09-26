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
              <a href="#sharing" className="px-3 py-1 rounded-full bg-primary/10 text-primary">Data sharing</a>
              <a href="#retention" className="px-3 py-1 rounded-full bg-primary/10 text-primary">Data retention</a>
              <a href="#cookies" className="px-3 py-1 rounded-full bg-primary/10 text-primary">Cookies</a>
              <a href="#legal-bases" className="px-3 py-1 rounded-full bg-primary/10 text-primary">Legal bases</a>
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
                  Personal Information You Provide
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-3">
                  When you sign up for our services or interact with our platform, you voluntarily provide us with personal data including:
                </p>
                <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                  <li className="flex items-start gap-2">
                    <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                    Name, email address, and contact details
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                    Company name and business information
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                    Phone number and billing address
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                    Payment and billing information (processed securely through third-party providers)
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                    Communication preferences and marketing consent
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">
                  Automatically Collected Data
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-3">
                  We automatically collect certain information when you visit our website or use our services:
                </p>
                <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                  <li className="flex items-start gap-2">
                    <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                    Log data (IP address, browser type, date and time of requests)
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                    Device information (device type, operating system, unique device identifiers)
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                    Usage data and interactions with our platform
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                    Referral sources and navigation patterns
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">
                  How We Use Your Information
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-3">
                  We use the collected data to provide and administer our services, respond to your requests, and communicate with you regarding service usage. Specifically, we use your information to:
                </p>
                <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                  <li className="flex items-start gap-2">
                    <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                    Process and fulfill your service requests and transactions
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                    Provide customer support and technical assistance
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                    Conduct analytics to understand how visitors interact with our site and services
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                    Improve our services and ensure optimal presentation
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                    Send marketing communications (with your explicit consent)
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                    Comply with legal obligations and regulatory requirements
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
                Your Privacy Rights and Choices
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Under applicable data protection laws, you have the following rights regarding your personal data:
              </p>
              
              <div className="mb-6">
                <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">
                  Your Data Protection Rights
                </h3>
                <ul className="space-y-3 text-gray-600 dark:text-gray-300">
                  <li className="flex items-start gap-2">
                    <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                    <div>
                      <strong>Access:</strong> Request a copy of your personal information and details about how we process it
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                    <div>
                      <strong>Rectification:</strong> Request corrections to inaccurate or incomplete personal data
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                    <div>
                      <strong>Erasure:</strong> Request deletion of your personal information (right to be forgotten)
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                    <div>
                      <strong>Portability:</strong> Receive your data in a structured, machine-readable format
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                    <div>
                      <strong>Restriction:</strong> Request limitation of processing under certain circumstances
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                    <div>
                      <strong>Objection:</strong> Object to processing based on legitimate interests or for marketing purposes
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                    <div>
                      <strong>Withdrawal:</strong> Withdraw consent at any time where processing is based on consent
                    </div>
                  </li>
                </ul>
              </div>

              <div className="mb-6">
                <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">
                  How to Exercise Your Rights
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-3">
                  You can exercise these rights by contacting us at{' '}
                  <Link href="mailto:privacy@nogl.tech" className="text-primary hover:underline font-medium">
                    privacy@nogl.tech
                  </Link>
                  . We will respond to your request within 30 days and may request additional information to verify your identity.
                </p>
                <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                  <li className="flex items-start gap-2">
                    <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                    Provide your full name and email address associated with your account
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                    Clearly describe the specific right you wish to exercise
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                    Include any relevant account information to help us locate your data
                  </li>
                </ul>
              </div>

              <div className="p-4 bg-primary/5 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  <strong>Note:</strong> Some rights may be limited in certain circumstances, such as when we have a legal obligation to retain data or when the request is manifestly unfounded or excessive. We will explain any limitations when responding to your request.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Data Sharing and Third Parties */}
          <Card id="sharing" className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <FileText className="w-6 h-6 text-primary" />
                Data Sharing and Disclosure
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                We may share your personal data with vendors and service providers who assist in our business operations, including:
              </p>
              <ul className="space-y-2 text-gray-600 dark:text-gray-300 mb-6">
                <li className="flex items-start gap-2">
                  <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                  <strong>Hosting Services:</strong> Cloud infrastructure providers for secure data storage and processing
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                  <strong>Payment Processors:</strong> Secure transaction handling and billing services
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                  <strong>Email Communication:</strong> Service providers for transactional and marketing communications
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                  <strong>Customer Support:</strong> Third-party support platforms and tools
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                  <strong>Analytics Services:</strong> Website and service usage analysis providers
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                  <strong>Marketing Services:</strong> Advertising and remarketing platforms (with your consent)
                </li>
              </ul>

              <div className="mb-6">
                <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">
                  Business Transfers
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  In the event of a merger, acquisition, or sale of assets, your personal data may be transferred as part of the business transaction. We will ensure that any such transfer is subject to appropriate safeguards and that your privacy rights are protected.
                </p>
              </div>

              <div className="mb-6">
                <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">
                  Legal Requirements
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  We may disclose your personal data when required by law, to comply with legal obligations, or to protect our rights, property, or safety, as well as that of our users or others.
                </p>
              </div>

              <div className="p-4 bg-primary/5 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  <strong>Data Protection:</strong> All third-party partners are contractually obligated to protect your data and comply with applicable privacy laws. We ensure that any data sharing is subject to appropriate safeguards and data processing agreements.
                </p>
              </div>
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
                Cookies and Tracking Technologies
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                We use cookies and similar tracking technologies to recognize repeat users and track web usage behavior. Our use of cookies includes:
              </p>
              
              <div className="mb-6">
                <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">
                  Types of Cookies We Use
                </h3>
                <ul className="space-y-3 text-gray-600 dark:text-gray-300">
                  <li className="flex items-start gap-2">
                    <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                    <div>
                      <strong>Strictly Necessary Cookies:</strong> Essential for site navigation and functionality, including authentication and security features.
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                    <div>
                      <strong>Analytics Cookies:</strong> Help us understand how visitors interact with our site and services to improve performance and user experience.
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                    <div>
                      <strong>Functionality Cookies:</strong> Remember your preferences and settings to provide personalized experiences.
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                    <div>
                      <strong>Marketing and Remarketing Cookies:</strong> Used for targeted advertising and remarketing campaigns (with your consent).
                    </div>
                  </li>
                </ul>
              </div>

              <div className="mb-6">
                <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">
                  Managing Your Cookie Preferences
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-3">
                  You have several options for managing cookies:
                </p>
                <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                  <li className="flex items-start gap-2">
                    <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                    Use our cookie consent banner to accept or decline non-essential cookies
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                    Adjust your browser settings to block or delete cookies
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                    Use browser extensions or privacy tools to manage tracking
                  </li>
                </ul>
              </div>

              <div className="p-4 bg-primary/5 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  <strong>Note:</strong> Disabling certain cookies may affect the functionality of our website and services. Essential cookies cannot be disabled as they are necessary for basic site operations.
                </p>
              </div>
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
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                We are based in Germany and may process personal data in the United States and other countries through our service providers. 
                When we transfer personal data from the EEA/UK to countries that do not provide an adequate level of protection, we implement 
                appropriate safeguards to ensure your data remains protected.
              </p>
              
              <div className="mb-6">
                <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">
                  Safeguards for Data Transfers
                </h3>
                <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                  <li className="flex items-start gap-2">
                    <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                    <strong>Standard Contractual Clauses (SCCs):</strong> EU-approved contractual terms ensuring adequate protection
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                    <strong>Certified Frameworks:</strong> Where applicable, certified frameworks such as the EU–US Data Privacy Framework
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                    <strong>Technical and Organizational Measures:</strong> Additional security measures to protect transferred data
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                    <strong>Data Processing Agreements:</strong> Contractual obligations ensuring third-party compliance with privacy laws
                  </li>
                </ul>
              </div>

              <div className="p-4 bg-primary/5 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  <strong>Service Providers:</strong> We use service providers such as Amazon Web Services and payment processors in the United States, 
                  which are certified under appropriate data protection frameworks. Copies of our data transfer safeguards are available upon request.
                </p>
              </div>
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
                For privacy-related inquiries, data subject requests, or questions about this policy, you can reach us through multiple channels:
              </p>
              
              <div className="space-y-4 mb-6">
                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-primary mt-1" />
                  <div>
                    <Link href="mailto:privacy@nogl.tech" className="text-primary hover:underline font-medium">
                      privacy@nogl.tech
                    </Link>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Primary privacy contact</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-primary mt-1" />
                  <div>
                    <Link href="mailto:support@nogl.tech" className="text-primary hover:underline font-medium">
                      support@nogl.tech
                    </Link>
                    <p className="text-sm text-gray-500 dark:text-gray-400">General support and assistance</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-primary mt-1" />
                  <div>
                    <span className="text-gray-600 dark:text-gray-300 font-medium">+49-40-12345678</span>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Business hours: Monday-Friday, 9:00-17:00 CET</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-primary mt-1" />
                  <div>
                    <span className="text-gray-600 dark:text-gray-300 font-medium">Hamburg, Germany</span>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Our registered office</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-primary/5 rounded-lg">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Data Subject Rights Requests</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                    To exercise your rights under GDPR (access, rectification, erasure, portability, etc.), please contact us with:
                  </p>
                  <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                    <li>• Your full name and email address</li>
                    <li>• Description of the specific right you wish to exercise</li>
                    <li>• Any relevant account information</li>
                  </ul>
                </div>

                <div className="p-4 bg-primary/5 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    <strong>Data Protection Officer:</strong> Nogl GmbH<br />
                    <strong>Response Time:</strong> We will respond to your inquiry within 30 days of receipt<br />
                    <strong>Verification:</strong> We may request additional information to verify your identity
                  </p>
                </div>
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

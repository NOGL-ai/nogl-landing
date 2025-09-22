import React from 'react';
import { getSEOTags, renderSchemaTags } from '@/libs/seo';
import Breadcrumb from '@/components/Common/Breadcrumb';
import Section from '@/components/section';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Shield, User, CreditCard, Ban, Scale, Landmark, Mail, Link as LinkIcon, Globe } from 'lucide-react';

export const metadata = getSEOTags({
  title: `Terms of Service | ${process.env.SITE_NAME}`,
  description: 'Terms governing use of the service, user obligations, content rights, liability, and contact.',
  canonicalUrlRelative: "/tos",
});

const TermsOfServicePage = () => {
  const siteName = process.env.SITE_NAME || "Nogl";
  const siteUrl = process.env.SITE_URL || "https://www.nogl.ai";
  const lastUpdated = new Date().toISOString().split('T')[0];

  const schemaData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Terms of Service",
    description: "Terms governing use of the service, user obligations, content rights, liability, and contact.",
    dateModified: lastUpdated,
    url: `${siteUrl}/tos`,
    publisher: {
      "@type": "Organization",
      name: siteName,
      url: siteUrl,
    }
  } as const;

  return (
    <>
      {renderSchemaTags(schemaData)}

      <Breadcrumb pageTitle="Terms of Service" />

      <Section className="bg-gray-50 dark:bg-gray-900">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-6">
              <FileText className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-4xl font-bold mb-3">Terms of Service</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Last updated: {lastUpdated}</p>
          </div>

          {/* Quick Navigation */}
          <div className="mb-10">
            <div className="flex flex-wrap gap-2 text-sm">
              <a href="#introduction" className="px-3 py-1 rounded-full bg-primary/10 text-primary">Introduction</a>
              <a href="#definitions" className="px-3 py-1 rounded-full bg-primary/10 text-primary">Definitions</a>
              <a href="#account" className="px-3 py-1 rounded-full bg-primary/10 text-primary">Accounts</a>
              <a href="#content" className="px-3 py-1 rounded-full bg-primary/10 text-primary">Content & IP</a>
              <a href="#conduct" className="px-3 py-1 rounded-full bg-primary/10 text-primary">Conduct</a>
              <a href="#privacy" className="px-3 py-1 rounded-full bg-primary/10 text-primary">Privacy</a>
              <a href="#payments" className="px-3 py-1 rounded-full bg-primary/10 text-primary">Payments</a>
              <a href="#termination" className="px-3 py-1 rounded-full bg-primary/10 text-primary">Termination</a>
              <a href="#liability" className="px-3 py-1 rounded-full bg-primary/10 text-primary">Liability</a>
              <a href="#changes" className="px-3 py-1 rounded-full bg-primary/10 text-primary">Changes</a>
              <a href="#law" className="px-3 py-1 rounded-full bg-primary/10 text-primary">Governing law</a>
              <a href="#contact" className="px-3 py-1 rounded-full bg-primary/10 text-primary">Contact</a>
            </div>
          </div>

          {/* 1. Introduction */}
          <Card id="introduction" className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Shield className="w-6 h-6 text-primary" />
                1. Introduction
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-300">
                Welcome to {siteName} ("we," "us," "our"). By accessing or using our website at{' '}
                <a href={siteUrl} className="text-primary underline">{siteUrl}</a>, you agree to these Terms of Service ("Terms"). If you do not agree,
                do not access or use the Service.
              </p>
            </CardContent>
          </Card>

          {/* 2. Definitions */}
          <Card id="definitions" className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Globe className="w-6 h-6 text-primary" />
                2. Definitions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                <li className="flex items-start gap-2"><span className="w-2 h-2 bg-primary rounded-full mt-2"></span>
                  <strong>Service:</strong> The {siteName} platform and website.
                </li>
                <li className="flex items-start gap-2"><span className="w-2 h-2 bg-primary rounded-full mt-2"></span>
                  <strong>User:</strong> Any individual or entity using the Service.
                </li>
                <li className="flex items-start gap-2"><span className="w-2 h-2 bg-primary rounded-full mt-2"></span>
                  <strong>Content:</strong> Information, data, text, graphics, or materials on the Service.
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* 3. Account Registration and Security */}
          <Card id="account" className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <User className="w-6 h-6 text-primary" />
                3. Account Registration and Security
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-300 mb-3">You agree to:</p>
              <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                <li className="flex items-start gap-2"><span className="w-2 h-2 bg-primary rounded-full mt-2"></span>Provide accurate and current information</li>
                <li className="flex items-start gap-2"><span className="w-2 h-2 bg-primary rounded-full mt-2"></span>Maintain the confidentiality of your credentials</li>
                <li className="flex items-start gap-2"><span className="w-2 h-2 bg-primary rounded-full mt-2"></span>Notify us of unauthorized access immediately</li>
              </ul>
            </CardContent>
          </Card>

          {/* 4. Content and Intellectual Property */}
          <Card id="content" className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <FileText className="w-6 h-6 text-primary" />
                4. Content and Intellectual Property
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                We do not record calls or similar communications. If we introduce recording features in the future,
                we will provide prominent notice and obtain required consent before any recording occurs.
              </p>
              <h3 className="text-lg font-semibold mb-2">Intellectual Property</h3>
              <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                <li className="flex items-start gap-2"><span className="w-2 h-2 bg-primary rounded-full mt-2"></span>All content, features, and functionality are owned by {siteName}</li>
                <li className="flex items-start gap-2"><span className="w-2 h-2 bg-primary rounded-full mt-2"></span>No reproduction or derivative works without permission</li>
              </ul>
            </CardContent>
          </Card>

          {/* 5. User Conduct */}
          <Card id="conduct" className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Shield className="w-6 h-6 text-primary" />
                5. User Conduct
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-300 mb-3">You agree not to:</p>
              <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                <li className="flex items-start gap-2"><span className="w-2 h-2 bg-primary rounded-full mt-2"></span>Use the Service for illegal purposes</li>
                <li className="flex items-start gap-2"><span className="w-2 h-2 bg-primary rounded-full mt-2"></span>Interfere with or disrupt the Service</li>
                <li className="flex items-start gap-2"><span className="w-2 h-2 bg-primary rounded-full mt-2"></span>Attempt unauthorized access</li>
                <li className="flex items-start gap-2"><span className="w-2 h-2 bg-primary rounded-full mt-2"></span>Upload or transmit malicious code</li>
                <li className="flex items-start gap-2"><span className="w-2 h-2 bg-primary rounded-full mt-2"></span>Impersonate any person or entity</li>
              </ul>
            </CardContent>
          </Card>

          {/* 6. Data Collection and Privacy */}
          <Card id="privacy" className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <LinkIcon className="w-6 h-6 text-primary" />
                6. Data Collection and Privacy
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-300">
                We collect and process your data as described in our <a href="privacy-policy" className="text-primary underline">Privacy Policy</a>.
              </p>
            </CardContent>
          </Card>

          {/* 7. Payment Terms */}
          <Card id="payments" className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <CreditCard className="w-6 h-6 text-primary" />
                7. Payment Terms
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                <li className="flex items-start gap-2"><span className="w-2 h-2 bg-primary rounded-full mt-2"></span>Fees exclude applicable taxes</li>
                <li className="flex items-start gap-2"><span className="w-2 h-2 bg-primary rounded-full mt-2"></span>Payments are handled by secure third-party processors</li>
                <li className="flex items-start gap-2"><span className="w-2 h-2 bg-primary rounded-full mt-2"></span>Pricing may change with reasonable notice</li>
              </ul>
            </CardContent>
          </Card>

          {/* 8. Termination */}
          <Card id="termination" className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Ban className="w-6 h-6 text-primary" />
                8. Termination
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-300 mb-3">We may terminate or suspend your account:</p>
              <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                <li className="flex items-start gap-2"><span className="w-2 h-2 bg-primary rounded-full mt-2"></span>Immediately for violations of these Terms</li>
                <li className="flex items-start gap-2"><span className="w-2 h-2 bg-primary rounded-full mt-2"></span>With reasonable notice for other reasons</li>
                <li className="flex items-start gap-2"><span className="w-2 h-2 bg-primary rounded-full mt-2"></span>At your request, following account closure procedures</li>
              </ul>
            </CardContent>
          </Card>

          {/* 9. Limitation of Liability */}
          <Card id="liability" className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Scale className="w-6 h-6 text-primary" />
                9. Limitation of Liability
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-300">To the maximum extent permitted by law, {siteName} is not liable for indirect, incidental, or consequential damages, losses arising from use of the Service, or interruptions and technical issues.</p>
            </CardContent>
          </Card>

          {/* 10. Changes to Terms */}
          <Card id="changes" className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <FileText className="w-6 h-6 text-primary" />
                10. Changes to Terms
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                <li className="flex items-start gap-2"><span className="w-2 h-2 bg-primary rounded-full mt-2"></span>We may modify these Terms at any time</li>
                <li className="flex items-start gap-2"><span className="w-2 h-2 bg-primary rounded-full mt-2"></span>We will notify you by email and/or prominent site notice</li>
                <li className="flex items-start gap-2"><span className="w-2 h-2 bg-primary rounded-full mt-2"></span>We will update the Last updated date above</li>
              </ul>
            </CardContent>
          </Card>

          {/* 11. Governing Law */}
          <Card id="law" className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Landmark className="w-6 h-6 text-primary" />
                11. Governing Law
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-300">These Terms are governed by the laws of Germany, excluding conflict of law principles.</p>
            </CardContent>
          </Card>

          {/* 12. Contact Information */}
          <Card id="contact" className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Mail className="w-6 h-6 text-primary" />
                12. Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-300 mb-3">Questions about these Terms:</p>
              <a href="mailto:privacy@nogl.tech" className="text-primary underline">privacy@nogl.tech</a>
            </CardContent>
          </Card>

          {/* Acceptance */}
          <p className="mt-8 text-gray-600 dark:text-gray-300 text-center">
            By using our Service, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.
          </p>
        </div>
      </Section>
    </>
  );
};

export default TermsOfServicePage;

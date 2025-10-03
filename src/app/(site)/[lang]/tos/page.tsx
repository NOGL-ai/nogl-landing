import React from "react";
import { getSEOTags, renderSchemaTags } from "@/lib/seo";
import Breadcrumb from "@/components/Common/Breadcrumb";
import Section from "@/components/section";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	FileText,
	Shield,
	User,
	CreditCard,
	Ban,
	Scale,
	Landmark,
	Mail,
	Link as LinkIcon,
	Globe,
	AlertTriangle,
	Clock,
	Building,
	Phone,
	MapPin,
} from "lucide-react";

export const metadata = getSEOTags({
	title: `Terms of Service | ${process.env.SITE_NAME}`,
	description:
		"Terms governing use of the service, user obligations, content rights, liability, and contact.",
	canonicalUrlRelative: "/tos",
});

const TermsOfServicePage = () => {
	const siteName = process.env.SITE_NAME || "Nogl";
	const siteUrl = process.env.SITE_URL || "https://www.nogl.ai";
	const lastUpdated = new Date().toISOString().split("T")[0];

	const schemaData = {
		"@context": "https://schema.org",
		"@type": "WebPage",
		name: "Terms of Service",
		description:
			"Terms governing use of the service, user obligations, content rights, liability, and contact.",
		dateModified: lastUpdated,
		url: `${siteUrl}/tos`,
		publisher: {
			"@type": "Organization",
			name: siteName,
			url: siteUrl,
		},
	} as const;

	return (
		<>
			{renderSchemaTags(schemaData)}

			<Breadcrumb pageTitle='Terms of Service' />

			<Section className='bg-gray-50 dark:bg-gray-900'>
				<div className='mx-auto max-w-4xl'>
					<div className='mb-12 text-center'>
						<div className='bg-primary/10 mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full'>
							<FileText className='text-primary h-8 w-8' />
						</div>
						<h1 className='mb-3 text-4xl font-bold'>Terms of Service</h1>
						<p className='text-sm text-gray-500 dark:text-gray-400'>
							Last updated: {lastUpdated}
						</p>
					</div>

					{/* Quick Navigation */}
					<div className='mb-10'>
						<div className='flex flex-wrap gap-2 text-sm'>
							<a
								href='#introduction'
								className='bg-primary/10 text-primary rounded-full px-3 py-1'
							>
								Introduction
							</a>
							<a
								href='#definitions'
								className='bg-primary/10 text-primary rounded-full px-3 py-1'
							>
								Definitions
							</a>
							<a
								href='#services'
								className='bg-primary/10 text-primary rounded-full px-3 py-1'
							>
								Services
							</a>
							<a
								href='#account'
								className='bg-primary/10 text-primary rounded-full px-3 py-1'
							>
								Account
							</a>
							<a
								href='#content'
								className='bg-primary/10 text-primary rounded-full px-3 py-1'
							>
								Content & IP
							</a>
							<a
								href='#conduct'
								className='bg-primary/10 text-primary rounded-full px-3 py-1'
							>
								User Conduct
							</a>
							<a
								href='#payments'
								className='bg-primary/10 text-primary rounded-full px-3 py-1'
							>
								Payments
							</a>
							<a
								href='#privacy'
								className='bg-primary/10 text-primary rounded-full px-3 py-1'
							>
								Privacy
							</a>
							<a
								href='#termination'
								className='bg-primary/10 text-primary rounded-full px-3 py-1'
							>
								Termination
							</a>
							<a
								href='#liability'
								className='bg-primary/10 text-primary rounded-full px-3 py-1'
							>
								Liability
							</a>
							<a
								href='#indemnification'
								className='bg-primary/10 text-primary rounded-full px-3 py-1'
							>
								Indemnification
							</a>
							<a
								href='#disputes'
								className='bg-primary/10 text-primary rounded-full px-3 py-1'
							>
								Disputes
							</a>
							<a
								href='#changes'
								className='bg-primary/10 text-primary rounded-full px-3 py-1'
							>
								Changes
							</a>
							<a
								href='#law'
								className='bg-primary/10 text-primary rounded-full px-3 py-1'
							>
								Governing Law
							</a>
							<a
								href='#contact'
								className='bg-primary/10 text-primary rounded-full px-3 py-1'
							>
								Contact
							</a>
						</div>
					</div>

					{/* 1. Introduction */}
					<Card id='introduction' className='mb-8'>
						<CardHeader>
							<CardTitle className='flex items-center gap-3'>
								<Shield className='text-primary h-6 w-6' />
								1. Introduction
							</CardTitle>
						</CardHeader>
						<CardContent>
							<p className='mb-4 text-gray-600 dark:text-gray-300'>
								Welcome to {siteName} ("we," "us," "our," or "Company"). These
								Terms of Service ("Terms") govern your use of our website
								located at{" "}
								<a href={siteUrl} className='text-primary underline'>
									{siteUrl}
								</a>{" "}
								and our related services, applications, and tools (collectively,
								the "Service").
							</p>
							<p className='mb-4 text-gray-600 dark:text-gray-300'>
								By accessing, browsing, or using our Service, you acknowledge
								that you have read, understood, and agree to be bound by these
								Terms and our Privacy Policy. If you do not agree to these
								Terms, you may not access or use the Service.
							</p>
							<div className='bg-primary/5 rounded-lg p-4'>
								<p className='text-sm text-gray-600 dark:text-gray-300'>
									<strong>Company Information:</strong> {siteName} is a company
									registered in Hamburg, Germany. Our registered address and
									contact information are provided in the Contact section below.
								</p>
							</div>
						</CardContent>
					</Card>

					{/* 2. Definitions */}
					<Card id='definitions' className='mb-8'>
						<CardHeader>
							<CardTitle className='flex items-center gap-3'>
								<Globe className='text-primary h-6 w-6' />
								2. Definitions
							</CardTitle>
						</CardHeader>
						<CardContent>
							<p className='mb-4 text-gray-600 dark:text-gray-300'>
								For the purposes of these Terms, the following definitions
								apply:
							</p>
							<ul className='space-y-3 text-gray-600 dark:text-gray-300'>
								<li className='flex items-start gap-2'>
									<span className='bg-primary mt-2 h-2 w-2 flex-shrink-0 rounded-full'></span>
									<div>
										<strong>"Service" or "Services":</strong> The {siteName}{" "}
										platform, website, applications, tools, and all related
										services provided by us.
									</div>
								</li>
								<li className='flex items-start gap-2'>
									<span className='bg-primary mt-2 h-2 w-2 flex-shrink-0 rounded-full'></span>
									<div>
										<strong>"User," "You," or "Your":</strong> Any individual,
										entity, or organization that accesses or uses the Service.
									</div>
								</li>
								<li className='flex items-start gap-2'>
									<span className='bg-primary mt-2 h-2 w-2 flex-shrink-0 rounded-full'></span>
									<div>
										<strong>"Content":</strong> All information, data, text,
										graphics, images, audio, video, software, and other
										materials available through the Service.
									</div>
								</li>
								<li className='flex items-start gap-2'>
									<span className='bg-primary mt-2 h-2 w-2 flex-shrink-0 rounded-full'></span>
									<div>
										<strong>"User Content":</strong> Any content that you
										submit, upload, post, or otherwise make available through
										the Service.
									</div>
								</li>
								<li className='flex items-start gap-2'>
									<span className='bg-primary mt-2 h-2 w-2 flex-shrink-0 rounded-full'></span>
									<div>
										<strong>"Account":</strong> Your user account with us that
										allows you to access and use certain features of the
										Service.
									</div>
								</li>
								<li className='flex items-start gap-2'>
									<span className='bg-primary mt-2 h-2 w-2 flex-shrink-0 rounded-full'></span>
									<div>
										<strong>"Subscription":</strong> A paid plan or service tier
										that provides access to premium features of the Service.
									</div>
								</li>
							</ul>
						</CardContent>
					</Card>

					{/* 3. Description of Services */}
					<Card id='services' className='mb-8'>
						<CardHeader>
							<CardTitle className='flex items-center gap-3'>
								<FileText className='text-primary h-6 w-6' />
								3. Description of Services
							</CardTitle>
						</CardHeader>
						<CardContent>
							<p className='mb-4 text-gray-600 dark:text-gray-300'>
								{siteName} provides a comprehensive platform and related
								services. Our Service includes:
							</p>
							<ul className='mb-4 space-y-2 text-gray-600 dark:text-gray-300'>
								<li className='flex items-start gap-2'>
									<span className='bg-primary mt-2 h-2 w-2 flex-shrink-0 rounded-full'></span>
									Access to our web-based platform and applications
								</li>
								<li className='flex items-start gap-2'>
									<span className='bg-primary mt-2 h-2 w-2 flex-shrink-0 rounded-full'></span>
									Customer support and technical assistance
								</li>
								<li className='flex items-start gap-2'>
									<span className='bg-primary mt-2 h-2 w-2 flex-shrink-0 rounded-full'></span>
									Regular updates and improvements to the Service
								</li>
								<li className='flex items-start gap-2'>
									<span className='bg-primary mt-2 h-2 w-2 flex-shrink-0 rounded-full'></span>
									Documentation and training materials
								</li>
							</ul>
							<div className='bg-primary/5 rounded-lg p-4'>
								<p className='text-sm text-gray-600 dark:text-gray-300'>
									<strong>Service Availability:</strong> We strive to maintain
									high service availability but do not guarantee uninterrupted
									access. We may perform maintenance, updates, or modifications
									that temporarily affect service availability.
								</p>
							</div>
						</CardContent>
					</Card>

					{/* 4. Account Registration and Security */}
					<Card id='account' className='mb-8'>
						<CardHeader>
							<CardTitle className='flex items-center gap-3'>
								<User className='text-primary h-6 w-6' />
								4. Account Registration and Security
							</CardTitle>
						</CardHeader>
						<CardContent>
							<div className='mb-6'>
								<h3 className='mb-3 text-xl font-semibold text-gray-900 dark:text-white'>
									Account Registration
								</h3>
								<p className='mb-3 text-gray-600 dark:text-gray-300'>
									To access certain features of the Service, you may need to
									create an account. When registering, you agree to:
								</p>
								<ul className='space-y-2 text-gray-600 dark:text-gray-300'>
									<li className='flex items-start gap-2'>
										<span className='bg-primary mt-2 h-2 w-2 flex-shrink-0 rounded-full'></span>
										Provide accurate, current, and complete information
									</li>
									<li className='flex items-start gap-2'>
										<span className='bg-primary mt-2 h-2 w-2 flex-shrink-0 rounded-full'></span>
										Maintain and promptly update your account information
									</li>
									<li className='flex items-start gap-2'>
										<span className='bg-primary mt-2 h-2 w-2 flex-shrink-0 rounded-full'></span>
										Ensure you are at least 18 years old or have parental
										consent
									</li>
								</ul>
							</div>

							<div className='mb-6'>
								<h3 className='mb-3 text-xl font-semibold text-gray-900 dark:text-white'>
									Account Security
								</h3>
								<p className='mb-3 text-gray-600 dark:text-gray-300'>
									You are responsible for maintaining the security of your
									account:
								</p>
								<ul className='space-y-2 text-gray-600 dark:text-gray-300'>
									<li className='flex items-start gap-2'>
										<span className='bg-primary mt-2 h-2 w-2 flex-shrink-0 rounded-full'></span>
										Keep your login credentials confidential and secure
									</li>
									<li className='flex items-start gap-2'>
										<span className='bg-primary mt-2 h-2 w-2 flex-shrink-0 rounded-full'></span>
										Notify us immediately of any unauthorized access or security
										breach
									</li>
									<li className='flex items-start gap-2'>
										<span className='bg-primary mt-2 h-2 w-2 flex-shrink-0 rounded-full'></span>
										Use strong passwords and enable two-factor authentication
										when available
									</li>
								</ul>
							</div>

							<div className='bg-primary/5 rounded-lg p-4'>
								<p className='text-sm text-gray-600 dark:text-gray-300'>
									<strong>Account Responsibility:</strong> You are responsible
									for all activities that occur under your account. We are not
									liable for any loss or damage arising from unauthorized use of
									your account.
								</p>
							</div>
						</CardContent>
					</Card>

					{/* 5. Content and Intellectual Property */}
					<Card id='content' className='mb-8'>
						<CardHeader>
							<CardTitle className='flex items-center gap-3'>
								<FileText className='text-primary h-6 w-6' />
								5. Content and Intellectual Property
							</CardTitle>
						</CardHeader>
						<CardContent>
							<div className='mb-6'>
								<h3 className='mb-3 text-xl font-semibold text-gray-900 dark:text-white'>
									Our Intellectual Property
								</h3>
								<p className='mb-3 text-gray-600 dark:text-gray-300'>
									The Service and its original content, features, and
									functionality are owned by {siteName} and are protected by
									international copyright, trademark, patent, trade secret, and
									other intellectual property laws.
								</p>
								<ul className='space-y-2 text-gray-600 dark:text-gray-300'>
									<li className='flex items-start gap-2'>
										<span className='bg-primary mt-2 h-2 w-2 flex-shrink-0 rounded-full'></span>
										All text, graphics, user interfaces, visual interfaces,
										photographs, trademarks, logos, sounds, music, artwork, and
										computer code
									</li>
									<li className='flex items-start gap-2'>
										<span className='bg-primary mt-2 h-2 w-2 flex-shrink-0 rounded-full'></span>
										The design, structure, selection, coordination, expression,
										"look and feel," and arrangement of such content
									</li>
									<li className='flex items-start gap-2'>
										<span className='bg-primary mt-2 h-2 w-2 flex-shrink-0 rounded-full'></span>
										All software, algorithms, and technology underlying the
										Service
									</li>
								</ul>
							</div>

							<div className='mb-6'>
								<h3 className='mb-3 text-xl font-semibold text-gray-900 dark:text-white'>
									License Grant
								</h3>
								<p className='mb-3 text-gray-600 dark:text-gray-300'>
									Subject to your compliance with these Terms, we grant you a
									limited, non-exclusive, non-transferable, revocable license to
									access and use the Service for your personal or internal
									business purposes.
								</p>
								<p className='mb-3 text-gray-600 dark:text-gray-300'>
									This license does not include any right to:
								</p>
								<ul className='space-y-2 text-gray-600 dark:text-gray-300'>
									<li className='flex items-start gap-2'>
										<span className='bg-primary mt-2 h-2 w-2 flex-shrink-0 rounded-full'></span>
										Sell, resell, or commercially use the Service
									</li>
									<li className='flex items-start gap-2'>
										<span className='bg-primary mt-2 h-2 w-2 flex-shrink-0 rounded-full'></span>
										Distribute, modify, or create derivative works
									</li>
									<li className='flex items-start gap-2'>
										<span className='bg-primary mt-2 h-2 w-2 flex-shrink-0 rounded-full'></span>
										Reverse engineer, decompile, or disassemble the Service
									</li>
								</ul>
							</div>

							<div className='mb-6'>
								<h3 className='mb-3 text-xl font-semibold text-gray-900 dark:text-white'>
									User Content
								</h3>
								<p className='mb-3 text-gray-600 dark:text-gray-300'>
									You retain ownership of any content you submit, upload, or
									post to the Service ("User Content"). By submitting User
									Content, you grant us a worldwide, non-exclusive, royalty-free
									license to use, reproduce, modify, and distribute your User
									Content in connection with the Service.
								</p>
								<p className='mb-3 text-gray-600 dark:text-gray-300'>
									You represent and warrant that your User Content:
								</p>
								<ul className='space-y-2 text-gray-600 dark:text-gray-300'>
									<li className='flex items-start gap-2'>
										<span className='bg-primary mt-2 h-2 w-2 flex-shrink-0 rounded-full'></span>
										Does not infringe any third-party rights
									</li>
									<li className='flex items-start gap-2'>
										<span className='bg-primary mt-2 h-2 w-2 flex-shrink-0 rounded-full'></span>
										Is not illegal, harmful, or violates these Terms
									</li>
									<li className='flex items-start gap-2'>
										<span className='bg-primary mt-2 h-2 w-2 flex-shrink-0 rounded-full'></span>
										Does not contain malicious code or viruses
									</li>
								</ul>
							</div>

							<div className='bg-primary/5 rounded-lg p-4'>
								<p className='text-sm text-gray-600 dark:text-gray-300'>
									<strong>Recording Notice:</strong> We do not record calls or
									similar communications. If we introduce recording features in
									the future, we will provide prominent notice and obtain
									required consent before any recording occurs.
								</p>
							</div>
						</CardContent>
					</Card>

					{/* 6. User Conduct and Acceptable Use */}
					<Card id='conduct' className='mb-8'>
						<CardHeader>
							<CardTitle className='flex items-center gap-3'>
								<Shield className='text-primary h-6 w-6' />
								6. User Conduct and Acceptable Use
							</CardTitle>
						</CardHeader>
						<CardContent>
							<div className='mb-6'>
								<h3 className='mb-3 text-xl font-semibold text-gray-900 dark:text-white'>
									Acceptable Use
								</h3>
								<p className='mb-3 text-gray-600 dark:text-gray-300'>
									You agree to use the Service only for lawful purposes and in
									accordance with these Terms. You agree not to:
								</p>
								<ul className='space-y-2 text-gray-600 dark:text-gray-300'>
									<li className='flex items-start gap-2'>
										<span className='bg-primary mt-2 h-2 w-2 flex-shrink-0 rounded-full'></span>
										Use the Service for any illegal or unauthorized purpose
									</li>
									<li className='flex items-start gap-2'>
										<span className='bg-primary mt-2 h-2 w-2 flex-shrink-0 rounded-full'></span>
										Violate any applicable laws or regulations
									</li>
									<li className='flex items-start gap-2'>
										<span className='bg-primary mt-2 h-2 w-2 flex-shrink-0 rounded-full'></span>
										Interfere with or disrupt the Service or servers
									</li>
									<li className='flex items-start gap-2'>
										<span className='bg-primary mt-2 h-2 w-2 flex-shrink-0 rounded-full'></span>
										Attempt to gain unauthorized access to any part of the
										Service
									</li>
									<li className='flex items-start gap-2'>
										<span className='bg-primary mt-2 h-2 w-2 flex-shrink-0 rounded-full'></span>
										Upload, transmit, or distribute malicious code, viruses, or
										harmful content
									</li>
									<li className='flex items-start gap-2'>
										<span className='bg-primary mt-2 h-2 w-2 flex-shrink-0 rounded-full'></span>
										Impersonate any person or entity or misrepresent your
										affiliation
									</li>
									<li className='flex items-start gap-2'>
										<span className='bg-primary mt-2 h-2 w-2 flex-shrink-0 rounded-full'></span>
										Harass, abuse, or harm other users
									</li>
									<li className='flex items-start gap-2'>
										<span className='bg-primary mt-2 h-2 w-2 flex-shrink-0 rounded-full'></span>
										Collect or harvest user information without consent
									</li>
								</ul>
							</div>

							<div className='mb-6'>
								<h3 className='mb-3 text-xl font-semibold text-gray-900 dark:text-white'>
									Prohibited Content
								</h3>
								<p className='mb-3 text-gray-600 dark:text-gray-300'>
									You may not submit, upload, or transmit any content that:
								</p>
								<ul className='space-y-2 text-gray-600 dark:text-gray-300'>
									<li className='flex items-start gap-2'>
										<span className='bg-primary mt-2 h-2 w-2 flex-shrink-0 rounded-full'></span>
										Is defamatory, libelous, or threatening
									</li>
									<li className='flex items-start gap-2'>
										<span className='bg-primary mt-2 h-2 w-2 flex-shrink-0 rounded-full'></span>
										Contains hate speech or promotes discrimination
									</li>
									<li className='flex items-start gap-2'>
										<span className='bg-primary mt-2 h-2 w-2 flex-shrink-0 rounded-full'></span>
										Is sexually explicit or inappropriate
									</li>
									<li className='flex items-start gap-2'>
										<span className='bg-primary mt-2 h-2 w-2 flex-shrink-0 rounded-full'></span>
										Infringes intellectual property rights
									</li>
									<li className='flex items-start gap-2'>
										<span className='bg-primary mt-2 h-2 w-2 flex-shrink-0 rounded-full'></span>
										Contains personal information of others without consent
									</li>
								</ul>
							</div>

							<div className='bg-primary/5 rounded-lg p-4'>
								<p className='text-sm text-gray-600 dark:text-gray-300'>
									<strong>Enforcement:</strong> We reserve the right to
									investigate and take appropriate legal action against anyone
									who violates these Terms, including removing content,
									terminating accounts, and reporting violations to law
									enforcement.
								</p>
							</div>
						</CardContent>
					</Card>

					{/* 7. Payment Terms */}
					<Card id='payments' className='mb-8'>
						<CardHeader>
							<CardTitle className='flex items-center gap-3'>
								<CreditCard className='text-primary h-6 w-6' />
								7. Payment Terms
							</CardTitle>
						</CardHeader>
						<CardContent>
							<div className='mb-6'>
								<h3 className='mb-3 text-xl font-semibold text-gray-900 dark:text-white'>
									Fees and Billing
								</h3>
								<p className='mb-3 text-gray-600 dark:text-gray-300'>
									Certain features of the Service may require payment of fees.
									By subscribing to a paid plan, you agree to:
								</p>
								<ul className='space-y-2 text-gray-600 dark:text-gray-300'>
									<li className='flex items-start gap-2'>
										<span className='bg-primary mt-2 h-2 w-2 flex-shrink-0 rounded-full'></span>
										Pay all fees associated with your subscription plan
									</li>
									<li className='flex items-start gap-2'>
										<span className='bg-primary mt-2 h-2 w-2 flex-shrink-0 rounded-full'></span>
										Provide accurate billing information and keep it updated
									</li>
									<li className='flex items-start gap-2'>
										<span className='bg-primary mt-2 h-2 w-2 flex-shrink-0 rounded-full'></span>
										Authorize us to charge your payment method for recurring
										fees
									</li>
								</ul>
							</div>

							<div className='mb-6'>
								<h3 className='mb-3 text-xl font-semibold text-gray-900 dark:text-white'>
									Payment Processing
								</h3>
								<ul className='space-y-2 text-gray-600 dark:text-gray-300'>
									<li className='flex items-start gap-2'>
										<span className='bg-primary mt-2 h-2 w-2 flex-shrink-0 rounded-full'></span>
										All fees are exclusive of applicable taxes (including VAT
										where applicable)
									</li>
									<li className='flex items-start gap-2'>
										<span className='bg-primary mt-2 h-2 w-2 flex-shrink-0 rounded-full'></span>
										Payments are processed securely through third-party payment
										processors
									</li>
									<li className='flex items-start gap-2'>
										<span className='bg-primary mt-2 h-2 w-2 flex-shrink-0 rounded-full'></span>
										We may change pricing with reasonable notice (typically 30
										days)
									</li>
									<li className='flex items-start gap-2'>
										<span className='bg-primary mt-2 h-2 w-2 flex-shrink-0 rounded-full'></span>
										Failed payments may result in service suspension
									</li>
								</ul>
							</div>

							<div className='mb-6'>
								<h3 className='mb-3 text-xl font-semibold text-gray-900 dark:text-white'>
									Refunds and Cancellation
								</h3>
								<p className='mb-3 text-gray-600 dark:text-gray-300'>
									Refund policies vary by subscription type and are subject to
									our discretion. Generally:
								</p>
								<ul className='space-y-2 text-gray-600 dark:text-gray-300'>
									<li className='flex items-start gap-2'>
										<span className='bg-primary mt-2 h-2 w-2 flex-shrink-0 rounded-full'></span>
										You may cancel your subscription at any time
									</li>
									<li className='flex items-start gap-2'>
										<span className='bg-primary mt-2 h-2 w-2 flex-shrink-0 rounded-full'></span>
										Cancellation takes effect at the end of your current billing
										period
									</li>
									<li className='flex items-start gap-2'>
										<span className='bg-primary mt-2 h-2 w-2 flex-shrink-0 rounded-full'></span>
										No refunds for partial months or unused time
									</li>
								</ul>
							</div>

							<div className='bg-primary/5 rounded-lg p-4'>
								<p className='text-sm text-gray-600 dark:text-gray-300'>
									<strong>German VAT:</strong> All prices are exclusive of
									German VAT (Mehrwertsteuer) where applicable. VAT will be
									added to your invoice based on your location and business
									status.
								</p>
							</div>
						</CardContent>
					</Card>

					{/* 8. Data Collection and Privacy */}
					<Card id='privacy' className='mb-8'>
						<CardHeader>
							<CardTitle className='flex items-center gap-3'>
								<LinkIcon className='text-primary h-6 w-6' />
								8. Data Collection and Privacy
							</CardTitle>
						</CardHeader>
						<CardContent>
							<p className='mb-4 text-gray-600 dark:text-gray-300'>
								We collect and process your personal data in accordance with
								applicable data protection laws, including the General Data
								Protection Regulation (GDPR). Our data practices are detailed in
								our comprehensive{" "}
								<a href='privacy-policy' className='text-primary underline'>
									Privacy Policy
								</a>
								.
							</p>
							<p className='text-gray-600 dark:text-gray-300'>
								By using the Service, you consent to the collection, use, and
								processing of your data as described in our Privacy Policy.
							</p>
						</CardContent>
					</Card>

					{/* 9. Termination */}
					<Card id='termination' className='mb-8'>
						<CardHeader>
							<CardTitle className='flex items-center gap-3'>
								<Ban className='text-primary h-6 w-6' />
								9. Termination
							</CardTitle>
						</CardHeader>
						<CardContent>
							<div className='mb-6'>
								<h3 className='mb-3 text-xl font-semibold text-gray-900 dark:text-white'>
									Termination by You
								</h3>
								<p className='mb-3 text-gray-600 dark:text-gray-300'>
									You may terminate your account at any time by:
								</p>
								<ul className='space-y-2 text-gray-600 dark:text-gray-300'>
									<li className='flex items-start gap-2'>
										<span className='bg-primary mt-2 h-2 w-2 flex-shrink-0 rounded-full'></span>
										Using the account closure feature in your account settings
									</li>
									<li className='flex items-start gap-2'>
										<span className='bg-primary mt-2 h-2 w-2 flex-shrink-0 rounded-full'></span>
										Contacting us at the email address provided in the Contact
										section
									</li>
									<li className='flex items-start gap-2'>
										<span className='bg-primary mt-2 h-2 w-2 flex-shrink-0 rounded-full'></span>
										Canceling any active subscriptions before termination
									</li>
								</ul>
							</div>

							<div className='mb-6'>
								<h3 className='mb-3 text-xl font-semibold text-gray-900 dark:text-white'>
									Termination by Us
								</h3>
								<p className='mb-3 text-gray-600 dark:text-gray-300'>
									We may terminate or suspend your account immediately if you:
								</p>
								<ul className='space-y-2 text-gray-600 dark:text-gray-300'>
									<li className='flex items-start gap-2'>
										<span className='bg-primary mt-2 h-2 w-2 flex-shrink-0 rounded-full'></span>
										Violate these Terms or our policies
									</li>
									<li className='flex items-start gap-2'>
										<span className='bg-primary mt-2 h-2 w-2 flex-shrink-0 rounded-full'></span>
										Engage in fraudulent or illegal activities
									</li>
									<li className='flex items-start gap-2'>
										<span className='bg-primary mt-2 h-2 w-2 flex-shrink-0 rounded-full'></span>
										Fail to pay required fees
									</li>
									<li className='flex items-start gap-2'>
										<span className='bg-primary mt-2 h-2 w-2 flex-shrink-0 rounded-full'></span>
										Misuse the Service or harm other users
									</li>
								</ul>
								<p className='mt-3 text-gray-600 dark:text-gray-300'>
									We may also terminate your account with reasonable notice for
									other reasons, such as service discontinuation or business
									changes.
								</p>
							</div>

							<div className='mb-6'>
								<h3 className='mb-3 text-xl font-semibold text-gray-900 dark:text-white'>
									Effect of Termination
								</h3>
								<p className='mb-3 text-gray-600 dark:text-gray-300'>
									Upon termination:
								</p>
								<ul className='space-y-2 text-gray-600 dark:text-gray-300'>
									<li className='flex items-start gap-2'>
										<span className='bg-primary mt-2 h-2 w-2 flex-shrink-0 rounded-full'></span>
										Your right to use the Service will cease immediately
									</li>
									<li className='flex items-start gap-2'>
										<span className='bg-primary mt-2 h-2 w-2 flex-shrink-0 rounded-full'></span>
										We may delete your account and associated data
									</li>
									<li className='flex items-start gap-2'>
										<span className='bg-primary mt-2 h-2 w-2 flex-shrink-0 rounded-full'></span>
										You remain liable for any outstanding fees
									</li>
									<li className='flex items-start gap-2'>
										<span className='bg-primary mt-2 h-2 w-2 flex-shrink-0 rounded-full'></span>
										Certain provisions of these Terms will survive termination
									</li>
								</ul>
							</div>

							<div className='bg-primary/5 rounded-lg p-4'>
								<p className='text-sm text-gray-600 dark:text-gray-300'>
									<strong>Data Retention:</strong> We may retain certain
									information as required by law or for legitimate business
									purposes. See our Privacy Policy for details on data retention
									practices.
								</p>
							</div>
						</CardContent>
					</Card>

					{/* 10. Limitation of Liability */}
					<Card id='liability' className='mb-8'>
						<CardHeader>
							<CardTitle className='flex items-center gap-3'>
								<Scale className='text-primary h-6 w-6' />
								10. Limitation of Liability
							</CardTitle>
						</CardHeader>
						<CardContent>
							<div className='mb-6'>
								<h3 className='mb-3 text-xl font-semibold text-gray-900 dark:text-white'>
									Disclaimer of Warranties
								</h3>
								<p className='mb-3 text-gray-600 dark:text-gray-300'>
									The Service is provided "as is" and "as available" without
									warranties of any kind, either express or implied. To the
									fullest extent permitted by applicable law, we disclaim all
									warranties, including but not limited to:
								</p>
								<ul className='space-y-2 text-gray-600 dark:text-gray-300'>
									<li className='flex items-start gap-2'>
										<span className='bg-primary mt-2 h-2 w-2 flex-shrink-0 rounded-full'></span>
										Warranties of merchantability, fitness for a particular
										purpose, and non-infringement
									</li>
									<li className='flex items-start gap-2'>
										<span className='bg-primary mt-2 h-2 w-2 flex-shrink-0 rounded-full'></span>
										Warranties regarding the accuracy, reliability, or
										availability of the Service
									</li>
									<li className='flex items-start gap-2'>
										<span className='bg-primary mt-2 h-2 w-2 flex-shrink-0 rounded-full'></span>
										Warranties that the Service will be uninterrupted, secure,
										or error-free
									</li>
								</ul>
							</div>

							<div className='mb-6'>
								<h3 className='mb-3 text-xl font-semibold text-gray-900 dark:text-white'>
									Limitation of Liability
								</h3>
								<p className='mb-3 text-gray-600 dark:text-gray-300'>
									To the maximum extent permitted by German law, {siteName}{" "}
									shall not be liable for:
								</p>
								<ul className='space-y-2 text-gray-600 dark:text-gray-300'>
									<li className='flex items-start gap-2'>
										<span className='bg-primary mt-2 h-2 w-2 flex-shrink-0 rounded-full'></span>
										Indirect, incidental, special, consequential, or punitive
										damages
									</li>
									<li className='flex items-start gap-2'>
										<span className='bg-primary mt-2 h-2 w-2 flex-shrink-0 rounded-full'></span>
										Loss of profits, data, use, goodwill, or other intangible
										losses
									</li>
									<li className='flex items-start gap-2'>
										<span className='bg-primary mt-2 h-2 w-2 flex-shrink-0 rounded-full'></span>
										Damages resulting from your use or inability to use the
										Service
									</li>
									<li className='flex items-start gap-2'>
										<span className='bg-primary mt-2 h-2 w-2 flex-shrink-0 rounded-full'></span>
										Service interruptions, technical issues, or third-party
										actions
									</li>
								</ul>
								<p className='mt-3 text-gray-600 dark:text-gray-300'>
									Our total liability to you for any claims arising from or
									related to these Terms or the Service shall not exceed the
									amount you paid us in the twelve (12) months preceding the
									claim, or €100, whichever is greater.
								</p>
							</div>

							<div className='bg-primary/5 rounded-lg p-4'>
								<p className='text-sm text-gray-600 dark:text-gray-300'>
									<strong>German Law Exception:</strong> Nothing in this section
									shall limit our liability for death or personal injury caused
									by our negligence, fraud, or any other liability that cannot
									be excluded or limited under German law.
								</p>
							</div>
						</CardContent>
					</Card>

					{/* 11. Indemnification */}
					<Card id='indemnification' className='mb-8'>
						<CardHeader>
							<CardTitle className='flex items-center gap-3'>
								<Shield className='text-primary h-6 w-6' />
								11. Indemnification
							</CardTitle>
						</CardHeader>
						<CardContent>
							<p className='mb-4 text-gray-600 dark:text-gray-300'>
								You agree to indemnify, defend, and hold harmless {siteName},
								its officers, directors, employees, agents, and affiliates from
								and against any and all claims, damages, obligations, losses,
								liabilities, costs, and expenses (including reasonable
								attorney's fees) arising from or related to:
							</p>
							<ul className='space-y-2 text-gray-600 dark:text-gray-300'>
								<li className='flex items-start gap-2'>
									<span className='bg-primary mt-2 h-2 w-2 flex-shrink-0 rounded-full'></span>
									Your use of the Service
								</li>
								<li className='flex items-start gap-2'>
									<span className='bg-primary mt-2 h-2 w-2 flex-shrink-0 rounded-full'></span>
									Your violation of these Terms
								</li>
								<li className='flex items-start gap-2'>
									<span className='bg-primary mt-2 h-2 w-2 flex-shrink-0 rounded-full'></span>
									Your User Content or any content you submit to the Service
								</li>
								<li className='flex items-start gap-2'>
									<span className='bg-primary mt-2 h-2 w-2 flex-shrink-0 rounded-full'></span>
									Your violation of any third-party rights, including
									intellectual property rights
								</li>
								<li className='flex items-start gap-2'>
									<span className='bg-primary mt-2 h-2 w-2 flex-shrink-0 rounded-full'></span>
									Your violation of any applicable laws or regulations
								</li>
							</ul>
							<p className='mt-4 text-gray-600 dark:text-gray-300'>
								We reserve the right to assume the exclusive defense and control
								of any matter subject to indemnification by you, in which case
								you will cooperate with us in asserting any available defenses.
							</p>
						</CardContent>
					</Card>

					{/* 12. Dispute Resolution */}
					<Card id='disputes' className='mb-8'>
						<CardHeader>
							<CardTitle className='flex items-center gap-3'>
								<AlertTriangle className='text-primary h-6 w-6' />
								12. Dispute Resolution
							</CardTitle>
						</CardHeader>
						<CardContent>
							<div className='mb-6'>
								<h3 className='mb-3 text-xl font-semibold text-gray-900 dark:text-white'>
									Informal Resolution
								</h3>
								<p className='mb-3 text-gray-600 dark:text-gray-300'>
									Before pursuing formal legal action, we encourage you to
									contact us directly to resolve any disputes informally. We
									will make good faith efforts to resolve disputes through
									direct communication.
								</p>
							</div>

							<div className='mb-6'>
								<h3 className='mb-3 text-xl font-semibold text-gray-900 dark:text-white'>
									Mediation
								</h3>
								<p className='mb-3 text-gray-600 dark:text-gray-300'>
									If informal resolution is unsuccessful, you agree to attempt
									to resolve any dispute through mediation before pursuing
									litigation. Mediation will be conducted in Hamburg, Germany,
									in the German language.
								</p>
							</div>

							<div className='bg-primary/5 rounded-lg p-4'>
								<p className='text-sm text-gray-600 dark:text-gray-300'>
									<strong>Consumer Rights:</strong> If you are a consumer under
									German law, you may have additional rights regarding dispute
									resolution, including the ability to use the European
									Commission's Online Dispute Resolution platform.
								</p>
							</div>
						</CardContent>
					</Card>

					{/* 13. Changes to Terms */}
					<Card id='changes' className='mb-8'>
						<CardHeader>
							<CardTitle className='flex items-center gap-3'>
								<FileText className='text-primary h-6 w-6' />
								13. Changes to Terms
							</CardTitle>
						</CardHeader>
						<CardContent>
							<p className='mb-4 text-gray-600 dark:text-gray-300'>
								We reserve the right to modify these Terms at any time. When we
								make changes, we will:
							</p>
							<ul className='mb-4 space-y-2 text-gray-600 dark:text-gray-300'>
								<li className='flex items-start gap-2'>
									<span className='bg-primary mt-2 h-2 w-2 flex-shrink-0 rounded-full'></span>
									Update the "Last updated" date at the top of these Terms
								</li>
								<li className='flex items-start gap-2'>
									<span className='bg-primary mt-2 h-2 w-2 flex-shrink-0 rounded-full'></span>
									Notify you by email (if you have an account) and/or prominent
									notice on our website
								</li>
								<li className='flex items-start gap-2'>
									<span className='bg-primary mt-2 h-2 w-2 flex-shrink-0 rounded-full'></span>
									Provide reasonable notice before material changes take effect
								</li>
							</ul>
							<p className='mb-4 text-gray-600 dark:text-gray-300'>
								Your continued use of the Service after changes become effective
								constitutes acceptance of the updated Terms. If you do not agree
								to the changes, you must stop using the Service and may
								terminate your account.
							</p>
							<div className='bg-primary/5 rounded-lg p-4'>
								<p className='text-sm text-gray-600 dark:text-gray-300'>
									<strong>Material Changes:</strong> For material changes that
									significantly affect your rights or obligations, we will
									provide at least 30 days' notice before the changes take
									effect.
								</p>
							</div>
						</CardContent>
					</Card>

					{/* 14. Governing Law and Jurisdiction */}
					<Card id='law' className='mb-8'>
						<CardHeader>
							<CardTitle className='flex items-center gap-3'>
								<Landmark className='text-primary h-6 w-6' />
								14. Governing Law and Jurisdiction
							</CardTitle>
						</CardHeader>
						<CardContent>
							<div className='mb-6'>
								<h3 className='mb-3 text-xl font-semibold text-gray-900 dark:text-white'>
									Applicable Law
								</h3>
								<p className='mb-3 text-gray-600 dark:text-gray-300'>
									These Terms shall be governed by and construed in accordance
									with the laws of the Federal Republic of Germany, without
									regard to conflict of law principles.
								</p>
							</div>

							<div className='mb-6'>
								<h3 className='mb-3 text-xl font-semibold text-gray-900 dark:text-white'>
									Jurisdiction
								</h3>
								<p className='mb-3 text-gray-600 dark:text-gray-300'>
									Any legal action or proceeding arising under these Terms will
									be brought exclusively in the courts of Hamburg, Germany. You
									consent to the jurisdiction of such courts and waive any
									objection to venue in Hamburg.
								</p>
							</div>

							<div className='bg-primary/5 rounded-lg p-4'>
								<p className='text-sm text-gray-600 dark:text-gray-300'>
									<strong>Consumer Protection:</strong> If you are a consumer
									under German law, you may have additional rights and
									protections. Nothing in these Terms shall limit your rights as
									a consumer under applicable German consumer protection laws.
								</p>
							</div>
						</CardContent>
					</Card>

					{/* 15. Contact Information */}
					<Card id='contact' className='mb-8'>
						<CardHeader>
							<CardTitle className='flex items-center gap-3'>
								<Mail className='text-primary h-6 w-6' />
								15. Contact Information
							</CardTitle>
						</CardHeader>
						<CardContent>
							<p className='mb-4 text-gray-600 dark:text-gray-300'>
								If you have any questions about these Terms of Service, please
								contact us:
							</p>

							<div className='mb-6 space-y-4'>
								<div className='flex items-start gap-3'>
									<Building className='text-primary mt-1 h-5 w-5' />
									<div>
										<p className='font-medium text-gray-600 dark:text-gray-300'>
											{siteName}
										</p>
										<p className='text-sm text-gray-500 dark:text-gray-400'>
											Company Name
										</p>
									</div>
								</div>
								<div className='flex items-start gap-3'>
									<MapPin className='text-primary mt-1 h-5 w-5' />
									<div>
										<p className='font-medium text-gray-600 dark:text-gray-300'>
											Hamburg, Germany
										</p>
										<p className='text-sm text-gray-500 dark:text-gray-400'>
											Registered Address
										</p>
									</div>
								</div>
								<div className='flex items-start gap-3'>
									<Mail className='text-primary mt-1 h-5 w-5' />
									<div>
										<a
											href='mailto:legal@nogl.tech'
											className='text-primary font-medium hover:underline'
										>
											legal@nogl.tech
										</a>
										<p className='text-sm text-gray-500 dark:text-gray-400'>
											Legal inquiries
										</p>
									</div>
								</div>
								<div className='flex items-start gap-3'>
									<Mail className='text-primary mt-1 h-5 w-5' />
									<div>
										<a
											href='mailto:support@nogl.tech'
											className='text-primary font-medium hover:underline'
										>
											support@nogl.tech
										</a>
										<p className='text-sm text-gray-500 dark:text-gray-400'>
											General support
										</p>
									</div>
								</div>
								<div className='flex items-start gap-3'>
									<Phone className='text-primary mt-1 h-5 w-5' />
									<div>
										<span className='font-medium text-gray-600 dark:text-gray-300'>
											+49-40-12345678
										</span>
										<p className='text-sm text-gray-500 dark:text-gray-400'>
											Business hours: Monday-Friday, 9:00-17:00 CET
										</p>
									</div>
								</div>
							</div>

							<div className='bg-primary/5 rounded-lg p-4'>
								<p className='text-sm text-gray-600 dark:text-gray-300'>
									<strong>Response Time:</strong> We will respond to your
									inquiry within 5 business days. For urgent legal matters,
									please mark your email as "URGENT" in the subject line.
								</p>
							</div>
						</CardContent>
					</Card>

					{/* Acceptance */}
					<p className='mt-8 text-center text-gray-600 dark:text-gray-300'>
						By using our Service, you acknowledge that you have read,
						understood, and agree to be bound by these Terms of Service.
					</p>
				</div>
			</Section>
		</>
	);
};

export default TermsOfServicePage;

import React from "react";
import Link from "next/link";
import { getSEOTags, renderSchemaTags } from "@/lib/seo";
import Breadcrumb from "@/components/Common/Breadcrumb";
import { Section } from "@/components/organisms";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	Shield,
	Eye,
	Lock,
	Users,
	FileText,
	Mail,
	Phone,
	MapPin,
	Globe,
	Scale,
	Landmark,
	Cookie,
} from "lucide-react";

export const metadata = getSEOTags({
	title: `Datenschutzerklärung | ${process.env.SITE_NAME}`,
	description:
		"Erfahren Sie, wie Nogl Ihre persönlichen Daten schützt, wie wir sie verwenden und welche Datenschutzrechte Sie haben.",
	canonicalUrlRelative: "/datenschutz",
});

const DatenschutzPage = () => {
	const siteName = process.env.SITE_NAME || "Nogl";
	const siteUrl = process.env.SITE_URL || "https://www.nogl.ai";
	const imageBaseUrl = process.env.NEXT_PUBLIC_IMAGE_URL || siteUrl;
	const lastUpdated = new Date().toISOString().split("T")[0];

	const schemaData = {
		"@context": "https://schema.org",
		"@type": "PrivacyPolicy",
		name: "Datenschutzerklärung",
		description:
			"Erfahren Sie, wie Nogl Ihre persönlichen Daten schützt, wie wir sie verwenden und welche Datenschutzrechte Sie haben.",
		url: `${siteUrl}/datenschutz`,
		dateModified: new Date().toISOString().split("T")[0],
		publisher: {
			"@type": "Organization",
			name: siteName,
			url: siteUrl,
			logo: {
				"@type": "ImageObject",
				url: `${imageBaseUrl}/logo.png`,
			},
		},
		contactPoint: {
			"@type": "ContactPoint",
			contactType: "customer support",
			telephone: "+49-40-12345678",
			email: "datenschutz@nogl.tech",
		},
	};

	return (
		<>
			{renderSchemaTags(schemaData)}

			{/* Breadcrumb */}
			<Breadcrumb pageTitle='Datenschutzerklärung' />

			{/* Main Content */}
			<Section className='bg-gray-50 dark:bg-gray-900'>
				<div className='mx-auto max-w-4xl'>
					{/* Header */}
					<div className='mb-12 text-center'>
						<div className='bg-primary/10 mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full'>
							<Shield className='text-primary h-8 w-8' />
						</div>
						<h1 className='mb-4 text-4xl font-bold text-gray-900 dark:text-white'>
							Datenschutzerklärung
						</h1>
						<p className='mb-4 text-lg text-gray-600 dark:text-gray-300'>
							Gültig ab: 12. November 2024
						</p>
						<p className='mb-6 text-sm text-gray-500 dark:text-gray-400'>
							Letzte Aktualisierung: {lastUpdated}
						</p>
						<p className='mx-auto max-w-3xl text-gray-600 dark:text-gray-300'>
							Bei {siteName} ("wir", "uns" oder "unser"), erreichbar unter{" "}
							<a
								href={siteUrl}
								className='text-primary font-medium hover:underline'
							>
								{siteUrl}
							</a>
							, legen wir höchsten Wert auf den Schutz Ihrer persönlichen Daten
							und Datenschutzrechte. Diese Datenschutzerklärung erläutert unsere
							Praktiken bezüglich der Erhebung, Verwendung und des Schutzes
							Ihrer Daten.
						</p>
					</div>

					{/* Quick Navigation */}
					<div className='mb-10'>
						<div className='flex flex-wrap gap-2 text-sm'>
							<a
								href='#datenerhebung'
								className='bg-primary/10 text-primary rounded-full px-3 py-1'
							>
								Datenerhebung
							</a>
							<a
								href='#sicherheit'
								className='bg-primary/10 text-primary rounded-full px-3 py-1'
							>
								Sicherheit
							</a>
							<a
								href='#ihre-rechte'
								className='bg-primary/10 text-primary rounded-full px-3 py-1'
							>
								Ihre Rechte
							</a>
							<a
								href='#weitergabe'
								className='bg-primary/10 text-primary rounded-full px-3 py-1'
							>
								Datenweitergabe
							</a>
							<a
								href='#aufbewahrung'
								className='bg-primary/10 text-primary rounded-full px-3 py-1'
							>
								Datenaufbewahrung
							</a>
							<a
								href='#cookies'
								className='bg-primary/10 text-primary rounded-full px-3 py-1'
							>
								Cookies
							</a>
							<a
								href='#rechtsgrundlagen'
								className='bg-primary/10 text-primary rounded-full px-3 py-1'
							>
								Rechtsgrundlagen
							</a>
							<a
								href='#datenuebertragung'
								className='bg-primary/10 text-primary rounded-full px-3 py-1'
							>
								Datenübertragung
							</a>
							<a
								href='#kontakt'
								className='bg-primary/10 text-primary rounded-full px-3 py-1'
							>
								Kontakt
							</a>
						</div>
					</div>

					{/* Verantwortlicher */}
					<Card className='mb-8'>
						<CardHeader>
							<CardTitle className='flex items-center gap-3'>
								<Landmark className='text-primary h-6 w-6' />
								Verantwortlicher
							</CardTitle>
						</CardHeader>
						<CardContent>
							<p className='mb-4 text-gray-600 dark:text-gray-300'>
								Verantwortlicher im Sinne der Datenschutz-Grundverordnung
								(DSGVO) ist:
							</p>
							<div className='space-y-2 text-gray-600 dark:text-gray-300'>
								<p>
									<strong>Nogl GmbH</strong>
								</p>
								<p>Hamburg, Deutschland</p>
								<p>
									E-Mail:{" "}
									<Link
										href='mailto:datenschutz@nogl.tech'
										className='text-primary hover:underline'
									>
										datenschutz@nogl.tech
									</Link>
								</p>
								<p>Telefon: +49-40-12345678</p>
							</div>
						</CardContent>
					</Card>

					{/* Information Collection and Use */}
					<Card id='datenerhebung' className='mb-8'>
						<CardHeader>
							<CardTitle className='flex items-center gap-3'>
								<Eye className='text-primary h-6 w-6' />
								Datenerhebung und -verwendung
							</CardTitle>
						</CardHeader>
						<CardContent className='space-y-6'>
							<div>
								<h3 className='mb-3 text-xl font-semibold text-gray-900 dark:text-white'>
									Von Ihnen bereitgestellte personenbezogene Daten
								</h3>
								<p className='mb-3 text-gray-600 dark:text-gray-300'>
									Wenn Sie sich für unsere Dienste anmelden oder mit unserer
									Plattform interagieren, stellen Sie uns freiwillig
									personenbezogene Daten zur Verfügung, einschließlich:
								</p>
								<ul className='space-y-2 text-gray-600 dark:text-gray-300'>
									<li className='flex items-start gap-2'>
										<span className='bg-primary mt-2 h-2 w-2 flex-shrink-0 rounded-full'></span>
										Name, E-Mail-Adresse und Kontaktdaten
									</li>
									<li className='flex items-start gap-2'>
										<span className='bg-primary mt-2 h-2 w-2 flex-shrink-0 rounded-full'></span>
										Firmenname und Geschäftsinformationen
									</li>
									<li className='flex items-start gap-2'>
										<span className='bg-primary mt-2 h-2 w-2 flex-shrink-0 rounded-full'></span>
										Telefonnummer und Rechnungsadresse
									</li>
									<li className='flex items-start gap-2'>
										<span className='bg-primary mt-2 h-2 w-2 flex-shrink-0 rounded-full'></span>
										Zahlungs- und Abrechnungsinformationen (sicher über
										Drittanbieter verarbeitet)
									</li>
									<li className='flex items-start gap-2'>
										<span className='bg-primary mt-2 h-2 w-2 flex-shrink-0 rounded-full'></span>
										Kommunikationspräferenzen und Marketing-Einverständnis
									</li>
								</ul>
							</div>

							<div>
								<h3 className='mb-3 text-xl font-semibold text-gray-900 dark:text-white'>
									Automatisch erhobene Daten
								</h3>
								<p className='mb-3 text-gray-600 dark:text-gray-300'>
									Wir erheben automatisch bestimmte Informationen, wenn Sie
									unsere Website besuchen oder unsere Dienste nutzen:
								</p>
								<ul className='space-y-2 text-gray-600 dark:text-gray-300'>
									<li className='flex items-start gap-2'>
										<span className='bg-primary mt-2 h-2 w-2 flex-shrink-0 rounded-full'></span>
										Protokolldaten (IP-Adresse, Browsertyp, Datum und Uhrzeit
										der Anfragen)
									</li>
									<li className='flex items-start gap-2'>
										<span className='bg-primary mt-2 h-2 w-2 flex-shrink-0 rounded-full'></span>
										Geräteinformationen (Gerätetyp, Betriebssystem, eindeutige
										Geräte-IDs)
									</li>
									<li className='flex items-start gap-2'>
										<span className='bg-primary mt-2 h-2 w-2 flex-shrink-0 rounded-full'></span>
										Nutzungsdaten und Interaktionen mit unserer Plattform
									</li>
									<li className='flex items-start gap-2'>
										<span className='bg-primary mt-2 h-2 w-2 flex-shrink-0 rounded-full'></span>
										Verweisquellen und Navigationsmuster
									</li>
								</ul>
							</div>

							<div>
								<h3 className='mb-3 text-xl font-semibold text-gray-900 dark:text-white'>
									Verwendungszwecke Ihrer Daten
								</h3>
								<p className='mb-3 text-gray-600 dark:text-gray-300'>
									Wir verwenden die erhobenen Daten zur Bereitstellung und
									Verwaltung unserer Dienste, zur Beantwortung Ihrer Anfragen
									und zur Kommunikation bezüglich der Dienstnutzung. Konkret
									verwenden wir Ihre Informationen für:
								</p>
								<ul className='space-y-2 text-gray-600 dark:text-gray-300'>
									<li className='flex items-start gap-2'>
										<span className='bg-primary mt-2 h-2 w-2 flex-shrink-0 rounded-full'></span>
										Bearbeitung und Erfüllung Ihrer Dienstleistungsanfragen und
										Transaktionen
									</li>
									<li className='flex items-start gap-2'>
										<span className='bg-primary mt-2 h-2 w-2 flex-shrink-0 rounded-full'></span>
										Kundensupport und technische Unterstützung
									</li>
									<li className='flex items-start gap-2'>
										<span className='bg-primary mt-2 h-2 w-2 flex-shrink-0 rounded-full'></span>
										Analysen zur Verbesserung unserer Dienste und optimalen
										Darstellung
									</li>
									<li className='flex items-start gap-2'>
										<span className='bg-primary mt-2 h-2 w-2 flex-shrink-0 rounded-full'></span>
										Marketing-Kommunikation (mit Ihrer ausdrücklichen
										Einwilligung)
									</li>
									<li className='flex items-start gap-2'>
										<span className='bg-primary mt-2 h-2 w-2 flex-shrink-0 rounded-full'></span>
										Erfüllung rechtlicher Verpflichtungen und regulatorischer
										Anforderungen
									</li>
								</ul>
							</div>
						</CardContent>
					</Card>

					{/* Data Security and Protection */}
					<Card id='sicherheit' className='mb-8'>
						<CardHeader>
							<CardTitle className='flex items-center gap-3'>
								<Lock className='text-primary h-6 w-6' />
								Datensicherheit und -schutz
							</CardTitle>
						</CardHeader>
						<CardContent>
							<p className='mb-4 text-gray-600 dark:text-gray-300'>
								Wir implementieren branchenübliche Sicherheitsmaßnahmen zum
								Schutz Ihrer personenbezogenen Daten, einschließlich:
							</p>
							<ul className='space-y-2 text-gray-600 dark:text-gray-300'>
								<li className='flex items-start gap-2'>
									<span className='bg-primary mt-2 h-2 w-2 flex-shrink-0 rounded-full'></span>
									Ende-zu-Ende-Verschlüsselung sensibler Daten
								</li>
								<li className='flex items-start gap-2'>
									<span className='bg-primary mt-2 h-2 w-2 flex-shrink-0 rounded-full'></span>
									Sichere Datenspeichersysteme mit regelmäßigen Backups
								</li>
								<li className='flex items-start gap-2'>
									<span className='bg-primary mt-2 h-2 w-2 flex-shrink-0 rounded-full'></span>
									Multi-Faktor-Authentifizierung und Zugriffskontrollen
								</li>
								<li className='flex items-start gap-2'>
									<span className='bg-primary mt-2 h-2 w-2 flex-shrink-0 rounded-full'></span>
									Regelmäßige Sicherheitsaudits und Schwachstellenbewertungen
								</li>
								<li className='flex items-start gap-2'>
									<span className='bg-primary mt-2 h-2 w-2 flex-shrink-0 rounded-full'></span>
									Mitarbeiterschulungen zu Datenschutz-Best-Practices
								</li>
							</ul>
						</CardContent>
					</Card>

					{/* Your Privacy Rights */}
					<Card id='ihre-rechte' className='mb-8'>
						<CardHeader>
							<CardTitle className='flex items-center gap-3'>
								<Users className='text-primary h-6 w-6' />
								Ihre Datenschutzrechte und -wahlmöglichkeiten
							</CardTitle>
						</CardHeader>
						<CardContent>
							<p className='mb-4 text-gray-600 dark:text-gray-300'>
								Nach geltendem Datenschutzrecht haben Sie folgende Rechte
								bezüglich Ihrer personenbezogenen Daten:
							</p>

							<div className='mb-6'>
								<h3 className='mb-3 text-xl font-semibold text-gray-900 dark:text-white'>
									Ihre Datenschutzrechte nach DSGVO
								</h3>
								<ul className='space-y-3 text-gray-600 dark:text-gray-300'>
									<li className='flex items-start gap-2'>
										<span className='bg-primary mt-2 h-2 w-2 flex-shrink-0 rounded-full'></span>
										<div>
											<strong>Auskunftsrecht (Art. 15 DSGVO):</strong>{" "}
											Anforderung einer Kopie Ihrer personenbezogenen Daten und
											Details zur Verarbeitung
										</div>
									</li>
									<li className='flex items-start gap-2'>
										<span className='bg-primary mt-2 h-2 w-2 flex-shrink-0 rounded-full'></span>
										<div>
											<strong>Berichtigungsrecht (Art. 16 DSGVO):</strong>{" "}
											Anforderung von Korrekturen unrichtiger oder
											unvollständiger personenbezogener Daten
										</div>
									</li>
									<li className='flex items-start gap-2'>
										<span className='bg-primary mt-2 h-2 w-2 flex-shrink-0 rounded-full'></span>
										<div>
											<strong>Löschungsrecht (Art. 17 DSGVO):</strong>{" "}
											Anforderung der Löschung Ihrer personenbezogenen Daten
											(Recht auf Vergessenwerden)
										</div>
									</li>
									<li className='flex items-start gap-2'>
										<span className='bg-primary mt-2 h-2 w-2 flex-shrink-0 rounded-full'></span>
										<div>
											<strong>Datenübertragbarkeit (Art. 20 DSGVO):</strong>{" "}
											Erhalt Ihrer Daten in strukturiertem, maschinenlesbarem
											Format
										</div>
									</li>
									<li className='flex items-start gap-2'>
										<span className='bg-primary mt-2 h-2 w-2 flex-shrink-0 rounded-full'></span>
										<div>
											<strong>
												Einschränkung der Verarbeitung (Art. 18 DSGVO):
											</strong>{" "}
											Anforderung der Einschränkung der Verarbeitung unter
											bestimmten Umständen
										</div>
									</li>
									<li className='flex items-start gap-2'>
										<span className='bg-primary mt-2 h-2 w-2 flex-shrink-0 rounded-full'></span>
										<div>
											<strong>Widerspruchsrecht (Art. 21 DSGVO):</strong>{" "}
											Widerspruch gegen Verarbeitung aufgrund berechtigter
											Interessen oder zu Marketingzwecken
										</div>
									</li>
									<li className='flex items-start gap-2'>
										<span className='bg-primary mt-2 h-2 w-2 flex-shrink-0 rounded-full'></span>
										<div>
											<strong>
												Widerruf der Einwilligung (Art. 7 Abs. 3 DSGVO):
											</strong>{" "}
											Widerruf der Einwilligung jederzeit, wenn die Verarbeitung
											auf Einwilligung basiert
										</div>
									</li>
								</ul>
							</div>

							<div className='mb-6'>
								<h3 className='mb-3 text-xl font-semibold text-gray-900 dark:text-white'>
									Ausübung Ihrer Rechte
								</h3>
								<p className='mb-3 text-gray-600 dark:text-gray-300'>
									Sie können diese Rechte ausüben, indem Sie uns unter{" "}
									<Link
										href='mailto:datenschutz@nogl.tech'
										className='text-primary font-medium hover:underline'
									>
										datenschutz@nogl.tech
									</Link>{" "}
									kontaktieren. Wir werden Ihre Anfrage innerhalb von 30 Tagen
									beantworten und können zusätzliche Informationen zur
									Identitätsverifikation anfordern.
								</p>
								<ul className='space-y-2 text-gray-600 dark:text-gray-300'>
									<li className='flex items-start gap-2'>
										<span className='bg-primary mt-2 h-2 w-2 flex-shrink-0 rounded-full'></span>
										Vollständigen Namen und E-Mail-Adresse Ihres Kontos angeben
									</li>
									<li className='flex items-start gap-2'>
										<span className='bg-primary mt-2 h-2 w-2 flex-shrink-0 rounded-full'></span>
										Das spezifische Recht, das Sie ausüben möchten, klar
										beschreiben
									</li>
									<li className='flex items-start gap-2'>
										<span className='bg-primary mt-2 h-2 w-2 flex-shrink-0 rounded-full'></span>
										Relevante Kontoinformationen zur Datenlokalisierung angeben
									</li>
								</ul>
							</div>

							<div className='bg-primary/5 rounded-lg p-4'>
								<p className='text-sm text-gray-600 dark:text-gray-300'>
									<strong>Hinweis:</strong> Einige Rechte können unter
									bestimmten Umständen eingeschränkt sein, z.B. wenn wir eine
									rechtliche Verpflichtung zur Datenaufbewahrung haben oder die
									Anfrage offensichtlich unbegründet oder übermäßig ist. Wir
									werden alle Einschränkungen bei der Beantwortung Ihrer Anfrage
									erläutern.
								</p>
							</div>
						</CardContent>
					</Card>

					{/* Data Sharing and Third Parties */}
					<Card id='weitergabe' className='mb-8'>
						<CardHeader>
							<CardTitle className='flex items-center gap-3'>
								<FileText className='text-primary h-6 w-6' />
								Datenweitergabe und -offenlegung
							</CardTitle>
						</CardHeader>
						<CardContent>
							<p className='mb-4 text-gray-600 dark:text-gray-300'>
								Wir können Ihre personenbezogenen Daten mit Dienstleistern und
								Anbietern teilen, die bei unseren Geschäftsabläufen helfen,
								einschließlich:
							</p>
							<ul className='mb-6 space-y-2 text-gray-600 dark:text-gray-300'>
								<li className='flex items-start gap-2'>
									<span className='bg-primary mt-2 h-2 w-2 flex-shrink-0 rounded-full'></span>
									<strong>Hosting-Dienste:</strong> Cloud-Infrastruktur-Anbieter
									für sichere Datenspeicherung und -verarbeitung
								</li>
								<li className='flex items-start gap-2'>
									<span className='bg-primary mt-2 h-2 w-2 flex-shrink-0 rounded-full'></span>
									<strong>Zahlungsabwickler:</strong> Sichere
									Transaktionsabwicklung und Abrechnungsdienste
								</li>
								<li className='flex items-start gap-2'>
									<span className='bg-primary mt-2 h-2 w-2 flex-shrink-0 rounded-full'></span>
									<strong>E-Mail-Kommunikation:</strong> Dienstleister für
									Transaktions- und Marketing-Kommunikation
								</li>
								<li className='flex items-start gap-2'>
									<span className='bg-primary mt-2 h-2 w-2 flex-shrink-0 rounded-full'></span>
									<strong>Kundensupport:</strong>{" "}
									Drittanbieter-Support-Plattformen und -tools
								</li>
								<li className='flex items-start gap-2'>
									<span className='bg-primary mt-2 h-2 w-2 flex-shrink-0 rounded-full'></span>
									<strong>Analytics-Dienste:</strong> Website- und
									Dienstnutzungsanalyse-Anbieter
								</li>
								<li className='flex items-start gap-2'>
									<span className='bg-primary mt-2 h-2 w-2 flex-shrink-0 rounded-full'></span>
									<strong>Marketing-Dienste:</strong> Werbe- und
									Remarketing-Plattformen (mit Ihrer Einwilligung)
								</li>
							</ul>

							<div className='mb-6'>
								<h3 className='mb-3 text-xl font-semibold text-gray-900 dark:text-white'>
									Unternehmensübertragungen
								</h3>
								<p className='text-gray-600 dark:text-gray-300'>
									Im Falle einer Fusion, Übernahme oder eines Verkaufs von
									Vermögenswerten können Ihre personenbezogenen Daten als Teil
									der Geschäftstransaktion übertragen werden. Wir stellen
									sicher, dass jede solche Übertragung angemessenen
									Schutzmaßnahmen unterliegt und Ihre Datenschutzrechte
									geschützt sind.
								</p>
							</div>

							<div className='mb-6'>
								<h3 className='mb-3 text-xl font-semibold text-gray-900 dark:text-white'>
									Rechtliche Anforderungen
								</h3>
								<p className='text-gray-600 dark:text-gray-300'>
									Wir können Ihre personenbezogenen Daten offenlegen, wenn dies
									gesetzlich vorgeschrieben ist, um rechtlichen Verpflichtungen
									nachzukommen oder unsere Rechte, unser Eigentum oder unsere
									Sicherheit sowie die unserer Nutzer oder anderer zu schützen.
								</p>
							</div>

							<div className='bg-primary/5 rounded-lg p-4'>
								<p className='text-sm text-gray-600 dark:text-gray-300'>
									<strong>Datenschutz:</strong> Alle Drittanbieter-Partner sind
									vertraglich verpflichtet, Ihre Daten zu schützen und geltende
									Datenschutzgesetze einzuhalten. Wir stellen sicher, dass jede
									Datenweitergabe angemessenen Schutzmaßnahmen und
									Datenverarbeitungsverträgen unterliegt.
								</p>
							</div>
						</CardContent>
					</Card>

					{/* Data Retention */}
					<Card id='aufbewahrung' className='mb-8'>
						<CardHeader>
							<CardTitle>Datenaufbewahrung</CardTitle>
						</CardHeader>
						<CardContent>
							<p className='mb-4 text-gray-600 dark:text-gray-300'>
								Wir bewahren Ihre personenbezogenen Informationen nur so lange
								auf, wie es erforderlich ist für:
							</p>
							<ul className='space-y-2 text-gray-600 dark:text-gray-300'>
								<li className='flex items-start gap-2'>
									<span className='bg-primary mt-2 h-2 w-2 flex-shrink-0 rounded-full'></span>
									Erfüllung der in dieser Richtlinie dargelegten Zwecke
								</li>
								<li className='flex items-start gap-2'>
									<span className='bg-primary mt-2 h-2 w-2 flex-shrink-0 rounded-full'></span>
									Einhaltung rechtlicher Verpflichtungen und regulatorischer
									Anforderungen
								</li>
								<li className='flex items-start gap-2'>
									<span className='bg-primary mt-2 h-2 w-2 flex-shrink-0 rounded-full'></span>
									Beilegung von Streitigkeiten und Durchsetzung unserer
									Vereinbarungen
								</li>
								<li className='flex items-start gap-2'>
									<span className='bg-primary mt-2 h-2 w-2 flex-shrink-0 rounded-full'></span>
									Aufrechterhaltung der Geschäftskontinuität und Servicequalität
								</li>
							</ul>
						</CardContent>
					</Card>

					{/* Cookie Policy */}
					<Card id='cookies' className='mb-8'>
						<CardHeader>
							<CardTitle className='flex items-center gap-3'>
								<Cookie className='text-primary h-6 w-6' />
								Cookies und Tracking-Technologien
							</CardTitle>
						</CardHeader>
						<CardContent>
							<p className='mb-4 text-gray-600 dark:text-gray-300'>
								Wir verwenden Cookies und ähnliche Tracking-Technologien, um
								wiederkehrende Nutzer zu erkennen und Web-Nutzungsverhalten zu
								verfolgen. Unsere Verwendung von Cookies umfasst:
							</p>

							<div className='mb-6'>
								<h3 className='mb-3 text-xl font-semibold text-gray-900 dark:text-white'>
									Arten von Cookies, die wir verwenden
								</h3>
								<ul className='space-y-3 text-gray-600 dark:text-gray-300'>
									<li className='flex items-start gap-2'>
										<span className='bg-primary mt-2 h-2 w-2 flex-shrink-0 rounded-full'></span>
										<div>
											<strong>Unbedingt erforderliche Cookies:</strong>{" "}
											Wesentlich für Website-Navigation und -Funktionalität,
											einschließlich Authentifizierung und
											Sicherheitsfunktionen.
										</div>
									</li>
									<li className='flex items-start gap-2'>
										<span className='bg-primary mt-2 h-2 w-2 flex-shrink-0 rounded-full'></span>
										<div>
											<strong>Analytics-Cookies:</strong> Helfen uns zu
											verstehen, wie Besucher mit unserer Website und unseren
											Diensten interagieren, um Leistung und Benutzererfahrung
											zu verbessern.
										</div>
									</li>
									<li className='flex items-start gap-2'>
										<span className='bg-primary mt-2 h-2 w-2 flex-shrink-0 rounded-full'></span>
										<div>
											<strong>Funktionalitäts-Cookies:</strong> Merken sich Ihre
											Präferenzen und Einstellungen, um personalisierte
											Erfahrungen zu bieten.
										</div>
									</li>
									<li className='flex items-start gap-2'>
										<span className='bg-primary mt-2 h-2 w-2 flex-shrink-0 rounded-full'></span>
										<div>
											<strong>Marketing- und Remarketing-Cookies:</strong>{" "}
											Werden für gezielte Werbung und Remarketing-Kampagnen
											verwendet (mit Ihrer Einwilligung).
										</div>
									</li>
								</ul>
							</div>

							<div className='mb-6'>
								<h3 className='mb-3 text-xl font-semibold text-gray-900 dark:text-white'>
									Verwaltung Ihrer Cookie-Einstellungen
								</h3>
								<p className='mb-3 text-gray-600 dark:text-gray-300'>
									Sie haben mehrere Optionen zur Verwaltung von Cookies:
								</p>
								<ul className='space-y-2 text-gray-600 dark:text-gray-300'>
									<li className='flex items-start gap-2'>
										<span className='bg-primary mt-2 h-2 w-2 flex-shrink-0 rounded-full'></span>
										Verwenden Sie unser Cookie-Einwilligungsbanner, um
										nicht-essenzielle Cookies zu akzeptieren oder abzulehnen
									</li>
									<li className='flex items-start gap-2'>
										<span className='bg-primary mt-2 h-2 w-2 flex-shrink-0 rounded-full'></span>
										Passen Sie Ihre Browser-Einstellungen an, um Cookies zu
										blockieren oder zu löschen
									</li>
									<li className='flex items-start gap-2'>
										<span className='bg-primary mt-2 h-2 w-2 flex-shrink-0 rounded-full'></span>
										Verwenden Sie Browser-Erweiterungen oder Datenschutz-Tools
										zur Tracking-Verwaltung
									</li>
								</ul>
							</div>

							<div className='bg-primary/5 rounded-lg p-4'>
								<p className='text-sm text-gray-600 dark:text-gray-300'>
									<strong>Hinweis:</strong> Das Deaktivieren bestimmter Cookies
									kann die Funktionalität unserer Website und Dienste
									beeinträchtigen. Essenzielle Cookies können nicht deaktiviert
									werden, da sie für grundlegende Website-Operationen
									erforderlich sind.
								</p>
							</div>
						</CardContent>
					</Card>

					{/* GDPR Legal Bases for Processing */}
					<Card id='rechtsgrundlagen' className='mb-8'>
						<CardHeader>
							<CardTitle className='flex items-center gap-3'>
								<Scale className='text-primary h-6 w-6' />
								Rechtsgrundlagen der Verarbeitung nach DSGVO
							</CardTitle>
						</CardHeader>
						<CardContent>
							<p className='mb-4 text-gray-600 dark:text-gray-300'>
								Wenn wir personenbezogene Daten von Personen in der EU/EWR
								verarbeiten, stützen wir uns auf eine oder mehrere der folgenden
								Rechtsgrundlagen:
							</p>
							<ul className='space-y-2 text-gray-600 dark:text-gray-300'>
								<li className='flex items-start gap-2'>
									<span className='bg-primary mt-2 h-2 w-2 flex-shrink-0 rounded-full'></span>
									<strong>Vertrag (Art. 6 Abs. 1 lit. b DSGVO):</strong> Zur
									Bereitstellung unserer Dienste und Erfüllung unserer
									Vereinbarungen mit Ihnen.
								</li>
								<li className='flex items-start gap-2'>
									<span className='bg-primary mt-2 h-2 w-2 flex-shrink-0 rounded-full'></span>
									<strong>Einwilligung (Art. 6 Abs. 1 lit. a DSGVO):</strong>{" "}
									Für optionale Funktionen wie Marketing-Kommunikation oder
									bestimmte Analytics-Cookies.
								</li>
								<li className='flex items-start gap-2'>
									<span className='bg-primary mt-2 h-2 w-2 flex-shrink-0 rounded-full'></span>
									<strong>
										Berechtigte Interessen (Art. 6 Abs. 1 lit. f DSGVO):
									</strong>{" "}
									Zur Verbesserung und Sicherung unserer Dienste, vorausgesetzt,
									diese Interessen werden nicht von Ihren Rechten überwogen.
								</li>
								<li className='flex items-start gap-2'>
									<span className='bg-primary mt-2 h-2 w-2 flex-shrink-0 rounded-full'></span>
									<strong>
										Rechtliche Verpflichtung (Art. 6 Abs. 1 lit. c DSGVO):
									</strong>{" "}
									Zur Einhaltung geltender Gesetze (z.B. Steuer- und
									Buchhaltungsvorschriften).
								</li>
							</ul>
						</CardContent>
					</Card>

					{/* International Data Transfers */}
					<Card id='datenuebertragung' className='mb-8'>
						<CardHeader>
							<CardTitle className='flex items-center gap-3'>
								<Globe className='text-primary h-6 w-6' />
								Internationale Datenübertragungen
							</CardTitle>
						</CardHeader>
						<CardContent>
							<p className='mb-4 text-gray-600 dark:text-gray-300'>
								Wir haben unseren Sitz in Deutschland und können
								personenbezogene Daten in den Vereinigten Staaten und anderen
								Ländern über unsere Dienstleister verarbeiten. Wenn wir
								personenbezogene Daten aus der EU/EWR in Länder übertragen, die
								kein angemessenes Schutzniveau bieten, implementieren wir
								angemessene Schutzmaßnahmen, um sicherzustellen, dass Ihre Daten
								geschützt bleiben.
							</p>

							<div className='mb-6'>
								<h3 className='mb-3 text-xl font-semibold text-gray-900 dark:text-white'>
									Schutzmaßnahmen für Datenübertragungen
								</h3>
								<ul className='space-y-2 text-gray-600 dark:text-gray-300'>
									<li className='flex items-start gap-2'>
										<span className='bg-primary mt-2 h-2 w-2 flex-shrink-0 rounded-full'></span>
										<strong>Standardvertragsklauseln (SCCs):</strong>{" "}
										EU-genehmigte Vertragsbedingungen zur Gewährleistung
										angemessenen Schutzes
									</li>
									<li className='flex items-start gap-2'>
										<span className='bg-primary mt-2 h-2 w-2 flex-shrink-0 rounded-full'></span>
										<strong>Zertifizierte Rahmenwerke:</strong> Wo anwendbar,
										zertifizierte Rahmenwerke wie das EU-US Data Privacy
										Framework
									</li>
									<li className='flex items-start gap-2'>
										<span className='bg-primary mt-2 h-2 w-2 flex-shrink-0 rounded-full'></span>
										<strong>Technische und organisatorische Maßnahmen:</strong>{" "}
										Zusätzliche Sicherheitsmaßnahmen zum Schutz übertragener
										Daten
									</li>
									<li className='flex items-start gap-2'>
										<span className='bg-primary mt-2 h-2 w-2 flex-shrink-0 rounded-full'></span>
										<strong>Datenverarbeitungsverträge:</strong> Vertragliche
										Verpflichtungen zur Einhaltung von Datenschutzgesetzen durch
										Dritte
									</li>
								</ul>
							</div>

							<div className='bg-primary/5 rounded-lg p-4'>
								<p className='text-sm text-gray-600 dark:text-gray-300'>
									<strong>Dienstleister:</strong> Wir verwenden Dienstleister
									wie Amazon Web Services und Zahlungsabwickler in den
									Vereinigten Staaten, die unter angemessenen
									Datenschutz-Rahmenwerken zertifiziert sind. Kopien unserer
									Datenübertragungsschutzmaßnahmen sind auf Anfrage verfügbar.
								</p>
							</div>
						</CardContent>
					</Card>

					{/* Children's Privacy */}
					<Card className='mb-8'>
						<CardHeader>
							<CardTitle>Datenschutz von Kindern</CardTitle>
						</CardHeader>
						<CardContent>
							<p className='text-gray-600 dark:text-gray-300'>
								Wir sammeln wissentlich keine Informationen von Kindern unter 13
								Jahren. Wenn wir feststellen, dass wir personenbezogene
								Informationen von einem Kind unter 13 Jahren gesammelt haben,
								werden wir diese sofort löschen. Wenn Sie glauben, dass wir
								Informationen von einem Kind unter 13 Jahren gesammelt haben,
								kontaktieren Sie uns bitte sofort.
							</p>
						</CardContent>
					</Card>

					{/* Updates to This Policy */}
					<Card className='mb-8'>
						<CardHeader>
							<CardTitle>Aktualisierungen dieser Richtlinie</CardTitle>
						</CardHeader>
						<CardContent>
							<p className='text-gray-600 dark:text-gray-300'>
								Wir überprüfen und aktualisieren diese Richtlinie regelmäßig, um
								Änderungen in unseren Praktiken und rechtlichen Anforderungen
								widerzuspiegeln. Wir werden Sie über wesentliche Änderungen per
								E-Mail oder durch eine auffällige Website-Benachrichtigung
								mindestens 30 Tage vor Inkrafttreten der Änderungen informieren.
								Ihre fortgesetzte Nutzung unserer Dienste nach solchen
								Änderungen stellt die Annahme der aktualisierten Richtlinie dar.
							</p>
						</CardContent>
					</Card>

					{/* Contact Information */}
					<Card id='kontakt' className='mb-8'>
						<CardHeader>
							<CardTitle className='flex items-center gap-3'>
								<Mail className='text-primary h-6 w-6' />
								Kontaktinformationen
							</CardTitle>
						</CardHeader>
						<CardContent>
							<p className='mb-4 text-gray-600 dark:text-gray-300'>
								Für datenschutzbezogene Anfragen, Betroffenenrechtsanfragen oder
								Fragen zu dieser Richtlinie können Sie uns über mehrere Kanäle
								erreichen:
							</p>

							<div className='mb-6 space-y-4'>
								<div className='flex items-start gap-3'>
									<Mail className='text-primary mt-1 h-5 w-5' />
									<div>
										<Link
											href='mailto:datenschutz@nogl.tech'
											className='text-primary font-medium hover:underline'
										>
											datenschutz@nogl.tech
										</Link>
										<p className='text-sm text-gray-500 dark:text-gray-400'>
											Primärer Datenschutz-Kontakt
										</p>
									</div>
								</div>
								<div className='flex items-start gap-3'>
									<Mail className='text-primary mt-1 h-5 w-5' />
									<div>
										<Link
											href='mailto:support@nogl.tech'
											className='text-primary font-medium hover:underline'
										>
											support@nogl.tech
										</Link>
										<p className='text-sm text-gray-500 dark:text-gray-400'>
											Allgemeiner Support und Hilfe
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
											Geschäftszeiten: Montag-Freitag, 9:00-17:00 MEZ
										</p>
									</div>
								</div>
								<div className='flex items-start gap-3'>
									<MapPin className='text-primary mt-1 h-5 w-5' />
									<div>
										<span className='font-medium text-gray-600 dark:text-gray-300'>
											Hamburg, Deutschland
										</span>
										<p className='text-sm text-gray-500 dark:text-gray-400'>
											Unser eingetragener Sitz
										</p>
									</div>
								</div>
							</div>

							<div className='space-y-4'>
								<div className='bg-primary/5 rounded-lg p-4'>
									<h4 className='mb-2 font-semibold text-gray-900 dark:text-white'>
										Betroffenenrechtsanfragen
									</h4>
									<p className='mb-2 text-sm text-gray-600 dark:text-gray-300'>
										Um Ihre Rechte nach der DSGVO auszuüben (Auskunft,
										Berichtigung, Löschung, Übertragbarkeit, etc.), kontaktieren
										Sie uns bitte mit:
									</p>
									<ul className='space-y-1 text-sm text-gray-600 dark:text-gray-300'>
										<li>• Ihrem vollständigen Namen und E-Mail-Adresse</li>
										<li>
											• Beschreibung des spezifischen Rechts, das Sie ausüben
											möchten
										</li>
										<li>• Relevante Kontoinformationen</li>
									</ul>
								</div>

								<div className='bg-primary/5 rounded-lg p-4'>
									<p className='text-sm text-gray-600 dark:text-gray-300'>
										<strong>Datenschutzbeauftragter:</strong> Nogl GmbH
										<br />
										<strong>Antwortzeit:</strong> Wir werden Ihre Anfrage
										innerhalb von 30 Tagen nach Eingang beantworten
										<br />
										<strong>Verifikation:</strong> Wir können zusätzliche
										Informationen zur Identitätsverifikation anfordern
									</p>
								</div>
							</div>
						</CardContent>
					</Card>

					{/* Supervisory Authority (EU/EEA) */}
					<Card className='mb-8'>
						<CardHeader>
							<CardTitle className='flex items-center gap-3'>
								<Landmark className='text-primary h-6 w-6' />
								Aufsichtsbehörde (EU/EWR)
							</CardTitle>
						</CardHeader>
						<CardContent>
							<p className='text-gray-600 dark:text-gray-300'>
								Wenn Sie sich in der EU/EWR befinden, haben Sie das Recht, eine
								Beschwerde bei Ihrer örtlichen Aufsichtsbehörde einzureichen. In
								Deutschland (Hamburg) wenden Sie sich bitte an den Hamburgischen
								Beauftragten für Datenschutz und Informationsfreiheit:{" "}
								<a
									className='text-primary underline'
									href='https://datenschutz-hamburg.de/'
									target='_blank'
									rel='noopener noreferrer'
								>
									datenschutz-hamburg.de
								</a>
								.
							</p>
						</CardContent>
					</Card>
				</div>
			</Section>
		</>
	);
};

export default DatenschutzPage;

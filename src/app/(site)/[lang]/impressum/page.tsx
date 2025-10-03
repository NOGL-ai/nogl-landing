import { Metadata } from "next";
import Breadcrumb from "@/components/Common/Breadcrumb";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://nogl.tech";

export const metadata: Metadata = {
	title: `Impressum | ${process.env.SITE_NAME}`,
	description:
		"Impressum und rechtliche Angaben gemäß § 5 TMG für Nogl - Professional Services Platform.",
};

const ImpressumPage = () => {
	const structuredData = {
		"@context": "https://schema.org",
		"@type": "Organization",
		name: "Nogl GmbH",
		description: "Professional Services Platform",
		url: `${siteUrl}/impressum`,
		address: {
			"@type": "PostalAddress",
			streetAddress: "Musterstraße 123",
			addressLocality: "Hamburg",
			postalCode: "20095",
			addressCountry: "DE",
		},
		contactPoint: {
			"@type": "ContactPoint",
			telephone: "+49-40-12345678",
			contactType: "customer service",
			email: "info@nogl.tech",
		},
		email: "info@nogl.tech",
		foundingDate: "2024",
		legalName: "Nogl GmbH",
	};

	return (
		<>
			<script
				type='application/ld+json'
				dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
			/>
			<Breadcrumb pageTitle='Impressum' />

			<div className='container py-16 lg:py-20'>
				<div className='mx-auto max-w-4xl'>
					<div className='mb-8'>
						<h1 className='mb-3 text-4xl font-bold'>Impressum</h1>
						<p className='text-lg text-gray-600 dark:text-gray-400'>
							Angaben gemäß § 5 TMG
						</p>
					</div>

					<div className='prose prose-lg dark:prose-invert max-w-none'>
						<div className='mb-8'>
							<h2 className='mb-4 text-2xl font-semibold'>Anbieter</h2>
							<p>
								<strong>Nogl GmbH</strong>
								<br />
								Musterstraße 123
								<br />
								20095 Hamburg
								<br />
								Deutschland
							</p>
						</div>

						<div className='mb-8'>
							<h2 className='mb-4 text-2xl font-semibold'>Kontakt</h2>
							<p>
								<strong>Telefon:</strong> +49 (0) 40 12345678
								<br />
								<strong>E-Mail:</strong>{" "}
								<a
									href='mailto:info@nogl.tech'
									className='text-primary hover:underline'
								>
									info@nogl.tech
								</a>
								<br />
								<strong>Website:</strong>{" "}
								<a
									href='https://nogl.tech'
									className='text-primary hover:underline'
								>
									https://nogl.tech
								</a>
							</p>
						</div>

						<div className='mb-8'>
							<h2 className='mb-4 text-2xl font-semibold'>Registereintrag</h2>
							<p>
								<strong>Handelsregister:</strong> Amtsgericht Hamburg
								<br />
								<strong>Registernummer:</strong> HRB 123456
								<br />
								<strong>Umsatzsteuer-ID:</strong> DE123456789
								<br />
								<strong>Geschäftsführer:</strong> Max Mustermann
							</p>
						</div>

						<div className='mb-8'>
							<h2 className='mb-4 text-2xl font-semibold'>
								Verantwortlich für den Inhalt nach § 55 Abs. 2 RStV
							</h2>
							<p>
								Max Mustermann
								<br />
								Musterstraße 123
								<br />
								20095 Hamburg
								<br />
								Deutschland
							</p>
						</div>

						<div className='mb-8'>
							<h2 className='mb-4 text-2xl font-semibold'>Streitschlichtung</h2>
							<p>
								Die Europäische Kommission stellt eine Plattform zur
								Online-Streitbeilegung (OS) bereit:
								<a
									href='https://ec.europa.eu/consumers/odr/'
									target='_blank'
									rel='noopener noreferrer'
									className='text-primary ml-1 hover:underline'
								>
									https://ec.europa.eu/consumers/odr/
								</a>
							</p>
							<p className='mt-4'>
								Unsere E-Mail-Adresse finden Sie oben im Impressum.
							</p>
							<p className='mt-4'>
								Wir sind nicht bereit oder verpflichtet, an
								Streitbeilegungsverfahren vor einer
								Verbraucherschlichtungsstelle teilzunehmen.
							</p>
						</div>

						<div className='mb-8'>
							<h2 className='mb-4 text-2xl font-semibold'>
								Haftung für Inhalte
							</h2>
							<p>
								Als Diensteanbieter sind wir gemäß § 7 Abs.1 TMG für eigene
								Inhalte auf diesen Seiten nach den allgemeinen Gesetzen
								verantwortlich. Nach §§ 8 bis 10 TMG sind wir als
								Diensteanbieter jedoch nicht unter der Verpflichtung,
								übermittelte oder gespeicherte fremde Informationen zu
								überwachen oder nach Umständen zu forschen, die auf eine
								rechtswidrige Tätigkeit hinweisen.
							</p>
							<p className='mt-4'>
								Verpflichtungen zur Entfernung oder Sperrung der Nutzung von
								Informationen nach den allgemeinen Gesetzen bleiben hiervon
								unberührt. Eine diesbezügliche Haftung ist jedoch erst ab dem
								Zeitpunkt der Kenntnis einer konkreten Rechtsverletzung möglich.
								Bei Bekanntwerden von entsprechenden Rechtsverletzungen werden
								wir diese Inhalte umgehend entfernen.
							</p>
						</div>

						<div className='mb-8'>
							<h2 className='mb-4 text-2xl font-semibold'>Haftung für Links</h2>
							<p>
								Unser Angebot enthält Links zu externen Websites Dritter, auf
								deren Inhalte wir keinen Einfluss haben. Deshalb können wir für
								diese fremden Inhalte auch keine Gewähr übernehmen. Für die
								Inhalte der verlinkten Seiten ist stets der jeweilige Anbieter
								oder Betreiber der Seiten verantwortlich. Die verlinkten Seiten
								wurden zum Zeitpunkt der Verlinkung auf mögliche Rechtsverstöße
								überprüft. Rechtswidrige Inhalte waren zum Zeitpunkt der
								Verlinkung nicht erkennbar.
							</p>
							<p className='mt-4'>
								Eine permanente inhaltliche Kontrolle der verlinkten Seiten ist
								jedoch ohne konkrete Anhaltspunkte einer Rechtsverletzung nicht
								zumutbar. Bei Bekanntwerden von Rechtsverletzungen werden wir
								derartige Links umgehend entfernen.
							</p>
						</div>

						<div className='mb-8'>
							<h2 className='mb-4 text-2xl font-semibold'>Urheberrecht</h2>
							<p>
								Die durch die Seitenbetreiber erstellten Inhalte und Werke auf
								diesen Seiten unterliegen dem deutschen Urheberrecht. Die
								Vervielfältigung, Bearbeitung, Verbreitung und jede Art der
								Verwertung außerhalb der Grenzen des Urheberrechtes bedürfen der
								schriftlichen Zustimmung des jeweiligen Autors bzw. Erstellers.
								Downloads und Kopien dieser Seite sind nur für den privaten,
								nicht kommerziellen Gebrauch gestattet.
							</p>
							<p className='mt-4'>
								Soweit die Inhalte auf dieser Seite nicht vom Betreiber erstellt
								wurden, werden die Urheberrechte Dritter beachtet. Insbesondere
								werden Inhalte Dritter als solche gekennzeichnet. Sollten Sie
								trotzdem auf eine Urheberrechtsverletzung aufmerksam werden,
								bitten wir um einen entsprechenden Hinweis. Bei Bekanntwerden
								von Rechtsverletzungen werden wir derartige Inhalte umgehend
								entfernen.
							</p>
						</div>

						<div className='mb-8'>
							<h2 className='mb-4 text-2xl font-semibold'>Bildnachweis</h2>
							<p>Die auf dieser Website verwendeten Bilder stammen von:</p>
							<ul className='mt-2 list-disc pl-6'>
								<li>Unsplash (unsplash.com)</li>
								<li>Pexels (pexels.com)</li>
								<li>Eigene Fotografien</li>
							</ul>
						</div>

						<div className='mb-8'>
							<h2 className='mb-4 text-2xl font-semibold'>
								Kontakt für rechtliche Angelegenheiten
							</h2>
							<p>
								Für rechtliche Anfragen und Beschwerden wenden Sie sich bitte
								an:
							</p>
							<p className='mt-2'>
								<strong>E-Mail:</strong>{" "}
								<a
									href='mailto:legal@nogl.tech'
									className='text-primary hover:underline'
								>
									legal@nogl.tech
								</a>
								<br />
								<strong>Telefon:</strong> +49 (0) 40 12345678
							</p>
						</div>

						<div className='mt-8 border-t border-gray-200 pt-8 text-sm text-gray-500 dark:border-gray-700 dark:text-gray-400'>
							<p>
								<strong>Stand:</strong> {new Date().toLocaleDateString("de-DE")}
							</p>
							<p className='mt-2'>
								Dieses Impressum wurde erstellt gemäß den Vorgaben des
								Telemediengesetzes (TMG) und der Datenschutz-Grundverordnung
								(DSGVO).
							</p>
						</div>
					</div>
				</div>
			</div>
		</>
	);
};

export default ImpressumPage;

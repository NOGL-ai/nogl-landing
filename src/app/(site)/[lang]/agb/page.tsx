import { Metadata } from "next";
import Breadcrumb from "@/components/Common/Breadcrumb";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://nogl.tech";
const siteName = process.env.SITE_NAME || "Nogl";

export const metadata: Metadata = {
  title: `Allgemeine Geschäftsbedingungen | ${process.env.SITE_NAME}`,
  description: 'Allgemeine Geschäftsbedingungen für die Nutzung der Nogl Professional Services Platform.',
  canonicalUrlRelative: "/agb",
};

const AGBPage = () => {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "Allgemeine Geschäftsbedingungen",
    "description": "Allgemeine Geschäftsbedingungen für die Nutzung der Nogl Professional Services Platform",
    "url": `${siteUrl}/agb`,
    "publisher": {
      "@type": "Organization",
      "name": "Nogl GmbH"
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <Breadcrumb pageTitle="Allgemeine Geschäftsbedingungen" />
      
      <div className="container py-16 lg:py-20">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-3">Allgemeine Geschäftsbedingungen</h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Gültig ab: {new Date().toLocaleDateString('de-DE')}
            </p>
          </div>

          <div className="prose prose-lg max-w-none dark:prose-invert">
            <div className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">1. Geltungsbereich</h2>
              <p>
                Willkommen bei {siteName} ("wir," "uns," "unser" oder "Unternehmen"). Diese Allgemeinen 
                Geschäftsbedingungen ("AGB") regeln Ihre Nutzung unserer Website unter{' '}
                <a href={siteUrl} className="text-primary hover:underline">{siteUrl}</a> und der damit 
                verbundenen Dienste (zusammen der "Dienst").
              </p>
              <p className="mt-4">
                Durch die Nutzung unseres Dienstes erklären Sie sich damit einverstanden, diese AGB und 
                unsere Datenschutzerklärung zu befolgen. Wenn Sie diesen AGB nicht zustimmen, dürfen Sie 
                den Dienst nicht nutzen.
              </p>
            </div>

            <div className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">2. Definitionen</h2>
              <p>Für die Zwecke dieser AGB gelten folgende Definitionen:</p>
              <ul className="list-disc pl-6 mt-2">
                <li><strong>"Dienst":</strong> Die von uns bereitgestellten Online-Dienste und Plattformen</li>
                <li><strong>"Nutzer":</strong> Jede Person, die den Dienst nutzt</li>
                <li><strong>"Inhalt":</strong> Alle Informationen, Daten, Texte, Software, Musik, Audio, 
                Fotografien, Grafiken, Videos, Nachrichten oder andere Materialien</li>
                <li><strong>"Konto":</strong> Ein registriertes Benutzerkonto auf unserer Plattform</li>
                <li><strong>"Drittanbieter":</strong> Externe Dienstleister und Partner</li>
              </ul>
            </div>

            <div className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">3. Nutzungsbedingungen</h2>
              <p>
                Sie müssen mindestens 18 Jahre alt sein oder die Zustimmung Ihrer Eltern/Erziehungsberechtigten 
                haben, um diesen Dienst zu nutzen. Sie sind verantwortlich für:
              </p>
              <ul className="list-disc pl-6 mt-2">
                <li>Die Richtigkeit und Aktualität Ihrer Kontoinformationen</li>
                <li>Die Sicherheit Ihres Kontos und Passworts</li>
                <li>Alle Aktivitäten, die unter Ihrem Konto stattfinden</li>
                <li>Die Einhaltung aller geltenden Gesetze und Vorschriften</li>
              </ul>
            </div>

            <div className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">4. Lizenz und Nutzungsrechte</h2>
              <p>
                Vorbehaltlich Ihrer Einhaltung dieser AGB gewähren wir Ihnen eine begrenzte, nicht-exklusive, 
                nicht übertragbare, widerrufliche Lizenz zur Nutzung des Dienstes für Ihre persönlichen oder 
                internen Geschäftszwecke.
              </p>
              <p className="mt-4">
                Diese Lizenz umfasst nicht:
              </p>
              <ul className="list-disc pl-6 mt-2">
                <li>Die Weiterverbreitung oder den Verkauf des Dienstes</li>
                <li>Reverse Engineering, Dekompilierung oder Disassemblierung</li>
                <li>Die Nutzung für kommerzielle Zwecke ohne unsere ausdrückliche Genehmigung</li>
                <li>Die Entfernung von Urheberrechts- oder anderen Eigentumsrechtshinweisen</li>
              </ul>
            </div>

            <div className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">5. Benutzerinhalte</h2>
              <p>
                Sie behalten alle Rechte an Inhalten, die Sie auf unserer Plattform veröffentlichen oder 
                hochladen ("Benutzerinhalte"). Durch das Hochladen gewähren Sie uns jedoch eine nicht-exklusive, 
                weltweite, gebührenfreie Lizenz zur Nutzung, Vervielfältigung, Bearbeitung und Verbreitung 
                Ihrer Inhalte im Zusammenhang mit dem Dienst.
              </p>
              <p className="mt-4">
                Sie garantieren, dass Ihre Inhalte:
              </p>
              <ul className="list-disc pl-6 mt-2">
                <li>Nicht illegal, schädlich oder rechtswidrig sind</li>
                <li>Nicht die Rechte Dritter verletzen</li>
                <li>Nicht beleidigend, diffamierend oder unangemessen sind</li>
                <li>Nicht gegen diese AGB verstoßen</li>
              </ul>
            </div>

            <div className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">6. Akzeptable Nutzung</h2>
              <p>
                Sie verpflichten sich, den Dienst nur für rechtmäßige Zwecke und in Übereinstimmung mit 
                diesen AGB zu nutzen. Sie verpflichten sich, Folgendes nicht zu tun:
              </p>
              <ul className="list-disc pl-6 mt-2">
                <li>Den Dienst für illegale oder unbefugte Zwecke zu nutzen</li>
                <li>Andere Nutzer zu belästigen, zu bedrohen oder zu missbrauchen</li>
                <li>Schädliche Software oder Malware zu verbreiten</li>
                <li>Unsere Systeme zu hacken oder zu manipulieren</li>
                <li>Spam oder unerwünschte Nachrichten zu versenden</li>
                <li>Urheberrechte oder andere geistige Eigentumsrechte zu verletzen</li>
                <li>Falsche oder irreführende Informationen zu verbreiten</li>
              </ul>
            </div>

            <div className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">7. Zahlungsbedingungen</h2>
              <p>
                Für kostenpflichtige Dienste gelten folgende Bedingungen:
              </p>
              <ul className="list-disc pl-6 mt-2">
                <li>Alle Preise verstehen sich inklusive der gesetzlichen Mehrwertsteuer</li>
                <li>Zahlungen sind im Voraus fällig, sofern nicht anders vereinbart</li>
                <li>Wir akzeptieren gängige Zahlungsmethoden (Kreditkarte, PayPal, SEPA)</li>
                <li>Bei Zahlungsverzug behalten wir uns das Recht vor, den Dienst zu sperren</li>
                <li>Rückerstattungen erfolgen nach unserem Rückerstattungsrichtlinien</li>
              </ul>
            </div>

            <div className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">8. Kündigung</h2>
              <p>
                Sie können Ihr Konto jederzeit kündigen, indem Sie uns kontaktieren. Wir können Ihr Konto 
                aus folgenden Gründen kündigen:
              </p>
              <ul className="list-disc pl-6 mt-2">
                <li>Verletzung dieser AGB oder unserer Richtlinien</li>
                <li>Betrügerische oder illegale Aktivitäten</li>
                <li>Längerer Inaktivität des Kontos</li>
                <li>Technische oder geschäftliche Gründe</li>
              </ul>
              <p className="mt-4">
                Bestimmte Bestimmungen dieser AGB bleiben nach der Kündigung in Kraft.
              </p>
            </div>

            <div className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">9. Haftungsausschluss</h2>
              <p>
                Der Dienst wird "wie besehen" und "wie verfügbar" bereitgestellt. Wir übernehmen keine 
                Gewährleistung für:
              </p>
              <ul className="list-disc pl-6 mt-2">
                <li>Die Verfügbarkeit oder Funktionalität des Dienstes</li>
                <li>Die Richtigkeit oder Vollständigkeit der Inhalte</li>
                <li>Die Sicherheit oder den Schutz vor Viren oder Malware</li>
                <li>Die Kompatibilität mit Ihren Geräten oder Systemen</li>
              </ul>
            </div>

            <div className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">10. Haftungsbeschränkung</h2>
              <p>
                Unsere Gesamthaftung für Ansprüche im Zusammenhang mit diesen AGB oder dem Dienst ist 
                auf den Betrag begrenzt, den Sie in den letzten 12 Monaten für den Dienst gezahlt haben.
              </p>
              <p className="mt-4">
                Wir haften nicht für:
              </p>
              <ul className="list-disc pl-6 mt-2">
                <li>Indirekte, zufällige oder Folgeschäden</li>
                <li>Verlust von Daten, Gewinn oder Geschäftsmöglichkeiten</li>
                <li>Schäden durch Drittanbieter oder externe Faktoren</li>
                <li>Ihre Verletzung dieser AGB</li>
              </ul>
            </div>

            <div className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">11. Streitbeilegung</h2>
              <p>
                Vor der Einleitung formeller Rechtsverfahren ermutigen wir Sie, sich direkt an uns zu 
                wenden, um Streitigkeiten informell zu lösen.
              </p>
              <p className="mt-4">
                Für Verbraucher gilt: Die Europäische Kommission stellt eine Plattform zur 
                Online-Streitbeilegung (OS) bereit: 
                <a href="https://ec.europa.eu/consumers/odr/" target="_blank" rel="noopener noreferrer" 
                   className="text-primary hover:underline ml-1">
                  https://ec.europa.eu/consumers/odr/
                </a>
              </p>
            </div>

            <div className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">12. Änderungen der AGB</h2>
              <p>
                Wir behalten uns das Recht vor, diese AGB jederzeit zu ändern. Bei Änderungen werden wir:
              </p>
              <ul className="list-disc pl-6 mt-2">
                <li>Das Datum der "Letzten Aktualisierung" oben in diesen AGB aktualisieren</li>
                <li>Sie über wesentliche Änderungen per E-Mail oder über den Dienst benachrichtigen</li>
                <li>Die neuen AGB auf unserer Website veröffentlichen</li>
              </ul>
              <p className="mt-4">
                Ihre fortgesetzte Nutzung des Dienstes nach Inkrafttreten der Änderungen stellt 
                Ihre Zustimmung zu den aktualisierten AGB dar.
              </p>
            </div>

            <div className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">13. Anwendbares Recht</h2>
              <p>
                Diese AGB unterliegen dem Recht der Bundesrepublik Deutschland unter Ausschluss des 
                UN-Kaufrechts (CISG).
              </p>
              <p className="mt-4">
                Gerichtsstand für alle Streitigkeiten aus oder im Zusammenhang mit diesen AGB ist 
                Hamburg, Deutschland, sofern Sie Kaufmann, juristische Person des öffentlichen Rechts 
                oder öffentlich-rechtliches Sondervermögen sind.
              </p>
              <p className="mt-4">
                Nichts in diesen AGB beschränkt Ihre Rechte als Verbraucher nach den geltenden 
                deutschen Verbraucherschutzgesetzen.
              </p>
            </div>

            <div className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">14. Kontakt</h2>
              <p>
                Bei Fragen zu diesen Allgemeinen Geschäftsbedingungen kontaktieren Sie uns bitte:
              </p>
              <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p>
                  <strong>Nogl GmbH</strong><br />
                  Musterstraße 123<br />
                  20095 Hamburg<br />
                  Deutschland
                </p>
                <p className="mt-2">
                  <strong>E-Mail:</strong> <a href="mailto:legal@nogl.tech" className="text-primary hover:underline">legal@nogl.tech</a><br />
                  <strong>Telefon:</strong> +49 (0) 40 12345678
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                  Rechtliche Anfragen
                </p>
              </div>
            </div>

            <div className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">15. Salvatorische Klausel</h2>
              <p>
                Sollten einzelne Bestimmungen dieser AGB unwirksam sein oder werden, bleibt die 
                Wirksamkeit der übrigen Bestimmungen unberührt. Die unwirksame Bestimmung wird durch 
                eine wirksame Bestimmung ersetzt, die dem wirtschaftlichen Zweck der unwirksamen 
                Bestimmung am nächsten kommt.
              </p>
            </div>

            <div className="text-sm text-gray-500 dark:text-gray-400 mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
              <p>
                <strong>Letzte Aktualisierung:</strong> {new Date().toLocaleDateString('de-DE')}
              </p>
              <p className="mt-2">
                Durch die Nutzung unseres Dienstes bestätigen Sie, dass Sie diese Allgemeinen 
                Geschäftsbedingungen gelesen, verstanden und akzeptiert haben.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AGBPage;
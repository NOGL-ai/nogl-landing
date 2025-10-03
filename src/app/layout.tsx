import "../styles/globals.scss";
import { Inter } from "next/font/google";
import Script from "next/script";
import { SpeedInsights } from "@vercel/speed-insights/next";
import ClientLayout from "./ClientLayout";
import { ThemeProvider } from "@/components/atoms/ThemeProvider";
import "@/styles/globals.css";
import "@/styles/sidebar-submenu-animations.css";

const inter = Inter({
	subsets: ["latin"],
	display: "swap",
	variable: "--font-inter",
});

const Layout = ({ children }: { children: React.ReactNode }) => {
	return (
		<html
			lang='en'
			className={`${inter.variable} scroll-smooth`}
			suppressHydrationWarning={true}
		>
			<head>
				{/* Theme initialization script to prevent flash of light mode */}
				<Script
					id='theme-init'
					strategy='beforeInteractive'
					dangerouslySetInnerHTML={{
						__html: `
              (function() {
                try {
                  // Set default dark theme immediately to prevent flash
                  document.documentElement.classList.add('dark');
                  
                  // Then check localStorage and update accordingly
                  var theme = localStorage.getItem('theme');
                  if (theme === 'light') {
                    document.documentElement.classList.remove('dark');
                  } else if (!theme) {
                    localStorage.setItem('theme', 'dark');
                  }
                } catch (e) {}
              })();
            `,
					}}
				/>

				{/* CookieYes Script */}
				{/* <Script
					id="cookieyes"
					strategy="beforeInteractive"
					src="https://cdn-cookieyes.com/client_data/4b51d26e7c5cf7c0c591c9b4/script.js"
				/> */}

				{/* Mailchimp Connected Site Script - Only load in production */}
				{process.env.NODE_ENV === 'production' && (
					<Script
						id='mcjs'
						strategy='afterInteractive'
						dangerouslySetInnerHTML={{
							__html: `!function(c,h,i,m,p){m=c.createElement(h),
            p=c.getElementsByTagName(h)[0],m.async=1,m.src=i,
            p.parentNode.insertBefore(m,p)}
            (document,"script","https://chimpstatic.com/mcjs-connected/js/users/730e2a5d4570de0714aa9bc71/c2b0a256050dd1866548b97fd.js");`,
						}}
					/>
				)}

				{/* Google Analytics Scripts */}
				<Script
					id='google-analytics-script'
					strategy='afterInteractive'
					src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GOOGLE_TAG_ID}`}
				/>
				<Script
					id='google-analytics-config'
					strategy='afterInteractive'
					dangerouslySetInnerHTML={{
						__html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${process.env.NEXT_PUBLIC_GOOGLE_TAG_ID}', {
                page_path: window.location.pathname,
                'consent': 'default'
              });
            `,
					}}
				/>
			</head>
			<body suppressHydrationWarning={true} className='antialiased'>
				<ThemeProvider>
					{children}
				</ThemeProvider>
				<SpeedInsights />
				{/* Videoask widget temporarily disabled
        <Script
          id="videoask-config"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.VIDEOASK_EMBED_CONFIG = {
                "kind": "widget",
                "url": "https://www.videoask.com/ftg9ocs0j",
                "options": {
                  "widgetType": "VideoThumbnailExtraLarge",
                  "text": "",
                  "backgroundColor": "#7D00FE",
                  "position": "bottom-right",
                  "dismissible": true,
                  "videoPosition": "center center"
                }
              }
            `
          }}
        />
        <Script
          id="videoask-embed"
          strategy="afterInteractive"
          src="https://www.videoask.com/embed/embed.js"
        />
        */}
			</body>
		</html>
	);
};

export default Layout;

import type { Config } from "tailwindcss";
import colors from "tailwindcss/colors";
const defaultTheme = require("tailwindcss/defaultTheme");

const config: Config = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  prefix: "",
  theme: {
  	fontFamily: {
  		satoshi: ["Satoshi", "sans-serif"],
  		inter: ["Inter", "sans-serif"],
  		body: ["var(--font-body)", "Inter", "sans-serif"],
  		display: ["var(--font-display)", "Inter", "sans-serif"],
  		mono: ["var(--font-mono)", "ui-monospace", "monospace"]
  	},
  	container: {
  		center: true,
  		padding: {
  			DEFAULT: '1rem',
  			sm: '2rem',
  			xl: '0',
  			'2xl': '128px'
  		},
  		screens: {
  			'2xl': '1400px'
  		}
  	},
  	screens: {
  		xsm: '375px',
  		lsm: '425px',
  		'3xl': '2000px',
  		...defaultTheme.screens
  	},
  	extend: {
		colors: {
			border: 'hsl(var(--border))',
			input: 'hsl(var(--input))',
			ring: 'hsl(var(--ring))',
			background: 'hsl(var(--background))',
			foreground: 'hsl(var(--foreground))',
			primary: {
				'50': 'var(--color-brand-50)',
				'100': 'var(--color-brand-100)',
				'200': 'var(--color-brand-200)',
				'300': 'var(--color-brand-300)',
				'400': 'var(--color-brand-400)',
				'500': 'var(--color-brand-500)',
				'600': 'var(--color-brand-600)',
				'700': 'var(--color-brand-700)',
				'800': 'var(--color-brand-800)',
				'900': 'var(--color-brand-900)',
				DEFAULT: 'hsl(var(--primary))',
				foreground: 'hsl(var(--primary-foreground))',
				dark: '#3E22E9'
			},
			secondary: {
				'50': 'var(--color-gray-50)',
				'100': 'var(--color-gray-100)',
				'200': 'var(--color-gray-200)',
				'300': 'var(--color-gray-300)',
				'400': 'var(--color-gray-400)',
				'500': 'var(--color-gray-500)',
				'600': 'var(--color-gray-600)',
				'700': 'var(--color-gray-700)',
				'800': 'var(--color-gray-800)',
				'900': 'var(--color-gray-900)',
				DEFAULT: 'hsl(var(--secondary))',
				foreground: 'hsl(var(--secondary-foreground))'
			},
			neutral: {
				'50': 'var(--color-gray-neutral-50)',
				'100': 'var(--color-gray-neutral-100)',
				'200': 'var(--color-gray-neutral-200)',
				'300': 'var(--color-gray-neutral-300)',
				'400': 'var(--color-gray-neutral-400)',
				'500': 'var(--color-gray-neutral-500)',
				'600': 'var(--color-gray-neutral-600)',
				'700': 'var(--color-gray-neutral-700)',
				'800': 'var(--color-gray-neutral-800)',
				'900': 'var(--color-gray-neutral-900)'
			},
			accent: {
				DEFAULT: 'hsl(var(--accent))',
				foreground: 'hsl(var(--accent-foreground))'
			},
			destructive: {
				DEFAULT: 'hsl(var(--destructive))',
				foreground: 'hsl(var(--destructive-foreground))'
			},
			popover: {
				DEFAULT: 'hsl(var(--popover))',
				foreground: 'hsl(var(--popover-foreground))'
			},
			card: {
				DEFAULT: 'hsl(var(--card))',
				foreground: 'hsl(var(--card-foreground))'
			},
			muted: {
				DEFAULT: 'hsl(var(--muted))',
				foreground: 'hsl(var(--muted-foreground))'
			},
  			dark: {
  				'2': '#495270',
  				'3': '#606882',
  				'4': '#8D93A5',
  				'5': '#BBBEC9',
  				DEFAULT: '#1C274C'
  			},
			gray: {
				'1': 'var(--color-gray-50)',
				'2': 'var(--color-gray-100)',
				'3': 'var(--color-gray-200)',
				'4': 'var(--color-gray-300)',
				'5': 'var(--color-gray-400)',
				'6': 'var(--color-gray-500)',
				'7': 'var(--color-gray-600)',
				DEFAULT: 'var(--color-gray-100)',
				dark: 'var(--color-gray-800)'
			},
			red: {
				...colors.red,
				DEFAULT: 'var(--color-error-500)',
				light: 'var(--color-error-400)',
				'light-5': 'var(--color-error-50)',
				'light-6': 'var(--color-error-100)'
			},
			green: {
				...colors.green,
				DEFAULT: 'var(--color-success-500)'
			},
			'bg-white-0': 'var(--color-white)',
			'bg-weak-100': 'var(--color-gray-100)',
			'text-main-900': 'var(--color-text-primary)',
			'text-sub-500': 'var(--color-text-tertiary)',
			'stroke-soft-200': 'var(--color-border-secondary)',
			'red-lighter': 'var(--color-error-300)',
			'red-base': 'var(--color-error-500)',
			'state-information': 'var(--color-blue-500)',
			'blue-base': 'var(--color-blue-500)',
			'text-soft-400': 'var(--color-text-quaternary)',
			'Alerts-Success-0': 'var(--color-success-50)',
			'Alerts-Success-200': 'var(--color-success-200)',
			'Greyscale-400': 'var(--color-gray-400)',
			'colorblack-70': 'var(--color-gray-700)',
			'primary-dark': 'var(--color-brand-800)',
			'primary-base': 'var(--color-brand-500)',
			'stroke-white-0': 'var(--color-white)',
			'neutral-300': 'var(--color-gray-neutral-300)',
			'bg-soft-200': 'var(--color-gray-200)'
  		},
  		borderRadius: {
  			'10': '10px',
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
  		fontSize: {
  			'heading-1': ["60px", "72px"],
  			'heading-2': ["48px", "58px"],
  			'heading-3': ["40px", "48px"],
  			'heading-4': ["35px", "45px"],
  			'heading-5': ["28px", "40px"],
  			'heading-6': ["24px", "30px"],
  			'custom-2xl': ["22px", "30px"],
  			'custom-3xl': ["32px", "40px"],
  			// Untitled UI text sizes
  			'display-xs': ["var(--text-display-xs)", { lineHeight: "var(--text-display-xs--line-height)" }],
  			'display-sm': ["var(--text-display-sm)", { lineHeight: "var(--text-display-sm--line-height)" }],
  			'display-md': ["var(--text-display-md)", { lineHeight: "var(--text-display-md--line-height)", letterSpacing: "var(--text-display-md--letter-spacing)" }],
  			'display-lg': ["var(--text-display-lg)", { lineHeight: "var(--text-display-lg--line-height)", letterSpacing: "var(--text-display-lg--letter-spacing)" }],
  			'display-xl': ["var(--text-display-xl)", { lineHeight: "var(--text-display-xl--line-height)", letterSpacing: "var(--text-display-xl--letter-spacing)" }],
  			'display-2xl': ["var(--text-display-2xl)", { lineHeight: "var(--text-display-2xl--line-height)", letterSpacing: "var(--text-display-2xl--letter-spacing)" }]
  		},
  		spacing: {
  			'10': '2.5rem',
  			'11': '2.75rem',
  			'13': '3.25rem',
  			'14': '3.5rem',
  			'15': '3.75rem',
  			'16': '4rem',
  			'17': '4.25rem',
  			'18': '4.5rem',
  			'19': '4.75rem',
  			'21': '5.25rem',
  			'22': '5.5rem',
  			'25': '6.25rem',
  			'26': '6.5rem',
  			'27': '6.75rem',
  			'29': '7.25rem',
  			'30': '7.5rem',
  			'31': '7.75rem',
  			'33': '8.25rem',
  			'34': '8.5rem',
  			'35': '8.75rem',
  			'37': '9.25rem',
  			'39': '9.75rem',
  			'40': '10rem',
  			'45': '11.25rem',
  			'46': '11.5rem',
  			'49': '12.25rem',
  			'50': '12.5rem',
  			'51': '12.75rem',
  			'52': '13rem',
  			'54': '13.5rem',
  			'55': '13.75rem',
  			'59': '14.75rem',
  			'60': '15rem',
  			'65': '16.25rem',
  			'67': '16.75rem',
  			'70': '17.5rem',
  			'75': '18.75rem',
  			'90': '22.5rem',
  			'94': '23.5rem',
  			'100': '25rem',
  			'110': '27.5rem',
  			'115': '28.75rem',
  			'125': '31.25rem',
  			'150': '37.5rem',
  			'180': '45rem',
  			'203': '50.75rem',
  			'230': '57.5rem',
  			'4.5': '1.125rem',
  			'5.5': '1.375rem',
  			'6.5': '1.625rem',
  			'7.5': '1.875rem',
  			'8.5': '2.125rem',
  			'9.5': '2.375rem',
  			'10.5': '2.625rem',
  			'11.5': '2.875rem',
  			'12.5': '3.125rem',
  			'13.5': '3.375rem',
  			'14.5': '3.625rem',
  			'15.5': '3.875rem',
  			'16.5': '4.125rem',
  			'17.5': '4.375rem',
  			'18.5': '4.625rem',
  			'19.5': '4.875rem',
  			'21.5': '5.375rem',
  			'22.5': '5.625rem',
  			'24.5': '6.125rem',
  			'25.5': '6.375rem',
  			'27.5': '6.875rem',
  			'29.5': '7.375rem',
  			'31.5': '7.875rem',
  			'32.5': '8.125rem',
  			'34.5': '8.625rem',
  			'36.5': '9.125rem',
  			'37.5': '9.375rem',
  			'39.5': '9.875rem',
  			'42.5': '10.625rem',
  			'47.5': '11.875rem',
  			'51.5': '12.875rem',
  			'52.5': '13.125rem',
  			'54.5': '13.625rem',
  			'55.5': '13.875rem',
  			'57.5': '14.375rem',
  			'62.5': '15.625rem',
  			'67.5': '16.875rem',
  			'72.5': '18.125rem',
  			'92.5': '23.125rem',
  			'122.5': '30.625rem',
  			'127.5': '31.875rem',
  			'132.5': '33.125rem',
  			'142.5': '35.625rem',
  			'166.5': '41.625rem',
  			'171.5': '42.875rem',
  			'187.5': '46.875rem',
  			'192.5': '48.125rem'
  		},
  		maxWidth: {
  			'30': '7.5rem',
  			'40': '10rem',
  			'50': '12.5rem'
  		},
  		zIndex: {
  			'1': '1',
  			'99': '99',
  			'999': '999',
  			'9999': '9999',
  			'99999': '99999',
  			'999999': '999999'
  		},
  		keyframes: {
  			'accordion-down': {
  				from: {
  					height: '0'
  				},
  				to: {
  					height: 'var(--radix-accordion-content-height)'
  				}
  			},
  			'accordion-up': {
  				from: {
  					height: 'var(--radix-accordion-content-height)'
  				},
  				to: {
  					height: '0'
  				}
  			},
  			'slide-down': {
  				from: {
  					height: '0px'
  				},
  				to: {
  					height: 'var(--radix-accordion-content-height)'
  				}
  			},
  			'slide-up': {
  				from: {
  					height: 'var(--radix-accordion-content-height)'
  				},
  				to: {
  					height: '0px'
  				}
  			},
  			'shiny-text': {
  				'0%, 90%, 100%': {
  					'background-position': 'calc(-100% - var(--shiny-width)) 0'
  				},
  				'30%, 60%': {
  					'background-position': 'calc(100% + var(--shiny-width)) 0'
  				}
  			},
  			'fade-in': {
  				from: { opacity: "0", transform: "translateY(-10px)" },
  				to: { opacity: "1", transform: "none" },
  			},
  			'fade-up': {
  				from: { opacity: "0", transform: "translateY(20px)" },
  				to: { opacity: "1", transform: "none" },
  			},
  			marquee: {
  				from: { transform: "translateX(0)" },
  				to: { transform: "translateX(calc(-100% - var(--gap)))" },
  			},
  			"marquee-vertical": {
  				from: { transform: "translateY(0)" },
  				to: { transform: "translateY(calc(-100% - var(--gap)))" },
  			},
  			'shimmer-slide': {
  				to: {
  					transform: 'translate(calc(100cqw - 100%), 0)'
  				}
  			},
  			'spin-around': {
  				'0%': {
  					transform: 'translateZ(0) rotate(0)'
  				},
  				'15%, 35%': {
  					transform: 'translateZ(0) rotate(90deg)'
  				},
  				'65%, 85%': {
  					transform: 'translateZ(0) rotate(270deg)'
  				},
  				'100%': {
  					transform: 'translateZ(0) rotate(360deg)'
  				}
  			},
			  pulse: {
				'0%, 100%': {
					boxShadow: '0 0 0 0 var(--pulse-color)'
				},
				'50%': {
					boxShadow: '0 0 0 8px var(--pulse-color)'
				}
			},
			rippling: {
				'0%': {
					opacity: '1'
				},
				'100%': {
					transform: 'scale(2)',
					opacity: '0'
				}
			},
			'border-beam': {
  				'100%': {
  					'offset-distance': '100%'
  				}
  			},
  			'aurora-border': {
  				'0%, 100%': {
  					borderRadius: '37% 29% 27% 27% / 28% 25% 41% 37%'
  				},
  				'25%': {
  					borderRadius: '47% 29% 39% 49% / 61% 19% 66% 26%'
  				},
  				'50%': {
  					borderRadius: '57% 23% 47% 72% / 63% 17% 66% 33%'
  				},
  				'75%': {
  					borderRadius: '28% 49% 29% 100% / 93% 20% 64% 25%'
  				}
  			},
  			'aurora-1': {
  				'0%, 100%': {
  					top: '0',
  					right: '0'
  				},
  				'50%': {
  					top: '50%',
  					right: '25%'
  				},
  				'75%': {
  					top: '25%',
  					right: '50%'
  				}
  			},
  			'aurora-2': {
  				'0%, 100%': {
  					top: '0',
  					left: '0'
  				},
  				'60%': {
  					top: '75%',
  					left: '25%'
  				},
  				'85%': {
  					top: '50%',
  					left: '50%'
  				}
  			},
  			'aurora-3': {
  				'0%, 100%': {
  					bottom: '0',
  					left: '0'
  				},
  				'40%': {
  					bottom: '50%',
  					left: '25%'
  				},
  				'65%': {
  					bottom: '25%',
  					left: '50%'
  				}
  			},
  			'aurora-4': {
  				'0%, 100%': {
  					bottom: '0',
  					right: '0'
  				},
  				'50%': {
  					bottom: '25%',
  					right: '40%'
  				},
  				'90%': {
  					bottom: '50%',
  					right: '25%'
  				}
  			}
  		},
  		animation: {
  			'accordion-down': 'accordion-down 0.2s ease-out',
  			'accordion-up': 'accordion-up 0.2s ease-out',
  			'slide-down': 'slide-down 300ms cubic-bezier(0.87, 0, 0.13, 1)',
  			'slide-up': 'slide-up 300ms cubic-bezier(0.87, 0, 0.13, 1)',
  			'shiny-text': 'shiny-text 4s infinite',
  			'fade-in': 'fade-in 1000ms var(--animation-delay, 0ms) ease forwards',
  			'fade-up': 'fade-up 1000ms var(--animation-delay, 0ms) ease forwards',
  			'marquee': 'marquee var(--duration) linear infinite',
  			"marquee-vertical": 'marquee-vertical var(--duration) linear infinite',
  			'shimmer-slide': 'shimmer-slide var(--speed) ease-in-out infinite alternate',
  			'spin-around': 'spin-around calc(var(--speed) * 2) infinite linear',
			'pulse': 'pulse var(--duration) ease-out infinite',
			'rippling': 'rippling var(--duration) ease-out',
			'border-beam': 'border-beam calc(var(--duration)*1s) infinite linear',
			'aurora-border': 'aurora-border 6s ease-in-out infinite',
			'aurora-1': 'aurora-1 12s ease-in-out infinite alternate',
			'aurora-2': 'aurora-2 12s ease-in-out infinite alternate',
			'aurora-3': 'aurora-3 12s ease-in-out infinite alternate',
			'aurora-4': 'aurora-4 12s ease-in-out infinite alternate'
  		},
  		boxShadow: {
  			'1': '0px 1px 2px 0px rgba(84, 87, 118, 0.10)',
  			error: '0px 12px 34px 0px rgba(13, 10, 44, 0.05)',
  			input: 'inset 0 0 0 2px #573CFF',
  			dropdown: '0px 4px 12px 0px rgba(15, 23, 42, 0.10)',
  			darkdropdown: '0px 4px 12px 0px rgba(255, 255, 255, 0.05)',
  			features: '0px 8px 20px 0px rgba(113, 116, 152, 0.05)',
  			testimonial: '0px 8px 10px -6px rgba(15, 23, 42, 0.06)',
  			'testimonial-2': '0px 15px 50px -6px rgba(15, 23, 42, 0.08)'
  		}
  	}
  },
  plugins: [
    require("tailwindcss-animate"),
    require("@tailwindcss/typography"),
    require("@tailwindcss/forms"),
    require("@tailwindcss/aspect-ratio"),
    function({ addVariant, addUtilities }: { addVariant: any; addUtilities: any }) {
      // Custom variants
      addVariant('dark', '&:where(.dark-mode, .dark-mode *)');
      addVariant('label', '& [data-label]');
      addVariant('focus-input-within', '&:has(input:focus)');
      
      // Custom utilities
      addUtilities({
        '.transition-inherit-all': {
          'transition-property': 'inherit',
          'transition-duration': 'inherit',
          'transition-timing-function': 'inherit',
        },
      });
    },
  ],
};

export default config;

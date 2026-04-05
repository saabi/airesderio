/**
 * Static registry for /theme — maps design tokens to where they appear.
 * Update when adding new token usage in components.
 */

export type ThemeRole =
	| 'foreground'
	| 'background'
	| 'border'
	| 'outline'
	| 'fill'
	| 'stroke'
	| 'shadow'
	| 'gradient'
	| 'accent'
	| 'mixed'
	| 'indirect';

export type ThemeUsageRow = {
	/** Component file, route, or area */
	where: string;
	/** UI element or style block */
	element?: string;
	roles: ThemeRole[];
};

export type ThemeTokenDoc = {
	/** CSS custom property including leading -- */
	token: string;
	/** How to render a preview swatch */
	swatch: 'background' | 'foreground' | 'overlay';
	usages: ThemeUsageRow[];
	/** Shown under the token when set */
	note?: string;
};

export type ThemeSectionDoc = {
	id: string;
	title: string;
	description?: string;
	tokens: ThemeTokenDoc[];
};

const indirect = (detail: string): ThemeUsageRow[] => [
	{ where: 'app.css', element: detail, roles: ['indirect'] }
];

/** Reference tokens with no direct .svelte usage (only app.css / token graph). */
const REF_NAMES_APP_ONLY = [
	'--ref-white',
	'--ref-black',
	'--ref-brand-secondary',
	'--ref-brand-dark',
	'--ref-brand-primary-text',
	'--ref-brand-accent',
	'--ref-brand-border',
	'--ref-muted',
	'--ref-mid',
	'--ref-contrast-low',
	'--ref-neutral-800',
	'--ref-neutral-700',
	'--ref-neutral-500',
	'--ref-neutral-400',
	'--ref-neutral-275',
	'--ref-neutral-150',
	'--ref-neutral-125',
	'--ref-sky-500',
	'--ref-sky-600',
	'--ref-blue-500',
	'--ref-blue-600',
	'--ref-blue-700',
	'--ref-green-400',
	'--ref-green-500',
	'--ref-green-600',
	'--ref-orange-500',
	'--ref-red-500',
	'--ref-red-accent',
	'--ref-purple-500',
	'--ref-emerald-600',
	'--ref-violet-500',
	'--ref-cyan-500',
	'--ref-indigo-600',
	'--ref-pink-600',
	'--ref-neutral-950',
	'--ref-neutral-980'
] as const;

function refToken(name: (typeof REF_NAMES_APP_ONLY)[number]): ThemeTokenDoc {
	return {
		token: name,
		swatch: 'background',
		usages: indirect('Defines or mixes into semantic tokens in :root')
	};
}

export const LITERAL_COLORS: {
	where: string;
	element: string;
	value: string;
	roles: ThemeRole[];
}[] = [
	{
		where: 'FloatingWhatsApp.svelte',
		element: 'WhatsApp button',
		value: '#25d366 / #20bd5a / #fff',
		roles: ['background', 'foreground', 'outline']
	},
	{
		where: 'Map.svelte',
		element: 'SVG / map skin (hex literals)',
		value: '#6d6d6d, #2f2f2f, #8b5431, #b8a77b, #d6a88e, #1a1a1a, #333, #fff, #00be4d',
		roles: ['mixed']
	},
	{
		where: 'Footer.svelte',
		element: 'Footer band gradient',
		value: 'linear #6d5140 → #352923',
		roles: ['gradient']
	},
	{
		where: 'Intro.svelte',
		element: 'Caption line',
		value: '#6D6D6D',
		roles: ['foreground']
	},
	{
		where: 'admin/contactos/+page.svelte',
		element: 'Destructive action button',
		value: '#b91c1c / #991b1b / #fff',
		roles: ['background', 'foreground']
	},
	{
		where: 'HabitatPrimeLogo.svelte',
		element: 'Partner logo SVG stops',
		value: '#0f172a, #deae00, #eed67f, …',
		roles: ['fill', 'gradient']
	},
	{
		where: 'branding/+page.svelte',
		element: 'Standalone branding mock',
		value: '#f8fafc, #1f2933, #020617, …',
		roles: ['mixed']
	},
	{
		where: 'SeriesHarmony.svelte / SeriesLuxury.svelte',
		element: 'Embedded SVG fills',
		value: '#ACA298, #333333',
		roles: ['fill']
	}
];

export const UNDEFINED_TOKENS: { token: string; where: string; note: string }[] = [
	{
		token: '--color-bg-subtle',
		where: 'FichaTecnicaPreview.svelte',
		note: 'Not defined in app.css — preview relies on browser fallback.'
	},
	{
		token: '--color-ink',
		where: 'Intro.svelte',
		note: 'Not defined in app.css — likely should be --color-text-primary or --ref-ink.'
	},
	{
		token: '--color-neutral-* / --color-muted',
		where: 'PhotoCarousel.svelte, CarouselDots.svelte, GoogleMap.svelte',
		note: 'Uses --color-neutral-300, --color-neutral-275, etc.; theme defines --ref-neutral-* only.'
	},
	{
		token: '--color-bg-base',
		where: 'admin/+layout.svelte, admin/login/+page.svelte',
		note: 'Not defined in app.css.'
	},
	{
		token: '--color-border',
		where: 'CircularButton.svelte',
		note: 'Not defined in app.css (likely meant --color-border-default).'
	}
];

const iconPack =
	'AguaPiscina, Ascensores, Banos, CafeCup, Carpinteria, Cocina, ConexionesAgua, ' +
	'EnergiaElectrica, Estacionamiento, GasNatural, Horno, HornoCampana, InstalacionElectrica, ' +
	'LadrillosCeramicos, Lavasecarropas, LuxuryTilde, MesadaGranito, MuroLadrillo, Piso, Puerta, ' +
	'TechosAltos, TerrazaPiscina, Termotanque, TomasCorriente, Ubicacion, UnidadesAire, Vestidor, HarmonyTilde (stroke)';

export const THEME_SECTIONS: ThemeSectionDoc[] = [
	{
		id: 'surface-text',
		title: 'Surfaces & text (functional)',
		description: 'Primary semantic colors for layout and typography.',
		tokens: [
			{
				token: '--color-bg-canvas',
				swatch: 'background',
				usages: [
					{ where: 'app.css', element: 'body', roles: ['background'] },
					{ where: 'PdfRequestModal.svelte', element: 'Modal shell', roles: ['background'] },
					{ where: 'FormToast.svelte', element: 'Toast panel', roles: ['background'] },
					{ where: 'admin/contactos/+page.svelte', element: 'Table / cells', roles: ['background'] },
					{ where: 'EquipmentLuxury / EquipmentHarmony', element: 'Section band', roles: ['background'] },
					{ where: 'FloorPlans.svelte', element: 'Plan chrome', roles: ['background'] },
					{ where: 'Hero.svelte', element: 'SVG polygon fill', roles: ['fill'] },
					{ where: 'CircularButton.svelte', element: 'Ghost hover wash', roles: ['background'] }
				]
			},
			{
				token: '--color-bg-surface',
				swatch: 'background',
				usages: indirect('Assigned in theme; extend here when components use it explicitly')
			},
			{
				token: '--color-bg-elevated',
				swatch: 'background',
				usages: [
					{ where: 'BuildingFeatures.svelte', element: 'Feature cards', roles: ['background'] },
					{ where: 'Header.svelte', element: 'Mobile menu panel', roles: ['background'] }
				]
			},
			{
				token: '--color-bg-muted',
				swatch: 'background',
				usages: [
					{ where: 'PhoneNumberInput.svelte', element: 'Country selector', roles: ['background'] },
					{ where: 'Location.svelte', element: 'Map legend rows', roles: ['background'] },
					{ where: 'CircularButton.svelte', element: 'Muted variant', roles: ['background'] }
				]
			},
			{
				token: '--color-bg-inset',
				swatch: 'background',
				usages: indirect('Token definition only in :root today')
			},
			{
				token: '--color-bg-interactive',
				swatch: 'background',
				usages: [
					{ where: 'Footer.svelte', element: 'Upper footer wash behind CTA', roles: ['background'] }
				]
			},
			{
				token: '--color-bg-contrast',
				swatch: 'background',
				usages: [
					{ where: 'admin/contactos/+page.svelte', element: 'Table header', roles: ['background'] },
					{ where: 'Location.svelte', element: 'Popovers / chips / panels', roles: ['background'] },
					{ where: 'PhotoCarousel.svelte', element: 'Lightbox chrome', roles: ['background'] },
					{ where: 'FloorPlans.svelte', element: 'Sticky controls', roles: ['background'] },
					{ where: 'PinLabel.svelte', element: 'Label bubble + arrow borders', roles: ['background', 'border'] },
					{ where: 'CircularButton.svelte', element: 'Contrast variant', roles: ['background'] },
					{ where: 'admin/+layout.svelte', element: 'Nav / panels', roles: ['background'] }
				]
			},
			{
				token: '--color-text-primary',
				swatch: 'foreground',
				usages: [
					{ where: 'app.css', element: 'body, headings', roles: ['foreground'] },
					{ where: 'ContactForm, PdfRequestModal, FormToast, PhoneNumberInput', element: 'Labels & copy', roles: ['foreground'] },
					{ where: 'admin/contactos/+page.svelte', element: 'Table text', roles: ['foreground'] },
					{ where: 'FichaTecnica*Preview', element: 'Body copy', roles: ['foreground'] },
					{ where: 'Intro.svelte', element: 'Card text', roles: ['foreground'] },
					{ where: 'Location.svelte', element: 'List / popover text', roles: ['foreground'] },
					{ where: 'Footer.svelte', element: 'Light column text', roles: ['foreground'] },
					{ where: 'Title.svelte', element: 'Title lines', roles: ['foreground'] },
					{ where: 'FloorPlans.svelte', element: 'Toolbar text', roles: ['foreground'] },
					{ where: 'PinLabel.svelte', element: 'Label text', roles: ['foreground'] },
					{ where: 'Highlight.svelte', element: 'Dark mode callout text', roles: ['foreground'] }
				]
			},
			{
				token: '--color-text-secondary',
				swatch: 'foreground',
				usages: [
					{ where: 'PdfRequestModal.svelte', element: 'Hints / secondary lines', roles: ['foreground'] },
					{ where: 'admin/contactos/+page.svelte', element: 'Muted table text', roles: ['foreground'] },
					{ where: 'FormToast.svelte', element: 'Secondary line', roles: ['foreground'] },
					{ where: 'Footer.svelte', element: 'Column copy', roles: ['foreground'] },
					{ where: 'Title.svelte', element: 'Subtitle', roles: ['foreground'] },
					{ where: 'ContactSection.svelte', element: 'Supporting text', roles: ['foreground'] },
					{ where: 'FloorPlans.svelte', element: 'Secondary control text', roles: ['foreground'] },
					{ where: 'CircularButton.svelte', element: 'Muted button', roles: ['foreground'] },
					{ where: 'admin/+layout.svelte', element: 'Nav secondary', roles: ['foreground'] }
				]
			},
			{
				token: '--color-text-secondary-dark',
				swatch: 'foreground',
				usages: [{ where: 'Location.svelte', element: 'Map sidebar lines', roles: ['foreground'] }]
			},
			{
				token: '--color-text-tertiary',
				swatch: 'foreground',
				usages: [
					{ where: 'DocListIcon.svelte', element: 'Icon caption', roles: ['foreground'] },
					{ where: 'PhoneNumberInput.svelte', element: 'Placeholder / hint', roles: ['foreground'] },
					{ where: 'Input.svelte / Textarea.svelte', element: 'Placeholder tone', roles: ['foreground'] },
					{ where: 'Location.svelte', element: 'Legend hints', roles: ['foreground'] },
					{ where: 'Footer.svelte', element: 'Bottom bar', roles: ['foreground'] }
				]
			},
			{
				token: '--color-text-inverse',
				swatch: 'foreground',
				usages: [
					{ where: 'Hero.svelte', element: 'Hero overlay copy', roles: ['foreground'] },
					{ where: 'Footer.svelte', element: 'Dark band headings / links', roles: ['foreground'] },
					{ where: 'Header.svelte', element: 'Menu icon bars (open state)', roles: ['foreground'] },
					{ where: 'CircularButton.svelte', element: 'Dark overlay buttons', roles: ['foreground'] },
					{ where: 'Location.svelte', element: 'Category chip text on pins', roles: ['foreground'] }
				]
			},
			{
				token: '--color-text-link',
				swatch: 'foreground',
				usages: [{ where: 'app.css', element: 'a default', roles: ['foreground'] }]
			},
			{
				token: '--color-text-on-accent',
				swatch: 'foreground',
				usages: [
					{ where: 'app.css', element: '.btn-cta-primary', roles: ['foreground'] },
					{ where: 'SkipLink.svelte', element: 'Skip link', roles: ['foreground'] },
					{ where: 'ContactForm, PdfRequestModal, FloorPlans, Equipment*', element: 'Teal CTA labels', roles: ['foreground'] },
					{ where: 'Footer.svelte', element: 'Teal CTA', roles: ['foreground'] },
					{ where: 'FloatingCTA.svelte', element: 'Floating button label', roles: ['foreground'] },
					{ where: 'CircularButton.svelte', element: 'Accent-filled states', roles: ['foreground'] }
				]
			},
			{
				token: '--color-text-on-light',
				swatch: 'foreground',
				usages: [
					{ where: 'Location.svelte', element: 'Light popover / legend text', roles: ['foreground'] },
					{ where: 'Highlight.svelte', element: 'Light callout copy', roles: ['foreground'] }
				]
			},
			{
				token: '--color-contrast-low',
				swatch: 'foreground',
				usages: [
					{ where: 'BuildingFeatures.svelte', element: 'Diagram labels', roles: ['foreground'] },
					{ where: 'IconTextRow.svelte', element: 'Row text', roles: ['foreground'] },
					{ where: 'FichaTecnica*Preview', element: 'Dense spec text', roles: ['foreground'] }
				]
			}
		]
	},
	{
		id: 'borders',
		title: 'Borders',
		tokens: [
			{
				token: '--color-border-subtle',
				swatch: 'background',
				usages: [
					{ where: 'admin/contactos/+page.svelte', element: 'Row separators', roles: ['border'] },
					{ where: 'BuildingFeatures.svelte', element: 'Card frame', roles: ['border'] },
					{ where: 'ContactSection.svelte', element: 'Section top rule', roles: ['border'] },
					{ where: 'Footer.svelte', element: 'Sub-footer rule', roles: ['border'] },
					{ where: 'Location.svelte', element: 'Popover frame', roles: ['border'] }
				],
				note: 'Preview swatch shows fill; used mainly as border-color.'
			},
			{
				token: '--color-border-default',
				swatch: 'background',
				usages: [
					{ where: 'admin/contactos/+page.svelte', element: 'Inputs / table', roles: ['border'] },
					{ where: 'PhoneNumberInput, Input, Textarea, Select', element: 'Fields', roles: ['border'] },
					{ where: 'ImageCarousel.svelte', element: 'Chrome', roles: ['border'] },
					{ where: 'FloorPlans.svelte', element: 'Layout outline', roles: ['border'] },
					{ where: 'Header.svelte', element: 'Menu panel border', roles: ['border'] },
					{ where: 'CircularButton.svelte', element: 'Ghost outline', roles: ['border'] },
					{ where: 'admin/+layout.svelte', element: 'Header rule & inputs', roles: ['border'] }
				]
			},
			{
				token: '--color-border-strong',
				swatch: 'background',
				usages: [
					{ where: 'Location.svelte', element: 'Map panel outline', roles: ['border'] },
					{ where: 'DocListIcon.svelte', element: 'Dashed placeholder', roles: ['border'] },
					{ where: 'PhoneNumberInput / Select / Input / Textarea', element: 'Focus ring border', roles: ['border', 'outline'] },
					{ where: 'FloorPlans.svelte', element: 'Popover border', roles: ['border'] },
					{ where: 'CircularButton.svelte', element: 'Contrast outline', roles: ['border'] }
				]
			},
			{
				token: '--color-border-title',
				swatch: 'background',
				usages: indirect('Reserved for title rules; add components when used')
			}
		]
	},
	{
		id: 'accent-status',
		title: 'Accent & status',
		tokens: [
			{
				token: '--color-accent-primary',
				swatch: 'background',
				usages: [
					{ where: 'app.css', element: '*:focus-visible', roles: ['outline'] },
					{ where: 'SkipLink.svelte', element: 'Link background', roles: ['background'] },
					{ where: 'PdfRequestModal.svelte', element: 'Accent heading', roles: ['foreground'] },
					{ where: 'admin/contactos/+page.svelte', element: 'Links / emphasis', roles: ['foreground'] },
					{ where: 'FormToast.svelte', element: 'Focus outline', roles: ['outline'] },
					{ where: 'FichaTecnica*Preview', element: 'Section titles', roles: ['foreground'] },
					{ where: 'Footer.svelte', element: 'Interactive links', roles: ['foreground'] },
					{ where: 'Title.svelte', element: 'Accent title span', roles: ['foreground'] },
					{ where: 'ContactSection.svelte', element: 'Section kicker', roles: ['foreground'] },
					{ where: 'Location.svelte', element: 'Pins, highlights, focus ring', roles: ['mixed'] },
					{ where: 'FloorPlans.svelte', element: 'Tab active text', roles: ['foreground'] },
					{ where: 'InteractiveFloorPlan.svelte', element: 'Zone fill/stroke', roles: ['fill', 'stroke'] },
					{ where: 'Highlight.svelte', element: 'Left border + wash', roles: ['border', 'background'] },
					{ where: 'CircularButton.svelte', element: 'Primary / icon buttons', roles: ['mixed'] },
					{ where: 'Header.svelte', element: 'Theme toggle focus', roles: ['outline'] },
					{ where: 'admin/+layout.svelte', element: 'Brand links', roles: ['foreground'] }
				],
				note: 'Also used as default --category-color on map pins.'
			},
			{
				token: '--color-accent-secondary',
				swatch: 'background',
				usages: [{ where: 'Header.svelte', element: 'Focus outline (alternate)', roles: ['outline'] }]
			},
			{
				token: '--color-accent-hover',
				swatch: 'background',
				usages: [{ where: 'CircularButton.svelte', element: 'Hover fill', roles: ['background'] }]
			},
			{
				token: '--color-accent-border',
				swatch: 'background',
				usages: indirect('Semantic token; prefer tracing from :root')
			},
			{
				token: '--color-accent-strong',
				swatch: 'background',
				usages: [{ where: 'CircularButton.svelte', element: 'Pressed border/fill', roles: ['mixed'] }]
			},
			{
				token: '--color-accent-primary-text',
				swatch: 'foreground',
				usages: [{ where: 'Header.svelte', element: 'Menu item text on light panel', roles: ['foreground'] }]
			},
			{
				token: '--color-success',
				swatch: 'background',
				usages: indirect('Defined for semantic maps; direct UI usage minimal')
			},
			{
				token: '--color-success-strong',
				swatch: 'background',
				usages: [{ where: 'Location.svelte', element: 'Mode toggle (success hue)', roles: ['background'] }]
			},
			{
				token: '--color-warning',
				swatch: 'background',
				usages: [{ where: 'Location.svelte', element: 'Mode toggle', roles: ['background'] }]
			},
			{
				token: '--color-danger',
				swatch: 'background',
				usages: [
					{ where: 'PhoneNumberInput.svelte', element: 'Invalid field border', roles: ['border'] }
				]
			},
			{
				token: '--color-danger-strong',
				swatch: 'foreground',
				usages: [{ where: 'PhoneNumberInput.svelte', element: 'Error text', roles: ['foreground'] }]
			},
			{
				token: '--color-info',
				swatch: 'background',
				usages: [{ where: 'Location.svelte', element: 'Public transport / mode UI', roles: ['background'] }]
			}
		]
	},
	{
		id: 'header-strip',
		title: 'Header bar',
		description: 'Fixed header uses its own literals in :root (not ref-mapped).',
		tokens: [
			{
				token: '--header-bg',
				swatch: 'background',
				usages: [
					{ where: 'Header.svelte', element: 'Bar, drawer backdrop', roles: ['background'] },
					{ where: 'Map.svelte', element: 'SimpleMap water mix input', roles: ['mixed'] }
				]
			},
			{
				token: '--header-text',
				swatch: 'foreground',
				usages: [
					{ where: 'Header.svelte', element: 'Nav labels, menu icon', roles: ['foreground'] }
				]
			},
			{
				token: '--header-text-muted',
				swatch: 'foreground',
				usages: indirect('Available on :root; add usage row when referenced in components')
			},
			{
				token: '--header-border',
				swatch: 'background',
				usages: [{ where: 'Header.svelte', element: 'Bar bottom edge', roles: ['border'] }]
			},
			{
				token: '--header-nav-text',
				swatch: 'foreground',
				usages: [{ where: 'Header.svelte', element: 'Desktop nav', roles: ['foreground'] }]
			},
			{
				token: '--header-active-underline',
				swatch: 'background',
				usages: [{ where: 'Header.svelte', element: 'Active link indicator', roles: ['border'] }]
			}
		]
	},
	{
		id: 'cta-teal',
		title: 'CTA teal',
		tokens: [
			{
				token: '--ref-cta-teal',
				swatch: 'background',
				usages: [
					{ where: 'app.css', element: '.btn-cta-primary', roles: ['background'] },
					{ where: 'ContactForm, PdfRequestModal, FloatingCTA, Footer, FloorPlans', element: 'Primary CTA', roles: ['background'] },
					{ where: 'EquipmentLuxury / EquipmentHarmony', element: 'Download buttons', roles: ['background'] },
					{ where: 'Map.svelte', element: 'Highlight + stroke', roles: ['stroke', 'mixed'] }
				]
			},
			{
				token: '--ref-cta-teal-hover',
				swatch: 'background',
				usages: [
					{ where: 'app.css', element: '.btn-cta-primary:hover', roles: ['background'] },
					{ where: 'ContactForm, PdfRequestModal, FloatingCTA', element: 'Hover', roles: ['background'] },
					{ where: 'Equipment*', element: 'Button border / hover', roles: ['border', 'background'] }
				]
			}
		]
	},
	{
		id: 'svg',
		title: 'SVG icon tokens',
		tokens: [
			{
				token: '--svg-fill-primary',
				swatch: 'foreground',
				usages: [
					{ where: iconPack, element: 'Equipment / amenity icons', roles: ['fill'] },
					{ where: 'HarmonyTilde.svelte', element: 'Stroke uses fill token', roles: ['stroke'] },
					{ where: 'Title.svelte', element: 'Decorative span', roles: ['foreground'] }
				]
			},
			{
				token: '--svg-fill-secondary',
				swatch: 'foreground',
				usages: indirect('Defined in :root; wired through theme for gold secondary')
			},
			{
				token: '--svg-fill-contrast',
				swatch: 'foreground',
				usages: [{ where: 'Lavasecarropas.svelte', element: 'Secondary path', roles: ['fill'] }]
			},
			{
				token: '--svg-stroke-primary',
				swatch: 'foreground',
				usages: indirect('Token graph / future SVG strokes')
			},
			{
				token: '--svg-stroke-contrast',
				swatch: 'foreground',
				usages: indirect('Token graph / future SVG strokes')
			},
			{
				token: '--color-icon-primary',
				swatch: 'foreground',
				usages: indirect('Alias of --color-text-primary in :root')
			},
			{
				token: '--color-icon-inverse',
				swatch: 'foreground',
				usages: indirect('Alias of --color-text-inverse in :root')
			}
		]
	},
	{
		id: 'overlays',
		title: 'Overlays, shadows, focus',
		tokens: [
			{
				token: '--overlay-black-80',
				swatch: 'overlay',
				usages: [
					{ where: 'PhotoCarousel.svelte', element: 'Lightbox scrim', roles: ['background'] },
					{ where: 'CircularButton.svelte', element: 'Overlay button', roles: ['background'] },
					{ where: 'Header.svelte', element: 'Mobile scrim', roles: ['background'] }
				]
			},
			{
				token: '--overlay-black-60',
				swatch: 'overlay',
				usages: [{ where: 'CircularButton.svelte', element: 'Overlay variant', roles: ['background'] }]
			},
			{
				token: '--overlay-black-40',
				swatch: 'overlay',
				usages: [{ where: 'Location.svelte', element: 'Text shadow on pins', roles: ['shadow'] }]
			},
			{
				token: '--overlay-white-strong',
				swatch: 'overlay',
				usages: [{ where: 'Header.svelte', element: 'Menu open fade', roles: ['background'] }]
			},
			{
				token: '--overlay-white-medium',
				swatch: 'overlay',
				usages: [{ where: 'Location.svelte', element: 'Chip border', roles: ['border'] }]
			},
			{
				token: '--overlay-white-soft',
				swatch: 'overlay',
				usages: indirect('Available for translucent white washes')
			},
			{
				token: '--overlay-black-30',
				swatch: 'overlay',
				usages: indirect('Feeds --shadow-medium')
			},
			{
				token: '--overlay-black-20',
				swatch: 'overlay',
				usages: indirect('Feeds --shadow-soft')
			},
			{
				token: '--overlay-black-10',
				swatch: 'overlay',
				usages: indirect('Feeds --shadow-subtle')
			},
			{
				token: '--brand-overlay-70',
				swatch: 'overlay',
				usages: [{ where: 'Location.svelte', element: 'Selected pin pulse', roles: ['shadow'] }]
			},
			{
				token: '--brand-overlay-30',
				swatch: 'overlay',
				usages: [{ where: 'Location.svelte', element: 'Pin halo', roles: ['shadow'] }]
			},
			{
				token: '--shadow-subtle',
				swatch: 'overlay',
				usages: [
					{ where: 'Header.svelte', element: 'Bar shadow', roles: ['shadow'] },
					{ where: 'Header.svelte', element: 'Menu panel shadow', roles: ['shadow'] }
				]
			},
			{
				token: '--shadow-soft',
				swatch: 'overlay',
				usages: [
					{ where: 'Footer.svelte', element: 'Footer lift shadow', roles: ['shadow'] },
					{ where: 'PhotoCarousel.svelte', element: 'Lightbox depth', roles: ['shadow'] },
					{ where: 'FloatingCTA.svelte', element: 'Button elevation', roles: ['shadow'] },
					{ where: 'CarouselLuxury / CarouselHarmony', element: 'Card shadow', roles: ['shadow'] }
				]
			},
			{
				token: '--shadow-medium',
				swatch: 'overlay',
				usages: [
					{ where: 'Location.svelte', element: 'Chips & panels', roles: ['shadow'] }
				]
			},
			{
				token: '--shadow-strong',
				swatch: 'overlay',
				usages: [{ where: 'Location.svelte', element: 'Selected markers', roles: ['shadow'] }]
			},
			{
				token: '--focus-ring',
				swatch: 'overlay',
				usages: indirect('Defined in :root; focus styles use --color-accent-primary in app.css today')
			}
		]
	},
	{
		id: 'categories',
		title: 'Map category colors',
		description: 'Injected as --category-color in Location.svelte from place data; values come from these tokens.',
		tokens: [
			'--category-edificio-principal',
			'--category-transporte',
			'--category-cultura-entretenimiento',
			'--category-infraestructura',
			'--category-lugares-historicos',
			'--category-parques-recreacion',
			'--category-museos',
			'--category-gastronomia',
			'--category-supermercados',
			'--category-servicios',
			'--category-vida-nocturna'
		].map((token) => ({
			token,
			swatch: 'background' as const,
			usages: [
				{
					where: 'Location.svelte',
					element: 'Map pins, legend dots (--category-color)',
					roles: ['background' as ThemeRole]
				}
			]
		}))
	},
	{
		id: 'reference-palette',
		title: 'Reference palette (--ref-*)',
		description:
			'OKLCH/hex building blocks. Most are only referenced from app.css to build semantic tokens; entries below call out direct component usage.',
		tokens: [
			...REF_NAMES_APP_ONLY.map((n) => refToken(n)),
			{
				token: '--ref-cream',
				swatch: 'background',
				usages: [
					{ where: 'Intro, BuildingFeatures, Location, Highlight, Footer, Map.svelte', element: 'Gradients & mixes', roles: ['mixed'] }
				]
			},
			{
				token: '--ref-neutral-200',
				swatch: 'background',
				usages: [
					{ where: 'Intro, BuildingFeatures, Map.svelte', element: 'Section / map paper mixes', roles: ['mixed'] }
				]
			},
			{
				token: '--ref-neutral-250',
				swatch: 'background',
				usages: [{ where: 'BuildingFeatures.svelte', element: 'Gradient stop', roles: ['gradient'] }]
			},
			{
				token: '--ref-neutral-300',
				swatch: 'background',
				usages: [{ where: 'Map.svelte', element: 'SimpleMap land/stroke mixes', roles: ['mixed'] }]
			},
			{
				token: '--ref-neutral-350',
				swatch: 'background',
				usages: [{ where: 'Map.svelte', element: 'Stroke mix', roles: ['stroke'] }]
			},
			{
				token: '--ref-neutral-600',
				swatch: 'background',
				usages: [{ where: 'Map.svelte', element: 'Road mix', roles: ['mixed'] }]
			},
			{
				token: '--ref-neutral-900',
				swatch: 'background',
				usages: [
					{ where: 'Footer.svelte', element: 'Border mix', roles: ['border'] },
					{ where: 'Header.svelte', element: 'Menu icon button', roles: ['background', 'border'] }
				]
			},
			{
				token: '--ref-ink',
				swatch: 'foreground',
				usages: [
					{ where: 'BuildingFeatures.svelte', element: 'Diagram text (with contrast fallback)', roles: ['foreground'] }
				]
			},
			{
				token: '--ref-brand-primary',
				swatch: 'background',
				usages: [
					{ where: 'Intro.svelte', element: 'Border-left accent, heading color', roles: ['border', 'foreground'] },
					{ where: 'branding/+page.svelte', element: 'accent-color', roles: ['accent'] },
					{ where: 'Location, Highlight, InteractiveFloorPlan', element: 'Fallback accent in var()', roles: ['mixed'] }
				]
			},
			{
				token: '--ref-brand-deep',
				swatch: 'background',
				usages: [
					{ where: 'Footer.svelte', element: 'Border mix + column wash', roles: ['mixed'] }
				]
			},
			{
				token: '--ref-gold',
				swatch: 'background',
				usages: [{ where: 'Footer.svelte', element: 'Card border mix', roles: ['border'] }]
			},
			{
				token: '--ref-gold-dark',
				swatch: 'foreground',
				usages: [{ where: 'Footer.svelte', element: 'Muted link color mix', roles: ['foreground'] }]
			}
		]
	}
];

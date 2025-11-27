<script module lang="ts">
	// ===== IMPORTS =====
	import ContactSection from '$lib/components/sections/ContactSection.svelte';
	import Equipment from '$lib/components/sections/Equipment.svelte';
	import FloorPlans from '$lib/components/sections/FloorPlans.svelte';
	import Hero from '$lib/components/sections/Hero.svelte';
	import Interior from '$lib/components/sections/Interior.svelte';
	import Intro from '$lib/components/sections/Intro.svelte';
	import Location from '$lib/components/sections/Location.svelte';

	// ===== STATIC CONSTANTS =====
	const DEFAULT_SITE_URL = 'https://airesderio.com';
</script>

<script lang="ts">
	// ===== IMPORTS =====
	import { page } from '$app/stores';

	// ===== DERIVED =====
	// Base URL for the site
	const siteUrl = import.meta.env.PUBLIC_SITE_URL || DEFAULT_SITE_URL;
	const canonicalUrl = $derived(`${siteUrl}${$page.url.pathname}`);

	// Structured data for real estate (JSON-LD)
	const structuredData = $derived.by(() => ({
		'@context': 'https://schema.org',
		'@type': 'RealEstateAgent',
		name: 'Aires de Río',
		description:
			'Moderno proyecto de departamentos con ubicación estratégica en el centro de Santiago del Estero. Departamentos de 2 y 4 ambientes amplios y luminosos.',
		url: siteUrl,
		address: {
			'@type': 'PostalAddress',
			streetAddress: 'Avenida Rivadavia',
			addressLocality: 'Santiago del Estero',
			addressRegion: 'Santiago del Estero',
			addressCountry: 'AR'
		},
		geo: {
			'@type': 'GeoCoordinates',
			latitude: -27.779686,
			longitude: -64.258992
		},
		hasOfferCatalog: {
			'@type': 'OfferCatalog',
			name: 'Departamentos en Venta',
			itemListElement: [
				{
					'@type': 'Offer',
					itemOffered: {
						'@type': 'Product',
						name: 'Departamento 2 ambientes',
						description: 'Departamento de 2 ambientes amplio y luminoso'
					}
				},
				{
					'@type': 'Offer',
					itemOffered: {
						'@type': 'Product',
						name: 'Departamento 4 ambientes',
						description: 'Departamento de 4 ambientes amplio y luminoso'
					}
				}
			]
		}
	}));
</script>

<svelte:head>
	<!-- Meta Description -->
	<meta
		name="description"
		content="Aires de Río es un moderno proyecto de departamentos en Santiago del Estero con ubicación estratégica. Departamentos de 2 y 4 ambientes con las mejores prestaciones y comodidades."
	/>

	<!-- Keywords -->
	<meta
		name="keywords"
		content="departamentos Santiago del Estero, Aires de Río, edificio residencial, departamentos en venta, propiedades Santiago del Estero, edificio nuevo, preventa departamentos"
	/>

	<!-- Canonical URL -->
	<link rel="canonical" href={canonicalUrl} />

	<!-- Open Graph / Facebook -->
	<meta property="og:type" content="website" />
	<meta property="og:url" content={canonicalUrl} />
	<meta property="og:title" content="Aires de Río - Departamentos en Santiago del Estero" />
	<meta
		property="og:description"
		content="Moderno proyecto de departamentos con ubicación estratégica en el centro de Santiago del Estero. Departamentos de 2 y 4 ambientes amplios y luminosos."
	/>
	<meta property="og:image" content={`${siteUrl}/og-image.jpg`} />
	<meta property="og:image:width" content="1200" />
	<meta property="og:image:height" content="630" />
	<meta property="og:image:alt" content="Aires de Río - Fachada del edificio" />
	<meta property="og:locale" content="es_AR" />
	<meta property="og:site_name" content="Aires de Río" />

	<!-- Twitter Card -->
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:url" content={canonicalUrl} />
	<meta name="twitter:title" content="Aires de Río - Departamentos en Santiago del Estero" />
	<meta
		name="twitter:description"
		content="Moderno proyecto de departamentos con ubicación estratégica en el centro de Santiago del Estero."
	/>
	<meta name="twitter:image" content={`${siteUrl}/og-image.jpg`} />
	<meta name="twitter:image:alt" content="Aires de Río - Fachada del edificio" />

	<!-- Structured Data (JSON-LD) -->
	{@html `<script type="application/ld+json">${JSON.stringify(structuredData)}</script>`}
</svelte:head>

<div class="wrap page">
	<Hero />

	<p class="welcome">
		Santiago del Estero da la bienvenida a Aires de Río, un nuevo proyecto de departamentos con las
		mejores prestaciones y estratégica ubicación.
	</p>

	<Intro />
	<Location jsonUrl='/lugares/lugares-direcciones.json' showPlaceMarkers={true} />
	<Interior />
	<Equipment />
	<FloorPlans />
	<ContactSection />
</div>

<style>
	.welcome {
		/* Layout */
		display: block;
		max-width: 60em;
		padding: 1.125rem;
		margin: 1rem auto;
		
		/* Box/Visual */
		background: var(--color-neutral-200);
		border-radius: 0.625rem;
		
		/* Typography */
		font-size: 1.2rem;
		font-weight: 500;
		color: var(--color-ink);
		text-align: center;
	}
</style>

<script module lang='ts'>
	// ===== IMPORTS =====
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import AiresDeRioLogo from '$lib/components/ui/AiresDeRioLogo.svelte';
	import { siteNavLinks } from '$lib/data/site-nav-links';
	import { menuStore } from '$lib/stores/menu';

	interface Props {
		adminEmail?: string | null;
	}

	// ===== STATIC CONSTANTS =====
	const isDevMode = import.meta.env.DEV;

	const navLinks = siteNavLinks;
</script>

<script lang='ts'>
	// ===== PROPS =====
	let { adminEmail = null }: Props = $props();

	// ===== STATE =====
	let colorEditorOpen = $state(false);
	let devColorEditorModule = $state<
		typeof import('$lib/components/dev/DevColorEditor.svelte') | null
	>(null);
	let activeLinkId = $state<string>('top');
	let HEADER_HEIGHT = $state(80); // Will be set from CSS variable on mount

	// ===== LIFECYCLE =====
	onMount(() => {
		if (isDevMode) {
			void import('$lib/components/dev/DevColorEditor.svelte').then((module) => {
				devColorEditorModule = module;
			});
		}

		// Get header height from CSS variable
		if (browser) {
			const headerElement = document.querySelector('.site') as HTMLElement;
			if (headerElement) {
				const computedHeight = getComputedStyle(headerElement).height;
				HEADER_HEIGHT = parseFloat(computedHeight) || 80;
			}

			// Update active link on scroll
			updateActiveLink();
			window.addEventListener('scroll', updateActiveLink, { passive: true });
			window.addEventListener('resize', updateActiveLink, { passive: true });

			return () => {
				window.removeEventListener('scroll', updateActiveLink);
				window.removeEventListener('resize', updateActiveLink);
			};
		}
	});

	// ===== FUNCTIONS =====
	function toggleMenu() {
		menuStore.toggle();
	}

	function handleNavClick(event: MouseEvent, href: string) {
		// Close mobile menu if open
		if ($menuStore) {
			menuStore.close();
		}

		// Smooth scroll when on home page and link is to same-page anchor
		if (browser && (href === '/' || href.startsWith('/#'))) {
			const hash = href.includes('#') ? href.split('#')[1] : 'top';
			if (window.location.pathname === '/' && hash) {
				const targetElement = document.getElementById(hash);
				if (targetElement) {
					event.preventDefault();
					const targetPosition =
						targetElement.getBoundingClientRect().top + window.pageYOffset - HEADER_HEIGHT;
					window.scrollTo({ top: targetPosition, behavior: 'smooth' });
				}
			}
		}
	}

	function updateActiveLink() {
		if (!browser) return;

		const sections = navLinks
			.map((link) => {
				const element = document.getElementById(link.id);
				if (!element) return null;
				const rect = element.getBoundingClientRect();
				return {
					id: link.id,
					top: rect.top,
					bottom: rect.bottom,
					height: rect.height
				};
			})
			.filter(Boolean) as Array<{ id: string; top: number; bottom: number; height: number }>;

		if (sections.length === 0) return;

		const scrollPosition = window.scrollY + 100; // Offset for header

		// Find the section currently in view
		let currentSection = sections[0].id;

		for (const section of sections) {
			if (scrollPosition >= section.top && scrollPosition < section.bottom) {
				currentSection = section.id;
				break;
			}
		}

		// If scrolled past all sections, use the last one
		if (scrollPosition >= sections[sections.length - 1].top) {
			currentSection = sections[sections.length - 1].id;
		}

		// If at the top, use the first section
		if (scrollPosition < sections[0].top) {
			currentSection = sections[0].id;
		}

		activeLinkId = currentSection;
	}
</script>

<header class='site'>
	<div class='bar'>
		<a
			href='/'
			class='logo-home'
			aria-label='Aires de Río — Inicio'
			aria-current={activeLinkId === 'top' ? 'page' : undefined}
			onclick={(e) => handleNavClick(e, '/')}
		>
			<AiresDeRioLogo class='logo' height='2.2em' theme='dark' decorative />
		</a>
		<nav
			id='main-nav'
			class='main-nav'
			class:is-open={$menuStore}
			aria-label='Navegación principal'
		>
			<ul class='desktop-nav'>
				{#each navLinks as link (link.id)}
					<li>
						<a
							href={link.href}
							aria-current={activeLinkId === link.id ? 'page' : undefined}
							onclick={(e) => handleNavClick(e, link.href)}
							class:active={activeLinkId === link.id}
						>
							{link.label}
						</a>
					</li>
				{/each}
				{#if adminEmail}
					<li>
						<a href='/admin/contactos'>Contactos</a>
					</li>
					<li>
						<form action='/api/admin/logout' method='post' class='logout-form'>
							<button type='submit' class='logout-btn'>Salir</button>
						</form>
					</li>
				{/if}
			</ul>
		</nav>
		<div class='header-controls'>
			{#if isDevMode}
				<button
					id='color-editor-toggle'
					class='color-editor-toggle'
					onclick={() => (colorEditorOpen = !colorEditorOpen)}
					aria-label='Editor de colores'
					aria-expanded={colorEditorOpen}
					type='button'
				>
					🎨
				</button>
			{/if}
			<button
				id='nav-toggle'
				class='nav-toggle'
				class:is-open={$menuStore}
				aria-label={$menuStore ? 'Cerrar menú' : 'Abrir menú'}
				aria-expanded={$menuStore}
				aria-controls='main-nav'
				onclick={toggleMenu}
			>
				<span class='icon-bar'></span>
				<span class='icon-bar'></span>
				<span class='icon-bar'></span>
			</button>
		</div>
	</div>
	{#if isDevMode && devColorEditorModule}
		{@const DevColorEditor = devColorEditorModule.default}
		<DevColorEditor open={colorEditorOpen} onClose={() => (colorEditorOpen = false)} />
	{/if}
</header>

<style>
	.site {
		/* Positioning */
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		z-index: 50;

		/* Layout */
		width: 100%;
		height: var(--header-height);

		/* Box/Visual */
		background: var(--header-bg) !important;
		border-bottom: 1px solid var(--header-border);
		box-shadow: 0 0.125rem 0.375rem var(--shadow-subtle);
	}

	:global(:root[data-theme='dark']) .site {
		/* Box/Visual */
		background: var(--header-bg) !important;
		border-bottom: 1px solid var(--header-border);
		box-shadow: 0 0.125rem 0.375rem var(--shadow-subtle);
	}

	.bar {
		/* Layout */
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0.75rem 2em;
		box-sizing: border-box;

		/* Box/Visual */
		background: var(--header-bg) !important;
	}

	.logo-home {
		display: inline-flex;
		align-items: center;
		text-decoration: none;
		color: inherit;
	}

	:global(.logo) {
		color: var(--header-text);
	}

	@media (max-width: 640px) {
		.bar {
			/* Layout */
			padding: 0.75rem 1rem;
		}
	}

	:global(:root[data-theme='dark']) .bar {
		/* Box/Visual */
		background: var(--header-bg) !important;
	}

	:global(:root[data-theme='dark']) :global(.logo) {
		color: var(--header-text);
	}

	.desktop-nav {
		/* Layout */
		display: flex;
		gap: 1.125rem;
		list-style: none;
		margin: 0;
		padding: 0;
	}

	.desktop-nav a {
		/* Layout */
		padding: 0.375rem 0.125rem;

		/* Box/Visual */
		border-bottom: 2px solid transparent;

		/* Typography */
		font-family: var(--font-body);
		font-weight: var(--font-weight-semibold);
		text-decoration: none;
		text-transform: uppercase;
		color: var(--header-nav-text);
	}

	:global(:root[data-theme='dark']) .desktop-nav a {
		/* Typography */
		color: var(--header-text);
	}

	.desktop-nav a:hover {
		/* Box/Visual */
		color: var(--header-nav-text-hover);
		border-color: var(--header-active-underline);
	}

	.desktop-nav a[aria-current='page'],
	.desktop-nav a.active {
		/* Box/Visual */
		border-color: var(--header-active-underline);
	}

	.logout-form {
		display: inline;
	}

	.logout-btn {
		padding: 0.375rem 0.125rem;
		font-family: var(--font-body);
		font-weight: var(--font-weight-semibold);
		font-size: inherit;
		text-transform: uppercase;
		color: inherit;
		background: none;
		border: none;
		border-bottom: 2px solid transparent;
		cursor: pointer;
	}

	.desktop-nav .logout-btn {
		color: var(--header-text);
	}

	:global(:root[data-theme='dark']) .desktop-nav .logout-btn {
		color: var(--header-text);
	}

	.logout-btn:hover {
		border-color: var(--header-active-underline);
	}

	.header-controls {
		/* Positioning */
		z-index: 1001;

		/* Layout */
		display: flex;
		align-items: center;
		gap: 0.75rem;
	}

	.color-editor-toggle {
		/* Layout */
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 2.25rem;
		height: 2.25rem;

		/* Box/Visual */
		border: 1px solid var(--ref-neutral-900);
		border-radius: 999px;
		background: var(--ref-neutral-900);

		/* Typography */
		font-size: 1.1rem;
		color: var(--color-text-inverse);

		/* Misc/Overrides */
		cursor: pointer;

		/* Effects & Motion */
		transition:
			transform 0.2s ease,
			box-shadow 0.2s ease;
	}

	:global(:root[data-theme='dark']) .color-editor-toggle {
		/* Box/Visual */
		border: 1px solid var(--color-border-default);
		background: var(--color-bg-elevated);

		/* Typography */
		color: var(--color-accent-primary-text);
	}

	.color-editor-toggle:hover {
		/* Box/Visual */
		box-shadow: 0 0.5rem 1rem var(--shadow-subtle);

		/* Effects & Motion */
		transform: translateY(-1px);
	}

	.nav-toggle {
		/* Positioning */
		z-index: 1001;

		/* Layout */
		display: none; /* Hidden by default */
		padding: 0.3125rem;

		/* Box/Visual */
		background: none;
		border: none;

		/* Misc/Overrides */
		cursor: pointer;
	}

	.nav-toggle .icon-bar {
		/* Layout */
		display: block;
		width: 1.5rem;
		height: 3px;
		margin: 0.3125rem 0;

		/* Box/Visual */
		background-color: var(--header-text);

		/* Effects & Motion */
		transition: all 0.2s;
	}

	:global(:root[data-theme='dark']) .nav-toggle .icon-bar {
		/* Box/Visual */
		background-color: var(--header-text);
	}

	@media (max-width: 850px) {
		/* Mobile Nav */
		.nav-toggle {
			/* Layout */
			display: block; /* Show hamburger */
		}

		.main-nav {
			/* Positioning */
			position: fixed;
			top: 0;
			left: 0;
			right: 0;

			/* Layout */
			display: flex;
			align-items: center;
			justify-content: center;
			width: 100%;
			height: 100%;

			/* Box/Visual */
			background-color: var(--overlay-black-80);
			-webkit-backdrop-filter: blur(0.3125rem);
			backdrop-filter: blur(0.3125rem);
			opacity: 0;
			visibility: hidden;

			/* Effects & Motion */
			transition:
				opacity 0.3s ease,
				visibility 0.3s ease;
		}

		:global(:root[data-theme='dark']) .main-nav {
			/* Box/Visual */
			background-color: var(--overlay-white-strong);
		}

		.main-nav.is-open {
			/* Box/Visual */
			opacity: 1;
			visibility: visible;
		}

		/* Style the X for the close button */
		.nav-toggle.is-open .icon-bar:nth-child(1) {
			/* Effects & Motion */
			transform: translateY(0.5rem) rotate(45deg);
		}

		.nav-toggle.is-open .icon-bar:nth-child(2) {
			/* Box/Visual */
			opacity: 0;
		}

		.nav-toggle.is-open .icon-bar:nth-child(3) {
			/* Effects & Motion */
			transform: translateY(-0.5rem) rotate(-45deg);
		}

		.desktop-nav {
			/* Layout */
			flex-direction: column;
			align-items: center;
			gap: 1.5rem;
		}

		.desktop-nav a {
			/* Typography */
			font-size: 1.5rem;
		}
	}

	/* Prevent body scroll when mobile menu is open */
	:global(body.nav-open) {
		overflow: hidden;
	}
</style>

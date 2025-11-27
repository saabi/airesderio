<script module lang="ts">
	// ===== TYPES =====
	type NavLink = {
		href: string;
		text: string;
		id: string;
	};

	// ===== STATIC CONSTANTS =====
	const isDevMode = import.meta.env.DEV;
	const HEADER_HEIGHT = 80; // Approximate header height

	const navLinks: NavLink[] = [
		{ href: '#top', text: 'Home', id: 'top' },
		{ href: '#ubicacion', text: 'Ubicación', id: 'ubicacion' },
		{ href: '#planos', text: 'Planos', id: 'planos' },
		{ href: '#equipados', text: 'Equipamiento', id: 'equipados' },
		{ href: '#top', text: 'Preventa', id: 'preventa' }, // Links to top (hero section) for now
		{ href: '#contacto', text: 'Contacto', id: 'contacto' }
	];
</script>

<script lang="ts">
	// ===== IMPORTS =====
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import { resolveInitialTheme, setTheme, type Theme } from '$lib/utils/theme';

	// ===== STATE =====
	let isMenuOpen = $state(false);
	let currentTheme = $state<Theme>('light');
	let colorEditorOpen = $state(false);
	let devColorEditorModule =
		$state<typeof import('$lib/components/dev/DevColorEditor.svelte') | null>(null);
	let activeLinkId = $state<string>('top');

	function toggleMenu() {
		isMenuOpen = !isMenuOpen;
	}

	function toggleTheme() {
		currentTheme = currentTheme === 'light' ? 'dark' : 'light';
		setTheme(currentTheme);
	}

	function handleNavClick(event: MouseEvent, href: string) {
		// Close mobile menu if open
		if (isMenuOpen) {
			isMenuOpen = false;
		}

		// Handle anchor links
		if (href.startsWith('#')) {
			event.preventDefault();
			const targetId = href.slice(1);
			const targetElement = document.getElementById(targetId);
			
			if (targetElement) {
				const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - HEADER_HEIGHT;
				
				window.scrollTo({
					top: targetPosition,
					behavior: 'smooth'
				});
			}
		}
	}

	function updateActiveLink() {
		if (!browser) return;

		const sections = navLinks
			.map(link => {
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

	$effect(() => {
		if (isMenuOpen) {
			document.body.classList.add('nav-open');
		} else {
			document.body.classList.remove('nav-open');
		}
	});

	onMount(() => {
		currentTheme = resolveInitialTheme();
		if (isDevMode) {
			void import('$lib/components/dev/DevColorEditor.svelte').then((module) => {
				devColorEditorModule = module;
			});
		}
		
		// Sync with theme changes from other sources (e.g., system preference changes)
		if (browser) {
			const updateTheme = () => {
				const themeAttr = document.documentElement.dataset.theme;
				if (themeAttr === 'light' || themeAttr === 'dark') {
					currentTheme = themeAttr;
				}
			};
			
			// Check initial state
			updateTheme();
			
			// Watch for changes
			const observer = new MutationObserver(updateTheme);
			observer.observe(document.documentElement, {
				attributes: true,
				attributeFilter: ['data-theme']
			});

			// Update active link on scroll
			updateActiveLink();
			window.addEventListener('scroll', updateActiveLink, { passive: true });
			window.addEventListener('resize', updateActiveLink, { passive: true });
			
			return () => {
				observer.disconnect();
				window.removeEventListener('scroll', updateActiveLink);
				window.removeEventListener('resize', updateActiveLink);
			};
		}
	});
</script>

<header class='site'>
	<div class='wrap site__bar'>
		<div class='logo' aria-label='Habitat Prime SAS'>Habitat Prime SAS</div>
		<nav
			id='main-nav'
			class='main-nav'
			class:is-open={isMenuOpen}
			aria-label='Navegación principal'
		>
			<ul class='nav__desktop'>
				{#each navLinks as link (link.id)}
					<li>
						<a 
							href={link.href} 
							aria-current={activeLinkId === link.id ? 'page' : undefined}
							onclick={(e) => handleNavClick(e, link.href)}
							class:active={activeLinkId === link.id}
						>
							{link.text}
						</a>
					</li>
				{/each}
			</ul>
		</nav>
		<div class='header-controls'>
			{#if isDevMode}
				<button
					id='color-editor-toggle'
					class='color-editor-toggle'
					onclick={() => (colorEditorOpen = !colorEditorOpen)}
					aria-expanded={colorEditorOpen}
					type='button'
				>
					🎨
				</button>
			{/if}
			<button
				id='theme-toggle'
				class='theme-toggle'
				aria-label={currentTheme === 'light' ? 'Cambiar a modo oscuro' : 'Cambiar a modo claro'}
				title={currentTheme === 'light' ? 'Modo oscuro' : 'Modo claro'}
				onclick={toggleTheme}
			>
				{#if currentTheme === 'light'}
					<svg
						xmlns='http://www.w3.org/2000/svg'
						width='20'
						height='20'
						viewBox='0 0 24 24'
						fill='none'
						stroke='currentColor'
						stroke-width='2'
						stroke-linecap='round'
						stroke-linejoin='round'
					>
						<path d='M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z'></path>
					</svg>
				{:else}
					<svg
						xmlns='http://www.w3.org/2000/svg'
						width='20'
						height='20'
						viewBox='0 0 24 24'
						fill='none'
						stroke='currentColor'
						stroke-width='2'
						stroke-linecap='round'
						stroke-linejoin='round'
					>
						<circle cx='12' cy='12' r='5'></circle>
						<line x1='12' y1='1' x2='12' y2='3'></line>
						<line x1='12' y1='21' x2='12' y2='23'></line>
						<line x1='4.22' y1='4.22' x2='5.64' y2='5.64'></line>
						<line x1='18.36' y1='18.36' x2='19.78' y2='19.78'></line>
						<line x1='1' y1='12' x2='3' y2='12'></line>
						<line x1='21' y1='12' x2='23' y2='12'></line>
						<line x1='4.22' y1='19.78' x2='5.64' y2='18.36'></line>
						<line x1='18.36' y1='5.64' x2='19.78' y2='4.22'></line>
					</svg>
				{/if}
			</button>
			<button
				id='nav-toggle'
				class='nav-toggle'
				class:is-open={isMenuOpen}
				aria-label='Abrir menú'
				aria-expanded={isMenuOpen}
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
		position: sticky;
		top: 0;
		z-index: 50;
		background: var(--color-bg-canvas);
		border-bottom: 1px solid var(--color-border-default);
		box-shadow: 0 0.125rem 0.375rem var(--shadow-subtle);
	}

	.site__bar {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0.75rem 0;
		background: var(--color-bg-elevated);
	}

	.logo {
		font-weight: 800;
		color: var(--color-accent-primary-text);
		letter-spacing: 0.02em;
		z-index: 1001; /* Ensure logo is above mobile nav background */
	}

	.nav__desktop {
		display: flex;
		gap: 1.125rem;
		list-style: none;
		margin: 0;
		padding: 0;
	}

	.nav__desktop a {
		color: var(--color-accent-primary-text);
		text-decoration: none;
		font-weight: 600;
		border-bottom: 2px solid transparent;
		padding: 0.375rem 0.125rem;
		text-transform: uppercase;
	}

	.nav__desktop a:hover {
		border-color: var(--color-accent-border);
	}

	.nav__desktop a[aria-current='page'],
	.nav__desktop a.active {
		border-color: var(--color-accent-secondary);
	}

	.header-controls {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		z-index: 1001;
	}

	.color-editor-toggle {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 2.25rem;
		height: 2.25rem;
		border-radius: 999px;
		border: 1px solid var(--color-border-default);
		background: var(--color-bg-elevated);
		color: var(--color-accent-primary-text);
		cursor: pointer;
		font-size: 1.1rem;
		transition: transform 0.2s ease, box-shadow 0.2s ease;
	}

	.color-editor-toggle:hover {
		transform: translateY(-1px);
		box-shadow: 0 0.5rem 1rem var(--shadow-subtle);
	}

	.theme-toggle {
		display: flex;
		align-items: center;
		justify-content: center;
		background: none;
		border: none;
		cursor: pointer;
		padding: 0.5rem;
		color: var(--color-accent-primary-text);
		border-radius: 0.375rem;
		transition: background-color 0.2s, color 0.2s;
		z-index: 1001;
	}

	.theme-toggle:hover {
		background-color: var(--color-bg-muted);
	}

	.theme-toggle:focus-visible {
		outline: 2px solid var(--color-accent-secondary);
		outline-offset: 2px;
	}

	.theme-toggle svg {
		width: 1.25rem;
		height: 1.25rem;
		transition: transform 0.2s;
	}

	.theme-toggle:hover svg {
		transform: scale(1.1);
	}

	.nav-toggle {
		display: none; /* Hidden by default */
		background: none;
		border: none;
		cursor: pointer;
		z-index: 1001;
		padding: 0.3125rem;
	}

	.nav-toggle .icon-bar {
		display: block;
		width: 1.5rem;
		height: 3px;
		background-color: var(--color-accent-primary-text);
		margin: 0.3125rem 0;
		transition: all 0.2s;
	}

	@media (max-width: 850px) {
		/* Mobile Nav */
		.nav-toggle {
			display: block; /* Show hamburger */
		}

		.main-nav {
			position: fixed;
			top: 0;
			left: 0;
			width: 100%;
			height: 100%;
			background-color: var(--overlay-white-strong);
			-webkit-backdrop-filter: blur(0.3125rem);
			backdrop-filter: blur(0.3125rem);
			display: flex;
			align-items: center;
			justify-content: center;
			/* Hidden by default */
			opacity: 0;
			visibility: hidden;
			transition:
				opacity 0.3s ease,
				visibility 0.3s ease;
		}

		.main-nav.is-open {
			opacity: 1;
			visibility: visible;
		}

		/* Style the X for the close button */
		.nav-toggle.is-open .icon-bar:nth-child(1) {
			transform: translateY(0.5rem) rotate(45deg);
		}

		.nav-toggle.is-open .icon-bar:nth-child(2) {
			opacity: 0;
		}

		.nav-toggle.is-open .icon-bar:nth-child(3) {
			transform: translateY(-0.5rem) rotate(-45deg);
		}

		.nav__desktop {
			flex-direction: column;
			align-items: center;
			gap: 1.5rem;
		}

		.nav__desktop a {
			font-size: 1.5rem;
		}
	}
</style>

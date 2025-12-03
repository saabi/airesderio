<script module lang="ts">
	// ===== IMPORTS =====
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import AiresDeRioLogo from '$lib/components/ui/AiresDeRioLogo.svelte';
	import { theme, type Theme } from '$lib/stores/theme';
	import { maxWidth } from '$lib/stores/maxWidth';

	// ===== TYPES =====
	type NavLink = {
		href: string;
		text: string;
		id: string;
	};

	interface Props {
		// No props currently, but interface exists for future extensibility
	}

	// ===== STATIC CONSTANTS =====
	const isDevMode = import.meta.env.DEV;

	const navLinks: NavLink[] = [
		{ href: '#top', text: 'Home', id: 'top' },
		{ href: '#proyecto', text: 'Proyecto', id: 'proyecto' },
		{ href: '#ubicacion', text: 'Ubicación', id: 'ubicacion' },
		{ href: '#interior', text: 'Interior', id: 'interior' },
		{ href: '#equipados', text: 'Equipamiento', id: 'equipados' },
		{ href: '#planos', text: 'Planos', id: 'planos' },
		{ href: '#contacto', text: 'Contacto', id: 'contacto' }
	];
</script>

<script lang="ts">
	// ===== PROPS =====
	let {}: Props = $props();

	// ===== STATE =====
	let isMenuOpen = $state(false);
	let colorEditorOpen = $state(false);
	let devColorEditorModule =
		$state<typeof import('$lib/components/dev/DevColorEditor.svelte') | null>(null);
	let activeLinkId = $state<string>('top');
	let HEADER_HEIGHT = $state(80); // Will be set from CSS variable on mount

	// ===== DERIVED =====
	let currentTheme = $derived($theme);
	let currentMaxWidth = $derived($maxWidth);

	// ===== EFFECTS =====
	$effect(() => {
		if (isMenuOpen) {
			document.body.classList.add('nav-open');
		} else {
			document.body.classList.remove('nav-open');
		}
	});

	// ===== LIFECYCLE =====
	onMount(() => {
		// Initialize max width store
		maxWidth.init();
		
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
		isMenuOpen = !isMenuOpen;
	}

	function toggleTheme() {
		theme.toggle();
	}

	function toggleMaxWidth() {
		maxWidth.toggle();
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
</script>

<header class='site'>
	<div class='site__bar'>
		<AiresDeRioLogo
			class="logo"
			loading="eager"
			height="2.2em"
			theme="dark"
		/>
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
				<button
					id='max-width-toggle'
					class='max-width-toggle'
					aria-label={currentMaxWidth >= 1800 ? 'Reducir ancho máximo' : 'Aumentar ancho máximo'}
					title={currentMaxWidth >= 1800 ? 'Ancho: 1200px' : 'Ancho: 1800px'}
					onclick={toggleMaxWidth}
					type='button'
				>
					📐
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
		/* Positioning */
		position: fixed;
		top: 0;
		z-index: 50;
		
		/* Layout */
		width: 100vw;
		height: var(--header-height);
		
		/* Box/Visual */
		background: var(--ref-neutral-980);
		border-bottom: 1px solid var(--ref-neutral-900);
		box-shadow: 0 0.125rem 0.375rem var(--shadow-strong);
	}

	:global(:root[data-theme='dark']) .site {
		/* Box/Visual */
		background: var(--color-bg-canvas);
		border-bottom: 1px solid var(--color-border-default);
		box-shadow: 0 0.125rem 0.375rem var(--shadow-subtle);
	}

	.site__bar {
		/* Layout */
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0.75rem 2em;
		
		/* Box/Visual */
		background: var(--ref-neutral-950);
	}

	:global(:root[data-theme='dark']) .site__bar {
		/* Box/Visual */
		background: var(--color-bg-elevated);
	}

	.nav__desktop {
		/* Layout */
		display: flex;
		gap: 1.125rem;
		list-style: none;
		margin: 0;
		padding: 0;
	}

	.nav__desktop a {
		/* Layout */
		padding: 0.375rem 0.125rem;
		
		/* Box/Visual */
		border-bottom: 2px solid transparent;
		
		/* Typography */
		font-weight: 600;
		text-decoration: none;
		text-transform: uppercase;
		color: var(--color-text-inverse);
	}

	:global(:root[data-theme='dark']) .nav__desktop a {
		/* Typography */
		color: var(--color-accent-primary-text);
	}

	.nav__desktop a:hover {
		/* Box/Visual */
		border-color: var(--color-accent-border);
	}

	.nav__desktop a[aria-current='page'],
	.nav__desktop a.active {
		/* Box/Visual */
		border-color: var(--color-accent-secondary);
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
		transition: transform 0.2s ease, box-shadow 0.2s ease;
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

	.max-width-toggle {
		/* Positioning */
		z-index: 1001;
		
		/* Layout */
		display: flex;
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
		transition: transform 0.2s ease, box-shadow 0.2s ease;
	}

	:global(:root[data-theme='dark']) .max-width-toggle {
		/* Box/Visual */
		border: 1px solid var(--color-border-default);
		background: var(--color-bg-elevated);
		
		/* Typography */
		color: var(--color-accent-primary-text);
	}

	.max-width-toggle:hover {
		/* Box/Visual */
		box-shadow: 0 0.5rem 1rem var(--shadow-subtle);
		
		/* Effects & Motion */
		transform: translateY(-1px);
	}

	.theme-toggle {
		/* Positioning */
		z-index: 1001;
		
		/* Layout */
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 0.5rem;
		
		/* Box/Visual */
		background: none;
		border: none;
		border-radius: 0.375rem;
		
		/* Typography */
		color: var(--color-text-inverse);
		
		/* Misc/Overrides */
		cursor: pointer;
		
		/* Effects & Motion */
		transition: background-color 0.2s, color 0.2s;
	}

	.theme-toggle:hover {
		/* Box/Visual */
		background-color: var(--ref-neutral-900);
	}

	:global(:root[data-theme='dark']) .theme-toggle {
		/* Typography */
		color: var(--color-accent-primary-text);
	}

	:global(:root[data-theme='dark']) .theme-toggle:hover {
		/* Box/Visual */
		background-color: var(--color-bg-muted);
	}

	.theme-toggle:focus-visible {
		/* Box/Visual */
		outline: 2px solid var(--color-accent-secondary);
		outline-offset: 2px;
	}

	.theme-toggle svg {
		/* Layout */
		width: 1.25rem;
		height: 1.25rem;
		
		/* Effects & Motion */
		transition: transform 0.2s;
	}

	.theme-toggle:hover svg {
		/* Effects & Motion */
		transform: scale(1.1);
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
		background-color: var(--color-text-inverse);
		
		/* Effects & Motion */
		transition: all 0.2s;
	}

	:global(:root[data-theme='dark']) .nav-toggle .icon-bar {
		/* Box/Visual */
		background-color: var(--color-accent-primary-text);
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
			
			/* Layout */
			display: flex;
			align-items: center;
			justify-content: center;
			max-width: 100vw;
			width: 100vw;
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

		.nav__desktop {
			/* Layout */
			flex-direction: column;
			align-items: center;
			gap: 1.5rem;
		}

		.nav__desktop a {
			/* Typography */
			font-size: 1.5rem;
		}
	}
</style>

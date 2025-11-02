<script lang="ts">
	let isMenuOpen = $state(false);

	const navLinks = [
		{ href: '#', text: 'Home', current: true },
		{ href: '#ubicacion', text: 'Ubicación' },
		{ href: '#planos', text: 'Planos' },
		{ href: '#equipados', text: 'Equipamiento' },
		{ href: '#', text: 'Preventa' },
		{ href: '#', text: 'Contacto' }
	];

	function toggleMenu() {
		isMenuOpen = !isMenuOpen;
	}

	$effect(() => {
		if (isMenuOpen) {
			document.body.classList.add('nav-open');
		} else {
			document.body.classList.remove('nav-open');
		}
	});
</script>

<header class='site' role='banner'>
	<div class='wrap site__bar'>
		<h1 class='logo'>Habitat Prime SAS</h1>
		<nav
			id='main-nav'
			class='main-nav'
			class:is-open={isMenuOpen}
			aria-label='Navegación principal'
		>
			<ul class='nav__desktop'>
				{#each navLinks as link}
					<li><a href={link.href} aria-current={link.current ? 'page' : undefined}>{link.text}</a></li>
				{/each}
			</ul>
		</nav>
		<button
			id='nav-toggle'
			class='nav-toggle'
			class:is-open={isMenuOpen}
			aria-label='Abrir menú'
			aria-expanded={isMenuOpen}
			aria-controls='main-nav'
			on:click={toggleMenu}
		>
			<span class='icon-bar'></span>
			<span class='icon-bar'></span>
			<span class='icon-bar'></span>
		</button>
	</div>
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

	.nav__desktop a[aria-current='page'] {
		border-color: var(--color-accent-secondary);
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

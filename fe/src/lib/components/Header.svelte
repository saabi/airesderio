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

<header class="site" role="banner">
	<div class="wrap site__bar">
		<h1 class="logo">Habitat Prime SAS</h1>
		<nav
			id="main-nav"
			class="main-nav"
			class:is-open={isMenuOpen}
			aria-label="Navegación principal"
		>
			<ul class="nav__desktop">
				{#each navLinks as link}
					<li><a href={link.href} aria-current={link.current ? 'page' : undefined}>{link.text}</a></li>
				{/each}
			</ul>
		</nav>
		<button
			id="nav-toggle"
			class="nav-toggle"
			class:is-open={isMenuOpen}
			aria-label="Abrir menú"
			aria-expanded={isMenuOpen}
			aria-controls="main-nav"
			on:click={toggleMenu}
		>
			<span class="icon-bar"></span>
			<span class="icon-bar"></span>
			<span class="icon-bar"></span>
		</button>
	</div>
</header>

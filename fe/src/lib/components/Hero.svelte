<section class='hero' role='banner' aria-labelledby='hero-heading'>
	<h2 id='hero-heading' class='vh'>Presentación y Contacto - Aires de Río</h2>
	<div class='hero-img' role='img' aria-label='Fachada del edificio Aires de Río'></div>
	<div class='hero-contact'>
		<h2>PROYECTO AIRES DE RÍO</h2>
		<p>Comunicate con nosotros</p>
		<form action='#' method='POST' on:submit|preventDefault>
			<div class='form-group'>
				<label for='nombre'>Nombre</label>
				<input type='text' id='nombre' name='nombre' />
			</div>
			<div class='form-group'>
				<label for='correo'>Correo</label>
				<input type='email' id='correo' name='correo' />
			</div>
			<div class='form-group'>
				<label for='telefono'>Número de teléfono</label>
				<input type='tel' id='telefono' name='telefono' />
			</div>
			<div class='form-group'>
				<label for='consulta'>Consulta</label>
				<select id='consulta' name='consulta'>
					<option>Seleccioná</option>
					<option>Precio y Financiación</option>
					<option>Visitar el Showroom</option>
					<option>Otras consultas</option>
				</select>
			</div>
			<div class='form-group'>
				<button type='submit'>ENVIAR</button>
			</div>
		</form>
	</div>
</section>

<style>
	.hero {
		display: grid;
		grid-template-columns: 1.2fr 0.8fr;
		gap: var(--gap);
		padding: 1.5rem 0;
		align-items: center;
	}

	.hero-img {
		height: 28.125rem;
		background: url('https://placehold.co/800x600/6B4423/FFF?text=FOTO+ROTATIVA') center/cover;
		border-radius: 0.5rem;
	}

	.hero-contact {
		padding: 1rem;
		border: 1px solid var(--color-border-default);
		border-radius: 0.5rem;
	}

	.hero-contact h2 {
		font-size: 1.1em;
		font-weight: 600;
		letter-spacing: 0.1em;
		color: var(--color-accent-primary);
	}

	.hero-contact p {
		margin: 0 0 1rem;
		font-size: 0.9em;
	}

	.form-group {
		margin-bottom: 0.75rem;
	}

	.form-group label {
		display: block;
		font-size: 0.85em;
		margin-bottom: 0.25rem;
		color: var(--color-text-secondary);
	}

	.form-group input,
	.form-group textarea,
	.form-group select {
		width: 100%;
		padding: 0.625rem;
		border: 1px solid var(--color-border-default);
		border-radius: 0.25rem;
	}

	.form-group button {
		width: 100%;
		padding: 0.75rem;
		border: none;
		background: var(--color-accent-primary);
		color: var(--color-text-inverse);
		font-weight: 600;
		border-radius: 0.25rem;
		cursor: pointer;
	}

	.form-group button:hover {
		background: var(--color-accent-strong);
	}

	@media (max-width: 850px) {
		.hero {
			grid-template-columns: 1fr;
		}

		.hero-img {
			height: 18.75rem; /* Shorter hero image on mobile */
		}
	}
</style>

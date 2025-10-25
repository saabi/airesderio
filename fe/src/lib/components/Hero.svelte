<section class="hero" role="banner" aria-labelledby="hero-heading">
	<h2 id="hero-heading" class="vh">Presentación y Contacto - Aires de Río</h2>
	<div class="hero-img" role="img" aria-label="Fachada del edificio Aires de Río"></div>
	<div class="hero-contact">
		<h2>PROYECTO AIRES DE RÍO</h2>
		<p>Comunicate con nosotros</p>
		<form action="#" method="POST" on:submit|preventDefault>
			<div class="form-group">
				<label for="nombre">Nombre</label>
				<input type="text" id="nombre" name="nombre" />
			</div>
			<div class="form-group">
				<label for="correo">Correo</label>
				<input type="email" id="correo" name="correo" />
			</div>
			<div class="form-group">
				<label for="telefono">Número de teléfono</label>
				<input type="tel" id="telefono" name="telefono" />
			</div>
			<div class="form-group">
				<label for="consulta">Consulta</label>
				<select id="consulta" name="consulta">
					<option>Seleccioná</option>
					<option>Precio y Financiación</option>
					<option>Visitar el Showroom</option>
					<option>Otras consultas</option>
				</select>
			</div>
			<div class="form-group">
				<button type="submit">ENVIAR</button>
			</div>
		</form>
	</div>
</section>

<style>
	.hero {
		display: grid;
		grid-template-columns: 1.2fr 0.8fr;
		gap: var(--gap);
		padding: 24px 0;
		align-items: center;
	}

	.hero-img {
		height: 450px;
		background: url('https://placehold.co/800x600/6B4423/FFF?text=FOTO+ROTATIVA') center/cover;
		border-radius: 8px;
	}

	.hero-contact {
		padding: 16px;
		border: 1px solid var(--line);
		border-radius: 8px;
	}

	.hero-contact h2 {
		font-size: 1.1em;
		font-weight: 600;
		letter-spacing: 0.1em;
		color: var(--brand);
	}

	.hero-contact p {
		margin: 0 0 16px;
		font-size: 0.9em;
	}

	.form-group {
		margin-bottom: 12px;
	}

	.form-group label {
		display: block;
		font-size: 0.85em;
		margin-bottom: 4px;
		color: var(--muted);
	}

	.form-group input,
	.form-group textarea,
	.form-group select {
		width: 100%;
		padding: 10px;
		border: 1px solid var(--line);
		border-radius: 4px;
	}

	.form-group button {
		width: 100%;
		padding: 12px;
		border: none;
		background: var(--brand);
		color: #fff;
		font-weight: 600;
		border-radius: 4px;
		cursor: pointer;
	}

	.form-group button:hover {
		background: #4a2f18;
	}

	@media (max-width: 850px) {
		.hero {
			grid-template-columns: 1fr;
		}

		.hero-img {
			height: 300px; /* Shorter hero image on mobile */
		}
	}
</style>

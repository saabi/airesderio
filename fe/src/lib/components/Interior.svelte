<section id="interior" aria-labelledby="interior-heading">
	<h2 id="interior-heading" class="vh">Diseño Interior</h2>
	<div class="boxed">
		<span class="eyebrow">Diseño</span>
		<span class="big">INTERIOR</span>
	</div>
	<p>
		Ambientes generosos para unidades de un dormitorio que integran estética y funcionalidad
		explorando tendencias contemporáneas, incorporando las nuevas tecnologías y los recursos más
		elegantes en interiorismo.
	</p>
	<p>
		El proyecto incorporó materiales ecológicos y formas curvas, buscando conectar los espacios
		interiores con los colores que ofrece la naturaleza a través de la inclusión de vegetación, luz
		natural y materiales orgánicos como la madera.
	</p>
	<div class="interior-gallery" style="margin-top:12px">
		<figure>
			<div class="ph" role="img" aria-label="Imagen del diseño interior - galería automática">
				<span class="arrow"></span>
			</div>
			<figcaption class="vh">Galería de imágenes del diseño interior</figcaption>
		</figure>
		<figure>
			<div class="ph" role="img" aria-label="Imagen del diseño interior - galería automática"></div>
			<figcaption class="vh">Galería de imágenes del diseño interior</figcaption>
		</figure>
	</div>
</section>

<style>
	.boxed {
		display: inline-block;
		border: 3px solid var(--line);
		border-radius: 4px;
		padding: 8px 14px;
		margin: 12px 0;
	}

	.boxed .eyebrow {
		font-size: 0.9rem;
		letter-spacing: 0.18em;
		color: #111;
		display: block;
	}

	.boxed .big {
		display: block;
		font-size: 28px;
		font-weight: 800;
		letter-spacing: 0.06em;
	}

	.interior-gallery {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 18px;
	}

	.interior-gallery figure {
		display: contents;
	}

	.ph {
		background: #e9e9e9;
		height: 260px;
		border-radius: 8px;
		position: relative;
	}

	.ph::after {
		content: 'FOTOS 4-9 VAN DESPLAZANDOSE HORIZONTALMENTE';
		position: absolute;
		left: 8px;
		bottom: 8px;
		font-size: 0.78rem;
		background: #fff;
		padding: 4px 6px;
		border-radius: 6px;
		border: 1px solid #ddd;
		color: #111;
	}

	.ph .arrow {
		position: absolute;
		right: -44px;
		top: 50%;
		transform: translateY(-50%);
		width: 0;
		height: 0;
		border-top: 26px solid transparent;
		border-bottom: 26px solid transparent;
		border-left: 44px solid #ff4444;
	}
	@media (max-width: 850px) {
		.interior-gallery {
			grid-template-columns: 1fr;
		}
	}
</style>

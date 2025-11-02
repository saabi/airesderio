<script lang="ts">
	import PhoneNumberInput from '$lib/components/PhoneNumberInput.svelte';
	import Select from '$lib/components/Select.svelte';

	function handleSubmit(event: Event) {
		event.preventDefault();
		// Form submission logic can be added here
	}
</script>

<form action='#' method='POST' on:submit={handleSubmit}>
	<div class='form-group'>
		<label for='nombre'>Nombre</label>
		<input type='text' id='nombre' name='nombre' />
	</div>
	<div class='form-group'>
		<label for='correo'>Correo</label>
		<input type='email' id='correo' name='correo' />
	</div>
	<PhoneNumberInput id='telefono' name='telefono' />
	<div class='form-group'>
		<label for='consulta'>Consulta</label>
		<Select id='consulta' name='consulta' placeholder='Seleccioná'>
			{#snippet children()}
				<option>Precio y Financiación</option>
				<option>Visitar el Showroom</option>
				<option>Otras consultas</option>
			{/snippet}
		</Select>
	</div>
	<div class='form-group'>
		<label for='mensaje'>Mensaje</label>
		<textarea id='mensaje' name='mensaje' rows='4'></textarea>
	</div>
	<div class='form-group'>
		<button type='submit'>ENVIAR</button>
	</div>
</form>

<style>
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
	.form-group textarea {
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
</style>


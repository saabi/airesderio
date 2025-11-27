<script lang="ts">
	// ===== DERIVED =====
	// Year is derived from current date, so it stays in instance script
	const year = new Date().getFullYear();
</script>

<footer>
	<div class='wrap'>
		<p><small>© {year} Aires de Río — Maqueta. Todos los derechos reservados.</small></p>
	</div>
</footer>

<style>
	footer {
		/* Layout */
		padding: 1.5rem 0;
		margin-top: 1.75rem;
		
		/* Box/Visual */
		border-top: 1px solid var(--color-border-subtle);
		
		/* Typography */
		color: var(--color-text-tertiary);
		text-align: center;
	}
</style>

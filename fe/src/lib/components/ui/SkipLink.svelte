<script lang="ts">
	interface Props {
		targetId?: string;
		text?: string;
	}

	let { targetId = 'main-content', text = 'Saltar al contenido principal' }: Props = $props();
</script>

<a href="#{targetId}" class="skip-link">
	{text}
</a>

<style>
	.skip-link {
		/* Layout */
		position: absolute;
		top: -40px;
		left: 0;
		padding: 0.5rem 1rem;

		/* Box/Visual */
		background: var(--color-accent-primary);
		color: var(--color-text-on-accent);
		text-decoration: none;
		z-index: 10000;
		border-radius: 0 0 0.25rem 0;
	}

	.skip-link:focus {
		top: 0;
	}
</style>

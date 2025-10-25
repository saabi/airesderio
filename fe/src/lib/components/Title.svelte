<script lang="ts">
	let { eyebrow, big }: { eyebrow: string; big: string } = $props();
</script>

<div class="boxed">
	<span class="eyebrow">{eyebrow}</span>
	<span class="big">{big}</span>
</div>

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
</style>

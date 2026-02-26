<script lang='ts'>
	import type { Snippet } from 'svelte';

	interface Props {
		text: string;
		icon?: Snippet;
		class?: string;
		style?: string;
		dataItemActive?: boolean;
	}
	let { text, icon, class: className = '', style = '', dataItemActive = false }: Props = $props();
</script>

<div
	class='icon-text-row {className}'
	class:data-item-active={dataItemActive}
	style={style}
>
	<span class='icon-text-row__icon' aria-hidden='true'>
		{#if icon}
			{@render icon()}
		{/if}
	</span>
	<span class='icon-text-row__text'>{text}</span>
</div>

<style>
	.icon-text-row {
		display: grid;
		grid-template-columns: 3rem 1fr;
		gap: 1.25rem;
		align-items: center;
		padding: 0.85rem 0;
	}

	.icon-text-row__icon {
		display: flex;
		align-items: center;
		justify-content: center;
		min-width: 0;
		color: var(--color-contrast-low);
	}

	.icon-text-row__text {
		font-size: 1.4rem;
		line-height: 1.4;
		color: var(--color-contrast-low);
		min-width: 0;
	}
</style>

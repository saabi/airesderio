<script lang="ts">
	// ===== PROPS =====
	let {
		src,
		alt = '',
		class: className = '',
		loading,
		decoding,
		sizes,
		/** Override derived WebP URL; set to empty string to disable WebP and render plain img */
		webpSrc
	}: {
		src: string;
		alt?: string;
		class?: string;
		loading?: 'lazy' | 'eager';
		decoding?: 'async' | 'sync' | 'auto';
		sizes?: string;
		webpSrc?: string | null;
	} = $props();

	// ===== DERIVED =====
	// Derive WebP URL when src looks like .jpg/.jpeg/.png and webpSrc not explicitly set
	const effectiveWebpSrc = $derived.by(() => {
		if (webpSrc !== undefined && webpSrc !== null) {
			return webpSrc || null;
		}
		if (typeof src !== 'string' || !/\.(jpe?g|png)$/i.test(src)) {
			return null;
		}
		return src.replace(/\.(jpe?g|png)$/i, '.webp');
	});

	const usePicture = $derived(effectiveWebpSrc != null && effectiveWebpSrc.length > 0);
</script>

{#if usePicture}
	<picture class={className}>
		<source type="image/webp" srcset={effectiveWebpSrc} />
		<img
			{src}
			{alt}
			class={className}
			loading={loading}
			decoding={decoding}
			sizes={sizes}
		/>
	</picture>
{:else}
	<img
		{src}
		{alt}
		class={className}
		loading={loading}
		decoding={decoding}
		sizes={sizes}
	/>
{/if}

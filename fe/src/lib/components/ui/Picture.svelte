<script lang="ts">
	// ===== PROPS =====
	let {
		src,
		alt = '',
		class: className = '',
		loading,
		decoding,
		sizes,
		/** Disable automatic alternate format lookup derived from src (e.g. .webp). */
		useAutoAlternateSrc = true,
		/** Override derived WebP URL; set to empty string to disable WebP and render plain img */
		webpSrc,
		/**
		 * WebP candidates with width descriptors (e.g. `a-half.webp 1008w, a.webp 2016w`).
		 * When set, takes precedence over {@link webpSrc} / auto alternate.
		 */
		webpSrcset,
		/** Optional width-descriptor srcset for the fallback `<img>` (e.g. high-res PNG). */
		imgSrcset,
		/** When set (e.g. from {@link Slide}), called after `<img>` has intrinsic dimensions. */
		onImgDecode
	}: {
		src: string;
		alt?: string;
		class?: string;
		loading?: 'lazy' | 'eager';
		decoding?: 'async' | 'sync' | 'auto';
		sizes?: string;
		useAutoAlternateSrc?: boolean;
		webpSrc?: string | null;
		webpSrcset?: string;
		imgSrcset?: string;
		onImgDecode?: (info: {
			currentSrc: string;
			naturalWidth: number;
			naturalHeight: number;
		}) => void;
	} = $props();

	let imgEl: HTMLImageElement | null = $state(null);

	// ===== DERIVED =====
	const useResponsiveWebp = $derived(
		typeof webpSrcset === 'string' && webpSrcset.trim().length > 0
	);

	// Derive WebP URL when src looks like .jpg/.jpeg/.png and webpSrc not explicitly set
	const effectiveWebpSrc = $derived.by(() => {
		if (useResponsiveWebp) {
			return null;
		}
		if (webpSrc !== undefined && webpSrc !== null) {
			return webpSrc || null;
		}
		if (!useAutoAlternateSrc) {
			return null;
		}
		if (typeof src !== 'string' || !/\.(jpe?g|png)$/i.test(src)) {
			return null;
		}
		return src.replace(/\.(jpe?g|png)$/i, '.webp');
	});

	const usePicture = $derived(
		useResponsiveWebp || (effectiveWebpSrc != null && effectiveWebpSrc.length > 0)
	);

	function emitImgDecode(): void {
		if (!onImgDecode || !imgEl || imgEl.naturalWidth <= 0) return;
		onImgDecode({
			currentSrc: imgEl.currentSrc,
			naturalWidth: imgEl.naturalWidth,
			naturalHeight: imgEl.naturalHeight
		});
	}

	$effect(() => {
		if (!onImgDecode || !imgEl) return;

		const el = imgEl;
		// Re-run when `src` changes so cached / late loads still emit.
		void src;

		if (el.complete && el.naturalWidth > 0) {
			emitImgDecode();
			return;
		}

		const onLoad = () => emitImgDecode();
		el.addEventListener('load', onLoad);
		return () => el.removeEventListener('load', onLoad);
	});
</script>

{#if usePicture}
	<picture class={className}>
		{#if useResponsiveWebp}
			<source type="image/webp" srcset={webpSrcset} {sizes} />
		{:else}
			<source type="image/webp" srcset={effectiveWebpSrc} {sizes} />
		{/if}
		<img
			bind:this={imgEl}
			{src}
			srcset={imgSrcset}
			{alt}
			class={className}
			{loading}
			{decoding}
			{sizes}
		/>
	</picture>
{:else}
	<img
		bind:this={imgEl}
		{src}
		srcset={imgSrcset}
		{alt}
		class={className}
		{loading}
		{decoding}
		{sizes}
	/>
{/if}

<script lang="ts">
	import { browser } from '$app/environment';
	import { createEventDispatcher } from 'svelte';

	interface Props {
		/** id of the <svg> element or a wrapper containing it */
		targetId?: string;
		/** Optional CSS selector for the <svg> element or a wrapper containing it */
		targetSelector?: string;
		/** Optional callback for direct SVG element access when ids are not convenient */
		getElement?: () => SVGSVGElement | null;
		/** Download file name, e.g. "airesderio-primary-4000w.png" */
		filename: string;
		/** Target PNG width in pixels (height derived from aspect ratio). Default 4000 when size controls are disabled. */
		width?: number;
		/** Visible label and accessible name for the button. Default "Export PNG". */
		label?: string;
		/** Optional CSS class for the button element. */
		class?: string;
		/** When true, show a height input and compute width from the SVG aspect ratio. */
		enableSizeControls?: boolean;
		/** Default PNG height in pixels when size controls are enabled. */
		defaultHeight?: number;
		/** Minimum allowed height in pixels. Default 500. */
		minHeight?: number;
		/** Maximum allowed height in pixels. Default 8000. */
		maxHeight?: number;
		/** Step for the height input in pixels. Default 100. */
		step?: number;
	}

	const dispatch = createEventDispatcher<{
		exportsuccess: { filename: string };
		exporterror: { filename: string; error: unknown };
	}>();

	let {
		targetId,
		targetSelector,
		getElement,
		filename,
		width = 4000,
		label = 'Export PNG',
		class: className = '',
		enableSizeControls = false,
		defaultHeight,
		minHeight = 500,
		maxHeight = 8000,
		step = 100
	}: Props = $props();

	let isExporting = $state(false);
	let aspect = $state<number | null>(null);
	let heightPx = $state<number | null>(null);

	const computedWidth = $derived.by(() => {
		if (!aspect || !heightPx) return null;
		return Math.round(heightPx * aspect);
	});

	function resolveTargetSvg(): SVGSVGElement | null {
		if (!browser) return null;
		if (typeof getElement === 'function') {
			const el = getElement();
			if (el) return el;
		}
		if (targetId) {
			const el = document.getElementById(targetId);
			if (el instanceof SVGSVGElement) return el;
			if (el) {
				const svg = el.querySelector('svg');
				if (svg instanceof SVGSVGElement) return svg;
			}
		}
		if (targetSelector) {
			const root = document.querySelector(targetSelector);
			if (!root) return null;
			if (root instanceof SVGSVGElement) return root;
			const svg = root.querySelector('svg');
			if (svg instanceof SVGSVGElement) return svg;
		}
		return null;
	}

	function ensureSvgMarkup(svg: SVGSVGElement, serialized: string): string {
		const hasXmlns = serialized.includes('xmlns=');
		const hasViewBox = serialized.includes('viewBox=');
		if (hasXmlns && hasViewBox) {
			return serialized;
		}

		const viewBox = svg.getAttribute('viewBox') ?? '0 0 100 100';
		const svgOpenTag = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}">`;
		const inner = svg.innerHTML;
		return `${svgOpenTag}${inner}</svg>`;
	}

	async function measureAspect() {
		if (!browser) return;
		const svgEl = resolveTargetSvg();
		if (!svgEl) return;

		try {
			const serializer = new XMLSerializer();
			const raw = serializer.serializeToString(svgEl);
			const markup = ensureSvgMarkup(svgEl, raw);

			const blob = new Blob([markup], { type: 'image/svg+xml;charset=utf-8' });
			const url = URL.createObjectURL(blob);

			const img = new Image();
			img.src = url;

			await new Promise<void>((resolve, reject) => {
				img.onload = () => resolve();
				img.onerror = (event) => reject(event);
			});

			const measuredAspect = img.width && img.height ? img.width / img.height : 1;
			aspect = measuredAspect;

			if (heightPx == null) {
				const initialHeight = defaultHeight ?? 512;
				heightPx = Math.min(Math.max(initialHeight, minHeight), maxHeight);
			}

			URL.revokeObjectURL(url);
		} catch (error) {
			console.error('Error measuring SVG aspect ratio for export', error);
		}
	}

	$effect(() => {
		void enableSizeControls;
		void targetId;
		void targetSelector;
		if (!enableSizeControls) return;
		// Fire and forget measurement; exportPng has its own error handling.
		void measureAspect();
	});

	function updateHeightFromInput(value: string) {
		const parsed = Number(value);
		if (!Number.isFinite(parsed)) return;
		const clamped = Math.min(Math.max(parsed, minHeight), maxHeight);
		heightPx = clamped;
	}

	async function exportPng() {
		if (!browser || isExporting) return;
		const svgEl = resolveTargetSvg();
		if (!svgEl) {
			const error = new Error('SVG element not found for export');
			dispatch('exporterror', { filename, error });
			console.error(error);
			return;
		}

		isExporting = true;

		try {
			const serializer = new XMLSerializer();
			const raw = serializer.serializeToString(svgEl);
			const markup = ensureSvgMarkup(svgEl, raw);

			const blob = new Blob([markup], { type: 'image/svg+xml;charset=utf-8' });
			const url = URL.createObjectURL(blob);

			const img = new Image();
			img.src = url;

			await new Promise<void>((resolve, reject) => {
				img.onload = () => resolve();
				img.onerror = (event) => reject(event);
			});

			const measuredAspect = img.width && img.height ? img.width / img.height : 1;
			// Keep aspect up to date for subsequent UI updates
			aspect = measuredAspect;

			let targetWidth: number;
			let targetHeight: number;

			if (enableSizeControls) {
				const effectiveHeight =
					heightPx != null ? Math.min(Math.max(heightPx, minHeight), maxHeight) : defaultHeight ?? 512;
				const widthFromHeight = Math.round(effectiveHeight * measuredAspect || effectiveHeight);
				targetHeight = effectiveHeight;
				targetWidth = widthFromHeight;
				heightPx = effectiveHeight;
			} else {
				targetWidth = width;
				targetHeight = Math.round(targetWidth / measuredAspect || targetWidth);
			}

			const canvas = document.createElement('canvas');
			canvas.width = targetWidth;
			canvas.height = targetHeight;
			const ctx = canvas.getContext('2d');
			if (!ctx) {
				throw new Error('Unable to get 2D context from canvas');
			}

			ctx.clearRect(0, 0, targetWidth, targetHeight);
			ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

			URL.revokeObjectURL(url);

			const pngUrl = canvas.toDataURL('image/png');

			const link = document.createElement('a');
			link.href = pngUrl;
			link.download = filename;
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);

			dispatch('exportsuccess', { filename });
		} catch (error) {
			console.error('Error exporting PNG from SVG', error);
			dispatch('exporterror', { filename, error });
		} finally {
			isExporting = false;
		}
	}
</script>

<style>
	.export-button-wrapper {
		display: inline-flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.5rem;
	}

	.export-size-controls {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		font-size: 0.8rem;
	}

	.export-size-controls label {
		display: inline-flex;
		align-items: center;
		gap: 0.25rem;
	}

	.export-size-controls input[type='number'] {
		width: 5rem;
		padding: 0.15rem 0.35rem;
		border-radius: 0.375rem;
		border: 1px solid rgba(148, 163, 184, 0.8);
		font-size: 0.8rem;
	}

	.export-size-width {
		opacity: 0.8;
	}

	.export-button {
		padding: 0.375rem 0.9rem;
		border-radius: 999px;
		border: none;
		background: transparent;
		font: inherit;
		cursor: pointer;
	}

	.export-button:disabled {
		cursor: default;
	}
</style>

<div class={"export-button-wrapper" + (className ? ` ${className}` : "")}>
	{#if enableSizeControls}
		<div class="export-size-controls">
			<label>
				<span>Height (px)</span>
				<input
					type="number"
					min={minHeight}
					max={maxHeight}
					step={step}
					value={heightPx ?? defaultHeight ?? 512}
					oninput={(event) => updateHeightFromInput((event.currentTarget as HTMLInputElement).value)}
				/>
			</label>
			{#if computedWidth}
				<span class="export-size-width">Width: {computedWidth} px</span>
			{/if}
		</div>
	{/if}

	<button
		type="button"
		onclick={exportPng}
		aria-label={label}
		title={label}
		disabled={isExporting || (enableSizeControls && !computedWidth)}
		class="export-button"
	>
		{#if isExporting}
			Saving…
		{:else}
			{label}
		{/if}
	</button>
</div>


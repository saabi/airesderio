<script lang="ts">
	/**
	 * Camera / gallery icon from `docs/proposals/icons/gallery.svg` (CorelDRAW export).
	 * Default: scaled to fit `SvgViewport` `0 0 20 20` inside `CircularButton`.
	 * `embed`: path only, for use inside another SVG `transform` (e.g. map pin).
	 */
	let { embed = false }: { embed?: boolean } = $props();

	const d1 = "M9.43 14.95c0.63,0 1.13,0.5 1.13,1.13 0,0.62 -0.5,1.13 -1.13,1.13 -0.62,0 -1.13,-0.51 -1.13,-1.13 0,-0.63 0.51,-1.13 1.13,-1.13zm0 -1.83c1.64,0 2.96,1.33 2.96,2.96 0,1.63 -1.32,2.95 -2.96,2.95 -1.63,0 -2.95,-1.32 -2.95,-2.95 0,-1.63 1.32,-2.96 2.95,-2.96z";
	const d2 = "M24 15.33c5.84,0 10.58,4.73 10.58,10.58 0,5.84 -4.74,10.57 -10.58,10.57 -5.84,0 -10.58,-4.73 -10.58,-10.57 0,-5.85 4.74,-10.58 10.58,-10.58zm0 1.71c4.9,0 8.86,3.97 8.86,8.87 0,4.89 -3.96,8.86 -8.86,8.86 -4.9,0 -8.86,-3.97 -8.86,-8.86 0,-4.9 3.96,-8.87 8.86,-8.87z";
	const d3 = "M14.3 9.42l1.41 -2.1c0.76,-1.14 1.71,-1.71 3.28,-1.71 3.37,0 6.73,0 10.09,0 1.57,0 2.52,0.57 3.28,1.71l1.41 2.1 9.19 0c2.42,0 4.39,1.97 4.39,4.38l0 24.21c0,2.41 -1.97,4.38 -4.39,4.38l-37.92 0c-2.42,0 -4.39,-1.97 -4.39,-4.38l0 -24.21c0,-2.41 1.97,-4.38 4.39,-4.38l9.26 0zm-9.17 1.9l37.74 0c1.52,0 2.76,1.25 2.76,2.77l0 23.64c0,1.51 -1.24,2.76 -2.76,2.76l-37.74 0c-1.52,0 -2.76,-1.25 -2.76,-2.76l0 -23.64c0,-1.52 1.24,-2.77 2.76,-2.77zm26.34 -1.9l-1.39 -2.1c-4.03,0 -8.06,0 -12.08,0l-1.4 2.1 14.87 0z";

	/** 48 → 20 for CircularButton’s `viewBox="0 0 20 20"` */
	const scaleToButton = 20 / 48;
</script>

<!--
  Corel compound paths: inner rings / frames are separate subpaths (zm…).
  fill-rule evenodd matches docs/proposals/icons/gallery.svg so holes are cutouts.
-->
{#if embed}
	<g fill-rule="evenodd">
		<path fill="currentColor" fill-rule="evenodd" d={d1} />
		<path fill="currentColor" fill-rule="evenodd" d={d2} />
		<path fill="currentColor" fill-rule="evenodd" d={d3} />
	</g>
{:else}
	<g transform="scale({scaleToButton})" fill-rule="evenodd">
		<path fill="currentColor" fill-rule="evenodd" d={d1} />
		<path fill="currentColor" fill-rule="evenodd" d={d2} />
		<path fill="currentColor" fill-rule="evenodd" d={d3} />
	</g>
{/if}

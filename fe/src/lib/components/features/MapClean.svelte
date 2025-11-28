<script module lang="ts">
	// ===== TYPES =====
	interface Props {
		width?: string | number;
		height?: string | number;
		class?: string;
		ariaLabel?: string;
	}
</script>

<script lang="ts">
	// ===== IMPORTS =====
	import { tweened } from 'svelte/motion';

	// ===== PROPS =====
	let {
		width = '100%',
		height = '100%',
		class: className = '',
		ariaLabel = 'Mapa de ubicación'
	}: Props = $props();

	// ===== STATIC CONSTANTS =====
	// Full viewBox (hover state)
	const FULL_VIEWBOX = {
		x: 0,
		y: 0,
		width: 374.12082,
		height: 225.68958
	};

	// Near image viewBox (default state)
	const NEAR_VIEWBOX = {
		x: 81.364487,
		y: 52.243599,
		width: 69.217209,
		height: 41.755505
	};

	// ===== STATE =====
	let isHovered = $state(false);
	let hoveredPathId = $state<string | null>(null);
	
	// Tweened values for smooth animation
	let viewBoxX = tweened(NEAR_VIEWBOX.x, { duration: 600, easing: (t) => t * (2 - t) });
	let viewBoxY = tweened(NEAR_VIEWBOX.y, { duration: 600, easing: (t) => t * (2 - t) });
	let viewBoxWidth = tweened(NEAR_VIEWBOX.width, { duration: 600, easing: (t) => t * (2 - t) });
	let viewBoxHeight = tweened(NEAR_VIEWBOX.height, { duration: 600, easing: (t) => t * (2 - t) });

	// ===== DERIVED =====
	let widthAttr = $derived(typeof width === 'number' ? `${width}` : width);
	let heightAttr = $derived(typeof height === 'number' ? `${height}` : height);
	
	let viewBoxAttr = $derived(`${$viewBoxX} ${$viewBoxY} ${$viewBoxWidth} ${$viewBoxHeight}`);

	// ===== EFFECTS =====
	$effect(() => {
		const target = isHovered ? FULL_VIEWBOX : NEAR_VIEWBOX;
		viewBoxX.set(target.x);
		viewBoxY.set(target.y);
		viewBoxWidth.set(target.width);
		viewBoxHeight.set(target.height);
	});

	// ===== EVENT HANDLERS =====
	function handleMouseEnter() {
		isHovered = true;
	}

	function handleMouseLeave() {
		isHovered = false;
		hoveredPathId = null;
	}

	function handlePathMouseEnter(pathId: string) {
		hoveredPathId = pathId;
	}

	function handlePathMouseLeave() {
		hoveredPathId = null;
	}
</script>

<svg
	width={widthAttr}
	height={heightAttr}
	viewBox={viewBoxAttr}
	preserveAspectRatio="xMidYMid slice"
	class={className}
	aria-label={ariaLabel}
	role="img"
	xmlns="http://www.w3.org/2000/svg"
	onmouseenter={handleMouseEnter}
	onmouseleave={handleMouseLeave}
>
	<g id="maps">
		<image
			id="far"
			href="/map/far.jpg"
			x="0"
			y="0"
			width="374.12082"
			height="225.68958"
			preserveAspectRatio="none"
		/>
		<image
			id="near"
			href="/map/near.jpg"
			x="81.364487"
			y="52.243599"
			width="69.217209"
			height="41.755505"
			preserveAspectRatio="none"
		/>
	</g>
	<g id="places" class="places-group" class:svg-hovered={isHovered}>
		<path
			class="place-path"
			class:path-hovered={hoveredPathId === 'terminal'}
			fill="#00be4d"
			fill-opacity="0.471002"
			stroke="transparent"
			stroke-width="2"
			vector-effect="non-scaling-stroke"
			role="button"
			tabindex="0"
			aria-label="Terminal"
			d="m 199.0421,0 0.69474,4.5157895 1.38947,4.8631577 6.25264,7.2947368 -23.62106,35.569919 18.41053,24.090312 0.26053,3.387138 -29.96053,20.494737 22.23158,26.05263 0.20468,4.15928 -20.63263,17.43949 v 3.6844 l 61.77508,74.13799 h 138.0737 V 86.460551 L 350.8421,67.910527 329.65263,54.710525 319.57893,48.110526 317.49473,44.63684 309.85264,43.594736 304.98946,40.815789 292.4842,30.394738 291.78948,27.268421 290.4,26.226315 285.88422,26.573683 278.58947,23.1 l -2.0842,-3.473685 -2.4316,-0.694736 h -1.38946 l -1.73686,-1.389474 0.34737,-1.736842 -0.34737,-1.389474 h -1.38946 l -3.47368,1.389474 -3.47369,-1.042105 -1.73684,-3.473684 -0.69474,-2.4315794 -1.73684,0.6947368 -3.82105,2.4315786 -7.29474,-5.5578942 V 5.3842104 L 243.85263,5.0368422 238.6421,0 Z"
			id="terminal"
			onmouseenter={() => handlePathMouseEnter('terminal')}
			onmouseleave={handlePathMouseLeave}
		/>
		<path
			class="place-path"
			class:path-hovered={hoveredPathId === 'plazabea'}
			fill="#00be4d"
			fill-opacity="0.471002"
			stroke="transparent"
			stroke-width="2"
			vector-effect="non-scaling-stroke"
			role="button"
			tabindex="0"
			aria-label="Plaza Bea"
			d="m 139.27026,5.7722243 19.65013,16.4569797 c 0,0 -2.7019,2.210639 -1.96502,1.965012 0.73688,-0.245626 3.43878,4.421278 3.43878,4.421278 l -27.75581,23.088897 -20.387,-24.317029 z"
			id="plazabea"
			onmouseenter={() => handlePathMouseEnter('plazabea')}
			onmouseleave={handlePathMouseLeave}
		/>
		<path
			class="place-path"
			class:path-hovered={hoveredPathId === 'parque'}
			fill="#00be4d"
			fill-opacity="0.471002"
			stroke="transparent"
			stroke-width="2"
			vector-effect="non-scaling-stroke"
			role="button"
			tabindex="0"
			aria-label="Parque"
			d="m 28.247054,37.089611 4.175651,0.491252 6.509105,2.824708 3.070333,2.210638 3.070331,2.579079 1.473761,1.596573 1.228132,1.719384 0.36844,2.456267 -0.614068,2.579079 -1.596573,1.842199 -2.70189,1.719387 c 0,0 -3.807212,-0.491255 -4.05284,-0.614067 C 38.93181,56.371296 33.2824,53.546591 33.2824,53.546591 l -3.930025,-3.193145 -3.807212,-4.42128 -2.824706,-4.666903 z"
			id="parque"
			onmouseenter={() => handlePathMouseEnter('parque')}
			onmouseleave={handlePathMouseLeave}
		/>
		<path
			class="place-path"
			class:path-hovered={hoveredPathId === 'calleroca'}
			fill="#00be4d"
			fill-opacity="0.471002"
			stroke="transparent"
			stroke-width="2"
			vector-effect="non-scaling-stroke"
			role="button"
			tabindex="0"
			aria-label="Calle Roca"
			d="m 89.273683,91.18421 86.842107,105.94737 h 3.12631 L 91.705262,88.405262 Z"
			id="calleroca"
			onmouseenter={() => handlePathMouseEnter('calleroca')}
			onmouseleave={handlePathMouseLeave}
		/>
	</g>
	<g id="building" class="building-group" class:svg-hovered={isHovered}>
		<path
			class="building-path"
			fill="#00be4d"
			fill-opacity="0.471002"
			stroke="none"
			stroke-width="0.1997"
			vector-effect="non-scaling-stroke"
			role="button"
			tabindex="0"
			aria-label="Aires de Río"
			d="m 111.26556,71.791805 1.52949,-1.228227 1.59901,0.463483 2.47962,3.058973 0.30126,0.115865 0.7184,0.880615 -1.52949,1.251402 -0.60252,-0.787914 -1.50631,-0.301271 z"
			id="airesderio"
		/>
	</g>
</svg>

<style>
	svg {
		/* Layout */
		display: block;
		width: 100%;
		height: 100%;
	}

	.places-group {
		/* Box/Visual */
		opacity: 0;
		
		/* Effects & Motion */
		transition: opacity 0.4s ease;
	}

	.places-group.svg-hovered {
		/* Box/Visual */
		opacity: 1;
	}

	.place-path {
		/* Box/Visual */
		fill-opacity: 0;
		stroke: transparent;
		
		/* Misc/Overrides */
		cursor: pointer;
		
		/* Effects & Motion */
		transition:
			fill-opacity 0.3s ease,
			stroke 0.3s ease,
			stroke-width 0.3s ease;
	}

	/* When SVG is hovered, show black outlines */
	.places-group.svg-hovered .place-path {
		/* Box/Visual */
		stroke: #000000;
		stroke-width: 2;
	}

	/* When a specific path is hovered, show fill */
	.place-path.path-hovered {
		/* Box/Visual */
		fill-opacity: 0.471002;
		stroke: #000000;
		stroke-width: 2;
	}

	.building-group {
		/* Box/Visual */
		opacity: 0;
		
		/* Effects & Motion */
		transition: opacity 0.4s ease;
	}

	.building-group.svg-hovered {
		/* Box/Visual */
		opacity: 1;
	}

	.building-path {
		/* Box/Visual */
		fill-opacity: 0.471002;
		
		/* Effects & Motion */
		transition: fill-opacity 0.3s ease;
	}
</style>

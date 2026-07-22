<script lang="ts">
	import { browser } from '$app/environment';

	type CapRow = { label: string; value: string };

	type NavigatorWithUAData = Navigator & {
		userAgentData?: {
			getHighEntropyValues(hints: string[]): Promise<Record<string, unknown>>;
		};
	};

	let caps = $state<CapRow[]>([]);
	let uaHints = $state<Record<string, string>>({});

	function formatNum(n: number) {
		return Number.isFinite(n) ? String(n) : '—';
	}

	function refreshCaps() {
		if (!browser || typeof window === 'undefined') return;

		const vv = window.visualViewport;
		const nav = navigator as NavigatorWithUAData;

		const rows: CapRow[] = [
			{ label: 'CSS pixel ratio (window.devicePixelRatio)', value: formatNum(window.devicePixelRatio) },
			{
				label: 'Approx. physical viewport width (px)',
				value: formatNum(Math.round(window.innerWidth * window.devicePixelRatio))
			},
			{
				label: 'Approx. physical viewport height (px)',
				value: formatNum(Math.round(window.innerHeight * window.devicePixelRatio))
			},
			{ label: 'Viewport inner width (CSS px)', value: formatNum(window.innerWidth) },
			{ label: 'Viewport inner height (CSS px)', value: formatNum(window.innerHeight) },
			{ label: 'Window outer width (CSS px)', value: formatNum(window.outerWidth) },
			{ label: 'Window outer height (CSS px)', value: formatNum(window.outerHeight) },
			{ label: 'Screen width (reported)', value: formatNum(window.screen.width) },
			{ label: 'Screen height (reported)', value: formatNum(window.screen.height) },
			{ label: 'Screen avail width', value: formatNum(window.screen.availWidth) },
			{ label: 'Screen avail height', value: formatNum(window.screen.availHeight) },
			{ label: 'Device orientation angle', value: formatNum(window.screen.orientation?.angle ?? NaN) },
			{ label: 'Device orientation type', value: window.screen.orientation?.type ?? '—' },
			{
				label: 'visualViewport width (CSS px)',
				value: vv ? formatNum(vv.width) : '—'
			},
			{
				label: 'visualViewport height (CSS px)',
				value: vv ? formatNum(vv.height) : '—'
			},
			{
				label: 'visualViewport scale',
				value: vv ? formatNum(vv.scale) : '—'
			},
			{ label: 'Document client width', value: formatNum(document.documentElement.clientWidth) },
			{ label: 'Document client height', value: formatNum(document.documentElement.clientHeight) },
			{ label: 'matchMedia resolution (1dppx)', value: window.matchMedia('(resolution: 1dppx)').matches ? 'yes' : 'no' },
			{ label: 'matchMedia (-webkit-min-device-pixel-ratio: 2)', value: window.matchMedia('(-webkit-min-device-pixel-ratio: 2)').matches ? 'yes' : 'no' },
			{ label: 'Touch points (maxTouchPoints)', value: formatNum(nav.maxTouchPoints) },
			{ label: 'Coarse pointer (hover: none)', value: window.matchMedia('(hover: none)').matches ? 'yes' : 'no' },
			{ label: 'Reduced motion', value: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'yes' : 'no' },
			{ label: 'Color scheme (prefers)', value: window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light' },
			{ label: 'Hardware concurrency', value: formatNum(nav.hardwareConcurrency) },
			{
				label: 'Device memory (GB, if exposed)',
				value: 'deviceMemory' in nav && typeof nav.deviceMemory === 'number' ? formatNum(nav.deviceMemory) : '—'
			},
			{ label: 'Languages', value: nav.languages?.length ? nav.languages.join(', ') : nav.language || '—' },
			{ label: 'onLine', value: nav.onLine ? 'yes' : 'no' },
			{ label: 'User agent', value: nav.userAgent || '—' }
		];

		caps = rows;
	}

	$effect(() => {
		if (!browser) return;
		refreshCaps();

		window.addEventListener('resize', refreshCaps);
		window.addEventListener('orientationchange', refreshCaps);
		const vv = window.visualViewport;
		vv?.addEventListener('resize', refreshCaps);
		vv?.addEventListener('scroll', refreshCaps);

		const ua = (navigator as NavigatorWithUAData).userAgentData;
		if (ua && typeof ua.getHighEntropyValues === 'function') {
			void ua
				.getHighEntropyValues([
					'architecture',
					'bitness',
					'formFactors',
					'fullVersionList',
					'model',
					'platform',
					'platformVersion',
					'wow64'
				])
				.then((hints: Record<string, unknown>) => {
					const out: Record<string, string> = {};
					for (const [k, v] of Object.entries(hints)) {
						if (v === undefined || v === null) continue;
						out[k] = typeof v === 'object' ? JSON.stringify(v) : String(v);
					}
					uaHints = out;
				})
				.catch(() => {
					uaHints = {};
				});
		} else {
			uaHints = {};
		}

		return () => {
			window.removeEventListener('resize', refreshCaps);
			window.removeEventListener('orientationchange', refreshCaps);
			vv?.removeEventListener('resize', refreshCaps);
			vv?.removeEventListener('scroll', refreshCaps);
		};
	});
</script>

<svelte:head>
	<title>Device capabilities | Aires de Río</title>
	<meta name="robots" content="noindex, nofollow" />
</svelte:head>

<main id="main-content" tabindex="-1" class="devicecaps-route">
	<div class="devicecaps-shell">
		<h1>Device capabilities</h1>
		<p class="description">
			Client-reported viewport, screen, and environment values. CSS pixel ratio is
			<code>window.devicePixelRatio</code>.
		</p>

		{#if !browser}
			<p class="note" role="status">Open this page in a browser to see device details.</p>
		{:else}
			<section class="panel" aria-label="Window and screen metrics">
				<h2>Metrics</h2>
				<dl class="grid">
					{#each caps as row (row.label)}
						<dt>{row.label}</dt>
						<dd>{row.value}</dd>
					{/each}
				</dl>
			</section>

			{#if Object.keys(uaHints).length > 0}
				<section class="panel" aria-label="User-Agent Client Hints">
					<h2>User-Agent Client Hints</h2>
					<dl class="grid">
						{#each Object.entries(uaHints) as [key, val] (key)}
							<dt>{key}</dt>
							<dd>{val}</dd>
						{/each}
					</dl>
				</section>
			{/if}
		{/if}
	</div>
</main>

<style>
	.devicecaps-route {
		margin-top: var(--header-height);
		padding: 2rem 1rem 3rem;
	}

	.devicecaps-shell {
		max-width: 960px;
		margin: 0 auto;
		display: grid;
		gap: 1.25rem;
	}

	h1 {
		margin: 0;
		font-size: clamp(1.5rem, 2vw + 1rem, 2rem);
	}

	h2 {
		margin: 0 0 0.75rem;
		font-size: 1.125rem;
	}

	.description {
		margin: 0;
		color: var(--text-secondary, var(--color-text-secondary));
	}

	.description code {
		font-size: 0.9em;
	}

	.note {
		margin: 0;
		padding: 1rem;
		border-radius: 0.75rem;
		border: 1px dashed var(--card-border, color-mix(in srgb, var(--color-text) 16%, transparent));
		background: var(--card-bg, var(--color-surface));
	}

	.panel {
		padding: 1rem 1.25rem;
		border-radius: 0.75rem;
		background: var(--card-bg, var(--color-surface));
		border: 1px solid var(--card-border, color-mix(in srgb, var(--color-text) 16%, transparent));
	}

	.grid {
		display: grid;
		grid-template-columns: minmax(0, 1fr) minmax(0, 1.2fr);
		gap: 0.35rem 1.25rem;
		margin: 0;
		font-size: 0.9rem;
	}

	.grid dt {
		margin: 0;
		color: var(--text-secondary, var(--color-text-secondary));
		font-weight: 500;
	}

	.grid dd {
		margin: 0;
		word-break: break-word;
		font-family: ui-monospace, monospace;
		font-size: 0.85rem;
	}

	@media (max-width: 640px) {
		.grid {
			grid-template-columns: 1fr;
		}

		.grid dt {
			margin-top: 0.5rem;
		}

		.grid dt:first-child {
			margin-top: 0;
		}
	}
</style>

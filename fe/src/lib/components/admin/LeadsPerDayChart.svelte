<script lang="ts">
	type LeadDate = { createdAt: string; downloadCount?: number | null };
	type RangeMode = '30d' | 'all';
	type DayMetrics = { date: string; leads: number; downloads: number };

	const TZ = 'America/Argentina/Buenos_Aires';
	const CHART_W = 640;
	const CHART_H = 168;
	const PAD_TOP = 12;
	const PAD_BOTTOM = 28;
	const PAD_X = 8;

	let { leads }: { leads: LeadDate[] } = $props();

	let range = $state<RangeMode>('30d');

	function toDayKey(iso: string | Date): string {
		const d = typeof iso === 'string' ? new Date(iso) : iso;
		return d.toLocaleDateString('en-CA', { timeZone: TZ });
	}

	function addDays(dayKey: string, delta: number): string {
		const [y, m, d] = dayKey.split('-').map(Number);
		const utc = new Date(Date.UTC(y, m - 1, d + delta));
		return utc.toISOString().slice(0, 10);
	}

	function eachDayInclusive(start: string, end: string): string[] {
		const out: string[] = [];
		let cur = start;
		while (cur <= end) {
			out.push(cur);
			cur = addDays(cur, 1);
			if (out.length > 3700) break;
		}
		return out;
	}

	function formatLabel(dayKey: string): string {
		const [y, m, d] = dayKey.split('-').map(Number);
		const date = new Date(Date.UTC(y, m - 1, d));
		return date.toLocaleDateString('es-AR', {
			timeZone: 'UTC',
			day: 'numeric',
			month: 'short'
		});
	}

	const series = $derived.by((): DayMetrics[] => {
		const leadCounts: Record<string, number> = {};
		const downloadCounts: Record<string, number> = {};
		for (const lead of leads) {
			if (!lead.createdAt) continue;
			const key = toDayKey(lead.createdAt);
			leadCounts[key] = (leadCounts[key] ?? 0) + 1;
			downloadCounts[key] = (downloadCounts[key] ?? 0) + Math.max(0, Number(lead.downloadCount) || 0);
		}

		const today = toDayKey(new Date());

		const toSeries = (dates: string[]) =>
			dates.map((date) => ({
				date,
				leads: leadCounts[date] ?? 0,
				downloads: downloadCounts[date] ?? 0
			}));

		if (range === '30d') {
			const start = addDays(today, -29);
			return toSeries(eachDayInclusive(start, today));
		}

		const keys = Object.keys(leadCounts);
		if (keys.length === 0) return [];

		let earliest = today;
		for (const key of keys) {
			if (key < earliest) earliest = key;
		}
		return toSeries(eachDayInclusive(earliest, today));
	});

	const totalLeads = $derived(series.reduce((sum, d) => sum + d.leads, 0));
	const totalDownloads = $derived(series.reduce((sum, d) => sum + d.downloads, 0));
	const maxCount = $derived(
		Math.max(1, ...series.map((d) => Math.max(d.leads, d.downloads)))
	);

	const plotH = CHART_H - PAD_TOP - PAD_BOTTOM;
	const plotW = CHART_W - PAD_X * 2;

	const bars = $derived.by(() => {
		const n = series.length;
		if (n === 0) return [];
		const gap = n > 90 ? 1 : n > 45 ? 1.5 : 2;
		const groupW = Math.max(2, (plotW - gap * (n - 1)) / n);
		const pairGap = n > 90 ? 0 : 1;
		const barW = Math.max(1, (groupW - pairGap) / 2);
		return series.map((d, i) => {
			const groupX = PAD_X + i * (groupW + gap);
			const leadsH = (d.leads / maxCount) * plotH;
			const downloadsH = (d.downloads / maxCount) * plotH;
			return {
				date: d.date,
				leads: d.leads,
				downloads: d.downloads,
				leadsBar: {
					x: groupX,
					y: PAD_TOP + (plotH - leadsH),
					width: barW,
					height: Math.max(d.leads > 0 ? 2 : 0, leadsH)
				},
				downloadsBar: {
					x: groupX + barW + pairGap,
					y: PAD_TOP + (plotH - downloadsH),
					width: barW,
					height: Math.max(d.downloads > 0 ? 2 : 0, downloadsH)
				},
				labelX: groupX + groupW / 2
			};
		});
	});

	const labelIndexes = $derived.by(() => {
		const n = series.length;
		if (n === 0) return [] as number[];
		const targetLabels = n <= 30 ? 6 : n <= 90 ? 8 : 10;
		const step = Math.max(1, Math.ceil((n - 1) / (targetLabels - 1)));
		const idxs: number[] = [];
		for (let i = 0; i < n; i += step) idxs.push(i);
		if (idxs[idxs.length - 1] !== n - 1) idxs.push(n - 1);
		return idxs;
	});
</script>

<section class="chart-card" aria-labelledby="leads-per-day-heading">
	<div class="chart-header">
		<div class="chart-titles">
			<h2 id="leads-per-day-heading">Leads y descargas por día</h2>
			{#if leads.length > 0 && series.length > 0}
				<p class="chart-summary">
					{totalLeads} leads · {totalDownloads} descargas en el período
				</p>
				<p class="chart-note">
					Las descargas se atribuyen al día de alta del lead (contador actual).
				</p>
			{/if}
		</div>
		<div class="range-toggle" role="group" aria-label="Rango del gráfico">
			<button
				type="button"
				class:active={range === '30d'}
				aria-pressed={range === '30d'}
				onclick={() => (range = '30d')}
			>
				Últimos 30 días
			</button>
			<button
				type="button"
				class:active={range === 'all'}
				aria-pressed={range === 'all'}
				onclick={() => (range = 'all')}
			>
				Todo el tiempo
			</button>
		</div>
	</div>

	{#if leads.length === 0 || series.length === 0}
		<p class="empty">Sin leads aún</p>
	{:else}
		<div class="legend" aria-hidden="true">
			<span class="legend-item"><span class="swatch leads"></span> Leads</span>
			<span class="legend-item"><span class="swatch downloads"></span> Descargas</span>
		</div>
		<svg
			class="chart-svg"
			viewBox="0 0 {CHART_W} {CHART_H}"
			role="img"
			aria-label="Gráfico de barras: {totalLeads} leads y {totalDownloads} descargas en el período seleccionado"
		>
			{#each bars as bar (bar.date)}
				<g>
					<title>{formatLabel(bar.date)}: {bar.leads} leads, {bar.downloads} descargas</title>
					<rect
						class="bar leads"
						x={bar.leadsBar.x}
						y={bar.leadsBar.y}
						width={bar.leadsBar.width}
						height={bar.leadsBar.height}
						rx="1"
					/>
					<rect
						class="bar downloads"
						x={bar.downloadsBar.x}
						y={bar.downloadsBar.y}
						width={bar.downloadsBar.width}
						height={bar.downloadsBar.height}
						rx="1"
					/>
				</g>
			{/each}
			{#each labelIndexes as i (series[i].date)}
				{@const bar = bars[i]}
				<text class="axis-label" x={bar.labelX} y={CHART_H - 8} text-anchor="middle">
					{formatLabel(series[i].date)}
				</text>
			{/each}
		</svg>
	{/if}
</section>

<style>
	.chart-card {
		margin: 0 0 1.5rem;
		padding: 1rem 1.25rem 1.1rem;
		background: var(--color-bg-canvas);
		border: 1px solid var(--color-border-default);
		border-radius: 0.5rem;
	}

	.chart-header {
		display: flex;
		flex-wrap: wrap;
		align-items: flex-start;
		justify-content: space-between;
		gap: 0.75rem 1rem;
		margin-bottom: 0.75rem;
	}

	.chart-titles h2 {
		margin: 0;
		font-size: 1.05rem;
		font-weight: 600;
		color: var(--color-text-primary);
	}

	.chart-summary {
		margin: 0.2rem 0 0;
		font-size: 0.8125rem;
		color: var(--color-text-secondary);
	}

	.chart-note {
		margin: 0.15rem 0 0;
		font-size: 0.75rem;
		color: var(--color-text-tertiary);
	}

	.range-toggle {
		display: inline-flex;
		border: 1px solid var(--color-border-default);
		border-radius: 0.35rem;
		overflow: hidden;
	}

	.range-toggle button {
		padding: 0.35rem 0.7rem;
		font-size: 0.8125rem;
		background: transparent;
		border: none;
		color: var(--color-text-secondary);
		cursor: pointer;
		font-family: inherit;
	}

	.range-toggle button + button {
		border-left: 1px solid var(--color-border-default);
	}

	.range-toggle button:hover {
		background: var(--color-bg-contrast);
		color: var(--color-text-primary);
	}

	.range-toggle button.active {
		background: var(--color-accent-primary);
		color: #fff;
	}

	.legend {
		display: flex;
		gap: 1rem;
		margin-bottom: 0.5rem;
		font-size: 0.75rem;
		color: var(--color-text-secondary);
	}

	.legend-item {
		display: inline-flex;
		align-items: center;
		gap: 0.35rem;
	}

	.swatch {
		display: inline-block;
		width: 0.65rem;
		height: 0.65rem;
		border-radius: 0.15rem;
	}

	.swatch.leads {
		background: var(--color-accent-primary);
	}

	.swatch.downloads {
		background: var(--color-accent-secondary);
	}

	.bar.leads {
		fill: var(--color-accent-primary);
	}

	.bar.downloads {
		fill: var(--color-accent-secondary);
	}

	.empty {
		margin: 0.5rem 0 0.25rem;
		font-size: 0.9rem;
		color: var(--color-text-secondary);
	}

	.chart-svg {
		display: block;
		width: 100%;
		height: auto;
		max-height: 200px;
	}

	.axis-label {
		fill: var(--color-text-secondary);
		font-size: 9px;
		font-family: inherit;
	}
</style>

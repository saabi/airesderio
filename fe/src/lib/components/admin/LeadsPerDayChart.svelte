<script lang="ts">
	type LeadDate = { createdAt: string };
	type RangeMode = '30d' | 'all';
	type DayCount = { date: string; count: number };

	const TZ = 'America/Argentina/Buenos_Aires';
	const CHART_W = 640;
	const CHART_H = 160;
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

	const series = $derived.by((): DayCount[] => {
		const counts: Record<string, number> = {};
		for (const lead of leads) {
			if (!lead.createdAt) continue;
			const key = toDayKey(lead.createdAt);
			counts[key] = (counts[key] ?? 0) + 1;
		}

		const today = toDayKey(new Date());

		if (range === '30d') {
			const start = addDays(today, -29);
			return eachDayInclusive(start, today).map((date) => ({
				date,
				count: counts[date] ?? 0
			}));
		}

		const keys = Object.keys(counts);
		if (keys.length === 0) return [];

		let earliest = today;
		for (const key of keys) {
			if (key < earliest) earliest = key;
		}
		return eachDayInclusive(earliest, today).map((date) => ({
			date,
			count: counts[date] ?? 0
		}));
	});

	const totalInRange = $derived(series.reduce((sum, d) => sum + d.count, 0));
	const maxCount = $derived(Math.max(1, ...series.map((d) => d.count)));

	const plotH = CHART_H - PAD_TOP - PAD_BOTTOM;
	const plotW = CHART_W - PAD_X * 2;

	const bars = $derived.by(() => {
		const n = series.length;
		if (n === 0) return [];
		const gap = n > 90 ? 1 : n > 45 ? 1.5 : 2;
		const barW = Math.max(1, (plotW - gap * (n - 1)) / n);
		return series.map((d, i) => {
			const h = (d.count / maxCount) * plotH;
			const x = PAD_X + i * (barW + gap);
			const y = PAD_TOP + (plotH - h);
			return { ...d, x, y, width: barW, height: Math.max(d.count > 0 ? 2 : 0, h) };
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
			<h2 id="leads-per-day-heading">Leads por día</h2>
			{#if leads.length > 0 && series.length > 0}
				<p class="chart-summary">{totalInRange} en el período</p>
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
		<svg
			class="chart-svg"
			viewBox="0 0 {CHART_W} {CHART_H}"
			role="img"
			aria-label="Gráfico de barras: {totalInRange} leads en el período seleccionado"
		>
			{#each bars as bar (bar.date)}
				<g>
					<title>{formatLabel(bar.date)}: {bar.count}</title>
					<rect
						class="bar"
						x={bar.x}
						y={bar.y}
						width={bar.width}
						height={bar.height}
						rx="1"
					/>
				</g>
			{/each}
			{#each labelIndexes as i (series[i].date)}
				{@const bar = bars[i]}
				<text
					class="axis-label"
					x={bar.x + bar.width / 2}
					y={CHART_H - 8}
					text-anchor="middle"
				>
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

	.bar {
		fill: var(--color-accent-primary);
	}

	.axis-label {
		fill: var(--color-text-secondary);
		font-size: 9px;
		font-family: inherit;
	}
</style>

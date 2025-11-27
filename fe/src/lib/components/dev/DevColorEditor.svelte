<script module lang="ts">
	// ===== TYPES =====
	type Token = {
		name: string;
		displayName: string;
		value: string;
	};

	interface Props {
		open?: boolean;
		onClose?: () => void;
	}
</script>

<script lang="ts">
	// ===== IMPORTS =====
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';

	// ===== PROPS =====
	const props = $props<Props>();

	// ===== STATE =====
	let tokens = $state<Token[]>([]);
	let loading = $state(false);
	let errorMessage = $state<string | null>(null);
	let copyStatus = $state<'idle' | 'copied' | 'error'>('idle');

	// ===== REFS =====
	let converterElement: HTMLDivElement | null = null;

	// ===== EFFECTS =====
	$effect(() => {
		if (props.open) {
			void loadTokens();
		}
	});

	// ===== LIFECYCLE =====
	onMount(() => {
		if (!browser) return;
	});

	// ===== ASYNC FUNCTIONS =====
	async function loadTokens() {
		loading = true;
		errorMessage = null;
		try {
			const collected = collectColorTokens();
			tokens = collected;
		} catch (err) {
			console.error(err);
			errorMessage = 'Could not read CSS variables from stylesheets.';
		} finally {
			loading = false;
		}
	}

	// ===== UTILITY FUNCTIONS =====
	function collectColorTokens(): Token[] {
		const vars = new Map<string, string>();

		for (const sheet of Array.from(document.styleSheets)) {
			let rules: CSSRuleList | undefined;
			try {
				rules = sheet.cssRules;
			} catch (err) {
				continue; // Skip cross-origin stylesheets
			}
			if (!rules) continue;
			processRules(rules, vars);
		}

		const entries = Array.from(vars.entries()).filter(([, value]) => isColorValue(value.trim()));

		const namesWithoutPrefix = entries.map(([name]) => name.slice(2));
		const commonPrefix = findCommonPrefix(namesWithoutPrefix);

		return entries
			.sort(([aName], [bName]) => aName.localeCompare(bName))
			.map(([name, value]) => {
				const withoutPrefix = name.slice(2);
				const trimmed = commonPrefix ? withoutPrefix.slice(commonPrefix.length) : withoutPrefix;
				const label = formatLabel(trimmed || withoutPrefix);
				const baseValue = value.trim();
				return {
					name,
					value: toEditableColor(baseValue),
					displayName: label
				};
			});
	}

	function processRules(rules: CSSRuleList, vars: Map<string, string>) {
		for (const rule of Array.from(rules)) {
			if (rule.type === CSSRule.STYLE_RULE || rule.type === CSSRule.PAGE_RULE) {
				const styleRule = rule as CSSStyleRule;
				const style = styleRule.style;
				for (const name of Array.from(style)) {
					if (name.startsWith('--')) {
						const value = style.getPropertyValue(name);
						if (value) {
							vars.set(name, value);
						}
					}
				}
			} else if (rule.type === CSSRule.MEDIA_RULE) {
				const mediaRule = rule as CSSMediaRule;
				processRules(mediaRule.cssRules, vars);
			} else if (rule.type === CSSRule.SUPPORTS_RULE) {
				const supportsRule = rule as CSSSupportsRule;
				processRules(supportsRule.cssRules, vars);
			} else if (rule.type === CSSRule.IMPORT_RULE) {
				const importRule = rule as CSSImportRule;
				try {
					if (importRule.styleSheet?.cssRules) {
						processRules(importRule.styleSheet.cssRules, vars);
					}
				} catch {
					continue;
				}
			}
		}
	}

	function findCommonPrefix(names: string[]): string {
		if (names.length === 0) return '';
		let prefix = names[0];
		for (let i = 1; i < names.length; i += 1) {
			const name = names[i];
			let j = 0;
			while (j < prefix.length && j < name.length && prefix[j] === name[j]) {
				j += 1;
			}
			prefix = prefix.slice(0, j);
			if (!prefix) break;
		}

		// Trim to the last hyphen boundary so we remove whole segments
		const hyphenIndex = prefix.lastIndexOf('-');
		return hyphenIndex > 0 ? prefix.slice(0, hyphenIndex + 1) : prefix;
	}

	function formatLabel(name: string): string {
		const cleaned = name.replace(/^-+/, '');
		const segments = cleaned.split('-').filter(Boolean);
		if (segments.length === 0) return cleaned.replace(/-/g, ' ');
		return segments.map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1)).join(' ');
	}

	function isColorValue(value: string): boolean {
		if (!value) return false;
		const normalized = value.trim().toLowerCase();

		const directColorRegex =
			/^(#(?:[0-9a-f]{3,8})|rgba?\([^)]*\)|hsla?\([^)]*\)|hwb\([^)]*\)|lab\([^)]*\)|lch\([^)]*\))$/;

		if (directColorRegex.test(normalized)) return true;

		if (
			normalized.startsWith('oklch(') ||
			normalized.startsWith('oklab(') ||
			normalized.startsWith('color-mix(') ||
			normalized.startsWith('color(') ||
			normalized.startsWith('var(')
		) {
			return true;
		}

		const namedColors = new Set(['transparent', 'currentcolor', 'inherit']);
		return namedColors.has(normalized);
	}

	function toEditableColor(value: string): string {
		if (!browser) return value;
		const converter = ensureConverterElement();
		converter.style.removeProperty('--token-candidate');
		converter.style.backgroundColor = '';
		converter.style.setProperty('--token-candidate', value);
		converter.style.backgroundColor = 'var(--token-candidate)';
		const computed = getComputedStyle(converter).backgroundColor;
		converter.style.backgroundColor = '';
		converter.style.removeProperty('--token-candidate');
		if (!computed) {
			return value;
		}
		const hex = rgbStringToHex(computed);
		return hex ?? value;
	}

	function ensureConverterElement(): HTMLDivElement {
		if (converterElement && document.body.contains(converterElement)) {
			return converterElement;
		}
		const element = document.createElement('div');
		element.style.position = 'absolute';
		element.style.width = '0';
		element.style.height = '0';
		element.style.pointerEvents = 'none';
		element.style.opacity = '0';
		element.style.zIndex = '-1';
		document.body.appendChild(element);
		converterElement = element;
		return element;
	}

	function rgbStringToHex(value: string): string | null {
		const match = value
			.trim()
			.match(/rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})(?:\s*,\s*(\d*\.?\d+))?\s*\)/);
		if (!match) return null;
		const [, rString, gString, bString] = match;
		const r = Math.max(0, Math.min(255, Number(rString)));
		const g = Math.max(0, Math.min(255, Number(gString)));
		const b = Math.max(0, Math.min(255, Number(bString)));
		return (
			'#' +
			[r, g, b]
				.map((component) => component.toString(16).padStart(2, '0'))
				.join('')
				.toLowerCase()
		);
	}

	// ===== EVENT HANDLERS =====
	function handleColorChange(token: Token, value: string) {
		token.value = value;
		document.documentElement.style.setProperty(token.name, value);
		tokens = [...tokens];
	}

	async function copyToClipboard() {
		const cssBlock =
			':root {\n' +
			tokens.map((token) => `  ${token.name}: ${token.value};`).join('\n') +
			'\n}';

		try {
			await navigator.clipboard.writeText(cssBlock);
			copyStatus = 'copied';
			setTimeout(() => {
				copyStatus = 'idle';
			}, 2000);
		} catch (err) {
			console.error(err);
			copyStatus = 'error';
		}
	}

	function closeEditor() {
		props.onClose?.();
	}
</script>

{#if props.open}
	<div class='overlay' role='presentation' onclick={closeEditor}></div>
{/if}

<aside class:visible={props.open}>
	<header class='panel-header'>
		<h2>Color Tokens</h2>
		<button class='close' onclick={closeEditor} aria-label='Close color editor'>&times;</button>
	</header>

	{#if loading}
		<p class='status'>Scanning styles...</p>
	{:else if errorMessage}
		<p class='status error'>{errorMessage}</p>
	{:else if tokens.length === 0}
		<p class='status'>No color variables found.</p>
	{:else}
		<ul>
			{#each tokens as token (token.name)}
				<li>
					<div class='label'>
						<span class='row'>
							<span class='swatch' style={`background: ${token.value}`}></span>
							<span class='name'>{token.displayName}</span>
						</span>
						<span class='code'>{token.name}</span>
					</div>
					<input
						type='color'
						value={token.value}
						oninput={(event) => handleColorChange(token, event.currentTarget.value)}
					/>
				</li>
			{/each}
		</ul>
	{/if}

	<footer class='panel-footer'>
		<button class='copy' onclick={copyToClipboard} disabled={tokens.length === 0}>
			{#if copyStatus === 'copied'}
				Copied!
			{:else if copyStatus === 'error'}
				Copy failed
			{:else}
				Copy updated variables
			{/if}
		</button>
	</footer>
</aside>

<style>
	aside {
		position: fixed;
		top: 0;
		right: -360px;
		width: 360px;
		height: 100vh;
		background: var(--color-bg-elevated, #111);
		color: var(--color-text-default, #fff);
		box-shadow: -0.5rem 0 1.5rem rgba(0, 0, 0, 0.3);
		padding: 1rem;
		transition: right 0.3s ease;
		display: flex;
		flex-direction: column;
		gap: 1rem;
		z-index: 2000;
		border-left: 1px solid rgba(255, 255, 255, 0.1);
	}

	aside.visible {
		right: 0;
	}

	.overlay {
		position: fixed;
		inset: 0;
		background: rgba(0, 0, 0, 0.25);
		z-index: 1999;
	}

	.panel-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.5rem;
	}

	.panel-header h2 {
		margin: 0;
		font-size: 1.1rem;
	}

	.close {
		border: none;
		background: transparent;
		color: inherit;
		cursor: pointer;
		font-size: 1.5rem;
		line-height: 1;
		padding: 0.25rem 0.5rem;
	}

	.status {
		margin: 0;
		font-size: 0.95rem;
		color: var(--color-text-muted, #ccc);
	}

	.status.error {
		color: #ff8080;
	}

	ul {
		list-style: none;
		padding: 0;
		margin: 0;
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		flex: 1;
		overflow-y: auto;
	}

	li {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.75rem;
		background: rgba(0, 0, 0, 0.15);
		border-radius: 0.5rem;
		padding: 0.5rem 0.75rem;
	}

	.label {
		display: flex;
		flex-direction: column;
		gap: 0.15rem;
		flex: 1;
	}

	.row {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
	}

	.swatch {
		width: 24px;
		height: 24px;
		border-radius: 0.25rem;
		border: 1px solid rgba(255, 255, 255, 0.3);
		display: inline-block;
	}

	.name {
		font-weight: 600;
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
	}

	.code {
		font-size: 0.75rem;
		color: var(--color-text-muted, #bbb);
		font-family: 'Fira Code', 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
	}

	input[type='color'] {
		border: none;
		width: 42px;
		height: 32px;
		padding: 0;
		background: transparent;
		cursor: pointer;
	}

	.panel-footer {
		display: flex;
		padding-top: 0.5rem;
		border-top: 1px solid rgba(255, 255, 255, 0.1);
	}

	.copy {
		border: none;
		background: var(--color-accent-secondary, #fff);
		color: var(--color-bg-canvas, #111);
		font-weight: 600;
		padding: 0.75rem 1rem;
		border-radius: 0.5rem;
		cursor: pointer;
		width: 100%;
		transition: transform 0.15s ease, box-shadow 0.15s ease;
	}

	.copy:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.copy:not(:disabled):hover {
		transform: translateY(-1px);
		box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
	}
</style>

<script lang="ts">
	import type { Snippet } from 'svelte';
	import { page } from '$app/stores';

	let { data, children }: { data: { adminEmail?: string }; children: Snippet } = $props();
</script>

{#if $page.url.pathname === '/admin/login'}
	{@render children()}
{:else}
	<div class="admin-layout">
		<nav class="admin-nav">
			<a href="/admin/contactos">Contactos</a>
			<span class="admin-user">{data?.adminEmail ?? ''}</span>
			<form action="/api/admin/logout" method="POST">
				<button type="submit">Salir</button>
			</form>
		</nav>
		<main class="admin-main">
			{@render children()}
		</main>
	</div>
{/if}

<style>
	.admin-layout {
		min-height: 100vh;
		background: var(--color-bg-base);
	}

	.admin-nav {
		display: flex;
		align-items: center;
		gap: 1.5rem;
		padding: 0.75rem 1.5rem;
		background: var(--color-bg-canvas);
		border-bottom: 1px solid var(--color-border-default);
	}

	.admin-nav a {
		color: var(--color-accent-primary);
		text-decoration: none;
		font-weight: 500;
	}

	.admin-nav a:hover {
		text-decoration: underline;
	}

	.admin-user {
		margin-left: auto;
		font-size: 0.875rem;
		color: var(--color-text-secondary);
	}

	.admin-nav button {
		padding: 0.35rem 0.75rem;
		font-size: 0.875rem;
		background: transparent;
		border: 1px solid var(--color-border-default);
		border-radius: 0.25rem;
		color: var(--color-text-primary);
		cursor: pointer;
	}

	.admin-nav button:hover {
		background: var(--color-bg-contrast);
	}

	.admin-main {
		padding: 1.5rem;
		max-width: 1200px;
		margin: 0 auto;
	}
</style>

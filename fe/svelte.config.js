import { mdsvex } from 'mdsvex';
import adapterNode from '@sveltejs/adapter-node';
import adapterVercel from '@sveltejs/adapter-vercel';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

// Determine which adapter to use based on environment
// - Use Vercel adapter if ADAPTER=vercel or if VERCEL env var is set (Vercel sets this automatically)
// - Otherwise, use Node adapter for VM deployment
const useVercelAdapter =
	process.env.ADAPTER === 'vercel' || process.env.VERCEL === '1';

const adapter = useVercelAdapter
	? adapterVercel()
	: adapterNode({
			out: 'build',
			precompress: true,
			envPrefix: ''
		});

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://svelte.dev/docs/kit/integrations
	// for more information about preprocessors
	preprocess: [vitePreprocess(), mdsvex()],

	kit: {
		// Adapter selection:
		// - Vercel: Set ADAPTER=vercel or deploy to Vercel (VERCEL=1 is set automatically)
		// - Node.js: Default for VM deployment with PM2 on Linode VM
		// This enables API routes (e.g., /api/contact) to work in production
		// See https://svelte.dev/docs/kit/adapters for more information about adapters.
		adapter
	},

	extensions: ['.svelte', '.svx']
};

export default config;

import { defineConfig } from 'vitest/config';
import { sveltekit } from '@sveltejs/kit/vite';
import { enhancedImages } from '@sveltejs/enhanced-img';

export default defineConfig({
	plugins: [
		enhancedImages({
			// Generate only JPG format (disable WebP/AVIF)
			// Set default quality to 85 (range: 1-100, higher = better quality but larger files)
			defaultDirectives: () => new URLSearchParams({
				format: 'jpg',
				quality: '80'
			})
		}), // Must come BEFORE sveltekit()
		sveltekit()
	],
	test: {
		include: ['src/**/*.{test,spec}.{js,ts}'],
		environment: 'jsdom',
		setupFiles: ['./src/test/setup.ts'],
		server: {
			deps: {
				inline: ['@sveltejs/kit']
			}
		},
		coverage: {
			provider: 'v8',
			reporter: ['text', 'json', 'html'],
			exclude: [
				'node_modules/',
				'src/test/',
				'**/*.d.ts',
				'**/*.config.*',
				'**/dist/**',
				'**/build/**',
				'**/*.spec.ts' // Exclude demo spec
			],
			thresholds: {
				lines: 70,
				functions: 70,
				branches: 70,
				statements: 70
			}
		}
	},
	preview: {
		allowedHosts: ['ferreyrapons.com']
	}
});

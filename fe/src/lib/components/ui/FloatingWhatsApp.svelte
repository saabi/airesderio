<script lang='ts'>
	// ===== IMPORTS =====
	import { browser } from '$app/environment';

	// ===== TYPES =====
	interface Props {
		/** WhatsApp number in E.164 format without + (e.g. 5493856222266) */
		phone?: string;
		/** Optional pre-filled message (URL-encoded in the link) */
		message?: string;
		/** Aria label for the button */
		ariaLabel?: string;
		/** Scroll delay in ms (same as FloatingCTA for matching animation) */
		delay?: number;
		fadeDuration?: number;
	}

	// ===== DEFAULTS =====
	const DEFAULT_PHONE = '5493856222266';
	const DEFAULT_ARIA_LABEL = 'Abrir WhatsApp para enviar mensaje';
	const DEFAULT_DELAY = 200;
	const DEFAULT_FADE_DURATION = 300;

	// ===== PROPS =====
	let {
		phone = DEFAULT_PHONE,
		message = '',
		ariaLabel = DEFAULT_ARIA_LABEL,
		delay = DEFAULT_DELAY,
		fadeDuration = DEFAULT_FADE_DURATION
	}: Props = $props();

	// ===== STATE (same scroll-follow + contact visibility as FloatingCTA) =====
	let delayedScrollY = $state(0);
	let isContactVisible = $state(false);
	let scrollHistory: number[] = [];
	let animationFrameId: number | null = null;
	let contactObserver: IntersectionObserver | null = null;

	// ===== DERIVED =====
	const whatsappUrl = $derived.by(() => {
		const base = `https://wa.me/${phone}`;
		if (message.trim()) {
			return `${base}?text=${encodeURIComponent(message.trim())}`;
		}
		return base;
	});
	let showButton = $derived(!isContactVisible);
	let transformY = $derived(delayedScrollY);
	let opacity = $derived(showButton ? 1 : 0);

	// ===== EFFECTS =====
	$effect(() => {
		if (!browser) return;

		const delayFrames = Math.max(1, Math.ceil(delay / 16));
		const scrollY = window.scrollY;
		delayedScrollY = scrollY;
		scrollHistory = [scrollY];

		const handleScroll = () => {
			const currentScrollY = window.scrollY;
			scrollHistory.push(currentScrollY);
			if (scrollHistory.length > delayFrames) scrollHistory.shift();
			if (scrollHistory.length > 0) delayedScrollY = scrollHistory[0];
		};

		const updateScroll = () => {
			handleScroll();
			animationFrameId = requestAnimationFrame(updateScroll);
		};
		animationFrameId = requestAnimationFrame(updateScroll);

		const contactElement = document.getElementById('contacto');
		if (contactElement) {
			contactObserver = new IntersectionObserver(
				(entries) => {
					isContactVisible = entries[0]?.isIntersecting ?? false;
				},
				{ threshold: 0.1, rootMargin: '0px' }
			);
			contactObserver.observe(contactElement);
		}

		return () => {
			if (animationFrameId !== null) cancelAnimationFrame(animationFrameId);
			if (contactObserver) contactObserver.disconnect();
		};
	});
</script>

{#if showButton || opacity > 0}
	<a
		href={whatsappUrl}
		target='_blank'
		rel='noopener noreferrer'
		class='floating-whatsapp'
		style={`transform: translateY(${transformY}px); opacity: ${opacity}; transition-duration: ${fadeDuration}ms;`}
		aria-label={ariaLabel}
		title='WhatsApp'
	>
		<svg
			class='whatsapp-icon'
			viewBox='0 0 24 24'
			aria-hidden='true'
			fill='currentColor'
		>
			<path
				d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.865 9.865 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"
			/>
		</svg>
	</a>
{/if}

<style>
	.floating-whatsapp {
		/* Positioning: absolute + translateY (same as FloatingCTA) so it follows scroll with delay */
		position: absolute;
		bottom: var(--floating-whatsapp-bottom, 1.5rem);
		right: var(--floating-cta-right-padding, 1.5rem);
		z-index: 40;

		/* Layout */
		display: flex;
		align-items: center;
		justify-content: center;
		width: 3.25rem;
		height: 3.25rem;

		/* Box/Visual */
		background: #25d366;
		color: #fff;
		border-radius: 50%;
		box-shadow:
			0 0.5rem 1rem rgba(0, 0, 0, 0.15),
			0 0.25rem 0.5rem rgba(0, 0, 0, 0.1);

		/* Misc/Overrides */
		cursor: pointer;
		text-decoration: none;

		/* Effects & Motion */
		transition:
			transform 0.2s ease,
			box-shadow 0.2s ease,
			background-color 0.2s ease,
			opacity var(--floating-cta-fade-duration, 300ms) ease;
	}

	.floating-whatsapp:hover {
		background: #20bd5a;
		transform: translateY(-2px);
		box-shadow: 0 0.5rem 1.25rem rgba(0, 0, 0, 0.2);
	}

	.floating-whatsapp:active {
		transform: translateY(0);
	}

	.floating-whatsapp:focus-visible {
		outline: 2px solid #25d366;
		outline-offset: 2px;
	}

	.whatsapp-icon {
		width: 1.75rem;
		height: 1.75rem;
	}

	@media (max-width: 850px) {
		.floating-whatsapp {
			width: 3rem;
			height: 3rem;
			bottom: var(--floating-whatsapp-bottom, 1rem);
			right: var(--floating-cta-right-padding, 1rem);
		}

		.whatsapp-icon {
			width: 1.5rem;
			height: 1.5rem;
		}
	}
</style>

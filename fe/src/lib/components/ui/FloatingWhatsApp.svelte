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
		id='cta-whatsapp-floating'
		href={whatsappUrl}
		target='_blank'
		rel='noopener noreferrer'
		class='floating-whatsapp cta-whatsapp'
		style={`transform: translateY(${transformY}px); opacity: ${opacity}; transition-duration: ${fadeDuration}ms;`}
		aria-label={ariaLabel}
		title='WhatsApp'
	>
		<img
			class='whatsapp-icon'
			src='/whatsapp-icon.png'
			alt='Link to WhatsApp'
			loading='lazy'
			decoding='async'
		/>
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

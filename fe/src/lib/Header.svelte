<script>
    let { minHeight = 50, maxHeight = 120 } = $props();
    let headerHeight = $state(maxHeight); // Initial header height in pixels
    let topPadding = $state(2.0); // Initial top padding in rem
    
    function updateHeaderHeight() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        headerHeight = Math.max(minHeight, maxHeight - scrollTop);
        
        // Map headerHeight from [minHeight, maxHeight] to [0.5, 2.0] rem
        const heightRatio = (headerHeight - minHeight) / (maxHeight - minHeight);
        topPadding = 0.5 + (heightRatio * 1.5); // 1.5 is the difference between 2.0 and 0.5
    }
    
    $effect(() => {
        window.addEventListener('scroll', updateHeaderHeight);
        updateHeaderHeight(); // Set initial height and padding
        
        return () => {
            window.removeEventListener('scroll', updateHeaderHeight);
        };
    });
</script>

<header class="header" style="height: {headerHeight}px; padding-top: {topPadding}rem;">
	<img src="/aires-de-rio.svg" alt="Aires de Río" />
	<nav>
		<a href="/">Home</a>
		<a href="/edificio">Edificio</a>
		<a href="/ubicacion">Ubicación</a>
		<a href="/amenidades">Aménidades</a>
	</nav>
</header>

<style>
    header {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        z-index: 100;
        min-height: min-content;
        display: grid;
        grid-template-columns: max-content 1fr;
        align-items: end;
        justify-items: start;
        background-color: #CCC;
        padding: 2rem 1rem 0.5rem 1rem;
    }

    nav {
        display: flex;
        gap: 1rem;
        justify-content: space-evenly;
        align-items: end;
        width: 100%;
        height: 100%;
        font-size: 1.2rem;
        font-weight: 500;
    }

    img {
        height: 100%;
        padding-bottom: 4px;
    }
</style>

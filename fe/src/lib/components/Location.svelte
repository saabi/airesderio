<script lang="ts">
	import { browser } from '$app/environment';

	const GOOGLE_MAPS_API_KEY = 'AIzaSyAEjLiUxzFltYqAYYiIapqw9yt6O0ge2QY';

	let mapElement: HTMLDivElement;
	let scriptLoaded = $state(false);

	$effect(() => {
		if (!browser) return;

		if (window.google && window.google.maps) {
			scriptLoaded = true;
			return;
		}

		const scriptId = 'google-maps-script';
		if (document.getElementById(scriptId)) {
			if (window.initMap) window.initMap();
			return;
		}

		window.initMap = () => {
			scriptLoaded = true;
		};

		const script = document.createElement('script');
		script.id = scriptId;
		script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&callback=initMap`;
		script.async = true;
		script.defer = true;
		document.head.appendChild(script);

		return () => {
			// Clean up the global callback function
			if (window.initMap) {
				delete window.initMap;
			}
		};
	});

	$effect(() => {
		if (scriptLoaded && mapElement) {
			const location = { lat: -27.779686, lng: -64.258992 };

			const map = new window.google.maps.Map(mapElement, {
				zoom: 15,
				center: location,
				mapTypeId: 'roadmap',
				styles: [
					{
						featureType: 'poi',
						elementType: 'labels',
						stylers: [{ visibility: 'off' }]
					}
				]
			});

			const marker = new window.google.maps.Marker({
				position: location,
				map: map,
				title: 'Aires de Río'
			});

			const infoWindow = new window.google.maps.InfoWindow({
				content: `
                        <div style="padding: 8px; text-align: center;">
                            <h3 style="margin: 0 0 4px 0; color: #6B4423; font-size: 16px;">Aires de Río</h3>
                            <p style="margin: 0; font-size: 14px; color: #666;">Avenida Rivadavia<br>Santiago del Estero, Argentina</p>
                        </div>
                    `
			});

			marker.addListener('click', function () {
				infoWindow.open(map, marker);
			});

			infoWindow.open(map, marker);
		}
	});
</script>

<section id="ubicacion" class="ubi" aria-labelledby="ubicacion-heading">
	<div class="location-block">
		<div class="location-text">
			<span style="text-transform: uppercase; letter-spacing: .1em; font-size: .9em;">Ubicación</span>
			<h3>¿DÓNDE SE ENCUENTRA?</h3>
			<p>
				Aires de Río ofrece una ubicación de privilegio. Se emplaza sobre Avenida Rivadavia, a un paso
				de todo lo que esta ciudad ofrece para brindarte una vida placentera y cómoda.
			</p>
			<p>
				Ubicado en un área de modernos y elegantes desarrollos edilicios, centro de convenciones, de
				parques y hermosas zonas verdes.
			</p>
			<p>
				Plaza Vea, único centro de compras dentro del área urbana, te ofrece supermercado y shopping
				de cercanía a solo una cuadra.
			</p>
		</div>
		<div
			bind:this={mapElement}
			id="map"
			class="map"
			role="img"
			aria-label="Mapa del entorno mostrando la ubicación estratégica de Aires de Río en Avenida Rivadavia, Santiago del Estero"
		></div>
	</div>
</section>

<script lang="ts">
import SvgViewport from '$lib/components/ui/SvgViewport.svelte';
import Ubicacion from '$lib/components/icons/Ubicacion.svelte';
import Estacionamiento from '$lib/components/icons/Estacionamiento.svelte';
import Building from '$lib/components/icons/Building.svelte';
import Ascensores from '$lib/components/icons/Ascensores.svelte';
import LadrillosCeramicos from '$lib/components/icons/LadrillosCeramicos.svelte';
import AguaSanitarias from '$lib/components/icons/AguaSanitarias.svelte';
import EnergiaElectrica from '$lib/components/icons/EnergiaElectrica.svelte';
import GasNatural from '$lib/components/icons/GasNatural.svelte';
import TerrazaPiscina from '$lib/components/icons/TerrazaPiscina.svelte';
import TechosAltos from '$lib/components/icons/TechosAltos.svelte';
import Carpinteria from '$lib/components/icons/Carpinteria.svelte';
import Puerta from '$lib/components/icons/Puerta.svelte';
import CerraduraDigital from '$lib/components/icons/CerraduraDigital.svelte';
import Vestidor from '$lib/components/icons/Vestidor.svelte';
import Cocina from '$lib/components/icons/Cocina.svelte';
import Horno from '$lib/components/icons/Horno.svelte';
import Banos from '$lib/components/icons/Banos.svelte';
import Piso from '$lib/components/icons/Piso.svelte';
import Lavasecarropas from '$lib/components/icons/Lavasecarropas.svelte';
import UnidadesAire from '$lib/components/icons/UnidadesAire.svelte';
import TomasCorriente from '$lib/components/icons/TomasCorriente.svelte';
import Tilde from '$lib/components/icons/Tilde.svelte';

	let { icon = null, viewBox = '0 0 48 48', size = '1.5em' }: { icon: string | null; viewBox?: string; size?: string } = $props();
</script>

{#if icon === 'ubicacion'}
	<SvgViewport {viewBox} width={size} height={size}><Ubicacion /></SvgViewport>
{:else if icon === 'estacionamiento'}
	<SvgViewport {viewBox} width={size} height={size}><Estacionamiento /></SvgViewport>
{:else if icon === 'building'}
	<SvgViewport {viewBox} width={size} height={size}><Building /></SvgViewport>
{:else if icon === 'ascensores'}
	<SvgViewport {viewBox} width={size} height={size}><Ascensores /></SvgViewport>
{:else if icon === 'ladrillos'}
	<SvgViewport {viewBox} width={size} height={size}><LadrillosCeramicos /></SvgViewport>
{:else if icon === 'agua-sanitarias'}
	<SvgViewport {viewBox} width={size} height={size}><AguaSanitarias /></SvgViewport>
{:else if icon === 'energia'}
	<SvgViewport {viewBox} width={size} height={size}><EnergiaElectrica /></SvgViewport>
{:else if icon === 'gas'}
	<SvgViewport {viewBox} width={size} height={size}><GasNatural /></SvgViewport>
{:else if icon === 'terraza-piscina'}
	<SvgViewport {viewBox} width={size} height={size}><TerrazaPiscina /></SvgViewport>
{:else if icon === 'techos-altos'}
	<SvgViewport {viewBox} width={size} height={size}><TechosAltos /></SvgViewport>
{:else if icon === 'carpinteria'}
	<SvgViewport {viewBox} width={size} height={size}><Carpinteria /></SvgViewport>
{:else if icon === 'puerta'}
	<SvgViewport {viewBox} width={size} height={size}><Puerta /></SvgViewport>
{:else if icon === 'cerradura-digital'}
	<SvgViewport {viewBox} width={size} height={size}><CerraduraDigital /></SvgViewport>
{:else if icon === 'vestidor'}
	<SvgViewport {viewBox} width={size} height={size}><Vestidor /></SvgViewport>
{:else if icon === 'cocina'}
	<SvgViewport {viewBox} width={size} height={size}><Cocina /></SvgViewport>
{:else if icon === 'horno'}
	<SvgViewport {viewBox} width={size} height={size}><Horno /></SvgViewport>
{:else if icon === 'banos'}
	<SvgViewport {viewBox} width={size} height={size}><Banos /></SvgViewport>
{:else if icon === 'piso'}
	<SvgViewport {viewBox} width={size} height={size}><Piso /></SvgViewport>
{:else if icon === 'lavasecarropas'}
	<SvgViewport {viewBox} width={size} height={size}><Lavasecarropas /></SvgViewport>
{:else if icon === 'unidades-aire'}
	<SvgViewport {viewBox} width={size} height={size}><UnidadesAire /></SvgViewport>
{:else if icon === 'tomas-corriente'}
	<SvgViewport {viewBox} width={size} height={size}><TomasCorriente /></SvgViewport>
{:else if icon === 'tilde'}
	<SvgViewport {viewBox} width={size} height={size}><Tilde /></SvgViewport>
{:else}
	<span class="doc-list-placeholder" title="Sin icono asignado" aria-hidden="true">—</span>
{/if}

<style>
	.doc-list-placeholder {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 3em;
		height: 3em;
		border: 1px dashed var(--color-border-strong);
		border-radius: 2px;
		color: var(--color-text-tertiary);
		font-size: 0.9em;
		line-height: 1;
	}
</style>

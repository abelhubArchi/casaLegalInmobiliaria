<script>
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import PublicMapCanvas from '$lib/components/public/PublicMapCanvas.svelte';
	import LotQuickView from '$lib/components/public/LotQuickView.svelte';
	import { Loader2 } from 'lucide-svelte';

	const mapId = $page.params.mapId;

	let mapData = $state(null);
	let loading = $state(true);
	let selectedLot = $state(null);

	onMount(() => {
		const storedMaps = localStorage.getItem('casa_legal_maps');
		if (storedMaps) {
			const maps = JSON.parse(storedMaps);
			const foundMap = maps.find(m => m.id === mapId);
			if (foundMap) {
				mapData = foundMap;
				if (!mapData.lots) mapData.lots = [];
			} else {
				alert("El plano no existe.");
			}
		} else {
			alert("No hay planos guardados.");
		}
		loading = false;
	});

	function handleSelectLot(lot) {
		selectedLot = lot;
	}

	function handleCloseQuickView() {
		selectedLot = null;
	}
</script>

<svelte:head>
	<title>{mapData ? mapData.title : 'Plano'} | CASA LEGAL INMOBILIARIA</title>
</svelte:head>

{#if loading}
	<div class="w-full h-screen flex items-center justify-center bg-gradient-to-br from-brand-green-dark to-brand-green">
		<div class="flex flex-col items-center gap-4">
			<Loader2 class="w-12 h-12 text-brand-gold animate-spin" />
			<p class="text-brand-gold font-medium tracking-widest text-sm uppercase">Cargando plano...</p>
		</div>
	</div>
{:else if mapData}
	<div class="fixed inset-0 w-full h-full bg-slate-900 overflow-hidden font-sans">
		<!-- Elegant Header -->
		<header class="absolute top-0 left-0 right-0 z-10 flex flex-col items-center justify-center pt-6 pb-12 pointer-events-none bg-gradient-to-b from-black/80 via-black/40 to-transparent">
			<h2 class="text-brand-gold text-[10px] font-black tracking-[0.3em] uppercase mb-1 drop-shadow-md">Casa Legal Inmobiliaria</h2>
			<h1 class="font-light text-white text-3xl md:text-4xl tracking-wide drop-shadow-lg text-center px-4">
				{mapData.title}
			</h1>
		</header>

		<!-- Interactive Map -->
		<div class="absolute inset-0 z-0">
			<PublicMapCanvas 
				imageUrl={mapData.base_image_url}
				lots={mapData.lots}
				selectedLotId={selectedLot?.id}
				onselectlot={handleSelectLot}
			/>
		</div>

		<!-- Instruction Overlay (fades out) -->
		<div class="absolute inset-x-0 bottom-24 flex justify-center pointer-events-none z-10 animate-fade-out-delayed">
			<div class="bg-black/50 backdrop-blur-md text-white/90 px-6 py-2 rounded-full text-sm font-medium border border-white/10 shadow-2xl flex items-center gap-2">
				<span class="relative flex h-2.5 w-2.5">
				  <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-gold opacity-75"></span>
				  <span class="relative inline-flex rounded-full h-2.5 w-2.5 bg-brand-gold"></span>
				</span>
				Toca un lote para ver detalles
			</div>
		</div>

		<!-- Quick View Bottom Sheet / Modal (Level 1) -->
		<LotQuickView 
			lot={selectedLot}
			{mapId}
			onclose={handleCloseQuickView}
		/>
	</div>
{/if}

<style>
	@keyframes fade-out-delayed {
		0%, 70% { opacity: 1; }
		100% { opacity: 0; }
	}
	.animate-fade-out-delayed {
		animation: fade-out-delayed 6s ease-in-out forwards;
	}
</style>

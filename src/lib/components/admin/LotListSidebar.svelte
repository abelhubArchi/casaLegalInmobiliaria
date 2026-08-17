<script>
	import { createEventDispatcher } from 'svelte';
	import { Search, MapPin, Plus } from 'lucide-svelte';

	const dispatch = createEventDispatcher();

	let { lots = [], selectedLotId = null } = $props();

	let searchQuery = $state('');
	
	let filteredLots = $derived(
		lots.filter(lot => 
			(lot.code || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
			(lot.description || '').toLowerCase().includes(searchQuery.toLowerCase())
		)
	);

	function formatCurrency(amount) {
		return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount || 0);
	}

	function getStatusLabel(status) {
		switch (status) {
			case 'available': return { label: 'Disponible', class: 'bg-green-100 text-green-700' };
			case 'reserved': return { label: 'Reservado', class: 'bg-yellow-100 text-yellow-700' };
			case 'sold': return { label: 'Vendido', class: 'bg-red-100 text-red-700' };
			default: return { label: 'Desconocido', class: 'bg-slate-100 text-slate-700' };
		}
	}

	function handleLotClick(lotId) {
		dispatch('select', lotId);
	}
</script>

<div class="w-full md:w-80 h-full bg-white border-l border-slate-200 flex flex-col shadow-sm z-10">
	<!-- Header & Search -->
	<div class="p-4 border-b border-slate-200 bg-slate-50">
		<h2 class="text-lg font-bold text-brand-green flex items-center gap-2 mb-4">
			<MapPin class="w-5 h-5 text-brand-gold" />
			Lotes del Plano
		</h2>
		
		<div class="relative">
			<Search class="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
			<input 
				type="text" 
				bind:value={searchQuery}
				placeholder="Buscar lote..." 
				class="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-brand-gold focus:border-brand-gold"
			/>
		</div>
	</div>

	<!-- Stats Summary -->
	<div class="grid grid-cols-3 gap-1 p-2 border-b border-slate-200 bg-white text-center">
		<div class="p-2 bg-slate-50 rounded">
			<div class="text-xs text-slate-500 font-medium">Total</div>
			<div class="font-semibold text-slate-800">{lots.length}</div>
		</div>
		<div class="p-2 bg-green-50 rounded">
			<div class="text-xs text-green-600 font-medium">Disp.</div>
			<div class="font-semibold text-green-700">{lots.filter(l => l.status === 'available').length}</div>
		</div>
		<div class="p-2 bg-red-50 rounded">
			<div class="text-xs text-red-600 font-medium">Vend.</div>
			<div class="font-semibold text-red-700">{lots.filter(l => l.status === 'sold').length}</div>
		</div>
	</div>

	<!-- List -->
	<div class="flex-1 overflow-y-auto p-2 space-y-2">
		{#if filteredLots.length === 0}
			<div class="text-center p-6 text-slate-500 text-sm">
				{#if searchQuery}
					No se encontraron lotes que coincidan con la búsqueda.
				{:else}
					Aún no hay lotes delimitados. Utiliza la herramienta pluma para comenzar a dibujar.
				{/if}
			</div>
		{/if}

		{#each filteredLots as lot (lot.id)}
			{@const statusInfo = getStatusLabel(lot.status)}
			<button 
				class="w-full text-left p-3 rounded-md border transition-all duration-200 group
					{selectedLotId === lot.id ? 'border-brand-gold bg-brand-gold/5 shadow-sm' : 'border-slate-200 hover:border-brand-green/30 hover:bg-slate-50'}"
				on:click={() => handleLotClick(lot.id)}
			>
				<div class="flex justify-between items-start mb-2">
					<span class="font-semibold text-slate-800 group-hover:text-brand-green transition-colors">{lot.code || 'Sin código'}</span>
					<span class="text-[10px] uppercase font-bold px-2 py-1 rounded-full {statusInfo.class}">
						{statusInfo.label}
					</span>
				</div>
				
				<div class="flex justify-between items-end text-sm">
					<div class="text-slate-500">
						<div>{lot.area_m2 || 0} m²</div>
						<div class="text-xs">{lot.orientation || 'N/A'}</div>
					</div>
					<div class="text-right">
						<div class="font-bold text-slate-800">{formatCurrency(lot.price)}</div>
						<div class="text-xs text-slate-500">Al contado</div>
					</div>
				</div>
			</button>
		{/each}
	</div>
</div>

<script>
	import { X, ArrowRight, MessageCircle, Ruler, Compass } from 'lucide-svelte';

	let { lot = null, mapId = null, onclose = null } = $props();

	function closeView() {
		if (onclose) onclose();
	}

	function formatCurrency(amount) {
		return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(amount || 0);
	}

	function handleWhatsApp() {
		const message = encodeURIComponent(`Hola, me interesa reservar el ${lot.code} del proyecto.`);
		window.open(`https://wa.me/1234567890?text=${message}`, '_blank');
	}
</script>

{#if lot}
	<div class="fixed inset-x-0 bottom-0 md:inset-auto md:bottom-6 md:left-1/2 md:-translate-x-1/2 w-full md:w-[400px] bg-white rounded-t-2xl md:rounded-2xl shadow-[0_-10px_40px_rgba(0,0,0,0.1)] z-50 overflow-hidden border border-slate-100 transform transition-transform duration-300 animate-in slide-in-from-bottom-8">
		
		<!-- Close Button -->
		<button 
			class="absolute top-3 right-3 p-1.5 bg-black/40 text-white rounded-full hover:bg-black/60 z-10 backdrop-blur-sm"
			on:click={closeView}
		>
			<X class="w-4 h-4" />
		</button>

		<!-- Hero Image (Fallback if not exists) -->
		<div class="w-full h-36 bg-slate-200 relative">
			{#if lot.images && lot.images.hero && lot.images.hero.length > 0}
				<img src={lot.images.hero[0]} alt={lot.code} class="w-full h-full object-cover" />
			{:else}
				<div class="w-full h-full bg-brand-green/10 flex items-center justify-center">
					<span class="text-brand-green/40 font-semibold text-lg">{lot.code}</span>
				</div>
			{/if}
			
			<!-- Urgency / Status Badge -->
			{#if lot.status === 'available'}
				{#if lot.features && lot.features.includes('Esquina')}
					<div class="absolute bottom-2 left-2 px-2.5 py-1 bg-brand-gold text-slate-900 text-xs font-bold rounded shadow-sm">
						¡Lote en Esquina!
					</div>
				{:else}
					<div class="absolute bottom-2 left-2 px-2.5 py-1 bg-brand-green text-white text-xs font-bold rounded shadow-sm">
						Disponible
					</div>
				{/if}
			{:else if lot.status === 'reserved'}
				<div class="absolute bottom-2 left-2 px-2.5 py-1 bg-yellow-500 text-white text-xs font-bold rounded shadow-sm">
					Reservado
				</div>
			{:else}
				<div class="absolute bottom-2 left-2 px-2.5 py-1 bg-red-500 text-white text-xs font-bold rounded shadow-sm">
					Vendido
				</div>
			{/if}
		</div>

		<!-- Content -->
		<div class="p-5">
			<div class="flex justify-between items-start mb-3">
				<div>
					<h3 class="text-xl font-bold text-slate-900">{lot.code}</h3>
					<div class="flex gap-3 text-sm text-slate-500 mt-1">
						<span class="flex items-center gap-1"><Ruler class="w-3.5 h-3.5"/> {lot.area_m2} m²</span>
						<span class="flex items-center gap-1"><Compass class="w-3.5 h-3.5"/> {lot.orientation}</span>
					</div>
				</div>
			</div>

			<!-- Price Anchor -->
			{#if lot.status === 'available'}
				<div class="mb-4 bg-slate-50 p-3 rounded-lg border border-slate-100">
					<div class="text-xs text-slate-500 uppercase tracking-wide font-semibold mb-1">Inversión Total (Al Contado)</div>
					<div class="text-2xl font-black text-brand-green">{formatCurrency(lot.price)}</div>
				</div>

				<!-- Actions -->
				<div class="flex flex-col gap-2">
					<button 
						class="w-full py-3 bg-[#25D366] text-white rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-[#1ebd5a] transition-colors shadow-sm shadow-[#25D366]/30"
						on:click={handleWhatsApp}
					>
						<MessageCircle class="w-5 h-5" />
						Reservar por WhatsApp
					</button>
					<a 
						href={`/lotes/${mapId}/${lot.id}`}
						class="w-full py-3 bg-white text-slate-700 rounded-lg font-semibold flex items-center justify-center gap-2 border border-slate-200 hover:bg-slate-50 transition-colors"
					>
						Ver detalles, fotos y plusvalía
						<ArrowRight class="w-4 h-4" />
					</a>
				</div>
			{:else}
				<div class="py-4 text-center text-slate-500 text-sm">
					Este lote ya no se encuentra disponible. Por favor, selecciona otro lote en el mapa.
				</div>
			{/if}
		</div>
	</div>
{/if}

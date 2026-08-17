<script>
	import { onMount } from 'svelte';
	import { Plus, Map as MapIcon, Loader2, Image as ImageIcon } from 'lucide-svelte';

	let maps = $state([]);
	let loading = $state(true);
	let isUploading = $state(false);

	onMount(() => {
		loadMaps();
	});

	function loadMaps() {
		try {
			const storedMaps = localStorage.getItem('casa_legal_maps');
			if (storedMaps) {
				maps = JSON.parse(storedMaps).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
			}
		} catch (error) {
			console.error("Error loading maps:", error);
		} finally {
			loading = false;
		}
	}

	async function handleNewMap(event) {
		const file = event.target.files[0];
		if (!file) return;

		const title = prompt("Introduce el nombre de este plano (ej. Manzano A):");
		if (!title) return;

		isUploading = true;
		
		try {
			// Convert image to Base64 for local storage
			const reader = new FileReader();
			reader.onloadend = () => {
				const base_image_url = reader.result;
				const newMapId = 'map-' + Date.now();
				
				const newMap = {
					id: newMapId,
					title,
					created_at: new Date().toISOString(),
					base_image_url,
					lots: []
				};

				maps = [newMap, ...maps];
				localStorage.setItem('casa_legal_maps', JSON.stringify(maps));
				
				window.location.href = `/admin/terrenos/${newMapId}`;
			};
			reader.readAsDataURL(file);
		} catch (error) {
			console.error("Error creating map:", error);
			alert("Error al crear el plano.");
			isUploading = false;
		}
	}
</script>

<div class="min-h-screen bg-slate-50 p-8">
	<div class="max-w-6xl mx-auto space-y-8">
		<header class="flex justify-between items-end border-b border-slate-200 pb-6">
			<div>
				<h1 class="text-3xl font-bold text-brand-green tracking-tight">Casa Legal Inmobiliaria</h1>
				<p class="text-slate-500 mt-1">Módulo de Administración de Terrenos y Planos</p>
			</div>
			
			<div class="relative">
				<input 
					type="file" 
					accept="image/*" 
					class="hidden" 
					id="map-upload"
					on:change={handleNewMap}
					disabled={isUploading}
				/>
				<label 
					for="map-upload"
					class="flex items-center gap-2 px-5 py-2.5 bg-brand-gold text-slate-900 font-semibold rounded-md shadow-sm hover:bg-brand-gold-light transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
				>
					{#if isUploading}
						<Loader2 class="w-5 h-5 animate-spin" />
						Creando...
					{:else}
						<Plus class="w-5 h-5" />
						Nuevo Plano
					{/if}
				</label>
			</div>
		</header>

		{#if loading}
			<div class="flex justify-center py-20">
				<Loader2 class="w-8 h-8 text-brand-green animate-spin" />
			</div>
		{:else if maps.length === 0}
			<div class="text-center py-20 bg-white rounded-xl border border-slate-200 border-dashed">
				<MapIcon class="w-12 h-12 text-slate-300 mx-auto mb-3" />
				<h3 class="text-lg font-medium text-slate-900">No hay planos</h3>
				<p class="text-slate-500 mt-1">Sube un plano base para comenzar a delimitar terrenos.</p>
			</div>
		{:else}
			<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
				{#each maps as map}
					<a 
						href="/admin/terrenos/{map.id}" 
						class="group bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-md transition-shadow flex flex-col"
					>
						<div class="aspect-video bg-slate-100 relative overflow-hidden flex items-center justify-center">
							{#if map.base_image_url}
								<img 
									src={map.base_image_url} 
									alt={map.title} 
									class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
								/>
							{:else}
								<ImageIcon class="w-8 h-8 text-slate-300" />
							{/if}
						</div>
						<div class="p-4 border-t border-slate-100 flex-1 flex flex-col">
							<h3 class="font-bold text-slate-900 line-clamp-1">{map.title}</h3>
							<div class="mt-auto pt-4 flex justify-between items-center text-sm">
								<span class="text-slate-500">{map.lots?.length || 0} lotes guardados</span>
								<span class="text-brand-green font-medium group-hover:underline">Editar &rarr;</span>
							</div>
						</div>
					</a>
				{/each}
			</div>
		{/if}
	</div>
</div>

<script>
	import { createEventDispatcher } from 'svelte';
	import { X, Save, Trash2 } from 'lucide-svelte';
	import MultiImageUploader from './MultiImageUploader.svelte';

	const dispatch = createEventDispatcher();

	let { 
		lot = null, 
		isOpen = false,
		isSaving = false 
	} = $props();

	// Local state for editing
	let formData = $state(null);
	let newImages = $state({
		hero: [],
		ground: [],
		environment: [],
		technical: []
	});

	// Sync local state when lot prop changes
	$effect(() => {
		if (lot) {
			// Migrate old `ground_images` to `images.ground` if `images` object doesn't exist
			let existingImages = lot.images || { hero: [], ground: [], environment: [], technical: [] };
			if (lot.ground_images && lot.ground_images.length > 0 && existingImages.ground.length === 0) {
				existingImages.hero = [lot.ground_images[0]];
				existingImages.ground = lot.ground_images.slice(1);
			}

			formData = {
				code: lot.code || '',
				price: lot.price || 0,
				area_m2: lot.area_m2 || 0,
				status: lot.status || 'available',
				orientation: lot.orientation || 'Norte',
				features: lot.features || [],
				description: lot.description || '',
				images: existingImages
			};
			newImages = { hero: [], ground: [], environment: [], technical: [] };
		} else {
			formData = null;
		}
	});

	const STATUS_OPTIONS = [
		{ value: 'available', label: 'Disponible', color: 'text-green-600 bg-green-50 border-green-200' },
		{ value: 'reserved', label: 'Reservado', color: 'text-yellow-600 bg-yellow-50 border-yellow-200' },
		{ value: 'sold', label: 'Vendido', color: 'text-red-600 bg-red-50 border-red-200' }
	];

	const FEATURE_OPTIONS = ['Agua', 'Luz', 'Alcantarillado', 'Pavimento', 'Esquina', 'Titulado', 'Áreas Verdes'];
	const ORIENTATION_OPTIONS = ['Norte', 'Sur', 'Este', 'Oeste', 'Noreste', 'Noroeste', 'Sureste', 'Suroeste'];

	function closeDrawer() {
		dispatch('close');
	}

	function handleSave() {
		dispatch('save', {
			data: formData,
			newImages: newImages
		});
	}

	function handleDelete() {
		if (confirm('¿Estás seguro de eliminar este lote? Esta acción no se puede deshacer.')) {
			dispatch('delete', lot.id);
		}
	}

	function toggleFeature(feature) {
		const idx = formData.features.indexOf(feature);
		if (idx >= 0) {
			formData.features.splice(idx, 1);
		} else {
			formData.features.push(feature);
		}
	}

	function handleNewImages(e, category) {
		const files = e.detail;
		newImages[category] = [...newImages[category], ...files];
	}

	function removeNewImage(e, category) {
		const index = e.detail;
		newImages[category].splice(index, 1);
	}

	function removeExistingImage(index, category) {
		formData.images[category].splice(index, 1);
	}
</script>

{#if isOpen && formData}
	<!-- Backdrop for mobile/smaller screens -->
	<div 
		class="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40 transition-opacity lg:hidden"
		onclick={closeDrawer}
		role="button"
		tabindex="-1"
		aria-label="Cerrar panel"
	></div>

	<!-- Drawer -->
	<div class="fixed inset-y-0 right-0 w-full md:w-96 bg-white shadow-2xl z-50 flex flex-col transform transition-transform duration-300 ease-in-out border-l border-slate-200">
		<!-- Header -->
		<div class="flex items-center justify-between p-4 border-b border-slate-200 bg-slate-50">
			<h2 class="text-lg font-bold text-slate-800">
				{lot.id.startsWith('temp-') ? 'Nuevo Lote' : 'Editar Lote'}
			</h2>
			<button 
				class="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-full transition-colors"
				onclick={closeDrawer}
			>
				<X class="w-5 h-5" />
			</button>
		</div>

		<!-- Scrollable Content -->
		<div class="flex-1 overflow-y-auto p-4 space-y-6">
			<!-- Información Comercial -->
			<section class="space-y-4">
				<h3 class="text-sm font-semibold text-brand-green uppercase tracking-wider">Info Comercial</h3>
				
				<div class="space-y-1">
					<label class="block text-sm font-medium text-slate-700" for="code">Identificador / Código</label>
					<input 
						type="text" 
						id="code" 
						bind:value={formData.code} 
						placeholder="Ej. Lote 08 - Manzano B"
						class="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-brand-gold focus:border-brand-gold outline-none"
					/>
				</div>

				<div class="space-y-1">
					<label class="block text-sm font-medium text-slate-700" for="price">Precio Total (Al Contado) ($)</label>
					<input 
						type="number" 
						id="price" 
						bind:value={formData.price} 
						class="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-brand-gold focus:border-brand-gold outline-none"
					/>
				</div>

				<div class="space-y-1">
					<label class="block text-sm font-medium text-slate-700" for="status">Estado</label>
					<div class="flex gap-2">
						{#each STATUS_OPTIONS as option}
							<button 
								class="flex-1 py-2 text-sm font-medium rounded-md border transition-colors
									{formData.status === option.value ? option.color + ' ring-2 ring-offset-1 ring-brand-green/30' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}"
								onclick={() => formData.status = option.value}
							>
								{option.label}
							</button>
						{/each}
					</div>
				</div>
			</section>

			<!-- Detalles Técnicos -->
			<section class="space-y-4 pt-4 border-t border-slate-200">
				<h3 class="text-sm font-semibold text-brand-green uppercase tracking-wider">Detalles Técnicos</h3>
				
				<div class="grid grid-cols-2 gap-4">
					<div class="space-y-1">
						<label class="block text-sm font-medium text-slate-700" for="area_m2">Superficie (m²)</label>
						<input 
							type="number" 
							id="area_m2" 
							bind:value={formData.area_m2} 
							class="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-brand-gold focus:border-brand-gold outline-none"
						/>
					</div>
					<div class="space-y-1">
						<label class="block text-sm font-medium text-slate-700" for="orientation">Orientación</label>
						<select 
							id="orientation" 
							bind:value={formData.orientation}
							class="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-brand-gold focus:border-brand-gold outline-none bg-white"
						>
							{#each ORIENTATION_OPTIONS as orient}
								<option value={orient}>{orient}</option>
							{/each}
						</select>
					</div>
				</div>

				<div class="space-y-2">
					<span class="block text-sm font-medium text-slate-700">Checklist de Valor</span>
					<div class="flex flex-wrap gap-2">
						{#each FEATURE_OPTIONS as feature}
							<button
								class="px-3 py-1 text-sm rounded-full border transition-colors
									{formData.features.includes(feature) ? 'bg-brand-green text-white border-brand-green' : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-100'}"
								onclick={() => toggleFeature(feature)}
							>
								{feature}
							</button>
						{/each}
					</div>
				</div>

				<div class="space-y-1">
					<label class="block text-sm font-medium text-slate-700" for="description">Textos de Venta (Gatillos/Plusvalía)</label>
					<textarea 
						id="description" 
						bind:value={formData.description} 
						rows="3"
						placeholder="Ej. Lote en esquina con alta plusvalía estimada..."
						class="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-brand-gold focus:border-brand-gold outline-none resize-none"
					></textarea>
				</div>
			</section>

			<!-- Fotografías Organizadas -->
			<section class="space-y-6 pt-4 border-t border-slate-200 pb-8">
				<h3 class="text-sm font-semibold text-brand-green uppercase tracking-wider">Fotografías</h3>
				
				<!-- Categoría: Hero -->
				<div class="space-y-2">
					<h4 class="font-medium text-slate-700">Foto Principal (Hero)</h4>
					{#if formData.images.hero.length > 0}
						<div class="grid grid-cols-3 gap-2 mb-2">
							{#each formData.images.hero as imgUrl, i}
								<div class="relative group aspect-square rounded-md overflow-hidden bg-slate-100 border border-slate-200">
									<img src={imgUrl} alt="Hero" class="w-full h-full object-cover" />
									<button class="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity" onclick={() => removeExistingImage(i, 'hero')}><X class="w-3 h-3" /></button>
								</div>
							{/each}
						</div>
					{/if}
					<MultiImageUploader images={newImages.hero} on:upload={(e) => handleNewImages(e, 'hero')} on:remove={(e) => removeNewImage(e, 'hero')} disabled={isSaving} />
				</div>

				<!-- Categoría: Terreno -->
				<div class="space-y-2">
					<h4 class="font-medium text-slate-700">Fotos del Terreno a Nivel de Suelo</h4>
					{#if formData.images.ground.length > 0}
						<div class="grid grid-cols-3 gap-2 mb-2">
							{#each formData.images.ground as imgUrl, i}
								<div class="relative group aspect-square rounded-md overflow-hidden bg-slate-100 border border-slate-200">
									<img src={imgUrl} alt="Ground" class="w-full h-full object-cover" />
									<button class="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity" onclick={() => removeExistingImage(i, 'ground')}><X class="w-3 h-3" /></button>
								</div>
							{/each}
						</div>
					{/if}
					<MultiImageUploader images={newImages.ground} on:upload={(e) => handleNewImages(e, 'ground')} on:remove={(e) => removeNewImage(e, 'ground')} disabled={isSaving} />
				</div>

				<!-- Categoría: Entorno -->
				<div class="space-y-2">
					<h4 class="font-medium text-slate-700">Entorno y Accesos</h4>
					{#if formData.images.environment.length > 0}
						<div class="grid grid-cols-3 gap-2 mb-2">
							{#each formData.images.environment as imgUrl, i}
								<div class="relative group aspect-square rounded-md overflow-hidden bg-slate-100 border border-slate-200">
									<img src={imgUrl} alt="Environment" class="w-full h-full object-cover" />
									<button class="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity" onclick={() => removeExistingImage(i, 'environment')}><X class="w-3 h-3" /></button>
								</div>
							{/each}
						</div>
					{/if}
					<MultiImageUploader images={newImages.environment} on:upload={(e) => handleNewImages(e, 'environment')} on:remove={(e) => removeNewImage(e, 'environment')} disabled={isSaving} />
				</div>

				<!-- Categoría: Técnicos -->
				<div class="space-y-2">
					<h4 class="font-medium text-slate-700">Planos y Medidas (Técnico)</h4>
					{#if formData.images.technical.length > 0}
						<div class="grid grid-cols-3 gap-2 mb-2">
							{#each formData.images.technical as imgUrl, i}
								<div class="relative group aspect-square rounded-md overflow-hidden bg-slate-100 border border-slate-200">
									<img src={imgUrl} alt="Technical" class="w-full h-full object-cover" />
									<button class="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity" onclick={() => removeExistingImage(i, 'technical')}><X class="w-3 h-3" /></button>
								</div>
							{/each}
						</div>
					{/if}
					<MultiImageUploader images={newImages.technical} on:upload={(e) => handleNewImages(e, 'technical')} on:remove={(e) => removeNewImage(e, 'technical')} disabled={isSaving} />
				</div>

			</section>
		</div>

		<!-- Footer Actions -->
		<div class="p-4 border-t border-slate-200 bg-slate-50 flex gap-3">
			{#if !lot.id.startsWith('temp-')}
				<button 
					class="px-4 py-2 text-sm font-medium text-red-600 bg-white border border-red-200 rounded-md hover:bg-red-50 transition-colors flex items-center justify-center"
					onclick={handleDelete}
					disabled={isSaving}
				>
					<Trash2 class="w-4 h-4" />
				</button>
			{/if}
			
			<button 
				class="flex-1 px-4 py-2 text-sm font-medium text-white bg-brand-green rounded-md hover:bg-brand-green-light transition-colors flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
				onclick={handleSave}
				disabled={isSaving}
			>
				<Save class="w-4 h-4" />
				{isSaving ? 'Guardando...' : 'Guardar Lote'}
			</button>
		</div>
	</div>
{/if}

<script>
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	
	import MapCanvas from '$lib/components/admin/MapCanvas.svelte';
	import LotListSidebar from '$lib/components/admin/LotListSidebar.svelte';
	import LotFormDrawer from '$lib/components/admin/LotFormDrawer.svelte';
	import { PenTool, Save, ChevronLeft, Loader2 } from 'lucide-svelte';

	const mapId = $page.params.id;

	let mapData = $state(null);
	let loading = $state(true);
	
	// Tool state
	let isDrawing = $state(false);
	let drawingPoints = $state([]);
	let selectedLotId = $state(null);
	
	// Drawer state
	let isDrawerOpen = $state(false);
	let editingLot = $state(null);
	let isSaving = $state(false);

	onMount(() => {
		const storedMaps = localStorage.getItem('casa_legal_maps');
		if (storedMaps) {
			const maps = JSON.parse(storedMaps);
			const foundMap = maps.find(m => m.id === mapId);
			if (foundMap) {
				mapData = foundMap;
				if (!mapData.lots) mapData.lots = [];
			} else {
				alert("El plano no existe localmente.");
			}
		} else {
			alert("No hay planos guardados.");
		}
		loading = false;
	});

	function saveToLocal() {
		const storedMaps = localStorage.getItem('casa_legal_maps');
		if (storedMaps) {
			let maps = JSON.parse(storedMaps);
			const index = maps.findIndex(m => m.id === mapId);
			if (index >= 0) {
				maps[index] = mapData;
				localStorage.setItem('casa_legal_maps', JSON.stringify(maps));
			}
		}
	}

	// --- Drawing Handlers ---

	function toggleDrawing() {
		isDrawing = !isDrawing;
		if (isDrawing) {
			selectedLotId = null;
			closeDrawer();
		} else {
			drawingPoints = [];
		}
	}

	function handleAddPoint(event) {
		drawingPoints = [...drawingPoints, event.detail];
	}

	function handleUndoPoint() {
		if (drawingPoints.length > 0) {
			drawingPoints = drawingPoints.slice(0, -1);
		}
	}

	function handleCancelDrawing() {
		isDrawing = false;
		drawingPoints = [];
	}

	function handleFinishDrawing(event) {
		const points = event.detail;
		isDrawing = false;
		drawingPoints = [];
		
		const tempId = 'temp-' + Date.now();
		editingLot = {
			id: tempId,
			polygon_points: points,
			status: 'available',
			ground_images: [],
			features: []
		};
		selectedLotId = tempId;
		isDrawerOpen = true;
	}

	// --- Selection Handlers ---

	function handleSelectLot(event) {
		const lotId = event.detail;
		selectedLotId = lotId;
		const lot = mapData.lots.find(l => l.id === lotId);
		if (lot) {
			editingLot = JSON.parse(JSON.stringify(lot)); // Deep copy
			isDrawerOpen = true;
			isDrawing = false;
			drawingPoints = [];
		}
	}

	function closeDrawer() {
		isDrawerOpen = false;
		editingLot = null;
		if (selectedLotId && selectedLotId.startsWith('temp-')) {
			selectedLotId = null;
		}
	}

	// --- Save & Delete Handlers ---

	async function handleSaveLot(event) {
		const { data, newImages } = event.detail;
		isSaving = true;

		try {
			// Convert all new images to Base64 per category
			const finalImages = { ...data.images };
			
			for (const [category, files] of Object.entries(newImages)) {
				const uploadedUrls = await Promise.all(files.map(file => {
					return new Promise((resolve, reject) => {
						const reader = new FileReader();
						reader.onloadend = () => resolve(reader.result);
						reader.onerror = reject;
						reader.readAsDataURL(file);
					});
				}));
				finalImages[category] = [...(finalImages[category] || []), ...uploadedUrls];
			}

			// Prepare final lot object
			const finalLot = {
				...editingLot,
				...data,
				images: finalImages
			};

			if (finalLot.id.startsWith('temp-')) {
				finalLot.id = 'lote-' + Date.now();
			}

			// Update the lots array
			let updatedLots = [...mapData.lots];
			const existingIndex = updatedLots.findIndex(l => l.id === editingLot.id || (editingLot.id.startsWith('temp-') && l.id === finalLot.id));
			
			if (existingIndex >= 0) {
				updatedLots[existingIndex] = finalLot;
			} else {
				updatedLots.push(finalLot);
			}

			mapData.lots = updatedLots;
			saveToLocal();

			// Close and reset
			isDrawerOpen = false;
			editingLot = null;
			selectedLotId = null;
			
		} catch (error) {
			console.error("Error saving lot:", error);
			alert("Error al guardar el lote.");
		} finally {
			isSaving = false;
		}
	}

	async function handleDeleteLot(event) {
		const lotIdToDelete = event.detail;
		isSaving = true;

		try {
			mapData.lots = mapData.lots.filter(l => l.id !== lotIdToDelete);
			saveToLocal();
			closeDrawer();
		} catch (error) {
			console.error("Error deleting lot:", error);
			alert("Error al eliminar el lote.");
		} finally {
			isSaving = false;
		}
	}
</script>

{#if loading}
	<div class="w-full h-screen flex items-center justify-center bg-slate-50">
		<Loader2 class="w-10 h-10 text-brand-green animate-spin" />
	</div>
{:else if mapData}
	<div class="flex h-screen w-full bg-slate-50 overflow-hidden relative">
		<!-- Sidebar -->
		<LotListSidebar 
			lots={mapData.lots} 
			{selectedLotId}
			on:select={handleSelectLot} 
		/>

		<!-- Main Workspace -->
		<main class="flex-1 flex flex-col min-w-0">
			<!-- Header -->
			<header class="h-16 border-b border-slate-200 bg-white flex items-center justify-between px-6 shrink-0 z-10 shadow-sm">
				<div class="flex items-center gap-4">
					<a href="/admin/terrenos" class="p-2 -ml-2 text-slate-400 hover:text-brand-green hover:bg-slate-100 rounded-full transition-colors">
						<ChevronLeft class="w-5 h-5" />
					</a>
					<div>
						<h1 class="text-lg font-bold text-slate-800 line-clamp-1">{mapData.title}</h1>
						<p class="text-xs text-slate-500">Editor de plano interactivo</p>
					</div>
				</div>

				<div class="flex items-center gap-3">
					<button 
						class="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors shadow-sm
							{isDrawing ? 'bg-brand-gold text-slate-900 border border-brand-gold hover:bg-brand-gold-light' : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50'}"
						on:click={toggleDrawing}
					>
						<PenTool class="w-4 h-4 {isDrawing ? 'animate-pulse' : ''}" />
						{isDrawing ? 'Dibujando...' : 'Delimitar Lote'}
					</button>
				</div>
			</header>

			<!-- Canvas Area -->
			<div class="flex-1 p-4 md:p-6 overflow-hidden">
				<MapCanvas 
					imageUrl={mapData.base_image_url}
					lots={mapData.lots}
					{selectedLotId}
					{isDrawing}
					{drawingPoints}
					on:addPoint={handleAddPoint}
					on:undoPoint={handleUndoPoint}
					on:cancelDrawing={handleCancelDrawing}
					on:finishDrawing={handleFinishDrawing}
					on:selectLot={handleSelectLot}
				/>
			</div>
		</main>

		<!-- Right Drawer -->
		<LotFormDrawer 
			lot={editingLot}
			isOpen={isDrawerOpen}
			{isSaving}
			on:close={closeDrawer}
			on:save={handleSaveLot}
			on:delete={handleDeleteLot}
		/>
	</div>
{/if}

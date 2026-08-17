<script>
	let {
		imageUrl,
		lots = [],
		selectedLotId = null,
		onselectlot = null
	} = $props();

	let svgElement = $state(null);

	// State for pan and zoom
	let scale = $state(1);
	let panX = $state(0);
	let panY = $state(0);
	let isPanning = $state(false);
	let startPan = $state({ x: 0, y: 0 });

	function handlePointerDown(event) {
		// Start panning for any mouse down in public view (except clicks on polygons which are captured by the polygon)
		isPanning = true;
		startPan = { x: event.clientX - panX, y: event.clientY - panY };
	}

	function handlePointerMove(event) {
		if (isPanning) {
			panX = event.clientX - startPan.x;
			panY = event.clientY - startPan.y;
		}
	}

	function handlePointerUp() {
		isPanning = false;
	}

	function handleWheel(event) {
		event.preventDefault();
		const zoomSensitivity = 0.1;
		const delta = event.deltaY > 0 ? -1 : 1;
		
		let newScale = scale * (1 + delta * zoomSensitivity);
		newScale = Math.max(0.5, Math.min(newScale, 10)); // Clamp between 0.5x and 10x
		
		scale = newScale;
	}

	function handleLotClick(event, lot) {
		event.stopPropagation();
		if (onselectlot) onselectlot(lot);
	}

	function formatPoints(points) {
		return points.map(p => `${p.x},${p.y}`).join(' ');
	}
	
	// Colors geared towards CRO - "Disponible" stands out, "Vendido" is subdued.
	function getStatusColor(status) {
		switch (status) {
			case 'available': return 'rgba(34, 197, 94, 0.5)'; // green-500
			case 'reserved': return 'rgba(234, 179, 8, 0.5)';  // yellow-500
			case 'sold': return 'rgba(148, 163, 184, 0.4)';     // slate-400
			default: return 'rgba(255, 255, 255, 0.4)';
		}
	}
	
	function getStrokeColor(status, isSelected) {
		if (isSelected) return '#ffffff'; // white stroke when selected
		switch (status) {
			case 'available': return '#15803d'; // green-700
			case 'reserved': return '#a16207';  // yellow-700
			case 'sold': return '#64748b';     // slate-500
			default: return '#ffffff';
		}
	}
</script>

<svelte:window on:pointerup={handlePointerUp} />

<div 
	class="w-full h-full flex items-center justify-center bg-[#f8fafc] overflow-hidden cursor-grab active:cursor-grabbing touch-none select-none"
	on:wheel|nonpassive={handleWheel}
>
	<div 
		class="relative origin-center transition-transform duration-75 ease-out"
		style="transform: translate({panX}px, {panY}px) scale({scale});"
	>
		<!-- Base Image -->
		{#if imageUrl}
			<img 
				src={imageUrl} 
				alt="Plano Base" 
				class="block max-w-[95vw] max-h-[90vh] object-contain pointer-events-none shadow-2xl rounded-sm" 
				draggable="false"
			/>
		{:else}
			<div class="flex items-center justify-center w-full h-full p-20 bg-slate-300 text-slate-500">
				Cargando plano...
			</div>
		{/if}

		<!-- SVG Overlay -->
		<svg 
			bind:this={svgElement}
			class="absolute top-0 left-0 w-full h-full"
			viewBox="0 0 100 100"
			preserveAspectRatio="none"
			on:pointerdown={handlePointerDown}
			on:pointermove={handlePointerMove}
		>
			<!-- Existing Lots -->
			{#each lots as lot}
				<!-- svelte-ignore a11y_click_events_have_key_events -->
				<!-- svelte-ignore a11y_no_static_element_interactions -->
				<polygon 
					points={formatPoints(lot.polygon_points)}
					fill={getStatusColor(lot.status)}
					stroke={getStrokeColor(lot.status, selectedLotId === lot.id)}
					stroke-width={selectedLotId === lot.id ? "0.6" : "0.2"}
					stroke-linejoin="round"
					class="transition-all duration-300 {lot.status !== 'sold' ? 'hover:fill-brand-gold/60 cursor-pointer' : 'cursor-not-allowed'}"
					on:pointerdown={(e) => handleLotClick(e, lot)}
					on:click={(e) => handleLotClick(e, lot)}
				>
					<title>{lot.code || 'Lote'}</title>
				</polygon>
			{/each}
		</svg>
	</div>
</div>

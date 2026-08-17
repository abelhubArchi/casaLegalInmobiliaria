<script>
	import { createEventDispatcher } from 'svelte';
	
	const dispatch = createEventDispatcher();
	
	let {
		imageUrl,
		lots = [],
		selectedLotId = null,
		isDrawing = false,
		drawingPoints = []
	} = $props();

	let svgElement = $state(null);
	let viewBox = $state('0 0 100 100');
	let mousePos = $state({ x: 0, y: 0 });

	// State for pan and zoom
	let scale = $state(1);
	let panX = $state(0);
	let panY = $state(0);
	let isPanning = $state(false);
	let startPan = $state({ x: 0, y: 0 });

	// Helper to get relative coordinates (%)
	function getRelativeCoords(event) {
		if (!svgElement) return { x: 0, y: 0 };
		
		const rect = svgElement.getBoundingClientRect();
		// Get position relative to the element
		const xPix = event.clientX - rect.left;
		const yPix = event.clientY - rect.top;
		
		// Convert to percentages based on the visible element size
		const xRel = (xPix / rect.width) * 100;
		const yRel = (yPix / rect.height) * 100;
		
		return { x: xRel, y: yRel };
	}

	function handlePointerDown(event) {
		if (event.button === 1 || event.button === 2 || (event.button === 0 && !isDrawing)) {
			// Middle click, right click or left click when not drawing -> Pan
			isPanning = true;
			startPan = { x: event.clientX - panX, y: event.clientY - panY };
			event.preventDefault();
			return;
		}

		if (isDrawing && event.button === 0) {
			const coords = getRelativeCoords(event);
			
			// Snapping logic
			if (drawingPoints.length > 0) {
				const firstPoint = drawingPoints[0];
				// Calculate distance (in roughly % space, this is a simplification for snapping)
				const dist = Math.sqrt(Math.pow(coords.x - firstPoint.x, 2) + Math.pow(coords.y - firstPoint.y, 2));
				
				// If close enough to first point, auto-close
				if (dist < 2.0 && drawingPoints.length > 2) {
					dispatch('finishDrawing', drawingPoints);
					return;
				}
			}
			
			dispatch('addPoint', coords);
		}
	}

	function handlePointerMove(event) {
		if (isPanning) {
			panX = event.clientX - startPan.x;
			panY = event.clientY - startPan.y;
			return;
		}

		if (isDrawing) {
			mousePos = getRelativeCoords(event);
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

	function handleLotClick(event, lotId) {
		if (isDrawing) return;
		event.stopPropagation();
		dispatch('selectLot', lotId);
	}

	function handleKeyDown(event) {
		if (isDrawing) {
			if (event.key === 'Escape') {
				dispatch('cancelDrawing');
			}
			if (event.key === 'z' && event.ctrlKey) {
				dispatch('undoPoint');
			}
		}
	}

	// Format points array into SVG polygon string (for completed polygons)
	function formatPoints(points) {
		return points.map(p => `${p.x},${p.y}`).join(' ');
	}
	
	// Format points including current mouse position (for drawing)
	function formatDrawingPoints() {
		const pointsStr = formatPoints(drawingPoints);
		if (drawingPoints.length > 0 && mousePos) {
			return `${pointsStr} ${mousePos.x},${mousePos.y}`;
		}
		return pointsStr;
	}

	// Calculate a color based on status
	function getStatusColor(status) {
		switch (status) {
			case 'available': return 'rgba(34, 197, 94, 0.4)'; // green-500
			case 'reserved': return 'rgba(234, 179, 8, 0.4)';  // yellow-500
			case 'sold': return 'rgba(239, 68, 68, 0.4)';     // red-500
			default: return 'rgba(255, 255, 255, 0.4)';
		}
	}
	
	function getStrokeColor(status, isSelected) {
		if (isSelected) return '#d4af37'; // gold
		switch (status) {
			case 'available': return '#16a34a'; // green-600
			case 'reserved': return '#ca8a04';  // yellow-600
			case 'sold': return '#dc2626';     // red-600
			default: return '#ffffff';
		}
	}
</script>

<svelte:window on:keydown={handleKeyDown} on:pointerup={handlePointerUp} />

<div 
	class="w-full h-full flex items-center justify-center bg-slate-200 overflow-hidden cursor-crosshair touch-none select-none rounded-lg"
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
				class="block max-w-[90vw] max-h-[85vh] object-contain pointer-events-none shadow-xl" 
				draggable="false"
			/>
		{:else}
			<div class="flex items-center justify-center w-full h-full p-20 bg-slate-300 text-slate-500">
				No base image uploaded
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
				<polygon 
					points={formatPoints(lot.polygon_points)}
					fill={getStatusColor(lot.status)}
					stroke={getStrokeColor(lot.status, selectedLotId === lot.id)}
					stroke-width={selectedLotId === lot.id ? "0.8" : "0.3"}
					stroke-linejoin="round"
					class="transition-colors duration-200 hover:fill-brand-gold/40 cursor-pointer"
					on:pointerdown={(e) => handleLotClick(e, lot.id)}
				>
					<title>{lot.code || 'Lot'}</title>
				</polygon>
			{/each}

			<!-- Current Drawing path -->
			{#if isDrawing && drawingPoints.length > 0}
				<polyline 
					points={formatDrawingPoints()}
					fill="none"
					stroke="#d4af37" 
					stroke-width="0.5"
					stroke-dasharray="1,1"
					class="pointer-events-none"
				/>
				
				<!-- First Point Snapping Indicator -->
				<circle 
					cx={drawingPoints[0].x} 
					cy={drawingPoints[0].y} 
					r="1.5" 
					fill="#1b4332"
					stroke="#d4af37"
					stroke-width="0.3"
					class="pointer-events-none"
				/>
				
				<!-- Drawing Points Nodes -->
				{#each drawingPoints as point}
					<circle 
						cx={point.x} 
						cy={point.y} 
						r="0.5" 
						fill="#d4af37" 
						class="pointer-events-none"
					/>
				{/each}
			{/if}
		</svg>
	</div>
	
	<!-- Controls Help -->
	<div class="absolute bottom-4 left-4 bg-white/90 backdrop-blur text-xs p-3 rounded-md shadow flex flex-col gap-1 text-slate-700 pointer-events-none">
		<p><span class="font-bold">Pan:</span> Middle-click drag</p>
		<p><span class="font-bold">Zoom:</span> Scroll wheel</p>
		{#if isDrawing}
			<p><span class="font-bold">Draw:</span> Click to place points</p>
			<p><span class="font-bold">Close:</span> Click first point</p>
			<p><span class="font-bold">Cancel:</span> Esc</p>
			<p><span class="font-bold">Undo:</span> Ctrl+Z</p>
		{/if}
	</div>
</div>

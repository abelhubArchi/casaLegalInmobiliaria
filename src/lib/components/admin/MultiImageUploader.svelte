<script>
	import { createEventDispatcher } from 'svelte';
	import { UploadCloud, X, Image as ImageIcon } from 'lucide-svelte';

	const dispatch = createEventDispatcher();

	let { images = [], disabled = false } = $props();
	
	let isDragging = $state(false);
	let fileInput;

	function handleDragEnter(e) {
		e.preventDefault();
		if (!disabled) isDragging = true;
	}

	function handleDragLeave(e) {
		e.preventDefault();
		isDragging = false;
	}

	function handleDrop(e) {
		e.preventDefault();
		isDragging = false;
		if (disabled) return;
		
		const files = e.dataTransfer.files;
		if (files.length > 0) {
			handleFiles(files);
		}
	}

	function handleFileInput(e) {
		if (disabled) return;
		const files = e.target.files;
		if (files.length > 0) {
			handleFiles(files);
		}
	}

	function handleFiles(files) {
		const newFiles = Array.from(files).filter(file => file.type.startsWith('image/'));
		if (newFiles.length > 0) {
			dispatch('upload', newFiles);
		}
	}

	function removeImage(index) {
		if (disabled) return;
		dispatch('remove', index);
	}
</script>

<div class="space-y-4">
	<!-- Dropzone -->
	<div 
		class="relative border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center transition-colors
			{isDragging ? 'border-brand-green bg-brand-green/5' : 'border-slate-300 bg-slate-50'}
			{disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-slate-100'}"
		on:dragenter={handleDragEnter}
		on:dragover={handleDragEnter}
		on:dragleave={handleDragLeave}
		on:drop={handleDrop}
		on:click={() => !disabled && fileInput.click()}
		role="button"
		tabindex="0"
	>
		<input 
			type="file" 
			multiple 
			accept="image/*" 
			class="hidden" 
			bind:this={fileInput}
			on:change={handleFileInput}
			{disabled}
		/>
		
		<UploadCloud class="w-8 h-8 text-slate-400 mb-2" />
		<p class="text-sm font-medium text-slate-700">Click o arrastra imágenes aquí</p>
		<p class="text-xs text-slate-500 mt-1">Soporta JPG, PNG, WEBP</p>
	</div>

	<!-- Image Gallery -->
	{#if images.length > 0}
		<div class="grid grid-cols-3 gap-3">
			{#each images as image, i}
				<div class="relative group aspect-square rounded-md overflow-hidden bg-slate-100 border border-slate-200">
					<img 
						src={typeof image === 'string' ? image : URL.createObjectURL(image)} 
						alt="Foto terreno" 
						class="w-full h-full object-cover"
					/>
					
					<button 
						class="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
						on:click|stopPropagation={() => removeImage(i)}
						{disabled}
					>
						<X class="w-3 h-3" />
					</button>
				</div>
			{/each}
		</div>
	{:else}
		<div class="flex items-center gap-2 text-sm text-slate-500 italic p-4 bg-slate-50 rounded-md border border-slate-200">
			<ImageIcon class="w-4 h-4" />
			No hay fotos de piso asociadas a este lote.
		</div>
	{/if}
</div>

<script>
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import { doc, getDoc } from 'firebase/firestore';
	import { db } from '$lib/firebase/client';
	import { fade, fly, scale } from 'svelte/transition';

	let inmueble = $state(null);
	let isLoaded = $state(false);
	let activeImage = $state('');
	let isLightboxOpen = $state(false);
	let allImages = $state([]);

	onMount(async () => {
		try {
			const id = $page.params.id;
			const docRef = doc(db, 'inmuebles', id);
			const docSnap = await getDoc(docRef);
			
			if (docSnap.exists()) {
				inmueble = { id: docSnap.id, ...docSnap.data() };
				activeImage = inmueble.fotoPrincipal;
				
				// Collect all images so we can easily navigate them
				allImages = [inmueble.fotoPrincipal];
				if (inmueble.fotosSecundarias && inmueble.fotosSecundarias.length > 0) {
					allImages = [...allImages, ...inmueble.fotosSecundarias];
				}
			}
		} catch (error) {
			console.error("Error al obtener inmueble:", error);
		}
		isLoaded = true;
	});

	function openLightbox(img) {
		activeImage = img;
		isLightboxOpen = true;
		document.body.style.overflow = 'hidden';
	}
	
	function closeLightbox() {
		isLightboxOpen = false;
		document.body.style.overflow = '';
	}

	function nextImage() {
		const idx = allImages.indexOf(activeImage);
		if (idx < allImages.length - 1) {
			activeImage = allImages[idx + 1];
		} else {
			activeImage = allImages[0];
		}
	}

	function prevImage() {
		const idx = allImages.indexOf(activeImage);
		if (idx > 0) {
			activeImage = allImages[idx - 1];
		} else {
			activeImage = allImages[allImages.length - 1];
		}
	}
</script>

<svelte:head>
	<title>{inmueble ? inmueble.tituloPropiedad : 'Propiedad Exclusiva'} | Casa Legal</title>
</svelte:head>

{#if isLoaded && inmueble}
	<!-- Lightbox -->
	{#if isLightboxOpen}
		<div class="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center backdrop-blur-md" in:fade={{duration: 300}} out:fade={{duration: 300}}>
			<button class="absolute top-6 right-6 text-white hover:text-brand-gold text-4xl transition-colors z-50" onclick={closeLightbox}>
				<i class="fa-solid fa-xmark"></i>
			</button>
			
			<button class="absolute left-6 text-white hover:text-brand-gold text-4xl transition-colors z-50" onclick={prevImage}>
				<i class="fa-solid fa-chevron-left"></i>
			</button>
			
			<div class="w-full h-full max-w-6xl max-h-screen p-8 sm:p-12 flex items-center justify-center relative" in:scale={{duration: 300, start: 0.9}}>
				<!-- svelte-ignore a11y_click_events_have_key_events -->
				<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
				<img src={activeImage} alt="Gallery" class="max-w-full max-h-full object-contain shadow-2xl rounded-sm drop-shadow-[0_0_20px_rgba(189,168,113,0.15)]" onclick={(e) => e.stopPropagation()}/>
			</div>
			
			<button class="absolute right-6 text-white hover:text-brand-gold text-4xl transition-colors z-50" onclick={nextImage}>
				<i class="fa-solid fa-chevron-right"></i>
			</button>
			
			<!-- Lightbox thumbnails -->
			<div class="absolute bottom-6 left-0 right-0 flex justify-center gap-3 px-4 overflow-x-auto pb-4">
				{#each allImages as img}
					<!-- svelte-ignore a11y_click_events_have_key_events -->
					<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
					<img src={img} alt="Thumb" class={`w-20 h-14 object-cover cursor-pointer rounded-sm border-2 transition-all ${activeImage === img ? 'border-brand-gold opacity-100 scale-110' : 'border-transparent opacity-50 hover:opacity-100'}`} onclick={(e) => { e.stopPropagation(); activeImage = img; }} />
				{/each}
			</div>
		</div>
	{/if}

	<div class="bg-gradient-to-b from-brand-white to-gray-50 min-h-screen pt-24 pb-24 relative overflow-hidden">
		<!-- Decorative Background Elements -->
		<div class="absolute top-0 right-0 w-[800px] h-[800px] bg-brand-gold/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
		<div class="absolute bottom-0 left-0 w-[600px] h-[600px] bg-brand-green/5 rounded-full blur-[120px] translate-y-1/3 -translate-x-1/3 pointer-events-none"></div>

		<div class="container mx-auto px-4 lg:px-8 relative z-10">
			<!-- Breadcrumb -->
			<div class="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-400 mb-8" in:fade={{duration: 800}}>
				<a href="/" class="hover:text-brand-gold transition-colors">Inicio</a>
				<i class="fa-solid fa-chevron-right text-[10px]"></i>
				<a href="/inmuebles" class="hover:text-brand-gold transition-colors">Inmuebles</a>
				<i class="fa-solid fa-chevron-right text-[10px]"></i>
				<span class="text-brand-gold truncate max-w-[200px]">{inmueble.tituloPropiedad}</span>
			</div>

			<!-- Header -->
			<div class="mb-10" in:fly={{ y: 20, duration: 800, delay: 100 }}>
				<div class="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
					<div class="lg:w-2/3">
						<div class="flex gap-3 items-center mb-4 text-xs font-bold uppercase tracking-[0.2em] text-brand-gold">
							<span class="bg-brand-black px-4 py-1.5 rounded-sm shadow-md">{inmueble.tipoOperacion || 'Venta'}</span>
							<span class="border border-brand-gold/30 px-4 py-1.5 rounded-sm">{inmueble.tipoInmueble || 'Propiedad'}</span>
						</div>
						<h1 class="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-brand-black mb-4 leading-tight">{inmueble.tituloPropiedad}</h1>
						<p class="text-gray-500 text-lg md:text-xl flex items-center gap-3 font-light">
							<i class="fa-solid fa-location-dot text-brand-gold"></i> {inmueble.ciudad || ''}{inmueble.zona ? `, ${inmueble.zona}` : ''}
						</p>
					</div>
					<div class="lg:text-right">
						<p class="text-sm font-bold uppercase tracking-widest text-gray-400 mb-2">Precio de Lista</p>
						<p class="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-brand-green-dark to-brand-green">
							{inmueble.moneda === 'BS' || inmueble.moneda === 'BOB' ? 'Bs.' : '$us.'} {inmueble.precioLista ? Number(inmueble.precioLista).toLocaleString() : 'Consultar'}
						</p>
					</div>
				</div>
			</div>

			<!-- Dynamic Gallery -->
			<div class="mb-16" in:fly={{ y: 30, duration: 1000, delay: 200 }}>
				<div class="grid grid-cols-1 md:grid-cols-4 md:grid-rows-2 gap-4 h-[50vh] md:h-[70vh]">
					<!-- Main Big Picture -->
					<!-- svelte-ignore a11y_click_events_have_key_events -->
					<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
					<div class="md:col-span-3 md:row-span-2 rounded-xl overflow-hidden shadow-[0_20px_40px_rgba(0,0,0,0.1)] relative group cursor-zoom-in" onclick={() => openLightbox(activeImage)}>
						<img src={activeImage} alt="Vista principal" class="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-[1.02]" />
						<div class="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-500 flex items-center justify-center">
							<div class="bg-black/50 backdrop-blur-sm text-white rounded-full w-16 h-16 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500 scale-75 group-hover:scale-100">
								<i class="fa-solid fa-expand text-xl"></i>
							</div>
						</div>
					</div>

					<!-- Secondary Thumbnails Stack -->
					<div class="hidden md:flex flex-col gap-4 row-span-2 overflow-y-auto pr-2 custom-scrollbar">
						{#each allImages as img}
							<!-- svelte-ignore a11y_click_events_have_key_events -->
							<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
							<div class={`relative rounded-xl overflow-hidden cursor-pointer flex-shrink-0 h-[32%] transition-all duration-300 ${activeImage === img ? 'ring-2 ring-brand-gold shadow-lg scale-100' : 'opacity-70 hover:opacity-100 hover:scale-[1.03]'}`} onclick={() => activeImage = img}>
								<img src={img} alt="Miniatura" class="w-full h-full object-cover" />
								{#if activeImage === img}
									<div class="absolute inset-0 bg-brand-gold/10"></div>
								{/if}
							</div>
						{/each}
					</div>
					
					<!-- Mobile thumbnails -->
					<div class="flex md:hidden gap-3 overflow-x-auto pb-2">
						{#each allImages as img}
							<!-- svelte-ignore a11y_click_events_have_key_events -->
							<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
							<div class={`relative rounded-lg overflow-hidden cursor-pointer flex-shrink-0 w-24 h-24 transition-all ${activeImage === img ? 'ring-2 ring-brand-gold' : 'opacity-60'}`} onclick={() => activeImage = img}>
								<img src={img} alt="Miniatura" class="w-full h-full object-cover" />
							</div>
						{/each}
					</div>
				</div>
			</div>

			<div class="flex flex-col lg:flex-row gap-16">
				<!-- Detailed Specs & Description -->
				<div class="lg:w-2/3" in:fly={{ y: 20, duration: 800, delay: 300 }}>
					
					<!-- Premium Features Strip -->
					<div class="grid grid-cols-2 md:grid-cols-4 gap-px bg-gray-200 rounded-xl overflow-hidden mb-12 shadow-sm border border-gray-100">
						<div class="bg-white p-6 text-center group hover:bg-brand-gold/5 transition-colors">
							<i class="fa-solid fa-bed text-2xl text-brand-gold mb-3 group-hover:scale-110 transition-transform"></i>
							<p class="text-brand-black text-2xl font-serif mb-1">{(inmueble.dormitoriosEstandar || 0) + (inmueble.dormitoriosSuite || 0)}</p>
							<p class="text-gray-400 text-xs font-bold uppercase tracking-widest">Dormitorios</p>
						</div>
						<div class="bg-white p-6 text-center group hover:bg-brand-gold/5 transition-colors">
							<i class="fa-solid fa-bath text-2xl text-brand-gold mb-3 group-hover:scale-110 transition-transform"></i>
							<p class="text-brand-black text-2xl font-serif mb-1">{inmueble.banosCompletos || 0}</p>
							<p class="text-gray-400 text-xs font-bold uppercase tracking-widest">Baños</p>
						</div>
						<div class="bg-white p-6 text-center group hover:bg-brand-gold/5 transition-colors">
							<i class="fa-solid fa-vector-square text-2xl text-brand-gold mb-3 group-hover:scale-110 transition-transform"></i>
							<p class="text-brand-black text-2xl font-serif mb-1">{inmueble.supConstruida || inmueble.supTerreno || 0}</p>
							<p class="text-gray-400 text-xs font-bold uppercase tracking-widest">Metros M²</p>
						</div>
						<div class="bg-white p-6 text-center group hover:bg-brand-gold/5 transition-colors">
							<i class="fa-solid fa-car text-2xl text-brand-gold mb-3 group-hover:scale-110 transition-transform"></i>
							<p class="text-brand-black text-2xl font-serif mb-1">{inmueble.estacionamientos || 0}</p>
							<p class="text-gray-400 text-xs font-bold uppercase tracking-widest">Parqueos</p>
						</div>
					</div>

					<div class="w-16 h-1 bg-brand-gold mb-10"></div>

					<!-- Typography focused Description -->
					<div class="mb-16 relative">
						<i class="fa-solid fa-quote-left absolute -top-4 -left-4 text-4xl text-gray-100 -z-10"></i>
						<h3 class="text-3xl font-serif font-bold text-brand-black mb-6">Acerca de la Propiedad</h3>
						<div class="prose max-w-none text-gray-600 font-light leading-loose whitespace-pre-wrap text-lg">
							{inmueble.descripcionPropiedad || 'Una propiedad exclusiva de Casa Legal Inmobiliaria.'}
						</div>
					</div>
					
					<!-- Amenities with elegant styling -->
					{#if inmueble.areasComunes && inmueble.areasComunes.length > 0}
						<div class="bg-white p-10 rounded-2xl shadow-xl border border-gray-100">
							<h3 class="text-2xl font-serif font-bold text-brand-black mb-8 flex items-center gap-4">
								<i class="fa-solid fa-star text-brand-gold"></i>
								Amenidades y Áreas Comunes
							</h3>
							<ul class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
								{#each inmueble.areasComunes as area}
									<li class="flex items-center gap-3 text-gray-600">
										<div class="w-6 h-6 rounded-full bg-brand-gold/10 flex items-center justify-center flex-shrink-0">
											<i class="fa-solid fa-check text-[10px] text-brand-gold"></i>
										</div>
										<span class="font-light">{area}</span>
									</li>
								{/each}
							</ul>
						</div>
					{/if}
				</div>

				<!-- Floating Sidebar CTA -->
				<div class="lg:w-1/3 relative" in:fly={{ x: 20, duration: 800, delay: 500 }}>
					<div class="sticky top-32">
						<!-- Premium Glassmorphism Card -->
						<div class="bg-brand-black rounded-2xl shadow-[0_30px_60px_rgba(0,0,0,0.3)] p-1 overflow-hidden relative group">
							<!-- Animated border effect -->
							<div class="absolute inset-0 bg-gradient-to-b from-brand-gold via-transparent to-brand-green opacity-30 group-hover:opacity-100 transition-opacity duration-1000"></div>
							
							<div class="bg-brand-black/95 backdrop-blur-xl relative z-10 p-10 rounded-xl text-center h-full">
								<div class="w-20 h-20 mx-auto bg-brand-green-dark rounded-full flex items-center justify-center mb-6 shadow-[0_0_20px_rgba(189,168,113,0.3)]">
									<i class="fa-solid fa-key text-3xl text-brand-gold"></i>
								</div>
								
								<h3 class="text-brand-white font-serif font-bold text-3xl mb-4">Asegura tu Patrimonio</h3>
								<p class="text-gray-400 font-light text-sm mb-10 leading-relaxed">
									Con Casa Legal Inmobiliaria, esta propiedad incluye nuestro exclusivo servicio de auditoría legal y acompañamiento notarial sin costo adicional.
								</p>
								
								<div class="space-y-4">
									<a href="/contactos" class="block w-full bg-brand-gold text-brand-black font-bold uppercase tracking-widest py-4 rounded-sm hover:bg-white hover:shadow-[0_0_20px_rgba(255,255,255,0.5)] transition-all duration-300">
										Agendar Visita
									</a>
									{#if inmueble.agenteId}
										<a href={`/agentes/${inmueble.agenteId}`} class="block w-full border border-brand-gold/30 text-brand-gold font-bold uppercase tracking-widest py-4 rounded-sm hover:bg-brand-gold hover:text-brand-black transition-all duration-300">
											Conocer al Agente
										</a>
									{/if}
								</div>
								
								<div class="mt-8 pt-8 border-t border-white/10 text-xs text-gray-500 font-light flex items-center justify-center gap-2">
									<i class="fa-solid fa-shield-halved text-brand-gold"></i>
									Transacción 100% Segura
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>

	<style>
		/* Custom scrollbar for thumbnail list */
		.custom-scrollbar::-webkit-scrollbar {
			width: 6px;
		}
		.custom-scrollbar::-webkit-scrollbar-track {
			background: transparent;
		}
		.custom-scrollbar::-webkit-scrollbar-thumb {
			background-color: rgba(189,168,113,0.3);
			border-radius: 10px;
		}
		.custom-scrollbar:hover::-webkit-scrollbar-thumb {
			background-color: rgba(189,168,113,0.8);
		}
	</style>
{:else if isLoaded}
	<div class="min-h-screen flex items-center justify-center bg-brand-white">
		<div class="text-center">
			<i class="fa-solid fa-house-circle-exclamation text-6xl text-gray-200 mb-6"></i>
			<h2 class="text-3xl font-serif font-bold text-brand-black mb-4">Propiedad no disponible</h2>
			<a href="/inmuebles" class="inline-block mt-4 border border-brand-gold text-brand-gold uppercase tracking-widest text-xs font-bold px-8 py-3 hover:bg-brand-gold hover:text-brand-black transition-colors">Volver al catálogo</a>
		</div>
	</div>
{:else}
	<div class="min-h-screen flex items-center justify-center bg-brand-white relative overflow-hidden">
		<!-- Loader effect -->
		<div class="absolute inset-0 bg-brand-black/5"></div>
		<div class="w-24 h-24 relative">
			<div class="absolute inset-0 border-4 border-gray-200 border-t-brand-gold rounded-full animate-spin"></div>
			<div class="absolute inset-2 bg-brand-green rounded-full opacity-20 animate-pulse"></div>
		</div>
	</div>
{/if}

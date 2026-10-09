<script>
	import { onMount } from 'svelte';
	import { fade, fly } from 'svelte/transition';
	import { collection, getDocs } from 'firebase/firestore';
	import { db } from '$lib/firebase/client.js';

	let isLoaded = $state(false);
	let inmuebles = $state([]);

	// Filters
	let filterQuery = $state('');
	let filterTipo = $state('');
	let filterOperacion = $state('');

	onMount(async () => {
		try {
			const querySnapshot = await getDocs(collection(db, 'inmuebles'));
			let fetchedInmuebles = [];
			querySnapshot.forEach((doc) => {
				fetchedInmuebles.push({ id: doc.id, ...doc.data() });
			});
			inmuebles = fetchedInmuebles;
		} catch (error) {
			console.error("Error fetching inmuebles:", error);
		}
		
		isLoaded = true;
	});

	let filteredInmuebles = $derived(
		inmuebles.filter(inmueble => {
			let matchQuery = filterQuery === '' || (inmueble.titulo || '').toLowerCase().includes(filterQuery.toLowerCase()) || (inmueble.zona || inmueble.direccion || '').toLowerCase().includes(filterQuery.toLowerCase());
			let matchTipo = filterTipo === '' || (inmueble.tipo || '').toLowerCase() === filterTipo.toLowerCase();
			let matchOperacion = filterOperacion === '' || (inmueble.operacion || '').toLowerCase() === filterOperacion.toLowerCase();
			return matchQuery && matchTipo && matchOperacion;
		})
	);
</script>

<svelte:head>
	<title>Casa Legal Inmobiliaria | Inmuebles</title>
</svelte:head>

<!-- Header with Search -->
<section class="bg-brand-black pt-32 pb-16 relative">
    <div class="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/black-scales.png')]"></div>
    <div class="container mx-auto px-4 lg:px-8 relative z-10">
        {#if isLoaded}
            <div in:fly={{ y: -30, duration: 1000 }} class="text-center mb-10">
                <h1 class="text-4xl md:text-5xl font-serif font-bold text-brand-white mb-4">
                    Catálogo de <span class="text-brand-gold">Inmuebles</span>
                </h1>
                <p class="text-gray-400 max-w-2xl mx-auto font-light">
                    Explora nuestra exclusiva selección de propiedades. Encuentra el hogar o la inversión perfecta.
                </p>
            </div>
            
            <!-- Filter Bar -->
            <div in:fly={{ y: 30, duration: 1000, delay: 200 }} class="bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/20 flex flex-wrap gap-4 items-center max-w-5xl mx-auto">
                <div class="flex-grow min-w-[200px]">
                    <input type="text" bind:value={filterQuery} placeholder="Buscar por zona o palabra clave..." class="w-full bg-transparent border-b border-white/30 py-2 text-brand-white focus:border-brand-gold outline-none transition-colors placeholder-gray-400" />
                </div>
                <select bind:value={filterTipo} class="bg-transparent border-b border-white/30 py-2 text-brand-white focus:border-brand-gold outline-none transition-colors [&>option]:text-brand-black">
                    <option value="">Todos los tipos</option>
                    <option value="casa">Casa</option>
                    <option value="departamento">Departamento</option>
                    <option value="lote">Lote / Terreno</option>
					<option value="oficina">Oficina</option>
                </select>
                <select bind:value={filterOperacion} class="bg-transparent border-b border-white/30 py-2 text-brand-white focus:border-brand-gold outline-none transition-colors [&>option]:text-brand-black">
                    <option value="">Toda operación</option>
                    <option value="venta">Venta</option>
                    <option value="alquiler">Alquiler</option>
                    <option value="anticretico">Anticrético</option>
                </select>
            </div>
        {/if}
    </div>
</section>

<!-- Properties Grid -->
<section class="py-20 bg-brand-white min-h-[500px]">
    <div class="container mx-auto px-4 lg:px-8">
		{#if !isLoaded}
			<div class="flex justify-center items-center py-20">
				<div class="w-10 h-10 border-4 border-brand-gold border-t-transparent rounded-full animate-spin"></div>
			</div>
		{:else if filteredInmuebles.length === 0}
			<div class="text-center text-gray-500 py-12">
				<i class="fa-solid fa-house-chimney-crack text-4xl mb-4 text-gray-300"></i>
				<p>No se encontraron inmuebles con los filtros seleccionados.</p>
			</div>
		{:else}
			<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
				{#each filteredInmuebles as inmueble (inmueble.id)}
					<a href={`/inmuebles/${inmueble.id}`} class="block group bg-white rounded-xl overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.05)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.1)] transition-all duration-500 hover:-translate-y-2 border border-gray-100 flex flex-col cursor-pointer">
						<div class="relative h-64 overflow-hidden flex-shrink-0">
							<img src={inmueble.fotoPrincipal || 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'} alt={inmueble.tituloPropiedad || 'Propiedad'} class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
							<div class="absolute top-4 right-4 bg-brand-black text-brand-gold text-xs font-bold px-3 py-1 uppercase tracking-wider rounded-sm">
								{inmueble.tipoOperacion || 'Venta'}
							</div>
						</div>
						<div class="p-6 flex flex-col flex-grow">
							<p class="text-brand-gold font-bold text-2xl mb-2">
								{inmueble.moneda === 'BS' || inmueble.moneda === 'BOB' ? 'Bs.' : '$us.'} {inmueble.precioLista ? Number(inmueble.precioLista).toLocaleString() : 'Consultar'}
							</p>
							<h4 class="font-serif text-xl font-bold text-brand-black mb-2 line-clamp-2">{inmueble.tituloPropiedad || 'Propiedad Exclusiva'}</h4>
							<p class="text-gray-500 text-sm mb-4 flex items-center gap-2 flex-grow">
								<i class="fa-solid fa-location-dot"></i> {inmueble.ciudad || 'Ubicación'}
							</p>
							<div class="flex justify-between items-center pt-4 border-t border-gray-100 text-gray-600 text-sm">
								<span class="flex items-center gap-1" title="Habitaciones"><i class="fa-solid fa-bed"></i> {(inmueble.dormitoriosEstandar || 0) + (inmueble.dormitoriosSuite || 0)}</span>
								<span class="flex items-center gap-1" title="Baños"><i class="fa-solid fa-bath"></i> {inmueble.banosCompletos || 0}</span>
								<span class="flex items-center gap-1" title="Área"><i class="fa-solid fa-vector-square"></i> {inmueble.supConstruida || inmueble.supTerreno || 0} m²</span>
							</div>
						</div>
					</a>
				{/each}
			</div>
        {/if}
    </div>
</section>

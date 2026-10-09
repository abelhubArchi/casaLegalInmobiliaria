<script>
	import { onMount } from 'svelte';
	import { fade, fly } from 'svelte/transition';
	import { collection, getDocs, limit, query } from 'firebase/firestore';
	import { db } from '$lib/firebase/client.js';

	let isLoaded = $state(false);
	let inmuebles = $state([]);

	onMount(async () => {
		try {
			const q = query(collection(db, 'inmuebles'), limit(3));
			const querySnapshot = await getDocs(q);
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

	let searchQuery = $state('');
	let propertyType = $state('todas');
	
	function handleSearch() {
		// En el futuro, esto redirigirá a la página de inmuebles con los parámetros de búsqueda
		window.location.href = `/inmuebles`; // Basic redirection for now
		console.log('Buscando:', searchQuery, propertyType);
	}
</script>

<svelte:head>
	<title>Casa Legal Inmobiliaria | Inicio</title>
</svelte:head>

<!-- Hero Section -->
<section class="relative h-screen min-h-[600px] flex items-center justify-center overflow-hidden">
	<!-- Background Image with Overlay -->
	<div class="absolute inset-0 z-0">
		<img 
			src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=2075&q=80" 
			alt="Luxury Home" 
			class="w-full h-full object-cover"
		/>
		<div class="absolute inset-0 bg-gradient-to-b from-brand-black/70 via-brand-black/50 to-brand-black/90"></div>
	</div>

	<!-- Hero Content -->
	<div class="container mx-auto px-4 relative z-10 text-center text-brand-white">
		{#if isLoaded}
			<h1 in:fly={{ y: 50, duration: 1000, delay: 200 }} class="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 tracking-tight">
				Encuentra tu lugar ideal con <br />
				<span class="text-gold-gradient block mt-2">Elegancia y Seguridad</span>
			</h1>
			
			<p in:fade={{ duration: 1000, delay: 800 }} class="text-lg md:text-xl font-light mb-12 max-w-2xl mx-auto text-gray-300">
				La red inmobiliaria más exclusiva y confiable. Expertos en propiedades de lujo, lotes y asesoría legal garantizada.
			</p>

			<!-- Search Bar (Glassmorphism) -->
			<div in:fly={{ y: 50, duration: 1000, delay: 1200 }} class="max-w-4xl mx-auto glass-effect rounded-2xl p-4 md:p-6 shadow-2xl">
				<form onsubmit={(e) => { e.preventDefault(); handleSearch(); }} class="flex flex-col md:flex-row gap-4">
					<div class="flex-grow flex items-center bg-white/10 rounded-lg px-4 border border-white/20 text-brand-white focus-within:border-brand-gold transition-colors">
						<i class="fa-solid fa-location-dot text-brand-gold mr-3"></i>
						<input 
							type="text" 
							bind:value={searchQuery}
							placeholder="¿Dónde quieres vivir? (Ej. Ciudad, Zona)"
							class="w-full bg-transparent py-4 outline-none placeholder-gray-400 font-light"
						/>
					</div>
					
					<div class="md:w-64 flex items-center bg-white/10 rounded-lg px-4 border border-white/20 text-brand-white focus-within:border-brand-gold transition-colors">
						<i class="fa-solid fa-home text-brand-gold mr-3"></i>
						<select 
							bind:value={propertyType}
							class="w-full bg-transparent py-4 outline-none text-brand-black md:text-brand-white [&>option]:text-brand-black appearance-none cursor-pointer font-light"
						>
							<option value="todas">Tipo de Inmueble</option>
							<option value="casa">Casas</option>
							<option value="departamento">Departamentos</option>
							<option value="terreno">Terrenos / Lotes</option>
							<option value="oficina">Oficinas</option>
						</select>
					</div>
					
					<button 
						type="submit" 
						class="bg-brand-gold hover:bg-[#b5952f] text-brand-black font-semibold uppercase tracking-wider py-4 px-8 rounded-lg transition-all duration-300 hover:shadow-[0_0_20px_rgba(212,175,55,0.4)] flex items-center justify-center gap-2"
					>
						<i class="fa-solid fa-search"></i>
						<span>Buscar</span>
					</button>
				</form>
			</div>
		{/if}
	</div>
	
	<!-- Scroll Indicator -->
	<div class="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce text-brand-gold z-10">
		<i class="fa-solid fa-chevron-down text-2xl"></i>
	</div>
</section>

<!-- Featured Section -->
<section class="py-24 bg-brand-white">
	<div class="container mx-auto px-4 lg:px-8">
		<div class="text-center mb-16">
			<h2 class="text-xs font-sans tracking-[0.3em] text-brand-gold uppercase mb-4">Descubre lo Mejor</h2>
			<h3 class="text-3xl md:text-5xl text-brand-black font-bold">Propiedades Exclusivas</h3>
			<div class="w-24 h-1 bg-brand-gold mx-auto mt-8"></div>
		</div>
		
		<!-- Placeholder for future properties loaded from Firebase -->
		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
			{#if inmuebles.length > 0}
				{#each inmuebles as inmueble (inmueble.id)}
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
			{:else if isLoaded}
				<div class="col-span-full text-center py-12 text-gray-500">
					Próximamente estaremos añadiendo nuestras propiedades exclusivas.
				</div>
			{/if}
		</div>

		<div class="text-center mt-12">
			<a href="/inmuebles" class="inline-block border-2 border-brand-black text-brand-black hover:bg-brand-black hover:text-brand-gold font-bold uppercase tracking-widest py-3 px-8 transition-colors duration-300">
				Ver Todas las Propiedades
			</a>
		</div>
	</div>
</section>

<!-- Values Section -->
<section class="py-24 bg-brand-black text-brand-white relative">
	<!-- Subtle pattern overlay -->
	<div class="absolute inset-0 opacity-5 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
	
	<div class="container mx-auto px-4 lg:px-8 relative z-10">
		<div class="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
			<div class="group">
				<div class="w-20 h-20 mx-auto border border-brand-gold rounded-full flex items-center justify-center mb-6 text-brand-gold group-hover:bg-brand-gold group-hover:text-brand-black transition-colors duration-500">
					<i class="fa-solid fa-scale-balanced text-3xl"></i>
				</div>
				<h4 class="font-serif text-xl font-bold mb-4">Seguridad Legal</h4>
				<p class="text-gray-400 font-light text-sm leading-relaxed">
					Cada transacción cuenta con el respaldo de nuestros expertos jurídicos, garantizando inversiones sin riesgos.
				</p>
			</div>
			
			<div class="group">
				<div class="w-20 h-20 mx-auto border border-brand-gold rounded-full flex items-center justify-center mb-6 text-brand-gold group-hover:bg-brand-gold group-hover:text-brand-black transition-colors duration-500">
					<i class="fa-solid fa-gem text-3xl"></i>
				</div>
				<h4 class="font-serif text-xl font-bold mb-4">Exclusividad</h4>
				<p class="text-gray-400 font-light text-sm leading-relaxed">
					Acceso a las propiedades más selectas del mercado, seleccionadas bajo estrictos estándares de calidad.
				</p>
			</div>
			
			<div class="group">
				<div class="w-20 h-20 mx-auto border border-brand-gold rounded-full flex items-center justify-center mb-6 text-brand-gold group-hover:bg-brand-gold group-hover:text-brand-black transition-colors duration-500">
					<i class="fa-solid fa-handshake-angle text-3xl"></i>
				</div>
				<h4 class="font-serif text-xl font-bold mb-4">Atención Premium</h4>
				<p class="text-gray-400 font-light text-sm leading-relaxed">
					Asesoría personalizada por parte de agentes altamente capacitados, orientados a superar tus expectativas.
				</p>
			</div>
		</div>
	</div>
</section>

<script>
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
	import { db } from '$lib/firebase/client';
	import { fade, fly } from 'svelte/transition';
	import logoImg from '$lib/assets/logoinmo.png';

	let agente = $state(null);
	let propiedadesAsignadas = $state([]);
	let isLoaded = $state(false);

	onMount(async () => {
		try {
			const id = $page.params.id;
			
			// Obtener usuario
			const userDoc = await getDoc(doc(db, 'usuarios', id));
			
			if (userDoc.exists()) {
				const userData = userDoc.data();
				
				// Obtener datos de marketing
				const mktDoc = await getDoc(doc(db, 'marketing_agentes', id));
				const mktData = mktDoc.exists() ? mktDoc.data() : {};
				
				agente = {
					id: id,
					nombres: userData.nombres || '',
					apellidos: userData.apellidos || '',
					email: userData.email || '',
					telefono: userData.telefono || '',
					rol: userData.rol || 'AGENTE',
					experiencia: userData.experiencia || 'No especificada',
					// Marketing fields
					foto: mktData.agenteFoto || mktData.fondoUrl || 'https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
					facebook: mktData.facebook || '',
					instagram: mktData.instagram || '',
					tiktok: mktData.tiktok || '',
					whatsapp: mktData.whatsapp || userData.telefono || '',
					bio: mktData.bio || 'Asesor Inmobiliario comprometido con encontrar tu hogar ideal o la inversión perfecta.'
				};

				// Buscar propiedades asignadas a este agente
				const q = query(collection(db, 'inmuebles'), where('agenteId', '==', id));
				const snapshot = await getDocs(q);
				let props = [];
				snapshot.forEach(doc => {
					props.push({ id: doc.id, ...doc.data() });
				});
				propiedadesAsignadas = props;
			}
		} catch (error) {
			console.error("Error al obtener agente:", error);
		}
		isLoaded = true;
	});
</script>

<svelte:head>
	<title>{agente ? `${agente.nombres} ${agente.apellidos}` : 'Agente'} | Casa Legal</title>
</svelte:head>

{#if isLoaded && agente}
	<div class="bg-brand-white min-h-screen pt-24 pb-16">
		<div class="container mx-auto px-4 lg:px-8">
			
			<!-- Profile Card -->
			<div class="bg-brand-green-dark rounded-3xl overflow-hidden shadow-2xl mb-16 flex flex-col md:flex-row" in:fly={{ y: 20, duration: 800 }}>
				<div class="md:w-2/5 lg:w-1/3 relative h-[32rem] md:h-auto overflow-hidden">
					{#if agente.foto && agente.foto !== 'https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'}
						<img src={agente.foto} alt={`${agente.nombres} ${agente.apellidos}`} class="w-full h-full object-cover" />
					{:else}
						<div class="w-full h-full bg-brand-green-dark flex items-center justify-center relative overflow-hidden">
							<!-- Animated background effect -->
							<div class="absolute inset-0 bg-gradient-to-tr from-brand-black/40 via-brand-gold/10 to-transparent"></div>
							<div class="absolute -inset-10 bg-brand-green/20 blur-2xl animate-[spin_10s_linear_infinite] origin-center"></div>
							<img src={logoImg} alt="Casa Legal" class="w-1/2 object-contain relative z-10 opacity-50 drop-shadow-lg" />
						</div>
					{/if}
					<div class="absolute inset-0 bg-gradient-to-t from-brand-green-dark/80 to-transparent md:hidden"></div>
				</div>
				<div class="md:w-3/5 lg:w-2/3 p-8 lg:p-12 text-brand-white flex flex-col justify-center relative">
					<span class="text-brand-gold uppercase tracking-widest text-xs font-bold mb-2">{agente.rol === 'ADMIN' ? 'Administrador' : 'Agente Inmobiliario'}</span>
					<h1 class="text-4xl md:text-5xl font-serif font-bold mb-4">{agente.nombres} <span class="text-brand-gold">{agente.apellidos}</span></h1>
					
					<p class="text-gray-300 font-light mb-8 max-w-2xl leading-relaxed">
						{agente.bio}
					</p>
					
					<div class="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
						{#if agente.telefono}
							<a href={`tel:${agente.telefono}`} class="flex items-center gap-4 text-gray-300 hover:text-brand-gold transition-colors">
								<div class="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-brand-gold">
									<i class="fa-solid fa-phone"></i>
								</div>
								<span>{agente.telefono}</span>
							</a>
						{/if}
						{#if agente.email}
							<a href={`mailto:${agente.email}`} class="flex items-center gap-4 text-gray-300 hover:text-brand-gold transition-colors">
								<div class="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-brand-gold">
									<i class="fa-solid fa-envelope"></i>
								</div>
								<span>{agente.email}</span>
							</a>
						{/if}
					</div>
					
					<div class="w-full h-px bg-white/10 mb-8"></div>
					
					<div class="flex flex-wrap gap-4 items-center justify-between">
						<div class="flex gap-4">
							{#if agente.whatsapp}
								<a href={`https://wa.me/${agente.whatsapp.replace(/\+/g, '')}`} target="_blank" class="w-12 h-12 rounded-full bg-brand-gold text-brand-black flex items-center justify-center hover:scale-110 transition-transform shadow-lg shadow-brand-gold/20" title="WhatsApp">
									<i class="fa-brands fa-whatsapp text-xl"></i>
								</a>
							{/if}
							{#if agente.facebook}
								<a href={agente.facebook} target="_blank" class="w-12 h-12 rounded-full bg-white/10 text-brand-white flex items-center justify-center hover:bg-brand-gold hover:text-brand-black transition-all" title="Facebook">
									<i class="fa-brands fa-facebook-f"></i>
								</a>
							{/if}
							{#if agente.instagram}
								<a href={agente.instagram} target="_blank" class="w-12 h-12 rounded-full bg-white/10 text-brand-white flex items-center justify-center hover:bg-brand-gold hover:text-brand-black transition-all" title="Instagram">
									<i class="fa-brands fa-instagram"></i>
								</a>
							{/if}
							{#if agente.tiktok}
								<a href={agente.tiktok} target="_blank" class="w-12 h-12 rounded-full bg-white/10 text-brand-white flex items-center justify-center hover:bg-brand-gold hover:text-brand-black transition-all" title="TikTok">
									<i class="fa-brands fa-tiktok"></i>
								</a>
							{/if}
						</div>
						
						<div class="text-right mt-4 sm:mt-0">
							<span class="block text-sm text-gray-400">Experiencia</span>
							<span class="font-bold text-brand-gold">{agente.experiencia}</span>
						</div>
					</div>
				</div>
			</div>

			<!-- Propiedades Asignadas -->
			<div in:fade={{ duration: 1000, delay: 400 }}>
				<h2 class="text-3xl font-serif font-bold text-brand-black mb-8 border-l-4 border-brand-gold pl-4">Propiedades de este Agente</h2>
				
				{#if propiedadesAsignadas.length > 0}
					<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
						{#each propiedadesAsignadas as inmueble}
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
									<h4 class="font-serif text-xl font-bold text-brand-black mb-2 line-clamp-2">{inmueble.tituloPropiedad || 'Propiedad'}</h4>
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
				{:else}
					<div class="text-center py-12 bg-gray-50 rounded-xl border border-gray-100">
						<i class="fa-solid fa-house-crack text-4xl text-gray-300 mb-4"></i>
						<p class="text-gray-500">Este agente aún no tiene propiedades exclusivas asignadas.</p>
					</div>
				{/if}
			</div>
		</div>
	</div>
{:else if isLoaded}
	<div class="min-h-screen flex items-center justify-center bg-brand-white">
		<div class="text-center">
			<h2 class="text-3xl font-serif font-bold text-brand-black mb-4">Agente no encontrado</h2>
			<a href="/agentes" class="text-brand-gold hover:underline">Volver al catálogo</a>
		</div>
	</div>
{:else}
	<div class="min-h-screen flex items-center justify-center bg-brand-white">
		<div class="w-16 h-16 border-4 border-gray-200 border-t-brand-gold rounded-full animate-spin"></div>
	</div>
{/if}

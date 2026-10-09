<script>
	import { onMount } from 'svelte';
	import { fade, fly } from 'svelte/transition';

	let isLoaded = $state(false);

	onMount(() => {
		isLoaded = true;
	});
</script>

<svelte:head>
	<title>Casa Legal Inmobiliaria | Oficinas</title>
</svelte:head>

<section class="min-h-screen bg-brand-white pt-24 pb-12">
	<!-- Header -->
	<div class="container mx-auto px-4 lg:px-8 mb-16 text-center">
		{#if isLoaded}
			<h1 in:fly={{ y: -30, duration: 1000 }} class="text-4xl md:text-5xl font-serif font-bold text-brand-black mb-4">
				Nuestras <span class="text-brand-gold">Oficinas</span>
			</h1>
			<p in:fade={{ duration: 1000, delay: 300 }} class="text-gray-500 max-w-2xl mx-auto font-light">
				Visítanos en nuestras exclusivas locaciones, donde te brindaremos una atención personalizada y discreta en un ambiente de lujo.
			</p>
			<div class="w-24 h-[2px] bg-brand-gold mx-auto mt-8"></div>
		{/if}
	</div>

	<!-- Offices Grid -->
	<div class="container mx-auto px-4 lg:px-8">
		<div class="grid grid-cols-1 lg:grid-cols-3 gap-12">
			<!-- Office 1: El Alto -->
			<div class="flex flex-col bg-white rounded-xl overflow-hidden shadow-xl border border-gray-100">
				<div class="h-64">
					<img src="https://images.unsplash.com/photo-1497366216548-37526070297c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" alt="Sede El Alto" class="w-full h-full object-cover" />
				</div>
				<div class="p-8 flex flex-col flex-grow">
					<h3 class="text-2xl font-serif font-bold text-brand-black mb-2">Sede El Alto</h3>
					<div class="w-12 h-1 bg-brand-gold mb-6"></div>
					<ul class="space-y-4 text-gray-600 font-light text-sm mb-8 flex-grow">
						<li class="flex items-start gap-3">
							<i class="fa-solid fa-location-dot mt-1 text-brand-gold"></i>
							<span>Av. Satélite a unas cuadras de Derechos Reales, Nro. 2020, Edificio Torre CAUSAE 6to. Piso, Zona 12 de Octubre.</span>
						</li>
						<li class="flex items-center gap-3">
							<i class="fa-solid fa-phone text-brand-gold"></i>
							<span>+591 79607574</span>
						</li>
					</ul>
					<button class="w-full border border-brand-black text-brand-black hover:bg-brand-black hover:text-brand-gold px-6 py-2 uppercase tracking-widest text-xs font-bold transition-colors">Ver en Mapa</button>
				</div>
			</div>

			<!-- Office 2: La Paz -->
			<div class="flex flex-col bg-white rounded-xl overflow-hidden shadow-xl border border-gray-100">
				<div class="h-64">
					<img src="https://images.unsplash.com/photo-1577412647305-991150c7d163?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" alt="Sede La Paz" class="w-full h-full object-cover" />
				</div>
				<div class="p-8 flex flex-col flex-grow">
					<h3 class="text-2xl font-serif font-bold text-brand-black mb-2">Sede La Paz</h3>
					<div class="w-12 h-1 bg-brand-gold mb-6"></div>
					<ul class="space-y-4 text-gray-600 font-light text-sm mb-8 flex-grow">
						<li class="flex items-start gap-3">
							<i class="fa-solid fa-location-dot mt-1 text-brand-gold"></i>
							<span>Av. Federico Zuazo y Calle Reyes Ortiz Nro. 73, Edificio GUNDLACH Piso 10, Of. 1001.</span>
						</li>
						<li class="flex items-center gap-3">
							<i class="fa-solid fa-phone text-brand-gold"></i>
							<span>+591 76763793</span>
						</li>
					</ul>
					<button class="w-full border border-brand-black text-brand-black hover:bg-brand-black hover:text-brand-gold px-6 py-2 uppercase tracking-widest text-xs font-bold transition-colors">Ver en Mapa</button>
				</div>
			</div>
            
            <!-- Office 3: Miraflores -->
			<div class="flex flex-col bg-white rounded-xl overflow-hidden shadow-xl border border-gray-100">
				<div class="h-64">
					<img src="https://images.unsplash.com/photo-1497215728101-856f4ea42174?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" alt="Sede Miraflores" class="w-full h-full object-cover" />
				</div>
				<div class="p-8 flex flex-col flex-grow">
					<h3 class="text-2xl font-serif font-bold text-brand-black mb-2">Sede Miraflores</h3>
					<div class="w-12 h-1 bg-brand-gold mb-6"></div>
					<ul class="space-y-4 text-gray-600 font-light text-sm mb-8 flex-grow">
						<li class="flex items-start gap-3">
							<i class="fa-solid fa-location-dot mt-1 text-brand-gold"></i>
							<span>Calle Genaro Gamarra, entre Av. Busch y Calle Diaz Romero (a pasos de la Calle J. Cisneros).</span>
						</li>
						<li class="flex items-center gap-3">
							<i class="fa-solid fa-phone text-brand-gold"></i>
							<span>+591 78277770</span>
						</li>
					</ul>
					<button class="w-full border border-brand-black text-brand-black hover:bg-brand-black hover:text-brand-gold px-6 py-2 uppercase tracking-widest text-xs font-bold transition-colors">Ver en Mapa</button>
				</div>
			</div>
		</div>
	</div>
</section>

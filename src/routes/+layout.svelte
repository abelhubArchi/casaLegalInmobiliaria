<script>
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import logo from '$lib/assets/logoinmo.png';

	let { children } = $props();

	// Navigation items
	const navItems = [
		{ label: 'INICIO', href: '/' },
		{ label: 'AGENTES', href: '/agentes' },
		{ label: 'INMUEBLES', href: '/inmuebles' },
		{ label: 'OFICINAS', href: '/oficinas' },
		{ label: 'CONTACTOS', href: '/contactos' },
		{ label: 'QUIÉNES SOMOS', href: '/quienes-somos' }
	];

	let isMenuOpen = $state(false);
	function toggleMenu() {
		isMenuOpen = !isMenuOpen;
	}
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<title>Casa Legal Inmobiliaria | Lujo y Excelencia</title>
</svelte:head>

<div class="min-h-screen flex flex-col bg-brand-white">
	<!-- Navbar -->
	<header class="sticky top-0 z-50 bg-brand-black text-brand-white border-b border-brand-gold/30 shadow-2xl">
		<div class="container mx-auto px-4 lg:px-8">
			<div class="flex items-center justify-between h-20">
				<!-- Logo -->
				<a href="/" class="flex items-center gap-3 group">
					<img src={logo} alt="Casa Legal" class="h-10 w-auto group-hover:scale-105 transition-transform duration-500" />
					<div class="flex flex-col">
						<span class="font-serif text-xl font-bold tracking-wider text-brand-white group-hover:text-gold-gradient transition-colors">CASA LEGAL</span>
						<span class="text-[10px] tracking-[0.2em] text-brand-gold font-sans uppercase">Inmobiliaria</span>
					</div>
				</a>

				<!-- Desktop Nav -->
				<nav class="hidden md:flex items-center gap-8">
					{#each navItems as item}
						<a 
							href={item.href} 
							class="text-sm font-medium tracking-widest uppercase transition-all duration-300 hover:text-brand-gold hover:-translate-y-0.5 relative group"
						>
							{item.label}
							<span class="absolute -bottom-2 left-0 w-0 h-[2px] bg-brand-gold transition-all duration-300 group-hover:w-full"></span>
						</a>
					{/each}
				</nav>

				<!-- Mobile Menu Button -->
				<button class="md:hidden text-brand-white hover:text-brand-gold transition-colors" onclick={toggleMenu} aria-label="Menu">
					<i class={`fa-solid ${isMenuOpen ? 'fa-xmark' : 'fa-bars'} text-2xl`}></i>
				</button>
			</div>
		</div>

		<!-- Mobile Nav -->
		{#if isMenuOpen}
			<div class="md:hidden absolute top-20 left-0 w-full bg-brand-black border-b border-brand-gold/30 shadow-xl overflow-hidden transition-all">
				<nav class="flex flex-col px-4 py-6 gap-4">
					{#each navItems as item}
						<a 
							href={item.href} 
							class="text-lg font-serif tracking-wider text-brand-white hover:text-brand-gold transition-colors"
							onclick={() => isMenuOpen = false}
						>
							{item.label}
						</a>
					{/each}
				</nav>
			</div>
		{/if}
	</header>

	<!-- Main Content -->
	<main class="flex-grow">
		{@render children()}
	</main>

	<!-- Footer -->
	<footer class="bg-gradient-to-b from-brand-black to-brand-green-dark text-brand-white pt-16 pb-8 border-t-[3px] border-brand-gold">
		<div class="container mx-auto px-4 lg:px-8">
			<div class="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
				<div>
					<a href="/" class="flex items-center gap-3 mb-6 inline-block">
						<div class="flex flex-col">
							<span class="font-serif text-2xl font-bold tracking-wider text-brand-white">CASA LEGAL</span>
							<span class="text-xs tracking-[0.2em] text-brand-gold font-sans uppercase">Inmobiliaria</span>
						</div>
					</a>
					<p class="text-sm text-gray-400 font-light leading-relaxed">
						La excelencia en bienes raíces. Encuentra la propiedad de tus sueños con la asesoría de los mejores profesionales del mercado.
					</p>
				</div>
				<div>
					<h3 class="font-serif text-lg font-semibold tracking-wider text-brand-gold mb-6 uppercase">Enlaces Rápidos</h3>
					<ul class="space-y-3">
						{#each navItems as item}
							<li>
								<a href={item.href} class="text-sm text-gray-400 hover:text-brand-gold transition-colors flex items-center gap-2">
									<i class="fa-solid fa-chevron-right text-[10px]"></i>
									{item.label}
								</a>
							</li>
						{/each}
					</ul>
				</div>
				<div>
					<h3 class="font-serif text-lg font-semibold tracking-wider text-brand-gold mb-6 uppercase">Contacto</h3>
					<ul class="space-y-4 text-sm text-gray-400">
						<li class="flex items-start gap-3">
							<i class="fa-solid fa-location-dot mt-1 text-brand-gold"></i>
							<span>Av. Federico Zuazo y Calle Reyes Ortiz<br />Nro. 73, Edificio GUNDLACH, Piso 10, Of. 1001.</span>
						</li>
						<li class="flex items-center gap-3">
							<i class="fa-solid fa-phone text-brand-gold"></i>
							<span>+591 79607574</span>
						</li>
						<li class="flex items-center gap-3">
							<i class="fa-solid fa-envelope text-brand-gold"></i>
							<span>contacto@casalegal.com</span>
						</li>
					</ul>
					<div class="flex gap-4 mt-6">
						<a href="#" class="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-brand-white hover:bg-brand-gold hover:text-brand-black transition-all duration-300">
							<i class="fa-brands fa-facebook-f"></i>
						</a>
						<a href="#" class="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-brand-white hover:bg-brand-gold hover:text-brand-black transition-all duration-300">
							<i class="fa-brands fa-instagram"></i>
						</a>
						<a href="#" class="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-brand-white hover:bg-brand-gold hover:text-brand-black transition-all duration-300">
							<i class="fa-brands fa-whatsapp"></i>
						</a>
					</div>
				</div>
			</div>
			<div class="border-t border-white/10 pt-8 text-center text-xs text-gray-500 flex flex-col md:flex-row justify-between items-center">
				<p>&copy; {new Date().getFullYear()} Casa Legal Inmobiliaria. Todos los derechos reservados.</p>
				<p class="mt-2 md:mt-0">Diseñado con excelencia.</p>
			</div>
		</div>
	</footer>
</div>

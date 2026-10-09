<script>
	import { onMount } from 'svelte';
	import { fade, fly } from 'svelte/transition';

	let isLoaded = $state(false);

	onMount(() => {
		isLoaded = true;
	});
</script>

<svelte:head>
	<title>Casa Legal Inmobiliaria | Contactos</title>
</svelte:head>

<section class="min-h-screen bg-brand-white pt-24 pb-12 flex items-center">
	<div class="container mx-auto px-4 lg:px-8">
		<div class="flex flex-col lg:flex-row gap-12 bg-white rounded-2xl overflow-hidden shadow-2xl border border-gray-100">
			<!-- Contact Info -->
			<div class="lg:w-1/3 bg-brand-black text-brand-white p-12 relative overflow-hidden">
				<div class="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 rounded-full bg-brand-gold/10"></div>
				<div class="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 rounded-full bg-brand-green-light/10"></div>
				
				<div class="relative z-10 h-full flex flex-col">
					<h2 class="text-3xl font-serif font-bold mb-2">Ponte en Contacto</h2>
					<p class="text-gray-400 font-light mb-12">Estamos aquí para asesorarte en tu próxima gran inversión.</p>
					
					<div class="space-y-8 flex-grow">
						<div class="flex items-start gap-4">
							<div class="w-12 h-12 rounded-full border border-brand-gold/30 flex items-center justify-center flex-shrink-0 text-brand-gold">
								<i class="fa-solid fa-location-dot"></i>
							</div>
							<div>
								<h4 class="font-bold mb-1">Dirección</h4>
								<p class="text-sm text-gray-400 font-light">Av. Federico Zuazo y Calle Reyes Ortiz<br/>Nro. 73, Edificio GUNDLACH, Piso 10, Of. 1001.</p>
							</div>
						</div>
						
						<div class="flex items-start gap-4">
							<div class="w-12 h-12 rounded-full border border-brand-gold/30 flex items-center justify-center flex-shrink-0 text-brand-gold">
								<i class="fa-solid fa-phone"></i>
							</div>
							<div>
								<h4 class="font-bold mb-1">Líneas Directas</h4>
								<p class="text-sm text-gray-400 font-light">+591 79607574<br/>+591 76763793<br/>+591 78277770</p>
							</div>
						</div>
						
						<div class="flex items-start gap-4">
							<div class="w-12 h-12 rounded-full border border-brand-gold/30 flex items-center justify-center flex-shrink-0 text-brand-gold">
								<i class="fa-solid fa-envelope"></i>
							</div>
							<div>
								<h4 class="font-bold mb-1">Email</h4>
								<p class="text-sm text-gray-400 font-light">contacto@casalegal.com<br/>ventas@casalegal.com</p>
							</div>
						</div>
					</div>
					
					<div class="flex gap-4 mt-12 pt-8 border-t border-white/10">
						<a href="#" class="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-brand-gold hover:text-brand-black transition-colors"><i class="fa-brands fa-facebook-f"></i></a>
						<a href="#" class="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-brand-gold hover:text-brand-black transition-colors"><i class="fa-brands fa-instagram"></i></a>
						<a href="#" class="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-brand-gold hover:text-brand-black transition-colors"><i class="fa-brands fa-whatsapp"></i></a>
					</div>
				</div>
			</div>
			
			<!-- Contact Form -->
			<div class="lg:w-2/3 p-12">
				{#if isLoaded}
					<h3 in:fly={{ y: -20, duration: 800 }} class="text-2xl font-serif font-bold text-brand-black mb-8">Envíanos un Mensaje</h3>
					<form onsubmit={(e) => e.preventDefault()} class="space-y-6">
						<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
							<div>
								<label class="block text-sm font-bold text-gray-700 mb-2">Nombre Completo</label>
								<input type="text" class="w-full border-b border-gray-300 py-2 focus:border-brand-gold outline-none transition-colors" placeholder="Tu nombre" />
							</div>
							<div>
								<label class="block text-sm font-bold text-gray-700 mb-2">Teléfono</label>
								<input type="tel" class="w-full border-b border-gray-300 py-2 focus:border-brand-gold outline-none transition-colors" placeholder="Tu número" />
							</div>
						</div>
						<div>
							<label class="block text-sm font-bold text-gray-700 mb-2">Correo Electrónico</label>
							<input type="email" class="w-full border-b border-gray-300 py-2 focus:border-brand-gold outline-none transition-colors" placeholder="tu@email.com" />
						</div>
						<div>
							<label class="block text-sm font-bold text-gray-700 mb-2">Asunto</label>
							<select class="w-full border-b border-gray-300 py-2 focus:border-brand-gold outline-none transition-colors bg-white">
								<option>Deseo comprar una propiedad</option>
								<option>Deseo vender una propiedad</option>
								<option>Consulta legal</option>
								<option>Otro</option>
							</select>
						</div>
						<div>
							<label class="block text-sm font-bold text-gray-700 mb-2">Mensaje</label>
							<textarea rows="4" class="w-full border-b border-gray-300 py-2 focus:border-brand-gold outline-none transition-colors resize-none" placeholder="¿En qué podemos ayudarte?"></textarea>
						</div>
						<button type="submit" class="bg-brand-black text-brand-gold font-bold uppercase tracking-widest py-4 px-10 hover:bg-brand-gold hover:text-brand-black transition-colors duration-300">
							Enviar Mensaje
						</button>
					</form>
				{/if}
			</div>
		</div>
	</div>
</section>

<script>
	import { onMount } from "svelte";
	import { fade, fly } from "svelte/transition";

	let isLoaded = $state(false);

	onMount(() => {
		isLoaded = true;
	});
</script>

<svelte:head>
	<title>Casa Legal Inmobiliaria | Quiénes Somos</title>
</svelte:head>

<!-- Hero About -->
<section
	class="relative py-32 bg-brand-black flex items-center overflow-hidden"
>
	<div class="absolute inset-0 opacity-20">
		<img
			src="https://images.unsplash.com/photo-1556910103-1c02745a872f?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80"
			alt="Team"
			class="w-full h-full object-cover grayscale"
		/>
	</div>
	<div class="container mx-auto px-4 lg:px-8 relative z-10 text-center">
		{#if isLoaded}
			<h1
				in:fly={{ y: -30, duration: 1000 }}
				class="text-4xl md:text-6xl font-serif font-bold text-brand-white mb-6"
			>
				Nuestra <span class="text-brand-gold">Historia</span>
			</h1>
			<p
				in:fade={{ duration: 1000, delay: 300 }}
				class="text-xl text-gray-300 font-light max-w-3xl mx-auto"
			>
				Más que una agencia, somos tus aliados estratégicos en el mundo
				inmobiliario. Garantizando excelencia y seguridad legal en cada
				paso.
			</p>
		{/if}
	</div>
</section>

<!-- Content -->
<section class="py-20 bg-brand-white">
	<div class="container mx-auto px-4 lg:px-8">
		<div class="flex flex-col lg:flex-row items-center gap-16">
			<div class="lg:w-1/2 relative">
				<div
					class="absolute -top-4 -left-4 w-24 h-24 border-t-4 border-l-4 border-brand-gold"
				></div>
				<div
					class="absolute -bottom-4 -right-4 w-24 h-24 border-b-4 border-r-4 border-brand-gold"
				></div>
				<img
					src="https://firebasestorage.googleapis.com/v0/b/casa-legal-inmobiliaria.firebasestorage.app/o/WhatsApp%20Image%202026-10-09%20at%202.56.29%20PM.jpeg?alt=media&token=0901979b-6c45-4226-afed-425bec260586"
					alt="Casa Legal Office"
					class="relative z-10 w-full h-auto shadow-2xl"
				/>
			</div>

			<div class="lg:w-1/2">
				<h2
					class="text-xs font-sans tracking-[0.3em] text-brand-gold uppercase mb-4"
				>
					Sobre Nosotros
				</h2>
				<h3 class="text-3xl font-serif font-bold text-brand-black mb-6">
					Nuestra Historia
				</h3>
				<p class="text-gray-600 font-light leading-relaxed mb-4">
					Casa Legal Inmobiliaria nace de una evolución natural ante
					las necesidades del mercado boliviano. Nuestros orígenes se
					consolidaron como una firma jurídica especializada, donde
					comprendimos a profundidad que la seguridad jurídica es el
					pilar más importante en cualquier transacción de bienes
					raíces.
				</p>
				<p class="text-gray-600 font-light leading-relaxed mb-4">
					Con el pasar del tiempo, detectamos una creciente demanda:
					los clientes no solo buscaban comprar o vender una
					propiedad, sino también agilizar y sanear todo el respaldo
					documental de manera rápida, segura y sin contratiempos.
				</p>
				<p class="text-gray-600 font-light leading-relaxed mb-8">
					Fue así como integramos la experiencia legal con el sector
					inmobiliario, transformándonos en Casa Legal Inmobiliaria.
					Hoy combinamos ambos mundos para ofrecerte un servicio
					integral único: cerramos operaciones exitosas mientras
					garantizamos que cada documento esté en absoluto orden
					legal, dándote la tranquilidad que tú y tu patrimonio
					merecen.
				</p>

				<div class="grid grid-cols-1 sm:grid-cols-2 gap-8">
					<div>
						<h4
							class="font-bold text-brand-black text-2xl font-serif mb-2 text-brand-gold"
						>
							Misión
						</h4>
						<p class="text-sm text-gray-500 font-light">
							Brindar un servicio inmobiliario integral y de
							excelencia en Bolivia, fusionando la gestión de
							compra, venta y alquiler con un riguroso respaldo
							legal. Nos comprometemos a blindar jurídicamente
							cada operación y agilizar los trámites documentales
							de nuestros clientes, garantizando transacciones
							transparentes, rápidas y totalmente seguras.
						</p>
					</div>
					<div>
						<h4
							class="font-bold text-brand-black text-2xl font-serif mb-2 text-brand-gold"
						>
							Visión
						</h4>
						<p class="text-sm text-gray-500 font-light">
							Consolidarnos como la firma inmobiliaria y jurídica
							líder a nivel nacional, reconocida por nuestra
							innovación, eficiencia y la absoluta confianza que
							brindamos en la resolución de trámites
							patrimoniales. Aspiramos a transformar la
							experiencia del sector inmobiliario en Bolivia,
							ofreciendo soluciones modernas que garanticen la
							seguridad jurídica y el crecimiento patrimonial de
							las familias.
						</p>
					</div>
				</div>
			</div>
		</div>
	</div>
</section>

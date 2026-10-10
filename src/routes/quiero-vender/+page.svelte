<script>
	import { addDoc, collection } from 'firebase/firestore';
	import { db } from '$lib/firebase/client';
	import { fade, fly } from 'svelte/transition';

	let isSubmitting = $state(false);
	let isSuccess = $state(false);

	let formData = $state({
		nombre: '',
		telefono: '',
		email: '',
		tipoOperacion: 'Vender',
		tipoInmueble: 'Casa',
		ciudad: 'Santa Cruz',
		direccion: '',
		precioEsperado: '',
		descripcion: ''
	});

	async function handleSubmit(e) {
		e.preventDefault();
		isSubmitting = true;

		try {
			await addDoc(collection(db, 'captaciones_propiedades'), {
				...formData,
				fecha: new Date().toISOString(),
				estado: 'Nuevo Lead'
			});
			isSuccess = true;
			// Reset form
			formData = {
				nombre: '',
				telefono: '',
				email: '',
				tipoOperacion: 'Vender',
				tipoInmueble: 'Casa',
				ciudad: 'Santa Cruz',
				direccion: '',
				precioEsperado: '',
				descripcion: ''
			};
			setTimeout(() => { isSuccess = false; }, 5000);
		} catch (error) {
			console.error("Error capturando propiedad:", error);
			alert("Ocurrió un error al enviar tu solicitud. Por favor intenta de nuevo.");
		} finally {
			isSubmitting = false;
		}
	}
</script>

<svelte:head>
	<title>Quiero Vender o Alquilar | Casa Legal</title>
</svelte:head>

<section class="min-h-screen bg-brand-white pt-24 pb-16">
	<!-- Hero Header -->
	<div class="bg-brand-black text-white py-20 relative overflow-hidden mb-16">
		<div class="absolute inset-0 bg-brand-green/20"></div>
		<div class="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-gold/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/3"></div>
		
		<div class="container mx-auto px-4 lg:px-8 relative z-10 text-center" in:fly={{ y: -20, duration: 800 }}>
			<span class="text-brand-gold uppercase tracking-widest text-xs font-bold mb-4 block">Déjalo en manos de expertos</span>
			<h1 class="text-4xl md:text-6xl font-serif font-bold mb-6">Vende o Alquila tu Propiedad</h1>
			<p class="text-gray-300 max-w-2xl mx-auto font-light text-lg">
				Obtén el máximo rendimiento de tu patrimonio. Nuestro equipo se encarga del marketing, la seguridad legal y la venta rápida de tu inmueble.
			</p>
		</div>
	</div>

	<div class="container mx-auto px-4 lg:px-8">
		<div class="flex flex-col lg:flex-row gap-16">
			
			<!-- Information / Sales Pitch -->
			<div class="lg:w-1/3" in:fly={{ x: -20, duration: 800, delay: 200 }}>
				<h3 class="text-3xl font-serif font-bold text-brand-black mb-8">¿Por qué confiar en nosotros?</h3>
				
				<div class="space-y-8">
					<div class="flex gap-4">
						<div class="w-12 h-12 rounded-full bg-brand-gold/10 flex items-center justify-center flex-shrink-0 text-brand-gold">
							<i class="fa-solid fa-scale-balanced text-xl"></i>
						</div>
						<div>
							<h4 class="font-bold text-brand-black mb-2">Auditoría Legal Gratuita</h4>
							<p class="text-sm text-gray-500 font-light">Saneamos los papeles de tu propiedad antes de salir al mercado para garantizar una venta ágil.</p>
						</div>
					</div>
					
					<div class="flex gap-4">
						<div class="w-12 h-12 rounded-full bg-brand-gold/10 flex items-center justify-center flex-shrink-0 text-brand-gold">
							<i class="fa-solid fa-camera text-xl"></i>
						</div>
						<div>
							<h4 class="font-bold text-brand-black mb-2">Marketing de Alto Impacto</h4>
							<p class="text-sm text-gray-500 font-light">Fotografía profesional, tours virtuales y exposición máxima en redes y portales inmobiliarios.</p>
						</div>
					</div>
					
					<div class="flex gap-4">
						<div class="w-12 h-12 rounded-full bg-brand-gold/10 flex items-center justify-center flex-shrink-0 text-brand-gold">
							<i class="fa-solid fa-handshake text-xl"></i>
						</div>
						<div>
							<h4 class="font-bold text-brand-black mb-2">Asesoría Integral</h4>
							<p class="text-sm text-gray-500 font-light">Te acompañamos desde la valorización comercial hasta la firma final en notaría.</p>
						</div>
					</div>
				</div>
			</div>

			<!-- The Form -->
			<div class="lg:w-2/3" in:fly={{ y: 20, duration: 800, delay: 400 }}>
				<div class="bg-white rounded-2xl shadow-xl p-8 lg:p-12 border border-gray-100 relative overflow-hidden">
					<div class="absolute top-0 right-0 w-32 h-32 bg-brand-green/5 rounded-bl-full pointer-events-none"></div>
					
					<h3 class="text-2xl font-serif font-bold text-brand-black mb-8">Ingresa los datos del inmueble</h3>
					
					{#if isSuccess}
						<div class="bg-green-50 border border-green-200 text-green-700 p-6 rounded-lg mb-8" in:fade>
							<div class="flex items-center gap-3 mb-2">
								<i class="fa-solid fa-circle-check text-xl"></i>
								<h4 class="font-bold">¡Solicitud Enviada!</h4>
							</div>
							<p class="font-light text-sm">Un agente captador de Casa Legal se pondrá en contacto contigo en las próximas 24 horas.</p>
						</div>
					{/if}

					<form onsubmit={handleSubmit} class="space-y-6 relative z-10">
						<!-- Personal Info -->
						<h4 class="text-brand-gold uppercase tracking-widest text-xs font-bold border-b border-gray-100 pb-2">Tus Datos</h4>
						<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
							<div>
								<label class="block text-sm font-bold text-gray-700 mb-2">Nombre Completo *</label>
								<input type="text" bind:value={formData.nombre} required class="w-full border border-gray-200 rounded-sm py-3 px-4 focus:border-brand-gold outline-none transition-colors" placeholder="Ej. Juan Pérez" />
							</div>
							<div>
								<label class="block text-sm font-bold text-gray-700 mb-2">Celular *</label>
								<input type="tel" bind:value={formData.telefono} required class="w-full border border-gray-200 rounded-sm py-3 px-4 focus:border-brand-gold outline-none transition-colors" placeholder="+591 7XXXXXXX" />
							</div>
						</div>
						
						<!-- Property Details -->
						<h4 class="text-brand-gold uppercase tracking-widest text-xs font-bold border-b border-gray-100 pb-2 mt-8">Detalles de la Propiedad</h4>
						<div class="grid grid-cols-1 md:grid-cols-3 gap-6">
							<div>
								<label class="block text-sm font-bold text-gray-700 mb-2">¿Qué deseas hacer?</label>
								<select bind:value={formData.tipoOperacion} class="w-full border border-gray-200 rounded-sm py-3 px-4 focus:border-brand-gold outline-none transition-colors bg-white">
									<option>Vender</option>
									<option>Alquilar</option>
									<option>Anticrético</option>
								</select>
							</div>
							<div>
								<label class="block text-sm font-bold text-gray-700 mb-2">Tipo de Inmueble</label>
								<select bind:value={formData.tipoInmueble} class="w-full border border-gray-200 rounded-sm py-3 px-4 focus:border-brand-gold outline-none transition-colors bg-white">
									<option>Casa</option>
									<option>Departamento</option>
									<option>Terreno</option>
									<option>Oficina</option>
									<option>Local Comercial</option>
								</select>
							</div>
							<div>
								<label class="block text-sm font-bold text-gray-700 mb-2">Ciudad</label>
								<select bind:value={formData.ciudad} class="w-full border border-gray-200 rounded-sm py-3 px-4 focus:border-brand-gold outline-none transition-colors bg-white">
									<option>Santa Cruz</option>
									<option>La Paz</option>
									<option>El Alto</option>
									<option>Cochabamba</option>
								</select>
							</div>
						</div>

						<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
							<div>
								<label class="block text-sm font-bold text-gray-700 mb-2">Dirección o Zona *</label>
								<input type="text" bind:value={formData.direccion} required class="w-full border border-gray-200 rounded-sm py-3 px-4 focus:border-brand-gold outline-none transition-colors" placeholder="Zona, Barrio o Avenida" />
							</div>
							<div>
								<label class="block text-sm font-bold text-gray-700 mb-2">Precio Esperado (opcional)</label>
								<input type="text" bind:value={formData.precioEsperado} class="w-full border border-gray-200 rounded-sm py-3 px-4 focus:border-brand-gold outline-none transition-colors" placeholder="Ej. $us 150,000" />
							</div>
						</div>

						<div>
							<label class="block text-sm font-bold text-gray-700 mb-2">Breve descripción del inmueble</label>
							<textarea bind:value={formData.descripcion} rows="3" class="w-full border border-gray-200 rounded-sm py-3 px-4 focus:border-brand-gold outline-none transition-colors resize-none" placeholder="Cuéntanos un poco sobre tu propiedad (ej. 3 dormitorios, piscina, estado de conservación)"></textarea>
						</div>

						<button type="submit" disabled={isSubmitting} class="w-full bg-brand-black text-brand-gold font-bold uppercase tracking-widest py-4 rounded-sm hover:bg-brand-gold hover:text-brand-black transition-all duration-300 disabled:opacity-50 mt-4 flex items-center justify-center gap-3">
							{#if isSubmitting}
								<i class="fa-solid fa-spinner fa-spin"></i> Enviando...
							{:else}
								Enviar Solicitud <i class="fa-solid fa-arrow-right"></i>
							{/if}
						</button>
					</form>
				</div>
			</div>
			
		</div>
	</div>
</section>

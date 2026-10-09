<script>
	import { onMount } from 'svelte';
	import { fade, fly } from 'svelte/transition';
	import { collection, getDocs, query, where } from 'firebase/firestore';
	import { db } from '$lib/firebase/client.js';
	import logoImg from '$lib/assets/logoinmo.png';

	let isLoaded = $state(false);
	let agentes = $state([]);

	onMount(async () => {
		try {
			// 1. Fetch marketing data
			const marketingSnapshot = await getDocs(collection(db, 'marketing_agentes'));
			let marketingData = {};
			marketingSnapshot.forEach((doc) => {
				marketingData[doc.id] = doc.data();
			});

			// 2. Fetch users
			const q = query(collection(db, 'usuarios'));
			const querySnapshot = await getDocs(q);
			let fetchedAgentes = [];
			querySnapshot.forEach((doc) => {
				const user = doc.data();
				// Hacer el rol insensible a mayúsculas
				const rol = (user.rol || '').toUpperCase();
				if (rol === 'AGENTE' || rol === 'ADMIN' || rol === 'ASESOR') {
					const mkt = marketingData[doc.id] || {}; // matching by uid/doc.id
					fetchedAgentes.push({
						id: doc.id,
						nombres: user.nombres || '',
						apellidos: user.apellidos || '',
						rol: user.rol,
						email: user.email || '',
						telefono: user.telefono || '',
						// Marketing fields
						foto: mkt.agenteFoto || mkt.fondoUrl || '',
						facebook: mkt.facebook || '',
						instagram: mkt.instagram || '',
						tiktok: mkt.tiktok || '',
						whatsapp: mkt.whatsapp || user.telefono || ''
					});
				}
			});
			agentes = fetchedAgentes;
		} catch (error) {
			console.error("Error fetching agentes:", error);
		}
		
		isLoaded = true;
	});

	// Form variables
	let formObj = $state({
		nombre: '', email: '', telefono: '', fechaNacimiento: '', genero: '', direccion: '',
		trabajoActual: '', nivelIngresos: '', emprendedor: 'No', comoNosConocio: ''
	});

	function handleSubmit() {
		console.log("Formulario enviado:", formObj);
		alert("Gracias por postularte. Nos pondremos en contacto contigo pronto.");
		// Here it could be sent to Firestore
	}
</script>

<svelte:head>
	<title>Casa Legal Inmobiliaria | Agentes</title>
</svelte:head>

<section class="bg-brand-white pt-24 pb-12">
	<!-- Header -->
	<div class="container mx-auto px-4 lg:px-8 mb-16 text-center relative">
		{#if isLoaded}
			<h1 in:fly={{ y: -30, duration: 1000 }} class="text-4xl md:text-5xl font-serif font-bold text-brand-black mb-4">
				Nuestros <span class="text-brand-green">Agentes</span>
			</h1>
			<p in:fade={{ duration: 1000, delay: 300 }} class="text-gray-500 max-w-2xl mx-auto font-light mb-8">
				Conoce al equipo de profesionales expertos en bienes raíces. Dedicación, experiencia y excelencia a tu servicio.
			</p>
			
			<div in:fade={{ duration: 1000, delay: 500 }}>
				<button onclick={() => document.getElementById('unete-equipo').scrollIntoView({ behavior: 'smooth' })} class="bg-brand-green hover:bg-brand-green-light text-brand-white font-bold uppercase tracking-widest py-3 px-8 rounded transition-colors shadow-lg">
					¡Únete a nuestro equipo!
				</button>
			</div>
			
			<div class="w-24 h-[2px] bg-brand-gold mx-auto mt-12"></div>
		{/if}
	</div>

	<!-- Agents Grid -->
	<div class="container mx-auto px-4 lg:px-8 mb-24">
		{#if agentes.length > 0}
			<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
				{#each agentes as agente (agente.id)}
					<a href={`/agentes/${agente.id}`} class="block group relative overflow-hidden bg-brand-green-dark rounded-lg border border-gray-200 shadow-lg cursor-pointer h-[400px]">
						<!-- Image or Logo -->
						{#if agente.foto}
							<img src={agente.foto} alt={`${agente.nombres} ${agente.apellidos}`} class="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500" />
						{:else}
							<div class="w-full h-full bg-brand-green-dark flex items-center justify-center relative overflow-hidden group-hover:scale-105 transition-transform duration-700">
								<!-- Animated background effect -->
								<div class="absolute inset-0 bg-gradient-to-tr from-brand-black/40 via-brand-gold/10 to-transparent"></div>
								<div class="absolute -inset-10 bg-brand-green/20 blur-2xl animate-[spin_10s_linear_infinite] origin-center"></div>
								<img src={logoImg} alt="Casa Legal" class="w-2/3 object-contain relative z-10 opacity-50 drop-shadow-lg" />
							</div>
						{/if}
						
						<!-- Overlay content -->
						<div class="absolute inset-0 bg-gradient-to-t from-brand-green-dark/90 via-brand-green-dark/40 to-transparent flex flex-col justify-end p-6 translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
							<h3 class="text-xl font-serif font-bold text-brand-gold mb-1">{agente.nombres} {agente.apellidos}</h3>
							<p class="text-brand-white text-sm font-light mb-4">Ver perfil del agente <i class="fa-solid fa-arrow-right ml-1"></i></p>
							
							<!-- Social & Contact Links -->
							<div class="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100 relative z-10" onclick={(e) => e.stopPropagation()}>
								{#if agente.telefono}
									<a href={`tel:${agente.telefono}`} class="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-brand-white hover:bg-brand-gold hover:text-brand-green-dark transition-colors" title="Llamar">
										<i class="fa-solid fa-phone text-xs"></i>
									</a>
								{/if}
								{#if agente.whatsapp}
									<a href={`https://wa.me/${agente.whatsapp.replace(/\+/g, '')}`} target="_blank" class="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-brand-white hover:bg-brand-gold hover:text-brand-green-dark transition-colors" title="WhatsApp">
										<i class="fa-brands fa-whatsapp text-xs"></i>
									</a>
								{/if}
								{#if agente.email}
									<a href={`mailto:${agente.email}`} class="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-brand-white hover:bg-brand-gold hover:text-brand-green-dark transition-colors" title="Email">
										<i class="fa-solid fa-envelope text-xs"></i>
									</a>
								{/if}
							</div>
						</div>
					</a>
				{/each}
			</div>
		{:else if isLoaded}
			<p class="text-center text-gray-500 py-12">No se encontraron agentes registrados.</p>
		{:else}
			<div class="flex justify-center items-center py-20">
				<div class="w-10 h-10 border-4 border-brand-green border-t-transparent rounded-full animate-spin"></div>
			</div>
		{/if}
	</div>
</section>

<!-- Join Our Team Section -->
<section id="unete-equipo" class="bg-brand-green-dark text-brand-white py-24 relative overflow-hidden">
	<div class="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/black-scales.png')]"></div>
	
	<div class="container mx-auto px-4 lg:px-8 relative z-10">
		<div class="text-center mb-16">
			<h2 class="text-3xl md:text-5xl font-serif font-bold mb-6 text-brand-gold">
				ÚNETE A NUESTRO EQUIPO
			</h2>
			<p class="text-gray-300 max-w-3xl mx-auto font-light leading-relaxed mb-4">
				El Agente Asociado CASA LEGAL va mucho más allá de un agente inmobiliario convencional, ya que recibe una formación profesional constante. Además, de contar con normas y procedimientos que respaldan sus operaciones comerciales y legales.
			</p>
			<p class="text-gray-300 max-w-3xl mx-auto font-light leading-relaxed mb-4">
				Nuestros agentes desarrollan su actividad con el prestigio de nuestra marca, con la ventaja de recibir las comisiones más altas del sector. Forma parte de una red que permite compartir inmuebles y clientes, dándote mayor alcance. Todo con total autonomía.
			</p>
		</div>

		<!-- Benefits Grid -->
		<div class="grid grid-cols-2 md:grid-cols-4 gap-8 mb-24 text-center">
			<div class="p-6 border border-brand-gold/30 rounded-xl hover:bg-brand-gold/10 transition-colors">
				<i class="fa-solid fa-award text-3xl text-brand-gold mb-4"></i>
				<h4 class="font-bold text-sm uppercase tracking-wider">Presencia de marca</h4>
			</div>
			<div class="p-6 border border-brand-gold/30 rounded-xl hover:bg-brand-gold/10 transition-colors">
				<i class="fa-solid fa-network-wired text-3xl text-brand-gold mb-4"></i>
				<h4 class="font-bold text-sm uppercase tracking-wider">Cultura corporativa y RED</h4>
			</div>
			<div class="p-6 border border-brand-gold/30 rounded-xl hover:bg-brand-gold/10 transition-colors">
				<i class="fa-solid fa-chalkboard-user text-3xl text-brand-gold mb-4"></i>
				<h4 class="font-bold text-sm uppercase tracking-wider">Entrenamiento</h4>
			</div>
			<div class="p-6 border border-brand-gold/30 rounded-xl hover:bg-brand-gold/10 transition-colors">
				<i class="fa-solid fa-bullhorn text-3xl text-brand-gold mb-4"></i>
				<h4 class="font-bold text-sm uppercase tracking-wider">Marketing Efectivo</h4>
			</div>
			<div class="p-6 border border-brand-gold/30 rounded-xl hover:bg-brand-gold/10 transition-colors">
				<i class="fa-solid fa-laptop-code text-3xl text-brand-gold mb-4"></i>
				<h4 class="font-bold text-sm uppercase tracking-wider">Tecnología</h4>
			</div>
			<div class="p-6 border border-brand-gold/30 rounded-xl hover:bg-brand-gold/10 transition-colors">
				<i class="fa-solid fa-brain text-3xl text-brand-gold mb-4"></i>
				<h4 class="font-bold text-sm uppercase tracking-wider">Compartir conocimiento</h4>
			</div>
			<div class="p-6 border border-brand-gold/30 rounded-xl hover:bg-brand-gold/10 transition-colors">
				<i class="fa-solid fa-handshake-angle text-3xl text-brand-gold mb-4"></i>
				<h4 class="font-bold text-sm uppercase tracking-wider">Colaboración</h4>
			</div>
			<div class="p-6 border border-brand-gold/30 rounded-xl hover:bg-brand-gold/10 transition-colors">
				<i class="fa-solid fa-scale-balanced text-3xl text-brand-gold mb-4"></i>
				<h4 class="font-bold text-sm uppercase tracking-wider">Respaldo Legal</h4>
			</div>
		</div>

		<!-- Application Form -->
		<div class="max-w-4xl mx-auto bg-brand-white text-brand-black rounded-2xl shadow-2xl overflow-hidden">
			<div class="bg-brand-gold text-brand-black py-6 px-8 text-center">
				<h3 class="text-2xl font-serif font-bold uppercase tracking-widest">Formulario de Registro</h3>
				<p class="text-sm">Completa el formulario y nos contactaremos contigo</p>
			</div>
			
			<form onsubmit={(e) => { e.preventDefault(); handleSubmit(); }} class="p-8 md:p-12 space-y-12">
				
				<!-- Personal Info -->
				<section>
					<h4 class="text-lg font-bold border-b border-gray-200 pb-2 mb-6 text-brand-black uppercase tracking-wider flex items-center gap-3">
						<i class="fa-regular fa-id-card text-brand-gold"></i> Información Personal
					</h4>
					<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
						<div>
							<label class="block text-sm font-semibold mb-2">Nombre completo *</label>
							<input type="text" required bind:value={formObj.nombre} placeholder="Ingrese su nombre completo" class="w-full border border-gray-300 rounded p-3 focus:border-brand-gold focus:ring-1 focus:ring-brand-gold outline-none transition-all" />
						</div>
						<div>
							<label class="block text-sm font-semibold mb-2">Email *</label>
							<input type="email" required bind:value={formObj.email} placeholder="ejemplo@correo.com" class="w-full border border-gray-300 rounded p-3 focus:border-brand-gold focus:ring-1 focus:ring-brand-gold outline-none transition-all" />
						</div>
						<div>
							<label class="block text-sm font-semibold mb-2">Teléfono *</label>
							<input type="tel" required bind:value={formObj.telefono} placeholder="+591 600 123 45" class="w-full border border-gray-300 rounded p-3 focus:border-brand-gold focus:ring-1 focus:ring-brand-gold outline-none transition-all" />
						</div>
						<div>
							<label class="block text-sm font-semibold mb-2">Fecha de nacimiento *</label>
							<input type="date" required bind:value={formObj.fechaNacimiento} class="w-full border border-gray-300 rounded p-3 focus:border-brand-gold focus:ring-1 focus:ring-brand-gold outline-none transition-all" />
						</div>
						<div>
							<label class="block text-sm font-semibold mb-2">Género *</label>
							<select required bind:value={formObj.genero} class="w-full border border-gray-300 rounded p-3 focus:border-brand-gold focus:ring-1 focus:ring-brand-gold outline-none transition-all">
								<option value="">Seleccione</option>
								<option value="Femenino">Femenino</option>
								<option value="Masculino">Masculino</option>
								<option value="Otro">Otro</option>
								<option value="Prefiero no decirlo">Prefiero no decirlo</option>
							</select>
						</div>
						<div>
							<label class="block text-sm font-semibold mb-2">Dirección actual *</label>
							<input type="text" required bind:value={formObj.direccion} placeholder="Ingrese su dirección" class="w-full border border-gray-300 rounded p-3 focus:border-brand-gold focus:ring-1 focus:ring-brand-gold outline-none transition-all" />
						</div>
					</div>
				</section>

				<!-- Professional Info -->
				<section>
					<h4 class="text-lg font-bold border-b border-gray-200 pb-2 mb-6 text-brand-black uppercase tracking-wider flex items-center gap-3">
						<i class="fa-solid fa-briefcase text-brand-gold"></i> Información Profesional
					</h4>
					<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
						<div>
							<label class="block text-sm font-semibold mb-2">Trabajo Actual *</label>
							<input type="text" required bind:value={formObj.trabajoActual} placeholder="Ingrese su trabajo actual" class="w-full border border-gray-300 rounded p-3 focus:border-brand-gold focus:ring-1 focus:ring-brand-gold outline-none transition-all" />
						</div>
						<div>
							<label class="block text-sm font-semibold mb-2">Nivel de ingresos *</label>
							<select required bind:value={formObj.nivelIngresos} class="w-full border border-gray-300 rounded p-3 focus:border-brand-gold focus:ring-1 focus:ring-brand-gold outline-none transition-all">
								<option value="">Seleccione rango</option>
								<option value="Básico">Básico</option>
								<option value="Medio">Medio</option>
								<option value="Alto">Alto</option>
							</select>
						</div>
						<div class="md:col-span-2">
							<label class="block text-sm font-semibold mb-2">¿Se considera emprendedor? *</label>
							<div class="flex gap-6">
								<label class="flex items-center gap-2 cursor-pointer">
									<input type="radio" name="emprendedor" value="Sí" bind:group={formObj.emprendedor} class="accent-brand-gold w-4 h-4" />
									<span>Sí</span>
								</label>
								<label class="flex items-center gap-2 cursor-pointer">
									<input type="radio" name="emprendedor" value="No" bind:group={formObj.emprendedor} class="accent-brand-gold w-4 h-4" />
									<span>No</span>
								</label>
							</div>
						</div>
					</div>
				</section>

				<!-- Additional Info -->
				<section>
					<h4 class="text-lg font-bold border-b border-gray-200 pb-2 mb-6 text-brand-black uppercase tracking-wider flex items-center gap-3">
						<i class="fa-solid fa-circle-info text-brand-gold"></i> Información Adicional
					</h4>
					<div>
						<label class="block text-sm font-semibold mb-2">¿Cómo nos conoció? *</label>
						<select required bind:value={formObj.comoNosConocio} class="w-full border border-gray-300 rounded p-3 focus:border-brand-gold focus:ring-1 focus:ring-brand-gold outline-none transition-all">
							<option value="">Seleccione una opción</option>
							<option value="Redes Sociales">Redes Sociales (Facebook, Instagram)</option>
							<option value="Recomendación">Recomendación de amigo/familiar</option>
							<option value="Publicidad">Publicidad en la calle</option>
							<option value="Búsqueda web">Búsqueda en Google</option>
							<option value="Otro">Otro</option>
						</select>
					</div>
				</section>

				<div class="text-center pt-8">
					<button type="submit" class="bg-brand-black text-brand-gold hover:bg-brand-gold hover:text-brand-black font-bold uppercase tracking-widest py-4 px-12 rounded transition-all duration-300 shadow-lg hover:shadow-xl">
						Enviar Solicitud
					</button>
				</div>
			</form>
		</div>
	</div>
</section>

<script>
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import { doc, getDoc, updateDoc, arrayUnion } from 'firebase/firestore';
	import { db } from '$lib/firebase/client';
	import { fade, fly, scale } from 'svelte/transition';
	import { Loader } from '@googlemaps/js-api-loader';
	import jsPDF from 'jspdf';
	import html2canvas from 'html2canvas';
	import logoImg from '$lib/assets/logoinmo.png';

	let inmueble = $state(null);
	let agente = $state(null);
	let isLoaded = $state(false);
	let activeImage = $state('');
	let isLightboxOpen = $state(false);
	let allImages = $state([]);

	// Contact Form variables
	let leadName = $state('');
	let leadPhone = $state('');
	let leadMessage = $state('Hola, me interesa esta propiedad y me gustaría agendar una visita.');
	
	let mapElement = $state();
	let pdfContainer = $state();
	let isGeneratingPdf = $state(false);

	onMount(async () => {
		try {
			const id = $page.params.id;
			const docRef = doc(db, 'inmuebles', id);
			const docSnap = await getDoc(docRef);
			
			if (docSnap.exists()) {
				inmueble = { id: docSnap.id, ...docSnap.data() };
				activeImage = inmueble.fotoPrincipal;
				
				allImages = [inmueble.fotoPrincipal];
				if (inmueble.fotosSecundarias && inmueble.fotosSecundarias.length > 0) {
					allImages = [...allImages, ...inmueble.fotosSecundarias];
				}

				// Increment vistas in DB (but won't render it in the UI)
				const currentVistas = inmueble.vistas || 0;
				try {
					await updateDoc(docRef, { vistas: currentVistas + 1 });
				} catch (e) { console.error("Could not update views", e) }

				// Fetch Agente Captador
				if (inmueble.agenteId) {
					const userDoc = await getDoc(doc(db, 'usuarios', inmueble.agenteId));
					const mktDoc = await getDoc(doc(db, 'marketing_agentes', inmueble.agenteId));
					
					if (userDoc.exists()) {
						const ud = userDoc.data();
						const md = mktDoc.exists() ? mktDoc.data() : {};
						
						// Override ADMIN to Agente
						let realRol = ud.rol || 'Agente';
						if (realRol.toUpperCase() === 'ADMIN') {
							realRol = 'Agente Inmobiliario';
						}

						agente = {
							id: inmueble.agenteId,
							nombre: `${ud.nombres} ${ud.apellidos}`,
							telefono: ud.telefono || md.whatsapp || '',
							foto: md.agenteFoto || md.fondoUrl || logoImg,
							whatsapp: md.whatsapp || ud.telefono || '',
							rol: realRol
						};
					}
				}

				// Initialize Google Map safely
				setTimeout(initMap, 500);
			}
		} catch (error) {
			console.error("Error al obtener inmueble:", error);
		}
		isLoaded = true;
	});

	function initMap() {
		if (!mapElement) return;

		window.initMapInstance = function() {
			try {
				const lat = parseFloat(inmueble.lat) || -16.5000;
				const lng = parseFloat(inmueble.lng) || -68.1193; // La Paz Default if missing
				
				const map = new window.google.maps.Map(mapElement, {
					center: { lat, lng },
					zoom: 15,
					disableDefaultUI: false,
					zoomControl: true,
				});
				
				const icon = {
					url: logoImg,
					scaledSize: new window.google.maps.Size(40, 40)
				};

				new window.google.maps.Marker({
					position: { lat, lng },
					map,
					title: inmueble.tituloPropiedad,
					icon: icon
				});
			} catch (e) {
				console.error("Error rendering map:", e);
			}
		};

		if (!window.google || !window.google.maps) {
			const script = document.createElement('script');
			script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyCYpYc1EuqePBuNwGlphfoHwmeWVTQRGS0&callback=initMapInstance`;
			script.async = true;
			script.defer = true;
			document.head.appendChild(script);
		} else {
			window.initMapInstance();
		}
	}

	async function getBase64Image(url) {
		if (!url) return '';
		try {
			// USAMOS NUESTRO PROPIO SERVIDOR COMO PROXY (Solución 100% definitiva para CORS)
			const res = await fetch(`/api/proxy-image?url=${encodeURIComponent(url)}`);
			if (!res.ok) throw new Error('Internal Proxy failed');
			const blob = await res.blob();
			return await new Promise((resolve) => {
				const reader = new FileReader();
				reader.onloadend = () => resolve(reader.result);
				reader.readAsDataURL(blob);
			});
		} catch (e) {
			console.error("Internal Proxy failed for image:", url, e);
			return logoImg; 
		}
	}

	async function enviarWhatsApp() {
		if (!leadName || !leadPhone) {
			alert("Por favor completa tu nombre y teléfono para poder contactarte.");
			return;
		}

		try {
			const docRef = doc(db, 'inmuebles', inmueble.id);
			const newLead = {
				nombreCliente: leadName,
				telefonoCliente: leadPhone,
				mensaje: leadMessage,
				fecha: new Date().toISOString(),
				origen: 'WhatsApp Widget'
			};

			await updateDoc(docRef, {
				leadsRegistrados: arrayUnion(newLead),
				leadsGenerados: (inmueble.leadsGenerados || 0) + 1
			});
		} catch (e) {
			console.error("Error saving lead:", e);
		}

		let num = (agente?.whatsapp || '+59179607574').replace(/\+/g, '').replace(/\s/g, '');
		let text = `Hola soy ${leadName}. Me interesa la propiedad: *${inmueble.tituloPropiedad}*.\nMi número es ${leadPhone}.\n\nMensaje: ${leadMessage}`;
		window.open(`https://wa.me/${num}?text=${encodeURIComponent(text)}`, '_blank');
	}

	async function generatePDF() {
		if (!pdfContainer) return;
		isGeneratingPdf = true;
		
		try {
			// PRELOAD ALL IMAGES AS BASE64 TO 100% BYPASS CORS ISSUES IN HTML2CANVAS
			const images = pdfContainer.querySelectorAll('img.pdf-image');
			for (let img of images) {
				const originalUrl = img.getAttribute('data-src');
				if (originalUrl && !img.src.startsWith('data:')) {
					img.src = await getBase64Image(originalUrl);
				}
			}

			// Render the container invisibly
			pdfContainer.style.display = 'block';
			
			// Small delay for DOM layout settling
			await new Promise(r => setTimeout(r, 600));
			
			const pages = pdfContainer.querySelectorAll('.pdf-page');
			const pdf = new jsPDF({
				orientation: 'portrait',
				unit: 'mm',
				format: 'a4'
			});

			for (let i = 0; i < pages.length; i++) {
				if (i > 0) pdf.addPage();
				
				const canvas = await html2canvas(pages[i], { 
					scale: 2, 
					useCORS: true, 
					backgroundColor: '#081c15',
					logging: false 
				});
				
				const imgData = canvas.toDataURL('image/jpeg', 1.0);
				const pdfWidth = pdf.internal.pageSize.getWidth();
				const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
				
				pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
			}
			
			pdf.save(`Ficha_Tecnica_${inmueble.tituloPropiedad.replace(/\s+/g, '_')}.pdf`);
		} catch (error) {
			console.error("Error generating PDF:", error);
			alert("Ocurrió un error al generar la ficha técnica. Asegúrate de tener buena conexión.");
		} finally {
			pdfContainer.style.display = 'none';
			isGeneratingPdf = false;
		}
	}

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
		activeImage = idx < allImages.length - 1 ? allImages[idx + 1] : allImages[0];
	}

	function prevImage() {
		const idx = allImages.indexOf(activeImage);
		activeImage = idx > 0 ? allImages[idx - 1] : allImages[allImages.length - 1];
	}
</script>

<svelte:head>
	<title>{inmueble ? inmueble.tituloPropiedad : 'Propiedad Exclusiva'} | Casa Legal</title>
</svelte:head>

{#if isLoaded && inmueble}
	<!-- Lightbox -->
	{#if isLightboxOpen}
		<div class="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center backdrop-blur-md" in:fade={{duration: 300}} out:fade={{duration: 300}}>
			<button class="absolute top-6 right-6 text-white hover:text-brand-gold text-4xl transition-colors z-50" onclick={closeLightbox}><i class="fa-solid fa-xmark"></i></button>
			<button class="absolute left-6 text-white hover:text-brand-gold text-4xl transition-colors z-50" onclick={prevImage}><i class="fa-solid fa-chevron-left"></i></button>
			<div class="w-full h-full max-w-6xl max-h-screen p-8 sm:p-12 flex items-center justify-center relative" in:scale={{duration: 300, start: 0.9}}>
				<!-- svelte-ignore a11y_click_events_have_key_events -->
				<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
				<img src={activeImage} alt="Gallery" class="max-w-full max-h-full object-contain shadow-2xl rounded-sm" onclick={(e) => e.stopPropagation()} />
			</div>
			<button class="absolute right-6 text-white hover:text-brand-gold text-4xl transition-colors z-50" onclick={nextImage}><i class="fa-solid fa-chevron-right"></i></button>
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
		<div class="absolute top-0 right-0 w-[800px] h-[800px] bg-brand-gold/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>

		<div class="container mx-auto px-4 lg:px-8 relative z-10">
			<!-- Header -->
			<div class="mb-10" in:fly={{ y: 20, duration: 800 }}>
				<div class="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
					<div class="lg:w-2/3">
						<div class="flex gap-3 items-center mb-4 text-xs font-bold uppercase tracking-[0.2em] text-brand-gold">
							<span class="bg-brand-black px-4 py-1.5 rounded-sm shadow-md">{inmueble.tipoOperacion || 'Venta'}</span>
							<span class="border border-brand-gold/30 px-4 py-1.5 rounded-sm">{inmueble.tipoInmueble || 'Propiedad'}</span>
						</div>
						<h1 class="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-brand-black mb-4 leading-tight">{inmueble.tituloPropiedad}</h1>
						<div class="flex items-center gap-6 text-gray-500 font-light">
							<span class="flex items-center gap-2"><i class="fa-solid fa-location-dot text-brand-gold"></i> {inmueble.ciudad || ''}{inmueble.zona ? `, ${inmueble.zona}` : ''}</span>
						</div>
					</div>
					<div class="lg:text-right flex flex-col items-start lg:items-end gap-4">
						<div>
							<p class="text-sm font-bold uppercase tracking-widest text-gray-400 mb-2">Precio de Lista</p>
							<p class="text-4xl md:text-5xl font-bold text-brand-green-dark">
								{inmueble.moneda === 'BS' || inmueble.moneda === 'BOB' ? 'Bs.' : '$us.'} {inmueble.precioLista ? Number(inmueble.precioLista).toLocaleString() : 'Consultar'}
							</p>
						</div>
						<button onclick={generatePDF} disabled={isGeneratingPdf} class="flex items-center gap-2 bg-brand-black text-brand-gold px-6 py-2 rounded-sm text-sm font-bold uppercase tracking-widest hover:bg-brand-gold hover:text-brand-black transition-colors shadow-lg">
							{#if isGeneratingPdf}
								<i class="fa-solid fa-circle-notch fa-spin"></i> Generando...
							{:else}
								<i class="fa-solid fa-download"></i> Ficha Técnica PDF
							{/if}
						</button>
					</div>
				</div>
			</div>

			<!-- Dynamic Gallery -->
			<div class="mb-16" in:fly={{ y: 30, duration: 1000, delay: 200 }}>
				<div class="grid grid-cols-1 md:grid-cols-4 md:grid-rows-2 gap-4 h-[50vh] md:h-[70vh]">
					<!-- svelte-ignore a11y_click_events_have_key_events -->
					<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
					<div class="md:col-span-3 md:row-span-2 rounded-xl overflow-hidden shadow-[0_20px_40px_rgba(0,0,0,0.1)] relative group cursor-zoom-in" onclick={() => openLightbox(activeImage)}>
						<img src={activeImage} alt="Vista principal" class="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-[1.02]" />
					</div>
					<div class="hidden md:flex flex-col gap-4 row-span-2 overflow-y-auto pr-2">
						{#each allImages as img}
							<!-- svelte-ignore a11y_click_events_have_key_events -->
							<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
							<div class={`relative rounded-xl overflow-hidden cursor-pointer flex-shrink-0 h-[32%] transition-all duration-300 ${activeImage === img ? 'ring-2 ring-brand-gold shadow-lg scale-100' : 'opacity-70 hover:opacity-100 hover:scale-[1.03]'}`} onclick={() => activeImage = img}>
								<img src={img} alt="Miniatura" class="w-full h-full object-cover" />
							</div>
						{/each}
					</div>
				</div>
			</div>

			<div class="flex flex-col lg:flex-row gap-16">
				<!-- Detailed Specs & Description -->
				<div class="lg:w-2/3 space-y-16" in:fly={{ y: 20, duration: 800, delay: 300 }}>
					
					<!-- Premium Features Strip -->
					<div class="grid grid-cols-2 md:grid-cols-4 gap-px bg-gray-200 rounded-xl overflow-hidden shadow-sm border border-gray-100">
						<div class="bg-white p-6 text-center">
							<i class="fa-solid fa-bed text-2xl text-brand-gold mb-3"></i>
							<p class="text-brand-black text-2xl font-serif mb-1">{(inmueble.dormitoriosEstandar || 0) + (inmueble.dormitoriosSuite || 0)}</p>
							<p class="text-gray-400 text-xs font-bold uppercase tracking-widest">Dormitorios</p>
						</div>
						<div class="bg-white p-6 text-center">
							<i class="fa-solid fa-bath text-2xl text-brand-gold mb-3"></i>
							<p class="text-brand-black text-2xl font-serif mb-1">{inmueble.banosCompletos || 0}</p>
							<p class="text-gray-400 text-xs font-bold uppercase tracking-widest">Baños</p>
						</div>
						<div class="bg-white p-6 text-center">
							<i class="fa-solid fa-vector-square text-2xl text-brand-gold mb-3"></i>
							<p class="text-brand-black text-2xl font-serif mb-1">{inmueble.supConstruida || inmueble.supTerreno || 0}</p>
							<p class="text-gray-400 text-xs font-bold uppercase tracking-widest">Metros M²</p>
						</div>
						<div class="bg-white p-6 text-center">
							<i class="fa-solid fa-car text-2xl text-brand-gold mb-3"></i>
							<p class="text-brand-black text-2xl font-serif mb-1">{inmueble.estacionamientos || 0}</p>
							<p class="text-gray-400 text-xs font-bold uppercase tracking-widest">Parqueos</p>
						</div>
					</div>

					<!-- Description -->
					<div class="relative">
						<i class="fa-solid fa-quote-left absolute -top-4 -left-4 text-4xl text-gray-100 -z-10"></i>
						<h3 class="text-3xl font-serif font-bold text-brand-black mb-6">Acerca de la Propiedad</h3>
						<div class="prose max-w-none text-gray-600 font-light leading-loose whitespace-pre-wrap text-lg">
							{inmueble.descripcionPropiedad || 'Una propiedad exclusiva de Casa Legal Inmobiliaria.'}
						</div>
					</div>
					
					<!-- Amenities -->
					{#if inmueble.areasComunes && inmueble.areasComunes.length > 0}
						<div class="bg-white p-10 rounded-2xl shadow-xl border border-gray-100">
							<h3 class="text-2xl font-serif font-bold text-brand-black mb-8 flex items-center gap-4">
								<i class="fa-solid fa-star text-brand-gold"></i> Amenidades
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

					<!-- Google Maps integration -->
					<div>
						<h3 class="text-3xl font-serif font-bold text-brand-black mb-6">Ubicación</h3>
						<div bind:this={mapElement} class="w-full h-[400px] rounded-2xl overflow-hidden shadow-lg border border-gray-200"></div>
					</div>
				</div>

				<!-- Sidebar CTA & Agent Card -->
				<div class="lg:w-1/3 space-y-8" in:fly={{ x: 20, duration: 800, delay: 500 }}>
					
					<!-- Agent Card -->
					{#if agente}
						<div class="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
							<div class="h-24 bg-brand-green-dark relative">
								<div class="absolute inset-0 bg-brand-gold/10"></div>
							</div>
							<div class="px-8 pb-8 text-center relative">
								<div class="w-24 h-24 mx-auto rounded-full border-4 border-white overflow-hidden -mt-12 bg-brand-green-dark shadow-lg relative z-10 flex items-center justify-center">
									<img src={agente.foto} alt={agente.nombre} class="w-full h-full object-cover" />
								</div>
								<h4 class="text-xl font-serif font-bold text-brand-black mt-4">{agente.nombre}</h4>
								<p class="text-brand-gold text-xs font-bold uppercase tracking-widest mb-6">{agente.rol}</p>
								<div class="flex justify-center gap-4 mb-6">
									<a href={`tel:${agente.telefono}`} class="w-10 h-10 rounded-full bg-gray-50 text-gray-600 flex items-center justify-center hover:bg-brand-gold hover:text-white transition-colors">
										<i class="fa-solid fa-phone"></i>
									</a>
									<a href={`/agentes/${agente.id}`} class="w-10 h-10 rounded-full bg-gray-50 text-gray-600 flex items-center justify-center hover:bg-brand-gold hover:text-white transition-colors" title="Ver Perfil">
										<i class="fa-solid fa-user"></i>
									</a>
								</div>
								<p class="text-sm text-gray-500 font-light border-t border-gray-100 pt-6">El agente designado para brindarte toda la información que necesites sobre este inmueble.</p>
							</div>
						</div>
					{/if}

					<!-- Lead Capture Form -->
					<div class="bg-brand-black rounded-2xl shadow-2xl p-8 sticky top-32">
						<div class="flex items-center gap-4 mb-6">
							<div class="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-white text-2xl shadow-[0_0_15px_rgba(34,197,94,0.4)]">
								<i class="fa-brands fa-whatsapp"></i>
							</div>
							<h3 class="text-white font-serif font-bold text-2xl">Contactar al Agente</h3>
						</div>
						
						<form onsubmit={(e) => { e.preventDefault(); enviarWhatsApp(); }} class="space-y-4">
							<div>
								<input type="text" bind:value={leadName} placeholder="Tu Nombre Completo" class="w-full bg-white/10 border border-white/20 text-white placeholder-gray-400 px-4 py-3 rounded-sm focus:outline-none focus:border-brand-gold transition-colors" required />
							</div>
							<div>
								<input type="tel" bind:value={leadPhone} placeholder="Tu Celular" class="w-full bg-white/10 border border-white/20 text-white placeholder-gray-400 px-4 py-3 rounded-sm focus:outline-none focus:border-brand-gold transition-colors" required />
							</div>
							<div>
								<textarea bind:value={leadMessage} rows="3" class="w-full bg-white/10 border border-white/20 text-white placeholder-gray-400 px-4 py-3 rounded-sm focus:outline-none focus:border-brand-gold transition-colors resize-none" required></textarea>
							</div>
							<button type="submit" class="w-full bg-green-500 hover:bg-green-400 text-white font-bold uppercase tracking-widest py-4 rounded-sm transition-colors mt-2 shadow-lg flex items-center justify-center gap-2">
								<i class="fa-brands fa-whatsapp text-xl"></i> Enviar Mensaje
							</button>
						</form>
						<p class="text-gray-500 text-xs text-center mt-6 font-light">Tus datos están protegidos. Nos pondremos en contacto a la brevedad.</p>
					</div>

				</div>
			</div>
		</div>
	</div>

	<!-- HIDDEN PDF CONTAINER (MULTI-PAGE A4) -->
	<div bind:this={pdfContainer} style="display: none; position: absolute; top: -9999px; left: -9999px; z-index: -9999;">
		
		<!-- ================= PAGE 1 ================= -->
		<div class="pdf-page" style="width: 800px; height: 1131px; background: #081c15; color: white; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; position: relative; overflow: hidden; display: flex; flex-direction: column;">
			
			<!-- Massive Hero -->
			<div style="position: relative; width: 100%; height: 600px;">
				<img class="pdf-image" data-src={inmueble.fotoPrincipal} src="" alt="Main" style="width: 100%; height: 100%; object-fit: cover; filter: brightness(0.6);" />
				<div style="position: absolute; bottom: 0; left: 0; width: 100%; background: linear-gradient(to top, #081c15 0%, transparent 100%); height: 350px;"></div>
				
				<!-- Giant Logo -->
				<div style="position: absolute; top: 40px; left: 40px; background: rgba(8,28,21,0.9); padding: 25px 40px; border: 2px solid #bda871; border-radius: 8px;">
					<img src={logoImg} style="height: 70px;" alt="Logo" />
				</div>
				
				<!-- Giant Price and Title -->
				<div style="position: absolute; bottom: 40px; left: 50px; right: 50px;">
					<div style="display: flex; justify-content: space-between; align-items: flex-end;">
						<div style="max-width: 60%;">
							<p style="color: #bda871; font-weight: bold; font-size: 18px; text-transform: uppercase; letter-spacing: 4px; margin: 0 0 15px 0;">{inmueble.tipoOperacion} Exclusiva</p>
							<h1 style="font-size: 42px; margin: 0; color: white; text-shadow: 2px 2px 6px rgba(0,0,0,0.9); line-height: 1.1;">{inmueble.tituloPropiedad}</h1>
							<p style="color: #ddd; font-size: 20px; margin: 15px 0 0 0;">
								📍 {inmueble.ciudad} {inmueble.zona ? `- ${inmueble.zona}` : ''}
							</p>
						</div>
						<div style="text-align: right; background: rgba(8,28,21,0.85); padding: 25px; border-left: 4px solid #bda871; border-radius: 4px;">
							<p style="color: #bda871; font-size: 14px; text-transform: uppercase; margin: 0 0 10px 0; letter-spacing: 2px;">Precio de Lista</p>
							<h2 style="font-size: 40px; margin: 0; color: white; white-space: nowrap;">{inmueble.moneda === 'BS' ? 'Bs.' : '$us.'} {Number(inmueble.precioLista).toLocaleString()}</h2>
						</div>
					</div>
				</div>
			</div>

			<!-- Specs Grid (Bigger) -->
			<div style="padding: 50px; flex-grow: 1;">
				<div style="display: flex; gap: 20px; margin-bottom: 50px; text-align: center;">
					<div style="flex: 1; background: #11281e; border: 1px solid rgba(189,168,113,0.4); padding: 30px 20px; border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
						<p style="font-size: 32px; color: #bda871; margin: 0 0 10px 0; font-weight: bold;">{(inmueble.dormitoriosEstandar || 0) + (inmueble.dormitoriosSuite || 0)}</p>
						<p style="font-size: 14px; color: #aaa; text-transform: uppercase; letter-spacing: 3px; margin: 0;">Dormitorios</p>
					</div>
					<div style="flex: 1; background: #11281e; border: 1px solid rgba(189,168,113,0.4); padding: 30px 20px; border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
						<p style="font-size: 32px; color: #bda871; margin: 0 0 10px 0; font-weight: bold;">{inmueble.banosCompletos || 0}</p>
						<p style="font-size: 14px; color: #aaa; text-transform: uppercase; letter-spacing: 3px; margin: 0;">Baños</p>
					</div>
					<div style="flex: 1; background: #11281e; border: 1px solid rgba(189,168,113,0.4); padding: 30px 20px; border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
						<p style="font-size: 32px; color: #bda871; margin: 0 0 10px 0; font-weight: bold;">{inmueble.supConstruida || inmueble.supTerreno || 0}</p>
						<p style="font-size: 14px; color: #aaa; text-transform: uppercase; letter-spacing: 3px; margin: 0;">Metros M²</p>
					</div>
					<div style="flex: 1; background: #11281e; border: 1px solid rgba(189,168,113,0.4); padding: 30px 20px; border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
						<p style="font-size: 32px; color: #bda871; margin: 0 0 10px 0; font-weight: bold;">{inmueble.estacionamientos || 0}</p>
						<p style="font-size: 14px; color: #aaa; text-transform: uppercase; letter-spacing: 3px; margin: 0;">Parqueos</p>
					</div>
				</div>

				<!-- Description -->
				<div>
					<h3 style="color: #bda871; text-transform: uppercase; font-size: 20px; letter-spacing: 3px; border-bottom: 2px solid rgba(189,168,113,0.3); padding-bottom: 15px; margin-bottom: 30px;">Acerca de la Propiedad</h3>
					<p style="color: #ddd; line-height: 2; font-size: 16px; white-space: pre-wrap; margin-bottom: 30px; display: -webkit-box; -webkit-line-clamp: 6; -webkit-box-orient: vertical; overflow: hidden; text-overflow: ellipsis;">{inmueble.descripcionPropiedad}</p>
				</div>
			</div>

			<!-- Giant Agent Footer inside Page 1 -->
			<div style="background: #040e0a; padding: 40px 50px; display: flex; justify-content: space-between; align-items: center; border-top: 4px solid #bda871; margin-top: auto;">
				<div>
					<p style="margin: 0; font-size: 18px; color: #bda871; font-weight: bold; letter-spacing: 3px; margin-bottom: 10px;">CASA LEGAL INMOBILIARIA</p>
					<p style="margin: 0; font-size: 14px; color: #888; letter-spacing: 1px;">Especialistas en Seguridad Jurídica y Bienes Raíces</p>
				</div>
				{#if agente}
					<div style="text-align: right; display: flex; align-items: center; gap: 25px;">
						<div>
							<p style="margin: 0; font-size: 14px; color: #888; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 8px;">Asesor Inmobiliario</p>
							<p style="margin: 0; font-size: 22px; font-weight: bold; color: white;">{agente.nombre}</p>
							<p style="margin: 8px 0 0 0; font-size: 16px; color: #bda871; display: flex; align-items: center; gap: 8px; justify-content: flex-end;">📞 {agente.telefono}</p>
						</div>
						<div style="width: 100px; height: 100px; border-radius: 50%; overflow: hidden; border: 3px solid #bda871; background: #11281e;">
							<img class="pdf-image" data-src={agente.foto} src="" alt="Agente" style="width: 100%; height: 100%; object-fit: cover;" />
						</div>
					</div>
				{/if}
			</div>
		</div>

		<!-- ================= PAGE 2 ================= -->
		<div class="pdf-page" style="width: 800px; height: 1131px; background: #081c15; color: white; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; position: relative; overflow: hidden; display: flex; flex-direction: column;">
			
			<div style="padding: 50px 50px 20px 50px; background: #040e0a; border-bottom: 2px solid rgba(189,168,113,0.3); display: flex; justify-content: space-between; align-items: center;">
				<h2 style="color: #bda871; font-size: 24px; text-transform: uppercase; letter-spacing: 4px; margin: 0;">Galería Exclusiva</h2>
				<img src={logoImg} style="height: 40px; opacity: 0.8;" alt="Logo" />
			</div>

			<!-- Large Photo Grid -->
			<div style="padding: 40px 50px; display: grid; grid-template-columns: 1fr 1fr; gap: 25px; flex-grow: 1;">
				{#each allImages.slice(1, 7) as foto}
					<div style="width: 100%; height: 260px; border-radius: 12px; overflow: hidden; border: 2px solid rgba(189,168,113,0.4); box-shadow: 0 10px 20px rgba(0,0,0,0.5);">
						<img class="pdf-image" data-src={foto} src="" alt="Secundaria" style="width: 100%; height: 100%; object-fit: cover;" />
					</div>
				{/each}
			</div>

			<!-- Full Amenities -->
			{#if inmueble.areasComunes && inmueble.areasComunes.length > 0}
				<div style="padding: 0 50px 40px 50px;">
					<h3 style="color: #bda871; text-transform: uppercase; font-size: 18px; letter-spacing: 3px; border-bottom: 2px solid rgba(189,168,113,0.3); padding-bottom: 15px; margin-bottom: 30px;">Amenidades Premium</h3>
					<div style="display: flex; flex-wrap: wrap; gap: 15px;">
						{#each inmueble.areasComunes as area}
							<div style="background: rgba(189,168,113,0.1); border: 1px solid rgba(189,168,113,0.5); padding: 12px 20px; border-radius: 6px; font-size: 14px; color: #e2cca1;">
								✦ {area}
							</div>
						{/each}
					</div>
				</div>
			{/if}
			
			<div style="background: #040e0a; padding: 30px; text-align: center; border-top: 2px solid #333; margin-top: auto;">
				<p style="color: #666; font-size: 12px; margin: 0;">Documento generado exclusivamente por el sistema Casa Legal Inmobiliaria. La información contenida está sujeta a verificación.</p>
			</div>
		</div>

	</div>

{:else if isLoaded}
	<div class="min-h-screen flex items-center justify-center bg-brand-white">
		<div class="text-center">
			<h2 class="text-3xl font-serif font-bold text-brand-black mb-4">Propiedad no disponible</h2>
			<a href="/inmuebles" class="text-brand-gold hover:underline">Volver al catálogo</a>
		</div>
	</div>
{:else}
	<div class="min-h-screen flex items-center justify-center bg-brand-white relative overflow-hidden">
		<div class="w-24 h-24 relative">
			<div class="absolute inset-0 border-4 border-gray-200 border-t-brand-gold rounded-full animate-spin"></div>
		</div>
	</div>
{/if}

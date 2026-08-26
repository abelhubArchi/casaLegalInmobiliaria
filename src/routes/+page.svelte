<script lang="ts">
  import { fade, fly, scale, slide } from 'svelte/transition';
  import { onMount } from 'svelte';
  import { getMaps } from '$lib/firebase/db';
  import { MapPin, Ruler, CheckCircle2, ArrowRight, ShieldCheck, Banknote, Map as MapIcon, MessageCircle, Phone, Star, Users, Flame, TrendingUp, Clock, Eye } from 'lucide-svelte';
  import SplashScreen from '$lib/components/public/SplashScreen.svelte';
  import SocialAndLocations from '$lib/components/public/SocialAndLocations.svelte';
  import logoCasaLegal from '$lib/assets/logo.webp';
  import fondoPrincipal from '$lib/assets/fondos/image.webp';
  import imagenFamilia1 from '$lib/assets/familias/image.webp';
  import imagenFamilia2 from '$lib/assets/familias/image copy.webp';
  import imagenFamilia3 from '$lib/assets/familias/image copy 2.webp';
  import imagenFamilia4 from '$lib/assets/familias/image copy 3.webp';
  import imagenFamilia5 from '$lib/assets/familias/image copy 4.webp';

  let mounted = $state(false);
  let showSplash = $state(true);
  let mapas: any[] = $state([]);
  let activeViewers = $state(42);
  let visibleElements = $state<Set<string>>(new Set());
  let premiumLots: any[] = $state([]);
  let mostVisitedLot: any = $state(null);

  onMount(() => {
    // Load Maps and Lots
    const loadData = getMaps().then(fetchedMaps => {
      mapas = fetchedMaps;
      
      let allLots: any[] = [];
      mapas.forEach(m => {
        if (m.lots) {
          const lotsWithVisits = m.lots.map((l: any) => {
            const seed = l.id.charCodeAt(l.id.length - 1) || 0;
            const visits = (seed % 15) + 30 + Math.floor(Math.random() * 50);
            return { ...l, mapId: m.id, mapTitle: m.title, visits };
          });
          allLots = [...allLots, ...lotsWithVisits];
        }
      });
      allLots.sort((a, b) => b.visits - a.visits);
      
      if (allLots.length > 0) {
        mostVisitedLot = allLots[0];
        premiumLots = allLots.slice(1, 4);
      }
    }).catch(err => {
      console.error("Error loading maps for landing page:", err);
    });

    // Hide splash screen after a short fixed delay so the UI is visible instantly
    setTimeout(() => {
      showSplash = false;
      mounted = true;
    }, 800);

    // Live viewer simulation
    const interval = setInterval(() => {
      activeViewers = activeViewers + Math.floor(Math.random() * 5) - 2;
      if (activeViewers < 15) activeViewers = 15;
    }, 3500);

    return () => clearInterval(interval);
  });

  // Simple scroll animation observer action
  function observeNode(node: HTMLElement, id: string) {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        visibleElements.add(id);
        visibleElements = new Set(visibleElements); // trigger reactivity
        observer.unobserve(node);
      }
    }, { threshold: 0.1 });
    observer.observe(node);
    return {
      destroy() { observer.disconnect(); }
    };
  }

  function scrollToSection(id: string) {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  }

  const testimonials = [
    { name: "Familia Mamani", role: "Nuevos Propietarios", text: "Invertir con Casa Legal ha sido nuestra mejor decisión. Son profesionales intachables y el Doc. Hugo Santos es una excelente persona que nos guio en todo el proceso con mucha paciencia.", image: imagenFamilia1 },
    { name: "Familia Quispe", role: "Inversores", text: "Todo el trámite fue sumamente rápido y seguro. Gracias a la calidez humana del Doc. Hugo Santos y la enorme profesionalidad de Casa Legal, ahora tenemos el terreno perfecto.", image: imagenFamilia2 },
    { name: "Familia Lopez", role: "Residentes", text: "Destacamos el gran profesionalismo de Casa Legal. El Doc. Hugo Santos nos transmitió muchísima seguridad desde el primer día. ¡Estamos felices, 100% recomendados!", image: imagenFamilia3 },
    { name: "Familia Vargas", role: "Familias Satisfechas", text: "Habíamos buscado por mucho tiempo un lugar de confianza. Casa Legal cumplió todas sus promesas y el Doc. Hugo Santos nos dio un trato de primera calidad.", image: imagenFamilia4 },
    { name: "Familia Condori", role: "Constructores", text: "Nos sentimos muy respaldados por todo el equipo. Recomendamos a Casa Legal y al Doc. Hugo Santos por su honestidad y gran calidad humana.", image: imagenFamilia5 }
  ];
</script>

<svelte:head>
  <title>Casa Legal Inmobiliaria | Lotes, Terrenos y Proyectos</title>
  <meta name="description" content="Casa Legal Inmobiliaria. Encuentra y asegura tu patrimonio con lotes y terrenos en las mejores ubicaciones. Garantía legal, alta plusvalía y atención personalizada." />
  <meta name="keywords" content="inmobiliaria, terrenos en venta, lotes, casa legal, comprar terreno, bienes raices, inversiones inmobiliarias, plusvalia" />
  <meta property="og:title" content="Casa Legal Inmobiliaria | Tu Inversión Segura" />
  <meta property="og:description" content="Descubre los mejores proyectos inmobiliarios. Terrenos y lotes con respaldo legal y alta proyección económica." />
  <meta property="og:image" content="https://casalegal.com/og-image-default.jpg" />
  <meta property="og:url" content="https://casalegal.com" />
  <meta property="og:type" content="website" />
  <meta name="robots" content="index, follow" />
</svelte:head>

<SplashScreen isVisible={showSplash} message="Buscando las mejores oportunidades para ti..." />

<div class="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-[var(--color-brand-gold)] selection:text-white relative overflow-x-hidden">
  
  <!-- Urgency Live Banner -->
  <div class="bg-red-600 text-white py-2 px-4 text-center text-xs md:text-sm font-bold flex items-center justify-center gap-2 relative z-50">
    <Flame class="w-4 h-4 animate-bounce" />
    <span>¡URGENTE! <span class="bg-white text-red-600 px-2 py-0.5 rounded-full mx-1 font-black">{activeViewers} personas</span> están buscando terreno ahora mismo. ¡Los lotes premium se agotan!</span>
  </div>

  <!-- Floating WhatsApp Button -->
  <a href="https://wa.me/1234567890" target="_blank" class="fixed bottom-6 right-6 z-50 bg-[#25D366] text-white p-4 rounded-full shadow-[0_10px_25px_rgba(37,211,102,0.5)] hover:scale-110 transition-all flex items-center justify-center animate-bounce-slow">
    <MessageCircle class="w-8 h-8" />
  </a>

  <!-- Header -->
  <header class="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm transition-all duration-300 px-6 py-4 md:px-12 flex justify-between items-center">
    <div class="flex items-center gap-4">
      <div class="relative w-12 h-12 rounded-full overflow-hidden shadow-md">
        <img src={logoCasaLegal} alt="Casa Legal Logo" class="w-full h-full object-cover" />
      </div>
      <div class="hidden sm:block">
        <h1 class="text-xl font-black tracking-tight text-[var(--color-brand-green)] leading-none">
          CASA <span class="text-[var(--color-brand-gold)]">LEGAL</span>
        </h1>
        <p class="text-[9px] tracking-[0.2em] text-slate-500 uppercase font-semibold">Inmobiliaria</p>
      </div>
    </div>
    <nav class="hidden lg:flex gap-8 text-sm font-bold tracking-wide uppercase text-slate-600">
      <button onclick={() => scrollToSection('inicio')} class="hover:text-[var(--color-brand-gold)] transition-colors">Inicio</button>
      <button onclick={() => scrollToSection('premium')} class="text-red-600 flex items-center gap-1 hover:text-red-700 transition-colors"><Flame class="w-4 h-4"/> Alta Demanda</button>
      <button onclick={() => scrollToSection('proyectos')} class="hover:text-[var(--color-brand-gold)] transition-colors">Proyectos</button>
      <button onclick={() => scrollToSection('compramos')} class="hover:text-[var(--color-brand-gold)] transition-colors">Vender Lote</button>
    </nav>
    <a href="https://wa.me/1234567890" class="px-5 py-2.5 bg-[var(--color-brand-gold)] hover:bg-yellow-500 text-[var(--color-brand-green-dark)] font-bold rounded-lg transition-transform hover:scale-105 shadow-md flex items-center gap-2 text-sm">
      <Phone class="w-4 h-4" /> Asesoría Gratuita
    </a>
  </header>

  <!-- Hero Section -->
  {#if mounted}
    <main id="inicio" class="relative z-10 pt-20 pb-20 md:pt-32 md:pb-40 flex flex-col items-center justify-center w-full min-h-[90vh]">
      <!-- Fondo Principal con Degradado Oscuro -->
      <div class="absolute inset-0 z-0 overflow-hidden bg-black">
        <img src={fondoPrincipal} alt="Fondo Principal" class="w-full h-full object-cover opacity-60 scale-105 animate-zoom-in" />
        <div class="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-transparent"></div>
        <div class="absolute inset-0 bg-gradient-to-t from-slate-50 via-transparent to-black/40"></div>
      </div>
      
      <div class="relative z-10 max-w-7xl mx-auto px-6 w-full flex flex-col lg:flex-row items-center gap-12">
        <div class="flex-1 text-center lg:text-left">
        <div 
          in:fly={{ y: 30, duration: 1000, delay: 200 }}
          class="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full bg-green-900/80 border border-green-500/30 text-green-400 text-xs font-bold tracking-widest uppercase shadow-sm"
        >
          <TrendingUp class="w-4 h-4" /> La zona de mayor crecimiento
        </div>
        
        <h2 
          in:fly={{ y: 30, duration: 1000, delay: 400 }}
          class="text-4xl md:text-6xl font-extrabold tracking-tight mb-6 leading-[1.1] text-white"
        >
          Deja de Pagar Alquiler. <br/>
          <span class="text-emerald-400">Empieza a Construir tu Legado Hoy.</span>
        </h2>
        
        <p 
          in:fly={{ y: 30, duration: 1000, delay: 600 }}
          class="text-lg md:text-xl text-slate-300 mb-8 leading-relaxed max-w-2xl mx-auto lg:mx-0"
        >
          El mercado inmobiliario no espera. Adquiere tu lote <strong>ahora</strong> en ubicaciones estratégicas antes de que la plusvalía dispare su valor. 
          <span class="text-red-300 font-semibold bg-red-900/80 px-2 py-0.5 rounded border border-red-500/20 block sm:inline mt-2 sm:mt-0">Alta probabilidad de revalorización en los próximos 12 meses.</span>
        </p>
        
        <div in:fly={{ y: 30, duration: 1000, delay: 800 }} class="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
          <button onclick={() => scrollToSection('premium')} class="w-full sm:w-auto px-8 py-4 bg-[var(--color-brand-green)] hover:bg-[var(--color-brand-green-dark)] text-white font-black rounded-xl shadow-[0_10px_25px_rgba(27,67,50,0.3)] transition-all hover:-translate-y-1 hover:shadow-[0_15px_30px_rgba(27,67,50,0.4)] flex items-center justify-center gap-2 text-lg">
            Ver Lotes de Alta Demanda <ArrowRight class="w-5 h-5" />
          </button>
        </div>

        <div in:fly={{ fade: true, duration: 1000, delay: 1000 }} class="mt-10 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-sm font-semibold text-slate-500">
          <div class="flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow-sm border border-slate-100"><ShieldCheck class="w-5 h-5 text-green-600" /> Compra Segura al 100%</div>
          <div class="flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow-sm border border-slate-100"><Clock class="w-5 h-5 text-orange-500" /> Entrega Inmediata</div>
        </div>
      </div>

      <div class="flex-1 relative w-full" in:fly={{ x: 50, duration: 1200, delay: 500 }}>
        {#if mostVisitedLot}
        <a href="/lotes/{mostVisitedLot.mapId}/{mostVisitedLot.id}" class="relative block rounded-[2rem] overflow-hidden shadow-2xl border-4 border-white aspect-[4/3] group cursor-pointer">
          <img src={mostVisitedLot.images?.hero?.[0] || "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&q=80&w=1000"} alt="Lote más visitado" class="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" />
          <div class="absolute inset-0 bg-gradient-to-t from-[var(--color-brand-green-dark)]/80 via-black/20 to-transparent"></div>
          
          <!-- Animated pulse point -->
          <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div class="w-24 h-24 bg-white/20 rounded-full animate-ping absolute -left-10 -top-10"></div>
            <div class="w-4 h-4 bg-white rounded-full shadow-[0_0_20px_rgba(255,255,255,1)] relative z-10"></div>
          </div>

          <!-- Hot Badge -->
          <div class="absolute top-4 right-4 bg-red-600 text-white px-3 py-1 rounded-full text-xs font-bold uppercase shadow-lg flex items-center gap-1 animate-pulse">
            <Flame class="w-3 h-3" /> {mostVisitedLot.visits} personas lo vieron
          </div>

          <div class="absolute bottom-8 left-8 right-8 text-white flex justify-between items-end">
            <div>
              <p class="font-black text-2xl mb-1 drop-shadow-md">Lote {mostVisitedLot.code || mostVisitedLot.id}</p>
              <p class="text-sm font-medium text-green-300 flex items-center gap-2">
                <MapPin class="w-4 h-4" /> Proyecto {mostVisitedLot.mapTitle}
              </p>
            </div>
            <div class="hidden sm:flex bg-white text-slate-900 px-4 py-2 rounded-lg font-bold items-center gap-2 shadow-md">
              <Eye class="w-4 h-4 text-red-500" /> El más cotizado
            </div>
          </div>
        </a>
        {:else}
        <div class="relative rounded-[2rem] overflow-hidden shadow-2xl border-4 border-white aspect-[4/3] group bg-slate-200 flex items-center justify-center animate-pulse">
          <p class="text-slate-400 font-bold">Buscando oportunidades...</p>
        </div>
        {/if}
      </div>
      </div>
    </main>
  {/if}

  <!-- Lotes Más Deseados (Premium / High Demand) -->
  <section id="premium" class="py-24 bg-white relative">
    <div class="max-w-7xl mx-auto px-6">
      <div use:observeNode={'premium-title'} class="text-center max-w-4xl mx-auto mb-16 transition-all duration-1000 {visibleElements.has('premium-title') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}">
        <div class="inline-flex items-center gap-2 bg-red-100 text-red-700 px-4 py-1.5 rounded-full font-bold text-sm uppercase tracking-wider mb-4">
          <Flame class="w-5 h-5 animate-pulse" /> Lotes Más Deseados
        </div>
        <h3 class="text-4xl md:text-5xl font-extrabold text-slate-900 mb-6">
          Oportunidades que <span class="text-red-600">desaparecen en días</span>
        </h3>
        <p class="text-lg text-slate-600 font-medium">
          Estos son los terrenos con la ubicación más privilegiada y mayor proyección de rentabilidad. Otros inversores ya los están viendo. <strong>¡Elige el tuyo antes de que alguien más lo haga!</strong>
        </p>
      </div>

      {#if premiumLots.length === 0}
        <div class="text-center p-12 bg-slate-50 rounded-2xl border border-slate-200">
          <p class="text-slate-500 font-medium">Revisando disponibilidad de lotes premium...</p>
        </div>
      {:else}
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          {#each premiumLots as lot, i}
            <div 
              use:observeNode={`lot-${i}`}
              class="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl border border-slate-100 transition-all duration-700 hover:-translate-y-2 flex flex-col relative
              {visibleElements.has(`lot-${i}`) ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-16'}"
              style="transition-delay: {i * 150}ms;"
            >
              <!-- Scarcity Badge -->
              <div class="absolute top-4 right-4 z-20 bg-red-600 text-white px-3 py-1 rounded-full text-xs font-bold uppercase shadow-lg flex items-center gap-1 animate-pulse">
                <Eye class="w-3 h-3" /> {Math.floor(Math.random() * 8) + 2} Viendo esto
              </div>

              <!-- Hero Image (Mocking for now if real image doesn't exist, using high quality residential) -->
              <div class="relative h-64 overflow-hidden bg-slate-200">
                <img loading="lazy" decoding="async" src={lot.images?.hero?.[0] || 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=800'} alt="Terreno Premium" class="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
                <div class="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent"></div>
                
                <div class="absolute bottom-4 left-4 right-4">
                  <p class="text-[var(--color-brand-gold)] font-bold text-sm uppercase tracking-wider mb-1">{lot.mapTitle}</p>
                  <h4 class="text-3xl font-black text-white flex items-center gap-2">Lote {lot.code || lot.id}</h4>
                </div>
              </div>

              <div class="p-6 flex flex-col flex-grow bg-white">
                <div class="flex items-center justify-between mb-4 pb-4 border-b border-slate-100">
                  <div class="flex items-center gap-2 text-slate-600 font-semibold">
                    <Ruler class="w-5 h-5 text-[var(--color-brand-green)]" /> {lot.area_m2 || lot.area || 'Terreno amplio'}
                  </div>
                  <div class="flex items-center gap-2 text-slate-600 font-semibold">
                    <MapPin class="w-5 h-5 text-[var(--color-brand-green)]" /> Esquina Ideal
                  </div>
                </div>
                
                <ul class="space-y-2 mb-8 flex-grow">
                  <li class="flex items-start gap-2 text-sm text-slate-600 font-medium"><CheckCircle2 class="w-5 h-5 text-green-500 shrink-0" /> Ubicación en zona de expansión</li>
                  <li class="flex items-start gap-2 text-sm text-slate-600 font-medium"><CheckCircle2 class="w-5 h-5 text-green-500 shrink-0" /> Plusvalía garantizada</li>
                </ul>

                <a 
                  href="/lotes/{lot.mapId}/{lot.id}" 
                  class="w-full py-4 bg-[var(--color-brand-green-dark)] hover:bg-black text-white text-center font-bold rounded-xl transition-all shadow-md flex items-center justify-center gap-2 uppercase tracking-wide group-hover:bg-[var(--color-brand-gold)] group-hover:text-black"
                >
                  <MapIcon class="w-5 h-5" /> Ver en Plano
                </a>
              </div>
            </div>
          {/each}
        </div>
      {/if}
    </div>
  </section>

  <!-- Proyectos / Mapas Interactivos -->
  <section id="proyectos" class="py-24 bg-slate-50 border-y border-slate-200">
    <div class="max-w-7xl mx-auto px-6">
      <div use:observeNode={'proyectos-title'} class="text-center max-w-3xl mx-auto mb-16 transition-all duration-1000 {visibleElements.has('proyectos-title') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}">
        <h3 class="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4">
          Explora nuestros <span class="text-[var(--color-brand-green)]">Proyectos Completos</span>
        </h3>
        <p class="text-lg text-slate-600">
          Entra a los planos interactivos, mira el entorno, las áreas verdes y selecciona exactamente el lugar donde quieres vivir.
        </p>
      </div>

      {#if mapas.length === 0}
        <div class="bg-white p-12 rounded-2xl text-center shadow-sm border border-slate-200">
          <MapIcon class="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <p class="text-slate-500 font-medium">Próximamente nuevos proyectos.</p>
        </div>
      {:else}
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
          {#each mapas as mapa, i}
            <div 
              use:observeNode={`mapa-${i}`}
              class="bg-white rounded-3xl overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.08)] border border-slate-100 group flex flex-col md:flex-row transition-all duration-1000 {visibleElements.has(`mapa-${i}`) ? 'opacity-100 translate-x-0' : (i % 2 === 0 ? '-translate-x-10 opacity-0' : 'translate-x-10 opacity-0')}"
            >
              <div class="relative w-full md:w-2/5 h-64 md:h-auto overflow-hidden bg-slate-100">
                {#if mapa.base_image_url}
                  <img loading="lazy" decoding="async" src={mapa.base_image_url} alt={mapa.title} class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                {:else}
                  <div class="w-full h-full flex items-center justify-center text-slate-400 bg-slate-200"><MapIcon class="w-12 h-12 opacity-50"/></div>
                {/if}
                <div class="absolute inset-0 bg-[var(--color-brand-green-dark)]/40 group-hover:bg-[var(--color-brand-green-dark)]/20 transition-colors duration-500"></div>
              </div>

              <div class="p-8 w-full md:w-3/5 flex flex-col justify-center">
                <div class="inline-block px-3 py-1 bg-green-100 text-green-800 text-xs font-bold rounded-full uppercase tracking-wider mb-4 w-max">
                  {mapa.lots?.length || 0} Lotes en Venta
                </div>
                <h4 class="text-2xl font-black text-slate-900 mb-3 group-hover:text-[var(--color-brand-green)] transition-colors">{mapa.title}</h4>
                <p class="text-slate-600 text-sm mb-8 leading-relaxed">
                  Desarrollo urbanístico pensado en el bienestar de tu familia. Todo el diseño, calles y áreas recreativas listas para que construyas tu hogar.
                </p>
                <a 
                  href="/plano/{mapa.id}" 
                  class="inline-flex items-center justify-center gap-2 py-3 px-6 bg-slate-900 hover:bg-[var(--color-brand-gold)] hover:text-slate-900 text-white font-bold rounded-xl transition-all shadow-md group-hover:shadow-lg"
                >
                  <MapIcon class="w-5 h-5" /> Abrir Plano Interactivo
                </a>
              </div>
            </div>
          {/each}
        </div>
      {/if}
    </div>
  </section>

  <!-- Social Proof / Testimonials Section -->
  <section class="py-24 bg-[var(--color-brand-green-dark)] text-white relative overflow-hidden">
    <div class="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-bl from-[var(--color-brand-gold)]/20 to-transparent rounded-full pointer-events-none"></div>
    <div class="max-w-7xl mx-auto px-6 relative z-10">
      <div use:observeNode={'test-title'} class="text-center max-w-3xl mx-auto mb-16 transition-all duration-1000 {visibleElements.has('test-title') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}">
        <h3 class="text-4xl font-extrabold mb-4">Lo que dicen <span class="text-[var(--color-brand-gold)]">nuestros clientes</span></h3>
        <p class="text-green-100 text-lg">Más de 500 familias ya han asegurado su patrimonio con Casa Legal.</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        {#each testimonials as review, i}
          <div 
            use:observeNode={`test-${i}`}
            class="bg-white/10 p-8 rounded-2xl border border-white/20 transition-all duration-700 {visibleElements.has(`test-${i}`) ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}"
            style="transition-delay: {i * 200}ms;"
          >
            <div class="flex gap-1 text-[var(--color-brand-gold)] mb-6">
              {#each Array(5) as _}<Star class="w-5 h-5 fill-current" />{/each}
            </div>
            <p class="text-white/90 text-lg font-medium italic mb-8">"{review.text}"</p>
            <div class="flex items-center gap-4 mt-auto">
              <img loading="lazy" decoding="async" src={review.image} alt={review.name} class="w-12 h-12 rounded-full border-2 border-[var(--color-brand-gold)] object-cover" />
              <div>
                <p class="font-bold text-white">{review.name}</p>
                <p class="text-sm text-green-300">{review.role}</p>
              </div>
            </div>
          </div>
        {/each}
      </div>
    </div>
  </section>

  <!-- Compramos tu terreno Section -->
  <section id="compramos" class="py-24 bg-white relative">
    <div class="max-w-5xl mx-auto px-6 text-center">
      <div use:observeNode={'compra-title'} class="transition-all duration-1000 {visibleElements.has('compra-title') ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}">
        <div class="inline-flex items-center justify-center w-20 h-20 rounded-full bg-[var(--color-brand-gold)]/20 mb-8">
          <Banknote class="w-10 h-10 text-[var(--color-brand-gold)]" />
        </div>
        
        <h3 class="text-4xl md:text-5xl font-extrabold mb-6 text-slate-900">
          ¿Tienes un terreno y quieres liquidez? <br/> <span class="text-[var(--color-brand-green)]">Nosotros te lo compramos HOY.</span>
        </h3>
        
        <p class="text-xl text-slate-600 max-w-3xl mx-auto mb-10 leading-relaxed">
          Compramos tu lote al contado. <strong>¡Incluso si no tiene los papeles al día o no está saneado!</strong>. Evita meses de estrés, nosotros nos encargamos de todo.
        </p>

        <a href="https://wa.me/1234567890" class="inline-flex items-center justify-center gap-3 px-10 py-5 bg-[var(--color-brand-gold)] hover:bg-yellow-500 text-slate-900 text-xl font-black rounded-xl transition-all shadow-[0_10px_30px_rgba(212,175,55,0.4)] hover:scale-105 hover:shadow-[0_15px_40px_rgba(212,175,55,0.6)]">
          Vender mi terreno ahora <ArrowRight class="w-6 h-6" />
        </a>
      </div>
    </div>
  </section>

  <SocialAndLocations />

  <!-- Footer -->
  <footer class="bg-slate-900 text-white pt-20 pb-10 border-t-[6px] border-[var(--color-brand-green)]">
    <div class="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-12 mb-16">
      <div>
        <div class="flex items-center gap-3 mb-6">
          <div class="w-12 h-12 rounded-full overflow-hidden bg-white shadow-[0_0_15px_rgba(255,255,255,0.2)]">
            <img loading="lazy" decoding="async" src={logoCasaLegal} alt="Casa Legal" class="w-full h-full object-cover" />
          </div>
          <h4 class="text-2xl font-black text-white">CASA <span class="text-[var(--color-brand-gold)]">LEGAL</span></h4>
        </div>
        <p class="text-slate-400 text-sm leading-relaxed mb-6">
          Somos la inmobiliaria líder en desarrollo urbano. Brindamos seguridad jurídica y rentabilidad en cada una de tus inversiones inmobiliarias. Tu futuro empieza aquí.
        </p>
      </div>

      <div>
        <h4 class="text-lg font-bold mb-6 text-white uppercase tracking-wider">Enlaces Rápidos</h4>
        <ul class="space-y-4 text-slate-400 font-medium">
          <li><button onclick={() => scrollToSection('inicio')} class="hover:text-[var(--color-brand-gold)] transition-colors">Inicio</button></li>
          <li><button onclick={() => scrollToSection('premium')} class="hover:text-[var(--color-brand-gold)] transition-colors">Lotes Premium</button></li>
          <li><button onclick={() => scrollToSection('proyectos')} class="hover:text-[var(--color-brand-gold)] transition-colors">Ver Proyectos</button></li>
        </ul>
      </div>

      <div>
        <h4 class="text-lg font-bold mb-6 text-white uppercase tracking-wider">Únete al Éxito</h4>
        <p class="text-slate-400 text-sm mb-6">Contáctanos ahora y descubre por qué todos están invirtiendo con nosotros.</p>
        <div class="flex gap-4">
          <a href="https://facebook.com" target="_blank" aria-label="Facebook" class="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center hover:bg-[#1877F2] hover:text-white transition-colors">
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path fill-rule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clip-rule="evenodd" /></svg>
          </a>
          <a href="https://instagram.com" target="_blank" aria-label="Instagram" class="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center hover:bg-[#E4405F] hover:text-white transition-colors">
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path fill-rule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.476 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clip-rule="evenodd" /></svg>
          </a>
        </div>
      </div>
    </div>
  </footer>
</div>

<style>
  @keyframes bounce-slow {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-10px); }
  }
  .animate-bounce-slow { animation: bounce-slow 3s infinite ease-in-out; }
  
  @keyframes pulse-fast {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.8; transform: scale(0.98); }
  }
  .animate-pulse-fast { animation: pulse-fast 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite; }

  @keyframes zoom-in {
    0% { transform: scale(1); }
    100% { transform: scale(1.15); }
  }
  .animate-zoom-in { animation: zoom-in 3s ease-out forwards; }

  @keyframes spin-slow {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
  .animate-spin-slow { animation: spin-slow 3s linear infinite; }

  @keyframes fade-up {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .animate-fade-up { animation: fade-up 0.8s ease-out forwards; }
  .animate-fade-up-delay { animation: fade-up 0.8s ease-out 0.4s forwards; opacity: 0; }
</style>

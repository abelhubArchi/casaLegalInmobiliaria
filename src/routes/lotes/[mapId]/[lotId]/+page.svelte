<script lang="ts">
  import { page } from '$app/stores';
  import { onMount } from 'svelte';
  import { getMapById } from '$lib/firebase/db';
  import { ChevronLeft, TrendingUp, Users, MessageCircle, Ruler, Compass, CheckCircle2, Home, ArrowRight, Eye, ShieldCheck, MapPin, Image as ImageIcon } from 'lucide-svelte';
  import { fade, fly } from 'svelte/transition';
  import SplashScreen from '$lib/components/public/SplashScreen.svelte';

  const { mapId, lotId } = $page.params;

  let mapData: any = $state(null);
  let lot: any = $state(null);
  let loading = $state(true);
  
  // Intersection Observer State
  let visibleElements = $state<Set<string>>(new Set());

  // Neuromarketing
  let viewersCount = $state(0);
  let projectedValue = $state(0);
  let timeRemaining = $state({ hours: 47, minutes: 59, seconds: 59 });

  // Gallery tabs
  let activeTab = $state('ground');

  onMount(async () => {
    mapData = await getMapById(mapId);
    if (mapData) {
      lot = mapData.lots?.find((l: any) => l.id === lotId);
      
      if (lot) {
        const seed = lot.id.charCodeAt(lot.id.length - 1) || 0;
        viewersCount = (seed % 15) + 12;
        projectedValue = (lot.price || 50000) * 1.35;
      }
    }
    loading = false;

    const timer = setInterval(() => {
      if (timeRemaining.seconds > 0) {
        timeRemaining.seconds--;
      } else {
        timeRemaining.seconds = 59;
        if (timeRemaining.minutes > 0) {
          timeRemaining.minutes--;
        } else {
          timeRemaining.minutes = 59;
          timeRemaining.hours--;
        }
      }
    }, 1000);

    return () => clearInterval(timer);
  });

  function observeNode(node: HTMLElement, id: string) {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        visibleElements.add(id);
        visibleElements = new Set(visibleElements);
        observer.unobserve(node);
      }
    }, { threshold: 0.15 });
    observer.observe(node);
    return {
      destroy() { observer.disconnect(); }
    };
  }

  function formatCurrency(amount: number) {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(amount || 0);
  }

  function handleWhatsApp() {
    if (!lot || !mapData) return;
    const message = encodeURIComponent(`Hola, estoy interesado en el Lote ${lot.code || lot.id} del proyecto ${mapData.title}. Por favor, necesito más información para asegurar mi compra.`);
    window.open(`https://wa.me/1234567890?text=${message}`, '_blank');
  }

  function getTabImages() {
    if (!lot || !lot.images) return [];
    if (activeTab === 'ground') return [...(lot.images.hero || []), ...(lot.images.ground || [])];
    if (activeTab === 'environment') return lot.images.environment || [];
    if (activeTab === 'technical') return lot.images.technical || [];
    return [];
  }

  let currentImages = $derived(getTabImages());
</script>

<svelte:head>
  <title>{lot ? `Lote ${lot.code || lot.id}` : 'Lote Exclusivo'} | Casa Legal</title>
  <meta name="description" content={lot?.description || `Descubre los detalles del Lote ${lot?.code || ''} en el proyecto ${mapData?.title || ''}. Asegura tu futuro con Casa Legal Inmobiliaria.`} />
  <meta property="og:title" content={`${lot ? `Lote ${lot.code || lot.id}` : 'Lote Exclusivo'} | Casa Legal`} />
  <meta property="og:description" content={lot?.description || "Asegura tu inversión con este excelente lote. ¡La oportunidad que estabas buscando!"} />
  <meta property="og:image" content={lot?.images?.hero?.[0] || 'https://casalegal.com/default-lot.jpg'} />
  <meta property="og:type" content="product" />
</svelte:head>

<SplashScreen isVisible={loading} message="Preparando detalles del lote..." />

{#if !loading && lot}
  <div class="bg-slate-50 min-h-screen text-slate-900 font-sans overflow-x-hidden selection:bg-[var(--color-brand-gold)] selection:text-white">
    
    <!-- Urgent Banner -->
    <div class="fixed top-0 left-0 right-0 z-50 bg-[var(--color-brand-gold)] text-[var(--color-brand-green-dark)] py-2 px-4 text-center text-xs font-bold flex items-center justify-center gap-2 shadow-md">
      <Eye class="w-4 h-4" />
      <span>Alta Demanda: {viewersCount} familias viendo esta propiedad.</span>
    </div>

    <!-- Sticky Nav -->
    <nav class="fixed top-8 left-0 right-0 h-16 bg-white/90 backdrop-blur-md border-b border-slate-200 z-40 flex items-center justify-between px-4 md:px-8 transition-all shadow-sm">
      <div class="flex items-center gap-4">
        <a href={`/plano/${mapId}`} class="p-2 -ml-2 text-[var(--color-brand-green)] hover:bg-green-50 rounded-full transition-colors">
          <ChevronLeft class="w-6 h-6" />
        </a>
        <div class="flex flex-col">
          <span class="text-[10px] uppercase tracking-[0.2em] text-[var(--color-brand-gold)] font-bold">{mapData?.title}</span>
          <span class="font-bold text-lg leading-tight text-[var(--color-brand-green-dark)]">{lot.code || `Lote ${lot.id}`}</span>
        </div>
      </div>
      <button 
        onclick={handleWhatsApp}
        class="bg-[var(--color-brand-green)] hover:bg-[var(--color-brand-green-dark)] text-white px-6 py-2 rounded-lg text-sm font-bold uppercase tracking-wider transition-all shadow-md"
      >
        Me Interesa
      </button>
    </nav>

    <!-- Elegant Hero -->
    <section class="relative h-[70vh] w-full flex items-end justify-start overflow-hidden pt-24 mt-8">
      <div class="absolute inset-0 z-0 bg-slate-200">
        <img 
          src={lot.images?.hero?.[0] || 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=2000'} 
          alt="Vista Principal" 
          class="w-full h-full object-cover scale-105 animate-[slow-zoom_20s_ease-in-out_infinite_alternate]"
        />
        <div class="absolute inset-0 bg-gradient-to-t from-[var(--color-brand-green-dark)]/90 via-black/40 to-transparent"></div>
      </div>
      
      <div class="relative z-10 p-8 md:p-16 max-w-6xl mx-auto w-full">
        <div in:fly={{ y: 20, duration: 1000, delay: 300 }} class="inline-flex items-center gap-2 px-4 py-1.5 bg-[var(--color-brand-gold)] text-[var(--color-brand-green-dark)] rounded-full mb-4 text-xs font-bold tracking-widest uppercase shadow-lg">
          {#if lot.status === 'sold'}
            Vendido
          {:else if lot.status === 'reserved'}
            Reservado
          {:else}
            Disponible
          {/if}
        </div>
        <h1 in:fly={{ y: 30, duration: 1000, delay: 500 }} class="text-4xl md:text-6xl font-black tracking-tight mb-2 text-white">
          {lot.code || `Lote ${lot.id}`}
        </h1>
        <p in:fly={{ y: 20, duration: 1000, delay: 700 }} class="text-lg md:text-xl text-gray-200 font-medium max-w-2xl flex items-center gap-2">
          <MapPin class="w-5 h-5 text-[var(--color-brand-gold)]" /> Proyecto {mapData?.title}
        </p>
      </div>
    </section>

    <!-- Specs Data Grid -->
    <section class="py-16 bg-white relative border-b border-slate-100 shadow-sm z-20 -mt-8 mx-4 md:mx-16 rounded-2xl">
      <div class="grid grid-cols-2 md:grid-cols-4 gap-8 px-8">
        <div class="flex flex-col items-center text-center">
          <Ruler class="w-8 h-8 text-[var(--color-brand-green)] mb-3" />
          <p class="text-sm text-slate-500 uppercase tracking-wider font-semibold mb-1">Superficie</p>
          <h3 class="text-2xl font-black text-slate-900">{lot.area_m2 || 'N/A'} <span class="text-lg text-slate-500">m²</span></h3>
        </div>
        
        <div class="flex flex-col items-center text-center border-l border-slate-100">
          <Compass class="w-8 h-8 text-[var(--color-brand-green)] mb-3" />
          <p class="text-sm text-slate-500 uppercase tracking-wider font-semibold mb-1">Orientación</p>
          <h3 class="text-2xl font-black text-slate-900">{lot.orientation || 'N/A'}</h3>
        </div>

        <div class="flex flex-col items-center text-center border-l border-slate-100">
          <CheckCircle2 class="w-8 h-8 text-[var(--color-brand-green)] mb-3" />
          <p class="text-sm text-slate-500 uppercase tracking-wider font-semibold mb-1">Estado</p>
          <h3 class="text-2xl font-black text-slate-900 capitalize">{lot.status === 'available' ? 'Disponible' : lot.status}</h3>
        </div>

        <div class="flex flex-col items-center text-center border-l border-slate-100">
          <ShieldCheck class="w-8 h-8 text-[var(--color-brand-gold)] mb-3" />
          <p class="text-sm text-slate-500 uppercase tracking-wider font-semibold mb-1">Inversión (Contado)</p>
          <h3 class="text-2xl font-black text-[var(--color-brand-green-dark)]">{formatCurrency(lot.price)}</h3>
        </div>
      </div>
    </section>

    <!-- Descripción y Características -->
    <section class="py-20 bg-slate-50">
      <div class="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-16">
        <div use:observeNode={'desc'} class="transition-all duration-1000 {visibleElements.has('desc') ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'}">
          <h3 class="text-3xl font-extrabold text-[var(--color-brand-green-dark)] mb-6">Detalles del Inmueble</h3>
          <div class="prose prose-lg text-slate-600 leading-relaxed">
            {#if lot.description}
              <p>{lot.description}</p>
            {:else}
              <p>Este terreno ofrece una ubicación estratégica dentro del proyecto {mapData?.title}. Diseñado para maximizar la comodidad y la seguridad de su familia, garantizando al mismo tiempo una excelente proyección de crecimiento.</p>
            {/if}
          </div>
        </div>

        <div use:observeNode={'feat'} class="bg-white p-8 rounded-2xl shadow-lg border border-slate-100 transition-all duration-1000 delay-200 {visibleElements.has('feat') ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'}">
          <h3 class="text-xl font-bold text-slate-900 mb-6 border-b border-slate-100 pb-4">Checklist de Valor</h3>
          <ul class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {#if lot.features && lot.features.length > 0}
              {#each lot.features as feature}
                <li class="flex items-center gap-3">
                  <div class="p-1.5 bg-[var(--color-brand-green)]/10 rounded-full shrink-0">
                    <CheckCircle2 class="w-5 h-5 text-[var(--color-brand-green)]" />
                  </div>
                  <span class="font-medium text-slate-700">{feature}</span>
                </li>
              {/each}
            {:else}
              <li class="text-slate-500 italic">No hay características específicas registradas.</li>
            {/if}
          </ul>
        </div>
      </div>
    </section>

    <!-- Galería de Imágenes (Tabs) -->
    <section class="py-24 bg-white border-t border-slate-200">
      <div class="max-w-6xl mx-auto px-6">
        <div use:observeNode={'gallery'} class="text-center mb-12 transition-all duration-1000 {visibleElements.has('gallery') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}">
          <h3 class="text-3xl font-extrabold text-[var(--color-brand-green-dark)] mb-4">Galería de Imágenes</h3>
          <p class="text-slate-600">Explora todos los ángulos, el entorno y los detalles técnicos de tu futura propiedad.</p>
        </div>

        <div class="flex justify-center gap-4 mb-8 overflow-x-auto pb-4 scrollbar-hide">
          <button 
            class="px-6 py-2.5 rounded-full font-bold text-sm transition-all {activeTab === 'ground' ? 'bg-[var(--color-brand-green)] text-white shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}"
            onclick={() => activeTab = 'ground'}
          >
            Terreno & Nivel de Suelo
          </button>
          <button 
            class="px-6 py-2.5 rounded-full font-bold text-sm transition-all {activeTab === 'environment' ? 'bg-[var(--color-brand-green)] text-white shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}"
            onclick={() => activeTab = 'environment'}
          >
            Entorno y Accesos
          </button>
          <button 
            class="px-6 py-2.5 rounded-full font-bold text-sm transition-all {activeTab === 'technical' ? 'bg-[var(--color-brand-green)] text-white shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}"
            onclick={() => activeTab = 'technical'}
          >
            Planos Técnicos
          </button>
        </div>

        {#if currentImages.length > 0}
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {#each currentImages as img, i}
              <div class="aspect-square rounded-2xl overflow-hidden bg-slate-100 shadow-md group border border-slate-200">
                <img src={img} alt="Vista {activeTab}" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
              </div>
            {/each}
          </div>
        {:else}
          <div class="py-16 bg-slate-50 rounded-3xl border border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-400">
            <ImageIcon class="w-16 h-16 mb-4 opacity-50" />
            <p>No hay imágenes disponibles para esta categoría.</p>
          </div>
        {/if}
      </div>
    </section>

    <!-- Dream Home Vision (Proyección) -->
    <section class="py-24 bg-[var(--color-brand-green-dark)] relative overflow-hidden">
      <!-- Decorative circles -->
      <div class="absolute -right-20 -top-20 w-96 h-96 bg-gradient-to-bl from-[var(--color-brand-gold)]/20 to-transparent rounded-full"></div>
      
      <div class="max-w-6xl mx-auto px-6">
        <div class="flex flex-col lg:flex-row items-center gap-16">
          <div use:observeNode={'dream-text'} class="lg:w-1/2 text-white transition-all duration-1000 {visibleElements.has('dream-text') ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'}">
            <h2 class="text-4xl md:text-5xl font-black mb-6 leading-tight">Proyecta la vida <br/><span class="text-[var(--color-brand-gold)]">de tus sueños.</span></h2>
            <p class="text-lg text-green-100/80 leading-relaxed mb-8">
              Este lote está diseñado para albergar construcciones modernas y confortables. Cuenta con topografía favorable y acceso directo a servicios, lo que reducirá tus costos de construcción.
            </p>
            <button onclick={handleWhatsApp} class="inline-flex items-center gap-3 bg-white text-[var(--color-brand-green-dark)] px-8 py-4 rounded-xl font-bold hover:bg-[var(--color-brand-gold)] transition-all shadow-xl">
              <Home class="w-5 h-5" /> Consultar Proyectos Sugeridos
            </button>
          </div>
          <div use:observeNode={'dream-img'} class="lg:w-1/2 w-full transition-all duration-1000 delay-300 {visibleElements.has('dream-img') ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'}">
            <div class="relative rounded-3xl overflow-hidden shadow-2xl border border-white/20 aspect-[4/3]">
              <img src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=1200" alt="Casa Moderna Ejemplo" class="w-full h-full object-cover" />
              <div class="absolute bottom-6 left-6 right-6 bg-black/60 backdrop-blur-md p-4 rounded-xl border border-white/10 text-white flex items-center justify-between">
                <div>
                  <p class="font-bold">Referencia Arquitectónica</p>
                  <p class="text-xs text-gray-300">Construcción sugerida para {lot.area_m2}m²</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Neuromarketing: Plusvalia (Investment Growth) -->
    <section class="py-24 bg-white relative border-b border-slate-200">
      <div class="max-w-5xl mx-auto px-6 text-center">
        <div use:observeNode={'plus-title'} class="transition-all duration-1000 {visibleElements.has('plus-title') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}">
          <TrendingUp class="w-16 h-16 text-[var(--color-brand-gold)] mx-auto mb-6" />
          <h2 class="text-4xl md:text-5xl font-black mb-6 text-slate-900">Multiplica tu <span class="text-[var(--color-brand-green)]">Inversión.</span></h2>
          <p class="text-lg text-slate-600 max-w-2xl mx-auto mb-16">Asegura tu dinero en bienes raíces. Esta zona cuenta con alto potencial de desarrollo, lo que garantiza el crecimiento de tu capital año tras año.</p>
        </div>

        <div class="flex flex-col md:flex-row items-center justify-center gap-6">
          <div use:observeNode={'val-hoy'} class="w-full md:w-5/12 bg-slate-50 p-8 rounded-3xl border border-slate-200 transition-all duration-700 {visibleElements.has('val-hoy') ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}">
            <p class="text-slate-500 text-sm uppercase tracking-widest font-bold mb-4">Inversión Inicial</p>
            <p class="text-4xl font-black text-[var(--color-brand-green-dark)]">{formatCurrency(lot.price || 50000)}</p>
          </div>
          
          <div use:observeNode={'val-arrow'} class="hidden md:flex items-center justify-center w-12 transition-all duration-1000 delay-300 {visibleElements.has('val-arrow') ? 'opacity-100' : 'opacity-0'}">
            <div class="w-full h-1 bg-gradient-to-r from-slate-200 to-[var(--color-brand-gold)]"></div>
          </div>

          <div use:observeNode={'val-futuro'} class="w-full md:w-5/12 bg-gradient-to-br from-[var(--color-brand-green)] to-[var(--color-brand-green-dark)] p-10 rounded-3xl border border-[var(--color-brand-green)] shadow-xl relative overflow-hidden transition-all duration-700 delay-500 {visibleElements.has('val-futuro') ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}">
            <p class="text-green-100/80 text-sm uppercase tracking-widest font-bold mb-4">Proyección a 3 años</p>
            <p class="text-5xl font-black text-white mb-2">{formatCurrency(projectedValue)}</p>
            <div class="inline-block px-3 py-1 bg-[var(--color-brand-gold)] text-[var(--color-brand-green-dark)] text-xs font-black rounded-full mt-2">
              +35% Rentabilidad Estimada
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Bottom Action Area -->
    <section class="py-24 bg-slate-50 text-center relative overflow-hidden">
      <div use:observeNode={'cta'} class="max-w-4xl mx-auto px-6 relative z-10 transition-all duration-1000 {visibleElements.has('cta') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}">
        <h2 class="text-4xl md:text-5xl font-black mb-6 text-slate-900">Un paso más hacia tu nuevo patrimonio.</h2>
        <p class="text-xl text-slate-600 mb-10 max-w-2xl mx-auto">La tierra se agota, las oportunidades también. Protege el futuro de tu familia separando este lote hoy con un pago mínimo inicial.</p>
        
        <button 
          onclick={handleWhatsApp}
          class="inline-flex items-center justify-center gap-3 bg-[var(--color-brand-gold)] text-[var(--color-brand-green-dark)] px-10 py-5 rounded-full text-xl font-black hover:scale-105 hover:bg-yellow-500 transition-all shadow-xl"
        >
          <MessageCircle class="w-7 h-7" /> Contactar a un Asesor
        </button>
      </div>
    </section>
    
  </div>
{/if}

<style>
  @keyframes slow-zoom {
    0% { transform: scale(1); }
    100% { transform: scale(1.1); }
  }
  .scrollbar-hide::-webkit-scrollbar { display: none; }
  .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
</style>

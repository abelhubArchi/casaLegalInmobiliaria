<script lang="ts">
  import { onMount } from 'svelte';
  import { fade, fly, slide } from 'svelte/transition';
  import { user } from '$lib/firebase/auth';
  import { getPageContent, savePageContent, getNews } from '$lib/firebase/db';
  import FundacionSplashScreen from '$lib/components/public/FundacionSplashScreen.svelte';
  import { 
    Scale, Users, Briefcase, Building, ChevronDown, CheckCircle2, 
    MapPin, Phone, Clock, ArrowRight, Save, FileText, Shield, Award, Star
  } from 'lucide-svelte';
  import SocialAndLocations from '$lib/components/public/SocialAndLocations.svelte';

  // State
  let showSplash = $state(true);
  let mounted = $state(false);
  let activeAccordion = $state<number | null>(null);
  let scrollY = $state(0);
  let newsList = $state<any[]>([]);
  
  // Auth & Admin
  let isAdmin = $derived(!!$user);
  let isSaving = $state(false);
  let showSaveSuccess = $state(false);

  // Content Data (Editable via Firestore)
  let content = $state({
    heroBgUrl: "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?q=80&w=2000&auto=format&fit=crop",
    heroTitlePart1: "Recupera tu ",
    heroTitlePart2: "tranquilidad",
    heroDesc: "Asesoría legal gratuita, ética y transparente. Nuestro equipo de expertos está listo para acompañarte en cada paso de tus trámites civiles, familiares y laborales sin costos ocultos.",
    
    servicesSubtitle: "Especialidades",
    servicesTitle: "Áreas de Enfoque",
    servicesDesc: "Soluciones legales precisas para proteger tu patrimonio y tu familia.",
    services: [
        { icon: "Users", title: "Derecho Familiar", desc: "Divorcios, asistencia familiar y custodia con sensibilidad y firmeza." },
        { icon: "Scale", title: "Defensa Civil", desc: "Elaboración de contratos, desalojos y resolución de conflictos de propiedad." },
        { icon: "Briefcase", title: "Derecho Laboral", desc: "Protección contra despidos injustificados y cálculo exacto de tus beneficios." },
        { icon: "Building", title: "Derechos Reales", desc: "Saneamiento de propiedades, folios reales y registro público sin trabas." },
        { icon: "CheckCircle2", title: "Mediación", desc: "Resolución rápida de conflictos mediante acuerdos extrajudiciales efectivos." },
        { icon: "FileText", title: "Trámites Notariales", desc: "Asesoría en testamentos, poderes y certificaciones legales urgentes." }
    ],

    teamSubtitle: "Autoridad Legal",
    teamTitle: "Nuestro Equipo de Expertos",
    teamDesc: "Liderados por el Dr. Hugo Santos, nuestro equipo garantiza la mejor defensa.",
    ceo: { name: "Dr. Hugo Santos", role: "Fundador & CEO", desc: "Con una impecable trayectoria judicial, lidera la Fundación Casa Legal con el compromiso de brindar justicia ética y accesible a quienes más lo necesitan.", img: "/src/lib/assets/perfiles/1.jpeg" },
    staff: [
        { name: "Dra. Ana López", role: "Abogada Especialista", desc: "Experta en trámites registrales y saneamiento de propiedades.", img: "/src/lib/assets/perfiles/2.jpeg" },
        { name: "Dr. Carlos Rojas", role: "Abogado Senior", desc: "Asesoría integral en derecho civil y mediación de conflictos.", img: "/src/lib/assets/perfiles/3.jpeg" },
        { name: "Dra. María Vaca", role: "Asesora Legal", desc: "Especializada en defensa familiar y protección de menores.", img: "/src/lib/assets/perfiles/4.jpeg" },
        { name: "Dr. Luis Silva", role: "Abogado Asociado", desc: "Especialista en derecho laboral y procesos corporativos.", img: "/src/lib/assets/perfiles/5.jpeg" }
    ],

    locationsSubtitle: "Sedes",
    locationsTitle: "Nuestras Oficinas",
    locationsDesc: "Visítanos para una atención presencial, confidencial y personalizada.",
    locations: [
        { name: "Sede Central", address: "Av. Principal 123, Edificio Torre Legal, Piso 4. Santa Cruz de la Sierra." },
        { name: "Sede Norte", address: "Av. Banzer Km 5, Plaza Comercial, Local 12. Santa Cruz de la Sierra." },
        { name: "Sede Sur", address: "Av. Santos Dumont, 3er Anillo Interno. Santa Cruz de la Sierra." }
    ],

    faqSubtitle: "Transparencia Total",
    faqTitle: "Preguntas Frecuentes",
    faqs: [
        { q: '¿La asesoría realmente es gratuita?', a: 'Completamente. Nuestro primer análisis y orientación no tiene costo. Queremos democratizar la justicia.' },
        { q: '¿Hay costos ocultos a futuro?', a: 'Cero costos ocultos. Si tu caso requiere representación formal, te explicaremos con total transparencia las opciones.' },
        { q: '¿Qué casos no atienden?', a: 'No brindamos patrocinio en procesos Penales. Nos enfocamos estrictamente en áreas Civiles, Familiares y Laborales.' },
        { q: '¿Cuánto tardan los trámites inmobiliarios?', a: 'Depende de la alcaldía y DD.RR., pero gracias a nuestra experiencia, reducimos los tiempos a la mitad del promedio habitual.' }
    ]
  });

  onMount(async () => {
    try {
      const [savedContent, fetchedNews] = await Promise.all([
        getPageContent('fundacion'),
        getNews()
      ]);
      
      if (savedContent) {
        content = { ...content, ...savedContent };
      }
      if (fetchedNews) {
        newsList = fetchedNews.slice(0, 3);
      }
    } catch (e) {
      console.error("Error loading fundacion content", e);
    }
    
    setTimeout(() => {
      showSplash = false;
      mounted = true;
    }, 1200);
  });

  async function handleSave() {
    if (!isAdmin) return;
    isSaving = true;
    try {
      await savePageContent('fundacion', $state.snapshot(content));
      showSaveSuccess = true;
      setTimeout(() => showSaveSuccess = false, 3000);
    } catch (e) {
      console.error(e);
      alert("Error al guardar el contenido.");
    } finally {
      isSaving = false;
    }
  }

  function toggleAccordion(index: number) {
    activeAccordion = activeAccordion === index ? null : index;
  }

  function handleCreateNews() {
    if (!isAdmin) return;
    const slugInput = prompt("Ingresa el título corto para el enlace de la noticia (ej. nuevo-convenio-2026):");
    if (slugInput) {
        const slug = slugInput.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-');
        window.location.href = `/fundacion/noticias/${slug}`;
    }
  }

  // Animation Action for Scroll
  function appearOnScroll(node: HTMLElement, delay: number = 0) {
    node.classList.add('opacity-0', 'translate-y-10', 'transition-all', 'duration-[1200ms]');
    if (delay) {
        node.style.transitionDelay = `${delay}ms`;
    }
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          node.classList.remove('opacity-0', 'translate-y-10');
          node.classList.add('opacity-100', 'translate-y-0');
          observer.unobserve(node);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
    
    observer.observe(node);
    
    return {
      destroy() {
        observer.disconnect();
      }
    };
  }
</script>

<svelte:window bind:scrollY />

<svelte:head>
  <title>Fundación Casa Legal | Asesoría Gratuita</title>
  <meta name="description" content="Fundación Casa Legal. Asesoría legal gratuita e integral." />
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@500;700&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap" rel="stylesheet">
</svelte:head>

<FundacionSplashScreen isVisible={showSplash} />

<!-- Admin Save Button -->
{#if isAdmin && mounted}
  <div class="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">
    {#if showSaveSuccess}
      <div in:fade out:fade class="bg-green-500 text-white px-4 py-2 rounded-lg font-bold shadow-lg">¡Guardado Exitosamente!</div>
    {/if}
    <button onclick={handleSave} disabled={isSaving} class="bg-[#1E4633] hover:bg-[#0E1C14] text-white px-6 py-3 rounded-full font-bold shadow-xl hover:scale-105 transition-all flex items-center gap-2 disabled:opacity-50 border-2 border-[#C5A059]">
      <Save class="w-5 h-5" />
      {isSaving ? 'Guardando...' : 'Guardar Cambios (Admin)'}
    </button>
  </div>
{/if}

<div class="bg-white text-gray-800 font-sans selection:bg-[#C5A059] selection:text-white relative overflow-x-hidden min-h-screen">
    <!-- Navbar -->
    <header class="fixed top-0 w-full z-40 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm transition-all duration-300">
        <div class="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
            <a href="#inicio" class="flex items-center gap-3 group">
                <div class="w-12 h-12 bg-white border border-[#C5A059] rounded-xl p-1 flex items-center justify-center shadow-sm group-hover:scale-105 transition-all overflow-hidden">
                    <img src="/src/lib/assets/fundacion/fundacionlogo.jpeg" alt="Logo" class="w-full h-full object-cover rounded-lg" />
                </div>
                <div class="flex flex-col">
                    <span class="font-serif font-bold text-xl text-[#0E1C14] tracking-widest leading-none" style="font-family: 'Cinzel', serif;">CASA LEGAL</span>
                    <span class="text-[10px] text-[#C5A059] tracking-[0.3em] font-black uppercase mt-1">Fundación</span>
                </div>
            </a>
            
            <nav class="hidden lg:flex items-center gap-4 text-xs font-bold text-gray-600 uppercase tracking-wider">
                <a href="#inicio" class="hover:text-[#C5A059] transition-all">Inicio</a>
                <a href="#servicios" class="hover:text-[#C5A059] transition-all">Áreas</a>
                <a href="#equipo" class="hover:text-[#C5A059] transition-all">Equipo</a>
                <a href="#noticias" class="hover:text-[#C5A059] transition-all">Noticias</a>
                <a href="#faq" class="hover:text-[#C5A059] transition-all">Preguntas</a>
            </nav>
            
            <a href="https://wa.me/59179607574" target="_blank" rel="noopener noreferrer" class="flex items-center gap-2 bg-[#1E4633] text-white px-5 py-2.5 rounded-full font-bold text-xs tracking-wider uppercase shadow-lg hover:bg-[#0E1C14] hover:shadow-xl hover:scale-105 transition-all">
                <Phone class="w-4 h-4 text-[#C5A059]" />
                <span>Asesoría Gratis</span>
            </a>
        </div>
    </header>

    <!-- Global Animated Background -->
    <div class="fixed inset-0 z-[-1] bg-gray-50 overflow-hidden pointer-events-none">
        <div class="absolute inset-0 opacity-[0.15]" style="background-image: radial-gradient(#C5A059 2px, transparent 2px); background-size: 40px 40px; animation: moveDots 60s linear infinite;"></div>
        <!-- Floating elegant orbs -->
        <div class="absolute top-[20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-[#C5A059]/10 blur-[120px] animate-pulse" style="animation-duration: 8s;"></div>
        <div class="absolute bottom-[10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-[#1E4633]/10 blur-[150px] animate-pulse" style="animation-duration: 12s; animation-delay: 2s;"></div>
    </div>

    {#if mounted}
    <!-- Hero Section with Background Video/Image -->
    <section id="inicio" class="relative min-h-screen flex items-center pt-28 pb-16 px-6 overflow-hidden group/hero">
        {#if content.heroBgUrl.endsWith('.mp4')}
            <video autoplay loop muted playsinline class="absolute inset-0 w-full h-[120%] object-cover z-0 filter brightness-[0.9] saturate-50" style="transform: translateY({scrollY * 0.4}px);">
                <source src={content.heroBgUrl} type="video/mp4" />
            </video>
        {:else}
            <div class="absolute inset-0 w-full h-[120%] z-0 filter brightness-[0.9] saturate-50" style="background-image: url('{content.heroBgUrl}'); background-size: cover; background-position: center; transform: translateY({scrollY * 0.4}px);"></div>
        {/if}

        {#if isAdmin}
            <button onclick={() => { const newUrl = prompt('Ingresa la URL del nuevo fondo (video .mp4 o imagen):', content.heroBgUrl); if (newUrl) content.heroBgUrl = newUrl; }} class="absolute top-24 right-6 z-50 bg-[#1E4633] text-white text-xs font-bold px-4 py-2 rounded-lg opacity-0 group-hover/hero:opacity-100 transition-opacity backdrop-blur-sm border border-[#C5A059]">
                Cambiar Fondo (Admin)
            </button>
        {/if}

        <!-- Animated Dots Overlay for Lively Effect -->
        <div class="absolute inset-0 z-0 opacity-20 pointer-events-none mix-blend-overlay" style="background-image: radial-gradient(rgba(197, 160, 89, 0.8) 2px, transparent 2px); background-size: 40px 40px; animation: moveDots 60s linear infinite;"></div>

        <!-- Overlay Gradient for contrast -->
        <div class="absolute inset-0 bg-gradient-to-r from-white/95 via-white/80 to-transparent z-0"></div>
        <div class="absolute inset-0 bg-gradient-to-t from-white via-transparent to-white/30 z-0"></div>
        
        <div class="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
            <div class="lg:col-span-7 space-y-8">
                <div in:fly={{ y: 20, duration: 800, delay: 200 }} class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#1E4633]/10 border border-[#1E4633]/20 text-[#1E4633] text-xs font-black tracking-widest uppercase shadow-sm">
                    <Shield class="w-4 h-4 text-[#C5A059]" />
                    Protección Legal Gratuita
                </div>
                
                <h1 in:fly={{ y: 20, duration: 800, delay: 400 }} class="text-5xl sm:text-7xl text-[#0E1C14] font-bold leading-tight" style="font-family: 'Cinzel', serif;">
                    {#if isAdmin}
                        <span contenteditable="true" bind:textContent={content.heroTitlePart1} class="border-b-2 border-dashed border-[#C5A059] focus:outline-none focus:bg-gray-100 p-1 rounded transition-colors"></span>
                        <span contenteditable="true" bind:textContent={content.heroTitlePart2} class="text-[#C5A059] border-b-2 border-dashed border-[#C5A059] focus:outline-none focus:bg-gray-100 p-1 rounded transition-colors"></span>
                    {:else}
                        <span>{content.heroTitlePart1}</span>
                        <span class="text-[#C5A059]">{content.heroTitlePart2}</span>
                    {/if}
                </h1>
                
                <p in:fly={{ y: 20, duration: 800, delay: 600 }} class="text-gray-600 text-lg sm:text-xl max-w-xl font-medium leading-relaxed">
                    {#if isAdmin}
                        <span contenteditable="true" bind:textContent={content.heroDesc} class="border-b-2 border-dashed border-[#C5A059] focus:outline-none focus:bg-gray-100 p-1 rounded transition-colors block"></span>
                    {:else}
                        <span class="block">{content.heroDesc}</span>
                    {/if}
                </p>
                
                <div in:fly={{ y: 20, duration: 800, delay: 800 }} class="flex flex-wrap gap-4 pt-4">
                    <a href="https://wa.me/59179607574" target="_blank" rel="noopener noreferrer" class="bg-[#1E4633] text-white font-bold px-6 py-3.5 rounded-xl shadow-[0_10px_25px_rgba(30,70,51,0.3)] hover:-translate-y-1 hover:shadow-[0_15px_30px_rgba(30,70,51,0.4)] transition-all flex items-center gap-2 text-sm uppercase tracking-wider">
                        <Phone class="w-4 h-4 text-[#C5A059]" />
                        <span>Consulta Gratis</span>
                    </a>
                    <a href="#equipo" class="bg-white text-[#0E1C14] border border-gray-200 font-bold px-6 py-3.5 rounded-xl shadow-[0_10px_25px_rgba(0,0,0,0.05)] hover:bg-gray-50 hover:-translate-y-1 hover:shadow-[0_15px_30px_rgba(0,0,0,0.08)] transition-all flex items-center gap-2 text-sm uppercase tracking-wider">
                        <Users class="w-4 h-4 text-[#C5A059]" />
                        <span>Nuestro Equipo</span>
                    </a>
                    <a href="#noticias" class="bg-white text-[#0E1C14] border border-gray-200 font-bold px-6 py-3.5 rounded-xl shadow-[0_10px_25px_rgba(0,0,0,0.05)] hover:bg-gray-50 hover:-translate-y-1 hover:shadow-[0_15px_30px_rgba(0,0,0,0.08)] transition-all flex items-center gap-2 text-sm uppercase tracking-wider">
                        <FileText class="w-4 h-4 text-[#C5A059]" />
                        <span>Noticias</span>
                    </a>
                </div>

                <div in:fly={{ fade: true, duration: 1000, delay: 1000 }} class="flex items-center gap-6 text-sm font-bold text-gray-500 pt-4 border-t border-gray-200">
                    <div class="flex items-center gap-2"><CheckCircle2 class="w-5 h-5 text-[#4EBA8A]" /> Trato Ético</div>
                    <div class="flex items-center gap-2"><CheckCircle2 class="w-5 h-5 text-[#4EBA8A]" /> 100% Confidencial</div>
                </div>
            </div>

            <!-- Form Mockup / Social Proof -->
            <div class="lg:col-span-5" in:fly={{ x: 30, duration: 1000, delay: 600 }}>
                <div class="bg-white rounded-3xl p-8 shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-gray-100 relative overflow-hidden">
                    <div class="absolute top-0 right-0 w-32 h-32 bg-[#C5A059]/10 rounded-bl-full pointer-events-none"></div>
                    
                    <div class="mb-6">
                        <div class="flex text-[#C5A059] mb-2">
                            <Star class="w-5 h-5 fill-current" /><Star class="w-5 h-5 fill-current" /><Star class="w-5 h-5 fill-current" /><Star class="w-5 h-5 fill-current" /><Star class="w-5 h-5 fill-current" />
                        </div>
                        <p class="text-gray-700 italic font-medium mb-4">"Pensé que perdería mi terreno, pero gracias a la Fundación Casa Legal hoy tengo mis papeles en orden. Un apoyo invaluable."</p>
                        <p class="text-xs font-bold text-gray-400 uppercase tracking-widest">— Familia Rodríguez</p>
                    </div>

                    <div class="border-t border-gray-100 pt-6">
                        <h3 class="text-lg font-bold text-[#0E1C14] mb-4" style="font-family: 'Cinzel', serif;">Solicita Orientación Directa</h3>
                        <form action="https://wa.me/59179607574" method="get" target="_blank" class="space-y-4">
                            <input type="text" placeholder="Ej. Juan Pérez" required class="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#C5A059] focus:ring-1 focus:ring-[#C5A059] text-sm transition-all">
                            <select class="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-800 focus:outline-none focus:border-[#C5A059] focus:ring-1 focus:ring-[#C5A059] text-sm appearance-none transition-all">
                                <option>Derechos Reales / Terrenos</option>
                                <option>Derecho de Familia</option>
                                <option>Derecho Laboral</option>
                                <option>Derecho Civil</option>
                            </select>
                            <button type="submit" class="w-full bg-[#C5A059] hover:bg-[#b08d4f] text-white font-bold py-3.5 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 text-sm uppercase tracking-wider">
                                <ArrowRight class="w-5 h-5" /> Iniciar Chat
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- Services Section -->
    <section id="servicios" class="py-24 px-6 relative">
        <div class="max-w-7xl mx-auto">
            <div class="text-center mb-20 max-w-2xl mx-auto">
                <span class="text-[#C5A059] text-sm font-bold tracking-widest uppercase block mb-2">
                    {#if isAdmin}
                        <span contenteditable="true" bind:textContent={content.servicesSubtitle} class="border-b-2 border-dashed border-[#C5A059] focus:outline-none focus:bg-gray-100 p-1 rounded transition-colors"></span>
                    {:else}
                        <span>{content.servicesSubtitle}</span>
                    {/if}
                </span>
                <h2 class="text-4xl sm:text-5xl text-[#0E1C14] font-bold mb-4" style="font-family: 'Cinzel', serif;">
                    {#if isAdmin}
                        <span contenteditable="true" bind:textContent={content.servicesTitle} class="border-b-2 border-dashed border-[#C5A059] focus:outline-none focus:bg-gray-100 p-1 rounded transition-colors"></span>
                    {:else}
                        <span>{content.servicesTitle}</span>
                    {/if}
                </h2>
                <p class="text-gray-600 text-lg">
                    {#if isAdmin}
                        <span contenteditable="true" bind:textContent={content.servicesDesc} class="border-b-2 border-dashed border-[#C5A059] focus:outline-none focus:bg-gray-100 p-1 rounded transition-colors block"></span>
                    {:else}
                        <span class="block">{content.servicesDesc}</span>
                    {/if}
                </p>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {#each content.services as service, i}
                <div use:appearOnScroll={i * 100} class="bg-white/60 backdrop-blur-xl border border-white/80 rounded-3xl p-8 hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] hover:-translate-y-2 transition-all duration-300 group">
                    <div class="w-14 h-14 rounded-2xl bg-[#1E4633]/5 text-[#1E4633] flex items-center justify-center mb-6 group-hover:bg-[#1E4633] group-hover:text-[#C5A059] transition-all duration-300">
                        {#if service.icon === 'Users'}<Users class="w-7 h-7" />{/if}
                        {#if service.icon === 'Scale'}<Scale class="w-7 h-7" />{/if}
                        {#if service.icon === 'Briefcase'}<Briefcase class="w-7 h-7" />{/if}
                        {#if service.icon === 'Building'}<Building class="w-7 h-7" />{/if}
                        {#if service.icon === 'CheckCircle2'}<CheckCircle2 class="w-7 h-7" />{/if}
                        {#if service.icon === 'FileText'}<FileText class="w-7 h-7" />{/if}
                    </div>
                    <h3 class="text-xl text-[#0E1C14] font-bold mb-3" style="font-family: 'Cinzel', serif;">
                        {#if isAdmin}
                            <span contenteditable="true" bind:textContent={content.services[i].title} class="border-b-2 border-dashed border-[#C5A059] focus:outline-none focus:bg-gray-100 p-1 rounded transition-colors block"></span>
                        {:else}
                            {service.title}
                        {/if}
                    </h3>
                    <p class="text-gray-600 leading-relaxed font-medium">
                        {#if isAdmin}
                            <span contenteditable="true" bind:textContent={content.services[i].desc} class="border-b-2 border-dashed border-[#C5A059] focus:outline-none focus:bg-gray-100 p-1 rounded transition-colors block"></span>
                        {:else}
                            {service.desc}
                        {/if}
                    </p>
                </div>
                {/each}
            </div>
        </div>
    </section>

    <!-- Authority / Our Team Section -->
    <section id="equipo" class="py-24 px-6 relative">
        <div class="max-w-7xl mx-auto">
            <div class="text-center mb-16 max-w-2xl mx-auto">
                <span class="text-[#C5A059] text-sm font-bold tracking-widest uppercase block mb-2">
                    {#if isAdmin}
                        <span contenteditable="true" bind:textContent={content.teamSubtitle} class="border-b-2 border-dashed border-[#C5A059] focus:outline-none focus:bg-gray-100 p-1 rounded transition-colors"></span>
                    {:else}
                        <span>{content.teamSubtitle}</span>
                    {/if}
                </span>
                <h2 class="text-4xl sm:text-5xl text-[#0E1C14] font-bold mb-4" style="font-family: 'Cinzel', serif;">
                    {#if isAdmin}
                        <span contenteditable="true" bind:textContent={content.teamTitle} class="border-b-2 border-dashed border-[#C5A059] focus:outline-none focus:bg-gray-100 p-1 rounded transition-colors"></span>
                    {:else}
                        <span>{content.teamTitle}</span>
                    {/if}
                </h2>
                <p class="text-gray-600 text-lg">
                    {#if isAdmin}
                        <span contenteditable="true" bind:textContent={content.teamDesc} class="border-b-2 border-dashed border-[#C5A059] focus:outline-none focus:bg-gray-100 p-1 rounded transition-colors block"></span>
                    {:else}
                        <span class="block">{content.teamDesc}</span>
                    {/if}
                </p>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <!-- CEO Card (Large) -->
                <div use:appearOnScroll class="bg-[#1E4633] rounded-3xl overflow-hidden shadow-2xl lg:col-span-2 relative group flex flex-col md:flex-row border border-[#1E4633]">
                    <div class="absolute inset-0 bg-gradient-to-r from-[#0E1C14]/90 to-transparent z-10 hidden md:block pointer-events-none"></div>
                    <div class="absolute inset-0 bg-gradient-to-t from-[#0E1C14]/90 to-transparent z-10 md:hidden pointer-events-none"></div>
                    
                    <div class="w-full md:w-1/2 h-[400px] md:h-auto relative z-0 group/img">
                        <img src={content.ceo.img} alt="CEO" class="w-full h-full object-cover object-top grayscale group-hover/img:grayscale-0 transition-all duration-700" />
                        {#if isAdmin}
                            <button onclick={() => { const newUrl = prompt('Ingresa la URL de la nueva foto del CEO:', content.ceo.img); if (newUrl) content.ceo.img = newUrl; }} class="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity text-white font-bold backdrop-blur-sm z-30">
                                Cambiar Foto
                            </button>
                        {/if}
                    </div>
                    
                    <div class="w-full md:w-1/2 p-10 md:p-16 flex flex-col justify-center relative z-20">
                        <div class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#C5A059]/20 text-[#C5A059] text-xs font-black tracking-widest uppercase mb-6 w-max">
                            <Award class="w-4 h-4" />
                            {#if isAdmin}
                                <span contenteditable="true" bind:textContent={content.ceo.role} class="border-b-2 border-dashed border-[#C5A059] focus:outline-none"></span>
                            {:else}
                                {content.ceo.role}
                            {/if}
                        </div>
                        <h3 class="text-4xl sm:text-5xl text-white font-bold mb-4" style="font-family: 'Cinzel', serif;">
                            {#if isAdmin}
                                <span contenteditable="true" bind:textContent={content.ceo.name} class="border-b-2 border-dashed border-white focus:outline-none block"></span>
                            {:else}
                                {content.ceo.name}
                            {/if}
                        </h3>
                        <p class="text-gray-300 text-lg leading-relaxed mb-8">
                            {#if isAdmin}
                                <span contenteditable="true" bind:textContent={content.ceo.desc} class="border-b-2 border-dashed border-white focus:outline-none block"></span>
                            {:else}
                                {content.ceo.desc}
                            {/if}
                        </p>
                        
                        <a href="https://wa.me/59179607574" class="text-[#C5A059] font-bold text-sm uppercase tracking-widest hover:text-white transition-colors flex items-center gap-2 w-max">
                            Consultar con el Dr. Santos <ArrowRight class="w-4 h-4" />
                        </a>
                    </div>
                </div>

                <!-- Staff Cards -->
                {#each content.staff as member, i}
                <div use:appearOnScroll={i * 150} class="bg-white/60 backdrop-blur-xl border border-white/80 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 group flex flex-col sm:flex-row">
                    <div class="w-full sm:w-2/5 h-64 sm:h-auto relative overflow-hidden bg-gray-100 group/img">
                        <img src={content.staff[i].img} alt={member.name} class="w-full h-full object-cover object-top grayscale opacity-80 group-hover/img:grayscale-0 group-hover/img:opacity-100 transition-all duration-700" />
                        <div class="absolute inset-0 bg-[#1E4633]/20 group-hover/img:bg-transparent transition-colors duration-500 pointer-events-none"></div>
                        {#if isAdmin}
                            <button onclick={() => { const newUrl = prompt('Ingresa la URL de la nueva foto del abogado:', content.staff[i].img); if (newUrl) content.staff[i].img = newUrl; }} class="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity text-white font-bold backdrop-blur-sm z-30">
                                Cambiar
                            </button>
                        {/if}
                    </div>
                    
                    <div class="w-full sm:w-3/5 p-8 flex flex-col justify-center">
                        <span class="text-[#C5A059] text-[10px] font-black tracking-widest uppercase mb-2 block">
                            {#if isAdmin}
                                <span contenteditable="true" bind:textContent={content.staff[i].role} class="border-b border-dashed border-[#C5A059] focus:outline-none"></span>
                            {:else}
                                {member.role}
                            {/if}
                        </span>
                        <h3 class="text-2xl text-[#0E1C14] font-bold mb-3" style="font-family: 'Cinzel', serif;">
                            {#if isAdmin}
                                <span contenteditable="true" bind:textContent={content.staff[i].name} class="border-b border-dashed border-gray-400 focus:outline-none block"></span>
                            {:else}
                                {member.name}
                            {/if}
                        </h3>
                        <p class="text-gray-600 text-sm leading-relaxed font-medium mb-4">
                            {#if isAdmin}
                                <span contenteditable="true" bind:textContent={content.staff[i].desc} class="border-b border-dashed border-gray-400 focus:outline-none block"></span>
                            {:else}
                                {member.desc}
                            {/if}
                        </p>
                        <a href="https://wa.me/59179607574" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-1.5 text-[11px] font-black text-[#C5A059] uppercase tracking-widest hover:text-[#1E4633] transition-colors mt-auto">
                            Consulta Directa <ArrowRight class="w-3 h-3" />
                        </a>
                    </div>
                </div>
                {/each}
            </div>
        </div>
    </section>

    <!-- News Section -->
    <section id="noticias" class="py-24 px-6 relative">
        <div class="max-w-7xl mx-auto">
            <div class="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
                <div class="max-w-2xl">
                    <span class="text-[#C5A059] text-sm font-bold tracking-widest uppercase block mb-2">Actualidad</span>
                    <h2 class="text-4xl sm:text-5xl text-[#0E1C14] font-bold mb-4" style="font-family: 'Cinzel', serif;">Últimas Noticias</h2>
                    <p class="text-gray-600 text-lg">Convenios, cursos y anuncios importantes de la Fundación Casa Legal.</p>
                </div>
                {#if isAdmin}
                    <button onclick={handleCreateNews} class="mt-6 md:mt-0 bg-[#C5A059] hover:bg-[#b08d4f] text-white font-bold py-3 px-6 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 text-sm uppercase tracking-wider hover:-translate-y-1">
                        + Añadir Noticia (Admin)
                    </button>
                {/if}
            </div>
            
            {#if newsList.length === 0}
                <div class="text-center py-12 bg-white rounded-3xl border border-gray-200">
                    <p class="text-gray-500 font-medium">Próximamente publicaremos nuevas actualizaciones.</p>
                </div>
            {:else}
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {#each newsList as item, i}
                        <a href="/fundacion/noticias/{item.id}" use:appearOnScroll={i * 150} class="bg-white/60 backdrop-blur-xl rounded-3xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300 group border border-white/80 flex flex-col">
                            <div class="h-48 overflow-hidden relative">
                                <img src={item.coverImg || "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?q=80&w=800&auto=format&fit=crop"} alt={item.title || "Noticia"} class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                                <div class="absolute inset-0 bg-gradient-to-t from-[#0E1C14]/80 to-transparent"></div>
                                <div class="absolute bottom-4 left-4 text-white font-bold text-[10px] uppercase tracking-widest bg-[#1E4633] px-3 py-1 rounded-full shadow-lg">
                                    {new Date(item.createdAt || Date.now()).toLocaleDateString()}
                                </div>
                            </div>
                            <div class="p-6 flex flex-col flex-grow">
                                <h3 class="text-xl font-bold text-[#0E1C14] mb-3 group-hover:text-[#C5A059] transition-colors" style="font-family: 'Cinzel', serif;">
                                    {item.title || "Sin título"}
                                </h3>
                                <p class="text-gray-600 text-sm leading-relaxed mb-6 flex-grow">
                                    {item.summary || "Haz clic para leer más sobre este anuncio..."}
                                </p>
                                <div class="text-[#C5A059] font-bold text-xs uppercase tracking-widest flex items-center gap-1 mt-auto">
                                    Leer Artículo <ArrowRight class="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                                </div>
                            </div>
                        </a>
                    {/each}
                </div>
            {/if}
        </div>
    </section>

    <!-- Locations & Social Network Section -->
    <SocialAndLocations />

    <!-- FAQ Section -->
    <section id="faq" class="py-24 px-6 max-w-4xl mx-auto border-t border-gray-100">
        <div class="text-center mb-12">
            <span class="text-[#C5A059] text-sm font-bold tracking-widest uppercase block mb-2">
                {#if isAdmin}
                    <span contenteditable="true" bind:textContent={content.faqSubtitle} class="border-b-2 border-dashed border-[#C5A059] focus:outline-none focus:bg-gray-100 p-1 rounded transition-colors"></span>
                {:else}
                    <span>{content.faqSubtitle}</span>
                {/if}
            </span>
            <h2 class="text-3xl sm:text-4xl text-[#0E1C14] font-bold" style="font-family: 'Cinzel', serif;">
                {#if isAdmin}
                    <span contenteditable="true" bind:textContent={content.faqTitle} class="border-b-2 border-dashed border-[#C5A059] focus:outline-none focus:bg-gray-100 p-1 rounded transition-colors"></span>
                {:else}
                    <span>{content.faqTitle}</span>
                {/if}
            </h2>
        </div>

        <div use:appearOnScroll class="bg-white/60 backdrop-blur-xl rounded-3xl p-6 md:p-10 border border-white/80 shadow-[0_20px_50px_rgba(0,0,0,0.05)] space-y-2 relative">
            {#each content.faqs as faq, i}
                <div class="border-b border-gray-100 last:border-0 pb-4 last:pb-0">
                    <button onclick={() => toggleAccordion(i)} class="w-full flex justify-between items-center text-left py-4 font-bold text-[#0E1C14] hover:text-[#C5A059] transition-colors">
                        <span class="text-lg" style="font-family: 'Cinzel', serif;">
                            {#if isAdmin}
                                <span contenteditable="true" bind:textContent={content.faqs[i].q} onclick={(e) => e.stopPropagation()} class="border-b border-dashed border-gray-400 focus:outline-none"></span>
                            {:else}
                                {faq.q}
                            {/if}
                        </span>
                        <ChevronDown class="w-6 h-6 text-[#C5A059] transition-transform duration-300 {activeAccordion === i ? 'rotate-180' : ''}" />
                    </button>
                    {#if activeAccordion === i}
                        <div in:slide out:slide class="pt-2 pb-4 text-gray-600 leading-relaxed font-medium">
                            {#if isAdmin}
                                <span contenteditable="true" bind:textContent={content.faqs[i].a} class="border-b border-dashed border-gray-400 focus:outline-none block w-full p-2 bg-gray-50 rounded"></span>
                            {:else}
                                {faq.a}
                            {/if}
                        </div>
                    {/if}
                </div>
            {/each}
        </div>
    </section>

    <!-- Footer -->
    <footer class="bg-[#09130E] pt-20 pb-12 px-6">
        <div class="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12 mb-16 text-center md:text-left">
            <div>
                <div class="flex items-center gap-3 justify-center md:justify-start mb-6">
                    <div class="w-14 h-14 bg-white border-2 border-[#C5A059] rounded-xl flex items-center justify-center overflow-hidden">
                        <img src="/src/lib/assets/fundacion/fundacionlogo.jpeg" alt="Logo" class="w-full h-full object-cover" />
                    </div>
                    <div>
                        <h4 class="text-2xl font-bold text-white tracking-widest leading-none" style="font-family: 'Cinzel', serif;">CASA LEGAL</h4>
                        <p class="text-[10px] text-[#C5A059] tracking-[0.3em] font-black uppercase mt-1">Fundación</p>
                    </div>
                </div>
                <p class="text-gray-400 text-sm leading-relaxed max-w-xs mx-auto md:mx-0">Transformando vidas a través de la justicia accesible, ética y transparente para todos.</p>
            </div>
            
            <div>
                <h4 class="font-bold text-white mb-6 text-sm tracking-widest uppercase" style="font-family: 'Cinzel', serif;">Contacto Inmediato</h4>
                <ul class="space-y-4 text-sm text-gray-400 flex flex-col items-center md:items-start font-medium">
                    <li class="flex items-center gap-3">
                        <div class="w-10 h-10 rounded-full bg-[#1E4633] flex items-center justify-center text-[#4EBA8A]"><Phone class="w-4 h-4" /></div>
                        <div>Línea Directa<br><strong class="text-white text-base">79607574</strong></div>
                    </li>
                    <li class="flex items-center gap-3">
                        <div class="w-10 h-10 rounded-full bg-[#C5A059]/10 flex items-center justify-center text-[#C5A059]"><Clock class="w-4 h-4" /></div>
                        <div>Horario de Atención<br><strong class="text-white">Lun-Vie (08:30 - 18:30)</strong></div>
                    </li>
                </ul>
            </div>
            
            <div>
                <h4 class="font-bold text-white mb-6 text-sm tracking-widest uppercase" style="font-family: 'Cinzel', serif;">Comunidad Legal</h4>
                <div class="flex items-center justify-center md:justify-start gap-4">
                    <!-- Instagram / Camera -->
                    <a href="#" class="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-[#C5A059] hover:bg-white/10 hover:border-[#C5A059] transition-all">
                        <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
                    </a>
                    <!-- Facebook -->
                    <a href="#" class="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-[#C5A059] hover:bg-white/10 hover:border-[#C5A059] transition-all">
                        <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
                    </a>
                    <!-- TikTok -->
                    <a href="#" class="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-[#C5A059] hover:bg-white/10 hover:border-[#C5A059] transition-all">
                        <svg class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/></svg>
                    </a>
                </div>
            </div>
        </div>
        <div class="max-w-7xl mx-auto border-t border-gray-800 pt-8 text-center text-xs text-gray-500 font-medium">
            &copy; 2026 Fundación Casa Legal. Todos los derechos reservados.
        </div>
    </footer>
    {/if}
</div>

<style>
  :global(html) {
    scroll-behavior: smooth;
  }
  @keyframes moveDots {
    0% { background-position: 0px 0px; }
    100% { background-position: 70px 70px; }
  }
</style>

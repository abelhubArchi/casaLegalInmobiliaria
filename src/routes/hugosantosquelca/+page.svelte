<script>
    import { onMount } from 'svelte';
    import { fade, fly, slide } from 'svelte/transition';
    import { browser } from '$app/environment';
    import gsap from 'gsap';
    import { ScrollTrigger } from 'gsap/ScrollTrigger';
    import { user } from '$lib/firebase/auth';
    import { getPageContent, savePageContent, getHugoNews } from '$lib/firebase/db';
    import SocialAndLocations from '$lib/components/public/SocialAndLocations.svelte';
    import { ArrowRight, BookOpen, GraduationCap, Award, Briefcase, FileText } from 'lucide-svelte';
    
    // assets
    import profileImg from './assets/hugosantosperfil.png';
    import topLogoImg from './assets/hqsantosquelca.png';
    import hqImg from './assets/hq.png';

    let mounted = $state(false);
    let showSplash = $state(true);
    let loading = $state(true);
    let posts = $state([]);
    
    let content = $state({
        biografia: "Un líder visionario comprometido con la excelencia. Descubre la historia, los valores y el recorrido profesional que han forjado una trayectoria de alto impacto.",
        proyectos: "Iniciativas que transforman el entorno. Explora un portafolio exclusivo de desarrollos inmobiliarios y soluciones legales innovadoras.",
        vision: "La verdadera innovación nace en la intersección de la audacia y la precisión legal. Forjamos el futuro del desarrollo urbano garantizando la certeza jurídica en cada paso.",
        
        trayectoriaTitle: "Trayectoria Académica y Profesional",
        trayectoria: [
            { titulo: "Doctorado en Derecho Constitucional", institucion: "Universidad Mayor de San Andrés", año: "2018", icono: "GraduationCap" },
            { titulo: "Magíster en Derecho Civil y Corporativo", institucion: "Universidad Andina Simón Bolívar", año: "2015", icono: "Award" },
            { titulo: "Fundador y CEO", institucion: "Casa Legal Inmobiliaria", año: "Actualidad", icono: "Briefcase" }
        ],
        
        librosTitle: "Publicaciones y Libros",
        libros: [
            { titulo: "Tratado de Derecho Urbano y Saneamiento", descripcion: "Una guía completa sobre la regularización de propiedades y el marco jurídico del desarrollo inmobiliario en Bolivia.", portada: "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?q=80&w=800&auto=format&fit=crop", enlace: "#" }
        ],
        
        blogTitle: "Últimos Artículos y Reflexiones"
    });
    
    let isSaving = $state(false);

    async function saveChanges() {
        isSaving = true;
        try {
            await savePageContent('hugo_page_content', content, 'main_texts');
            alert("¡Cambios guardados con éxito!");
        } catch (error) {
            alert("Error al guardar cambios.");
        } finally {
            isSaving = false;
        }
    }

    onMount(async () => {
        mounted = true;
        
        // Fetch Content & Posts in parallel
        const [savedContent, fetchedPosts] = await Promise.all([
            getPageContent('hugo_page_content', 'main_texts'),
            getHugoNews()
        ]);
        
        if (savedContent) {
            content = { ...content, ...savedContent };
        }
        if (fetchedPosts) {
            posts = fetchedPosts.slice(0, 3); // Solo los últimos 3
        }
        
        loading = false;
        setTimeout(() => {
            if (!loading) showSplash = false;
        }, 2000);

        if (browser) {
            gsap.registerPlugin(ScrollTrigger);
            
            // Wait a bit for entrance animation before initializing scrolltrigger
            setTimeout(() => {
                const tl = gsap.timeline({
                    scrollTrigger: {
                        trigger: ".scroll-container",
                        start: "top top",
                        end: "bottom bottom",
                        scrub: 1, // Add some smooth scrubbing
                    }
                });

                // --- FASE 1: Animaciones Iniciales (Tiempo 0 a 4) ---
                // 1. Profile Image: Scale and reveal fully over scroll
                tl.to(".profile-img", { filter: "brightness(1)", duration: 3, ease: "power1.inOut" }, 0); // reveal fully
                tl.to(".profile-img", { scale: 1.03, duration: 4, ease: "none" }, 0);
                
                // Neon glow back light: Starts green, goes to cyan, then purple
                tl.to(".neon-glow", { opacity: 0.8, scale: 1.5, duration: 1, ease: "power2.out" }, 0);
                tl.to(".neon-glow", { "--neon-color": "#00d4ff", duration: 1.5, ease: "none" }, 1);
                tl.to(".neon-glow", { "--neon-color": "#aa00ff", duration: 1.5, ease: "none" }, 2.5);
                
                // 2. SVG Rays Background: Change colors matching neon
                tl.to(".ray-stroke", { stroke: "#00ff44", duration: 1 }, 0);
                tl.to(".ray-stroke", { stroke: "#00d4ff", duration: 1.5 }, 1);
                tl.to(".ray-stroke", { stroke: "#aa00ff", duration: 1.5 }, 2.5);
                tl.to(".ray-glow", { opacity: 0.4, duration: 2 }, 0.5);

                // 3. Main Text: Disappears/moves up
                tl.to(".main-title", { y: -100, opacity: 0, duration: 0.8 }, 0);

                // 4. Section 1: Biografía (Appears from left)
                tl.fromTo(".text-bio", 
                    { x: -100, opacity: 0 }, 
                    { x: 0, opacity: 1, duration: 0.8 }, 0.8
                );
                // Disappears
                tl.to(".text-bio", { x: 0, opacity: 0, y: -50, duration: 0.8 }, 2);

                // 5. Section 2: Proyectos (Appears from right)
                tl.fromTo(".text-projects", 
                    { x: 100, opacity: 0 }, 
                    { x: 0, opacity: 1, duration: 0.8 }, 2
                );
                // Disappears
                tl.to(".text-projects", { x: 0, opacity: 0, y: -50, duration: 0.8 }, 3);

                // --- FASE 2: Transición a Nueva Sección (Tiempo 4 a 6) ---
                // Desaparecer todo el contenido fijo actual
                tl.to(".fixed-content", { opacity: 0, duration: 1, ease: "power2.inOut" }, 4);
                
                // Hacer aparecer la nueva imagen en la parte superior "de la nada"
                tl.fromTo(".top-logo-img", 
                    { opacity: 0, scale: 0.1, y: -200, filter: "blur(20px)" }, 
                    { opacity: 1, scale: 1, y: 0, filter: "blur(0px)", duration: 1, ease: "back.out(1.5)" }, 
                    4.5
                );
                
                // Mostrar sección inventada ("Visión Estratégica") que sube
                tl.fromTo(".vision-section", 
                    { opacity: 0, y: 150 }, 
                    { opacity: 1, y: 0, pointerEvents: "auto", duration: 1, ease: "power2.out" }, 
                    5
                );
                
                // Mostrar olas doradas, verdes, blancas
                tl.to(".waves-container", { opacity: 1, duration: 1 }, 4.5);

                // Botones saliendo
                tl.fromTo(".action-btn", 
                    { opacity: 0, scale: 0.5, y: 50 },
                    { opacity: 1, scale: 1, y: 0, duration: 0.8, stagger: 0.2, ease: "back.out(1.7)" },
                    5.5
                );
            }, 1500); 
        }
        
        return () => {
            if (browser) {
                ScrollTrigger.getAll().forEach(t => t.kill());
            }
        };
    });
</script>

<svelte:head>
    <title>Hugo Santos Quelca</title>
</svelte:head>

<!-- SPLASH SCREEN -->
{#if showSplash}
    <div out:fade={{ duration: 800 }} class="fixed inset-0 z-[100] bg-[#050505] flex flex-col items-center justify-center">
        <div class="w-48 md:w-64 animate-pulse">
            <img src={hqImg} alt="Hugo Santos" class="w-full h-auto object-contain drop-shadow-[0_0_20px_rgba(255,255,255,0.3)]" />
        </div>
        <div class="mt-8 flex gap-2">
            <div class="w-2 h-2 rounded-full bg-[#ffd700] animate-bounce" style="animation-delay: 0s"></div>
            <div class="w-2 h-2 rounded-full bg-[#ffffff] animate-bounce" style="animation-delay: 0.2s"></div>
            <div class="w-2 h-2 rounded-full bg-[#00ff44] animate-bounce" style="animation-delay: 0.4s"></div>
        </div>
    </div>
{/if}

<!-- Admin Floating Save Button -->
{#if $user}
<div class="fixed top-4 right-4 z-[100]">
    <button onclick={saveChanges} disabled={isSaving} class="bg-[#ffd700] text-black font-bold px-6 py-2 rounded shadow-lg hover:scale-105 transition-transform disabled:opacity-50">
        {isSaving ? 'Guardando...' : 'Guardar Textos'}
    </button>
</div>
{/if}

<!-- Contenedor vacío que dicta la altura del scroll, ahora 600vh para incluir la nueva sección -->
<div class="scroll-container w-full h-[600vh] relative z-0 opacity-0 pointer-events-none">
    scroll
</div>

<!-- Contenedor visual fijo a la pantalla -->
<div class="fixed top-0 left-0 w-full h-full bg-[#050505] overflow-hidden flex items-center justify-center z-10 pointer-events-none">
    
    <!-- Wrapper de contenido existente para desvanecerlo fácilmente -->
    <div class="fixed-content absolute inset-0 w-full h-full pointer-events-none">
    
    <!-- SVG Lightning / Rays Background -->
    <div class="absolute inset-0 w-full h-full opacity-70 flex items-center justify-center mix-blend-screen pointer-events-none">
        <svg viewBox="0 0 1000 1000" preserveAspectRatio="xMidYMid slice" class="w-full h-full object-cover">
            <defs>
                <!-- Filter removed for performance (Lag fix) -->
                <radialGradient id="glowGradient" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stop-color="#00ff44" stop-opacity="0.15" />
                    <stop offset="100%" stop-color="#050505" stop-opacity="0" />
                </radialGradient>
            </defs>
            
            <!-- Resplandor central -->
            <rect class="ray-glow" x="0" y="0" width="1000" height="1000" fill="url(#glowGradient)" opacity="0" />

            <!-- Rayos / Ondas filosas -->
            <g>
                <!-- Rayos desde arriba -->
                <path class="ray-stroke" d="M200,-100 L350,150 L250,400 L500,750 L400,1100" fill="none" stroke="#111111" stroke-width="3" />
                <path class="ray-stroke" d="M800,-100 L600,200 L750,450 L500,700 L600,1100" fill="none" stroke="#111111" stroke-width="4" />
                <!-- Rayos cruzados -->
                <path class="ray-stroke" d="M-100,300 L200,450 L150,650 L450,800 L300,1100" fill="none" stroke="#111111" stroke-width="2" />
                <path class="ray-stroke" d="M1100,200 L850,400 L950,600 L600,850 L800,1100" fill="none" stroke="#111111" stroke-width="5" />
                <!-- Rayos centrales delgados -->
                <path class="ray-stroke" d="M450,-100 L550,200 L400,500 L600,800 L450,1100" fill="none" stroke="#111111" stroke-width="1.5" />
                <path class="ray-stroke" d="M550,-100 L400,300 L650,600 L350,900 L550,1100" fill="none" stroke="#111111" stroke-width="1.5" />
            </g>
        </svg>
    </div>

    <!-- Imagen de Perfil -->
    <div class="absolute z-20 w-full h-full flex items-end justify-center pointer-events-none pb-0 overflow-hidden">
        {#if mounted}
            <div in:fade={{ duration: 2500, delay: 300 }} class="absolute bottom-0 w-full max-w-[600px] lg:max-w-[800px] flex justify-center h-[70vh] md:h-full">
                <!-- Efecto Neon Glow detrás del sujeto (radial-gradient for performance) -->
                <div class="neon-glow absolute bottom-0 w-[150%] h-[100%] opacity-0 scale-50 z-[-1]"></div>
                <!-- Se asume que el PNG tiene fondo transparente -->
                <img 
                    src={profileImg} 
                    alt="Dr. Hugo Santos Quelca" 
                    class="profile-img w-full h-full object-contain object-bottom filter brightness-0 origin-bottom" 
                />
            </div>
        {/if}
    </div>

    <!-- Capa de Tipografía y Textos Interactivos -->
    <div class="absolute z-30 w-full h-full flex flex-col items-center justify-center p-8 pointer-events-auto">
        
        {#if mounted}
            <!-- TÍTULO PRINCIPAL (Entrada inicial, luego desaparece con el scroll) -->
            <div in:fly={{ y: 60, duration: 1800, delay: 1000 }} class="main-title absolute top-12 md:top-auto md:bottom-24 flex flex-col items-center select-none text-white w-full">
                <h1 class="text-3xl md:text-5xl lg:text-7xl font-black tracking-widest text-center text-transparent bg-clip-text bg-gradient-to-b from-white to-zinc-500 uppercase font-sans">
                    DR HUGO SANTOS<br/>QUELCA
                </h1>
                
                <!-- Indicador de Scroll -->
                <div class="mt-12 flex flex-col items-center opacity-70">
                    <div class="w-[1px] h-16 bg-gradient-to-b from-white to-transparent animate-pulse"></div>
                    <span class="text-zinc-500 text-[10px] uppercase tracking-widest mt-4">Scroll</span>
                </div>
            </div>
        {/if}

        <!-- SECCIÓN 1: BIOGRAFÍA (Aparece al scrollear desde la izquierda) -->
        <div class="text-bio absolute left-6 md:left-16 lg:left-32 top-12 md:top-1/3 opacity-0 max-w-[80vw] md:max-w-md text-white pointer-events-auto cursor-pointer group">
            <h2 class="text-2xl md:text-5xl font-bold mb-2 md:mb-4 tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-white to-zinc-400 group-hover:from-[#00ff44] group-hover:to-green-400 transition-all">BIOGRAFÍA</h2>
            <div class="w-16 h-[2px] bg-[#00ff44] mb-6 group-hover:w-24 transition-all duration-300"></div>
            {#if $user}
                <textarea bind:value={content.biografia} class="w-full bg-black/50 text-zinc-300 border border-zinc-700 p-2 rounded min-h-[100px]"></textarea>
            {:else}
                <p class="text-zinc-300 font-light leading-relaxed text-sm md:text-base">
                    {content.biografia}
                </p>
            {/if}
        </div>

        <!-- SECCIÓN 2: PROYECTOS (Aparece al scrollear desde la derecha) -->
        <div class="text-projects absolute right-6 md:right-16 lg:right-32 top-16 md:top-1/2 opacity-0 max-w-[80vw] md:max-w-md text-right flex flex-col items-end text-white pointer-events-auto cursor-pointer group">
            <h2 class="text-2xl md:text-5xl font-bold mb-2 md:mb-4 tracking-wider text-transparent bg-clip-text bg-gradient-to-l from-white to-zinc-400 group-hover:from-[#00ff44] group-hover:to-green-400 transition-all">PROYECTOS</h2>
            <div class="w-16 h-[2px] bg-[#00ff44] mb-6 group-hover:w-24 transition-all duration-300"></div>
            {#if $user}
                <textarea bind:value={content.proyectos} class="w-full bg-black/50 text-zinc-300 border border-zinc-700 p-2 rounded min-h-[100px] text-right"></textarea>
            {:else}
                <p class="text-zinc-300 font-light leading-relaxed text-sm md:text-base">
                    {content.proyectos}
                </p>
            {/if}
        </div>

        </div>
    </div> <!-- Cierre de fixed-content -->

    <!-- Contenedor Olas SVG (Animación de fondo en el final) -->
    <div class="waves-container absolute bottom-0 left-0 w-full overflow-hidden leading-none z-40 opacity-0 pointer-events-none h-[20vh] md:h-[30vh]">
        <svg class="relative block w-[200%] md:w-[150%] h-[150px] md:h-[300px] animate-wave-slow" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V120H0V95.8C59.71,118.08,130.83,115.17,190.54,95.16,236.4,79.79,279.16,66.86,321.39,56.44Z" class="fill-[#ffd700]/20"></path>
        </svg>
        <svg class="absolute bottom-0 block w-[250%] md:w-[200%] h-[120px] md:h-[250px] animate-wave-fast" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M985.66,92.83C906.67,72,823.78,31,743.84,14.19c-82.26-17.34-168.06-16.33-250.45.39-57.84,11.73-114,31.07-172,41.86A600.21,600.21,0,0,1,0,27.35V120H1200V95.8C1132.19,118.92,1055.71,111.31,985.66,92.83Z" class="fill-[#00ff44]/20"></path>
        </svg>
        <svg class="absolute bottom-0 block w-[200%] md:w-[100%] h-[100px] md:h-[200px] animate-wave-medium" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z" opacity=".25" class="fill-[#ffffff]/20"></path>
            <path d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z" opacity=".5" class="fill-[#ffffff]/20"></path>
            <path d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z" class="fill-[#ffffff]/20"></path>
        </svg>
    </div>

    <!-- NUEVA FASE: Imagen Superior y Sección de Visión Estratégica -->
    <div class="absolute inset-0 w-full h-full flex flex-col items-center justify-center p-4 md:p-8 z-50 pointer-events-none text-white overflow-hidden">
        
        <!-- Imagen que aparece de la nada en la parte superior -->
        <div class="top-logo-img opacity-0 mb-4 md:mb-8 w-full h-[35vh] md:h-[40vh] md:max-w-lg lg:max-w-2xl flex justify-center flex-shrink-0">
            <img src={topLogoImg} alt="Hugo Santos" class="h-full w-auto object-contain drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]" />
        </div>

        <!-- Nueva sección que sube mientras scrolleas (Visión Estratégica) -->
        <div class="vision-section opacity-0 w-full max-w-4xl flex flex-col items-center text-center">
            <h2 class="text-2xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#ffd700] via-[#ffffff] to-[#00ff44] mb-4 md:mb-6 tracking-widest uppercase drop-shadow-md">
                Excelencia & Legado
            </h2>
            
            <div class="bg-[#050505]/60 backdrop-blur-md border border-[#ffd700]/30 p-4 md:p-10 rounded-2xl relative overflow-hidden group shadow-[0_0_30px_rgba(255,215,0,0.1)] w-full pointer-events-auto">
                {#if $user}
                    <textarea bind:value={content.vision} class="w-full bg-black/50 text-zinc-200 border border-zinc-700 p-2 rounded min-h-[100px] mb-4 text-center"></textarea>
                {:else}
                    <p class="text-zinc-200 text-xs md:text-lg font-light leading-relaxed mb-4">
                        "{content.vision}"
                    </p>
                {/if}
                <div class="w-16 h-1 bg-gradient-to-r from-[#00ff44] via-[#ffffff] to-[#ffd700] mx-auto rounded-full mb-4"></div>
                
                <!-- Botones de Acción responsive -->
                <div class="flex flex-col md:flex-row justify-center items-center gap-3 mt-4 pointer-events-auto">
                    <a href="#contacto" class="action-btn w-full md:w-auto px-6 py-2 md:px-8 md:py-3 bg-gradient-to-r from-[#00ff44] to-[#00aa22] text-black text-xs md:text-sm font-bold uppercase tracking-widest rounded-full hover:scale-105 transition-transform shadow-[0_0_15px_rgba(0,255,68,0.5)]">
                        Contacto
                    </a>
                    <a href="/hugosantosquelca/blog" class="action-btn w-full md:w-auto px-6 py-2 md:px-8 md:py-3 border-2 border-[#ffd700] text-[#ffd700] text-xs md:text-sm font-bold uppercase tracking-widest rounded-full hover:bg-[#ffd700] hover:text-black transition-all shadow-[0_0_15px_rgba(255,215,0,0.3)]">
                        Blog Personal
                    </a>
                </div>
            </div>
        </div>
    </div>
</div>

<!-- ADDITIONAL CONTENT (BELOW GSAP PARALLAX) -->
<div class="relative z-20 bg-[#050505] w-full overflow-hidden shadow-[0_-20px_50px_rgba(0,0,0,0.8)]">
    
    <!-- Trayectoria Académica y Profesional -->
    <section class="py-24 px-6 md:px-12 max-w-7xl mx-auto border-t border-zinc-900 mt-10">
        <div class="text-center mb-16">
            <h2 class="text-3xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#ffd700] to-zinc-400 uppercase tracking-widest">
                {#if $user}
                    <span contenteditable="true" bind:textContent={content.trayectoriaTitle} class="border-b border-dashed border-[#ffd700] focus:outline-none block"></span>
                {:else}
                    {content.trayectoriaTitle}
                {/if}
            </h2>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
            {#each content.trayectoria as item, i}
                <div class="bg-zinc-900/50 backdrop-blur-md border border-zinc-800 rounded-3xl p-8 hover:border-[#00ff44] hover:shadow-[0_0_20px_rgba(0,255,68,0.2)] transition-all group text-center">
                    <div class="w-16 h-16 rounded-full bg-black border border-zinc-700 flex items-center justify-center mx-auto mb-6 group-hover:border-[#00ff44] group-hover:text-[#00ff44] text-zinc-400 transition-colors">
                        {#if item.icono === 'GraduationCap'}<GraduationCap class="w-8 h-8"/>
                        {:else if item.icono === 'Award'}<Award class="w-8 h-8"/>
                        {:else}<Briefcase class="w-8 h-8"/>{/if}
                    </div>
                    
                    <span class="text-[#00ff44] text-xs font-black uppercase tracking-widest mb-3 block">
                        {#if $user}<span contenteditable="true" bind:textContent={content.trayectoria[i].año} class="border-b border-dashed border-[#00ff44] focus:outline-none"></span>{:else}{item.año}{/if}
                    </span>
                    
                    <h3 class="text-xl font-bold text-white mb-2">
                        {#if $user}<span contenteditable="true" bind:textContent={content.trayectoria[i].titulo} class="border-b border-dashed border-zinc-500 focus:outline-none"></span>{:else}{item.titulo}{/if}
                    </h3>
                    
                    <p class="text-zinc-400 font-light text-sm">
                        {#if $user}<span contenteditable="true" bind:textContent={content.trayectoria[i].institucion} class="border-b border-dashed border-zinc-500 focus:outline-none"></span>{:else}{item.institucion}{/if}
                    </p>
                </div>
            {/each}
        </div>
    </section>

    <!-- Libros Publicados -->
    <section class="py-24 px-6 md:px-12 max-w-7xl mx-auto border-t border-zinc-900">
        <div class="text-center mb-16">
            <h2 class="text-3xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#00ff44] to-zinc-400 uppercase tracking-widest">
                {#if $user}
                    <span contenteditable="true" bind:textContent={content.librosTitle} class="border-b border-dashed border-[#00ff44] focus:outline-none block"></span>
                {:else}
                    {content.librosTitle}
                {/if}
            </h2>
        </div>
        
        <div class="flex flex-col gap-12">
            {#each content.libros as libro, i}
                <div class="flex flex-col md:flex-row bg-zinc-900/30 backdrop-blur-sm border border-zinc-800 rounded-3xl overflow-hidden group hover:border-[#ffd700] transition-colors">
                    <div class="w-full md:w-1/3 h-[400px] md:h-auto relative overflow-hidden bg-zinc-800">
                        <img src={libro.portada} alt={libro.titulo} class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-80 group-hover:opacity-100" />
                        <div class="absolute inset-0 bg-gradient-to-t from-black to-transparent"></div>
                        {#if $user}
                            <button onclick={() => { const url = prompt('URL de portada:', libro.portada); if (url) content.libros[i].portada = url; }} class="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity text-white font-bold backdrop-blur-sm">Cambiar Portada</button>
                        {/if}
                    </div>
                    
                    <div class="w-full md:w-2/3 p-10 md:p-16 flex flex-col justify-center">
                        <div class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#ffd700]/20 text-[#ffd700] text-xs font-black tracking-widest uppercase mb-6 w-max">
                            <BookOpen class="w-4 h-4" /> Publicación Destacada
                        </div>
                        <h3 class="text-3xl md:text-4xl text-white font-bold mb-6 font-serif">
                            {#if $user}<span contenteditable="true" bind:textContent={content.libros[i].titulo} class="border-b border-dashed border-zinc-500 focus:outline-none block"></span>{:else}{libro.titulo}{/if}
                        </h3>
                        <p class="text-zinc-400 text-lg leading-relaxed mb-8">
                            {#if $user}<span contenteditable="true" bind:textContent={content.libros[i].descripcion} class="border-b border-dashed border-zinc-500 focus:outline-none block w-full h-full"></span>{:else}{libro.descripcion}{/if}
                        </p>
                        
                        <a href={libro.enlace} class="text-[#00ff44] font-bold uppercase tracking-widest text-sm flex items-center gap-2 hover:text-white transition-colors w-max">
                            Descubrir más <ArrowRight class="w-4 h-4" />
                        </a>
                    </div>
                </div>
            {/each}
        </div>
    </section>

    <!-- Blog Feed -->
    <section class="py-24 px-6 md:px-12 max-w-7xl mx-auto border-t border-zinc-900">
        <div class="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
            <div>
                <h2 class="text-3xl md:text-5xl font-black text-white uppercase tracking-widest font-serif">
                    {#if $user}
                        <span contenteditable="true" bind:textContent={content.blogTitle} class="border-b border-dashed border-zinc-500 focus:outline-none block"></span>
                    {:else}
                        {content.blogTitle}
                    {/if}
                </h2>
            </div>
            <a href="/hugosantosquelca/blog" class="px-6 py-3 rounded-full border border-zinc-700 text-zinc-300 hover:bg-white hover:text-black transition-colors text-xs font-black uppercase tracking-widest flex items-center gap-2 whitespace-nowrap">
                Ir al Blog <ArrowRight class="w-4 h-4" />
            </a>
        </div>
        
        {#if posts.length === 0}
            <div class="text-center py-20 bg-zinc-900/50 rounded-3xl border border-zinc-800">
                <p class="text-zinc-500">Pronto habrán nuevos artículos disponibles.</p>
            </div>
        {:else}
            <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
                {#each posts as post}
                    <a href="/hugosantosquelca/blog/{post.id}" class="group bg-zinc-900/50 border border-zinc-800 rounded-2xl overflow-hidden hover:border-[#00ff44]/50 transition-colors block flex flex-col">
                        <div class="w-full h-48 relative overflow-hidden bg-black">
                            {#if post.coverImage}
                                <img src={post.coverImage} alt={post.title} class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-80 group-hover:opacity-100" />
                            {:else}
                                <div class="w-full h-full flex items-center justify-center text-zinc-700 bg-zinc-950">
                                    <FileText class="w-12 h-12" />
                                </div>
                            {/if}
                            <div class="absolute inset-0 bg-gradient-to-t from-[#050505] to-transparent opacity-80"></div>
                            <div class="absolute bottom-4 left-4 right-4">
                                <span class="text-[10px] text-[#00ff44] uppercase tracking-widest font-bold">
                                    {post.createdAt ? new Date(post.createdAt).toLocaleDateString('es-ES', { month: 'long', day: 'numeric', year: 'numeric' }) : 'Reciente'}
                                </span>
                            </div>
                        </div>
                        <div class="p-6 flex flex-col flex-grow">
                            <h3 class="text-lg font-bold mb-3 text-zinc-200 group-hover:text-white transition-colors line-clamp-2">
                                {post.title}
                            </h3>
                            <p class="text-zinc-500 text-sm line-clamp-3 mb-6 flex-grow">
                                {post.excerpt || "Haz clic para leer el artículo completo..."}
                            </p>
                            <div class="text-[#ffd700] text-xs font-black uppercase tracking-widest flex items-center gap-2 mt-auto">
                                Leer más <ArrowRight class="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                            </div>
                        </div>
                    </a>
                {/each}
            </div>
        {/if}
    </section>
</div>

<SocialAndLocations />

<style>
    /* Aseguramos que el body principal también sea oscuro */
    :global(body) {
        background-color: #050505;
    }
    .neon-glow {
        --neon-color: #00ff44;
        background: radial-gradient(circle, var(--neon-color) 0%, transparent 60%);
    }
    
    /* Animación de electricidad para los rayos SVG */
    .ray-stroke {
        stroke-dasharray: 40 80;
        animation: electricity 2s linear infinite;
    }
    
    @keyframes electricity {
        from {
            stroke-dashoffset: 120;
        }
        to {
            stroke-dashoffset: 0;
        }
    }
    /* Animación de Olas */
    .animate-wave-slow { animation: wave 12s linear infinite alternate; }
    .animate-wave-medium { animation: wave 8s linear infinite alternate-reverse; }
    .animate-wave-fast { animation: wave 6s linear infinite alternate; }
    
    @keyframes wave {
        0% { transform: translateX(0); }
        100% { transform: translateX(-15%); }
    }
</style>

<script>
    import { onMount } from 'svelte';
    import { fade, slide } from 'svelte/transition';
    import { user } from '$lib/firebase/auth';
    import { getHugoNews, saveHugoNewsItem } from '$lib/firebase/db';
    import hqImg from '../assets/hq.png';
    import { goto } from '$app/navigation';

    let mounted = $state(false);
    let showSplash = $state(true);
    let posts = $state([]);
    let loading = $state(true);

    // Admin state
    let showCreateModal = $state(false);
    let newPostTitle = $state('');
    let isSaving = $state(false);

    onMount(async () => {
        mounted = true;
        // Fetch posts
        posts = await getHugoNews();
        loading = false;
        
        // Hide splash after 2.5 seconds minimum, or when loading finishes (whichever is later)
        setTimeout(() => {
            if (!loading) showSplash = false;
        }, 2500);
    });
    
    // Watch for loading completion if splash timer already finished
    $effect(() => {
        if (!loading && !showSplash && posts) {
            showSplash = false; 
        }
    });

    async function createPost() {
        if (!newPostTitle.trim()) return;
        isSaving = true;
        
        // Generate a simple slug from title
        const slug = newPostTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
        const newPost = {
            title: newPostTitle,
            excerpt: "Haz clic para editar este artículo...",
            content: "<h2>Nuevo Artículo</h2><p>Escribe aquí tu contenido...</p>",
            coverImage: "",
            author: "Dr. Hugo Santos Quelca"
        };
        
        try {
            await saveHugoNewsItem(slug, newPost);
            goto(`/hugosantosquelca/blog/${slug}`);
        } catch (error) {
            console.error(error);
            alert("Error al crear la publicación");
            isSaving = false;
        }
    }
</script>

<svelte:head>
    <title>Blog Personal | Dr. Hugo Santos Quelca</title>
    <meta name="description" content="Artículos, novedades y visión estratégica sobre el desarrollo urbano y jurídico por el Dr. Hugo Santos Quelca.">
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

<!-- MAIN CONTENT -->
<div class="min-h-screen bg-[#050505] text-white overflow-x-hidden pt-24 pb-12 px-6 md:px-12 relative z-0">
    
    <!-- Background Decor -->
    <div class="fixed top-[-20%] left-[-10%] w-[50%] h-[50%] bg-[#aa00ff] rounded-full mix-blend-screen filter blur-[150px] opacity-20 pointer-events-none"></div>
    <div class="fixed bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-[#00d4ff] rounded-full mix-blend-screen filter blur-[150px] opacity-20 pointer-events-none"></div>

    <div class="max-w-6xl mx-auto relative z-10">
        <!-- Header -->
        <div class="flex flex-col md:flex-row md:items-end justify-between mb-16 border-b border-zinc-800 pb-8">
            <div>
                <h1 class="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-zinc-400 tracking-widest uppercase mb-4">
                    Visión & Perspectiva
                </h1>
                <p class="text-zinc-400 font-light max-w-2xl text-lg">
                    Explora reflexiones, noticias y análisis sobre el desarrollo inmobiliario y la estrategia jurídica, de la mano del Dr. Hugo Santos Quelca.
                </p>
            </div>
            
            <div class="mt-8 md:mt-0">
                <a href="/hugosantosquelca" class="text-zinc-500 hover:text-white transition-colors uppercase tracking-widest text-sm flex items-center gap-2">
                    <span>←</span> Volver al Perfil
                </a>
            </div>
        </div>

        <!-- Admin Control -->
        {#if $user}
            <div class="mb-12 bg-zinc-900/50 border border-zinc-800 p-6 rounded-xl flex items-center justify-between backdrop-blur-sm">
                <div>
                    <h3 class="text-[#00ff44] font-bold uppercase tracking-widest text-sm mb-1">Modo Administrador</h3>
                    <p class="text-zinc-400 text-xs">Puedes crear y gestionar publicaciones.</p>
                </div>
                <button onclick={() => showCreateModal = true} class="bg-white text-black px-6 py-2 rounded-full font-bold text-sm uppercase tracking-widest hover:scale-105 transition-transform">
                    + Nueva Publicación
                </button>
            </div>
        {/if}

        <!-- Post Grid -->
        {#if loading}
            <!-- Se oculta por el splash, pero por si acaso -->
        {:else if posts.length === 0}
            <div class="text-center py-20 text-zinc-500 font-light">
                No hay publicaciones disponibles en este momento.
            </div>
        {:else}
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {#each posts as post}
                    <a href="/hugosantosquelca/blog/{post.id}" class="group bg-[#0a0a0a] border border-zinc-800 rounded-2xl overflow-hidden hover:border-[#ffd700]/50 transition-colors block">
                        <div class="w-full h-48 bg-zinc-900 relative overflow-hidden">
                            {#if post.coverImage}
                                <img src={post.coverImage} alt={post.title} class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                            {:else}
                                <div class="w-full h-full bg-gradient-to-br from-zinc-800 to-zinc-900 flex items-center justify-center text-zinc-700">
                                    <svg class="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"></path></svg>
                                </div>
                            {/if}
                            <div class="absolute inset-0 bg-gradient-to-t from-[#050505] to-transparent opacity-80"></div>
                            
                            <div class="absolute bottom-4 left-4 right-4">
                                <span class="text-xs text-[#00ff44] uppercase tracking-widest font-bold">
                                    {post.createdAt ? new Date(post.createdAt).toLocaleDateString('es-ES', { month: 'long', day: 'numeric', year: 'numeric' }) : 'Reciente'}
                                </span>
                            </div>
                        </div>
                        <div class="p-6">
                            <h2 class="text-xl font-bold mb-3 text-zinc-200 group-hover:text-white transition-colors line-clamp-2">
                                {post.title}
                            </h2>
                            <p class="text-zinc-500 text-sm line-clamp-3 font-light">
                                {post.excerpt || 'Haz clic para leer el artículo completo...'}
                            </p>
                        </div>
                    </a>
                {/each}
            </div>
        {/if}
    </div>
</div>

<!-- CREATE MODAL -->
{#if showCreateModal}
    <div class="fixed inset-0 z-[200] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4" transition:fade={{ duration: 200 }}>
        <div class="bg-[#111] border border-zinc-700 rounded-2xl w-full max-w-lg p-8 relative" transition:slide>
            <button onclick={() => showCreateModal = false} class="absolute top-4 right-4 text-zinc-500 hover:text-white">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
            
            <h3 class="text-2xl font-bold mb-6 text-white uppercase tracking-widest">Nueva Publicación</h3>
            
            <div class="mb-6">
                <label class="block text-zinc-400 text-xs uppercase tracking-widest mb-2" for="title">Título del Artículo</label>
                <input 
                    id="title"
                    type="text" 
                    bind:value={newPostTitle} 
                    placeholder="Ej. El futuro del desarrollo inmobiliario..."
                    class="w-full bg-black border border-zinc-800 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-[#ffd700] transition-colors"
                    onkeydown={(e) => e.key === 'Enter' && createPost()}
                />
            </div>
            
            <div class="flex justify-end gap-3">
                <button onclick={() => showCreateModal = false} class="px-6 py-2 rounded-lg text-zinc-400 hover:text-white transition-colors">
                    Cancelar
                </button>
                <button onclick={createPost} disabled={!newPostTitle.trim() || isSaving} class="px-6 py-2 bg-[#ffd700] text-black font-bold rounded-lg hover:bg-white transition-colors disabled:opacity-50">
                    {isSaving ? 'Creando...' : 'Crear y Editar'}
                </button>
            </div>
        </div>
    </div>
{/if}

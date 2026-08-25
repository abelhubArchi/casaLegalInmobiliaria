<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { user } from '$lib/firebase/auth';
  import { getNewsBySlug, saveNewsItem, deleteNewsItem, uploadImage } from '$lib/firebase/db';
  import { ArrowLeft, Trash2, Save, Image as ImageIcon } from 'lucide-svelte';

  let slug = $derived($page.params.slug);
  let isAdmin = $derived(!!$user);
  let loading = $state(true);
  
  // Default values for a new post
  let post = $state({
    title: 'Título de la Noticia',
    summary: 'Escribe un breve resumen de la noticia aquí. Esto aparecerá en las tarjetas de la página principal.',
    content: 'Escribe aquí el contenido completo del artículo... Puedes usar HTML si lo deseas.',
    coverImg: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?q=80&w=2000&auto=format&fit=crop',
    createdAt: new Date().toISOString()
  });

  onMount(async () => {
    loading = true;
    const existingPost = await getNewsBySlug(slug);
    if (existingPost) {
        post = { ...post, ...existingPost };
    } else if (!isAdmin) {
        // If not admin and post doesn't exist, redirect back
        window.location.href = '/fundacion';
    }
    loading = false;
  });

  async function handleSave() {
    try {
        await saveNewsItem(slug, post);
        alert('Noticia guardada exitosamente.');
    } catch (e: any) {
        alert('Error al guardar: ' + e.message);
    }
  }

  async function handleDelete() {
    if (confirm('¿Estás seguro de eliminar esta noticia de forma permanente?')) {
        await deleteNewsItem(slug);
        window.location.href = '/fundacion#noticias';
    }
  }

  let fileInput: HTMLInputElement;
  let imageUploadTarget: 'cover' | 'content' | null = null;
  let uploadingImage = $state(false);

  async function handleImageSelect(event: Event) {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];
    if (!file) return;
    
    uploadingImage = true;
    try {
        const path = `noticias/${slug}/${Date.now()}_${file.name}`;
        const url = await uploadImage(path, file);
        
        if (imageUploadTarget === 'cover') {
            post.coverImg = url;
        } else if (imageUploadTarget === 'content') {
            post.content += `<p><img src="${url}" class="w-full rounded-xl my-4 shadow-lg border border-gray-100" alt="Imagen" /></p>`;
        }
    } catch(e: any) {
        alert("Error subiendo imagen: " + e.message);
    } finally {
        uploadingImage = false;
        imageUploadTarget = null;
        target.value = '';
    }
  }

  function changeImage() {
    if (!isAdmin) return;
    imageUploadTarget = 'cover';
    fileInput.click();
  }

  function insertContentImage() {
    if (!isAdmin) return;
    imageUploadTarget = 'content';
    fileInput.click();
  }
</script>

<!-- Hidden file input for uploads -->
<input type="file" accept="image/*" class="hidden" bind:this={fileInput} onchange={handleImageSelect} />

<svelte:head>
  <title>{post.title} | Fundación Casa Legal</title>
  <meta name="description" content={post.summary} />
  <!-- OpenGraph Tags for Social Media -->
  <meta property="og:title" content={post.title} />
  <meta property="og:description" content={post.summary} />
  <meta property="og:image" content={post.coverImg} />
  <meta property="og:type" content="article" />
</svelte:head>

<div class="min-h-screen bg-gray-50 pb-24">
    <!-- Navbar / Back button -->
    <header class="bg-[#0E1C14] text-white py-4 px-6 fixed top-0 w-full z-50 shadow-md">
        <div class="max-w-4xl mx-auto flex justify-between items-center">
            <a href="/fundacion#noticias" class="flex items-center gap-2 text-gray-300 hover:text-[#C5A059] transition-colors text-sm font-bold tracking-wider uppercase">
                <ArrowLeft class="w-4 h-4" /> Volver a Noticias
            </a>
            {#if isAdmin}
                <div class="flex gap-4">
                    <button onclick={handleDelete} class="flex items-center gap-1.5 text-red-400 hover:text-red-300 font-bold text-xs uppercase tracking-wider">
                        <Trash2 class="w-4 h-4" /> Eliminar
                    </button>
                    <button onclick={handleSave} class="flex items-center gap-1.5 bg-[#C5A059] hover:bg-[#b08d4f] text-white px-4 py-2 rounded-lg font-bold text-xs uppercase tracking-wider transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5">
                        <Save class="w-4 h-4" /> Guardar Noticia
                    </button>
                </div>
            {/if}
        </div>
    </header>

    {#if loading || uploadingImage}
        <div class="pt-32 flex flex-col justify-center min-h-screen items-center">
            <div class="w-12 h-12 border-4 border-[#C5A059] border-t-transparent rounded-full animate-spin mb-4"></div>
            {#if uploadingImage}<span class="text-[#C5A059] font-bold tracking-widest text-xs uppercase animate-pulse">Subiendo Imagen...</span>{/if}
        </div>
    {:else}
        <!-- Cover Image -->
        <div class="pt-16 w-full h-[50vh] min-h-[400px] relative group/cover bg-[#0E1C14]">
            <img src={post.coverImg} alt={post.title} class="w-full h-full object-cover opacity-60 mix-blend-overlay" />
            <div class="absolute inset-0 bg-gradient-to-t from-[#0E1C14] via-black/40 to-transparent pointer-events-none"></div>
            
            {#if isAdmin}
                <button onclick={changeImage} class="absolute inset-0 m-auto w-max h-max bg-black/60 text-white font-bold px-6 py-3 rounded-xl opacity-0 group-hover/cover:opacity-100 transition-opacity flex items-center gap-2 backdrop-blur-sm shadow-xl z-20 hover:bg-black/80 border border-[#C5A059]">
                    <ImageIcon class="w-5 h-5" /> Cambiar Portada
                </button>
            {/if}
            
            <div class="absolute bottom-0 left-0 w-full p-6 pb-12 z-10">
                <div class="max-w-4xl mx-auto">
                    <div class="text-[#C5A059] font-bold text-xs uppercase tracking-widest mb-4 flex items-center gap-2">
                        <span>Fundación Casa Legal</span> • <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                    </div>
                    <h1 class="text-4xl sm:text-5xl md:text-6xl text-white font-bold leading-tight" style="font-family: 'Cinzel', serif;">
                        {#if isAdmin}
                            <span contenteditable="true" bind:innerText={post.title} class="border-b border-dashed border-[#C5A059] focus:outline-none focus:bg-white/10 block w-full rounded p-2 transition-colors"></span>
                        {:else}
                            {post.title}
                        {/if}
                    </h1>
                </div>
            </div>
        </div>

        <!-- Content -->
        <article class="max-w-4xl mx-auto bg-white -mt-8 relative z-20 rounded-3xl p-8 sm:p-12 shadow-2xl border border-gray-100">
            <!-- Summary (Intro) -->
            <div class="text-xl md:text-2xl text-gray-800 font-medium leading-relaxed mb-10 pb-10 border-b border-gray-100">
                {#if isAdmin}
                    <div class="text-[#C5A059] text-xs font-bold uppercase tracking-widest mb-2">Resumen de la noticia (Visible en la tarjeta principal)</div>
                    <span contenteditable="true" bind:innerText={post.summary} class="border border-dashed border-[#C5A059] focus:outline-none focus:bg-gray-50 block w-full rounded p-4 text-gray-600 text-lg transition-colors"></span>
                {:else}
                    <p>{post.summary}</p>
                {/if}
            </div>

            <!-- Body -->
            <div class="text-gray-600 text-lg leading-loose relative">
                {#if isAdmin}
                    <div class="flex justify-between items-center mb-2">
                        <div class="text-[#C5A059] text-xs font-bold uppercase tracking-widest">Contenido Completo del Artículo</div>
                        <button onclick={insertContentImage} class="flex items-center gap-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded text-xs font-bold uppercase transition-colors">
                            <ImageIcon class="w-3.5 h-3.5" /> Insertar Imagen
                        </button>
                    </div>
                    <div contenteditable="true" bind:innerHTML={post.content} class="min-h-[400px] border border-dashed border-gray-300 focus:outline-none focus:border-[#C5A059] rounded-xl p-6 transition-colors"></div>
                {:else}
                    {@html post.content}
                {/if}
            </div>
        </article>
    {/if}
</div>

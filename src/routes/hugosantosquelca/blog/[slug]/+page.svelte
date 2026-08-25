<script>
    import { onMount } from 'svelte';
    import { page } from '$app/stores';
    import { user } from '$lib/firebase/auth';
    import { getHugoNewsBySlug, saveHugoNewsItem, deleteHugoNewsItem, uploadImage } from '$lib/firebase/db';
    import { goto } from '$app/navigation';

    let post = $state(null);
    let loading = $state(true);
    
    // Admin state
    let isEditing = $state(false);
    let editData = $state({
        title: '',
        excerpt: '',
        content: '',
        coverImage: ''
    });
    let isSaving = $state(false);
    let isUploading = $state(false);

    async function handleImageUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        isUploading = true;
        try {
            const path = `hugo_blog_covers/${Date.now()}_${file.name}`;
            const downloadUrl = await uploadImage(path, file);
            editData.coverImage = downloadUrl;
        } catch (error) {
            console.error("Upload error:", error);
            alert("Error al subir la imagen");
        } finally {
            isUploading = false;
        }
    }

    onMount(async () => {
        const slug = $page.params.slug;
        post = await getHugoNewsBySlug(slug);
        
        if (post) {
            editData = { ...post };
        } else if (!$user) {
            // Not found and not admin
            goto('/hugosantosquelca/blog');
        } else {
            // Admin but not found, maybe new?
            editData.title = "Nuevo Artículo";
        }
        loading = false;
    });

    async function savePost() {
        if (!editData.title.trim()) return;
        isSaving = true;
        
        const slug = $page.params.slug;
        try {
            const saved = await saveHugoNewsItem(slug, editData);
            post = { ...saved };
            isEditing = false;
            alert("¡Publicación guardada exitosamente!");
        } catch (error) {
            console.error(error);
            alert("Error al guardar.");
        } finally {
            isSaving = false;
        }
    }

    async function deletePost() {
        if (!confirm("¿Estás seguro de eliminar esta publicación de forma permanente?")) return;
        
        isSaving = true;
        const slug = $page.params.slug;
        try {
            await deleteHugoNewsItem(slug);
            goto('/hugosantosquelca/blog');
        } catch (error) {
            console.error(error);
            alert("Error al eliminar.");
            isSaving = false;
        }
    }
</script>

<!-- SEO -->
<svelte:head>
    <title>{post?.title || editData.title || 'Cargando...'} | Blog Personal</title>
    <meta name="description" content={post?.excerpt || editData.excerpt || "Artículo del Dr. Hugo Santos Quelca"}>
    {#if post?.coverImage}
        <meta property="og:image" content={post.coverImage}>
    {/if}
</svelte:head>

{#if loading}
    <div class="min-h-screen bg-[#050505] flex items-center justify-center text-[#ffd700]">
        Cargando artículo...
    </div>
{:else if post || $user}

    <div class="min-h-screen bg-[#050505] text-white overflow-x-hidden pt-24 pb-20 relative z-0">
        <!-- Decor -->
        <div class="absolute top-0 left-0 w-full h-[60vh] bg-gradient-to-b from-zinc-900 to-[#050505] pointer-events-none -z-10"></div>
        
        <div class="max-w-4xl mx-auto px-6 md:px-12 relative z-10">
            <!-- Nav -->
            <div class="mb-12 flex justify-between items-center">
                <a href="/hugosantosquelca/blog" class="text-zinc-500 hover:text-[#00ff44] transition-colors flex items-center gap-2 text-sm uppercase tracking-widest font-bold">
                    <span>←</span> Volver al Blog
                </a>
                
                {#if $user}
                    <div class="flex gap-4">
                        {#if !isEditing}
                            <button onclick={() => isEditing = true} class="bg-[#ffd700] text-black px-6 py-2 rounded-full text-xs font-bold uppercase tracking-widest hover:scale-105 transition-transform">
                                Editar
                            </button>
                        {:else}
                            <button onclick={deletePost} disabled={isSaving} class="bg-red-600 text-white px-6 py-2 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-red-700 transition-colors">
                                Eliminar
                            </button>
                            <button onclick={() => isEditing = false} class="border border-zinc-700 text-zinc-400 px-6 py-2 rounded-full text-xs font-bold uppercase tracking-widest hover:text-white transition-colors">
                                Cancelar
                            </button>
                            <button onclick={savePost} disabled={isSaving} class="bg-[#00ff44] text-black px-6 py-2 rounded-full text-xs font-bold uppercase tracking-widest hover:scale-105 transition-transform">
                                {isSaving ? 'Guardando...' : 'Guardar'}
                            </button>
                        {/if}
                    </div>
                {/if}
            </div>

            <!-- Content -->
            {#if isEditing}
                <div class="bg-zinc-900/50 p-8 rounded-2xl border border-zinc-800 space-y-6">
                    <div>
                        <label class="block text-zinc-400 text-xs uppercase tracking-widest mb-2" for="title">Título</label>
                        <input id="title" type="text" bind:value={editData.title} class="w-full bg-black border border-zinc-800 text-white rounded-lg px-4 py-3 focus:border-[#ffd700] outline-none" />
                    </div>
                    <div>
                        <label class="block text-zinc-400 text-xs uppercase tracking-widest mb-2" for="cover">Imagen de Portada</label>
                        <div class="flex items-center gap-4">
                            <input 
                                id="cover" 
                                type="file" 
                                accept="image/*"
                                onchange={handleImageUpload} 
                                disabled={isUploading}
                                class="w-full bg-black border border-zinc-800 text-white rounded-lg px-4 py-2 focus:border-[#ffd700] outline-none file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#ffd700] file:text-black hover:file:bg-white transition-colors cursor-pointer"
                            />
                            {#if isUploading}
                                <span class="text-[#ffd700] animate-pulse whitespace-nowrap text-sm font-bold uppercase tracking-widest">Subiendo...</span>
                            {/if}
                        </div>
                        {#if editData.coverImage}
                            <div class="mt-4 relative inline-block rounded-lg overflow-hidden border border-zinc-800">
                                <img src={editData.coverImage} alt="Preview" class="h-32 w-auto object-cover" />
                                <button onclick={() => editData.coverImage = ''} class="absolute top-2 right-2 bg-black/80 text-white w-8 h-8 rounded-full flex items-center justify-center hover:bg-red-600 transition-colors" title="Eliminar imagen">×</button>
                            </div>
                        {/if}
                    </div>
                    <div>
                        <label class="block text-zinc-400 text-xs uppercase tracking-widest mb-2" for="excerpt">Resumen (SEO y Lista)</label>
                        <textarea id="excerpt" bind:value={editData.excerpt} rows="2" class="w-full bg-black border border-zinc-800 text-white rounded-lg px-4 py-3 focus:border-[#ffd700] outline-none"></textarea>
                    </div>
                    <div>
                        <label class="block text-zinc-400 text-xs uppercase tracking-widest mb-2" for="content">Contenido HTML</label>
                        <textarea id="content" bind:value={editData.content} rows="15" class="w-full bg-black border border-zinc-800 text-zinc-300 font-mono text-sm rounded-lg px-4 py-3 focus:border-[#ffd700] outline-none"></textarea>
                    </div>
                </div>
            {:else}
                <!-- View Mode -->
                <article class="prose prose-invert prose-lg md:prose-xl max-w-none">
                    {#if post?.coverImage}
                        <img src={post.coverImage} alt={post.title} class="w-full h-64 md:h-96 object-cover rounded-2xl mb-12 shadow-2xl shadow-black/50" />
                    {/if}
                    
                    <div class="mb-12">
                        <h1 class="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-zinc-400 mb-6 leading-tight">
                            {post?.title}
                        </h1>
                        <div class="flex items-center gap-4 text-zinc-500 text-sm font-bold tracking-widest uppercase border-b border-zinc-800 pb-8">
                            <span class="text-[#ffd700]">{post?.author || 'Dr. Hugo Santos Quelca'}</span>
                            <span>•</span>
                            <span>{post?.createdAt ? new Date(post.createdAt).toLocaleDateString('es-ES', { month: 'long', day: 'numeric', year: 'numeric' }) : 'Reciente'}</span>
                        </div>
                    </div>

                    <div class="text-zinc-300 leading-relaxed font-light [&>h2]:text-[#00ff44] [&>h2]:font-bold [&>h2]:text-3xl [&>h2]:mt-12 [&>h2]:mb-6 [&>p]:mb-6 [&>ul]:list-disc [&>ul]:pl-6 [&>ul]:mb-6 [&>li]:mb-2">
                        {@html post?.content}
                    </div>
                </article>
            {/if}
        </div>
    </div>
{/if}

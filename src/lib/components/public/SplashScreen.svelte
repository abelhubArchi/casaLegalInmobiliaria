<script>
    import { fade } from 'svelte/transition';
    import logoCasaLegal from '$lib/assets/logo.webp';

    let { message = "Construyendo tu futuro...", isVisible = true } = $props();
</script>

{#if isVisible}
    <div 
        class="fixed inset-0 z-[100] bg-white flex flex-col items-center justify-center"
        out:fade={{ duration: 800 }}
    >
        <div class="relative w-40 h-40 md:w-56 md:h-56 mb-8 rounded-full overflow-hidden shadow-[0_0_50px_rgba(212,175,55,0.4)] animate-pulse-fast">
            <img src={logoCasaLegal} alt="Cargando Casa Legal" class="w-full h-full object-cover scale-110 animate-zoom-in" />
            <div class="absolute inset-0 border-4 border-t-[var(--color-brand-gold)] border-r-transparent border-b-transparent border-l-[var(--color-brand-green)] rounded-full animate-spin-slow"></div>
        </div>
        <h1 class="text-3xl md:text-5xl font-black text-[var(--color-brand-green)] tracking-tight animate-fade-up">
            CASA <span class="text-[var(--color-brand-gold)]">LEGAL</span>
        </h1>
        <p class="text-slate-500 uppercase tracking-[0.2em] font-bold text-sm mt-3 animate-fade-up-delay text-center px-4">
            {message}
        </p>
    </div>
{/if}

<style>
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

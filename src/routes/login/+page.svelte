<script>
    import { login } from '$lib/firebase/auth';
    import { goto } from '$app/navigation';
    import { Loader2, Lock, Mail, ArrowRight } from 'lucide-svelte';

    let email = $state('');
    let password = $state('');
    let errorMsg = $state('');
    let loading = $state(false);

    async function handleLogin(e) {
        e.preventDefault();
        loading = true;
        errorMsg = '';

        const result = await login(email, password);
        if (result.success) {
            goto('/admin/terrenos');
        } else {
            errorMsg = "Credenciales incorrectas o error de conexión.";
            loading = false;
        }
    }
</script>

<div class="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
    <div class="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 class="mt-6 text-center text-3xl font-black text-slate-900">
            Acceso <span class="text-[var(--color-brand-green-dark)]">Administrativo</span>
        </h2>
        <p class="mt-2 text-center text-sm text-slate-600">
            Ingresa tus credenciales para gestionar el sistema
        </p>
    </div>

    <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div class="bg-white py-8 px-4 shadow-xl shadow-slate-200/50 sm:rounded-2xl sm:px-10 border border-slate-100">
            <form class="space-y-6" onsubmit={handleLogin}>
                {#if errorMsg}
                    <div class="bg-red-50 text-red-600 p-3 rounded-lg text-sm font-medium border border-red-100">
                        {errorMsg}
                    </div>
                {/if}

                <div>
                    <label for="email" class="block text-sm font-medium text-slate-700">Correo Electrónico</label>
                    <div class="mt-1 relative rounded-md shadow-sm">
                        <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Mail class="h-5 w-5 text-slate-400" />
                        </div>
                        <input
                            id="email"
                            type="email"
                            bind:value={email}
                            required
                            class="focus:ring-brand-green focus:border-brand-green block w-full pl-10 sm:text-sm border-slate-300 rounded-md py-3 px-4 border bg-slate-50 outline-none transition-colors focus:bg-white"
                            placeholder="admin@casalegal.com"
                        />
                    </div>
                </div>

                <div>
                    <label for="password" class="block text-sm font-medium text-slate-700">Contraseña</label>
                    <div class="mt-1 relative rounded-md shadow-sm">
                        <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Lock class="h-5 w-5 text-slate-400" />
                        </div>
                        <input
                            id="password"
                            type="password"
                            bind:value={password}
                            required
                            class="focus:ring-brand-green focus:border-brand-green block w-full pl-10 sm:text-sm border-slate-300 rounded-md py-3 px-4 border bg-slate-50 outline-none transition-colors focus:bg-white"
                            placeholder="••••••••"
                        />
                    </div>
                </div>

                <div>
                    <button
                        type="submit"
                        disabled={loading}
                        class="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-bold text-slate-900 bg-[var(--color-brand-gold)] hover:bg-[var(--color-brand-gold-light)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-gold transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {#if loading}
                            <Loader2 class="w-5 h-5 animate-spin" />
                            Ingresando...
                        {:else}
                            Iniciar Sesión <ArrowRight class="w-4 h-4" />
                        {/if}
                    </button>
                </div>
            </form>
            
            <div class="mt-6 text-center">
                <a href="/" class="text-sm font-medium text-slate-500 hover:text-slate-700">
                    &larr; Volver al inicio
                </a>
            </div>
        </div>
    </div>
</div>

<script>
    import { user, authInitialized } from '$lib/firebase/auth';
    import { goto } from '$app/navigation';
    import { Loader2 } from 'lucide-svelte';

    // We use a reactive statement to monitor auth changes
    $effect(() => {
        if ($authInitialized && !$user) {
            // Not authenticated, redirect to login
            goto('/login');
        }
    });
</script>

{#if !$authInitialized}
    <div class="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 class="w-10 h-10 text-brand-green animate-spin" />
    </div>
{:else if $user}
    <!-- Render the admin content if user is logged in -->
    <slot />
{/if}

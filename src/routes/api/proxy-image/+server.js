export async function GET({ url }) {
    const imageUrl = url.searchParams.get('url');
    
    if (!imageUrl) {
        return new Response('Missing url parameter', { status: 400 });
    }

    try {
        // Fetch the image from Firebase Storage using the Node.js server
        // Node.js doesn't care about CORS, so it will download perfectly
        const response = await fetch(imageUrl);
        
        if (!response.ok) {
            throw new Error(`Failed to fetch image: ${response.statusText}`);
        }

        const buffer = await response.arrayBuffer();
        
        // Return the image back to the browser with permissive CORS headers
        return new Response(buffer, {
            headers: {
                'Content-Type': response.headers.get('content-type') || 'image/jpeg',
                'Access-Control-Allow-Origin': '*',
                'Cache-Control': 'public, max-age=86400'
            }
        });
    } catch (e) {
        console.error("Error proxying image:", e);
        return new Response('Error proxying image', { status: 500 });
    }
}

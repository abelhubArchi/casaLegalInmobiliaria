import fs from 'fs/promises';
import path from 'path';
import sharp from 'sharp';

const assetsDir = path.join(process.cwd(), 'src', 'lib', 'assets');

async function optimizeImages(dir) {
    const entries = await fs.readdir(dir, { withFileTypes: true });

    for (let entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            await optimizeImages(fullPath);
        } else if (entry.isFile() && /\.(png|jpe?g)$/i.test(entry.name)) {
            console.log(`Optimizing: ${fullPath}`);
            const webpPath = fullPath.replace(/\.(png|jpe?g)$/i, '.webp');
            
            try {
                await sharp(fullPath)
                    .webp({ quality: 75 })
                    .toFile(webpPath);
                
                console.log(`Created WebP: ${webpPath}`);
                
                // Optional: Delete the original if you want to completely replace them.
                // We will keep them for a moment, and just update the imports in Svelte.
            } catch (err) {
                console.error(`Error optimizing ${fullPath}:`, err);
            }
        }
    }
}

optimizeImages(assetsDir).then(() => console.log('Done optimizing images.')).catch(console.error);

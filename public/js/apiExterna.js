const DISCOGS_TOKEN = "KqgYzYTPkbgXxOtsoXncqjPoQjAobVjDhtdNpyzG";

async function obtenerDatos(releaseId) {
    try {
        const response = await fetch(`https://api.discogs.com/releases/${releaseId}`, {
            headers: {
                'Authorization': `Discogs token=${DISCOGS_TOKEN}`,
                'User-Agent': 'MiAppDePruebaUniversidad/1.0' // Discogs requiere un User-Agent
            }
        });

        if (!response.ok) {
            if (response.status === 404) return null; // No existe
            throw new Error(`Error HTTP: ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error(`Error al obtener data del id ${releaseId}:`, error);
        return null;
    }
}

console.log(obtenerDatos(1));
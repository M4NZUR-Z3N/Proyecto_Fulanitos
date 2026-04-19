// Token de Discogs - No modificar
const DISCOGS_TOKEN = "KqgYzYTPkbgXxOtsoXncqjPoQjAobVjDhtdNpyzG";

// Función para obtener datos de un disco por su ID
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

// Función para buscar datos de un disco por su nombre
async function buscarDatos(query) {
    try {
        const response = await fetch(`https://api.discogs.com/database/search?q=${encodeURIComponent(query)}&type=release&per_page=15`, {
            headers: {
                'Authorization': `Discogs token=${DISCOGS_TOKEN}`,
                'User-Agent': 'MiAppDePruebaUniversidad/1.0'
            }
        });

        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }

        const data = await response.json();
        return data.results; // Retorna array de resultados básicos
    } catch (error) {
        console.error(`Error al buscar ${query}:`, error);
        return [];
    }
}
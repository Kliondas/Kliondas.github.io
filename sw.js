const CACHE_NAME = 'shiny-hunting-cache-v3';
const POKEMON_CACHE = 'pokemon-data-cache-v1';
const SPRITE_CACHE = 'pokemon-sprite-cache-v1';
const PLACEHOLDER_URL = './assets/images/shiny-placeholder.png';

// Basic assets to cache
const urlsToCache = [
    './',
    './index.html',
    './search.html',
    './styles.css',
    './scripts.js',
    './Manifest/manifest.webmanifest',
    './Manifest/shinyhisui.png'
];

// Generate sprite URLs for all Pokemon (up to Gen 9)
const generateSpriteUrls = () => {
    const urls = [];
    // Pokemon count up to Gen 9 (approx. 1008)
    for (let i = 1; i <= 1008; i++) {
        urls.push(`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${i}.png`);
        urls.push(`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/${i}.png`);
    }
    return urls;
};

// Cache Pokemon data on install
self.addEventListener('install', event => {
    event.waitUntil(
        Promise.all([
            caches.open(CACHE_NAME),
            caches.open(POKEMON_CACHE),
            caches.open(SPRITE_CACHE),
            initPokemonCache()
        ])
    );
});

// Initialize Pokemon cache
async function initPokemonCache() {
    try {
        const response = await fetch('https://pokeapi.co/api/v2/pokemon?limit=1008');
        const data = await response.json();
        
        const pokemonCache = await caches.open(POKEMON_CACHE);
        const spriteCache = await caches.open(SPRITE_CACHE);
        
        // Cache basic Pokemon list
        await pokemonCache.put(
            'pokemonList',
            new Response(JSON.stringify(data.results))
        );

        // Cache individual Pokemon data in chunks
        const chunkSize = 50;
        for (let i = 0; i < data.results.length; i += chunkSize) {
            const chunk = data.results.slice(i, i + chunkSize);
            await Promise.all(chunk.map(async pokemon => {
                try {
                    // Cache Pokemon data
                    const pokemonResponse = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemon.name}`);
                    const pokemonData = await pokemonResponse.json();
                    await pokemonCache.put(
                        `pokemon-${pokemon.name}`,
                        new Response(JSON.stringify(pokemonData))
                    );

                    // Cache sprites
                    await spriteCache.put(
                        pokemonData.sprites.front_default,
                        await fetch(pokemonData.sprites.front_default)
                    );
                    if (pokemonData.sprites.front_shiny) {
                        await spriteCache.put(
                            pokemonData.sprites.front_shiny,
                            await fetch(pokemonData.sprites.front_shiny)
                        );
                    }
                } catch (error) {
                    console.error(`Failed to cache ${pokemon.name}:`, error);
                }
            }));
        }
    } catch (error) {
        console.error('Failed to initialize Pokemon cache:', error);
    }
}

// Update fetch handler
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request).then(response => {
            if (response) {
                return response;
            }
            return fetch(event.request);
        })
    );
});

// Clean up old caches
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME && cacheName !== SPRITE_CACHE && cacheName !== POKEMON_CACHE) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

document.addEventListener('DOMContentLoaded', () => {
    const pokemonList = [
        { name: 'Bulbasaur', image: 'bulbasaur.png' },
        { name: 'Charmander', image: 'charmander.png' },
        { name: 'Squirtle', image: 'squirtle.png' },
        // mehr pokemon
    ];

    const searchBar = document.getElementById('searchBar');
    const pokemonListDiv = document.getElementById('pokemonList');

    function displayPokemon(pokemon) {
        const pokemonDiv = document.createElement('div');
        pokemonDiv.classList.add('pokemon');
        pokemonDiv.innerHTML = `
            <img src="${pokemon.image}" alt="${pokemon.name}">
            <p>${pokemon.name}</p>
        `;
        pokemonListDiv.appendChild(pokemonDiv);
    }

    function filterPokemon() {
        const searchTerm = searchBar.value.toLowerCase();
        pokemonListDiv.innerHTML = '';
        const filteredPokemon = pokemonList.filter(pokemon => pokemon.name.toLowerCase().includes(searchTerm));
        filteredPokemon.forEach(displayPokemon);
    }

    searchBar.addEventListener('input', filterPokemon);

    // Initiale Anzeige aller Pokémon
    pokemonList.forEach(displayPokemon);
});
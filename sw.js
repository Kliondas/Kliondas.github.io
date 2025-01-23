const CACHE_NAME = 'shiny-hunting-cache-v2';
const SPRITE_BASE_URL = 'https://play.pokemonshowdown.com/sprites/gen5/shiny/';

const urlsToCache = [
    '/',
    '/index.html',
    '/styles.css',
    '/scripts.js',
    '/assets/images/shiny-placeholder.png'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            return cache.addAll(urlsToCache);
        })
    );
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request).then(response => {
            // Return cached response if found
            if (response) {
                return response;
            }

            // Clone the request because it can only be used once
            const fetchRequest = event.request.clone();

            // Try fetching from network
            return fetch(fetchRequest).then(response => {
                // Check if valid response
                if (!response || response.status !== 200 || response.type !== 'basic') {
                    return response;
                }

                // Clone the response because it can only be used once
                const responseToCache = response.clone();

                // Cache the fetched resource
                caches.open(CACHE_NAME).then(cache => {
                    // Only cache sprites and essential files
                    if (event.request.url.includes(SPRITE_BASE_URL) || 
                        urlsToCache.includes(event.request.url)) {
                        cache.put(event.request, responseToCache);
                    }
                });

                return response;
            }).catch(() => {
                // If sprite fetch fails, return placeholder
                if (event.request.url.includes(SPRITE_BASE_URL)) {
                    return caches.match('/assets/images/shiny-placeholder.png');
                }
            });
        })
    );
});

// Clean up old caches
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
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
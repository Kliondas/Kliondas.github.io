const CACHE_NAME = 'shiny-hunting-cache-v2';
const SPRITE_CACHE = 'sprite-cache-v1';
const PLACEHOLDER_URL = '/assets/images/shiny-placeholder.png';

// Basic assets to cache
const urlsToCache = [
    '/',
    '/index.html',
    '/styles.css',
    '/scripts.js',
    '/assets/images/shiny-placeholder.png'
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

self.addEventListener('install', event => {
    event.waitUntil(
        Promise.all([
            // Cache basic assets
            caches.open(CACHE_NAME).then(cache => {
                return cache.addAll(urlsToCache);
            }),
            // Cache all sprites
            caches.open(SPRITE_CACHE).then(cache => {
                return cache.addAll(generateSpriteUrls());
            })
        ])
    );
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // Return cached response if found
                if (response) {
                    return response;
                }

                // Clone the request
                const fetchRequest = event.request.clone();

                return fetch(fetchRequest).then(response => {
                    // Check if valid response
                    if (!response || response.status !== 200) {
                        return response;
                    }

                    // Clone the response
                    const responseToCache = response.clone();

                    // Cache the fetched resource
                    caches.open(CACHE_NAME).then(cache => {
                        cache.put(event.request, responseToCache);
                    });

                    return response;
                }).catch(() => {
                    // Return placeholder for failed sprite loads
                    if (event.request.url.includes('/sprites/')) {
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
                    if (cacheName !== CACHE_NAME && cacheName !== SPRITE_CACHE) {
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
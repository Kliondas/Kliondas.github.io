const CACHE_NAME = 'shiny-hunting-cache-v2';
const SPRITE_BASE_URL = 'https://play.pokemonshowdown.com/sprites/gen5/shiny/';
const PLACEHOLDER_URL = '/assets/images/shiny-placeholder.png';

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
    if (event.request.url.includes(SPRITE_BASE_URL)) {
        event.respondWith(
            caches.match(event.request)
                .then(cachedResponse => {
                    if (cachedResponse) {
                        return cachedResponse;
                    }
                    return fetch(event.request.clone())
                        .then(response => {
                            if (!response || response.status !== 200) {
                                return caches.match(PLACEHOLDER_URL);
                            }
                            caches.open(CACHE_NAME)
                                .then(cache => {
                                    cache.put(event.request, response.clone());
                                });
                            return response;
                        })
                        .catch(() => caches.match(PLACEHOLDER_URL));
                })
        );
    } else {
        event.respondWith(
            caches.match(event.request)
                .then(response => response || fetch(event.request))
        );
    }
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
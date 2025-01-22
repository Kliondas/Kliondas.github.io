
self.addEventListener('install', event => event.waitUntil(
    caches.open('shiny-hunting-cache-v1').then(cache => cache.add('/'))
));

self.addEventListener('fetch', event => event.respondWith(
    caches.open('shiny-hunting-cache-v1')
        .then(cache => cache.match(event.request))
        .then(response => response || fetch(event.request))
));

const CACHE_NAME = 'shiny-hunting-cache-v1';
const urlsToCache = [
    '/',
    '/index.html',
    '/styles.css',
    '/scripts.js',
    //zusätzliche cache möglichkeiten
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                return cache.addAll(urlsToCache);
            })
    );
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                return response || fetch(event.request);
            })
    );
});

self.addEventListener('fetch', () => void 0);
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
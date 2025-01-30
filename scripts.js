function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

async function fetchPokemonData(pokemonName) {
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonName.toLowerCase()}`);
    if (!response.ok) {
        throw new Error('Pokémon not found');
    }
    const data = await response.json();
    return data;
}

async function fetchAndStorePokemonData(pokemonName) {
    const data = await fetchPokemonData(pokemonName);
    localStorage.setItem(pokemonName, JSON.stringify(data));
}

function getStoredPokemonData(pokemonName) {
    const data = localStorage.getItem(pokemonName);
    return data ? JSON.parse(data) : null;
}

// Add loading state and error handling 
let isLoading = false;

async function displayPokemonData(pokemonName) {
    const loadingDiv = document.createElement('div');
    loadingDiv.className = 'loading-spinner';
    loadingDiv.textContent = 'Loading...';
    
    const pokemonList = document.getElementById('pokemonList');
    pokemonList.innerHTML = '';
    pokemonList.appendChild(loadingDiv);
    
    try {
        isLoading = true;
        const data = await fetchPokemonData(pokemonName);
        
        if (!data) throw new Error('Pokemon not found');
        
        pokemonList.innerHTML = `
            <div class="pokemon">
                <h3>${capitalizeFirstLetter(data.name)}</h3>
                <img src="${data.sprites.front_default}" alt="${data.name}">
                <img src="${data.sprites.front_shiny}" alt="${data.name} shiny">
            </div>
        `;
    } catch (error) {
        pokemonList.innerHTML = `
            <div class="error-message">
                Pokemon "${pokemonName}" not found. Please try again.
            </div>
        `;
    } finally {
        isLoading = false;
    }
}

async function recommendPokemon(searchTerm) {
    try {
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon?limit=1000`);
        const data = await response.json();
        const filteredPokemon = data.results.filter(pokemon => 
            pokemon.name.toLowerCase().startsWith(searchTerm.toLowerCase())
        );

        const pokemonListDiv = document.getElementById('pokemonList');
        pokemonListDiv.innerHTML = '';

        for (const pokemon of filteredPokemon) {
            const pokemonData = await fetchPokemonData(pokemon.name);
            const pokemonDiv = document.createElement('div');
            pokemonDiv.classList.add('pokemon');
            pokemonDiv.setAttribute('data-name', pokemon.name);
            pokemonDiv.innerHTML = `
                <img src="${pokemonData.sprites.front_default}" alt="${pokemon.name}">
                <p>${capitalizeFirstLetter(pokemon.name)}</p>
            `;
            pokemonDiv.addEventListener('click', async () => {
                await displayPokemonData(pokemon.name);
            });
            pokemonListDiv.appendChild(pokemonDiv);
        }
    } catch (error) {
        console.error(error);
    }
}

document.getElementById('searchBar').addEventListener('input', async (event) => {
    const searchTerm = event.target.value.trim();
    if (searchTerm) {
        await recommendPokemon(searchTerm);
    } else {
        document.getElementById('pokemonList').innerHTML = '';
    }
});

document.getElementById('searchBar').addEventListener('keypress', async (event) => {
    if (event.key === 'Enter') {
        const searchTerm = event.target.value.trim();
        const pokemonListDiv = document.getElementById('pokemonList');
        const recommendations = pokemonListDiv.querySelectorAll('.pokemon');
        if (recommendations.length === 1) {
            const pokemonName = recommendations[0].getAttribute('data-name');
            await displayPokemonData(pokemonName);
        } else if (searchTerm) {
            await recommendPokemon(searchTerm);
        }
    }
});

document.getElementById('calculateButton').addEventListener('click', calculateProbability);
document.getElementById('incrementResets').addEventListener('click', incrementResets);
document.getElementById('recommendButton').addEventListener('click', recommendMethod);

document.getElementById('selectAllGames').addEventListener('click', () => {
    document.querySelectorAll('.game input[type="checkbox"]:nth-child(2)').forEach(checkbox => {
        checkbox.checked = true;
    });
});

document.getElementById('selectAllShinyCharms').addEventListener('click', () => {
    document.querySelectorAll('.game input[name$="ShinyCharm"]').forEach(checkbox => {
        checkbox.checked = true;
    });
});

document.getElementById('selectAllOvalCharms').addEventListener('click', () => {
    document.querySelectorAll('.game input[name$="OvalCharm"]').forEach(checkbox => {
        checkbox.checked = true;
    });
});

const shinyOdds = {
    swordShield: 4096,
    sunMoon: 4096,
    xY: 4096,
    // Add more games and their odds as needed
};

function calculateProbability() {
    const game = document.getElementById('game').value;
    const shinyCharm = document.getElementById('shinyCharm').checked;
    const ovalCharm = document.getElementById('ovalCharm').checked;
    const target = document.getElementById('target').value;
    const resets = parseInt(document.getElementById('resets').value, 10);

    const baseRate = 1 / shinyOdds[game];
    const charmBonus = shinyCharm ? 2 : 1;
    const probability = 1 - Math.pow(1 - (baseRate * charmBonus), resets);
    const resetsNeeded = calculateResetsFor90Percent(baseRate, charmBonus);

    document.getElementById('probability').textContent = `Probability: ${probability.toFixed(2)}%`;
    document.getElementById('resetsNeeded').textContent = `Resets needed for 90% probability: ${resetsNeeded}`;
}

function calculateResetsFor90Percent(baseRate, charmBonus) {
    const targetProbability = 0.9;
    const resetsNeeded = Math.log(1 - targetProbability) / Math.log(1 - (baseRate * charmBonus));
    return Math.ceil(resetsNeeded);
}

function incrementResets() {
    const resetsInput = document.getElementById('resets');
    resetsInput.value = parseInt(resetsInput.value, 10) + 1;
    calculateProbability();
}

function recommendMethod() {
    // Logic to recommend the most effective shiny hunt method
    alert('Empfohlene Methode wird hier angezeigt.');
}

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('selectAllGames')?.addEventListener('click', () => {
        document.querySelectorAll('.game input[name]:not([name$="ShinyCharm"]):not([name$="OvalCharm"])')
            .forEach(checkbox => checkbox.checked = true);
    });

    document.getElementById('selectAllShinyCharms')?.addEventListener('click', () => {
        document.querySelectorAll('.game input[name$="ShinyCharm"]')
            .forEach(checkbox => checkbox.checked = true);
    });

    document.getElementById('selectAllOvalCharms')?.addEventListener('click', () => {
        document.querySelectorAll('.game input[name$="OvalCharm"]')
            .forEach(checkbox => checkbox.checked = true);
    });
});

function updateHuntingMethod(pokemonName) {
    const selectedGame = document.querySelector('.game input[type="checkbox"]:checked');
    const hasShinyCharm = document.querySelector(`input[name="${selectedGame.id}ShinyCharm"]`)?.checked;
    const huntingMethodDiv = document.getElementById('huntingMethod');
    
    // Example hunting method logic - customize based on your needs
    const method = determineHuntingMethod(pokemonName, selectedGame.id, hasShinyCharm);
    
    huntingMethodDiv.innerHTML = `
        <h4>Best Hunting Method:</h4>
        <p>${method.name}</p>
        <p>Odds: 1/${method.odds}</p>
        <p>Steps: ${method.steps.join(', ')}</p>
    `;
}

function determineHuntingMethod(pokemonName, game, hasShinyCharm) {
    // Add your logic to determine the best hunting method
    // This is a simple example
    return {
        name: "Masuda Method",
        odds: hasShinyCharm ? "512" : "683",
        steps: [
            "1. Get a foreign Ditto",
            "2. Place it in the daycare with your target Pokémon",
            "3. Collect and hatch eggs"
        ]
    };
}

if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then(function(registrations) {
        for(let registration of registrations) {
            registration.unregister();
        }
    });
}

let pokemonCache = new Map();

async function searchPokemon(searchTerm) {
    const searchResults = document.getElementById('pokemonList');
    searchResults.innerHTML = '<div class="loading">Searching...</div>';
    
    try {
        if (!pokemonCache.size) {
            const cache = await caches.open(POKEMON_CACHE);
            const response = await cache.match('pokemonList');
            if (response) {
                const data = await response.json();
                data.forEach(pokemon => pokemonCache.set(pokemon.name, pokemon));
            }
        }

        const filteredPokemon = Array.from(pokemonCache.values())
            .filter(pokemon => pokemon.name.includes(searchTerm.toLowerCase()))
            .slice(0, 10);

        if (filteredPokemon.length === 0) {
            searchResults.innerHTML = '<div class="no-results">No Pokemon found</div>';
            return;
        }

        const detailedResults = await Promise.all(
            filteredPokemon.map(async pokemon => {
                try {
                    const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemon.name}`);
                    return response.json();
                } catch (error) {
                    console.error(`Failed to fetch ${pokemon.name}:`, error);
                    return null;
                }
            })
        );

        displayPokemonResults(detailedResults.filter(Boolean));
    } catch (error) {
        console.error('Search failed:', error);
        searchResults.innerHTML = '<div class="error">Search failed. Please try again.</div>';
    }
}

function displayPokemonResults(pokemonData) {
    const searchResults = document.getElementById('pokemonList');
    searchResults.innerHTML = pokemonData
        .map(pokemon => `
            <div class="pokemon-card">
                <h3>${pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)}</h3>
                <div class="sprite-container">
                    <img src="${pokemon.sprites.front_default}" alt="${pokemon.name}" loading="lazy">
                    <img src="${pokemon.sprites.front_shiny}" alt="${pokemon.name} shiny" loading="lazy">
                </div>
            </div>
        `)
        .join('');
}

const debouncedSearch = debounce(searchTerm => searchPokemon(searchTerm), 300);

document.getElementById('searchBar')?.addEventListener('input', event => {
    debouncedSearch(event.target.value.trim());
});

// Debounce search input
const debounce = (func, wait) => {
    let timeout;
    return (...args) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
    };
};
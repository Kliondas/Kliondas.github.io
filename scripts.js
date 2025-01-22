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

async function displayPokemonData(pokemonName) {
    try {
        const data = await fetchPokemonData(pokemonName);
        const pokemonListDiv = document.getElementById('pokemonList');
        pokemonListDiv.innerHTML = `
            <div class="pokemon">
                <img src="${data.sprites.front_default}" alt="${data.name}">
                <p>${capitalizeFirstLetter(data.name)}</p>
            </div>
        `;
    } catch (error) {
        console.error(error);
        alert('Pokémon not found');
    }
}

async function recommendPokemon(searchTerm) {
    try {
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon?limit=1000`);
        const data = await response.json();
        const filteredPokemon = data.results.filter(pokemon => 
            pokemon.name.toLowerCase().includes(searchTerm.toLowerCase())
        );

        const pokemonListDiv = document.getElementById('pokemonList');
        pokemonListDiv.innerHTML = filteredPokemon.map(pokemon => `
            <div class="pokemon" data-name="${pokemon.name}">
                <p>${capitalizeFirstLetter(pokemon.name)}</p>
            </div>
        `).join('');
        
        document.querySelectorAll('.pokemon').forEach(pokemonDiv => {
            pokemonDiv.addEventListener('click', async () => {
                const pokemonName = pokemonDiv.getAttribute('data-name');
                await displayPokemonData(capitalizeFirstLetter(pokemonName));
            });
        });
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
            await displayPokemonData(capitalizeFirstLetter(pokemonName));
        } else if (searchTerm) {
            await displayPokemonData(capitalizeFirstLetter(searchTerm));
        }
    }
});
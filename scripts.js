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

function calculateProbability() {
    const game = document.getElementById('game').value;
    const shinyCharm = document.getElementById('shinyCharm').checked;
    const ovalCharm = document.getElementById('ovalCharm').checked;
    const target = document.getElementById('target').value;
    const resets = parseInt(document.getElementById('resets').value, 10);

    const probability = calculateShinyProbability(game, shinyCharm, ovalCharm, target, resets);
    const resetsNeeded = calculateResetsFor90Percent(game, shinyCharm, ovalCharm, target);

    document.getElementById('probability').textContent = `Probability: ${probability.toFixed(2)}%`;
    document.getElementById('resetsNeeded').textContent = `Resets needed for 90% probability: ${resetsNeeded}`;
}

function incrementResets() {
    const resetsInput = document.getElementById('resets');
    resetsInput.value = parseInt(resetsInput.value, 10) + 1;
    calculateProbability();
}
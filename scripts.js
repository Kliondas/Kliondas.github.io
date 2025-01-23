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
        const modal = document.getElementById('pokemonModal');
        const modalPokemonName = document.getElementById('modalPokemonName');
        const normalSprite = document.getElementById('normalSprite');
        const shinySprite = document.getElementById('shinySprite');
        
        // Set normal sprite from PokeAPI
        normalSprite.src = data.sprites.front_default;
        
        // Try alternative shiny sprite sources
        const shinySpriteSources = [
            `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/${data.id}.png`,
            `https://play.pokemonshowdown.com/sprites/gen5/shiny/${pokemonName.toLowerCase()}.png`
        ];

        let spriteLoaded = false;
        
        for (const source of shinySpriteSources) {
            try {
                const response = await fetch(source);
                if (response.ok) {
                    shinySprite.src = source;
                    spriteLoaded = true;
                    break;
                }
            } catch (error) {
                continue;
            }
        }

        if (!spriteLoaded) {
            shinySprite.src = '/assets/images/shiny-placeholder.png';
        }
        
        modalPokemonName.textContent = capitalizeFirstLetter(pokemonName);
        modal.style.display = "block";
        
        // Close modal handlers
        document.querySelector('.close').onclick = () => {
            modal.style.display = "none";
        }
        
        window.onclick = (event) => {
            if (event.target == modal) {
                modal.style.display = "none";
            }
        }
        
        updateHuntingMethod(pokemonName);
    } catch (error) {
        console.error('Error loading Pokemon data:', error);
        const modal = document.getElementById('pokemonModal');
        const modalPokemonName = document.getElementById('modalPokemonName');
        modalPokemonName.textContent = capitalizeFirstLetter(pokemonName);
        modal.style.display = "block";
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

// Add this at the end of your existing script.js file
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

// Add this code at the end of scripts.js
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then(function(registrations) {
        for(let registration of registrations) {
            registration.unregister();
        }
    });
}
const SHINY_RATES = {
    oldGen: 1/8192,
    newGen: 1/4096
};

const METHOD_MULTIPLIERS = {
    random: 1,
    masuda: 6,
    chain: 2.5,
    sos: 4,
    radar: 8
};

function getBaseRate(game) {
    const oldGenGames = ['goldSilver', 'crystal', 'rubySapphire', 'emerald', 
                        'fireRedLeafGreen', 'diamondPearl', 'platinum', 
                        'heartGoldSoulSilver', 'blackWhite', 'black2White2'];
    return oldGenGames.includes(game) ? SHINY_RATES.oldGen : SHINY_RATES.newGen;
}

function calculateShinyProbability(game, method, shinyCharm, resets) {
    const baseRate = getBaseRate(game);
    const methodMultiplier = METHOD_MULTIPLIERS[method] || 1;
    const charmMultiplier = shinyCharm ? 3 : 1;
    
    const encounterRate = baseRate * methodMultiplier * charmMultiplier;
    const probability = 1 - Math.pow(1 - encounterRate, resets);
    
    return probability * 100;
}

function calculateResetsFor90Percent(game, method, shinyCharm) {
    const baseRate = getBaseRate(game);
    const methodMultiplier = METHOD_MULTIPLIERS[method] || 1;
    const charmMultiplier = shinyCharm ? 3 : 1;
    
    const encounterRate = baseRate * methodMultiplier * charmMultiplier;
    const targetProbability = 0.9;
    
    return Math.ceil(Math.log(1 - targetProbability) / Math.log(1 - encounterRate));
}

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('calculatorForm');
    const calculateButton = document.getElementById('calculateButton');
    
    calculateButton.addEventListener('click', () => {
        const game = document.getElementById('game').value;
        const method = document.getElementById('method').value;
        const shinyCharm = document.getElementById('shinyCharm').checked;
        const resets = parseInt(document.getElementById('resets').value) || 0;
        
        if (!game) {
            alert('Please select a game');
            return;
        }
        
        const currentProbability = calculateShinyProbability(game, method, shinyCharm, resets);
        const resetsNeeded = calculateResetsFor90Percent(game, method, shinyCharm);
        const baseRate = getBaseRate(game);
        
        document.getElementById('currentProbability').textContent = 
            `${currentProbability.toFixed(2)}%`;
        document.getElementById('encountersFor90').textContent = 
            `${resetsNeeded.toLocaleString()} encounters`;
        document.getElementById('baseOdds').textContent = 
            `1 in ${(1/baseRate).toLocaleString()}`;
    });
    
    // Update available methods based on game selection
    document.getElementById('game').addEventListener('change', (e) => {
        const methodSelect = document.getElementById('method');
        const game = e.target.value;
        
        // Reset methods
        methodSelect.innerHTML = '<option value="random">Random Encounter</option>';
        
        // Add game-specific methods
        if (['sunMoon', 'ultraSunMoon'].includes(game)) {
            methodSelect.innerHTML += '<option value="sos">SOS Battles</option>';
        }
        if (['diamondPearl', 'platinum'].includes(game)) {
            methodSelect.innerHTML += '<option value="radar">Poké Radar</option>';
        }
        if (game !== 'goldSilver' && game !== 'crystal') {
            methodSelect.innerHTML += '<option value="masuda">Masuda Method</option>';
        }
        if (['xY', 'orasAlpha'].includes(game)) {
            methodSelect.innerHTML += '<option value="chain">Chain Fishing</option>';
        }
    });
});
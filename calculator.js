const SHINY_RATES = {
    oldGen: 1/8192,
    newGen: 1/4096
};

const METHOD_MULTIPLIERS = {
    random: 1,
    masuda: 6,
    masudaCharm: 8,
    luckyCharm: 2.5, 
    chain: 2.5,
    chainMax: 41,
    sos: 4,
    sosMax: 13,
    radar: 8,
    radarMax: 40,
    friendSafari: 5.46,
    dexNav: 6,
    dynamaxAdventure: 100,
    massOutbreak: 25,         
    massiveOutbreak: 12.8,     
    outbreakChain: 32.8,
    letsGoCatch: 4,      
    letsGoMaxCatch: 11,  
    letsGoLure: 1.5,     
    bdspRadar: 4,        
    bdspRadarMax: 41,    
    legends: 1,
    sandwich60: 6,       
    sandwich100: 10,     
    sandwich200: 20,     
    outbreakSV: 4,
    outbreakSVCharm: 6,
    researchLevel10: 2,        
    perfectResearch: 4,        
    outbreakPerfect: 32.8      
};

function getBaseRate(game) {
    const oldGenGames = ['goldSilver', 'crystal', 'rubySapphire', 'emerald', 
                        'fireRedLeafGreen', 'diamondPearl', 'platinum', 
                        'heartGoldSoulSilver', 'blackWhite', 'black2White2'];
    return oldGenGames.includes(game) ? SHINY_RATES.oldGen : SHINY_RATES.newGen;
}

function calculateShinyProbability(game, method, shinyCharm, resets) {
    const baseRate = getBaseRate(game);
    let methodMultiplier = METHOD_MULTIPLIERS[method] || 1;
    const charmMultiplier = shinyCharm ? 3 : 1;

    // Lucky Charm specific calculation
    if (method === 'luckyCharm') {
        return (1 - Math.pow(1 - (baseRate * methodMultiplier), resets)) * 100;
    }
    
    return (1 - Math.pow(1 - (baseRate * methodMultiplier * charmMultiplier), resets)) * 100;
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
            `1 in ${Math.round(1/baseRate).toLocaleString()}`;
        
        const huntRate = 1 / (baseRate * methodMultiplier * charmMultiplier);
        document.getElementById('huntOdds').textContent = 
            `1 in ${Math.round(huntRate).toLocaleString()}`;
    });
    
    // Update available methods based on game selection
    document.getElementById('game').addEventListener('change', (e) => {
        const methodSelect = document.getElementById('method');
        const game = e.target.value;
        
        // Reset methods
        methodSelect.innerHTML = '<option value="random">Random Encounter</option>';
        
        // Add game-specific methods
        switch(game) {
            // Gen 4
            case 'diamondPearl':
            case 'platinum':
                methodSelect.innerHTML += '<option value="radar">Poké Radar</option>';
                methodSelect.innerHTML += '<option value="radarMax">Poké Radar (40 Chain)</option>';
                break;
            // Gen 5
            case 'blackWhite':
                methodSelect.innerHTML += '<option value="masuda">Masuda Method</option>';
                break;
            case 'black2White2':
                methodSelect.innerHTML += '<option value="masuda">Masuda Method</option>';
                methodSelect.innerHTML += '<option value="luckyCharm">Lucky Charm</option>';
                break;
            // Gen 6
            case 'xY':
                methodSelect.innerHTML += '<option value="chain">Chain Fishing</option>';
                methodSelect.innerHTML += '<option value="chainMax">Chain Fishing (41+)</option>';
                methodSelect.innerHTML += '<option value="friendSafari">Friend Safari</option>';
                methodSelect.innerHTML += '<option value="masuda">Masuda Method</option>';
                methodSelect.innerHTML += '<option value="masudaCharm">Masuda Method + Charm</option>';
                break;
            // Gen 7
            case 'sunMoon':
            case 'ultraSunMoon':
                methodSelect.innerHTML += '<option value="sos">SOS Battles</option>';
                methodSelect.innerHTML += '<option value="sosMax">SOS Battles (31+)</option>';
                methodSelect.innerHTML += '<option value="masuda">Masuda Method</option>';
                methodSelect.innerHTML += '<option value="masudaCharm">Masuda Method + Charm</option>';
                break;
            // Gen 7 Let's Go
            case 'letsGo':
                methodSelect.innerHTML += '<option value="letsGoLure">Lure</option>';
                methodSelect.innerHTML += '<option value="letsGoCatch">Catch Combo (31+)</option>';
                methodSelect.innerHTML += '<option value="letsGoMaxCatch">Catch Combo (31+) + Lure</option>';
                break;
            // Gen 8
            case 'swordShield':
                methodSelect.innerHTML += '<option value="masuda">Masuda Method</option>';
                methodSelect.innerHTML += '<option value="masudaCharm">Masuda Method + Charm</option>';
                methodSelect.innerHTML += '<option value="dynamaxAdventure">Dynamax Adventure</option>';
                break;
            case 'bdsp':
                methodSelect.innerHTML += '<option value="bdspRadar">Poké Radar</option>';
                methodSelect.innerHTML += '<option value="bdspRadarMax">Poké Radar (40 Chain)</option>';
                methodSelect.innerHTML += '<option value="masuda">Masuda Method</option>';
                methodSelect.innerHTML += '<option value="masudaCharm">Masuda Method + Charm</option>';
                break;
            // Gen 8 Legends
            case 'legendsArceus':
                methodSelect.innerHTML += '<option value="massOutbreak">Mass Outbreak</option>';
                methodSelect.innerHTML += '<option value="massiveOutbreak">Massive Mass Outbreak</option>';
                methodSelect.innerHTML += '<option value="researchLevel10">Research Level 10</option>';
                methodSelect.innerHTML += '<option value="perfectResearch">Perfect Research</option>';
                methodSelect.innerHTML += '<option value="outbreakPerfect">Mass Outbreak + Perfect Research</option>';
                break;
            // Gen 9
            case 'scarletViolet':
                methodSelect.innerHTML += '<option value="sandwich60">Sparkling Power Lv. 1</option>';
                methodSelect.innerHTML += '<option value="sandwich100">Sparkling Power Lv. 2</option>';
                methodSelect.innerHTML += '<option value="sandwich200">Sparkling Power Lv. 3</option>';
                methodSelect.innerHTML += '<option value="outbreakSV">Mass Outbreak</option>';
                methodSelect.innerHTML += '<option value="outbreakSVCharm">Mass Outbreak + Charm</option>';
                methodSelect.innerHTML += '<option value="masuda">Masuda Method</option>';
                methodSelect.innerHTML += '<option value="masudaCharm">Masuda Method + Charm</option>';
                break;
        }
    });
});
function calculateShinyProbability(game, shinyCharm, ovalCharm, target, resets) {
    // Example calculation logic
    const baseRate = 1 / 4096;
    const charmBonus = shinyCharm ? 2 : 1;
    const probability = 1 - Math.pow(1 - (baseRate * charmBonus), resets);
    return probability * 100;
}

function calculateResetsFor90Percent(game, shinyCharm, ovalCharm, target) {
    // Example calculation logic
    const baseRate = 1 / 4096;
    const charmBonus = shinyCharm ? 2 : 1;
    const targetProbability = 0.9;
    const resetsNeeded = Math.log(1 - targetProbability) / Math.log(1 - (baseRate * charmBonus));
    return Math.ceil(resetsNeeded);
}
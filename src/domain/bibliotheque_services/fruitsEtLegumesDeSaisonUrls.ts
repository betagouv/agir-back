export function generateFishUrlForCurrentMonth(currentMonth:number): string {
    const months = [
        "de-janvier", "de-fevrier", "de-mars", "d-avril", "de-mai", "de-juin",
        "de-juillet", "d-aout", "de-septembre", "d-octobre", "de-novembre", "de-decembre"
    ];

    return `https://www.mangerbouger.fr/manger-mieux/bien-manger-sans-se-ruiner/calendrier-de-saison/les-poissons-et-fruits-de-mer-${months[currentMonth]}`;
}


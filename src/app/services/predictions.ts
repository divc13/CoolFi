export let predictions: Record<string, number[]> = {};

export function updatePredictions(newPredictions: Record<string, number[]>) {
    predictions = newPredictions;
}

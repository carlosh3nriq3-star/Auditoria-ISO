import type { ChecklistItemData } from '../types';

export async function generateObservation(item: ChecklistItemData, standardName: string): Promise<string> {
  try {
    const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ item, standardName }),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to parse error response from server.' }));
        console.error("Error from API:", errorData.error);
        throw new Error(errorData.error || 'Failed to generate observation');
    }

    const data = await response.json();
    return data.observation;

  } catch (error) {
    console.error("Error calling generation API:", error);
    return "Ocorreu um erro ao gerar a observação. Por favor, tente novamente ou insira manualmente.";
  }
}

import type { AuditInfo, ChecklistItemData, ObservationData } from '../types';

async function callApi<T>(action: string, payload: unknown): Promise<T> {
    try {
        const response = await fetch('/api/gemini', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ action, payload }),
        });

        const data = await response.json();

        if (!response.ok) {
            console.error('API Error:', data);
            throw new Error(data.error || `API request failed with status ${response.status}`);
        }
        
        return data.result as T;
    } catch (error) {
        console.error(`API call for action "${action}" failed:`, error);
        // Re-throw the error to be handled by the caller component
        throw error;
    }
}

export async function generateObservations(
    item: ChecklistItemData,
    auditInfo: AuditInfo,
    standardName: string
): Promise<ObservationData> {
    return callApi<ObservationData>('generateObservations', { item, auditInfo, standardName });
}

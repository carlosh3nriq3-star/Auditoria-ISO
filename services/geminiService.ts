import type { AuditInfo, ChecklistItemData, AnalysisData } from '../types';

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
        
        if (action === 'generateObservations') {
            // Return a user-friendly error message for this specific action
            return "Ocorreu um erro ao conectar ao servidor. Por favor, tente novamente." as T;
        }
        
        // For other actions, re-throw the error to be handled by the caller
        throw error;
    }
}

export async function generateObservations(
    item: ChecklistItemData,
    auditInfo: AuditInfo,
    standardName: string
): Promise<string> {
    return callApi<string>('generateObservations', { item, auditInfo, standardName });
}

export async function generateRootCauseAnalysis(
    item: ChecklistItemData,
    auditInfo: AuditInfo,
    standardName: string
): Promise<AnalysisData> {
    try {
      return await callApi<AnalysisData>('generateRootCauseAnalysis', { item, auditInfo, standardName });
    } catch (error) {
      console.error("Gemini API call for root cause analysis failed:", error);
      // Fallback or re-throw a more specific error
      throw new Error("A chamada à API para análise de causa raiz falhou. Verifique os logs do servidor.");
    }
}
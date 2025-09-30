import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI, Type } from "@google/genai";

// --- Types (updated to match frontend) ---
enum Status {
  Conforme = 'Conforme',
  NaoConforme = 'Não Conforme',
  NaoAplicavel = 'Não Aplicável',
  NaoAuditado = 'Não Auditado',
}

interface ObservationData {
  fact?: string;
  evidence?: string;
  requirement?: string;
  justification?: string;
}

interface AuditInfo {
  company: string;
  department: string;
  leadAuditor: string;
  internalAuditors: string;
  auditees: string;
  auditDate: string;
}

interface ChecklistItemData {
  id: string;
  requirement: string;
  description: string;
  status: Status;
  observations: ObservationData | string; // Corrected type
  department: string;
  standardName?: string;
  evidenceImage: { data: string; mimeType: string } | null;
}


// --- Helpers ---
const stringifyObservation = (obs: ObservationData | string): string => {
    if (typeof obs === 'string') {
        return obs;
    }
    if (typeof obs === 'object' && obs !== null) {
        return Object.entries(obs)
            .filter(([, value]) => value)
            .map(([key, value]) => `${key.charAt(0).toUpperCase() + key.slice(1)}: ${value}`)
            .join('; ');
    }
    return '';
};

const cleanJsonString = (rawText: string): string => {
    let text = rawText.trim();
    if (text.startsWith('```json')) {
        text = text.substring(7);
        if (text.endsWith('```')) {
            text = text.slice(0, -3);
        }
    } else if (text.startsWith('```')) {
        text = text.substring(3);
        if (text.endsWith('```')) {
            text = text.slice(0, -3);
        }
    }
    return text.trim();
};


// --- Prompts ---
const getObservationsPrompt = (item: ChecklistItemData, auditInfo: AuditInfo, standardName: string) => `
    Você é um auditor líder sênior de SGI (ISO 9001, 14001, 45001).
    Com base nas informações abaixo, gere uma observação de auditoria.

    **Contexto da Auditoria:**
    - Empresa: ${auditInfo.company}
    - Área Auditada: ${auditInfo.department}
    - Norma: ${standardName}
    - Requisito: ${item.requirement} - ${item.description}
    - Status Selecionado pelo Auditor: "${item.status}"

    **Sua Tarefa:**
    Gere um objeto JSON com base no status:

    - Se o status for "Não Conforme":
        - fact: Descreva um cenário hipotético, porém plausível e específico, que caracterize uma não conformidade para este requisito.
        - evidence: Cite uma evidência objetiva e hipotética que comprovaria o fato (ex: "documento XYZ rev. 02 não encontrado").
        - requirement: Declare o requisito da norma que não foi atendido.

    - Se o status for "Conforme":
        - fact: Descreva uma situação onde o requisito é atendido de forma eficaz.
        - evidence: Cite uma evidência objetiva e hipotética que demonstre a conformidade (ex: "procedimento PO-010 apresentado e implementado").
        - requirement: Afirme que as atividades auditadas estão de acordo com o requisito.

    - Se o status for "Não Aplicável":
        - justification: Forneça uma justificativa técnica e plausível para a não aplicabilidade do requisito.

    - Se o status for "Não Auditado":
        - justification: Forneça um motivo profissional e breve para a não auditoria deste item.

    Retorne APENAS o objeto JSON.
`;

// --- API Handler ---
export default async function handler(req: VercelRequest, res: VercelResponse) {
    const API_KEY = process.env.API_KEY;

    if (!API_KEY) {
        return res.status(500).json({ error: "API_KEY environment variable not set on the server." });
    }

    const ai = new GoogleGenAI({ apiKey: API_KEY });

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { action, payload } = req.body;
    
    if (!action || !payload) {
        return res.status(400).json({ error: 'Missing action or payload' });
    }

    try {
        switch (action) {
            case 'generateObservations': {
                const { item, auditInfo, standardName } = payload;
                const prompt = getObservationsPrompt(item, auditInfo, standardName);
                const response = await ai.models.generateContent({
                    model: 'gemini-2.5-flash',
                    contents: prompt,
                });
                const rawJsonText = response.text;
                if (!rawJsonText) {
                    throw new Error("A resposta da API para gerar observações estava vazia.");
                }
                const cleanedJson = cleanJsonString(rawJsonText);
                const observationData = JSON.parse(cleanedJson);
                return res.status(200).json({ result: observationData });
            }

            default:
                return res.status(400).json({ error: 'Invalid action' });
        }
    } catch (error) {
        console.error(`Error processing action "${action}":`, error);
        const message = error instanceof Error ? error.message : "An unknown error occurred on the server.";
        return res.status(500).json({ error: 'Internal Server Error', details: message });
    }
}
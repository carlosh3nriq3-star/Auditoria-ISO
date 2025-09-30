import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI, Type } from "@google/genai";

// --- Types (moved from types.ts to make the API self-contained) ---
enum Status {
  Conforme = 'Conforme',
  NaoConforme = 'Não Conforme',
  NaoAplicavel = 'Não Aplicável',
  NaoAuditado = 'Não Auditado',
}

interface AnalysisData {
  rootCause: string;
  correctiveActions: string;
  fiveWhys?: string[];
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
  observations: string;
  department: string;
  standardName?: string;
  evidenceImage: { data: string; mimeType: string } | null;
  analysis?: AnalysisData;
}


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

const getFiveWhysPrompt = (item: ChecklistItemData, auditInfo: AuditInfo, standardName: string) => `
    Você é um especialista em sistemas de gestão da qualidade (ISO 9001, 14001, 45001) e um mestre na metodologia de análise de causa raiz "5 Porquês".
    Para a não conformidade identificada abaixo, realize uma análise completa utilizando a técnica dos 5 Porquês.

    **Contexto da Auditoria:**
    - Empresa: ${auditInfo.company}
    - Área Auditada: ${auditInfo.department}

    **Não Conformidade Identificada:**
    - Norma: ${standardName}
    - Requisito: ${item.requirement} - ${item.description}
    - Departamento/Gestão do Requisito: ${item.department}
    - Observação/Evidência (Problema Inicial): ${item.observations}

    **Tarefa:**
    1.  **Análise 5 Porquês:** Começando com o problema inicial, pergunte "Por quê?" cinco vezes, de forma sequencial e lógica, para aprofundar a análise até encontrar a causa fundamental. Cada resposta deve ser a causa do "porquê" anterior. Formate cada passo como uma frase completa, por exemplo: "1. O problema ocorreu PORQUÊ a especificação não foi seguida."
    2.  **Causa Raiz:** Com base na análise dos 5 Porquês, declare de forma clara e concisa a causa raiz fundamental do problema.
    3.  **Ações Corretivas Sugeridas:** Proponha de 2 a 3 ações corretivas claras, objetivas e práticas para eliminar a causa raiz e resolver a não conformidade.

    Retorne sua análise no seguinte formato JSON:
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
                     config: {
                        responseMimeType: "application/json",
                        responseSchema: {
                            type: Type.OBJECT,
                            properties: {
                                fact: { type: Type.STRING, description: 'Descrição do fato observado.' },
                                evidence: { type: Type.STRING, description: 'Descrição da evidência encontrada.' },
                                requirement: { type: Type.STRING, description: 'Descrição do requisito relacionado.' },
                                justification: { type: Type.STRING, description: 'Justificativa para status Não Aplicável ou Não Auditado.' }
                            }
                        }
                    }
                });
                const jsonText = response.text;
                if (!jsonText) {
                    throw new Error("A resposta da API para gerar observações estava vazia.");
                }
                // Retorna a string JSON para o cliente, que irá interpretá-la.
                return res.status(200).json({ result: jsonText.trim() });
            }

            case 'generateRootCauseAnalysis': {
                const { item, auditInfo, standardName } = payload;
                const prompt = getFiveWhysPrompt(item, auditInfo, standardName);
                const response = await ai.models.generateContent({
                    model: 'gemini-2.5-flash',
                    contents: prompt,
                    config: {
                        responseMimeType: "application/json",
                        responseSchema: {
                            type: Type.OBJECT,
                            properties: {
                                fiveWhys: {
                                    type: Type.ARRAY,
                                    description: 'An array of 5 strings, where each string represents a step in the 5 Whys analysis.',
                                    items: {
                                        type: Type.STRING
                                    }
                                },
                                rootCause: {
                                    type: Type.STRING,
                                    description: 'The fundamental root cause of the non-compliance derived from the 5 Whys analysis.'
                                },
                                correctiveActions: {
                                    type: Type.STRING,
                                    description: 'A list of suggested corrective actions, ideally in a list format or separated by newlines.'
                                }
                            },
                            required: ['fiveWhys', 'rootCause', 'correctiveActions']
                        }
                    }
                });
                const jsonText = response.text;
                if (!jsonText) {
                    throw new Error("A resposta da API para análise de causa raiz estava vazia.");
                }
                const analysisData = JSON.parse(jsonText.trim());
                return res.status(200).json({ result: analysisData });
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
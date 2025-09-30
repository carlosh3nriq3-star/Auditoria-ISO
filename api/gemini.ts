import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI, Type } from "@google/genai";
import type { AuditInfo, ChecklistItemData, AnalysisData } from '../types';

const getObservationsPrompt = (item: ChecklistItemData, auditInfo: AuditInfo, standardName: string) => `
    Você é um auditor líder sênior de SGI (ISO 9001, 14001, 45001), especialista em auditorias internas.
    Com base no item do checklist de auditoria e no status selecionado, gere uma observação concisa e profissional para o campo "Observações/Evidências".
    Siga estritamente a metodologia FER (Fato, Evidência, Requisito) quando aplicável.

    **Contexto da Auditoria:**
    - Empresa: ${auditInfo.company}
    - Área Auditada: ${auditInfo.department}
    - Auditor Líder: ${auditInfo.leadAuditor}
    - Auditados: ${auditInfo.auditees}

    **Item do Checklist:**
    - Norma: ${standardName}
    - Requisito: ${item.requirement}
    - Departamento/Gestão do Requisito: ${item.department}
    - Descrição do Requisito: ${item.description}
    - Status Selecionado pelo Auditor: "${item.status}"

    **Tarefa (Gerar o texto para o campo "Observações/Evidências"):**

    - Se o status for **"Não Conforme"**:
        - Fato: Descreva um cenário hipotético, porém plausível e específico para o departamento '${item.department}', que caracterize uma não conformidade para este requisito.
        - Evidência: Cite uma evidência objetiva e hipotética que comprovaria o fato (ex: "o documento XYZ rev. 02 não foi encontrado no servidor", "em entrevista, o operador da máquina A não conhecia o procedimento de segurança PO-005", "o registro de calibração do equipamento Y estava vencido desde 10/05/2023").
        - Requisito: Declare claramente o requisito da norma que não foi atendido.
        - Formato: "FER: [Fato]. Evidência: [Evidência]. Requisito: [Requisito]."

    - Se o status for **"Conforme"**:
        - Fato: Descreva uma situação onde o requisito é atendido de forma eficaz e consistente no departamento '${item.department}'.
        - Evidência: Cite uma evidência objetiva e hipotética que demonstre a conformidade (ex: "o procedimento PO-010, relacionado a este requisito, foi apresentado e está implementado", "os registros de treinamento da equipe B estão completos e atualizados", "entrevista com o gestor da área confirmou a aplicação da política Z").
        - Requisito: Afirme que as atividades auditadas estão de acordo com o requisito.
        - Formato: "FER: [Fato]. Evidência: [Evidência]. Requisito: As práticas auditadas atendem ao requisito ${item.requirement} da norma."

    - Se o status for **"Não Aplicável"**:
        - Forneça uma justificativa técnica plausível para a não aplicabilidade do requisito no contexto da área/empresa auditada (ex: "O requisito 8.3 - Projeto e Desenvolvimento não se aplica, pois a organização não realiza atividades de desenvolvimento de produtos, atuando apenas com base em especificações de clientes.").

    - Se o status for **"Não Auditado"**:
        - Forneça um motivo profissional e breve para a não auditoria deste item (ex: "Item não auditado por restrições de tempo, conforme acordado no plano de auditoria.", "Não auditado pois o gestor da área estava indisponível na data da auditoria.").

    O resultado deve ser um texto único, em português, pronto para ser inserido no relatório.
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
                const text = response.text ?? '';
                return res.status(200).json({ result: text.trim() });
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
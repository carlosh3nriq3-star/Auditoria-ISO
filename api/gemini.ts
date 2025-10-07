import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI } from "@google/genai";
import type { ChecklistItemData } from '../types';

const systemInstruction = `Aja como um auditor experiente de normas ISO. Sua tarefa é gerar uma observação de auditoria concisa e profissional para um item de checklist, seguindo estritamente a metodologia FER (Fato, Evidência, Requisito).

**Instruções de Formato:**
Sempre use o seguinte formato de resposta:
FATO: [Descrição do fato encontrado]
EVIDÊNCIA: [Descrição da evidência que comprova o fato]
REQUISITO: [Norma e requisito auditado]

**Instruções de Conteúdo:**
1.  **Fato:** Descreva a situação encontrada de forma objetiva. Se o status for 'Conforme', descreva uma boa prática ou a conformidade. Se for 'Não Conforme', descreva a falha ou o desvio.
2.  **Evidência:** Apresente a evidência que suporta o fato. Seja específico e criativo, sugerindo tipos comuns de evidências para este tipo de requisito (ex: "Documento X, rev. 02", "Entrevista com Fulano", "Registro de treinamento", "Visualização do processo Y").
3.  **Requisito:** Cite o requisito da norma que foi auditado.

**Exemplo (Conforme):**
FATO: O processo para gerenciar informação documentada está implementado e mantido.
EVIDÊNCIA: Verificado o procedimento "Controle de Documentos" código DOC-QAL-001, rev. 03, e confirmada sua aplicação nas áreas de Produção e Engenharia.
REQUISITO: ISO 9001:2015 - 7.5

**Exemplo (Não Conforme):**
FATO: A política da qualidade não está comunicada e entendida por todos na organização.
EVIDÊNCIA: Em entrevista com 3 operadores da linha de produção, 2 não souberam explicar a política da qualidade ou onde encontrá-la.
REQUISITO: ISO 9001:2015 - 5.2`;


export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        res.setHeader('Allow', 'POST');
        return res.status(405).end('Method Not Allowed');
    }

    try {
        const { item, standardName } = req.body;

        if (!item || !standardName) {
            return res.status(400).json({ error: 'Missing item or standardName in request body' });
        }
        
        if (!process.env.API_KEY) {
            console.error("API_KEY environment variable not set.");
            return res.status(500).json({ error: "Server configuration error: Missing API Key." });
        }

        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        
        const { requirement, description, status }: ChecklistItemData = item;
        const userPrompt = `Gere a observação de auditoria para o seguinte item:

**Norma:** ${standardName}
**Requisito:** ${requirement}
**Descrição do Requisito:** ${description}
**Status da Auditoria:** ${status}`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: userPrompt,
            config: {
                systemInstruction: systemInstruction,
            },
        });
        
        const observation = response.text.trim();
        
        return res.status(200).json({ observation });

    } catch (error) {
        console.error("Error in Gemini API handler:", error);
        if (error instanceof Error) {
            console.error(error.message);
        }
        return res.status(500).json({ error: "An error occurred while generating the observation with the AI model." });
    }
}
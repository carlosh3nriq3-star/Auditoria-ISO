
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI } from "@google/genai";
import type { ChecklistItemData } from '../types';

const systemInstruction = `Aja como um auditor experiente de normas ISO. Sua tarefa é gerar uma observação de auditoria concisa e profissional para um item de checklist, seguindo estritamente a metodologia FER (Fato, Evidência, Requisito).

**REGRAS CRÍTICAS:**
1. NÃO inclua nenhuma introdução, preâmbulo, comentário ou explicação (ex: "Para gerar uma observação...", "Seguirei a premissa de...", "Com base no item...").
2. Inicie a resposta DIRETAMENTE pelo campo "FATO:".
3. Responda APENAS os campos FATO, EVIDÊNCIA e REQUISITO.

**Instruções de Formato:**
Sempre use o seguinte formato de resposta:
FATO: [Descrição do fato encontrado]
EVIDÊNCIA: [Descrição da evidência que comprova o fato]
REQUISITO: [Norma e requisito auditado]

**Instruções de Conteúdo:**
1.  **Fato:** Descreva a situação encontrada de forma objetiva. Se o status for 'Conforme', descreva uma boa prática ou a conformidade. Se for 'Não Conforme', descreva a falha ou o desvio.
2.  **Evidência:** Apresente a evidência que suporta o fato. Seja específico e criativo, sugerindo tipos comuns de evidências para este tipo de requisito (ex: "Documento X, rev. 02", "Entrevista com Fulano", "Registro de treinamento", "Visualização do processo Y").
3.  **Requisito:** Cite o requisito da norma que foi auditado.`;


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
            model: 'gemini-3-flash-preview',
            contents: userPrompt,
            config: {
                systemInstruction: systemInstruction,
                thinkingConfig: { thinkingBudget: 0 },
            },
        });
        
        const observation = response.text.trim();
        
        return res.status(200).json({ observation });

    } catch (error) {
        console.error("Error in Gemini API handler:", error);
        return res.status(500).json({ error: "An error occurred while generating the observation with the AI model." });
    }
}

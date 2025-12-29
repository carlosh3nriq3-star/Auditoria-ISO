
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

export async function generateObservation(item: ChecklistItemData, standardName: string): Promise<string> {
  try {
    // A chave de API é obtida da variável de ambiente configurada no sistema
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      throw new Error("API Key não encontrada no ambiente.");
    }

    const ai = new GoogleGenAI({ apiKey });
    
    const userPrompt = `Gere a observação de auditoria para o seguinte item:

**Norma:** ${standardName}
**Requisito:** ${item.requirement}
**Descrição do Requisito:** ${item.description}
**Status da Auditoria:** ${item.status}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: userPrompt,
      config: {
        systemInstruction: systemInstruction,
        thinkingConfig: { thinkingBudget: 0 },
      },
    });

    const observation = response.text;
    if (!observation) {
      throw new Error("Não foi possível obter o texto da resposta da IA.");
    }

    return observation.trim();

  } catch (error) {
    console.error("Erro ao chamar a API Gemini no cliente:", error);
    return "Ocorreu um erro ao gerar a observação. Por favor, tente novamente ou insira manualmente as evidências encontradas.";
  }
}

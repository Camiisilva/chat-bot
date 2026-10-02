/**
 * AfesuTech Chatbot - FormattedMessage Component
 * 
 * Converte respostas da IA com formatação Markdown (negrito, listas,
 * links, quebras de linha e blocos de código) em HTML formatado e seguro.
 * 
 * Arquivo: frontend/src/components/FormattedMessage.jsx
 */

import React, { useMemo } from 'react';
import { marked } from 'marked';

// Configuração padrão do Marked para GitHub Flavored Markdown e quebras de linha
marked.setOptions({
  breaks: true,
  gfm: true,
});

/**
 * Componente que renderiza texto em Markdown
 * @param {Object} props
 * @param {string} [props.content] - Conteúdo em texto Markdown
 * @param {string} [props.text] - Alias para content
 * @param {string} [props.className] - Classes CSS adicionais
 */
export default function FormattedMessage({ content, text, className = '' }) {
  const markdownSource = content ?? text ?? '';

  const parsedHtml = useMemo(() => {
    if (!markdownSource || typeof markdownSource !== 'string') {
      return '';
    }

    try {
      return marked.parse(markdownSource);
    } catch (err) {
      console.error('Erro ao renderizar Markdown:', err);
      return String(markdownSource);
    }
  }, [markdownSource]);

  return (
    <div
      className={`markdown-content ${className}`.trim()}
      dangerouslySetInnerHTML={{ __html: parsedHtml }}
    />
  );
}

export { FormattedMessage };

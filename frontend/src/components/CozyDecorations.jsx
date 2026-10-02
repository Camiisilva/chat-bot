/**
 * CamoDex ✦ — Componentes Decorativos Minimalistas & Elegantes
 * Identidade Visual Sutil estilo ChatGPT/Claude com Toque Pokémon
 * Arquivo: frontend/src/components/CozyDecorations.jsx
 */

import React from 'react';

// 🦉 Ícone Sutil do Mascote (Rowlet Minimalista)
export function RowletAvatar({ size = 26, animated = false }) {
  return (
    <div className="mascot-avatar-wrapper" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 10.45 4.45 9.01 5.22 7.78L10 12.56V15H14V12.56L18.78 7.78C19.55 9.01 20 10.45 20 12C20 16.41 16.41 20 12 20Z" fill="#c4b5fd"/>
        <circle cx="12" cy="12" r="3" fill="#8b5cf6"/>
      </svg>
    </div>
  );
}

export function EeveeTopPeekingDecor() {
  return null; // Removido para layout limpo
}

export function PokeBallIcon({ size = 18, style = {} }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0, ...style }}>
      <circle cx="12" cy="12" r="10" stroke="#c4b5fd" strokeWidth="2" fill="none" />
      <path d="M2 12H22" stroke="#c4b5fd" strokeWidth="2" />
      <circle cx="12" cy="12" r="3" fill="#8b5cf6" stroke="#c4b5fd" strokeWidth="1.5" />
    </svg>
  );
}

// Background Vazio e Limpo (Zero elementos flutuantes espalhados)
export function PokedexBackground() {
  return null;
}

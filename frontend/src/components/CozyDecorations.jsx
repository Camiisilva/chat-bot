/**
 * CamoDex ✦ — Mascotes Fofos (Rowlet, Eevee e Decorações Kawaii)
 * Arquivo: frontend/src/components/CozyDecorations.jsx
 */

import React from 'react';

// 🦉 1. Rowlet Avatar (Fofo com bochechas cor-de-rosa e gravata de folha)
export function RowletAvatar({ size = 38, animated = false }) {
  return (
    <div className={`rowlet-avatar-wrapper ${animated ? 'anim-wobble' : ''}`} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
      <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ filter: 'drop-shadow(0 2px 5px rgba(0, 0, 0, 0.25))' }}>
        {/* Corpo Redondinho Creme */}
        <circle cx="20" cy="20" r="18" fill="#F4E8D8" stroke="#4A3226" strokeWidth="1.5" />
        
        {/* Asinhas */}
        <path d="M4 18 C2 25 6 32 12 34 C9 30 7 24 8 18 Z" fill="#6B4434" stroke="#4A3226" strokeWidth="0.8" />
        <path d="M36 18 C38 25 34 32 28 34 C31 30 33 24 32 18 Z" fill="#6B4434" stroke="#4A3226" strokeWidth="0.8" />

        {/* Rosto Branco em Formato de "8" */}
        <path d="M8.5 17 C8.5 12 14.5 11 19.5 16 C24.5 11 31.5 12 31.5 17 C31.5 22.5 24.5 23 19.5 18 C14.5 23 8.5 22.5 8.5 17 Z" fill="#FFFFFF" />

        {/* Gravatinha de Folha Verde */}
        <path d="M17.5 26.5 C14.5 23 11 25 12.5 29 C15 30 16.5 28 17.5 26.5 Z" fill="#60A547" stroke="#3D271D" strokeWidth="0.8" />
        <path d="M21.5 26.5 C24.5 23 28 25 26.5 29 C24 30 22.5 28 21.5 26.5 Z" fill="#78B95E" stroke="#3D271D" strokeWidth="0.8" />

        {/* Olhos Grandes Fofos com Brilhos */}
        <ellipse cx="14" cy="16" rx="2.8" ry="3.8" fill="#291810" />
        <circle cx="13" cy="14.8" r="1.2" fill="#FFFFFF" />
        <ellipse cx="25" cy="16" rx="2.8" ry="3.8" fill="#291810" />
        <circle cx="24" cy="14.8" r="1.2" fill="#FFFFFF" />

        {/* Bico Laranja */}
        <path d="M17.8 17.5 L21.2 17.5 L19.5 20 Z" fill="#FFFFFF" />
        <path d="M17.8 19.5 L21.2 19.5 L19.5 22.5 Z" fill="#F97316" stroke="#4A3226" strokeWidth="0.5" />

        {/* Bochechas Rosadinhas (Blushing Kawaii) */}
        <ellipse cx="10" cy="20" rx="2.2" ry="1.4" fill="rgba(244, 114, 182, 0.65)" />
        <ellipse cx="29" cy="20" rx="2.2" ry="1.4" fill="rgba(244, 114, 182, 0.65)" />
      </svg>
    </div>
  );
}

// 🦊 2. Eevee Sticker Peeking (Espiando no Canto do Chat)
export function EeveeTopPeekingDecor() {
  return (
    <div className="eevee-sticker-peeking">
      <svg width="60" height="42" viewBox="0 0 100 64" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ filter: 'drop-shadow(0 3px 6px rgba(0, 0, 0, 0.3))' }}>
        <path d="M28 32 C12 12 6 0 17 2 C29 4 36 18 32 34 Z" fill="#9B623B" stroke="#3D2314" strokeWidth="1.5" />
        <path d="M24 27 C15 14 10 4 17 5 C24 7 31 18 29 29 Z" fill="#E0A46F" />
        <path d="M72 32 C88 12 94 0 83 2 C71 4 64 18 68 34 Z" fill="#9B623B" stroke="#3D2314" strokeWidth="1.5" />
        <path d="M76 27 C85 14 90 4 83 5 C76 7 69 18 71 29 Z" fill="#E0A46F" />
        <ellipse cx="50" cy="42" rx="24" ry="18" fill="#CA8C59" stroke="#3D2314" strokeWidth="1.6" />
        <path d="M28 50 C33 42 67 42 72 50 C76 60 63 62 50 62 C37 62 24 60 28 50 Z" fill="#F7EDE0" stroke="#3D2314" strokeWidth="1.2" />
        <ellipse cx="38" cy="56" rx="5.5" ry="4" fill="#CA8C59" stroke="#3D2314" strokeWidth="1.2" />
        <ellipse cx="62" cy="56" rx="5.5" ry="4" fill="#CA8C59" stroke="#3D2314" strokeWidth="1.2" />
        <ellipse cx="40" cy="38" rx="4" ry="6" fill="#3D2314" />
        <circle cx="38.8" cy="35.5" r="1.8" fill="#FFFFFF" />
        <ellipse cx="60" cy="38" rx="4" ry="6" fill="#3D2314" />
        <circle cx="58.8" cy="35.5" r="1.8" fill="#FFFFFF" />
        <polygon points="49.2,44 50.8,44 50,45.5" fill="#3D2314" />
        <ellipse cx="33" cy="44" rx="3" ry="1.8" fill="rgba(244, 114, 182, 0.45)" />
        <ellipse cx="67" cy="44" rx="3" ry="1.8" fill="rgba(244, 114, 182, 0.45)" />
      </svg>
    </div>
  );
}

// 🔴 3. Ícone Pokébola Inline
export function PokeBallIcon({ size = 18, style = {} }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0, ...style }}>
      <circle cx="12" cy="12" r="10" stroke="#c4b5fd" strokeWidth="1.8" fill="none" />
      <path d="M2 12H22" stroke="#c4b5fd" strokeWidth="1.8" />
      <path d="M2 12 A10 10 0 0 1 22 12 Z" fill="rgba(239, 68, 68, 0.4)" />
      <circle cx="12" cy="12" r="3.2" fill="#ffffff" stroke="#3c2456" strokeWidth="1.5" />
      <circle cx="12" cy="12" r="1.5" fill="#8b5cf6" />
    </svg>
  );
}

export function PokedexBackground() {
  return null;
}

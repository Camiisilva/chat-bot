/**
 * CamoDex ✦ — Decorações Fofas & Aconchegantes (Aesthetic Pokémon Room)
 * Referência Visual: Painel Marrom Cacau + Detalhes Roxos + Mascotes Fofos
 * Animação das Pokébolas: Wobble / Shake (O Chacoalhar Clássico de Captura -15° a 15°)
 * Arquivo: frontend/src/components/CozyDecorations.jsx
 */

import React from 'react';

// 🦉 1. Rowlet Avatar — Mascote Principal
export function RowletAvatar({ size = 36, animated = true }) {
  return (
    <div className={animated ? "rowlet-avatar-container" : ""}>
      <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ filter: 'drop-shadow(0 2px 4px rgba(30, 15, 20, 0.25))' }}>
        <circle cx="20" cy="20" r="18" fill="#ECE2D3" stroke="#3D271D" strokeWidth="1.5" />
        
        <path d="M3 18 C1 25 5 32 11 34 C8 30 6 24 7 18 Z" fill="#4D3327" stroke="#3D271D" strokeWidth="0.8" className="anim-rowlet-wing-left" />
        <path d="M37 18 C39 25 35 32 29 34 C32 30 34 24 33 18 Z" fill="#4D3327" stroke="#3D271D" strokeWidth="0.8" className="anim-rowlet-wing-right" />

        <path d="M8.5 17 C8.5 12 14.5 11 19.5 16 C24.5 11 31.5 12 31.5 17 C31.5 22.5 24.5 23 19.5 18 C14.5 23 8.5 22.5 8.5 17 Z" fill="#FFFFFF" />

        <path d="M17.5 26.5 C14.5 23 11 25 12.5 29 C15 30 16.5 28 17.5 26.5 Z" fill="#5F9351" stroke="#3D271D" strokeWidth="0.8" />
        <path d="M21.5 26.5 C24.5 23 28 25 26.5 29 C24 30 22.5 28 21.5 26.5 Z" fill="#7BAA6C" stroke="#3D271D" strokeWidth="0.8" />

        <g className="anim-blink">
          <ellipse cx="14" cy="16" rx="2.7" ry="3.7" fill="#261710" />
          <circle cx="13" cy="14.8" r="1.1" fill="#FFFFFF" />
          <ellipse cx="25" cy="16" rx="2.7" ry="3.7" fill="#261710" />
          <circle cx="24" cy="14.8" r="1.1" fill="#FFFFFF" />
        </g>

        <path d="M17.5 17.5 L21.5 17.5 L19.5 20 Z" fill="#FFFFFF" stroke="#3D271D" strokeWidth="0.5" />
        <path d="M17.8 19.5 L21.2 19.5 L19.5 22.5 Z" fill="#E88D48" stroke="#3D271D" strokeWidth="0.5" />

        <ellipse cx="10" cy="19.5" rx="2" ry="1.2" fill="rgba(244, 114, 182, 0.35)" />
        <ellipse cx="29" cy="19.5" rx="2" ry="1.2" fill="rgba(244, 114, 182, 0.4)" />
      </svg>
    </div>
  );
}

// 🦊 2. Eevee Espiando no Topo do Chat (Canto Superior Direito)
export function EeveeTopPeekingDecor() {
  return (
    <div className="eevee-top-peeking-minimal">
      <svg width="76" height="48" viewBox="0 0 100 64" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ filter: 'drop-shadow(0 3px 6px rgba(30, 15, 20, 0.25))' }}>
        <path d="M28 32 C12 12 6 0 17 2 C29 4 36 18 32 34 Z" fill="#9B623B" stroke="#3D2314" strokeWidth="1.5" />
        <path d="M24 27 C15 14 10 4 17 5 C24 7 31 18 29 29 Z" fill="#E0A46F" />

        <path d="M72 32 C88 12 94 0 83 2 C71 4 64 18 68 34 Z" fill="#9B623B" stroke="#3D2314" strokeWidth="1.5" />
        <path d="M76 27 C85 14 90 4 83 5 C76 7 69 18 71 29 Z" fill="#E0A46F" />

        <ellipse cx="50" cy="42" rx="24" ry="18" fill="#CA8C59" stroke="#3D2314" strokeWidth="1.6" />

        <path d="M28 50 C33 42 67 42 72 50 C76 60 63 62 50 62 C37 62 24 60 28 50 Z" fill="#F7EDE0" stroke="#3D2314" strokeWidth="1.2" />

        <ellipse cx="38" cy="56" rx="5.5" ry="4" fill="#CA8C59" stroke="#3D2314" strokeWidth="1.2" />
        <ellipse cx="62" cy="56" rx="5.5" ry="4" fill="#CA8C59" stroke="#3D2314" strokeWidth="1.2" />

        <g>
          <ellipse cx="40" cy="38" rx="4" ry="6" fill="#3D2314" />
          <circle cx="38.8" cy="35.5" r="1.8" fill="#FFFFFF" />
          <circle cx="41.2" cy="40.5" r="0.8" fill="#FFFFFF" />

          <ellipse cx="60" cy="38" rx="4" ry="6" fill="#3D2314" />
          <circle cx="58.8" cy="35.5" r="1.8" fill="#FFFFFF" />
          <circle cx="61.2" cy="40.5" r="0.8" fill="#FFFFFF" />
        </g>

        <polygon points="49.2,44 50.8,44 50,45.5" fill="#3D2314" />
        <path d="M47 47 C48.5 48.5 50 48.5 50 47 C50 48.5 51.5 48.5 53 47" stroke="#3D2314" strokeWidth="1" strokeLinecap="round" fill="none" />

        <ellipse cx="33" cy="44" rx="3" ry="1.8" fill="rgba(244, 114, 182, 0.35)" />
        <ellipse cx="67" cy="44" rx="3" ry="1.8" fill="rgba(244, 114, 182, 0.35)" />
      </svg>
    </div>
  );
}

// 🔴 3. Poké Ball Icon — Ícone Inline Roxo com Efeito Sutil
export function PokeBallIcon({ size = 20, style = {} }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0, ...style }}>
      <path d="M3 16 A13 13 0 0 1 29 16 Z" fill="#9D6FE8" />
      <path d="M3 16 A13 13 0 0 0 29 16 Z" fill="#F8F0FA" />
      <rect x="3" y="14.5" width="26" height="3" rx="1.5" fill="#2E1B2B" />
      <circle cx="16" cy="16" r="4.5" fill="#F8F0FA" stroke="#2E1B2B" strokeWidth="1.8" />
      <circle cx="16" cy="16" r="2" fill="#8B62DB" />
      <ellipse cx="10" cy="10" rx="1.8" ry="1" fill="rgba(255,255,255,0.6)" transform="rotate(-25 10 10)" />
    </svg>
  );
}

// 🔴 4. Mini Pokéball Monocromática com Chacoalhar Clássico (Wobble / Shake)
export function MiniPokeBallBackground({ size = 30, opacity = 0.8, className = "" }) {
  return (
    <div className={`pokeball-wobble-wrapper ${className}`}>
      <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ opacity, filter: 'drop-shadow(0 3px 6px rgba(0, 0, 0, 0.25))' }}>
        {/* Metade Superior Lilás Roxo Soft */}
        <path d="M3 16 A13 13 0 0 1 29 16 Z" fill="#C499F3" />
        {/* Metade Inferior Creme */}
        <path d="M3 16 A13 13 0 0 0 29 16 Z" fill="#F8F0FA" />
        {/* Linha Central Escura */}
        <rect x="3" y="14.5" width="26" height="3" rx="1.5" fill="#3D2435" />
        {/* Botão Central */}
        <circle cx="16" cy="16" r="4.8" fill="#F8F0FA" stroke="#3D2435" strokeWidth="1.8" />
        <circle cx="16" cy="16" r="2.2" fill="#8B62DB" />
        {/* Brilho */}
        <ellipse cx="10" cy="10" rx="2" ry="1.2" fill="rgba(255,255,255,0.65)" transform="rotate(-25 10 10)" />
      </svg>
    </div>
  );
}

// 🛋️ 5. Ambiente Cozy de Fundo (Post-it, Livros com Eevee, Pikachu dormindo, Quadro Rowlet e Várias Pokébolas Organizadas)
export function PokedexBackground() {
  return (
    <div className="pokedex-background-layer">
      {/* 📌 1. Post-it Decorativo na Esquerda */}
      <div className="ambient-decor pos-post-it">
        <div className="post-it-note">
          <p>Grandes conquistas começam com uma boa pergunta! ✨</p>
          <div className="post-it-pokeball">
            <MiniPokeBallBackground size={22} opacity={0.7} className="anim-shake-1" />
          </div>
        </div>
      </div>

      {/* 📚 2. Pilha de Livros com Eevee no Canto Inferior Esquerdo */}
      <div className="ambient-decor pos-books-eevee">
        <div className="books-stack">
          <div className="book book-4">SONHOS</div>
          <div className="book book-3">EVOLUÇÃO</div>
          <div className="book book-2">FOCO</div>
          <div className="book book-1">ESTUDO</div>
        </div>
        <div className="eevee-book-mascot">
          <svg width="68" height="52" viewBox="0 0 80 60" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M18 28 C6 12 2 2 12 4 C22 6 28 18 24 30 Z" fill="#9B623B" stroke="#3D2314" strokeWidth="1.2" />
            <path d="M58 28 C70 12 74 2 64 4 C54 6 48 18 52 30 Z" fill="#9B623B" stroke="#3D2314" strokeWidth="1.2" />
            <ellipse cx="38" cy="36" rx="20" ry="15" fill="#CA8C59" stroke="#3D2314" strokeWidth="1.4" />
            <path d="M22 44 C26 38 50 38 54 44 C57 52 46 54 38 54 C30 54 19 52 22 44 Z" fill="#F7EDE0" stroke="#3D2314" strokeWidth="1" />
            <ellipse cx="30" cy="33" rx="3.5" ry="5" fill="#3D2314" />
            <circle cx="29" cy="31" r="1.5" fill="#FFF" />
            <ellipse cx="46" cy="33" rx="3.5" ry="5" fill="#3D2314" />
            <circle cx="45" cy="31" r="1.5" fill="#FFF" />
            <polygon points="37.2,38 38.8,38 38,39.5" fill="#3D2314" />
          </svg>
        </div>
        <div className="shelf-pokeball">
          <MiniPokeBallBackground size={32} opacity={0.85} className="anim-shake-2" />
        </div>
      </div>

      {/* 🖼️ 3. Quadro de Fotos do Rowlet & Fotos Polaroids na Direita */}
      <div className="ambient-decor pos-frame-right">
        <div className="framed-picture">
          <div className="frame-inner">
            <RowletAvatar size={40} animated={false} />
          </div>
        </div>
        <div className="polaroid-notes">
          <div className="polaroid polaroid-1"><MiniPokeBallBackground size={18} opacity={0.7} /></div>
          <div className="polaroid polaroid-2"><MiniPokeBallBackground size={18} opacity={0.7} /></div>
        </div>
      </div>

      {/* 💻 4. Notebook & Pikachu Dormindo no Canto Inferior Direito */}
      <div className="ambient-decor pos-pikachu-laptop">
        <div className="sleeping-pikachu">
          <svg width="60" height="40" viewBox="0 0 70 50" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 25 C6 14 0 8 8 10 C16 12 20 22 18 28 Z" fill="#F5C731" stroke="#3D271D" strokeWidth="1.2" />
            <ellipse cx="35" cy="30" rx="22" ry="14" fill="#F5C731" stroke="#3D271D" strokeWidth="1.4" />
            <path d="M22 30 C20 31 19 33 22 34 C25 35 27 33 25 30 Z" fill="#E85D4E" />
            <path d="M28 28 Q 32 30 35 28" stroke="#3D271D" strokeWidth="1.2" fill="none" strokeLinecap="round" />
            <path d="M38 28 Q 41 30 44 28" stroke="#3D271D" strokeWidth="1.2" fill="none" strokeLinecap="round" />
            <text x="50" y="16" fill="#C499F3" fontSize="12" fontWeight="bold">zZZ</text>
          </svg>
        </div>
        <div className="desk-pokeball">
          <MiniPokeBallBackground size={28} opacity={0.8} className="anim-shake-3" />
        </div>
      </div>

      {/* 🔴 5. Pokébolas Organizadas no Entorno (Topo, Base, Esquerda e Direita) */}
      <div className="bg-item pos-top-left-pokeball"><MiniPokeBallBackground size={32} opacity={0.75} className="anim-shake-1" /></div>
      <div className="bg-item pos-top-mid-pokeball"><MiniPokeBallBackground size={26} opacity={0.65} className="anim-shake-2" /></div>
      <div className="bg-item pos-top-right-pokeball"><MiniPokeBallBackground size={30} opacity={0.75} className="anim-shake-3" /></div>

      <div className="bg-item pos-mid-left-pokeball"><MiniPokeBallBackground size={28} opacity={0.7} className="anim-shake-2" /></div>
      <div className="bg-item pos-mid-right-pokeball"><MiniPokeBallBackground size={28} opacity={0.7} className="anim-shake-1" /></div>

      <div className="bg-item pos-bot-left-pokeball"><MiniPokeBallBackground size={34} opacity={0.8} className="anim-shake-3" /></div>
      <div className="bg-item pos-bot-right-pokeball"><MiniPokeBallBackground size={34} opacity={0.8} className="anim-shake-2" /></div>

      {/* ✨ Brilhos Lilás Delicados nos Vãos */}
      <div className="bg-item pos-spark-1 anim-discovery-spark-1"><div className="spark-star" /></div>
      <div className="bg-item pos-spark-2 anim-discovery-spark-2"><div className="spark-star" /></div>
      <div className="bg-item pos-spark-3 anim-discovery-spark-1"><div className="spark-star" /></div>
      <div className="bg-item pos-spark-4 anim-discovery-spark-2"><div className="spark-star" /></div>
    </div>
  );
}


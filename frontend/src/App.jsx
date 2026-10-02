/**
 * CamoDex ✦ — Aplicação Principal React com GSAP Intro & Design Cozy Gamer
 * Arquivo: frontend/src/App.jsx
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, 
  Sparkles, 
  ThumbsUp, 
  ThumbsDown, 
  Volume2, 
  VolumeX, 
  Check, 
  Copy,
  Trash2,
  PlayCircle,
  Activity,
  Bot
} from 'lucide-react';
import VoiceInput from './components/VoiceInput';
import FormattedMessage from './components/FormattedMessage';
import { RowletAvatar, EeveeTopPeekingDecor, PokeBallIcon } from './components/CozyDecorations';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

export default function App() {
  const [messages, setMessages] = useState([
    {
      id: 'welcome-msg',
      sender: 'bot',
      text: 'Olá! Seja muito bem-vindo(a) ao **CamoDex** ✨\n\nEu sou a sua Pokédex e assistente de jornada inteligente. Como posso ajudar nas suas descobertas hoje?',
      source: 'sistema',
      confidence: 1.0,
      timestamp: Date.now() / 1000,
      feedback: null
    }
  ]);

  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [apiOnline, setApiOnline] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [metrics, setMetrics] = useState(null);
  const [showMetricsModal, setShowMetricsModal] = useState(false);
  const [showIntro, setShowIntro] = useState(true);

  const [quickSuggestions] = useState([
    'Quais os melhores tipos de Pokémon?',
    'Como funciona a tabela de vantagens e fraquezas?',
    'O que é o assistente CamoDex?',
    'Dicas para novos treinadores'
  ]);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Executa Animação GSAP Intro se disponível
  useEffect(() => {
    if (showIntro && window.gsap) {
      const gsap = window.gsap;
      const tl = gsap.timeline({
        onComplete: () => {
          gsap.to('#introOverlay', {
            opacity: 0,
            duration: 0.8,
            ease: 'power2.inOut',
            onComplete: () => setShowIntro(false)
          });
        }
      });

      tl.fromTo('#introPokeball',
        { y: -500, rotation: -720, opacity: 0 },
        { y: 0, rotation: 0, opacity: 1, duration: 1.2, ease: 'bounce.out' }
      );

      tl.to('#introPokeball', { rotation: -12, duration: 0.1, ease: 'power1.inOut' })
        .to('#introPokeball', { rotation: 12, duration: 0.1, ease: 'power1.inOut' })
        .to('#introPokeball', { rotation: -12, duration: 0.1, ease: 'power1.inOut' })
        .to('#introPokeball', { rotation: 12, duration: 0.1, ease: 'power1.inOut' })
        .to('#introPokeball', { rotation: 0, duration: 0.1, ease: 'power1.inOut' });

      tl.fromTo('#introLogo',
        { scale: 0, opacity: 0, y: 15 },
        { scale: 1, opacity: 1, y: 0, duration: 0.7, ease: 'back.out(1.7)' },
        "-=0.1"
      );

      tl.to({}, { duration: 0.9 });
    } else {
      setShowIntro(false);
    }
  }, [showIntro]);

  useEffect(() => {
    checkApiHealth();
    const interval = setInterval(checkApiHealth, 15000);
    return () => clearInterval(interval);
  }, []);

  const checkApiHealth = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/`);
      if (res.ok) {
        setApiOnline(true);
        fetchMetrics();
      } else {
        setApiOnline(false);
      }
    } catch (e) {
      setApiOnline(false);
    }
  };

  const fetchMetrics = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/metrics`);
      if (res.ok) {
        const data = await res.json();
        setMetrics(data);
      }
    } catch (e) {}
  };

  const handleSendMessage = async (customText = null) => {
    const textToSend = customText || inputMessage;
    if (!textToSend.trim() || isLoading) return;

    const userMsg = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: textToSend.trim(),
      timestamp: Date.now() / 1000
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!customText) setInputMessage('');
    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: textToSend.trim() })
      });

      if (!response.ok) throw new Error('Falha na resposta do servidor');

      const data = await response.json();
      const botMsg = {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: data.response || data.message || 'Resposta recebida.',
        source: data.fonte || 'groq_llm',
        confidence: data.confianca || 0.9,
        timestamp: Date.now() / 1000,
        feedback: null
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (error) {
      setTimeout(() => {
        let fallbackText = "Entendi sua pergunta! Como posso te ajudar mais detalhadamente?";
        const lower = textToSend.toLowerCase();
        if (lower.includes('tipo') || lower.includes('melhor')) {
          fallbackText = "Os tipos **Dragão**, **Fogo** e **Elétrico** possuem excelente ataque. O tipo **Aço** tem as melhores defesas!";
        } else if (lower.includes('vantag') || lower.includes('fraqu')) {
          fallbackText = "Vantagens essenciais:\n• **Água** vence Fogo\n• **Fogo** vence Planta\n• **Planta** vence Água\n• **Elétrico** vence Água";
        } else if (lower.includes('camo')) {
          fallbackText = "O **CamoDex** é a sua assistente Pokédex inteligente criada para dar suporte sobre o universo Pokémon!";
        }

        const fallbackMsg = {
          id: `bot-${Date.now()}`,
          sender: 'bot',
          text: fallbackText,
          source: 'offline_fallback',
          confidence: 0.85,
          timestamp: Date.now() / 1000,
          feedback: null
        };
        setMessages((prev) => [...prev, fallbackMsg]);
      }, 600);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVoiceTranscript = (transcript) => {
    if (transcript) handleSendMessage(transcript);
  };

  const resetChat = () => {
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        sender: 'bot',
        text: 'Conversa reiniciada com sucesso! ✨ Como posso ajudar agora?',
        source: 'sistema',
        confidence: 1.0,
        timestamp: Date.now() / 1000,
        feedback: null
      }
    ]);
  };

  const speakText = (text) => {
    if (!('speechSynthesis' in window)) return;
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }
    const cleanText = text.replace(/[*#_`]/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'pt-BR';
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleFeedback = async (messageId, isPositive) => {
    const targetMsg = messages.find((m) => m.id === messageId);
    if (!targetMsg) return;
    const newFeedback = isPositive ? 'positive' : 'negative';

    setMessages((prev) =>
      prev.map((msg) => (msg.id === messageId ? { ...msg, feedback: newFeedback } : msg))
    );

    try {
      await fetch(`${API_BASE_URL}/api/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message_id: messageId,
          user_query: 'feedback',
          bot_response: targetMsg.text,
          is_positive: isPositive
        })
      });
      fetchMetrics();
    } catch (e) {}
  };

  return (
    <>
      {/* 🎬 Overlay Intro GSAP */}
      {showIntro && (
        <div class="intro-overlay" id="introOverlay">
          <div class="pokeball-css" id="introPokeball">
            <div class="pokeball-top" />
            <div class="pokeball-button" />
          </div>
          <div class="intro-logo" id="introLogo">
            <h1>CamoDex ✦</h1>
            <p>Sua Pokédex Inteligente</p>
          </div>
          <button
            className="skip-btn"
            onClick={() => setShowIntro(false)}
          >
            Pular Animação ➔
          </button>
        </div>
      )}

      {/* 🎮 Card Principal do Chatbot */}
      <div className="chat-card" id="chatCard">
        <EeveeTopPeekingDecor />
        {/* Cabeçalho */}
        <header className="chat-header">
          <div className="header-info">
            <div className="mascot-avatar">
              <RowletAvatar size={26} />
            </div>
            <div className="header-text">
              <h2>CamoDex ✦</h2>
              <p>
                <span className="status-dot" />
                <span>Online • Seu parceiro de jornada</span>
              </p>
            </div>
          </div>

          <div className="header-actions">
            <button
              className="icon-btn"
              onClick={() => setShowIntro(true)}
              title="Reexibir Intro GSAP"
            >
              <PlayCircle size={18} />
            </button>
            <button
              className="icon-btn"
              onClick={resetChat}
              title="Limpar Conversa"
            >
              <Trash2 size={18} />
            </button>
            <button
              className="icon-btn"
              onClick={() => setShowMetricsModal(!showMetricsModal)}
              title="Métricas Operacionais"
            >
              <Activity size={18} />
            </button>
          </div>
        </header>

        {/* Área de Mensagens */}
        <main className="chat-messages">
          {messages.map((msg) => (
            <div key={msg.id} className={`message-row ${msg.sender}`}>
              <div className="msg-avatar">
                {msg.sender === 'user' ? (
                  <PokeBallIcon size={18} />
                ) : (
                  <RowletAvatar size={24} />
                )}
              </div>

              <div className="message-bubble">
                <FormattedMessage content={msg.text} />

                {msg.sender === 'bot' && (
                  <div className="message-meta">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {msg.source && (
                        <span className="message-source-tag">
                          <Sparkles size={11} />
                          {msg.source === 'sistema' ? 'Sistema' : msg.source.replace('_', ' ')}
                        </span>
                      )}
                      <span>
                        {new Date(msg.timestamp * 1000).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>

                    <div className="feedback-buttons">
                      <button
                        className="feedback-btn"
                        onClick={() => speakText(msg.text)}
                        title="Ouvir em voz alta"
                      >
                        {isSpeaking ? <VolumeX size={14} color="#EF4444" /> : <Volume2 size={14} />}
                      </button>

                      <button
                        className="feedback-btn"
                        onClick={() => copyToClipboard(msg.text, msg.id)}
                        title="Copiar texto"
                      >
                        {copiedId === msg.id ? <Check size={14} color="#10B981" /> : <Copy size={14} />}
                      </button>

                      <button
                        className={`feedback-btn ${msg.feedback === 'positive' ? 'active-positive' : ''}`}
                        onClick={() => handleFeedback(msg.id, true)}
                        title="Gostei"
                      >
                        <ThumbsUp size={14} />
                      </button>

                      <button
                        className={`feedback-btn ${msg.feedback === 'negative' ? 'active-negative' : ''}`}
                        onClick={() => handleFeedback(msg.id, false)}
                        title="Não gostei"
                      >
                        <ThumbsDown size={14} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="message-row bot">
              <div className="msg-avatar">
                <RowletAvatar size={24} />
              </div>
              <div className="message-bubble">
                <div className="typing-indicator">
                  <span />
                  <span />
                  <span />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </main>

        {/* 💡 Quick Suggestions Chips */}
        {quickSuggestions.length > 0 && (
          <div className="quick-prompts-container">
            {quickSuggestions.map((suggestion, index) => (
              <button
                key={index}
                className="prompt-chip"
                onClick={() => handleSendMessage(suggestion)}
                disabled={isLoading}
              >
                <span className="chip-pokeball-icon" />
                <span>{suggestion}</span>
              </button>
            ))}
          </div>
        )}

        {/* ⌨️ Input Bar */}
        <footer className="input-area">
          <form
            className="input-wrapper"
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
          >
            <input
              ref={inputRef}
              type="text"
              className="chat-input"
              placeholder="Digite sua dúvida ou use o microfone..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              disabled={isLoading}
            />

            <div className="input-buttons">
              <VoiceInput onTranscript={handleVoiceTranscript} disabled={isLoading} />

              <button
                type="submit"
                className="send-btn"
                disabled={!inputMessage.trim() || isLoading}
                title="Enviar mensagem"
              >
                <Send size={18} />
              </button>
            </div>
          </form>
          <div className="footer-credits">CamoDex ✦ Assistente IA de Suporte e Conhecimento</div>
        </footer>

        {/* Modal de Métricas */}
        {showMetricsModal && metrics && (
          <div
            style={{
              position: 'absolute',
              top: '70px',
              right: '20px',
              backgroundColor: '#2b1b3d',
              border: '1.5px solid rgba(196, 181, 253, 0.3)',
              borderRadius: '16px',
              padding: '16px',
              boxShadow: '0 12px 35px rgba(0, 0, 0, 0.5)',
              zIndex: 100,
              width: '280px'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
              <strong style={{ fontSize: '0.9rem', color: '#fff', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Activity size={15} color="#C499F3" /> Métricas Operacionais
              </strong>
              <button
                onClick={() => setShowMetricsModal(false)}
                style={{ background: 'none', border: 'none', color: '#c4b5fd', cursor: 'pointer', fontSize: '1rem' }}
              >
                ✕
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.85rem', color: '#f3e8ff' }}>
              <div>Total de Atendimentos: <strong>{metrics.total_atendimentos}</strong></div>
              <div>Taxa de Satisfação: <strong>{metrics.taxa_satisfacao_percentual}%</strong></div>
              <div>Likes (Positivos): <strong>{metrics.detalhes?.feedback_positivo || 0}</strong></div>
              <div>Dislikes (Negativos): <strong>{metrics.detalhes?.feedback_negativo || 0}</strong></div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

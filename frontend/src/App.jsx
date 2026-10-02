/**
 * CamoDex ✦ — Aplicação Principal React (Background Pokédex Animado + Perguntas Pokémon)
 * Mascote Oficial Principal: Rowlet
 * Mascote Secundário no Topo: Eevee (Pequeno e Discreto)
 * Paleta: Chocolate Nobre + Bege Suave + Roxo/Lilás
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
  Sun,
  Settings,
  Activity
} from 'lucide-react';
import VoiceInput from './components/VoiceInput';
import FormattedMessage from './components/FormattedMessage';
import { 
  RowletAvatar, 
  EeveeTopPeekingDecor,
  PokeBallIcon,
  PokedexBackground
} from './components/CozyDecorations';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

export default function App() {
  const [messages, setMessages] = useState([
    {
      id: 'welcome-msg',
      sender: 'bot',
      text: 'Olá! Seja muito bem-vindo(a) ao **CamoDex!** ✨\n\nEu sou a sua Pokédex e assistente de jornada inteligente. Como posso ajudar nas suas descobertas hoje?',
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

  const [quickSuggestions, setQuickSuggestions] = useState([
    'Como buscar dados de Pokémon no CamoDex?',
    'Como funciona o registro de voz e Pokédex por IA?',
    'Quem é o mascote Rowlet e quais são seus atributos?'
  ]);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

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

  const handleSendMessage = async (textToSend) => {
    const text = (textToSend || inputMessage).trim();
    if (!text || isLoading) return;

    const userMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: text,
      timestamp: Date.now() / 1000
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text })
      });

      if (!response.ok) throw new Error('Falha na resposta da API');

      const data = await response.json();

      const botMessage = {
        id: data.message_id || `bot-${Date.now()}`,
        sender: 'bot',
        text: data.reply,
        source: data.source || 'ia',
        confidence: data.confidence || 0.9,
        timestamp: data.timestamp || Date.now() / 1000,
        feedback: null
      };

      setMessages((prev) => [...prev, botMessage]);

      if (data.suggested_actions && data.suggested_actions.length > 0) {
        setQuickSuggestions(data.suggested_actions);
      }
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      const errorMessage = {
        id: `err-${Date.now()}`,
        sender: 'bot',
        text: '⚠️ **Não foi possível conectar ao backend.** Verifique se o servidor está ativo na porta 8000.',
        source: 'erro',
        confidence: 0.0,
        timestamp: Date.now() / 1000,
        feedback: null
      };
      setMessages((prev) => [...prev, errorMessage]);
      setApiOnline(false);
    } finally {
      setIsLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const handleVoiceTranscript = (transcript) => {
    if (transcript) {
      setInputMessage(transcript);
      handleSendMessage(transcript);
    }
  };

  const handleFeedback = async (messageId, isPositive) => {
    try {
      await fetch(`${API_BASE_URL}/api/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message_id: messageId, is_positive: isPositive })
      });

      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === messageId
            ? { ...msg, feedback: isPositive ? 'positive' : 'negative' }
            : msg
        )
      );

      fetchMetrics();
    } catch (e) {
      console.error('Erro ao enviar feedback:', e);
    }
  };

  const speakText = (text) => {
    if (!('speechSynthesis' in window)) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const cleanText = text.replace(/[*_#`~>[\]]/g, '').replace(/<[^>]*>?/gm, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'pt-BR';
    utterance.rate = 1.05;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const resetChat = () => {
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        sender: 'bot',
        text: 'Olá! Seja muito bem-vindo(a) ao **CamoDex!** ✨\n\nEu sou a sua Pokédex e assistente de jornada inteligente. Como posso ajudar nas suas descobertas hoje?',
        source: 'sistema',
        confidence: 1.0,
        timestamp: Date.now() / 1000,
        feedback: null
      }
    ]);
  };

  return (
    <>
      {/* 🌀 Camada Decorativa de Background Pokédex (Com Animações Sutis) */}
      <PokedexBackground />

      {/* 📦 Painel Central do Chatbot (Chocolate Nobre & Limpo) */}
      <div className="app-container">
        {/* 🦊 Eevee Pequeno Debruçado no Topo do Chat */}
        <EeveeTopPeekingDecor />

        <div className="app-inner-wrapper">
          {/* 1. Header do Chatbot (CamoDex ✦) */}
          <header className="chat-header">
            <div className="header-brand">
              <div className="brand-icon-wrapper" title="Rowlet — Mascote oficial do CamoDex">
                <RowletAvatar size={34} />
              </div>
              <div className="brand-title-group">
                <div className="brand-name">
                  CamoDex <span className="brand-star">✦</span>
                </div>
                <div className="brand-subtitle">
                  Seu parceiro de jornada
                </div>
              </div>
            </div>

            <div className="header-actions">
              {/* Status Online */}
              <div className="status-pill">
                <div className="status-dot online" />
                <span>Online</span>
              </div>

              {/* Badge IA Conectada */}
              <div className="purple-badge">
                IA Conectada
              </div>

              {/* Botão Tema / Alternar */}
              <button className="icon-btn" onClick={resetChat} title="Alternar Modo / Reiniciar">
                <Sun size={15} />
              </button>

              {/* Botão Configurações / Métricas */}
              <button
                className="icon-btn"
                onClick={() => setShowMetricsModal(!showMetricsModal)}
                title="Configurações e Métricas"
              >
                <Settings size={15} />
              </button>
            </div>
          </header>

          {/* 2. Área de Mensagens */}
          <main className="chat-messages">
            {messages.map((msg) => (
              <div key={msg.id} className={`message-row ${msg.sender}`}>
                <div className={`msg-avatar ${msg.sender}`}>
                  {msg.sender === 'user' ? (
                    <PokeBallIcon size={26} />
                  ) : (
                    <PokeBallIcon size={26} />
                  )}
                </div>

                <div className={`message-bubble ${msg.sender}`}>
                  {/* Conteúdo Markdown */}
                  <FormattedMessage content={msg.text} />

                  {/* Metadados e Ações para a mensagem do Bot */}
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
                        {/* Ouvir Voz */}
                        <button
                          className="feedback-btn"
                          onClick={() => speakText(msg.text)}
                          title="Ouvir em voz alta"
                        >
                          {isSpeaking ? <VolumeX size={14} color="#EF4444" /> : <Volume2 size={14} />}
                        </button>

                        {/* Copiar */}
                        <button
                          className="feedback-btn"
                          onClick={() => copyToClipboard(msg.text, msg.id)}
                          title="Copiar texto"
                        >
                          {copiedId === msg.id ? <Check size={14} color="#10B981" /> : <Copy size={14} />}
                        </button>

                        {/* Like */}
                        <button
                          className={`feedback-btn ${msg.feedback === 'positive' ? 'active-positive' : ''}`}
                          onClick={() => handleFeedback(msg.id, true)}
                          title="Gostei da resposta (Like)"
                        >
                          <ThumbsUp size={14} />
                        </button>

                        {/* Dislike */}
                        <button
                          className={`feedback-btn ${msg.feedback === 'negative' ? 'active-negative' : ''}`}
                          onClick={() => handleFeedback(msg.id, false)}
                          title="Não gostei (Dislike)"
                        >
                          <ThumbsDown size={14} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Digitando... */}
            {isLoading && (
              <div className="message-row bot">
                <div className="msg-avatar">
                  <PokeBallIcon size={20} />
                </div>
                <div className="message-bubble bot">
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

          {/* 3. Chips de Perguntas Rápidas Pokémon */}
          {quickSuggestions.length > 0 && (
            <div className="quick-actions-container">
              {quickSuggestions.map((suggestion, index) => (
                <button
                  key={index}
                  className="quick-chip"
                  onClick={() => handleSendMessage(suggestion)}
                  disabled={isLoading}
                >
                  <PokeBallIcon size={15} />
                  <span>{suggestion}</span>
                </button>
              ))}
            </div>
          )}

          {/* 4. Barra de Entrada & Microfone */}
          <footer className="chat-input-area">
            <form
              className="input-form"
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
            >
              <input
                ref={inputRef}
                type="text"
                className="text-input"
                placeholder="Digite sua dúvida ou use o microfone..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                disabled={isLoading}
              />

              {/* Entrada por Voz */}
              <VoiceInput onTranscript={handleVoiceTranscript} disabled={isLoading} />

              {/* Botão de Envio Roxo */}
              <button
                type="submit"
                className="send-button"
                disabled={!inputMessage.trim() || isLoading}
                title="Enviar mensagem"
              >
                <Send size={18} />
              </button>
            </form>
          </footer>
        </div>

        {/* Modal de Métricas */}
        {showMetricsModal && metrics && (
          <div
            style={{
              position: 'absolute',
              top: '70px',
              right: '20px',
              backgroundColor: '#251C24',
              border: '1.5px solid #483444',
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
                style={{ background: 'none', border: 'none', color: '#958291', cursor: 'pointer', fontSize: '1rem' }}
              >
                ✕
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.85rem', color: '#E2CEF7' }}>
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

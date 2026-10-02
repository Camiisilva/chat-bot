/**
 * VoiceInput - Componente de Reconhecimento de Voz (Speech-to-Text)
 * Projeto: Chatbot de Suporte Full-Stack (AfesuTech)
 * Camada: 4 — Multimodalidade, Acessibilidade & Mobile
 * Arquivo: frontend/src/components/VoiceInput.jsx
 */

import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, AlertCircle, Volume2 } from 'lucide-react';

export default function VoiceInput({ onTranscript, disabled = false }) {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const recognitionRef = useRef(null);
  const timerRef = useRef(null);

  // Verifica compatibilidade da Web Speech API e contexto seguro ao montar
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setIsSupported(false);
      return;
    }

    // Alerta caso esteja em contexto inseguro no celular (HTTPS é obrigatório para microfone em redes externas)
    const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    const isSecure = window.isSecureContext || window.location.protocol === 'https:' || isLocal;

    if (!isSecure) {
      setFeedbackMessage('⚠️ Reconhecimento de voz requer conexão segura (HTTPS).');
      setIsError(true);
    }

    // Cleanup: Encerra qualquer reconhecimento ativo ao desmontar o componente
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {
          // Ignora erros de abortamento durante cleanup
        }
      }
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  const showNotification = (msg, error = false, duration = 4000) => {
    setFeedbackMessage(msg);
    setIsError(error);
    if (timerRef.current) clearTimeout(timerRef.current);
    if (duration > 0) {
      timerRef.current = setTimeout(() => {
        setFeedbackMessage('');
      }, duration);
    }
  };

  const startListening = () => {
    if (disabled || !isSupported) return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      showNotification('Seu navegador não suporta reconhecimento de voz.', true);
      return;
    }

    // Cancela qualquer instância anterior para máxima estabilidade em celulares
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch (e) {}
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'pt-BR';
      recognition.continuous = false; // False para melhor comportamento em dispositivos móveis
      recognition.interimResults = false; // Retorna o texto final consolidado
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListening(true);
        showNotification('🎙️ Ouvindo... Fale agora!', false, 0);
      };

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        if (transcript && transcript.trim()) {
          showNotification(`✨ Transcrito: "${transcript.trim()}"`, false, 3000);
          if (typeof onTranscript === 'function') {
            onTranscript(transcript.trim());
          }
        }
      };

      recognition.onerror = (event) => {
        console.warn('[VoiceInput Error]:', event.error);
        setIsListening(false);

        let errorMsg = 'Não foi possível capturar o áudio.';
        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          errorMsg = 'Permissão de microfone negada. Autorize nas configurações do navegador.';
        } else if (event.error === 'no-speech') {
          errorMsg = 'Nenhuma fala detectada. Toque no microfone e tente novamente.';
        } else if (event.error === 'network') {
          errorMsg = 'Erro de rede ao conectar ao serviço de voz.';
        }
        showNotification(`⚠️ ${errorMsg}`, true, 4500);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.error('[VoiceInput Initialization Error]:', err);
      setIsListening(false);
      showNotification('Falha ao iniciar microfone. Tente novamente.', true, 4000);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }
    setIsListening(false);
  };

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  if (!isSupported) {
    return (
      <button
        type="button"
        className="mic-button"
        disabled
        title="Reconhecimento de voz não suportado neste navegador"
        aria-label="Microfone não suportado"
      >
        <MicOff size={20} style={{ opacity: 0.4 }} />
      </button>
    );
  }

  return (
    <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
      {/* Botão Principal do Microfone */}
      <button
        type="button"
        onClick={toggleListening}
        disabled={disabled}
        className={`mic-button ${isListening ? 'recording' : ''}`}
        title={isListening ? 'Parar de ouvir' : 'Falar por voz (Speech-to-Text)'}
        aria-label={isListening ? 'Parar gravação de voz' : 'Iniciar gravação de voz'}
      >
        {isListening ? (
          <Mic size={20} color="#ffffff" />
        ) : (
          <Mic size={20} />
        )}
      </button>

      {/* Indicador Flutuante de Status / Transcrição */}
      {feedbackMessage && (
        <div
          style={{
            position: 'absolute',
            bottom: '52px',
            right: '0',
            backgroundColor: isError ? 'rgba(239, 68, 68, 0.95)' : 'rgba(15, 23, 42, 0.95)',
            color: '#ffffff',
            padding: '7px 14px',
            borderRadius: '9999px',
            fontSize: '0.78rem',
            fontWeight: 500,
            whiteSpace: 'nowrap',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)',
            border: isError ? '1px solid #f87171' : '1px solid rgba(6, 182, 212, 0.4)',
            backdropFilter: 'blur(10px)',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            zIndex: 100,
            animation: 'fadeIn 0.2s ease-out'
          }}
        >
          {isListening && !isError ? (
            <span
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: '#ef4444',
                display: 'inline-block',
                animation: 'pulse-mic 1s infinite'
              }}
            />
          ) : isError ? (
            <AlertCircle size={14} />
          ) : (
            <Volume2 size={14} color="#06b6d4" />
          )}
          <span>{feedbackMessage}</span>
        </div>
      )}
    </div>
  );
}

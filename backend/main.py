"""
Servidor de API REST com FastAPI
Projeto: Chatbot de Suporte Full-Stack (AfesuTech)
Camada: 3 — API REST & Comunicação Web
Arquivo Alvo: backend/main.py
"""

import os
import sys
import time
from typing import List, Optional, Dict, Any
from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import uvicorn

# Adiciona o diretório atual ao sys.path para garantir a importação de chatbot_engine
current_dir = os.path.dirname(os.path.abspath(__file__))
if current_dir not in sys.path:
    sys.path.insert(0, current_dir)

try:
    from chatbot_engine import ChatbotEngine
except ImportError:
    from backend.chatbot_engine import ChatbotEngine

# =============================================================================
# 🚀 Inicialização da Aplicação FastAPI e do ChatbotEngine
# =============================================================================

app = FastAPI(
    title="AfesuTech Chatbot API",
    description="API REST Full-Stack para atendimento automatizado com IA e base de conhecimento RAG",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# 1. Configuração de CORS liberando todas as origens para integração com frontend Vite/React
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Instância global do motor de IA
engine = ChatbotEngine()


# =============================================================================
# 📋 Modelos de Dados Pydantic
# =============================================================================

class MessageRequest(BaseModel):
    """Modelo para recebimento de mensagens do usuário."""
    message: str = Field(..., min_length=1, description="Texto da mensagem enviada pelo usuário")
    session_id: Optional[str] = Field(default=None, description="Identificador opcional da sessão do usuário")

    class Config:
        json_schema_extra = {
            "example": {
                "message": "Quais são os planos e preços disponíveis?",
                "session_id": "sess-12345"
            }
        }


class FeedbackRequest(BaseModel):
    """Modelo para registro de feedback (Like/Dislike)."""
    message_id: str = Field(..., description="ID da mensagem avaliada")
    is_positive: bool = Field(..., description="True para Like (positivo) e False para Dislike (negativo)")

    class Config:
        json_schema_extra = {
            "example": {
                "message_id": "8f3b2027-3932-4467-8e4d-7bc71b87a4de",
                "is_positive": True
            }
        }


class ChatResponse(BaseModel):
    """Modelo de resposta estruturada para o chat."""
    message_id: Optional[str] = Field(default=None, description="Identificador único da mensagem gerada")
    reply: str = Field(..., description="Texto da resposta gerada pelo chatbot")
    source: str = Field(..., description="Origem da resposta (ex: groq_llm, base_conhecimento, saudacao, fallback)")
    confidence: float = Field(..., ge=0.0, le=1.0, description="Nível estimado de confiança da resposta")
    timestamp: float = Field(..., description="Timestamp Unix da resposta")
    suggested_actions: List[str] = Field(default_factory=list, description="Ações ou perguntas sugeridas para continuidade")

    class Config:
        json_schema_extra = {
            "example": {
                "message_id": "8f3b2027-3932-4467-8e4d-7bc71b87a4de",
                "reply": "Temos planos Starter, Pro e Enterprise adaptados para cada porte de empresa.",
                "source": "groq_llm",
                "confidence": 0.95,
                "timestamp": 1710595200.0,
                "suggested_actions": [
                    "Como assinar o plano Pro?",
                    "Existe período de teste gratuito?",
                    "Falar com atendente"
                ]
            }
        }


# =============================================================================
# 🛠️ Funções Auxiliares
# =============================================================================

def _get_suggested_actions(source: str, user_message: str) -> List[str]:
    """
    Gera dinamicamente sugestões de ações ou tópicos relacionados
    baseado na base de conhecimento e na origem da resposta.
    """
    faq_kb = engine.knowledge_base.get("faq_rapido", [])
    
    if source == "saudacao":
        return [
            "Como buscar dados de Pokémon no CamoDex?",
            "Como funciona o registro de voz e Pokédex por IA?",
            "Quem é o mascote Rowlet e quais são seus atributos?"
        ]
    elif source == "fallback":
        return [
            "Como buscar dados de Pokémon no CamoDex?",
            "Como funciona o registro de voz e Pokédex por IA?",
            "Falar com suporte do CamoDex"
        ]
    
    # Padrão: extrai sugestões a partir do faq_rapido da base de conhecimento
    if faq_kb:
        return faq_kb[:3]
    
    return [
        "Como buscar dados de Pokémon no CamoDex?",
        "Como funciona o registro de voz e Pokédex por IA?",
        "Quem é o mascote Rowlet e quais são seus atributos?"
    ]


def _calculate_confidence(source: str, engine_result: Dict[str, Any]) -> float:
    """Calcula ou normaliza a pontuação de confiança da resposta."""
    if source == "groq_llm":
        return 0.95
    elif source == "base_conhecimento":
        raw_score = engine_result.get("score_similaridade", 0.9)
        return min(max(float(raw_score), 0.5), 0.99)
    elif source == "saudacao":
        return 1.0
    elif source == "fallback":
        return 0.3
    return 0.85


# =============================================================================
# 🌐 Endpoints da API REST
# =============================================================================

@app.get("/", summary="Status da API", tags=["Geral"])
def root():
    """
    Retorna o status de funcionamento da API e a lista de endpoints disponíveis.
    """
    return {
        "status": "online",
        "message": "AfesuTech Chatbot API está em execução.",
        "version": "1.0.0",
        "endpoints": {
            "GET /": "Status da API e documentação das rotas",
            "POST /api/chat": "Envio e processamento de mensagens do chatbot",
            "GET /api/knowledge-base": "Consulta à base de conhecimento carregada",
            "GET /api/metrics": "Métricas operacionais e taxa de satisfação",
            "POST /api/feedback": "Registro de avaliação de atendimento (Like/Dislike)"
        },
        "docs": {
            "swagger": "/docs",
            "redoc": "/redoc"
        }
    }


@app.post("/api/chat", response_model=ChatResponse, summary="Processar Mensagem do Chat", tags=["Chat"])
def chat_endpoint(request: MessageRequest):
    """
    Recebe uma mensagem enviada pelo usuário, processa no ChatbotEngine
    e retorna a resposta estruturada com metadados e sugestões.
    """
    user_text = request.message.strip()
    if not user_text:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A mensagem não pode ser vazia."
        )

    try:
        # Processa mensagem através do engine
        result = engine.process_message(user_text)
        
        reply_text = result.get("resposta", "")
        source = result.get("origem", "desconhecido")
        message_id = result.get("message_id")
        confidence = _calculate_confidence(source, result)
        suggested_actions = _get_suggested_actions(source, user_text)
        current_timestamp = time.time()

        return ChatResponse(
            message_id=message_id,
            reply=reply_text,
            source=source,
            confidence=confidence,
            timestamp=current_timestamp,
            suggested_actions=suggested_actions
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro interno ao processar mensagem: {str(e)}"
        )


@app.get("/api/knowledge-base", summary="Obter Base de Conhecimento", tags=["Conhecimento"])
def get_knowledge_base():
    """
    Retorna todo o conteúdo da base de conhecimento carregada atualmente pelo motor.
    """
    return {
        "status": "success",
        "knowledge_base": engine.knowledge_base
    }


@app.get("/api/metrics", summary="Obter Métricas do Chatbot", tags=["Métricas"])
def get_metrics():
    """
    Retorna o total de atendimentos realizados, a distribuição de resoluções
    e a taxa calculada de satisfação percentual dos usuários (%).
    """
    raw_metrics = engine.get_metrics()
    total_mensagens = raw_metrics.get("total_mensagens", 0)
    feedback_positivo = raw_metrics.get("feedback_positivo", 0)
    feedback_negativo = raw_metrics.get("feedback_negativo", 0)
    total_feedbacks = feedback_positivo + feedback_negativo

    # Cálculo da taxa de satisfação (%)
    if total_feedbacks > 0:
        taxa_satisfacao = round((feedback_positivo / total_feedbacks) * 100, 2)
    else:
        taxa_satisfacao = 100.0 if total_mensagens > 0 else 0.0

    return {
        "status": "success",
        "total_atendimentos": total_mensagens,
        "taxa_satisfacao_percentual": taxa_satisfacao,
        "detalhes": {
            **raw_metrics,
            "total_avaliacoes": total_feedbacks
        }
    }


@app.post("/api/feedback", summary="Registrar Avaliação de Atendimento", tags=["Métricas"])
def feedback_endpoint(request: FeedbackRequest):
    """
    Registra uma avaliação de Like (positivo) ou Dislike (negativo)
    para uma mensagem específica gerada pelo chatbot.
    """
    try:
        feedback_result = engine.register_feedback(
            message_id=request.message_id,
            is_positive=request.is_positive
        )
        return {
            "status": "success",
            "message": "Feedback registrado com sucesso!",
            "data": feedback_result
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao registrar feedback: {str(e)}"
        )


# =============================================================================
# 🚦 Bloco de Execução Principal com Uvicorn
# =============================================================================

if __name__ == "__main__":
    print("🚀 Iniciando servidor FastAPI do AfesuTech Chatbot na porta 8000...")
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)

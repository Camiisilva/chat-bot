"""
ChatbotEngine - Motor de Inteligência Artificial & PLN
Projeto: Chatbot de Suporte Full-Stack (AfesuTech)
Camada: 2 — Inteligência Artificial & PLN (AI Engine)
"""

import os
import sys
import re
import json
import uuid
import string
import urllib.request
import urllib.error
from datetime import datetime
from typing import Dict, Any, Optional, List, Tuple

# Garante suporte a UTF-8 no console Windows
if hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass



class ChatbotEngine:
    """
    Motor central de processamento de linguagem natural e orquestração de IA.
    Suporta LLM generativa via Groq API (Llama-3), RAG factual, busca léxica offline
    com pré-processamento de texto em português e gestão completa de métricas.
    """

    # Lista de stopwords comuns em português para filtragem léxica
    STOPWORDS_PT = {
        "a", "ao", "aos", "aquela", "aquelas", "aquele", "aqueles", "aquilo", "as", "ate", "até",
        "com", "como", "da", "das", "de", "dela", "delas", "dele", "deles", "do", "dos", "e",
        "ela", "elas", "ele", "eles", "em", "era", "eram", "essa", "essas", "esse", "esses",
        "esta", "estadas", "estava", "estavam", "estas", "este", "estes", "estou", "eu", "foi",
        "fomos", "foram", "ha", "há", "isso", "isto", "ja", "já", "lhe", "lhes", "me", "mesmo",
        "meu", "meus", "minha", "minhas", "muito", "na", "nao", "não", "nas", "nem", "no", "nos",
        "nós", "nossa", "nossas", "nosso", "nossos", "num", "numa", "o", "os", "ou", "para",
        "pela", "pelas", "pelo", "pelos", "por", "qual", "quais", "quando", "que", "quem", "se",
        "sem", "ser", "seu", "seus", "so", "só", "sua", "suas", "tambem", "também", "te", "tem",
        "têm", "ter", "teu", "teus", "tua", "tuas", "um", "uma", "umas", "uns", "voce", "você",
        "voces", "vocês"
    }

    # Padrões comuns de saudações e encerramentos
    GREETINGS = {"ola", "olá", "oi", "oie", "bom dia", "boa tarde", "boa noite", "opa", "e ai", "e aí", "hey", "hello", "saudações"}

    def __init__(self, knowledge_base_path: Optional[str] = None, api_key: Optional[str] = None, model: Optional[str] = None):
        """
        Inicializa o motor do chatbot.
        
        :param knowledge_base_path: Caminho customizado para o arquivo JSON da base de conhecimento.
        :param api_key: Chave de API da Groq (opcional, pode ser lida do .env ou os.environ).
        :param model: Modelo Groq/Llama a ser utilizado (padrão: llama-3.3-70b-versatile).
        """
        # Carrega variáveis de ambiente do .env caso exista
        self._load_env_file()

        # Configurações da LLM
        self.api_key = api_key or os.getenv("GROQ_API_KEY", "").strip()
        self.model = model or os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile").strip()
        self.groq_url = "https://api.groq.com/openai/v1/chat/completions"

        # Carregamento da base de conhecimento
        self.knowledge_base_path = knowledge_base_path or self._resolve_default_kb_path()
        self.knowledge_base = self._load_knowledge_base()

        # Histórico de conversação multi-turn (mensagens no formato da OpenAI/Groq API)
        self.history: List[Dict[str, str]] = []

        # Histórico interno de registros por message_id para métricas e feedback
        self.message_records: Dict[str, Dict[str, Any]] = {}

        # Dicionário de métricas operacionais
        self.metrics: Dict[str, int] = {
            "total_mensagens": 0,
            "resolvidas_base": 0,
            "resolvidas_llm": 0,
            "fallbacks": 0,
            "feedback_positivo": 0,
            "feedback_negativo": 0
        }

    def _load_env_file(self, env_path: Optional[str] = None) -> None:
        """
        Lê arquivo .env manualmente para evitar dependências externas pesadas.
        """
        if env_path is None:
            # Procura .env no diretório atual ou no diretório pai/backend
            possible_paths = [
                os.path.join(os.getcwd(), ".env"),
                os.path.join(os.path.dirname(__file__), ".env"),
                os.path.join(os.path.dirname(__file__), "..", ".env")
            ]
            for path in possible_paths:
                if os.path.exists(path):
                    env_path = path
                    break

        if env_path and os.path.exists(env_path):
            try:
                with open(env_path, "r", encoding="utf-8") as f:
                    for line in f:
                        line = line.strip()
                        if line and not line.startswith("#") and "=" in line:
                            key, val = line.split("=", 1)
                            key = key.strip()
                            val = val.strip().strip("'\"")
                            if key not in os.environ:
                                os.environ[key] = val
            except Exception as e:
                print(f"[Aviso] Não foi possível ler o arquivo .env: {e}")

    def _resolve_default_kb_path(self) -> str:
        """
        Localiza o caminho padrão do arquivo base_conhecimento.json.
        """
        current_dir = os.path.dirname(os.path.abspath(__file__))
        candidates = [
            os.path.join(current_dir, "base_conhecimento.json"),
            os.path.join(os.getcwd(), "backend", "base_conhecimento.json"),
            os.path.join(os.getcwd(), "base_conhecimento.json")
        ]
        for path in candidates:
            if os.path.exists(path):
                return path
        return os.path.join(current_dir, "base_conhecimento.json")

    def _load_knowledge_base(self) -> Dict[str, Any]:
        """
        Carrega o arquivo JSON com a base de conhecimento factual.
        """
        if not os.path.exists(self.knowledge_base_path):
            print(f"[Aviso] Base de conhecimento não encontrada em: {self.knowledge_base_path}")
            return {"empresa": "AfesuTech", "descricao": "", "topicos": [], "faq_rapido": []}

        try:
            with open(self.knowledge_base_path, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception as e:
            print(f"[Erro] Falha ao carregar JSON da base de conhecimento: {e}")
            return {"empresa": "AfesuTech", "descricao": "", "topicos": [], "faq_rapido": []}

    # =========================================================================
    # 🧠 Camada de IA Generativa & Orquestração RAG
    # =========================================================================

    def _get_current_date_pt(self) -> str:
        """
        Retorna a data atual real formatada em português para ancoragem temporal da LLM.
        """
        meses = [
            "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
            "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
        ]
        dias_semana = [
            "Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira",
            "Sexta-feira", "Sábado", "Domingo"
        ]
        agora = datetime.now()
        dia_sem = dias_semana[agora.weekday()]
        mes = meses[agora.month - 1]
        return f"{dia_sem}, {agora.day} de {mes} de {agora.year} ({agora.strftime('%H:%M')})"

    def _build_system_prompt(self) -> str:
        """
        Constrói o System Prompt detalhado, injetando ancoragem temporal,
        persona do chatbot e a base de conhecimento factual (RAG).
        """
        empresa = self.knowledge_base.get("empresa", "AfesuTech Soluções Inteligentes")
        descricao = self.knowledge_base.get("descricao", "")
        topicos = self.knowledge_base.get("topicos", [])
        data_atual = self._get_current_date_pt()

        # Compila os tópicos em formato de texto para injeção de contexto RAG
        contexto_topicos = []
        for t in topicos:
            id_topico = t.get("id", "")
            perguntas = ", ".join(t.get("perguntas_chave", []))
            resposta = t.get("resposta", "")
            contexto_topicos.append(
                f"### Tópico: [{id_topico}]\n"
                f"- Perguntas frequentes relacionadas: {perguntas}\n"
                f"- Informação oficial: {resposta}\n"
            )

        contexto_rag = "\n".join(contexto_topicos)

        system_prompt = f"""Você é o Assistente Virtual Oficial de Suporte da empresa **{empresa}**.
Seu objetivo é prestar atendimento ágil, acolhedor, profissional e preciso aos clientes.

📅 **ÂNCORA TEMPORAL (Data e Hora Real Atual):** {data_atual}

🏢 **SOBRE A EMPRESA:**
{descricao}

📚 **BASE DE CONHECIMENTO FACTUAL (FONTE DA VERDADE - RAG):**
{contexto_rag}

🎯 **DIRETRIZES DE ATENDIMENTO:**
1. **Fidelidade Factual:** Responda utilizando estritamente as informações da Base de Conhecimento acima. Não invente planos, preços, prazos ou canais de contato que não constem na base.
2. **Formatação Rica:** Utilize formatação rica em Markdown (negrito, listas, tópicos) e emojis adequados para tornar a leitura fluida e agradável.
3. **Tom de Voz:** Seja empático, prestativo, claro e objetivo.
4. **Saudações e Cortesia:** Caso o usuário apenas cumprimente ou agradeça, responda cordialmente e coloque-se à disposição para tirar dúvidas.
5. **Transbordo / Não Encontrado:** Se a pergunta do usuário não estiver contemplada nas informações institucionais, oriente gentilmente o usuário a entrar em contato com o suporte técnico humano pelo e-mail `suporte@afesutech.com.br` ou digitando **'falar com atendente'**.
"""
        return system_prompt

    def _call_groq_llm(self, user_message: str) -> Optional[str]:
        """
        Executa a chamada HTTP à API da Groq utilizando urllib (sem dependências externas).
        Mantém o histórico de conversação multi-turn.
        """
        if not self.api_key:
            return None

        # Monta a lista completa de mensagens: System Prompt + Histórico Multi-turn + Mensagem Atual
        messages = [{"role": "system", "content": self._build_system_prompt()}]
        messages.extend(self.history)
        messages.append({"role": "user", "content": user_message})

        payload = {
            "model": self.model,
            "messages": messages,
            "temperature": 0.3,
            "max_tokens": 800
        }

        data = json.dumps(payload).encode("utf-8")
        req = urllib.request.Request(
            self.groq_url,
            data=data,
            headers={
                "Content-Type": "application/json",
                "Authorization": f"Bearer {self.api_key}",
                "User-Agent": "AfesuTech-ChatbotEngine/1.0"
            },
            method="POST"
        )

        try:
            with urllib.request.urlopen(req, timeout=12) as response:
                result = json.loads(response.read().decode("utf-8"))
                assistant_message = result["choices"][0]["message"]["content"]

                # Atualiza histórico multi-turn da conversa
                self.history.append({"role": "user", "content": user_message})
                self.history.append({"role": "assistant", "content": assistant_message})

                # Limita o histórico para as últimas 10 interações (20 mensagens) para otimizar tokens
                if len(self.history) > 20:
                    self.history = self.history[-20:]

                return assistant_message
        except urllib.error.HTTPError as e:
            error_body = e.read().decode("utf-8", errors="ignore")
            print(f"[Erro Groq API HTTP {e.code}]: {error_body}")
            return None
        except Exception as e:
            print(f"[Erro de Conexão LLM]: {e}")
            return None

    # =========================================================================
    # 🔍 Motor Léxico & PLN Offline (Fallback)
    # =========================================================================

    def _preprocess_text(self, text: str) -> List[str]:
        """
        Pré-processamento de PLN:
        - Conversão para minúsculas
        - Remoção de pontuações e caracteres especiais
        - Remoção de acentos para busca flexível
        - Tokenização e remoção de stopwords em português
        """
        if not text:
            return []

        # Minúsculas
        text = text.lower()

        # Normalização simples de caracteres acentuados comuns
        substitutions = {
            "á": "a", "à": "a", "ã": "a", "â": "a",
            "é": "e", "ê": "e",
            "í": "i",
            "ó": "o", "õ": "o", "ô": "o",
            "ú": "u", "ü": "u",
            "ç": "c"
        }
        for orig, sub in substitutions.items():
            text = text.replace(orig, sub)

        # Remove pontuações
        text = re.sub(f"[{re.escape(string.punctuation)}]", " ", text)

        # Tokenização por espaços
        tokens = text.split()

        # Filtra stopwords e palavras de tamanho menor que 2
        tokens_filtrados = [
            t for t in tokens 
            if t not in self.STOPWORDS_PT and len(t) > 1
        ]

        return tokens_filtrados

    def _calculate_similarity(self, query_tokens: List[str], target_phrase: str) -> float:
        """
        Calcula a similaridade léxica através da taxa de sobreposição (Jaccard / Overlap)
        entre os tokens da consulta do usuário e a frase-alvo da base de conhecimento.
        """
        if not query_tokens:
            return 0.0

        target_tokens = self._preprocess_text(target_phrase)
        if not target_tokens:
            return 0.0

        set_query = set(query_tokens)
        set_target = set(target_tokens)

        intersection = set_query.intersection(set_target)
        if not intersection:
            return 0.0

        # Taxa ponderada: sobreposição em relação aos tokens da busca e do alvo
        overlap_query = len(intersection) / len(set_query)
        overlap_target = len(intersection) / len(set_target)
        
        # Média harmônica (F1-score lexical simplificado)
        if (overlap_query + overlap_target) == 0:
            return 0.0
        similarity = 2 * (overlap_query * overlap_target) / (overlap_query + overlap_target)

        # Bônus se houver correspondência exata de tokens essenciais
        if overlap_query >= 0.8:
            similarity = max(similarity, 0.85)

        return similarity

    def _check_greeting(self, text: str) -> Optional[str]:
        """
        Identifica se a mensagem é uma saudação ou cumprimento inicial.
        """
        cleaned = re.sub(f"[{re.escape(string.punctuation)}]", " ", text.lower()).strip()
        words = cleaned.split()
        
        # Correspondência direta ou por inclusão de termos de saudação
        is_greeting = (
            cleaned in self.GREETINGS
            or any(g in cleaned for g in self.GREETINGS)
            or any(w in self.GREETINGS for w in words)
        )

        if is_greeting and len(words) <= 6:
            empresa = self.knowledge_base.get("empresa", "AfesuTech Soluções Inteligentes")
            return (
                f"👋 **Olá! Seja muito bem-vindo(a) à {empresa}!**\n\n"
                f"Eu sou o assistente inteligente da AfesuTech. Como posso te ajudar hoje?\n\n"
                f"💡 *Você pode me perguntar sobre nossos planos e preços, integrações de API, IA generativa ou suporte técnico!*"
            )
        return None

    def _find_best_topic(self, user_message: str, threshold: float = 0.25) -> Optional[Tuple[Dict[str, Any], float]]:
        """
        Busca o tópico mais adequado na base de conhecimento calculando similaridade
        léxica contra todas as perguntas-chave cadastradas.
        """
        query_tokens = self._preprocess_text(user_message)
        if not query_tokens:
            return None

        best_topic = None
        highest_score = 0.0

        for topico in self.knowledge_base.get("topicos", []):
            perguntas_chave = topico.get("perguntas_chave", [])
            for pergunta in perguntas_chave:
                score = self._calculate_similarity(query_tokens, pergunta)
                if score > highest_score:
                    highest_score = score
                    best_topic = topico

        if highest_score >= threshold and best_topic:
            return best_topic, highest_score

        return None

    def _get_fallback_response(self) -> str:
        """
        Gera uma resposta de fallback elegante e prestativa quando não há correspondência.
        """
        faq = self.knowledge_base.get("faq_rapido", [])
        faq_sugestoes = "\n".join([f"• *{p}*" for p in faq]) if faq else ""

        resposta = (
            "🤔 **Desculpe, ainda não tenho uma resposta exata para essa dúvida.**\n\n"
            "Posso te ajudar com alguns dos tópicos mais frequentes:\n\n"
            f"{faq_sugestoes}\n\n"
            "📞 Caso queira falar com um especialista, envie um e-mail para `suporte@afesutech.com.br` "
            "ou digite **'falar com atendente'**."
        )
        return resposta

    # =========================================================================
    # 🚀 Processamento Central & Gestão de Métricas
    # =========================================================================

    def process_message(self, user_message: str) -> Dict[str, Any]:
        """
        Ponto de entrada principal para processar uma mensagem do usuário.
        Coordena a IA generativa, motor léxico e respostas de fallback, gerindo métricas.
        
        :param user_message: Texto enviado pelo usuário.
        :return: Dicionário com message_id, resposta, origem e timestamp.
        """
        user_message_clean = (user_message or "").strip()
        message_id = str(uuid.uuid4())
        self.metrics["total_mensagens"] += 1

        # 1. Tratamento de mensagem vazia
        if not user_message_clean:
            return {
                "message_id": message_id,
                "resposta": "Por favor, digite sua pergunta para que eu possa ajudá-lo(a)! 😊",
                "origem": "sistema",
                "timestamp": datetime.now().isoformat()
            }

        # 2. Verificação de Saudação simples rápida
        greeting_resp = self._check_greeting(user_message_clean)
        if greeting_resp and not self.api_key:
            self.metrics["resolvidas_base"] += 1
            record = {
                "message_id": message_id,
                "resposta": greeting_resp,
                "origem": "saudacao",
                "timestamp": datetime.now().isoformat()
            }
            self.message_records[message_id] = record
            return record

        # 3. Tentativa com LLM Generativa (Groq / Llama-3) se a chave estiver configurada
        if self.api_key:
            llm_response = self._call_groq_llm(user_message_clean)
            if llm_response:
                self.metrics["resolvidas_llm"] += 1
                record = {
                    "message_id": message_id,
                    "resposta": llm_response,
                    "origem": "groq_llm",
                    "timestamp": datetime.now().isoformat()
                }
                self.message_records[message_id] = record
                return record

        # 4. Fallback Léxico / Base de Conhecimento Offline
        if greeting_resp:
            self.metrics["resolvidas_base"] += 1
            record = {
                "message_id": message_id,
                "resposta": greeting_resp,
                "origem": "saudacao",
                "timestamp": datetime.now().isoformat()
            }
            self.message_records[message_id] = record
            return record

        topic_match = self._find_best_topic(user_message_clean)
        if topic_match:
            best_topic, score = topic_match
            self.metrics["resolvidas_base"] += 1
            record = {
                "message_id": message_id,
                "resposta": best_topic.get("resposta", ""),
                "origem": "base_conhecimento",
                "topico_id": best_topic.get("id", ""),
                "score_similaridade": round(score, 2),
                "timestamp": datetime.now().isoformat()
            }
            self.message_records[message_id] = record
            return record

        # 5. Fallback Padrão (Sem correspondência)
        self.metrics["fallbacks"] += 1
        fallback_resp = self._get_fallback_response()
        record = {
            "message_id": message_id,
            "resposta": fallback_resp,
            "origem": "fallback",
            "timestamp": datetime.now().isoformat()
        }
        self.message_records[message_id] = record
        return record

    def register_feedback(self, message_id: str, is_positive: bool) -> Dict[str, Any]:
        """
        Registra feedback (positivo/negativo) para uma mensagem respondida.
        
        :param message_id: Identificador único da mensagem.
        :param is_positive: True para feedback positivo, False para negativo.
        :return: Status do registro e métricas atualizadas.
        """
        if is_positive:
            self.metrics["feedback_positivo"] += 1
        else:
            self.metrics["feedback_negativo"] += 1

        if message_id in self.message_records:
            self.message_records[message_id]["feedback"] = "positivo" if is_positive else "negativo"

        return {
            "status": "success",
            "message_id": message_id,
            "feedback": "positivo" if is_positive else "negativo",
            "metrics": self.get_metrics()
        }

    def get_metrics(self) -> Dict[str, int]:
        """
        Retorna uma cópia das métricas acumuladas do motor.
        """
        return dict(self.metrics)

    def reset_history(self) -> None:
        """
        Limpa o histórico de conversação multi-turn.
        """
        self.history.clear()


if __name__ == "__main__":
    # Teste rápido do motor em modo standalone
    print("🤖 Inicializando ChatbotEngine para testes...")
    engine = ChatbotEngine()
    print(f"📦 Empresa carregada: {engine.knowledge_base.get('empresa')}")
    print(f"📊 Métricas iniciais: {engine.get_metrics()}")

    test_queries = [
        "Olá, bom dia!",
        "Quais são os planos e preços?",
        "Vocês integram com WhatsApp e API?",
        "Qual o cardápio da pizzaria?"  # Pergunta fora de escopo para testar fallback
    ]

    for q in test_queries:
        print(f"\n👤 Usuário: {q}")
        res = engine.process_message(q)
        print(f"🤖 Bot ({res['origem']}):\n{res['resposta']}")
        engine.register_feedback(res["message_id"], is_positive=True)

    print("\n📊 Métricas Finais:", engine.get_metrics())

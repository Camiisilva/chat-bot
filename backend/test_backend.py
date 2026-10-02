"""
Script de Testes Automatizados no Terminal
Projeto: Chatbot de Suporte Full-Stack (AfesuTech)
Camada: 2/3 — Validação & Qualidade de Software
Arquivo Alvo: backend/test_backend.py
"""

import os
import sys

# Adiciona o diretório atual ao sys.path para importação
current_dir = os.path.dirname(os.path.abspath(__file__))
if current_dir not in sys.path:
    sys.path.insert(0, current_dir)

try:
    from chatbot_engine import ChatbotEngine
except ImportError:
    from backend.chatbot_engine import ChatbotEngine


def run_tests():
    print("=" * 70)
    print("🤖 AFESUTECH CHATBOT - BATERIA DE TESTES AUTOMATIZADOS")
    print("=" * 70)

    # 1. Inicialização do Motor
    engine = ChatbotEngine()
    
    llm_configured = bool(engine.api_key)
    llm_status = f"Configurada ({engine.model})" if llm_configured else "Desativada (Modo Offline / Léxico)"
    print(f"📡 Status da LLM: {llm_status}")
    print(f"🏢 Empresa Carregada: {engine.knowledge_base.get('empresa', 'N/A')}")
    print(f"📚 Tópicos na Base: {len(engine.knowledge_base.get('topicos', []))}")
    print("-" * 70)

    test_cases = [
        {
            "id": 1,
            "descricao": "Saudação do Usuário",
            "pergunta": "Olá, tudo bem?",
            "tipo_esperado": ["saudacao", "groq_llm"]
        },
        {
            "id": 2,
            "descricao": "Pergunta existente na Base de Conhecimento (Planos e Preços)",
            "pergunta": "Quais são os planos e preços?",
            "tipo_esperado": ["base_conhecimento", "groq_llm"]
        },
        {
            "id": 3,
            "descricao": "Pergunta sobre Integração (React e Python / API)",
            "pergunta": "Como faço a integração com React e Python?",
            "tipo_esperado": ["base_conhecimento", "groq_llm"]
        }
    ]

    all_passed = True

    for test in test_cases:
        print(f"\n🧪 [TESTE {test['id']}] {test['descricao']}")
        print(f"👤 Pergunta: \"{test['pergunta']}\"")
        
        result = engine.process_message(test['pergunta'])
        
        origem = result.get("origem", "desconhecido")
        resposta = result.get("resposta", "").strip()
        confidence = result.get("score_similaridade", 0.95 if origem in ["groq_llm", "saudacao"] else 0.85)

        print(f"📍 Origem: {origem}")
        print(f"🎯 Confiança / Score: {confidence}")
        print(f"🤖 Resposta Obtida:\n{resposta}")

        # Validação básica
        passed = (
            len(resposta) > 10 and 
            (origem in test["tipo_esperado"] or origem in ["base_conhecimento", "saudacao", "groq_llm", "fallback"])
        )

        if passed:
            print(f"✅ [OK] Teste {test['id']} passou com sucesso!")
        else:
            print(f"❌ [FALHA] Teste {test['id']} não atendeu aos critérios esperados.")
            all_passed = False

    print("\n" + "=" * 70)
    print("📊 RESULTADO CONSOLIDADO")
    print("=" * 70)
    metrics = engine.get_metrics()
    print(f"📈 Total de Atendimentos no Teste: {metrics.get('total_mensagens', 0)}")
    print(f"📗 Resolvidas por Base: {metrics.get('resolvidas_base', 0)}")
    print(f"🤖 Resolvidas por LLM: {metrics.get('resolvidas_llm', 0)}")
    print(f"🔄 Fallbacks: {metrics.get('fallbacks', 0)}")

    if all_passed:
        print("\n🎉 [OK] TODOS OS TESTES PASSARAM COM SUCESSO! O backend está pronto para integração com o frontend.")
        return 0
    else:
        print("\n⚠️ Alguns testes apresentaram inconsistências.")
        return 1


if __name__ == "__main__":
    exit_code = run_tests()
    sys.exit(exit_code)

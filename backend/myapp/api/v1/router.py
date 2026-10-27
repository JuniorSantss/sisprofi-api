from rest_framework.routers import DefaultRouter
from django.urls import path
from .recuperacao_senha import (
    SolicitarRecuperacaoSenhaView,
    RedefinirSenhaView,
)

from .viewsets import (
    AlunoViewSet,
    ProgramaViewSet,
    AgendamentoViewSet,
    AtendimentoViewSet,
    FuncionarioViewSet,
    PendenciaViewSet
)


router = DefaultRouter()

router.register('alunos', AlunoViewSet)
router.register('programas', ProgramaViewSet)
router.register('agendamentos', AgendamentoViewSet)
router.register('atendimentos', AtendimentoViewSet)
router.register('funcionarios', FuncionarioViewSet)
router.register('pendencias', PendenciaViewSet)

urlpatterns = router.urls + [
    path(
        "recuperar-senha/solicitar/",
        SolicitarRecuperacaoSenhaView.as_view(),
        name="recuperar-senha-solicitar",
    ),

    path(
        "recuperar-senha/redefinir/",
        RedefinirSenhaView.as_view(),
        name="recuperar-senha-redefinir",
    ),
]
from rest_framework.routers import DefaultRouter

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

urlpatterns = router.urls
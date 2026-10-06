from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated

from myapp.models import (
    Aluno,
    Programa,
    Agendamento,
    Atendimento,
    Funcionario,
    Pendencia
)

from .serializers import (
    AlunoSerializer,
    ProgramaSerializer,
    AgendamentoSerializer,
    AtendimentoSerializer,
    FuncionarioSerializer,
    PendenciaSerializer
)


class AlunoViewSet(viewsets.ModelViewSet):
    queryset = Aluno.objects.all()
    serializer_class = AlunoSerializer
    permission_classes = [IsAuthenticated]


class ProgramaViewSet(viewsets.ModelViewSet):
    queryset = Programa.objects.all()
    serializer_class = ProgramaSerializer
    permission_classes = [IsAuthenticated]


class AgendamentoViewSet(viewsets.ModelViewSet):
    queryset = Agendamento.objects.all()
    serializer_class = AgendamentoSerializer
    permission_classes = [IsAuthenticated]


class AtendimentoViewSet(viewsets.ModelViewSet):
    queryset = Atendimento.objects.all()
    serializer_class = AtendimentoSerializer
    permission_classes = [IsAuthenticated]


class FuncionarioViewSet(viewsets.ModelViewSet):
    queryset = Funcionario.objects.all()
    serializer_class = FuncionarioSerializer
    permission_classes = [IsAuthenticated]


class PendenciaViewSet(viewsets.ModelViewSet):
    queryset = Pendencia.objects.all()
    serializer_class = PendenciaSerializer
    permission_classes = [IsAuthenticated]
from rest_framework import viewsets

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


class ProgramaViewSet(viewsets.ModelViewSet):
    queryset = Programa.objects.all()
    serializer_class = ProgramaSerializer


class AgendamentoViewSet(viewsets.ModelViewSet):
    queryset = Agendamento.objects.all()
    serializer_class = AgendamentoSerializer


class AtendimentoViewSet(viewsets.ModelViewSet):
    queryset = Atendimento.objects.all()
    serializer_class = AtendimentoSerializer


class FuncionarioViewSet(viewsets.ModelViewSet):
    queryset = Funcionario.objects.all()
    serializer_class = FuncionarioSerializer


class PendenciaViewSet(viewsets.ModelViewSet):
    queryset = Pendencia.objects.all()
    serializer_class = PendenciaSerializer
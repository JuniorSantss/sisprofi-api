from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny

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
    CadastroAlunoSerializer,
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

    @action(
        detail=False,
        methods=["post"],
        permission_classes=[AllowAny],
        url_path="cadastro",
    )
    def cadastro(self, request):
        serializer = CadastroAlunoSerializer(data=request.data)

        serializer.is_valid(raise_exception=True)
        aluno = serializer.save()

        return Response(
            AlunoSerializer(aluno).data,
            status=status.HTTP_201_CREATED,
        )
    @action(
        detail=False,
        methods=["get"],
        permission_classes=[IsAuthenticated],
        url_path="me",
    )
    def me(self, request):
        try:
            aluno = request.user.aluno
        except Aluno.DoesNotExist:
            return Response(
                {"detail": "O usuário autenticado não está vinculado a um aluno."},
                status=status.HTTP_404_NOT_FOUND,
            )

        serializer = self.get_serializer(aluno)
        return Response(serializer.data)

class ProgramaViewSet(viewsets.ModelViewSet):
    queryset = Programa.objects.all()
    serializer_class = ProgramaSerializer
    permission_classes = [IsAuthenticated]


class AgendamentoViewSet(viewsets.ModelViewSet):
    queryset = Agendamento.objects.all()
    serializer_class = AgendamentoSerializer
    permission_classes = [IsAuthenticated]

    @action(
        detail=False,
        methods=["post"],
        permission_classes=[IsAuthenticated],
        url_path="meu-agendamento",
    )
    def meu_agendamento(self, request):
        try:
            aluno = request.user.aluno
        except Aluno.DoesNotExist:
            return Response(
                {"detail": "O usuário autenticado não está vinculado a um aluno."},
                status=status.HTTP_404_NOT_FOUND,
            )

        dados = request.data.copy()
        dados["aluno"] = aluno.cpf_aluno

        serializer = AgendamentoSerializer(data=dados)
        serializer.is_valid(raise_exception=True)

        agendamento = serializer.save()

        return Response(
            AgendamentoSerializer(agendamento).data,
            status=status.HTTP_201_CREATED,
        )


class AtendimentoViewSet(viewsets.ModelViewSet):
    queryset = Atendimento.objects.all()
    serializer_class = AtendimentoSerializer
    permission_classes = [IsAuthenticated]


class FuncionarioViewSet(viewsets.ModelViewSet):
    queryset = Funcionario.objects.all()
    serializer_class = FuncionarioSerializer
    permission_classes = [IsAuthenticated]

    @action(
        detail=False,
        methods=["get"],
        permission_classes=[IsAuthenticated],
        url_path="me"
    )

    def me(self, request):
        try:
            funcionario = request.user.funcionario

        except Funcionario.DoesNotExist:
            return Response(
                {
                    "detail": "O usuário autenticado não está vinculado a um funcionário."
                },
                status=status.HTTP_404_NOT_FOUND
            )
        serializer = self.get_serializer(funcionario)

        return Response(serializer.data)


class PendenciaViewSet(viewsets.ModelViewSet):
    queryset = Pendencia.objects.all()
    serializer_class = PendenciaSerializer
    permission_classes = [IsAuthenticated]
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from myapp.models import Funcionario
from .serializers import FuncionarioSerializer

class FuncionarioViewSet(viewsets.ModelViewSet):
    queryset = Funcionario.objects.all()
    serializer_class = FuncionarioSerializer

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
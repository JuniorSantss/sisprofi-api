import secrets

from django.conf import settings
from django.contrib.auth.models import User
from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from myapp.models import Funcionario, CodigoRecuperacaoSenha


class SolicitarRecuperacaoSenhaView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get("email", "").strip()

        if not email:
            return Response(
                {"detail": "Informe o e-mail."},
                status=status.HTTP_400_BAD_REQUEST
            )

        funcionario = Funcionario.objects.filter(
            email__iexact=email
        ).select_related("usuario").first()

        # Não revelamos se o e-mail existe ou não
        if not funcionario or not funcionario.usuario:
            return Response(
                {
                    "detail": "Se o e-mail estiver cadastrado, um código de recuperação será enviado."
                },
                status=status.HTTP_200_OK
            )

        usuario = funcionario.usuario

        # Invalida códigos antigos ainda não utilizados
        CodigoRecuperacaoSenha.objects.filter(
            usuario=usuario,
            usado=False
        ).update(usado=True)

        codigo = str(secrets.randbelow(900000) + 100000)

        CodigoRecuperacaoSenha.objects.create(
            usuario=usuario,
            codigo=codigo
        )

        resposta = {
            "detail": "Código de recuperação gerado com sucesso."
        }

        # Apenas durante o desenvolvimento
        if settings.DEBUG:
            resposta["codigo"] = codigo

        return Response(resposta, status=status.HTTP_200_OK)


class RedefinirSenhaView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get("email", "").strip()
        codigo = request.data.get("codigo", "").strip()
        nova_senha = request.data.get("nova_senha", "")

        if not email or not codigo or not nova_senha:
            return Response(
                {
                    "detail": "Informe e-mail, código e nova senha."
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        if len(nova_senha) < 8:
            return Response(
                {
                    "detail": "A nova senha deve possuir pelo menos 8 caracteres."
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        funcionario = Funcionario.objects.filter(
            email__iexact=email
        ).select_related("usuario").first()

        if not funcionario or not funcionario.usuario:
            return Response(
                {"detail": "Código inválido ou expirado."},
                status=status.HTTP_400_BAD_REQUEST
            )

        usuario = funcionario.usuario

        recuperacao = CodigoRecuperacaoSenha.objects.filter(
            usuario=usuario,
            codigo=codigo,
            usado=False
        ).order_by("-criado_em").first()

        if not recuperacao:
            return Response(
                {"detail": "Código inválido ou expirado."},
                status=status.HTTP_400_BAD_REQUEST
            )

        if recuperacao.expirado():
            recuperacao.usado = True
            recuperacao.save()

            return Response(
                {"detail": "Código inválido ou expirado."},
                status=status.HTTP_400_BAD_REQUEST
            )

        usuario.set_password(nova_senha)
        usuario.save()

        recuperacao.usado = True
        recuperacao.save()

        return Response(
            {"detail": "Senha alterada com sucesso."},
            status=status.HTTP_200_OK
        )
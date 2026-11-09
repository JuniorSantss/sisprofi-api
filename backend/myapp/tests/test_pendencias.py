from django.test import TestCase
from django.contrib.auth.models import User
from myapp.api.v1.serializers import PendenciaSerializer

from myapp.models import (
    Aluno,
    Programa,
    Agendamento,
    Atendimento,
    Funcionario,
    Pendencia,
)


class PendenciaTestCase(TestCase):

    def setUp(self):
        self.usuario = User.objects.create_user(
            username="funcionario_teste",
            password="12345678",
        )

        self.funcionario = Funcionario.objects.create(
            usuario=self.usuario,
            cpf_func="11111111111",
            nome="Funcionário Teste",
            email="funcionario@teste.com",
        )

        self.programa = Programa.objects.create(
            nome="PROUNI",
            descricao="Programa de teste",
        )

        self.aluno = Aluno.objects.create(
            cpf_aluno="22222222222",
            nome="Aluno Teste",
            contato="83999999999",
            curso="ADS",
        )

        self.aluno.programas.add(self.programa)

        self.agendamento = Agendamento.objects.create(
            aluno=self.aluno,
            data="2026-11-09",
            horario="14:00",
            motivo="Atendimento de teste",
            status="Concluído",
        )

        self.atendimento = Atendimento.objects.create(
            agendamento=self.agendamento,
            funcionario=self.funcionario,
            data_atendimento="2026-11-09",
            descricao="Atendimento iniciado",
            status="Em andamento",
        )

    def test_registrar_pendencia(self):
        pendencia = Pendencia.objects.create(
            atendimento=self.atendimento,
            descricao="Documento pendente",
            status="Aberta",
            data_criacao="2026-11-09",
        )

        self.assertEqual(pendencia.status, "Aberta")
        self.assertEqual(pendencia.atendimento, self.atendimento)

    def test_atendimento_possui_pendencia(self):
        Pendencia.objects.create(
            atendimento=self.atendimento,
            descricao="Documento pendente",
            status="Aberta",
            data_criacao="2026-11-09",
        )

        quantidade = self.atendimento.pendencias.count()

        self.assertEqual(quantidade, 1)

    def test_criar_pendencia_muda_atendimento_para_com_pendencia(self):
        serializer = PendenciaSerializer(
            data={
                "atendimento": self.atendimento.id,
                "descricao": "Documento pendente",
                "status": "Aberta",
                "data_criacao": "2026-11-09",
            }
        )

        self.assertTrue(serializer.is_valid(), serializer.errors)

        serializer.save()

        self.atendimento.refresh_from_db()

        self.assertEqual(
            self.atendimento.status,
            "Com pendência",
        )

    def test_concluir_ultima_pendencia_volta_atendimento_para_em_andamento(self):
        self.atendimento.status = "Com pendência"
        self.atendimento.save()

        pendencia = Pendencia.objects.create(
            atendimento=self.atendimento,
            descricao="Documento pendente",
            status="Aberta",
            data_criacao="2026-11-09",
        )

        serializer = PendenciaSerializer(
            pendencia,
            data={
                "status": "Concluída",
            },
            partial=True,
        )

        self.assertTrue(serializer.is_valid(), serializer.errors)

        serializer.save()

        self.atendimento.refresh_from_db()
        pendencia.refresh_from_db()

        self.assertEqual(pendencia.status, "Concluída")
        self.assertEqual(
            self.atendimento.status,
            "Em andamento",
        )
from django.test import TestCase
from django.contrib.auth.models import User
from myapp.api.v1.serializers import AtendimentoSerializer

from myapp.models import (
    Aluno,
    Programa,
    Agendamento,
    Atendimento,
    Funcionario,
)


class AtendimentoTestCase(TestCase):

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
            status="Agendado",
        )

    def test_criar_atendimento_para_agendamento_ativo(self):
        atendimento = Atendimento.objects.create(
            agendamento=self.agendamento,
            funcionario=self.funcionario,
            data_atendimento="2026-11-09",
            descricao="Atendimento iniciado",
            status="Em andamento",
        )

        self.assertEqual(atendimento.status, "Em andamento")
        self.assertEqual(atendimento.agendamento, self.agendamento)

    def test_atendimento_pertence_ao_aluno_do_agendamento(self):
        atendimento = Atendimento.objects.create(
            agendamento=self.agendamento,
            funcionario=self.funcionario,
            data_atendimento="2026-11-09",
            descricao="Atendimento iniciado",
            status="Em andamento",
        )

        aluno_do_atendimento = atendimento.agendamento.aluno

        self.assertEqual(aluno_do_atendimento, self.aluno)

    def test_nao_permite_concluir_atendimento_com_pendencia_aberta(self):
        atendimento = Atendimento.objects.create(
            agendamento=self.agendamento,
            funcionario=self.funcionario,
            data_atendimento="2026-11-09",
            descricao="Atendimento iniciado",
            status="Com pendência",
        )

        from myapp.models import Pendencia

        Pendencia.objects.create(
            atendimento=atendimento,
            descricao="Documento pendente",
            status="Aberta",
            data_criacao="2026-11-09",
        )

        serializer = AtendimentoSerializer(
            atendimento,
            data={
                "status": "Concluído",
            },
            partial=True,
        )

        self.assertFalse(serializer.is_valid())

        self.assertIn(
            "Não é possível concluir o atendimento enquanto houver pendências abertas.",
            str(serializer.errors),
        )
    def test_permite_concluir_atendimento_com_pendencias_concluidas(self):
        atendimento = Atendimento.objects.create(
            agendamento=self.agendamento,
            funcionario=self.funcionario,
            data_atendimento="2026-11-09",
            descricao="Atendimento iniciado",
            status="Com pendência",
        )

        from myapp.models import Pendencia

        Pendencia.objects.create(
            atendimento=atendimento,
            descricao="Documento pendente",
            status="Concluída",
            data_criacao="2026-11-09",
        )

        serializer = AtendimentoSerializer(
            atendimento,
            data={
                "status": "Concluído",
            },
            partial=True,
        )

        self.assertTrue(serializer.is_valid(), serializer.errors)

        serializer.save()

        atendimento.refresh_from_db()

        self.assertEqual(
            atendimento.status,
            "Concluído",
        )

    def test_nao_permite_dois_atendimentos_ativos_para_mesmo_aluno(self):
        primeiro_agendamento = self.agendamento

        Atendimento.objects.create(
            agendamento=primeiro_agendamento,
            funcionario=self.funcionario,
            data_atendimento="2026-11-09",
            descricao="Primeiro atendimento",
            status="Em andamento",
        )

        segundo_agendamento = Agendamento.objects.create(
            aluno=self.aluno,
            data="2026-11-10",
            horario="15:00",
            motivo="Segundo atendimento",
            status="Agendado",
        )

        serializer = AtendimentoSerializer(
            data={
                "agendamento": segundo_agendamento.id,
                "funcionario": self.funcionario.cpf_func,
                "data_atendimento": "2026-11-10",
                "descricao": "Segundo atendimento",
                "status": "Em andamento",
            }
        )

        self.assertFalse(serializer.is_valid())

        self.assertIn(
            "Este aluno já possui outro atendimento ativo.",
            str(serializer.errors),
        )

    def test_permite_novo_atendimento_quando_anterior_esta_concluido(self):
        primeiro_agendamento = self.agendamento

        Atendimento.objects.create(
            agendamento=primeiro_agendamento,
            funcionario=self.funcionario,
            data_atendimento="2026-11-09",
            descricao="Primeiro atendimento",
            status="Concluído",
        )

        segundo_agendamento = Agendamento.objects.create(
            aluno=self.aluno,
            data="2026-11-10",
            horario="15:00",
            motivo="Segundo atendimento",
            status="Agendado",
        )

        serializer = AtendimentoSerializer(
            data={
                "agendamento": segundo_agendamento.id,
                "funcionario": self.funcionario.cpf_func,
                "data_atendimento": "2026-11-10",
                "descricao": "Segundo atendimento",
                "status": "Em andamento",
            }
        )

        self.assertTrue(serializer.is_valid(), serializer.errors)

        atendimento = serializer.save()

        self.assertEqual(
            atendimento.status,
            "Em andamento",
        )

        self.assertEqual(
            atendimento.agendamento,
            segundo_agendamento,
        )
from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone



class Programa(models.Model):
    nome = models.CharField(max_length=50, unique=True)
    descricao = models.CharField(max_length=255)

    def __str__(self):
        return self.nome


class Aluno(models.Model):
    cpf_aluno = models.CharField(max_length=11, primary_key=True)
    nome = models.CharField(max_length=100)
    contato = models.CharField(max_length=15)
    curso = models.CharField(max_length=100)
    programas = models.ManyToManyField(Programa)

    def __str__(self):
        return self.nome


class Funcionario(models.Model):
    usuario = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name='funcionario',
        null=True,
        blank=True
    )
    cpf_func = models.CharField(max_length=11, primary_key=True)
    nome = models.CharField(max_length=100)
    email = models.EmailField(max_length=100)

    def __str__(self):
        return self.nome


class Agendamento(models.Model):
    aluno = models.ForeignKey(
        Aluno,
        on_delete=models.CASCADE,
        related_name='agendamentos'
    )
    data = models.DateField()
    horario = models.TimeField()
    motivo = models.CharField(max_length=255)
    status = models.CharField(max_length=30)

    def __str__(self):
        return f'{self.aluno.nome} - {self.data} {self.horario}'


class Atendimento(models.Model):
    agendamento = models.OneToOneField(
        Agendamento,
        on_delete=models.CASCADE,
        related_name='atendimento'
    )
    funcionario = models.ForeignKey(
        Funcionario,
        on_delete=models.PROTECT,
        related_name='atendimentos'
    )
    data_atendimento = models.DateField()
    descricao = models.CharField(max_length=255)
    status = models.CharField(max_length=30)

    def __str__(self):
        return f'Atendimento {self.id}'


class Pendencia(models.Model):
    atendimento = models.ForeignKey(
        Atendimento,
        on_delete=models.CASCADE,
        related_name='pendencias'
    )
    descricao = models.CharField(max_length=255)
    status = models.CharField(max_length=30)
    data_criacao = models.DateField()

    def __str__(self):
        return f'Pendência {self.id}'

class CodigoRecuperacaoSenha(models.Model):
    usuario = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="codigos_recuperacao"
    )

    codigo = models.CharField(max_length=6)

    criado_em = models.DateTimeField(auto_now_add=True)

    usado = models.BooleanField(default=False)

    def expirado(self):
        limite = self.criado_em + timezone.timedelta(minutes=10)
        return timezone.now() > limite

    def __str__(self):
        return f"{self.usuario.username} - {self.codigo}"
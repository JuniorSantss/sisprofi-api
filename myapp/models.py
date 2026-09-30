from django.db import models


class Programa(models.Model):
    nome = models.CharField(max_length=50)
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
    
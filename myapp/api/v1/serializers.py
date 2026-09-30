from rest_framework import serializers

from myapp.models import (
    Aluno,
    Programa,
    Agendamento,
    Atendimento,
    Funcionario,
    Pendencia
)


class ProgramaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Programa
        fields = '__all__'


class AlunoSerializer(serializers.ModelSerializer):
    programas = serializers.PrimaryKeyRelatedField(
        many=True,
        queryset=Programa.objects.all(),
        write_only=True
    )

    nomes_programas = serializers.StringRelatedField(
        source='programas',
        many=True,
        read_only=True
    )

    class Meta:
        model = Aluno
        fields = [
            'cpf_aluno',
            'nome',
            'contato',
            'curso',
            'programas',
            'nomes_programas'
        ]


class FuncionarioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Funcionario
        fields = '__all__'


class AgendamentoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Agendamento
        fields = '__all__'


class AtendimentoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Atendimento
        fields = '__all__'


class PendenciaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Pendencia
        fields = '__all__'
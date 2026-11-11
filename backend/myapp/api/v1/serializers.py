from rest_framework import serializers
from django.contrib.auth.models import User

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

class CadastroAlunoSerializer(serializers.ModelSerializer):
    username = serializers.CharField(write_only=True)
    password = serializers.CharField(write_only=True)

    class Meta:
        model = Aluno
        fields = [
            'cpf_aluno',
            'nome',
            'contato',
            'curso',
            'programas',
            'username',
            'password',
        ]

    def create(self, validated_data):
        username = validated_data.pop('username')
        password = validated_data.pop('password')
        programas = validated_data.pop('programas', [])

        usuario = User.objects.create_user(
            username=username,
            password=password,
        )

        aluno = Aluno.objects.create(
            usuario=usuario,
            **validated_data,
        )

        aluno.programas.set(programas)

        return aluno

class FuncionarioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Funcionario
        fields = '__all__'


class AgendamentoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Agendamento
        fields = '__all__'

    def validate(self, data):
        aluno = data.get('aluno')

        agendamento_ativo = Agendamento.objects.filter(
            aluno=aluno,
            status='Agendado'
        ).exists()

        if agendamento_ativo:
            raise serializers.ValidationError(
                'O aluno já possui um atendimento ativo.'
            )

        atendimento_ativo = Atendimento.objects.filter(
            agendamento__aluno=aluno,
            status__in=['Em andamento', 'Com pendência']
        ).exists()

        if atendimento_ativo:
            raise serializers.ValidationError(
                'O aluno já possui atendimento ativo.'
            )

        return data

class AtendimentoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Atendimento
        fields = '__all__'

    def validate(self, data):
        agendamento = data.get(
            'agendamento',
            getattr(self.instance, 'agendamento', None)
        )

        status = data.get(
            'status',
            getattr(self.instance, 'status', None)
        )

        if status in ['Em andamento', 'Com pendência']:
            aluno = agendamento.aluno

            atendimentos_ativos = Atendimento.objects.filter(
                agendamento__aluno=aluno,
                status__in=['Em andamento', 'Com pendência'],
            )

            if self.instance:
                atendimentos_ativos = atendimentos_ativos.exclude(
                    id=self.instance.id
                )

            if atendimentos_ativos.exists():
                raise serializers.ValidationError(
                    'Este aluno já possui outro atendimento ativo.'
                )

        if self.instance is None:
            if agendamento.status != 'Agendado':
                raise serializers.ValidationError(
                    'Só é possível iniciar atendimento para um agendamento'
                    'ativo.'
                )

        if status == 'Concluído' and self.instance:
            possui_pendencia_aberta = self.instance.pendencias.exclude(
                status='Concluída'
            ).exists()

            if possui_pendencia_aberta:
                raise serializers.ValidationError(
                    'Não é possível concluir o atendimento enquanto houver '
                    'pendências abertas.'
                )
                
        return data

    def create(self, validated_data):
        atendimento = Atendimento.objects.create(**validated_data)

        agendamento = atendimento.agendamento
        agendamento.status = 'Concluído'
        agendamento.save()

        return atendimento


class PendenciaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Pendencia
        fields = '__all__'

    def validate(self, data):
        atendimento = data.get(
            'atendimento',
            getattr(self.instance, 'atendimento', None)
        )

        if atendimento.status not in ['Em andamento', 'Com pendência']:
            raise serializers.ValidationError(
                'Só é possível registrar ou alterar pendências em um '
                'atendimento ativo.'
            )

        return data

    def create(self, validated_data):
        pendencia = Pendencia.objects.create(**validated_data)

        atendimento = pendencia.atendimento
        atendimento.status = 'Com pendência'
        atendimento.save()

        return pendencia

    def update(self, instance, validated_data):
        pendencia = super().update(instance, validated_data)

        atendimento = pendencia.atendimento

        possui_pendencia_aberta = Pendencia.objects.filter(
            atendimento=atendimento
        ).exclude(
            status='Concluída'
        ).exists()

        if possui_pendencia_aberta:
            atendimento.status = 'Com pendência'
        else:
            atendimento.status = 'Em andamento'

        atendimento.save(update_fields=['status'])

        return pendencia
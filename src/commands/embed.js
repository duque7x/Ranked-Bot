const { SlashCommandBuilder, EmbedBuilder, Colors, PermissionFlagsBits } = require("discord.js");
const myColours = require("../structures/colours");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("embed")
        .setDescription("Este comando retorna uma embed com as regras do server!")
        .addStringOption(option =>
            option.setName("tipo")
                .setDescription("Escolha o tipo de embed")
                .setRequired(true)
                .addChoices(
                    { name: "regras", value: "rules" },
                    { name: "tatico", value: "tatico" },
                    { name: "vencedor", value: "winner" },
                    { name: "como jogar", value: "play" },
                    { name: "regras 1x1", value: "rules_1v1" },
                )
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    /**
     * @param {import('discord.js').CommandInteraction} interaction
     */
    async execute(interaction) {
        const rules = `
# BEM-VINDOS A BLOOD APOSTAS!
\`LEIAM AS REGRAS PARA EVITAR QUALQUER TIPO DE W.O!\`
## PERSONAGENS
> VALE APENAS ALOK 
> VALE KELLY
> VALE MOCO
> VALE MAXIM
> VALE LEON
## PETS
> SEM DRAKINHO
> SEM ETZIN
> SEM ROBOZINHO
> SEM MANDRAKO
## ARMAS
> DESERT SOMENTE NO 1º ROUND
> VALE M1014 - 1 POR TIME
> ﻿﻿﻿VALE USP
> VALE XM8
> VALE UMP﻿ 
> VALE MP4
> GRANADA SOMENTE DE **GELO**
## REGRAS GERAIS
> SEM SUBIR EM CASA
> SÓ VALE "SUBIR" ATÉ METADE DAS ESCADAS PARA PEGAR PÉ / PULAR / ATIRAR
> PLATAFORMA DE OBS E TODOS OS CONTAINERS VALE
> VALE SUBIR NOS SKIPS
> PEDIR ROUND DESNECESSARIO É W.O
> NO MÁXIMO 10MIN PARA ENTRAR NA SALA OU W.O.
## REGRAS PARA EMULADORES
> APOSTA + 50€ OBRIGATÓRIO JOGAR A TRANSMITIR TELA
> TRANSMISSÃO: OBRIGATÓRIO ABRIR O JOGO DEPOIS DE TRANSMITIR, CASO JOGO ESTIVER FECHADO OU VOCE RELOGOU RESULTARA EM W.O DIRETO
> MENTIR NICK: RESULTARA EM PUNICAO DE W.O
> REVANCHE: PODE TROCAR JOGADOR, NÃO PRECISA SER O MESMO TIME, A NÃO SER QUE O ADVERSÁRIO SOLICITE "REVANCHE MESMO TIME"
# ATENÇÃO
\`PERSONAGENS QUE NÃO ESTÃO ACIMA NÃO VALEM\`
\`QUEM NÃO PERSONAGENS JOGA SEM\`
\`﻿PERSONAGENS ERRADOS REFAZER ATÉ O 3a0 OU 3A3\`
\`REPLAY OBRIGATÓRIO\`
\`NÍVEL MÍNIMO 15\`
﻿﻿﻿\`ARMAS QUE NÃO ESTÃO ACIMA NÃO VALEM\`
\`﻿PET ERRADO REFAZER ATÉ O 3a0 OU 3A3\`
`;

        const taticosRule = `# REGRAS TÁTICO
## ARMAS QUE NÃO VALEM
> AC80
> GRANADA 
## PETS QUE NÃO VALEM
> DRAKINHO
> MANDRAKO
## PERSONAGENS QUE NÃO VALEM
> SKYLER
> ÁLVARO
> HOMERO
> A124
> ORION
> SONIA
> IGNIS

\`TODOS OS SKIPS VALE\`
\`PLATAFORMA DE OBS E TODOS OS CONTAINERS VALE\`
\`VÁLIDO SUBIR NOS CAMINHÕES\`
\`SE AMBOS TIMES CONCORDAREM SOBRE USO DE AC80/GRANADA, ESSAS ARMAS SERAM PERMITIDAS!\``;

        const occassions = {
            winner: new EmbedBuilder()
                .setColor(myColours.rich_black)
                .setDescription(`# Adicionar o vencedor da aposta!\n-# Caso o vencedor foi mal selecionado, por favor chame um dos nossos ADMs!`)
                .setFooter({ text: "Nota: Clicar no ganhador errado de propósito resultara em castigo de 2 semanas!" }),
            rules: new EmbedBuilder()
                .setColor(Colors.White)
                .setDescription(rules),
            tatico: new EmbedBuilder()
                .setColor(Colors.White)
                .setDescription(taticosRule),
            play: new EmbedBuilder()
                .setDescription(`# Como jogar?\n-# Você não tem que se inscrever em nada!\n-# Você simplesmente precisa entrar e jogar, por exemplo em: <#1338286584126247013>\n\nNota: Leia as <#1338244626984992788> antes de jogar!`)
                .setColor(Colors.White),
            rules_1v1: new EmbedBuilder()
        };

        const tipo = interaction.options.getString("tipo");

        if (occassions[tipo]) {
            return interaction.reply({ embeds: [occassions[tipo]] });
        }

        return interaction.reply({ content: "Comando inválido. Tente novamente.", flags: 64 });
    }
};

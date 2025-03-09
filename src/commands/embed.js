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
                    { name: "ss emu", value: "ssEmu" },
                )
        )
        .addChannelOption(o =>
            o.setName("canal")
                .setDescription("Canal para enviar a embed.")
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
\`QUEM NÃO TEM PERSONAGENS JOGA SEM\`
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
        const emuSSrules = `# REGRAS SS EMULADOR
> Emulador é Proibido **Relogar**
> Suspeita de emulador a mais é **permitido pedir tela para ver se tem a quantidade de emu** corresponde a que está na fila.
> Caso esteja com suspeita de **hack**, específicar na aposta qual é o jogador a ser telado!
> Apenas **dois** podem estar desativados (dependendo das provas encontradas em ScreenShare, será passível de W.O

Negar acesso via **AnyDesk** ou **TeamViewer W.O**

Proibido remoção de **pendrive** do computador pós partida

Proibido **clumsy**, **cheat engine**, ou quaisquer app de **injeção de hacks**, mesmo com **intuito de FPS** e etc

**Windows stoppado** ou falta de serviços podem resultar em W.O

Qualquer **rastro** ou tentativa de **bypass** (injeção ou quaisquer modificações de dll durante/após partida.) W.O

O uso de **Clear String** é estritamente proibido (ou qualquer ferramenta/utilitário que limpe evidências)

Os seguintes serviços/processos são obrigatórios: **PcaSvc, Dps, DiagTrack, SysMain e Sysmon**

Obrigatório ter **csrss**

**Sysmon modificado W.O**

**Se tivermos provas concretas, o jogador sera banido do servidor por tempo indefinido**`
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
            ssEmu: new EmbedBuilder(Colors.Aqua)
                .setDescription(emuSSrules)
        };

        const tipo = interaction.options.getString("tipo");
        const channel = interaction.options.getChannel("canal") ?? interaction.channel;

        if (occassions[tipo]) {
            return channel.send({ embeds: [occassions[tipo]] });
        }

        return interaction.reply({ content: `# Embed \`${tipo}\` nao existe. Tente: \`${Object.keys(occassions).join(", ")}\``, flags: 64 });
    }
};

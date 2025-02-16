const { EmbedBuilder, Message, PermissionFlagsBits, Colors, ActionRowBuilder } = require("discord.js");
const BotClient = require("..");
const myColours = require("../structures/colours");

module.exports = {
    name: "embed", // Command name
    usage: "`!embed`",
    description: "Este comando retorna uma embed com as regras do server!",
    /**
     * @param {Message} message 
     * @param {string[]} args 
     * @param {BotClient} client 
     */
    execute(message, args, client) {
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
> TELHADINHOS E SKIPS E CAMINHÕES VALEM
> TORRE DE CLOCK TOWER
> PEDIR ROUND DESNECESSARIO É PUNICAO DE 3 DIAS
> NO MÁXIMO 10MIN PARA ENTRAR NA SALA.
## REGRAS PARA EMULADORES
> APOSTA + 50€ OBRIGATÓRIO JOGAR A TRANSMITIR TELA
> TRANSMISSÃO: OBRIGATÓRIO ABRIR O JOGO DEPOIS DE TRANSMITIR, CASO JOGO ESTIVER FECHADO OU VOCE RELOGOU RESULTARA EM W.O DIRETO
> MENTIR NICK: RESULTARA EM PUNICAO DE 20 DIAS
> REVANCHE: PODE TROCAR JOGADOR, NÃO PRECISA SER O MESMO TIME, A NÃO SER QUE O ADVERSÁRIO SOLICITE "REVANCHE MESMO TIME"
> PEDIDO DE TELA PÓS REVANCHE: NÃO PODE PEDIR TELA DEPOIS DO ADVERSÁRIO RECUSAR REVANCHE
# ATENÇÃO
\`PERSONAGENS QUE NÃO ESTÃO ACIMA NÃO VALEM\`
\`﻿PERSONAGENS ERRADOS REFAZER ATÉ O 3a0 OU 3A3\`
\`REPLAY OBRIGATÓRIO\`
\`NÍVEL MÍNIMO 15\`
﻿﻿﻿\`ARMAS QUE NÃO ESTÃO ACIMA NÃO VALEM\`
\`﻿PET ERRADO REFAZER ATÉ O 3a0 OU 3A3\`
`;

        const embed = new EmbedBuilder()
            .setColor(Colors.DarkButNotBlack)
            .setDescription(rules);
        const setWinnerEmbed = new EmbedBuilder()
            .setColor(myColours.rich_black)
            .setDescription(`# Adicionar o vencedor da aposta!\n-# Caso o vencedor foi mal selecionado, por favor chame um dos nossos ADMs!`)
            .setFooter({ text: "Nota: Clicar no ganhador errado de propósito resultara em castigo de 2 semanas!" });
        message.channel.send({ embeds: [setWinnerEmbed] });

    },
    sendTemporaryMessage(msg, content) {
        msg.reply(content).then(mg => {
            setTimeout(() => {
                mg.delete();
            }, 2000);
        });
    }
};

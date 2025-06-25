import { Colors, EmbedBuilder } from "discord.js";

export default {
    bet_full: new EmbedBuilder()
        .setTitle("Partida cheia")
        .setColor(Colors.Red)
        .setDescription(`Essa aposta chegou aos jogadores máximos!\n-# <:seta:1373287605852176424> Abra um ticket para solicitar ajuda.`)
        .setTimestamp(),
    bet_already_in: new EmbedBuilder()
        .setTitle("Aposta")
        .setColor(Colors.Red)
        .setDescription(`Já estás nesta aposta.\n-# <:seta:1373287605852176424> Abra um ticket para solicitar ajuda.`)
        .setTimestamp(),
    bet_off: new EmbedBuilder()
        .setTitle("Aposta Offline")
        .setColor(Colors.Red)
        .setDescription(`Esta aposta foi apagada ou está offline.\n-# <:seta:1373287605852176424> Abra um ticket para solicitar ajuda.`)
        .setTimestamp(),
    bets_off: new EmbedBuilder()
        .setTitle("Apostas Offline")
        .setColor(Colors.Red)
        .setDescription(`As apostas neste servidor estam offline.\n-# <:seta:1373287605852176424> Abra um ticket para solicitar ajuda.`)
        .setTimestamp(),
    bet_already_playing: new EmbedBuilder()
        .setTitle("Já estas a jogar")
        .setColor(Colors.Red)
        .setDescription(`O sistema detetou que estás a jogar outra aposta no momento.\n-# <:seta:1373287605852176424> Abra um ticket para solicitar ajuda.`)
        .setTimestamp(),
    bet_not_in: new EmbedBuilder()
        .setTitle("Não estás nesta aposta")
        .setColor(Colors.Red)
        .setDescription(`O sistema detetou que não estas nesta aposta.\n-# <:seta:1373287605852176424> Abra um ticket para solicitar ajuda.`)
        .setTimestamp(),
        can_not_interact: new EmbedBuilder()
        .setTitle("Não podes interagir")
        .setColor(Colors.Red)
        .setDescription(`Este comando foi solicitado por outro jogador!\n-# <:seta:1373287605852176424> Se isso foi um erro, abre um ticket para pedir ajuda!`)
        .setTimestamp(),
    blacklisted: new EmbedBuilder()
        .setTitle("Blacklist")
        .setColor(Colors.Red)
        .setDescription(`O sistema detetou que estas na blacklist! Use o canal da blacklist para saber quem o adicionou.`)
        .setTimestamp(),
    error_occured: new EmbedBuilder()
        .setColor(Colors.Red)
        .setTitle(`${process.env.NO_EMOJI} Ocorreu um erro ${process.env.NO_EMOJI}`)
        .setDescription(
            [
                `Ocorreu um erro quando você usou este comando!`,
                `-# <:seta:1373287605852176424> Tente novamente mais tarde.`
            ].join("\n")
        )
        .setTimestamp(),

    no_registered_players: new EmbedBuilder()
    .setTitle("Sem usuarios registrados!")
    .setTimestamp()
    .setDescription("Nenhum usuário deste servidor está registado!\n> -# Use o comando `perfil` para se resgistrar.")
    .setFooter({
        text: "Chame um ADM para o ajudar!"
    })
    .setColor(Colors.LightGrey)
}
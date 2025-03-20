const fs = require("fs");
const path = require("path");
const { Client, Collection, ChannelType, PermissionsBitField, ActivityType, ActivityFlags, EmbedBuilder, Colors } = require("discord.js");
const BotClient = require("..");
const chalk = require('chalk');

module.exports = class ReadyEvent {
  /**
   * @param {BotClient} client
   */
  constructor(client) {
    this.name = "ready";
    this.client = client;
    this.once = true; // Run only once
  }
  /**
   * 
   * @param {ReadyEvent} event 
   * @param {BotClient} client 
   */
  execute(event, client) {
    client.user.setActivity({
      name: "apostando mais de 100€ em live",
      type: ActivityType.Custom,
    });


    this.scheduleDailyMessage();

    console.log(chalk.bgBlue(`O bot está on! Com o nome ${this.client.user.username} e com ${this.client.guilds.cache.size} guildas`));
    this.client.guilds.cache.forEach(g => console.log(chalk.bgBlack(`Nome da guilda: ${g.name}. Membros ${g.members.cache.size}`)));
  }
  scheduleDailyMessage = async () => {
    const now = new Date();
    const targetHour = 16; // Altere para o horário desejado (24h)
    const targetMinute = 25;
    const targetSecond = 0;

    let nextExecution = new Date();
    nextExecution.setHours(targetHour, targetMinute, targetSecond, 0);

    // Se o horário já passou hoje, agendar para amanhã
    if (now > nextExecution) {
      nextExecution.setDate(nextExecution.getDate() + 1);
    }

    const timeUntilNextExecution = nextExecution - now; // Tempo restante em ms
    console.log(`Próxima mensagem será enviada em: ${nextExecution.toLocaleString()}`);

    setTimeout(async () => {
      const channel = this.client.channels.cache.get("1338659016292827186");
      if (!channel) return console.log("Canal não encontrado.");

      try {
        // Buscar as últimas mensagens do canal
        const messages = await channel.messages.fetch({ limit: 20 });

        // Filtrar mensagens enviadas pelo bot
        const botMessages = messages.filter(m => m.author.id === "1323068234320183407");

        // Deletar todas as mensagens filtradas
        for (const message of botMessages.values()) {
          await message.delete();
        }

        // Criar e enviar o embed
        const embed = new EmbedBuilder()
          .setTitle("APOSTAS ON")
          .setDescription(`As apostas estão abertas, certifique-se de seguir as regras`)
          .setColor(0xff0000);

        await channel.send({ embeds: [embed] });

        // Agendar a próxima execução
        this.scheduleDailyMessage();
      } catch (error) {
        console.error("Erro ao buscar ou deletar mensagens:", error);
      }
    }, timeUntilNextExecution);
  };
};

const { EmbedBuilder } = require("discord.js");

console.log(new EmbedBuilder()
  .setDescription(
    `**Bem-vindo(a) **`
  )
  .addFields([
    {
      name: `Não sabes como as coisas funcionam?:`,
      value: `Antes de tudo lê as [regras](https://discord.com/channels/1336809872884371587/1338244626984992788)!`,
      inline: true,
    },
    {
      name: `Não sabes como jogar?`,
      value: `Para jogar basta adquirires o cargo \<@&1350144276834680912> e criares filas!`,
      inline: true,
    },
    {
      name: `Tens alguma duvida?`,
      value: `Não hesite em abrir um [ticket](https://discord.com/channels/1336809872884371587/1359973537883885598)!`,
      inline: true,
    },
  ])
  .setThumbnail()
  .setTimestamp().toJSON());


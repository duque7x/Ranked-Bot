function scheduleDailyMessage(client, channelId, lastMessageId, messageContent) {
  const sendAtHour = 13;
  const sendAtMin = 10;

  function calculateDelay() {
    const now = new Date();
    const sendAt = new Date();

    sendAt.setHours(sendAtHour, sendAtMin, 0, 0);
    if (sendAt <= now) sendAt.setDate(sendAt.getDate() + 1);

    return sendAt.getTime() - now.getTime();
  }

  async function sendAndReschedule() {
    console.log(`Enviando a mensagem agora: ${new Date().toLocaleString()}`);

    const channel = await client.channels.fetch(channelId).catch(() => null);
    if (!channel) return console.warn("Canal não encontrado");

    try {
      if (lastMessageId) {
        const oldMsg = await channel.messages.fetch(lastMessageId);
        await oldMsg.edit(messageContent);
        console.log("Mensagem editada com sucesso.");
      } else {
        const newMsg = await channel.send(messageContent);
        console.log("Nova mensagem enviada.");
        lastMessageId = newMsg.id; // optional: update the ID if needed
      }
    } catch (err) {
      console.warn("Falha ao editar a mensagem:", err.message);
    }

    // Reschedule for the next day
    const nextDelay = calculateDelay();
    setTimeout(sendAndReschedule, nextDelay);
  }

  // Initial delay
  const initialDelay = calculateDelay();
  setTimeout(sendAndReschedule, initialDelay);
}

module.exports = scheduleDailyMessage;
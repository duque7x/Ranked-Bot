function scheduleDailyMessage(client, channelId, lastMessageId, messageContent) {
  const sendAtHour = 20;
  const sendAtMin = 30;
  const now = new Date();
  const sendAt = new Date();

  sendAt.setHours(sendAtHour, sendAtMin, 0, 0); // today at 18:00
  if (sendAt <= now) sendAt.setDate(sendAt.getDate() + 1); // move to next day if past 6PM

  const delay = sendAt.getTime() - now.getTime();

  setTimeout(
    async function sendAndReschedule() {
      const channel = await client.channels.fetch(channelId).catch(() => null);
      if (!channel) return;

      if (lastMessageId) {
        try {
          const oldMsg = await channel.messages.fetch(lastMessageId);
          await oldMsg.edit(messageContent);
        } catch (err) {
          console.warn("Failed to delete previous message:", err.message);
        }
      }
      setTimeout(sendAndReschedule, 24 * 60 * 60 * 1000);
    }, delay);
}

module.exports = scheduleDailyMessage;

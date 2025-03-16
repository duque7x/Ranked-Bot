const { sendReply } = require("../utils");

module.exports = (interaction, errorTypes) => {
    // Collect all error messages for each errorType
    const messages = errorTypes.map(type => this.errorMessages[type] || "Erro desconhecido. Tente novamente.");

    // Join all error messages with a line break
    const message = messages.join('\n\n');  // Adds a newline between multiple errors
    sendReply(interaction, message);
    // Send the error messages as a reply

    return this.messages;
}
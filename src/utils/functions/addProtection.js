const User = require("../../structures/database/User");

module.exports = async (userId, type, addedBy, longevity) => {
    const userProfile = await User.findOrCreate(userId);
    const protection = { type, addedBy, longevity, addedWhen: Date.now() };
    const existing = userProfile.protections.find((p) => p.type === protection.type);

    if (existing) {
        // Somar longevity existente com o novo tempo
        const [oldH, oldM] = existing.longevity.split(":").map(Number);
        const [addH, addM] = protection.longevity.split(":").map(Number);

        let totalM = oldM + addM;
        let totalH = oldH + addH + Math.floor(totalM / 60);
        totalM = totalM % 60;

        existing.longevity = `${String(totalH).padStart(2, "0")}:${String(
            totalM
        ).padStart(2, "0")}`;
        existing.when = new Date(); // atualiza também o when, se quiser
        existing.addedBy = protection.addedBy;
    } else {
        userProfile.protections.push({
            ...protection,
            when: new Date(),
        });
    }

    return await userProfile.save();
}
module.exports = type => {
    let final;

    if (type == "point_protect") final = "Proteção de Pontos";
    if (type == "immunity") final = "Imunidade";
    if (type == "double_points") final = "Dobro de Pontos";

    return final;
}
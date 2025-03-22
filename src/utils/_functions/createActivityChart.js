const QuickChart = require("quickchart-js");
const { AttachmentBuilder, EmbedBuilder } = require('discord.js');
const Bet = require("../../structures/database/match");


module.exports = async function createChart() {
    // Buscar todas as apostas e contar por data
    const bets = await Bet.find({});
    const dateCounts = bets.reduce((acc, bet) => {
        const date = bet.createdAt.toISOString().split('T')[0]; // YYYY-MM-DD
        acc[date] = (acc[date] || 0) + 1;
        return acc;
    }, {});

    const labels = Object.keys(dateCounts);
    const data = Object.values(dateCounts);

    const chart = new QuickChart();
    chart.setConfig({
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Apostas por Dia',
                data: data,
                borderColor: 'red',
                fill: false
            }],
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    labels: {
                        color: 'white', // Set legend text color to white
                    },
                },
            },
            scales: {
                x: {
                    ticks: {
                        color: 'white', // Set X-axis labels to white
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)', // Set X-axis grid lines to a light grey
                    },
                },
                y: {
                    ticks: {
                        color: 'white', // Set Y-axis labels to white
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)', // Set Y-axis grid lines to a light grey
                    },
                },
            },
            layout: {
                padding: 20,
            },
            elements: {
                point: {
                    backgroundColor: 'blue', // Customize point color
                },
            },
            // Set the chart background color
            backgroundColor: 'transparent', // Make the background transparent
            chartArea: {
                backgroundColor: '#333', // Set chart area background color to dark
            },
            borderColor: '#333', // Optional: Set border color to match the dark theme
        },
    });


    const imageUrl = await chart.getUrl();

    return imageUrl;
}

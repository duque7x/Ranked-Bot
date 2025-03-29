module.exports = (arr, value) => {
    return arr.filter(item => item.id !== value.id);
}
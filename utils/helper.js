module.exports = {
    CapitalizeFirstLetter : function (string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    },
    WeekNumber : function (date = new Date()){
        var firstJanuary = new Date(date.getFullYear(), 0, 1);
        var dayNr = Math.ceil((date - firstJanuary) / (24 * 60 * 60 * 1000));
        var weekNr = Math.floor((dayNr + firstJanuary.getDay()) / 7);
        return weekNr;
    }
}
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const tradeSchema = new Schema({
    symbol: String,
    _user: 
        {Type: ObjectID, 
        ref: 'user'},
    bought_or_sold: String,
    numShares: Number,
    trade_date: Date
});

var a_trade = mongoose.model('a_trade', tradeSchema);
module.exports = a_trade;
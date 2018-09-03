const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const TradeSchema = new Schema({
    symbol: String,
    user: 
        [{type: Schema.Types.ObjectId,
        ref: 'User'
    }],
    bought_or_sold: String,
    numShares: Number,
    trade_date: Date
});

var Trade = mongoose.model('Trade', TradeSchema);
module.exports = Trade;
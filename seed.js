var db = require('./models');

// var trade = new db.Trade({
//   symbol: 'aapl',
//   bought_or_sold: 'sold',
//   numShares: 10,
//   trade_date: '2018-1-1',
//   // user: {
//   //     type: 12345, 
//   //     ref: 'a@a.com'
//   // }
// });
// trade.save(function (err, savedTrade) {
//   if (err) {
//     console.log(err);
//   }
//   console.log('saved ' + savedTrade);
// });


db.User.create({email: 'a@a.com', password: 'a'}, function (err, savedUser) {
  if (err) {console.log(err);}
  console.log('saved ' + savedUser);
});
db.User.create({email: 'b@b.com', password: 'b'}, function (err, savedUser) {
  if (err) {console.log(err);}
  console.log('saved ' + savedUser);
});
db.User.create({email: 'c@c.com', password: 'c'}, function (err, savedUser) {
  if (err) {console.log(err);}
  console.log('saved ' + savedUser);
});

var httpsync = require('httpsync');

module.exports = {
  name: "net",
  url: "http://localhost:8080/",
  respond: function(turn) {
    var req = httpsync.request({
      url: this.url,
      method: "POST",
      useragent: "MauMau GameMaster v0.1",
    });
    req.write(JSON.stringify(turn));
    var res = req.end();
    if (res.statusCode != 200) throw "Server error at the client!";
    return JSON.parse(res.data);
  }
};
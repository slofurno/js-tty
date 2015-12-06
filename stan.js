var qs = require("querystring");
var http = require("http");

var regex = /<h3>Universal dependencies<\/h3>[\s\S]+?<div class="parserOutput">[\s\S]+?<pre class="spacingFree">([\s\S]+?)<\/pre>/;

var options = {
  "method": "POST",
  "hostname": "nlp.stanford.edu",
  "port": "8080",
  "path": "/parser/index.jsp",
  "headers": {
    "cache-control": "no-cache",
    "postman-token": "cde4fa0b-ab5e-9b2e-70e9-64cf0a02f498",
    "content-type": "application/x-www-form-urlencoded"
  }
};

var req = http.request(options, function (res) {
  var chunks = [];

  res.on("data", function (chunk) {
    chunks.push(chunk);
  });

  res.on("end", function () {
    var body = Buffer.concat(chunks);

    var result = regex.exec(body);
    var parse = result[1].split(/\r?\n/);
    console.log(parse);

    //console.log(body.toString());
  });
});

req.write(qs.stringify({ query: 'show me sethacked\'s posts',
  parserSelect: 'English',
  parse: 'Parse' }));
req.end();

var http = require('http');
var fs = require('fs');
var url = require('url');
var crypto = require('crypto');
var fork = require('child_process').spawn;
var exec = require('child_process').exec;
var pwd = process.cwd();
var WebSocketServer = require('ws').Server;
console.log(pwd, process);

var timeline = {"name":"sethacked","posts":["I think about this then say, Too sporty for a business suit. What are you fags talking about?","Price asks.","He hands me the drink then sits down, crossing his legs.","Okay, okay, okay, Van Patten says.","This is my question. A two-parter… He pauses dramatically.","Now are rounded collars too dressy or too casual? Part two, which tie knot looks best with them?","A distracted Price, his voice still tense, answers quickly with an exact, clear enunciation that can be heard over the din in Harry’s.","It’s a very versatile look and it can go with both suits and sport coats. It should be starched for dressy occasions and a collar pin should be worn if it’s particularly formal.","He pauses, sighs; it looks as if he’s spotted somebody.","I turn around to see who it is."]};

var hexLookup = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f'];

function sleep (ms)
{
  return new Promise(function(resolve, reject){
    setTimeout(function(){
      resolve("ok");
    },ms);
  });
}

sleep().then(function(res){
  console.log(res);
});
console.log("not gonna wait...");


function makeHex()
{
  var random = (Math.random() + "").substr(-10);

  var digits = [];

  for(var i = 0; i < 8; i++){
    var n = (random >> (i * 4)) & 0x0f;
    digits.push(hexLookup[n]);
  }

  return digits.join("");
}

function handleUser (req, res, ctx)
{
  var user = {
    id : makeHex()
  };

  var child = fork("sh");
  windows[user.id] = child;

  child.on('error', function (err) {
    console.log('Failed to start child process.');
  });

  res.setHeader("Content-Type", "text/json");
  res.write(JSON.stringify(user));
  res.end();
}

function handleTimeline (req, res, ctx)
{
  res.setHeader("Content-Type", "text/json");
  res.write(JSON.stringify(timeline));
  res.end();
}

function handleTty (req, res, ctx)
{
  var buf = "";

  res.writeHead(200);

  req.on("data", function(chunk){
    buf += chunk;
  });

  req.on("end", function(){
    var rc = JSON.parse(buf);
    var body = rc.body;
    var dir = rc.pwd;

    dir = dir.replace('.','');
    dir = dir.trim();

    if (dir.indexOf('/') === 0){
      res.writeHead(200);
      res.end();
      return;
    }

    var command = "cd home && ";

    if (dir.length > 1) {
      command += "cd " + dir + " && ";
    }

    command += body;
    console.log(command);

    var options = {
      timeout:2000,
      killSignal:'SIGKILL'
    };

    var child = exec(command, options, function (error, stdout, stderr) {
        if (error !== null) {
          res.write("error code: " + error.code);
          console.log('exec error: ' + error);
        }else{
          res.write(stdout);
          res.write(stderr);
        }
        res.end();
    });

/*
    var child = fork("sh");

    child.on('error', function (err) {
      console.log('Failed to start child process.');
    });

    child.stdout.on('data', function (data) {
      res.write(data);
      console.log(data);
    });

    child.on('close', function (err) {
      console.log("tty done");
      res.end();
    });

    child.stdin.write(command + "\n");
    child.stdin.end();
    */



  });


}

function readFile (uri)
{
  return new Promise(function(resolve, reject){
    fs.readFile("static" + uri, function (err, data) {
      if (err) {reject(err);}

        resolve(data);
    });
  });
}

function staticFileServer (req, res)
{
  readFile(req.url).then(function(file){
    res.writeHead(200);
    res.write(file);
    res.end();
  }).catch(function(err){
    res.writeHead(404);
    res.end();
  });

}

var routes = {
  "/api/timeline" : handleTimeline,
  //"/api/tty" : handleTty,
};

var server = http.createServer(function(req, res){
    var parsed = url.parse(req.url, true);
    console.log("serving", req.url);

    var h = routes[parsed.pathname];

    if (typeof(h) !== "undefined") {
      var ctx = Object.assign({}, url);
      h(req, res, ctx);
    }else{
      staticFileServer(req, res);
    }

});

var wss = new WebSocketServer({ server: server });

wss.on('connection', function connection(ws) {

  var child = fork("sh");

  child.stdin.write("source ./sigusr.sh\n");
  console.log("spawned process");

  child.on('error', function (err) {
    console.log(err);

  });

  child.stdout.on('data', function (data) {
    ws.send(data.toString('utf8'));
  });

  child.stderr.on('data', function (data) {
    ws.send(data.toString('utf8'));
  });

  child.on('close', function (code, signal) {
    console.log("tty closed", code, signal);
  });

  ws.on('close', function close() {
    child.stdin.end();
    console.log("child closed");
  });

  ws.on('message', function incoming(message) {
    if (message === "SIGINT"){
      console.log("SIGINT rec");
      child.kill('SIGUSR1');
    }else{
      child.stdin.write(message + "\n");
    }
  });

});

server.listen(616, function() {

});

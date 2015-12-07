var tty = document.getElementById("tty");
var consoleHistory = document.getElementById("history");
var directoryEl = document.getElementById("directory");
var historyElements = [];
var historyLog = [];
var historyOffset = 0;
var user = {};
var pwd = [];

/*
httpClient.request("GET", "/api/user").then(res => {
  user = JSON.parse(res);
});
*/

for(var i = 0; i < 24; i++){
  var el = document.createElement("div");
  el.className = "history-line";
  historyElements.push(el);
  consoleHistory.appendChild(el);
}

historyElements[0].textContent = "HEY";

function renderHistory (h)
{
  return function (a)
  {
    h(a);

    var logOffset = historyLog.length - historyOffset - 1;

    var i = historyElements.length - 1;
    var j = historyLog.length - 1 - historyOffset;

    for (; i >= 0; i--, j--){
      if (j >= 0) {
        historyElements[i].textContent = historyLog[j]
      }else{
        historyElements[i].textContent = " ";
      }
    }
  }
}

function historyBack ()
{
  if (historyOffset < historyLog.length - historyElements.length){
    historyOffset++;
  }
}

function historyForward ()
{
  if (historyOffset > 0){
    historyOffset--;
  }
}

function _appendHistory (lines)
{
  lines.split(/\r?\n/).map(line => line.trim())
    .filter(line => line.length >= 1)
    .forEach(line => historyLog.push(line));
}

var appendHistory = renderHistory(_appendHistory);

function enterCommand (e)
{
  var line = e.target.value;
  e.target.value = "";
  tty.value = "";

  appendHistory("> " + line);

  var args = line.split(" ");
  if (args[0] === "cd"){
    if (args[1] === ".."){
      pwd.pop();
    }else{
      pwd.push(args[1]);
    }
    directoryEl.innerHTML = pwd.join("/") + "> ";
    //return;
  }
  /*
  var dir = pwd.join("/");
  var req = {pwd:dir, body:line};

  httpClient.request("POST", "/api/tty", JSON.stringify(req))
    .then(res => appendHistory(res));
    */
  ws.send(line);
}

function upHistory ()
{
  console.log("up");

}

function downHistory () {
  console.log("down");

}

function sendCommand (command) {
  httpClient.request("POST", "/api/tty", command).then(res => appendHistory(res));
}

var keyEvents = {
  13 : enterCommand,
  38 : upHistory,
  40 : downHistory,
  33 : renderHistory(historyBack),
  34 : renderHistory(historyForward),
};

tty.onkeydown = function(e){
  var handler = keyEvents[e.keyCode];
  console.log(e.keyCode, e);

  if (typeof(handler) === "function") {
    e.preventDefault();
    handler(e);
    return;
  }
};


var ws = new WebSocket("ws://" + location.host + "/ws");

ws.onmessage = function(e){
  console.log(e.data);
  appendHistory(e.data);
};

httpClient.request("GET", "/api/timeline").then(function(rep){
  var timeline = JSON.parse(rep);
  console.log(timeline);
}).catch(function(err){
  console.log(err);
});

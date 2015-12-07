var httpClient = (function(){
"use strict";
  var request = function(method, uri, body){

    body = body || "";

    return new Promise(function(resolve,reject){
      var client = new XMLHttpRequest();

      client.onload=function(e){
        if (this.status==200){
          resolve(this.response);
        }else{
          reject(this.statusText);
        }
      };

      client.open(method,uri);
      client.send(body);
    });
  };

	return {request:request};
}());

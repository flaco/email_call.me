// Props given to ricky rosario, http://rickyrosario.com
// Much of this server code is borrowed heavily from 
// http://github.com/rlr/node_demos/tree/master/live_value/

// Nicholas Klick AKA Flaco
// http://github.com/flaco


HOST = null;
PORT = 8080;

TWID = "AC63d25ae03f37ee4fc405546e055f5f6d";
TWTOKEN = "3077be35e45bfd94a5e06a7d5fa91279";
TWAPIVERSION = "2008-08-01";
CALLURL = "/" + TWAPIVERSION + '/Accounts/' + TWID + '/Calls';

var sys = require('sys'), 
http = require('http'),
url = require("url"),
qs = require("querystring"),
base64 = require('./libserver/base64'),
noodle = require("./libserver/noodle");

noodle.listen(PORT, HOST);

// Home Page
noodle.get("/", noodle.staticHandler("index.html"));

// Call
noodle.get("/call", function(req, res){
  var query = qs.parse(url.parse(req.url).query);
  if (!query.number) {
    res.simpleText(200, "Must supply value parameter");
    return;
  }

  var auth = "Basic " + (base64.encode(TWID + ':' + TWTOKEN));
  var client = http.createClient(80, 'http://api.twilio.com');
  var request = client.request('POST', CALLURL, 
    {
      'Authorization' : auth,
      'Caller' : TWID,
      'Called' : query.number,
      "Url" : "/record?email=" + query.email
    }
  );
  
  sys.puts(sys.inspect(request));
  
  request.addListener('response', function(response){
    response.setEncoding("utf8");
    response.addListener("data", function(chunk){
      // store.appendChunk(chunk);
    });
    response.addListener("end", function(chunk){
        // setTimeout(startStreamingAPIClient,5000); // wait 5 secsand reopen
    });
    
    sys.puts(sys.inspect(response));
  });
  request.close();
});

//Recordt
noodle.get("/record", function(req, res){
  res.writeHead(200, {'Content-Type': 'text/xml'});
  var query = qs.parse(url.parse(req.url).query);

  var xml = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n";
  xml += "<Response>\n";
  xml += "<Say>Hello. This is a call from the Twilio voicemail transcription demo. Please leave a voicemail after the beep, and remember to speak clearly.</Say>";
  xml += "<Record transcribe='true' transcribeCallback='";
  xml += query.email
  xml += "' action='goodbye.html' maxLength='30' />";
  xml += "</Response>";

  res.end(xml);
});


sys.puts("Server running at http://127.0.0.1:" + PORT + "/");

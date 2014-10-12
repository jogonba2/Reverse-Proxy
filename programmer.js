var net  = require('net');
var proxy_ip        = process.argv[2]; 
var proxy_port      = process.argv[3]; // Puerto que va a levantarse
var operation       = process.argv[4];
var new_remote_ip   = process.argv[5];
var new_remote_port = process.argv[6];
var operation 
 
var client = net.connect({port:8000,host:proxy_ip},function(){
    console.log('programmer connected');
    client.write(JSON.stringify({"op":operation,"inPort":proxy_port,"remote":{"ip":new_remote_ip,"port":new_remote_port}}));
    
});

client.on('data',function(data){
	console.log(data.toString());
	process.exit();
});

client.on('end',function(){
	console.log("programmer disconnected");
	process.exit();
});

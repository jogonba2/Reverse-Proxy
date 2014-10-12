var net  = require('net');
var proxy_ip    = process.argv[2]; 
var remote_ip   = process.argv[3];
var remote_port = process.argv[4];
 
var client = net.connect({port:8001,host:proxy_ip},function(){
	console.log('programmer connected');
	client.write(JSON.stringify({"remote_ip":remote_ip,"remote_port":remote_port}));
});

client.on('data',function(data){
	console.log(data.toString());
	process.exit();
});

client.on('end',function(){
	console.log("programmer disconnected");
	process.exit();
});

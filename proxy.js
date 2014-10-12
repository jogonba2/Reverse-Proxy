var net = require('net');
// Configure port range //
var upper_port = 65535; var lower_port = 0;
var actual_configuration = {410:["www.dsic.upv.es",80,"proxy"],
			    			411:["www.upv.es",80,"proxy"],
			    			412:["www.google.es",80,"proxy"]};
var LOCAL_PORT_PPROXY = 8000;
var LOCAL_IP = '127.0.0.1';

function server_proxy(REMOTE_IP,REMOTE_PORT,LOCAL_PORT){
    var s_proxy = net.createServer(function (socket_proxy) {
            socket_proxy.on('data', function (msg) {
                var serviceSocket = new net.Socket();
                serviceSocket.connect(parseInt(REMOTE_PORT), REMOTE_IP, function ()  {
                     serviceSocket.write(msg);
                });
                serviceSocket.on('data', function (data) {
					socket_proxy.write(data);
                });
            });})
	actual_configuration[LOCAL_PORT][3] = s_proxy;
	actual_configuration[LOCAL_PORT][3].listen(LOCAL_PORT,LOCAL_IP);  
    console.log("TCP server accepting connection on proxy port: " + LOCAL_PORT + " --> " + REMOTE_IP +":"+ REMOTE_PORT);
}

function initialize(){
	var ip = 0; var rport = 0;
	for(var port in actual_configuration){
		ip = actual_configuration[port][0]; rport = actual_configuration[port][1];
		server_proxy(ip,rport,port);
    }
}
     
function main(){
    // Set programmer port //
    var server_pproxy = net.createServer(function (socket_pproxy) {
        socket_pproxy.on('data', function (msg) {
            var new_data = JSON.parse(msg);
			var in_port  = new_data["inPort"]
	    	var new_ip   = new_data["remote"]["ip"]
	   		var new_port = new_data["remote"]["port"]
            if(in_port >= lower_port && in_port <= upper_port){
            	if(new_data["op"] === "set"){
					if(actual_configuration.hasOwnProperty(in_port.toString())){
            			actual_configuration[in_port][0] = new_ip;
	    				actual_configuration[in_port][1] = new_port;
						actual_configuration[in_port][3].close();
					    server_proxy(new_ip,new_port,in_port);
						socket_pproxy.write("Correctly setted, listening " + in_port + " --> " + new_ip + ":" + new_port + " .\n");
					}else socket_pproxy.write("Port can not be setted due to it doesn't exists. \n");
				}  
           		else if(new_data["op"] === "add"){
					if(!actual_configuration.hasOwnProperty(in_port.toString())){
						actual_configuration[in_port] = [new_ip,new_port]
				        server_proxy(new_ip,new_port,in_port);
						socket_pproxy.write("Correctly added, listening " + in_port + " --> " + new_ip + ":" + new_port + " .\n");
            		}else socket_pproxy.write("Port can not be added due to it exists. \n");
				}
				else socket_pproxy.write("Not valid operation. (Only set and add) \n");
			}
			else socket_pproxy.write("Not valid port.("+lower_port+"<= in_port <= " + upper_port + "\n");
			socket_pproxy.end();
    	});   
	}).listen(LOCAL_PORT_PPROXY, LOCAL_IP); // port,ip //
	console.log("TCP server accepting connections on programmer port: " + LOCAL_PORT_PPROXY);
    // Initialize init proxies //
	initialize();
}

main();


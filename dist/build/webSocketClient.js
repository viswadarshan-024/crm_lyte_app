var socket;
function start() {	
	socket = new WebSocket('ws://localhost:52089');
	socket.onopen = function() {
		console.log("Connection is established");
		socket.send("connected");
	}
	socket.onmessage = function(message) {
		if(message.data != 'reload'){
			message = JSON.parse(message.data);
			if(message.errorFlag == true) {	
				if(document.body) {
					document.body.innerHTML = message.errorObj;
				} else {			
					document.addEventListener('DOMContentLoaded',function(event) {	   						
						document.body.innerHTML =  message.errorObj;			
					});	
				}
				//window.location.reload();
			} else{
				window.location.reload();
			}
		}else {
				window.location.reload();
		}
	}

	socket.onclose = function() {
		console.log("connection get closed");
		// setTimeout(function() {
		// 	start();
		// },5000)		
	}

	socket.onerror = function(error) {
		console.log("error "+error);
	}
}

start();

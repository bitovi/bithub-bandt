/* globals io:true */

import $ from 'jquery';

var currentSocket;

$(window).on('beforeunload', function(){
	if(currentSocket && currentSocket.close){
		currentSocket.close();
	}
});

var url = '/?embed_id={embedId}';
var publicUrl = '/?embed_id={embedId}&tenant_name={tenantName}';

export default function(hubId, tenantName){

	if(currentSocket && currentSocket.close){
		currentSocket.close();
	}

	if(typeof io !== 'undefined'){
		currentSocket = io('http://bithub.com/' + can.sub((tenantName ? publicUrl : url), {
			embedId : hubId,
			tenantName : tenantName
		}), { multiplex: false,
				forceNew: true});

		console.log(currentSocket)
		currentSocket.on('connect', function() {
			console.log('CONNECTED!', currentSocket.id);
		});

		currentSocket.on('connect_error', function( err ) {
			console.log('CONNECTION ERROR!', err.description, err.message, err.type);
		});

		currentSocket.on('disconnect', function( msg ) {
			console.log('DISCONNECTION!', msg);
		});

		return currentSocket;
	}
}

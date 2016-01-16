var link = document.getElementById('donejs-social');

var wrapper = document.createElement('div');
wrapper.className = 'donejs-bithub-wrapper';
wrapper.style.maxWidth = '100%';
wrapper.style.marginLeft = 'auto';
wrapper.style.marginRight = 'auto';
wrapper.style.paddingLeft = '15px';
wrapper.style.paddingRight = '15px';

var iframe = document.createElement('iframe');

iframe.style.height = '100px';
iframe.style.width = '1px';
iframe.style.minWidth = '100%';
iframe.style.marginLeft = 'auto';
iframe.style.marginRight = 'auto';
iframe.style.marginTop = '0px';
iframe.style.marginBottom = '0px';
iframe.style.border = 'none';
iframe.style.display = 'block';
iframe.src = "http://wowbao.bithub.com/carousel/embed.html";
iframe.scrolling = 'no';

iframe.src = "http://localhost:8888/donejs-bithub/index.html";

wrapper.appendChild(iframe);

link.parentNode.insertBefore(wrapper, link);
link.parentNode.removeChild(link);

window.addEventListener('message', function(ev){
	var msg = ev.data;
	var arr;
	if(msg && msg.split){
		arr = msg.split(':');
		if(arr[0] === 'cardExpanded'){
			iframe.style.height = (parseInt(arr[1], 10) + 15) + 'px';
		}
	}
}, false);

function $(el, s){
	return (s ? document.querySelectorAll(el) : document.querySelector(el));
}
function $extendObj(_def, addons) {
  if (typeof addons !== "undefined") {
    for (var prop in _def) {
      if (addons[prop] != undefined) {
        _def[prop] = addons[prop];
      }
    }
  }
}
function isDef(obj){
	return (obj !== undefined && obj !== null);
}
function isUndef(obj){
	return (obj == undefined && obj == null);
}
function str(obj){
	return ('' + obj + '');
}
function int(obj){
	return parseInt(obj);
}
function attr(...args){
	return (isDef(args[2]) ? args[0].setAttribute(args[1],args[2]) : args[0].getAttribute(args[1]));
}
function getRmvAttr(...args){
	var el = args[0];
	var attr = el.getAttribute(args[1]);
	el.removeAttribute(args[1]);
	return attr;
}
function getTxt(so, str){
	if(str.indexOf('{{') > -1){
		var wd = str.slice(str.indexOf('{{')+2,str.indexOf('}}'));
		so.push(`{{${wd}}}`);
		str = str.replace(`{{${wd}}}`, '');
		return getTxt(so,str);
	}else{
		return so;
	}
}
function setup(settings){
	var build = {
		meta: {
			viewport: 'width=device-width,initial-scale=1',
			content: '',
			title: '',
			description: '',
		},
		title: '',
		
	}
	
	$extendObj(build,settings);
	
	var txt = $('head').innerHTML;
	
	for(var m in build.meta){
		txt += `<meta name='${m}' content='${build.meta[m]}'>`;
	}
	for(var tag in build){
		if(tag !== 'meta'){txt += `<${tag}>${build[tag]}` + "</" + `${tag}>`;}
	}
	document.head.innerHTML = txt;
}

var mrin = function(){
	var build = function(settings){
		this.def = {
			el: '',
			data: {
			},
		};
		
		$extendObj(this.def, settings);
		
		this.diff = getTxt(new Array(), $(this.def.el).innerHTML);
		this.diffC = getTxt(new Array(), $(this.def.el).innerHTML);
		
		this.init();
	}
	
	build.prototype.init = function(){
		this.renderTemp();
		if(this.checkAttr('m-for')){
			this.forLoop();
		}
		if(this.checkAttr('m-if')){this.if();}
		this.javascript();
	}
	
	build.prototype.checkAttr = function(attr){
		return isDef($(this.def.el).getAttribute(attr));
	}
	
	build.prototype.renderTemp = function(){
		const _ = this;
		const app = $(_.def.el);
		
		var ntxt = app.innerHTML;
		
		for(var i = 0;i < this.diff.length;i++){
			var without = this.diffC[i].replace('{{','').replace('}}','').replace(/ /g, '');
			if(this.def.data[without]){
				ntxt = ntxt.replace(this.diff[i], this.def.data[without]);
			}
		}

		app.innerHTML = ntxt;
		
	}
	
	build.prototype.forLoop = function(){
		const _ = this;
		const app = $(_.def.el);
		var ntxt = app.innerHTML;
		const arr = getRmvAttr(app, 'm-for').split(' ');
		const loopObj = arr[3];
		var copy = ntxt;
		var newTxt = '';
		
		for(var i = 0;i < _.def.data[loopObj].length;i++){
			for(var data in _.def.data[loopObj][i]){
				for(var t = 0;t < this.diff.length;t++){
					ntxt = ntxt.replace(`{{${arr[1]}.${data}}}`, _.def.data.fire[i][data]);
				}
			}
			newTxt += ntxt;
			ntxt = copy;
		}
		app.innerHTML = newTxt;
		
	}
	
	build.prototype.replaceD = function(arr){
		for(var i = 0;i < arr.length;i++){
			arr[i] = arr[i].replace('{{', '').replace('}}','');
		}
		
		return arr;
	}
	
	build.prototype.javascript = function(){
		const _ = this;
		const app = $(_.def.el);
		const txt = this.replaceD(this.diffC);
		
		var add = document.createElement('script');
		
		if(str(txt[0]).trim() == `'jsOn'`){
			var ntxt = '';
			for(var i = 1;i < txt.indexOf(`'jsOff'`);i++){
				ntxt += txt[i];
				app.innerHTML = app.innerHTML.replace(`{{${txt[i]}}}`, '');
			}
			app.innerHTML = app.innerHTML.replace("{{'jsOn'}}", '');
			app.innerHTML = app.innerHTML.replace("{{'jsOff'}}", '');
			add.innerHTML = ntxt;
			app.appendChild(add);
		}else{
			
		}
	}

	build.prototype.if = function(){
		const _ = this;
		const app = $(_.def.el);
		const attr = getRmvAttr(app, 'm-if');
		var txt = '';
		
		_.def.data[attr] ? txt = '' : txt = 'none';
		
		app.style.display = txt;
	}
	
	build.prototype.createEl = function(dom, st){
		if($(dom, true)){
		$(dom, true).forEach((d) => {
			const text = d.innerHTML;
			const newStr = st.replace('props', text);
			d.innerHTML = newStr;
		});
		}
	}
	
	return build;
}();
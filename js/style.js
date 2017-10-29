/*公用浅复制*/
function extend(opt1,opt2){
	for( var attr in opt2 ){
		opt1[attr] = opt2[attr];
	}
}

var on = function (dom,type,fn){

	if( document.addEventListener ){
		return function(dom,type,fn){
			dom.addEventListener(type,fn);
		}
	}else if(document.attachEvent) {
		return function(dom,type,fn){
			dom.attachEvent('on'+type,fn);
		}
	}else{
		return function(dom,type,fn){
			dom['on'+click] = fn;
		}
	}

}();


/*日历滑动*/
var Calendar = function(obj){
	/*time*/
	this.data = {},
	this.time=new Date(); //当前Date资讯
	this.ynow=this.time.getFullYear(); //年份
	this.mnow=this.time.getMonth(); //月份
	this.dnow=this.time.getDate(); //今日日期
	this.newNum = 1;
};

Calendar.prototype = {
	constructor:Calendar,
	move:function(obj){
		this.obj = obj;
		this.onOff = true;
		this.fill();

		var that = this,
			widthP = this.obj.offsetParent.offsetWidth,
			startP = 0,
			dis = 0,
			listL = 0,
			num = 0,
			time = null;

			this.widthC = this.obj.children[0].offsetWidth;
			this.len = this.obj.children.length;
			this.parentW = this.len * this.widthC;
			this.obj.style.width = this.parentW + 'px';

			on(this.obj,'touchstart',start);
			on(this.obj,'touchmove',move);
			on(this.obj,'touchend',end);

			function start(ev){
				clearInterval(that.obj.timer);
				var ev = ev || window.event;
				var e = ev.changedTouches[0];

				startP = e.pageX;
				listL = that.css(this,'left');
				num = Math.abs(Math.round(listL/widthP));

				if(that.onOff){
					that.onOff = false;
					that.mnow = that.mnow+1;
					if(that.mnow>=12){
						that.ynow++;
						that.mnow = 0;
					}
					that.fill(that.ynow,that.mnow,60);
				}

			}

			function move(ev){
				var ev = ev || window.event;
				var e = ev.changedTouches[0];
				dis = e.pageX - startP + listL;
				if( dis > 0 ){
					that.css(this,'left',dis/2);
				}else{
					that.css(this,'left',dis);
				}
			}

			function end(ev){
				num = Math.round(that.css(this,'left')/widthP);
				if( num >= 1 ){
					num = 0;
				}

				if(Math.abs(num) >= that.newNum ){
					that.newNum = Math.abs(num)+1;
					that.onOff = true;
				};
				that.startMove(that.obj,{'left':num*widthP},500,'easeOut');
			}

	},
	create:function(data){
		var template = document.getElementById('template'),
			tmpl = template.innerHTML,
			wrapper = document.querySelector('.swiper-wrapper'),
	        compiledTemplate = Template7.compile(tmpl),
	        tempHtml = '',
	        //把数据打包丢进模板
	        tempHtml =compiledTemplate(data);
	        //创建一个div
	        var div = document.createElement('div');
	        div.innerHTML = tempHtml;

	        // 防止元素太多 进行提速
      		var frag = document.createDocumentFragment();

	        while(div.firstChild){
	        	frag.appendChild(div.firstChild);
	        }

	        wrapper.append(frag);

        	// wrapper.insertAdjacentHTML('beforeend',tempHtml);

        	this.len = this.obj.children.length;
			this.parentW = this.len * this.widthC;
			this.obj.style.width = this.parentW + 'px';
	},
	/*time*/
	fill:function(year,mnow,dnow){
		this.ynow = year || this.ynow;
		this.mnow = mnow || this.mnow;
		this.dnow = dnow || this.dnow;
		this.firstday= new Date(this.ynow,this.mnow,1).getDay(); //当月第一天星期几
    	this.firstday = this.firstday == 0?this.firstday=7:this.firstday;
    	this.preFinallyDay = new Date(this.ynow,this.mnow,0).getDate();//上个月的最后一天是几号
    	this.nowFinallyDay = new Date(this.ynow,this.mnow+1,0).getDate();//本月份最后一天是几号
 		var beforeArr = [],
 			afterArr = []

    	for(var i=0;i<this.firstday;i++){//上个月的显示天数
        	beforeArr.push(this.preFinallyDay-(this.firstday-1)+i);
    	};

    	for(var j=1;j<=this.nowFinallyDay;j++){//本月的显示天数
    		if( j == this.dnow ){
    			afterArr.push({now:this.dnow});
    		}else{
    			afterArr.push(j);
    		}
    	}

    	for( var i=0;i<afterArr.length;i++ ){
    		if(  afterArr[i].now ){
    			var before = afterArr.splice(0,afterArr[i].now-1);
    		}
    	}
    	if(before){
	    	for( var i=0;i<before.length;i++ ){
	    		beforeArr.push(before[i]);
	    	}
    	}


    	this.data.year = this.ynow;
    	this.data.month = this.mnow+1 < 10?'0'+(this.mnow+1):''+(this.mnow+1);
    	this.data.before = beforeArr;
    	this.data.after = afterArr;
    	this.create(this.data);
	},
	/*setter and getter*/
	css:function(obj,attr,val){

		if( attr == 'scale' || attr =='scaleX'||
			attr == 'scaleZ'|| attr =='scaleY'||
			attr =='translateX'||attr == 'translateZ'||
			attr =='translateY'||attr == 'rotate' || 
			attr =='rotateX' ||attr == 'rotateZ'|| 
			attr =='rotateY' ||attr == 'skewX'  || 
			attr =='skewY'){

			return this.transformCss(obj,attr,val);
		}
		

		if( typeof val === 'undefined' ){
			var value = obj.currentStyle?obj.currentStyle[attr]:getComputedStyle(obj,false)[attr];
			if( attr === 'opacity' ){
				value = Math.round(value*100);
			}

			return parseInt(value);

		}else{

			if( attr === 'opacity' ){
				obj.style.opacity = val/100;
				obj.style.filter = 'alpha(opacity='+value+')'
			}else{
				obj.style[attr] = val +'px';
			}

		}
	},
	transformCss:function(obj,attr,val){
		if( !obj.transform ){
			obj.transform = {};
		}


		if( typeof val === 'undefined' ){
			if( typeof obj.transform[attr] === 'undefined' ){
				switch(attr){
					case 'scale':
					case 'scaleX':
					case 'scaleY':
					case 'scaleZ':
						obj.transform[attr] = 100;
						break;
					default:
						obj.transform[attr] = 0;
				}
			}
			return obj.transform[attr];
		}else{
			obj.transform[attr] = val;
			var transformVal = '';

			for( var s in obj.transform ){
				switch(s){
					case 'scale':
					case 'scaleX':
					case 'scaleZ':
					case 'scaleY':
						transformVal = ' '+s+'('+obj.transform[s]/100+')';
						break;
					case 'rotateX':
					case 'rotateY':
					case 'rotateZ':
					case 'rotate':
					case 'skewX':
					case 'skewY':
						transformVal = ' '+s+'('+(obj.transform[s])+'deg)';
						break;
					default:
						transformVal = ' '+s+'('+(obj.transform[s])+'px)';
				}
			}

			obj.style.WebkitTransform = obj.style.transform = transformVal;
		}
	},
	startMove:function(obj,json,times,fx,fn){
		var a = 0;
		var b = {};
		var c = {};
		var d = times/20;
		var that = this;

		for( var s in json ){
			b[s] = that.css(obj,s);
			c[s] = json[s] - b[s];
		}

		obj.timer = setInterval(function(){
			a++;
			if( a > d ){
				clearInterval(obj.timer);
				fn&&fn.call(obj)
			}else{
				for( var s in json ){
					var val = Number((Tween[fx](a,b[s],c[s],d)).toFixed(2));
					that.css(obj,s,val);
				}	
			}

		},20)
		
	}
}
var Tween = {
	linear: function (t, b, c, d){
		return c*t/d + b;
	},
	easeIn: function(t, b, c, d){
		return c*(t/=d)*t + b;
	},
	easeOut: function(t, b, c, d){
		return -c *(t/=d)*(t-2) + b;
	},
	easeBoth: function(t, b, c, d){
		if ((t/=d/2) < 1) {
			return c/2*t*t + b;
		}
		return -c/2 * ((--t)*(t-2) - 1) + b;
	},
	easeInStrong: function(t, b, c, d){
		return c*(t/=d)*t*t*t + b;
	},
	easeOutStrong: function(t, b, c, d){
		return -c * ((t=t/d-1)*t*t*t - 1) + b;
	},
	easeBothStrong: function(t, b, c, d){
		if ((t/=d/2) < 1) {
			return c/2*t*t*t*t + b;
		}
		return -c/2 * ((t-=2)*t*t*t - 2) + b;
	},
	elasticIn: function(t, b, c, d, a, p){
		if (t === 0) { 
			return b; 
		}
		if ( (t /= d) == 1 ) {
			return b+c; 
		}
		if (!p) {
			p=d*0.3; 
		}
		if (!a || a < Math.abs(c)) {
			a = c; 
			var s = p/4;
		} else {
			var s = p/(2*Math.PI) * Math.asin (c/a);
		}
		return -(a*Math.pow(2,10*(t-=1)) * Math.sin( (t*d-s)*(2*Math.PI)/p )) + b;
	},
	elasticOut: function(t, b, c, d, a, p){
		if (t === 0) {
			return b;
		}
		if ( (t /= d) == 1 ) {
			return b+c;
		}
		if (!p) {
			p=d*0.3;
		}
		if (!a || a < Math.abs(c)) {
			a = c;
			var s = p / 4;
		} else {
			var s = p/(2*Math.PI) * Math.asin (c/a);
		}
		return a*Math.pow(2,-10*t) * Math.sin( (t*d-s)*(2*Math.PI)/p ) + c + b;
	},    
	elasticBoth: function(t, b, c, d, a, p){
		if (t === 0) {
			return b;
		}
		if ( (t /= d/2) == 2 ) {
			return b+c;
		}
		if (!p) {
			p = d*(0.3*1.5);
		}
		if ( !a || a < Math.abs(c) ) {
			a = c; 
			var s = p/4;
		}
		else {
			var s = p/(2*Math.PI) * Math.asin (c/a);
		}
		if (t < 1) {
			return - 0.5*(a*Math.pow(2,10*(t-=1)) * 
					Math.sin( (t*d-s)*(2*Math.PI)/p )) + b;
		}
		return a*Math.pow(2,-10*(t-=1)) * 
				Math.sin( (t*d-s)*(2*Math.PI)/p )*0.5 + c + b;
	},
	backIn: function(t, b, c, d, s){
		if (typeof s == 'undefined') {
		   s = 1.70158;
		}
		return c*(t/=d)*t*((s+1)*t - s) + b;
	},
	backOut: function(t, b, c, d, s){
		if (typeof s == 'undefined') {
			s = 2.70158;  //回缩的距离
		}
		return c*((t=t/d-1)*t*((s+1)*t + s) + 1) + b;
	}, 
	backBoth: function(t, b, c, d, s){
		if (typeof s == 'undefined') {
			s = 1.70158; 
		}
		if ((t /= d/2 ) < 1) {
			return c/2*(t*t*(((s*=(1.525))+1)*t - s)) + b;
		}
		return c/2*((t-=2)*t*(((s*=(1.525))+1)*t + s) + 2) + b;
	},
	bounceIn: function(t, b, c, d){
		return c - Tween['bounceOut'](d-t, 0, c, d) + b;
	},       
	bounceOut: function(t, b, c, d){
		if ((t/=d) < (1/2.75)) {
			return c*(7.5625*t*t) + b;
		} else if (t < (2/2.75)) {
			return c*(7.5625*(t-=(1.5/2.75))*t + 0.75) + b;
		} else if (t < (2.5/2.75)) {
			return c*(7.5625*(t-=(2.25/2.75))*t + 0.9375) + b;
		}
		return c*(7.5625*(t-=(2.625/2.75))*t + 0.984375) + b;
	},      
	bounceBoth: function(t, b, c, d){
		if (t < d/2) {
			return Tween['bounceIn'](t*2, 0, c, d) * 0.5 + b;
		}
		return Tween['bounceOut'](t*2-d, 0, c, d) * 0.5 + c*0.5 + b;
	}
};


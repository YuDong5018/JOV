!function(t,o){"object"==typeof exports&&"undefined"!=typeof module?module.exports=o():"function"==typeof define&&define.amd?define(o):(t="undefined"!=typeof globalThis?globalThis:t||self).Supercluster=o()}(this,(function(){"use strict";function t(e,n,r,i,s,a){if(!(s-i<=r)){var p=i+s>>1;o(e,n,p,i,s,a%2),t(e,n,r,i,p-1,a+1),t(e,n,r,p+1,s,a+1)}}function o(t,n,r,i,s,a){for(;s>i;){if(s-i>600){var p=s-i+1,h=r-i+1,u=Math.log(p),f=.5*Math.exp(2*u/3),d=.5*Math.sqrt(u*f*(p-f)/p)*(h-p/2<0?-1:1);o(t,n,r,Math.max(i,Math.floor(r-h*f/p+d)),Math.min(s,Math.floor(r+(p-h)*f/p+d)),a)}var l=n[2*r+a],m=i,c=s;for(e(t,n,i,r),n[2*s+a]>l&&e(t,n,i,s);m<c;){for(e(t,n,m,c),m++,c--;n[2*m+a]<l;)m++;for(;n[2*c+a]>l;)c--}n[2*i+a]===l?e(t,n,i,c):e(t,n,++c,s),c<=r&&(i=c+1),r<=c&&(s=c-1)}}function e(t,o,e,r){n(t,e,r),n(o,2*e,2*r),n(o,2*e+1,2*r+1)}function n(t,o,e){var n=t[o];t[o]=t[e],t[e]=n}function r(t,o,e,n){var r=t-e,i=o-n;return r*r+i*i}var i=function(t){return t[0]},s=function(t){return t[1]},a=function(o,e,n,r,a){void 0===e&&(e=i),void 0===n&&(n=s),void 0===r&&(r=64),void 0===a&&(a=Float64Array),this.nodeSize=r,this.points=o;for(var p=o.length<65536?Uint16Array:Uint32Array,h=this.ids=new p(o.length),u=this.coords=new a(2*o.length),f=0;f<o.length;f++)h[f]=f,u[2*f]=e(o[f]),u[2*f+1]=n(o[f]);t(h,u,r,0,h.length-1,0)};a.prototype.range=function(t,o,e,n){return function(t,o,e,n,r,i,s){for(var a,p,h=[0,t.length-1,0],u=[];h.length;){var f=h.pop(),d=h.pop(),l=h.pop();if(d-l<=s)for(var m=l;m<=d;m++)a=o[2*m],p=o[2*m+1],a>=e&&a<=r&&p>=n&&p<=i&&u.push(t[m]);else{var c=Math.floor((l+d)/2);a=o[2*c],p=o[2*c+1],a>=e&&a<=r&&p>=n&&p<=i&&u.push(t[c]);var g=(f+1)%2;(0===f?e<=a:n<=p)&&(h.push(l),h.push(c-1),h.push(g)),(0===f?r>=a:i>=p)&&(h.push(c+1),h.push(d),h.push(g))}}return u}(this.ids,this.coords,t,o,e,n,this.nodeSize)},a.prototype.within=function(t,o,e){return function(t,o,e,n,i,s){for(var a=[0,t.length-1,0],p=[],h=i*i;a.length;){var u=a.pop(),f=a.pop(),d=a.pop();if(f-d<=s)for(var l=d;l<=f;l++)r(o[2*l],o[2*l+1],e,n)<=h&&p.push(t[l]);else{var m=Math.floor((d+f)/2),c=o[2*m],g=o[2*m+1];r(c,g,e,n)<=h&&p.push(t[m]);var v=(u+1)%2;(0===u?e-i<=c:n-i<=g)&&(a.push(d),a.push(m-1),a.push(v)),(0===u?e+i>=c:n+i>=g)&&(a.push(m+1),a.push(f),a.push(v))}}return p}(this.ids,this.coords,t,o,e,this.nodeSize)};var p,h={minZoom:0,maxZoom:16,minPoints:2,radius:40,extent:512,nodeSize:64,log:!1,generateId:!1,reduce:null,map:function(t){return t}},u=Math.fround||(p=new Float32Array(1),function(t){return p[0]=+t,p[0]}),f=function(t){this.options=y(Object.create(h),t),this.trees=new Array(this.options.maxZoom+1)};function d(t,o,e,n,r){return{x:u(t),y:u(o),zoom:1/0,id:e,parentId:-1,numPoints:n,properties:r}}function l(t,o){var e=t.geometry.coordinates,n=e[0],r=e[1];return{x:u(g(n)),y:u(v(r)),zoom:1/0,index:o,parentId:-1}}function m(t){return{type:"Feature",id:t.id,properties:c(t),geometry:{type:"Point",coordinates:[(n=t.x,360*(n-.5)),(o=t.y,e=(180-360*o)*Math.PI/180,360*Math.atan(Math.exp(e))/Math.PI-90)]}};var o,e,n}function c(t){var o=t.numPoints,e=o>=1e4?Math.round(o/1e3)+"k":o>=1e3?Math.round(o/100)/10+"k":o;return y(y({},t.properties),{cluster:!0,cluster_id:t.id,point_count:o,point_count_abbreviated:e})}function g(t){return t/360+.5}function v(t){var o=Math.sin(t*Math.PI/180),e=.5-.25*Math.log((1+o)/(1-o))/Math.PI;return e<0?0:e>1?1:e}function y(t,o){for(var e in o)t[e]=o[e];return t}function x(t){return t.x}function M(t){return t.y}return f.prototype.load=function(t){var o=this.options,e=o.log,n=o.minZoom,r=o.maxZoom,i=o.nodeSize;e&&console.time("total time");var s="prepare "+t.length+" points";e&&console.time(s),this.points=t;for(var p=[],h=0;h<t.length;h++)t[h].geometry&&p.push(l(t[h],h));this.trees[r+1]=new a(p,x,M,i,Float32Array),e&&console.timeEnd(s);for(var u=r;u>=n;u--){var f=+Date.now();p=this._cluster(p,u),this.trees[u]=new a(p,x,M,i,Float32Array),e&&console.log("z%d: %d clusters in %dms",u,p.length,+Date.now()-f)}return e&&console.timeEnd("total time"),this},f.prototype.getClusters=function(t,o){var e=((t[0]+180)%360+360)%360-180,n=Math.max(-90,Math.min(90,t[1])),r=180===t[2]?180:((t[2]+180)%360+360)%360-180,i=Math.max(-90,Math.min(90,t[3]));if(t[2]-t[0]>=360)e=-180,r=180;else if(e>r){var s=this.getClusters([e,n,180,i],o),a=this.getClusters([-180,n,r,i],o);return s.concat(a)}for(var p=this.trees[this._limitZoom(o)],h=[],u=0,f=p.range(g(e),v(i),g(r),v(n));u<f.length;u+=1){var d=f[u],l=p.points[d];h.push(l.numPoints?m(l):this.points[l.index])}return h},f.prototype.getChildren=function(t){var o=this._getOriginId(t),e=this._getOriginZoom(t),n="No cluster with the specified id.",r=this.trees[e];if(!r)throw new Error(n);var i=r.points[o];if(!i)throw new Error(n);for(var s=this.options.radius/(this.options.extent*Math.pow(2,e-1)),a=[],p=0,h=r.within(i.x,i.y,s);p<h.length;p+=1){var u=h[p],f=r.points[u];f.parentId===t&&a.push(f.numPoints?m(f):this.points[f.index])}if(0===a.length)throw new Error(n);return a},f.prototype.getLeaves=function(t,o,e){o=o||10,e=e||0;var n=[];return this._appendLeaves(n,t,o,e,0),n},f.prototype.getTile=function(t,o,e){var n=this.trees[this._limitZoom(t)],r=Math.pow(2,t),i=this.options,s=i.extent,a=i.radius/s,p=(e-a)/r,h=(e+1+a)/r,u={features:[]};return this._addTileFeatures(n.range((o-a)/r,p,(o+1+a)/r,h),n.points,o,e,r,u),0===o&&this._addTileFeatures(n.range(1-a/r,p,1,h),n.points,r,e,r,u),o===r-1&&this._addTileFeatures(n.range(0,p,a/r,h),n.points,-1,e,r,u),u.features.length?u:null},f.prototype.getClusterExpansionZoom=function(t){for(var o=this._getOriginZoom(t)-1;o<=this.options.maxZoom;){var e=this.getChildren(t);if(o++,1!==e.length)break;t=e[0].properties.cluster_id}return o},f.prototype._appendLeaves=function(t,o,e,n,r){for(var i=0,s=this.getChildren(o);i<s.length;i+=1){var a=s[i],p=a.properties;if(p&&p.cluster?r+p.point_count<=n?r+=p.point_count:r=this._appendLeaves(t,p.cluster_id,e,n,r):r<n?r++:t.push(a),t.length===e)break}return r},f.prototype._addTileFeatures=function(t,o,e,n,r,i){for(var s=0,a=t;s<a.length;s+=1){var p=o[a[s]],h=p.numPoints,u={type:1,geometry:[[Math.round(this.options.extent*(p.x*r-e)),Math.round(this.options.extent*(p.y*r-n))]],tags:h?c(p):this.points[p.index].properties},f=void 0;h?f=p.id:this.options.generateId?f=p.index:this.points[p.index].id&&(f=this.points[p.index].id),void 0!==f&&(u.id=f),i.features.push(u)}},f.prototype._limitZoom=function(t){return Math.max(this.options.minZoom,Math.min(+t,this.options.maxZoom+1))},f.prototype._cluster=function(t,o){for(var e=[],n=this.options,r=n.radius,i=n.extent,s=n.reduce,a=n.minPoints,p=r/(i*Math.pow(2,o)),h=0;h<t.length;h++){var u=t[h];if(!(u.zoom<=o)){u.zoom=o;for(var f=this.trees[o+1],l=f.within(u.x,u.y,p),m=u.numPoints||1,c=m,g=0,v=l;g<v.length;g+=1){var y=v[g],x=f.points[y];x.zoom>o&&(c+=x.numPoints||1)}if(c>=a){for(var M=u.x*m,_=u.y*m,w=s&&m>1?this._map(u,!0):null,P=(h<<5)+(o+1)+this.points.length,z=0,Z=l;z<Z.length;z+=1){var I=Z[z],F=f.points[I];if(!(F.zoom<=o)){F.zoom=o;var b=F.numPoints||1;M+=F.x*b,_+=F.y*b,F.parentId=P,s&&(w||(w=this._map(u,!0)),s(w,this._map(F)))}}u.parentId=P,e.push(d(M/c,_/c,P,c,w))}else if(e.push(u),c>1)for(var A=0,C=l;A<C.length;A+=1){var T=C[A],E=f.points[T];E.zoom<=o||(E.zoom=o,e.push(E))}}}return e},f.prototype._getOriginId=function(t){return t-this.points.length>>5},f.prototype._getOriginZoom=function(t){return(t-this.points.length)%32},f.prototype._map=function(t,o){if(t.numPoints)return o?y({},t.properties):t.properties;var e=this.points[t.index].properties,n=this.options.map(e);return o&&n===e?y({},n):n},f}));
(window.webpackJsonp=window.webpackJsonp||[]).push([[0],{11:function(e,t,n){e.exports=n(30)},16:function(e,t,n){},24:function(e,t,n){},26:function(e,t,n){},28:function(e,t,n){},30:function(e,t,n){"use strict";n.r(t);var r=n(0),a=n.n(r),c=n(9),i=n.n(c),o=(n(16),n(1)),u=n(4),s=n.n(u),l=n(5),d=function(){try{throw new Error("Uninitialized cache context")}catch(e){console.error(e)}},h=Object(r.createContext)({_cache:{},getCache:function(){return{size:0,get:d,set:d,remove:d,clear:d}}});function f(e){var t=e.children,n=Object(r.useContext)(h),c=Object(r.useState)(n),i=Object(o.a)(c,2),u=i[0],s=i[1];return a.a.createElement(h.Provider,{value:Object(l.a)({},u,{getCache:function(e){var t=function(){return u._cache[e]};return t()||(u._cache[e]=new Map),{size:t().size,get:function(e){return t().get(e)},set:function(e,n){t().set(e,n),s(u)},remove:function(e){t().delete(e),s(u)},clear:function(){t().clear(),s(u)}}}})},t)}var m=n(6),p=n.n(m);n(31);function v(){for(var e=arguments.length,t=new Array(e),n=0;n<e;n++)t[n]=arguments[n]}var g={children:p.a.func.isRequired,promise:p.a.func.isRequired,placeholder:p.a.element.isRequired},b={reducer:function(e,t){var n=t.type,r=t.payload;switch(n){case"fetch":return Object(l.a)({},e,{pending:!0});case"fulfilled":return Object(l.a)({},e,{data:r,error:void 0,pending:!1});case"rejected":return Object(l.a)({},e,{error:r,pending:!1});default:return e}},initialState:{pending:!1,data:void 0,error:void 0},actions:{fetch:function(){return{type:"fetch"}},fulfilled:function(e){return{type:"fulfilled",payload:e}},rejected:function(e){return{type:"rejected",payload:e}}}};function w(e){var t=e.children,n=e.promise,a=e.deps,c=e.placeholder,i=Object(r.useReducer)(b.reducer,b.initialState),u=Object(o.a)(i,2),s=u[0],l=s.pending,d=s.data,h=s.error,f=u[1];return Object(r.useEffect)(function(){null==a&&v("[Async] No deps array was given, so <Async> will only call async function when is mounted\n\tTo fix this, you should set the deps prop to the appropriate value"),f(b.actions.fetch()),n().then(function(e){return f(b.actions.fulfilled(e))}).catch(function(e){return f(b.actions.rejected(e))})},a||[]),l?c:d||h?t(d,h):null}w.propTypes=g;var j=n(2),y=n.n(j),k=n(3),O=n(10);function E(e){var t=(e||[]).map(function(e){return null==e?String(e).toString():"string"===typeof e?e:e instanceof Object&&"function"===typeof e.toString?e.toString():String(e).toString()}).join(",");return Object(O.sha256)(t)}function _(e){var t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:"__root",n=arguments.length>2&&void 0!==arguments[2]?arguments[2]:{},a=n.keyGenerator,c=void 0===a?E:a,i=n.key,o=n.limit,u=(0,Object(r.useContext)(h).getCache)(t);function s(){return l.apply(this,arguments)}function l(){return(l=Object(k.a)(y.a.mark(function t(){var n,r,a,s,l,d,h=arguments;return y.a.wrap(function(t){for(;;)switch(t.prev=t.next){case 0:for(n=h.length,r=new Array(n),a=0;a<n;a++)r[a]=h[a];if(s=i||c(r),void 0!==(l=u.get(s))){t.next=9;break}return t.next=6,e.apply(void 0,r);case 6:l=t.sent,d=void 0===o||u.size<o,null!=l&&d&&u.set(s,l);case 9:return t.abrupt("return",l);case 10:case"end":return t.stop()}},t,this)}))).apply(this,arguments)}return Object(r.useDebugValue)(u.size),s.clearCache=function(){u.clear()},s}function x(e){return N.apply(this,arguments)}function N(){return(N=Object(k.a)(y.a.mark(function e(t){var n;return y.a.wrap(function(e){for(;;)switch(e.prev=e.next){case 0:return e.next=2,fetch(t);case 2:if((n=e.sent).ok){e.next=5;break}throw n;case 5:return e.abrupt("return",n.json());case 6:case"end":return e.stop()}},e,this)}))).apply(this,arguments)}var S=function(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{},t=new URL("https://www.googleapis.com/customsearch/v1");return t.search=new URLSearchParams(Object(l.a)({key:"AIzaSyBTc4ymLstGMOQXihOPecItcg9Y4xQjCpY",cx:"007277771693008475535:3daq_gak8bm"},e)),t};function C(e){return M.apply(this,arguments)}function M(){return(M=Object(k.a)(y.a.mark(function e(t){return y.a.wrap(function(e){for(;;)switch(e.prev=e.next){case 0:return e.abrupt("return",x(S({q:t,searchType:"image"})));case 1:case"end":return e.stop()}},e,this)}))).apply(this,arguments)}n(24);var z=a.a.createElement("img",{src:"https://picsum.photos/300/200/?blur",alt:"placeholder",width:300,height:200});var D=function(e){return function(t,n){if(n)return 403===n.status?a.a.createElement("div",null,"Oops. It looks like we ran out of image lookups... Look again tomorrow!"):a.a.createElement("div",null,"I find the lack of images disturbing");var r=t.items.find(function(e){return function(e){var t=/\.(jpe?g|png|webp)$/.test(e.link),n=/^image\//.test(e.mime);return t&&n}(e)}),c=function(e){var t=e.width,n=e.height;if(t<=500&&n<=250)return{width:t,height:n};var r=t,a=n,c=t/n;return r>500&&(a=(r=500)/c),a>250&&(r=(a=250)*c),{width:Math.floor(r),height:Math.floor(a)}}(r.image);return a.a.createElement("div",{className:"card__image-wrapper",style:{maxHeight:"".concat(c.height,"px"),maxWidth:"".concat(c.width,"px")}},a.a.createElement("img",{src:r.link,alt:e.name,height:c.height,width:c.width}))}},P={eye_color:"Eye color",skin_color:"Skin color",hair_color:"Hair color",height:"Height",mass:"Mass"};function R(e){var t=e.data,n=e.darkMode;!function(e){var t=Object(r.useState)(document.title),n=Object(o.a)(t,2),a=n[0],c=n[1];if(Object(r.useDebugValue)(e),Object(r.useEffect)(function(){return c(document.title),document.title=e,function(){document.title=a}},[e]),!document)throw new Error("useDocumentTitle can't be used in contexts without document")}("".concat(t.name," - SWDB"));var c=_(C,"img");return a.a.createElement("div",{className:s()({card:!0,"card--dark-mode":n})},a.a.createElement("span",{className:"card__title"},t.name),Object.entries(P).map(function(e){var n=Object(o.a)(e,2),r=n[0],c=n[1];return a.a.createElement("div",{className:"card__data",key:r},a.a.createElement("div",null,c,":"),a.a.createElement("div",null,t[r]))}),a.a.createElement(w,{promise:function(){return c(t.name)},placeholder:z},D(t)))}function A(e){return q.apply(this,arguments)}function q(){return(q=Object(k.a)(y.a.mark(function e(t){return y.a.wrap(function(e){for(;;)switch(e.prev=e.next){case 0:return e.abrupt("return",x("https://swapi.co/api/people/".concat(t,"/")));case 1:case"end":return e.stop()}},e,this)}))).apply(this,arguments)}n(26);function B(e){var t=e.darkMode,n=void 0!==t&&t,c=function(e){var t=arguments.length>1&&void 0!==arguments[1]&&arguments[1],n=arguments.length>2&&void 0!==arguments[2]?arguments[2]:0,a=Object(r.useState)(n),c=Object(o.a)(a,2),i=c[0],u=c[1];function s(n){var r=n;return(n<0||n>=e.length)&&(r=t?n>=e.length?0:e.length-1:Math.min(Math.max(n,0),e.length-1)),u(r),r}return Object(r.useDebugValue)(i),function n(r){return{index:r,item:e[r],next:function(){return n(s(r+1))},previous:function(){return n(s(r-1))},hasNext:t||r<e.length-1,hasPrevious:t||0!==r}}(i)}(function(e,t){var n=e,r=t;return t||(n=0,r=e),Array.from({length:r}).map(function(e,t){return t+n})}(1,6),!0),i=c.item,u=c.next,l=c.hasNext,d=c.previous,h=c.hasPrevious,f=_(A,"swPerson");return a.a.createElement("div",{className:s()({"card-iterator":!0,"card-iterator--dark":n})},a.a.createElement("div",{className:"card-iterator__btn-wrapper"},a.a.createElement("button",{onClick:d,disabled:!h,className:s()({"card-iterator__btn":!0,"is-dark":!n})},"Previous")),a.a.createElement("div",{className:"card-iterator__item-wrapper"},a.a.createElement(w,{promise:function(){return f(i)},deps:[i],placeholder:a.a.createElement("div",{className:"card-iterator__item"},"Loading...")},function(e,t){return a.a.createElement("div",{className:"card-iterator__item"},t?a.a.createElement("div",{className:"card-iterator__item--error"},"Something went wrong :(",a.a.createElement("div",null,Object.entries(t).filter(function(e){var t=Object(o.a)(e,2),n=(t[0],t[1]);return["string","number","boolean"].includes(typeof n)}).map(function(e){var t=Object(o.a)(e,2),n=t[0],r=t[1];return a.a.createElement("div",null,a.a.createElement("strong",null,n),": ",r)}))):a.a.createElement(R,{data:e,darkMode:n}))})),a.a.createElement("div",{className:"card-iterator__btn-wrapper"},a.a.createElement("button",{onClick:u,disabled:!l,className:s()({"card-iterator__btn":!0,"is-dark":!n})},"Next")))}n(28);var I=function(){var e=function(){var e=arguments.length>0&&void 0!==arguments[0]&&arguments[0],t=Object(r.useState)(Boolean(e)),n=Object(o.a)(t,2),a=n[0],c=n[1];return Object(r.useDebugValue)(a),[a,function(){return c(!a)}]}(),t=Object(o.a)(e,2),n=t[0],c=t[1];return a.a.createElement("div",{className:"app-root"},a.a.createElement("button",{className:s()({"dark-mode-btn":!0,"is-dark":n}),type:"button",onClick:c},n?"Return of the Jedi":"Join the Dark Side"),a.a.createElement(f,null,a.a.createElement(B,{darkMode:n})))};Boolean("localhost"===window.location.hostname||"[::1]"===window.location.hostname||window.location.hostname.match(/^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/));i.a.render(a.a.createElement(I,null),document.getElementById("root")),"serviceWorker"in navigator&&navigator.serviceWorker.ready.then(function(e){e.unregister()})}},[[11,2,1]]]);
//# sourceMappingURL=main.14b7e9d8.chunk.js.map
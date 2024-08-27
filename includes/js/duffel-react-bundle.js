(()=>{"use strict";var e={n:t=>{var n=t&&t.__esModule?()=>t.default:()=>t;return e.d(n,{a:n}),n},d:(t,n)=>{for(var r in n)e.o(n,r)&&!e.o(t,r)&&Object.defineProperty(t,r,{enumerable:!0,get:n[r]})},o:(e,t)=>Object.prototype.hasOwnProperty.call(e,t)};const t=React;var n=e.n(t);const r=ReactDOM;function a(e,t){return function(e){if(Array.isArray(e))return e}(e)||function(e,t){var n=null==e?null:"undefined"!=typeof Symbol&&e[Symbol.iterator]||e["@@iterator"];if(null!=n){var r,a,o,l,i=[],c=!0,u=!1;try{if(o=(n=n.call(e)).next,0===t){if(Object(n)!==n)return;c=!1}else for(;!(c=(r=o.call(n)).done)&&(i.push(r.value),i.length!==t);c=!0);}catch(e){u=!0,a=e}finally{try{if(!c&&null!=n.return&&(l=n.return(),Object(l)!==l))return}finally{if(u)throw a}}return i}}(e,t)||function(e,t){if(e){if("string"==typeof e)return o(e,t);var n={}.toString.call(e).slice(8,-1);return"Object"===n&&e.constructor&&(n=e.constructor.name),"Map"===n||"Set"===n?Array.from(e):"Arguments"===n||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)?o(e,t):void 0}}(e,t)||function(){throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}()}function o(e,t){(null==t||t>e.length)&&(t=e.length);for(var n=0,r=Array(t);n<t;n++)r[n]=e[n];return r}const l=function(e){e.label;var r=e.placeholder,o=e.onSelect,l=e.fetchOptions,i=a((0,t.useState)(""),2),c=i[0],u=i[1],s=a((0,t.useState)([]),2),d=s[0],f=s[1],m=a((0,t.useState)(!1),2),p=m[0],y=m[1],v=a((0,t.useState)(!1),2),h=v[0],g=v[1],b=(0,t.useRef)(null);return(0,t.useEffect)((function(){if(console.log(l),c.length>=3&&!h)if(console.log("Buscando datos para:",c),l&&l.url){var e="".concat(l.url,"?").concat(l.queryParam,"=").concat(encodeURIComponent(c));fetch(e).then((function(e){return e.json()})).then((function(e){console.log("Datos recibidos:",e),f(e.data||[]),y(e.data.length>0)})).catch((function(e){return console.error("Error fetching locations:",e)}))}else console.error("La URL de fetchOptions no está definida.");else console.log("Consulta demasiado corta o vacía, o selección hecha. Ocultando dropdown."),f([]),y(!1)}),[c,l,h]),(0,t.useEffect)((function(){!p&&b.current?b.current.classList.add("hidden"):p&&b.current&&b.current.classList.remove("hidden")}),[p]),n().createElement("div",{style:{position:"relative"}},n().createElement("input",{type:"text",value:c,onChange:function(e){var t=e.target.value;u(t),g(!1);var n=d.some((function(e){return"".concat(e.city_name," (").concat(e.iata_code,") - ").concat(e.name)===t}));t.length<3||n?y(!1):y(d.length>0)},placeholder:r,style:{width:"100%",padding:"8px",boxSizing:"border-box"},onFocus:function(){c.length>=3&&d.length>0&&!h&&y(!0)}}),n().createElement("ul",{className:"autocomplete-list ".concat(p?"":"hidden"),ref:b},d.map((function(e){return n().createElement("li",{key:e.id,onClick:function(){return function(e){if(console.log("Elemento seleccionado:",e),e&&e.iata_code&&e.name){o(e);var t="".concat(e.city_name||""," (").concat(e.iata_code||"",") - ").concat(e.name||"");u(t.trim()),g(!0),f([]),y(!1),console.log("Formatted query:",t)}else console.error("Datos de ubicación inválidos:",e)}(e)},style:{padding:"8px",cursor:"pointer"}},e.city_name," (",e.iata_code,") - ",e.name)}))))};function i(e){return i="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e},i(e)}function c(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,r)}return n}function u(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?c(Object(n),!0).forEach((function(t){s(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):c(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function s(e,t,n){return(t=function(e){var t=function(e){if("object"!=i(e)||!e)return e;var t=e[Symbol.toPrimitive];if(void 0!==t){var n=t.call(e,"string");if("object"!=i(n))return n;throw new TypeError("@@toPrimitive must return a primitive value.")}return String(e)}(e);return"symbol"==i(t)?t:t+""}(t))in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function d(e,t){return function(e){if(Array.isArray(e))return e}(e)||function(e,t){var n=null==e?null:"undefined"!=typeof Symbol&&e[Symbol.iterator]||e["@@iterator"];if(null!=n){var r,a,o,l,i=[],c=!0,u=!1;try{if(o=(n=n.call(e)).next,0===t){if(Object(n)!==n)return;c=!1}else for(;!(c=(r=o.call(n)).done)&&(i.push(r.value),i.length!==t);c=!0);}catch(e){u=!0,a=e}finally{try{if(!c&&null!=n.return&&(l=n.return(),Object(l)!==l))return}finally{if(u)throw a}}return i}}(e,t)||f(e,t)||function(){throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}()}function f(e,t){if(e){if("string"==typeof e)return m(e,t);var n={}.toString.call(e).slice(8,-1);return"Object"===n&&e.constructor&&(n=e.constructor.name),"Map"===n||"Set"===n?Array.from(e):"Arguments"===n||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)?m(e,t):void 0}}function m(e,t){(null==t||t>e.length)&&(t=e.length);for(var n=0,r=Array(t);n<t;n++)r[n]=e[n];return r}const p=function(){var e=d((0,t.useState)(null),2),r=e[0],a=e[1],o=d((0,t.useState)(null),2),i=o[0],c=o[1],s=d((0,t.useState)(""),2),p=s[0],y=s[1],v=d((0,t.useState)(""),2),h=v[0],g=v[1],b=d((0,t.useState)(null),2),E=b[0],S=b[1],O=d((0,t.useState)("one-way"),2),w=O[0],j=O[1],_=d((0,t.useState)([{origin:null,destination:null,departureDate:""}]),2),P=_[0],D=_[1],A=d((0,t.useState)(!1),2),C=(A[0],A[1]),N=d((0,t.useState)("1 adult"),2),q=N[0],x=N[1],I=d((0,t.useState)("Economy"),2),R=I[0],k=I[1],L=(0,t.useRef)(null);(0,t.useEffect)((function(){var e=function(e){L.current&&!L.current.contains(e.target)&&C(!1)};return document.addEventListener("click",e),function(){document.removeEventListener("click",e)}}),[L]);var F=function(e){j(e.target.value),"one-way"===e.target.value?(D([{origin:null,destination:null,departureDate:""}]),g("")):"round-trip"===e.target.value?(D([{origin:null,destination:null,departureDate:"",returnDate:""}]),g("")):"multi-city"===e.target.value&&D([{origin:null,destination:null,departureDate:""}])},T=function(e,t,n){if(e&&e.iata_code&&e.name){var r=function(e){if(Array.isArray(e))return m(e)}(o=P)||function(e){if("undefined"!=typeof Symbol&&null!=e[Symbol.iterator]||null!=e["@@iterator"])return Array.from(e)}(o)||f(o)||function(){throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}();void 0!==n?"origin"===t?r[n].origin=e:"destination"===t&&(r[n].destination=e):"origin"===t?a(e):"destination"===t&&c(e),D(r),C(!1)}else console.error("Datos de ubicación inválidos:",e);var o};return n().createElement("div",{className:"flight-search-container"},n().createElement("form",{onSubmit:function(e){if(e.preventDefault(),"multi-city"===w){if(P.some((function(e){var t,n;return!(null!==(t=e.origin)&&void 0!==t&&t.iata_code&&null!==(n=e.destination)&&void 0!==n&&n.iata_code&&e.departureDate)})))return void S({code:"missing_params",message:"Faltan algunos parámetros requeridos en uno o más vuelos.",data:null})}else if(null==r||!r.iata_code||null==i||!i.iata_code||!p||"round-trip"===w&&!h)return void S({code:"missing_params",message:"Faltan algunos parámetros requeridos (origin, destination, departure_date).",data:null});var t=[];"1 adult"===q?t.push({type:"adult"}):"2 adults"===q?t.push({type:"adult"},{type:"adult"}):"1 adult, 1 child"===q&&t.push({type:"adult"},{type:"child"});var n="multi-city"===w?P.map((function(e){return{origin:e.origin.iata_code,destination:e.destination.iata_code,departure_date:e.departureDate,passengers:t,cabin_class:R}})):u(u({origin:r.iata_code,destination:i.iata_code,departure_date:p},"round-trip"===w&&{return_date:h}),{},{passengers:t,cabin_class:R});console.log("Enviando búsqueda con estos parámetros:",n),fetch("/wp-json/duffel/v1/search",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(n)}).then((function(e){if(!e.ok)throw new Error("Error en la solicitud: "+e.statusText);return e.json()})).then((function(e){console.log("Resultados obtenidos:",e),e&&e.data&&e.data.offers&&e.data.offers.forEach((function(e,n){console.log("Oferta ".concat(n+1,": Precio: ").concat(e.total_amount," ").concat(e.total_currency)),console.log("Clase: ".concat(R,", Pasajeros: ").concat(JSON.stringify(t)))})),S(e)})).catch((function(e){return console.error("Error en la búsqueda:",e)}))}},n().createElement("div",{className:"journey-type-options"},n().createElement("label",null,n().createElement("input",{type:"radio",value:"one-way",checked:"one-way"===w,onChange:F}),"One way"),n().createElement("label",null,n().createElement("input",{type:"radio",value:"round-trip",checked:"round-trip"===w,onChange:F}),"Return"),n().createElement("label",null,n().createElement("input",{type:"radio",value:"multi-city",checked:"multi-city"===w,onChange:F}),"Multi-city")),n().createElement("div",{className:"form-field"},n().createElement("label",null,"Origin"),n().createElement(l,{placeholder:"Enter a city or airport",onSelect:function(e){return T(e,"origin")},fetchOptions:{url:"/wp-json/duffel/v1/proxy-locations",queryParam:"query"}})),n().createElement("div",{className:"form-field"},n().createElement("label",null,"Destination"),n().createElement(l,{placeholder:"Enter a city or airport",onSelect:function(e){return T(e,"destination")},fetchOptions:{url:"/wp-json/duffel/v1/proxy-locations",queryParam:"query"}})),n().createElement("div",{className:"form-field half-width"},n().createElement("label",null,"Departure date"),n().createElement("input",{type:"date",value:p,onChange:function(e){return y(e.target.value)}})),"round-trip"===w&&n().createElement("div",{className:"form-field half-width"},n().createElement("label",null,"Return date"),n().createElement("input",{type:"date",value:h,onChange:function(e){return g(e.target.value)}})),n().createElement("div",{className:"form-field half-width"},n().createElement("label",null,"Passengers"),n().createElement("select",{value:q,onChange:function(e){return x(e.target.value)}},n().createElement("option",{value:"1 adult"},"1 adult"),n().createElement("option",{value:"2 adults"},"2 adults"),n().createElement("option",{value:"1 adult, 1 child"},"1 adult, 1 child"))),n().createElement("div",{className:"form-field half-width"},n().createElement("label",null,"Class"),n().createElement("select",{value:R,onChange:function(e){return k(e.target.value)}},n().createElement("option",{value:"Economy"},"Economy"),n().createElement("option",{value:"Premium Economy"},"Premium Economy"),n().createElement("option",{value:"Business"},"Business"),n().createElement("option",{value:"First"},"First"),n().createElement("option",{value:"Any"},"Any"))),n().createElement("button",{type:"submit"},"Find available flights")),E&&n().createElement("div",{className:"results-container"},n().createElement("h3",null,"Search Results:"),n().createElement("pre",null,JSON.stringify(E,null,2))," "))};document.addEventListener("DOMContentLoaded",(function(){var e=document.getElementById("duffel-flight-search");e&&(0,r.render)(n().createElement(p,null),e)}))})();
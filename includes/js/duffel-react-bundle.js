(()=>{"use strict";var e={n:t=>{var n=t&&t.__esModule?()=>t.default:()=>t;return e.d(n,{a:n}),n},d:(t,n)=>{for(var r in n)e.o(n,r)&&!e.o(t,r)&&Object.defineProperty(t,r,{enumerable:!0,get:n[r]})},o:(e,t)=>Object.prototype.hasOwnProperty.call(e,t)};const t=React;var n=e.n(t);const r=ReactDOM;function o(e,t){return function(e){if(Array.isArray(e))return e}(e)||function(e,t){var n=null==e?null:"undefined"!=typeof Symbol&&e[Symbol.iterator]||e["@@iterator"];if(null!=n){var r,o,a,i,l=[],u=!0,c=!1;try{if(a=(n=n.call(e)).next,0===t){if(Object(n)!==n)return;u=!1}else for(;!(u=(r=a.call(n)).done)&&(l.push(r.value),l.length!==t);u=!0);}catch(e){c=!0,o=e}finally{try{if(!u&&null!=n.return&&(i=n.return(),Object(i)!==i))return}finally{if(c)throw o}}return l}}(e,t)||function(e,t){if(e){if("string"==typeof e)return a(e,t);var n={}.toString.call(e).slice(8,-1);return"Object"===n&&e.constructor&&(n=e.constructor.name),"Map"===n||"Set"===n?Array.from(e):"Arguments"===n||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)?a(e,t):void 0}}(e,t)||function(){throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}()}function a(e,t){(null==t||t>e.length)&&(t=e.length);for(var n=0,r=Array(t);n<t;n++)r[n]=e[n];return r}const i=function(e){e.label;var r=e.placeholder,a=e.onSelect,i=e.fetchOptions,l=o((0,t.useState)(""),2),u=l[0],c=l[1],s=o((0,t.useState)([]),2),d=s[0],f=s[1],m=o((0,t.useState)(!1),2),p=m[0],y=m[1],v=o((0,t.useState)(!1),2),b=v[0],g=v[1],h=(0,t.useRef)(null);return(0,t.useEffect)((function(){if(console.log(i),u.length>=3&&!b)if(console.log("Buscando datos para:",u),i&&i.url){var e="".concat(i.url,"?").concat(i.queryParam,"=").concat(encodeURIComponent(u));fetch(e).then((function(e){return e.json()})).then((function(e){console.log("Datos recibidos:",e),f(e.data||[]),y(e.data.length>0)})).catch((function(e){return console.error("Error fetching locations:",e)}))}else console.error("La URL de fetchOptions no está definida.");else console.log("Consulta demasiado corta o vacía, o selección hecha. Ocultando dropdown."),f([]),y(!1)}),[u,i,b]),(0,t.useEffect)((function(){!p&&h.current?h.current.classList.add("hidden"):p&&h.current&&h.current.classList.remove("hidden")}),[p]),n().createElement("div",{style:{position:"relative"}},n().createElement("input",{type:"text",value:u,onChange:function(e){var t=e.target.value;c(t),g(!1);var n=d.some((function(e){return"".concat(e.city_name," (").concat(e.iata_code,") - ").concat(e.name)===t}));t.length<3||n?y(!1):y(d.length>0)},placeholder:r,style:{width:"100%",padding:"8px",boxSizing:"border-box"},onFocus:function(){u.length>=3&&d.length>0&&!b&&y(!0)}}),n().createElement("ul",{className:"autocomplete-list ".concat(p?"":"hidden"),ref:h},d.map((function(e){return n().createElement("li",{key:e.id,onClick:function(){return function(e){console.log("Elemento seleccionado:",e),e&&e.iata_code&&e.name?(a(e),c("".concat(e.city_name," (").concat(e.iata_code,") - ").concat(e.name)),g(!0),f([]),y(!1)):console.error("Datos de ubicación inválidos:",e)}(e)},style:{padding:"8px",cursor:"pointer"}},e.city_name," (",e.iata_code,") - ",e.name)}))))};function l(e){return l="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e},l(e)}function u(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,r)}return n}function c(e,t,n){return(t=function(e){var t=function(e){if("object"!=l(e)||!e)return e;var t=e[Symbol.toPrimitive];if(void 0!==t){var n=t.call(e,"string");if("object"!=l(n))return n;throw new TypeError("@@toPrimitive must return a primitive value.")}return String(e)}(e);return"symbol"==l(t)?t:t+""}(t))in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function s(e,t){return function(e){if(Array.isArray(e))return e}(e)||function(e,t){var n=null==e?null:"undefined"!=typeof Symbol&&e[Symbol.iterator]||e["@@iterator"];if(null!=n){var r,o,a,i,l=[],u=!0,c=!1;try{if(a=(n=n.call(e)).next,0===t){if(Object(n)!==n)return;u=!1}else for(;!(u=(r=a.call(n)).done)&&(l.push(r.value),l.length!==t);u=!0);}catch(e){c=!0,o=e}finally{try{if(!u&&null!=n.return&&(i=n.return(),Object(i)!==i))return}finally{if(c)throw o}}return l}}(e,t)||d(e,t)||function(){throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}()}function d(e,t){if(e){if("string"==typeof e)return f(e,t);var n={}.toString.call(e).slice(8,-1);return"Object"===n&&e.constructor&&(n=e.constructor.name),"Map"===n||"Set"===n?Array.from(e):"Arguments"===n||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)?f(e,t):void 0}}function f(e,t){(null==t||t>e.length)&&(t=e.length);for(var n=0,r=Array(t);n<t;n++)r[n]=e[n];return r}const m=function(){var e=s((0,t.useState)(null),2),r=e[0],o=e[1],a=s((0,t.useState)(null),2),l=a[0],m=a[1],p=s((0,t.useState)(""),2),y=p[0],v=p[1],b=s((0,t.useState)(""),2),g=b[0],h=b[1],E=s((0,t.useState)(null),2),S=E[0],O=E[1],j=s((0,t.useState)("one-way"),2),w=j[0],_=j[1],D=s((0,t.useState)([{origin:null,destination:null,departureDate:""}]),2),P=D[0],A=D[1],C=s((0,t.useState)(!1),2),x=(C[0],C[1]),I=(0,t.useRef)(null);(0,t.useEffect)((function(){var e=function(e){I.current&&!I.current.contains(e.target)&&x(!1)};return document.addEventListener("click",e),function(){document.removeEventListener("click",e)}}),[I]);var N=function(e){_(e.target.value),"one-way"===e.target.value?(A([{origin:null,destination:null,departureDate:""}]),h("")):"round-trip"===e.target.value?(A([{origin:null,destination:null,departureDate:"",returnDate:""}]),h("")):"multi-city"===e.target.value&&A([{origin:null,destination:null,departureDate:""}])},R=function(e,t,n){if(e&&e.iata_code&&e.name){var r=function(e){if(Array.isArray(e))return f(e)}(a=P)||function(e){if("undefined"!=typeof Symbol&&null!=e[Symbol.iterator]||null!=e["@@iterator"])return Array.from(e)}(a)||d(a)||function(){throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}();void 0!==n?"origin"===t?r[n].origin=e:"destination"===t&&(r[n].destination=e):"origin"===t?o(e):"destination"===t&&m(e),A(r),x(!1)}else console.error("Datos de ubicación inválidos:",e);var a};return n().createElement("div",{className:"flight-search-container"},n().createElement("form",{onSubmit:function(e){if(e.preventDefault(),"multi-city"===w){if(P.some((function(e){var t,n;return!(null!==(t=e.origin)&&void 0!==t&&t.iata_code&&null!==(n=e.destination)&&void 0!==n&&n.iata_code&&e.departureDate)})))return void O({code:"missing_params",message:"Faltan algunos parámetros requeridos en uno o más vuelos.",data:null})}else if(null==r||!r.iata_code||null==l||!l.iata_code||!y||"round-trip"===w&&!g)return void O({code:"missing_params",message:"Faltan algunos parámetros requeridos (origin, destination, departure_date).",data:null});var t="multi-city"===w?P.map((function(e){return{origin:e.origin.iata_code,destination:e.destination.iata_code,departure_date:e.departureDate}})):function(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?u(Object(n),!0).forEach((function(t){c(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):u(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}({origin:r.iata_code,destination:l.iata_code,departure_date:y},"round-trip"===w&&{return_date:g});console.log("Enviando búsqueda con estos parámetros:",t),fetch("/wp-json/duffel/v1/search",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(t)}).then((function(e){if(!e.ok)throw new Error("Error en la solicitud: "+e.statusText);return e.json()})).then((function(e){console.log("Resultados obtenidos:",e),O(e)})).catch((function(e){return console.error("Error en la búsqueda:",e)}))}},n().createElement("div",{className:"journey-type-options"},n().createElement("label",null,n().createElement("input",{type:"radio",value:"one-way",checked:"one-way"===w,onChange:N}),"One way"),n().createElement("label",null,n().createElement("input",{type:"radio",value:"round-trip",checked:"round-trip"===w,onChange:N}),"Return"),n().createElement("label",null,n().createElement("input",{type:"radio",value:"multi-city",checked:"multi-city"===w,onChange:N}),"Multi-city")),n().createElement("div",{className:"form-field"},n().createElement("label",null,"Origin"),n().createElement(i,{placeholder:"Enter a city or airport",onSelect:function(e){return R(e,"origin")},fetchOptions:{url:"/wp-json/duffel/v1/proxy-locations",queryParam:"query"}})),n().createElement("div",{className:"form-field"},n().createElement("label",null,"Destination"),n().createElement(i,{placeholder:"Enter a city or airport",onSelect:function(e){return R(e,"destination")},fetchOptions:{url:"/wp-json/duffel/v1/proxy-locations",queryParam:"query"}})),n().createElement("div",{className:"form-field half-width"},n().createElement("label",null,"Departure date"),n().createElement("input",{type:"date",value:y,onChange:function(e){return v(e.target.value)}})),"round-trip"===w&&n().createElement("div",{className:"form-field half-width"},n().createElement("label",null,"Return date"),n().createElement("input",{type:"date",value:g,onChange:function(e){return h(e.target.value)}})),n().createElement("button",{type:"submit"},"Find available flights")),S&&n().createElement("div",{className:"results-container"},n().createElement("h3",null,"Search Results:"),n().createElement("pre",null,JSON.stringify(S,null,2))," "))};document.addEventListener("DOMContentLoaded",(function(){var e=document.getElementById("duffel-flight-search");e&&(0,r.render)(n().createElement(m,null),e)}))})();
import fs from 'node:fs/promises';
import {pathToFileURL} from 'node:url';
const runtime='C:/Users/lauta/.cache/codex-runtimes/codex-primary-runtime/dependencies';
process.env.RUNTIME_NODE_MODULES=runtime+'/node/node_modules';
const {Presentation,PresentationFile}=await import(pathToFileURL(runtime+'/node/node_modules/@oai/artifact-tool/dist/artifact_tool.mjs'));
const work='C:/Users/lauta/Proyectos/Facultad/AppUTN/Presentacion/ReplicaFinalEditable';
const skill='C:/Users/lauta/.codex/plugins/cache/openai-primary-runtime/presentations/26.1025.11240/skills/presentations';
const p=Presentation.create({slideSize:{width:1376,height:774}});
const cream='#F5F2E8',blue='#2C5E9B',navy='#192B35',orange='#B76340',green='#1D4333';let s;
function shape(g,x,y,w,h,fill='none',stroke='none',sw=0,r=0,shadow=false){let z=s.shapes.add({geometry:g,position:{left:x,top:y,width:w,height:h,rotation:r},fill,line:{fill:stroke,width:sw},...(g==='roundRect'?{borderRadius:22}:{}),...(shadow?{shadow:'shadow-lg'}:{})});return z;}
function text(t,x,y,w,h,size=30,color='#111111',bold=false,align='left'){let z=shape('textbox',x,y,w,h);z.text=t;z.text.style={typeface:'Arial',fontSize:size,color,bold,alignment:align,insets:0,lineSpacing:1.05,wrap:'none'};return z;}
function path(commands,fill,stroke='none',width=0){return s.shapes.add({geometry:'custom',position:{left:0,top:0,width:1376,height:774},fill,line:{fill:stroke,width},customPaths:[{width:1376,height:774,commands}]});}
const M=(x,y)=>({moveTo:{x,y}}),L=(x,y)=>({lineTo:{x,y}}),C=(x1,y1,x2,y2,x,y)=>({cubicBezTo:{x1,y1,x2,y2,x,y}}),Z=()=>({close:{}});
function blobTop(){path([M(0,0),L(735,0),C(706,186,643,267,481,339),C(290,432,165,418,0,495),Z()],blue);}
function corner(){path([M(918,0),C(912,133,1055,286,1376,267),L(1376,0),Z()],orange);path([M(918,0),C(912,109,1050,247,1376,227),L(1376,0),Z()],blue);path([M(0,510),C(184,490,356,560,435,774),L(0,774),Z()],orange);path([M(0,511),C(183,490,345,575,412,774),L(0,774),Z()],blue);}
function page(n){s=p.slides.add();s.background.fill=cream;text('â—‰ Gemini Notebook',1268,751,104,18,10,'#111111',true);s.speakerNotes.text=`ReconstrucciÃ³n editable de la diapositiva ${n} del archivo aportado por el usuario. Textos, fondos, marcos y diagramas nativos. Las ilustraciones se reconstruyeron como formas vectoriales agrupadas por color; el texto pequeÃ±o dentro de ellas es parte del trazado, no texto tipogrÃ¡fico. Pueden existir diferencias de textura y tipografÃ­a respecto al original rasterizado.`;return s;}
async function vector(name,x,y,w,h){let d=JSON.parse(await fs.readFile(work+'/.build/'+name+'.json','utf8'));shape('rect',x,y,w,h,cream);for(const [color,paths]of Object.entries(d.paths)){const commands=paths.flatMap(pts=>[M(...pts[0]),...pts.slice(1).map(pt=>L(...pt)),Z()]);s.shapes.add({geometry:'custom',name:`${name} vector ${color}`,position:{left:x,top:y,width:w,height:h},fill:color,line:{fill:'none',width:0},customPaths:[{width:d.w,height:d.h,commands}]});}}
function card(x,y,w,h,fill='#FFFFFF',stroke='none',shadow=true){return shape('roundRect',x,y,w,h,fill,stroke,stroke==='none'?0:2.5,0,shadow);}

function line(x,y,w,h,color='#A7B4A7',sw=1){return shape('line',x,y,w,h,'none',color,sw);}
function grid(){for(let x=0;x<1376;x+=115)line(x,0,0,774,'#DDD9CD',0.8);for(let y=75;y<774;y+=59)line(0,y,1376,0,'#DDD9CD',0.8);}
function title(t,size=55){text(t,57,55,1263,85,size,green,true);}
function label(t,x,y,w,h=48,fill=green){card(x,y,w,h,fill,'none',false);text(t,x+10,y+8,w-20,h-6,26,'#FFFFFF',false,'center');}
page(1);s.background.fill='#123C2A';card(21,16,1333,736,'#FAF6E9','none',false);
for(const x of [87,1291])line(x,16,0,736,green,1.8);for(const y of [321,551])line(21,y,1333,0,green,1.8);line(688,712,0,40,green,1.8);
text('Almacén de Bolsillo',126,21,1150,139,119,'#103D2B',true);
await vector('logo',538,167,301,289);
text('Proyecto Final: Tecnicatura Universitaria en Programación',130,464,1130,57,40,green,true);
card(109,520,1158,193,cream,green,false);shape('roundRect',109,520,1158,40,green);shape('roundRect',1103,520,164,40,'#C16A43');shape('rect',110,552,58,160,'#C16A43');line(168,552,0,161,green,1.8);line(109,613,1158,0,green,1.8);line(109,552,1158,0,green,1.8);
text('Expositores:',183,566,200,45,32,green,true);text('Mariano y Lautaro',377,566,800,45,32,green);
text('Institución:',185,629,190,45,32,green,true);text('UTN-FRGP (Universidad Tecnológica Nacional, Facultad\nRegional General Pacheco)',377,629,870,80,31,green);
page(2);s.background.fill='#F9F9F4';
text('¿Qué pasó en el negocio\nmientras Juan no estaba?',360,44,660,110,50,green,false,'center');card(1175,29,157,38,'#DFE4DB','none',false);text('[Caso ficticio]',1187,36,145,30,22,green);
for(const x of [51,1325])line(x,152,0,420,'#A9B5A8',1);for(const y of [173,609]){line(31,y,356,0);line(989,y,356,0);}line(32,384,1312,0,green,2);
card(76,198,312,379,cream,green,false);shape('roundRect',76,198,312,65,green);text('Turno 1',87,209,290,43,28,'#FFFFFF',false,'center');shape('rect',79,246,306,299,cream);await vector('turno1',101,289,260,220);
card(989,198,312,379,cream,green,false);shape('roundRect',989,198,312,65,green);text('Turno 2',1000,209,290,43,28,'#FFFFFF',false,'center');shape('rect',992,246,306,299,cream);await vector('turno2',1059,264,192,286);
await vector('papers',519,181,397,419);
text('Anotaciones\ndispersas',406,222,150,57,21,green,false,'center');text('Novedades\nsin comunicar',398,500,150,58,21,green,false,'center');text('Dudas sobre\nla mercadería\ndisponible',847,529,144,83,20,green,false,'center');
shape('curvedRightArrow',465,268,54,47,'#AE6544');shape('curvedRightArrow',465,443,54,47,'#AE6544');
label('¿Qué se\nvendió?',975,316,128,64,green);label('¿Cuánto\nqueda?',1187,410,128,64,green);
card(76,654,1225,77,'#BF6F49','#955133',false);shape('triangle',666,634,43,27,'#BF6F49','#955133',1);text('Volver a contar productos · Detectar faltantes tarde · Dedicar tiempo a reconstruir lo ocurrido',109,678,1160,42,27,'#FFFFFF',false,'center');
page(3);s.background.fill='#F9F9F4';text('De la información dispersa\na una gestión compartida',360,44,660,113,49,green,false,'center');
const xs=[76,512,949];const ys=[236,367,497];
['Dificultad','Respuesta de la aplicación','Utilidad para el comercio'].forEach((t,i)=>label(t,xs[i],182,351,45,i===1?'#AD6849':green));
const ts=[['Anotaciones\ndispersas','Registro e\nhistorial de\nventas','Consultar qué se\nvendió durante\ncada turno'],['Dudas sobre\ncuánto queda','Existencias\nactualizadas\nal registrar\noperaciones','Consultar\ndisponibilidad\ny orientar la\nreposición'],['Horarios\nacordados\nde palabra','Asignación\ny consulta\nde turnos','Saber qué horarios\ntiene asignados\nel empleado']];
for(let i=0;i<3;i++)for(let j=0;j<3;j++){card(xs[j],ys[i],351,120,'#FAFAF6',j===1?'#9E654A':green,false);await vector('v'+i+j,xs[j]+18,ys[i]+12,150,101);text(ts[i][j],xs[j]+188,ys[i]+24,157,96,21,green);if(j<2)text('⟶',xs[j]+365,ys[i]+39,65,45,41,green);}
card(76,654,1225,77,'#BF6F49','#955133',false);text('Para Juan y otros comercios de barrio: registros y turnos en una misma herramienta.',110,678,1158,42,29,'#FFFFFF',false,'center');
page(4);s.background.fill='#F9F9F4';line(78,0,0,774);line(1298,0,0,774);for(const y of [123,695]){line(0,y,335,0);line(629,y+20,747,0);}
text('Bienvenida, roles y turnos',320,48,800,77,55,green,true);
const ly=[124,265,407,578];const heads=['Autenticación','Gestión de Cuentas','Roles en Acción','Asignación de Turnos'];const bodies=['Registro de usuario y\nacceso seguro.','El dueño administra el\nperfil del comercio.','Las opciones de la interfaz\nse adaptan según el rol\n(Dueño vs. Empleado).','Organización de la\njornada laboral en la app.'];
for(let i=0;i<4;i++){let h=i===2?149:119;card(78,ly[i],254,h,'#FFFFFF',green,false);shape('roundRect',85,ly[i]+7,240,42,green);text(heads[i],90,ly[i]+15,230,30,20,'#FFFFFF',true,'center');text(bodies[i],85,ly[i]+61,240,h-45,20,green,false,'center');}
await vector('phone4',373,196,229,481);card(629,174,668,490,cream,green,false);
path([M(332,183),L(345,183),C(362,183,355,208,355,224),L(355,306),C(355,323,347,325,336,325)],'none','#A56B53',2);
path([M(332,480),L(341,480),C(369,480,344,528,376,530)],'none','#A56B53',2);path([M(332,637),C(369,638,344,585,376,585)],'none','#A56B53',2);
page(5);grid();text('Un día en el comercio: el ciclo de operaciones',109,65,1200,78,52,green,true);
await vector('dashboard',96,152,228,469);await vector('profit',1053,152,231,469);
shape('roundRect',389,211,598,310,'#1B1B18','#777870',4,0,true);shape('roundRect',402,223,572,284,cream);shape('roundRect',411,325,25,82,'#000000');shape('rect',591,207,64,4,'#686A63');
text('Resumen Operativo:',74,649,270,42,27,green,true,'center');text('Impacto en tiempo real.',74,682,270,42,26,green,false,'center');
text('Flujo de la Demo: Ingreso de\nmercadería → Registro de venta →\nActualización automática de\nexistencias.',469,565,448,132,27,green,false,'center');
text('Análisis: Rentabilidad y\ncomposición de ingresos',1021,649,290,80,26,green,false,'center');
page(6);grid();title('¿Cómo funciona por dentro?',57);
const xx=[58,514,965];for(let i=0;i<3;i++)card(xx[i],159,i===1?348:353,325,cream,green,false);
await vector('front',84,173,47,72);await vector('back',532,173,67,70);await vector('db',986,173,54,70);
text('Capa 1: Frontend',146,194,256,43,28,green,true);text('Capa 2: Backend',605,194,250,43,28,green,true);text('Capa 3:\nBase de Datos',1055,180,252,78,28,green,true);
text('Lo que vemos\nTecnologías: React Native +\nExpo',82,261,315,105,25);text('Donde se procesan las\noperaciones\nTecnologías: Node.js +\nExpress (Prisma)',538,261,310,127,25);text('Donde se guarda la\ninformación\nTecnologías: PostgreSQL',988,261,314,107,25);
for(let i=0;i<3;i++){let y=i===1?392:366;card(xx[i]+20,y,313,i===1?71:97,'#B3674A','none',false);text('Flujo del ejemplo:',xx[i]+34,y+11,290,32,23,'#FFFFFF',true);text(['El empleado confirma una\nventa.','Se procesa la operación.','Se guardan la venta y las\nnuevas cantidades.'][i],xx[i]+34,y+38,290,62,23,'#FFFFFF');}
for(const x of [410,862])shape('rightArrow',x,283,102,76,'#B3674A');
card(58,531,1260,180,cream,green,false);text('Diseño y Accesibilidad',87,573,480,46,34,green,true);text('Botones que guían · Pantallas consistentes ·\nTipografía clara · Textos breves',87,622,480,76,25);
text('Ética e Impacto Social',830,573,470,46,34,green,true);text('Herramientas para comercios de barrio ·\nAutonomía para decidir · Cuidado de los datos',830,622,470,76,24);
await vector('sales',565,516,236,252);
page(7);grid();title('Conclusiones y futuro',59);
const cx=[58,485,911];for(let i=0;i<3;i++)card(cx[i],170,407,465,cream,green,false);
await vector('check',81,191,78,76);await vector('warning',506,191,80,76);await vector('rocket',931,189,79,78);
text('Impacto',172,215,270,50,36,green,true);text('Limitaciones',598,215,280,50,36,green,true);text('Futura versión',1020,215,280,50,36,green,true);
text('Información reunida\nContinuidad entre turnos\nGestión desde el celular',87,295,350,150,30);
text('Sin separación por\ncomercio\n\nFunciones con alcance\ninicial\n\nSin modo de trabajo\noffline',515,295,350,300,30);
text('Arquitectura Multi-tenant:',934,295,368,40,29,'#111111',true);text('Una base de datos propia\npara cada comercio.',934,331,368,75,30);
text('Mejora de funciones\nactuales: Escaneo de\ncódigos SKU,\nOperaciones sin conexión,\nProductos sin ventas\nrecientes',934,411,368,216,30);
await vector('logo7',52,547,242,221);text('Gracias · ¿Preguntas?',1030,685,285,47,30,green);
await fs.mkdir(work+'/Entrega',{recursive:true});
for(let i=0;i<7;i++){console.log('Rendering',i+1);const b=await p.export({slide:p.slides.items[i],format:'png',scale:1});await fs.writeFile(work+`/.build/replica-${i+1}.png`,new Uint8Array(await b.arrayBuffer()));}
const candidatePath=work+'/.build/candidate.pptx';await(await PresentationFile.exportPptx(p)).save(candidatePath);
const{finalizePresentation}=await import(pathToFileURL(skill+'/container_tools/artifact_tool_utils.mjs'));
console.log(await finalizePresentation({workspaceDir:work,candidatePath,finalPath:work+'/Entrega/Almacen-de-Bolsillo-Final-Editable.pptx',pythonExecutable:runtime+'/python/python.exe',integrityValidatorPath:skill+'/container_tools/inspect_presentation_package_integrity.py',layoutValidatorPath:skill+'/container_tools/inspect_presentation_layout_geometry.py',layoutArgs:['--expected-slide-size-emu','13106400,7372350','--validate-heading-fit'],fontPolicy:{basis:'design',families:['Arial']},explicitTotalSlideCount:7,verifyArtifactToolImport:true,receiptPath:work+'/.build/validation.json'}));

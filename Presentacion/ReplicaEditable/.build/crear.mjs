import fs from 'node:fs/promises';
import {pathToFileURL} from 'node:url';
const runtime='C:/Users/lauta/.cache/codex-runtimes/codex-primary-runtime/dependencies';
process.env.RUNTIME_NODE_MODULES=runtime+'/node/node_modules';
const {Presentation,PresentationFile}=await import(pathToFileURL(runtime+'/node/node_modules/@oai/artifact-tool/dist/artifact_tool.mjs'));
const work='C:/Users/lauta/Proyectos/Facultad/AppUTN/Presentacion/ReplicaEditable';
const skill='C:/Users/lauta/.codex/plugins/cache/openai-primary-runtime/presentations/26.1025.11240/skills/presentations';
const p=Presentation.create({slideSize:{width:1376,height:774}});
const cream='#F5F1E5',blue='#2C5E9B',navy='#192B35',orange='#B76340',green='#295740';let s;
function shape(g,x,y,w,h,fill='none',stroke='none',sw=0,r=0,shadow=false){let z=s.shapes.add({geometry:g,position:{left:x,top:y,width:w,height:h,rotation:r},fill,line:{fill:stroke,width:sw},...(g==='roundRect'?{borderRadius:22}:{}),...(shadow?{shadow:'shadow-lg'}:{})});return z;}
function text(t,x,y,w,h,size=30,color='#111111',bold=false,align='left'){let z=shape('textbox',x,y,w,h);z.text=t;z.text.style={typeface:'Arial',fontSize:size,color,bold,alignment:align,insets:0,lineSpacing:1.05};return z;}
function path(commands,fill,stroke='none',width=0){return s.shapes.add({geometry:'custom',position:{left:0,top:0,width:1376,height:774},fill,line:{fill:stroke,width},customPaths:[{width:1376,height:774,commands}]});}
const M=(x,y)=>({moveTo:{x,y}}),L=(x,y)=>({lineTo:{x,y}}),C=(x1,y1,x2,y2,x,y)=>({cubicBezTo:{x1,y1,x2,y2,x,y}}),Z=()=>({close:{}});
function blobTop(){path([M(0,0),L(735,0),C(706,186,643,267,481,339),C(290,432,165,418,0,495),Z()],blue);}
function corner(){path([M(918,0),C(912,133,1055,286,1376,267),L(1376,0),Z()],orange);path([M(918,0),C(912,109,1050,247,1376,227),L(1376,0),Z()],blue);path([M(0,510),C(184,490,356,560,435,774),L(0,774),Z()],orange);path([M(0,511),C(183,490,345,575,412,774),L(0,774),Z()],blue);}
function page(n){s=p.slides.add();s.background.fill=cream;text('◉ Gemini Notebook',1268,751,104,18,10,'#111111',true);s.speakerNotes.text=`Reconstrucción editable de la diapositiva ${n} del archivo aportado por el usuario. Textos, fondos, marcos y diagramas nativos. Las ilustraciones se reconstruyeron como formas vectoriales agrupadas por color; el texto pequeño dentro de ellas es parte del trazado, no texto tipográfico. Pueden existir diferencias de textura y tipografía respecto al original rasterizado.`;return s;}
async function vector(name,x,y,w,h){let d=JSON.parse(await fs.readFile(work+'/.build/'+name+'.json','utf8'));for(const [color,rs]of Object.entries(d.colors)){const commands=rs.flatMap(([x,y,w,h])=>[M(x,y),L(x+w,y),L(x+w,y+h),L(x,y+h),Z()]);s.shapes.add({geometry:'custom',name:`${name} vector ${color}`,position:{left:x,top:y,width:w,height:h},fill:color,line:{fill:'none',width:0},customPaths:[{width:d.w,height:d.h,commands}]});}}
function card(x,y,w,h,fill='#FFFFFF',stroke='none',shadow=true){return shape('roundRect',x,y,w,h,fill,stroke,stroke==='none'?0:2.5,0,shadow);}
page(1);
path([M(1000,0),L(1376,0),L(1376,768),L(521,768),L(774,520),Z()],'#0659ED');
await vector('phones',740,20,620,695);
text('Almacén',65,80,680,150,142,'#0751C9',true);text('de Bolsillo',65,207,690,150,138,'#0751C9',true);
text('Proyecto Final - Gestión simple\npara pequeños comercios',66,360,670,105,42,'#5D6D86');
text('Mariano y Lautaro',66,522,520,65,40,'#B75928',true);
text('UTN-FRGP',66,637,155,38,29,'#0D1A30',true);text('| Tecnicatura\nUniversitaria en Programación',220,637,500,80,29,'#0D1A30');
await vector('logo',548,470,166,156);
page(2);blobTop();
text('¿Qué pasó en el negocio\nmientras Juan no estaba?',66,51,650,125,51,'#FFFFFF');
card(868,34,472,37,'#FAE9D6','#DAB18C',false);text('Caso ficticio (Juan, dueño de kiosco, 1 persona por turno)',880,42,452,28,17,'#70462D');
card(68,237,267,328,'#FFFFFF','#4B7C60');await vector('employee',93,270,221,217);text('Turno del Empleado',90,509,226,37,24,'#365F4D',false,'center');
card(1042,237,267,328,'#FFFFFF',blue);await vector('juan',1076,268,219,219);text('Turno de Juan',1070,509,215,37,24,'#111111',false,'center');
// The original paper notes are reconstructed as independent editable paper shapes.
shape('rect',402,241,153,160,'#F5DF89','none',0,-9);shape('rect',402,241,153,24,'#DFC76B','none',0,-9);
let z=text('Anotaciones\ndispersas',416,289,140,70,23);z.position.rotation=-9;
shape('rect',486,403,176,173,'#F3F3EF','none',0,9);z=text('Novedades\nsin comunicar',505,450,155,85,23);z.position.rotation=9;
shape('rect',800,374,149,145,'#F4C78F','none',0,-5);shape('rect',833,366,79,20,'#D4A56C','none',0,-5);z=text('Dudas sobre\nla mercadería\ndisponible',811,413,135,102,21);z.position.rotation=-5;
for(const [x,y,w]of [[568,264,92],[394,429,91],[742,465,81],[722,231,142],[709,347,149],[802,309,141]])card(x,y,w,57,'#CADFF3','none',false);
text('¿Qué se\nvendió?',1012,280,118,76,24,'#111111',false,'center');text('¿Cuánto\nqueda?',1220,280,119,76,24,'#111111',false,'center');
// Speech bubbles are editable and sit above the character card.
for(const [x,label]of [[1006,'¿Qué se\nvendió?'],[1216,'¿Cuánto\nqueda?']]){shape('ellipse',x,253,127,102,'#DCEBFA',orange,2.5);text(label,x+12,280,103,68,22,'#111111',false,'center');}
card(68,640,1240,98,'#F6DFD2',orange,false);shape('triangle',95,660,65,58,'#B84520');text('!',120,672,25,43,37,'#FFFFFF',true);
text('• Volver a contar productos',198,676,350,45,25);text('• Detectar faltantes tarde',530,676,318,45,25);text('• Dedicar tiempo a reconstruir lo ocurrido',842,676,455,45,25);
page(3);blobTop();
text('De la información dispersa a una gestión compartida',66,52,1260,75,49);
// A white left title segment follows the original two-tone heading.
text('De la información dispersa',66,52,615,75,49,'#FFFFFF');
const xs=[66,510,953],ws=[357,357,357];
['Dificultad','Respuesta de la aplicación','Utilidad para el comercio'].forEach((t,i)=>{card(xs[i],160,ws[i],69,navy,'none',false);shape('roundRect',xs[i],218,ws[i],13,[blue,orange,'#428468'][i]);text(t,xs[i]+10,180,ws[i]-20,43,i===0?29:27,'#FFFFFF',true,'center');});
const left=['Anotaciones\ndispersas','Dudas sobre\ncuánto queda','Horarios acordados\nde palabra'];
const middle=['Registro e historial\nde ventas','Existencias actualizadas\nal registrar operaciones','Asignación y consulta\nde turnos'];
const right=['Consultar qué se vendió\ndurante cada turno','Consultar disponibilidad\ny orientar la reposición','Saber qué horarios tiene\nasignados el empleado'];
for(let i=0;i<3;i++){let y=248+i*122;for(let j=0;j<3;j++)card(xs[j],y,357,102);text(left[i],171,y+23,245,75,27,'#111111',false,'center');text(middle[i],522,y+23,333,75,26,'#111111',false,'center');text(right[i],967,y+23,330,75,26,'#111111',false,'center');shape('rightArrow',447,y+37,38,27,blue);shape('rightArrow',890,y+37,38,27,blue);await vector(['cart','box','calendar'][i],90,y+17,74,74);}
card(397,638,588,48,'#174B33','none',false);card(350,679,677,55,'#174B33','none',false);text('Para Juan y otros comercios de barrio:',406,646,570,41,30,'#FFFFFF',true,'center');text('registros y turnos en una misma herramienta',359,687,660,42,30,'#FFFFFF',true,'center');
page(4);blobTop();text('Demo: Bienvenida y gestión de personas',66,52,1250,75,50);text('Demo: Bienvenida y gestión',66,52,650,75,50,'#FFFFFF');
card(218,157,942,560,'#FFFFFF','#AAA794');card(232,172,912,529,'#D3D2CD','none',false);
path([M(206,437),L(206,196),C(206,160,227,145,258,145),L(690,145)],'none',orange,3);
path([M(688,729),L(1110,729),C(1148,729,1171,711,1171,678),L(1171,437)],'none',green,3);
page(5);text('Demo: Un día en el comercio',56,51,1270,80,59,blue,true);
path([M(0,152),L(644,152),C(530,223,395,140,280,198),C(155,265,94,320,0,321),Z()],blue);
path([M(0,346),C(153,350,210,193,420,180),L(550,152)],'none',green,4);path([M(0,379),C(180,367,218,204,444,187),L(580,152)],'none',orange,3);
path([M(950,774),C(1180,745,1216,644,1376,625)],'none',orange,3);path([M(1020,774),C(1190,752,1244,654,1376,657)],'none',green,4);
shape('roundRect',178,201,1022,536,cream,'#383A35',1.2);shape('roundRect',183,205,1012,528,cream,'#383A35',0.8);shape('roundRect',251,205,875,491,cream,'#383A35',0.8);shape('roundRect',264,213,849,475,cream,'#383A35',0.8);shape('ellipse',683,210,11,11,cream,'#383A35',0.8);shape('roundRect',653,704,70,20,cream,'#383A35',1);
page(6);corner();text('¿Cómo funciona por dentro?',56,54,1180,72,49);
const ax=[56,510,965];
for(let i=0;i<3;i++)card(ax[i],147,355,225,cream);
await vector('mobile',210,160,48,72);await vector('server',645,160,83,74);await vector('database',1113,161,60,73);
text('Frontend: lo que vemos',77,265,315,46,29,'#111111',false,'center');text('React Native + Expo',77,311,315,43,27,'#111111',false,'center');
text('Backend: donde se\nprocesan las operaciones',526,251,323,73,28,'#111111',false,'center');text('Node.js + Express',526,329,323,40,27,'#111111',false,'center');
text('Base de datos: donde se\nguarda la información',979,251,327,73,28,'#111111',false,'center');text('PostgreSQL',979,329,327,40,27,'#111111',false,'center');
for(let x of [420,875])shape('rightArrow',x,240,80,35,blue);
shape('rightArrow',57,393,1262,34,blue);
['El empleado confirma\nuna venta','Se procesa la operación','Se guardan la venta y las\nnuevas cantidades'].forEach((t,i)=>text(t,ax[i],434,355,76,27,'#111111',false,'center'));
card(70,548,607,182,orange,'none',false);card(57,535,606,179,cream,orange,false);await vector('appearance',456,537,204,175);text('Accesibilidad y uso',92,561,354,43,29,'#111111',true);text('Botones que guían · Pantallas\nconsistentes · Tipografía clara ·\nTextos breves',92,608,355,94,26);
card(729,548,604,182,blue,'none',false);card(715,535,603,179,cream,blue,false);text('Ética e impacto social',749,561,540,43,29,'#111111',true);text('Herramientas para comercios de barrio ·\nAutonomía para decidir · Cuidado de los datos',749,608,540,90,26);
page(7);corner();text('Conclusiones y futuro',57,53,1210,73,49);
const xx=[57,488,919];for(let i=0;i<3;i++){card(xx[i]+16,162,397,508,[orange,'#7D8E97',green][i],'none',false);card(xx[i],147,397,508,cream);}
await vector('impact',210,160,90,89);await vector('limits',638,158,97,92);await vector('rocket',1062,157,111,91);
['Impacto','Limitaciones','Futura versión'].forEach((t,i)=>text(t,xx[i]+18,263,361,49,36,'#111111',false,'center'));
for(let i=0;i<3;i++){let y=342+i*98;shape('ellipse',105,y,36,36,orange);text('✓',111,y+2,28,30,26,'#FFFFFF',true);text(['Información\nreunida','Continuidad entre\nturnos','Gestión desde el\ncelular'][i],160,y,270,82,29);text(['−','−','○'][i],537,y,35,42,34,'#7D8E97');text(['Sin separación por\ncomercio','Funciones con\nalcance inicial','Sin modo de trabajo\noffline'][i],588,y,277,85,28);}
card(958,325,342,143,green,'none',false);card(945,314,344,143,cream,green,false);text('Base de datos propia\npara cada comercio:\nmulti tenant',958,335,320,111,31,'#111111',true,'center');
text('Mejora de las funciones actuales:',953,489,347,35,22,'#111111',true);
['Escaneo de códigos SKU','Operaciones sin conexión','Productos sin ventas recientes'].forEach((t,i)=>{text('+',958,525+i*39,35,40,35,green);text(t,998,530+i*39,300,39,23);});
text('Gracias · ¿Preguntas?',456,699,500,60,42,'#111111',false,'center');
await fs.mkdir(work+'/Entrega',{recursive:true});
for(let i=0;i<7;i++){console.log('Rendering',i+1);const b=await p.export({slide:p.slides.items[i],format:'png',scale:1});await fs.writeFile(work+`/.build/replica-${i+1}.png`,new Uint8Array(await b.arrayBuffer()));}
const candidatePath=work+'/.build/candidate.pptx';await(await PresentationFile.exportPptx(p)).save(candidatePath);
const{finalizePresentation}=await import(pathToFileURL(skill+'/container_tools/artifact_tool_utils.mjs'));
console.log(await finalizePresentation({workspaceDir:work,candidatePath,finalPath:work+'/Entrega/Almacen-de-Bolsillo-Replica-Editable.pptx',pythonExecutable:runtime+'/python/python.exe',integrityValidatorPath:skill+'/container_tools/inspect_presentation_package_integrity.py',layoutValidatorPath:skill+'/container_tools/inspect_presentation_layout_geometry.py',layoutArgs:['--expected-slide-size-emu','13106400,7372350','--validate-heading-fit'],fontPolicy:{basis:'design',families:['Arial']},explicitTotalSlideCount:7,verifyArtifactToolImport:true,receiptPath:work+'/.build/validation.json'}));

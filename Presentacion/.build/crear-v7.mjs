import fs from 'node:fs/promises';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
const runtime='C:/Users/lauta/.cache/codex-runtimes/codex-primary-runtime/dependencies';
process.env.RUNTIME_NODE_MODULES=runtime+'/node/node_modules';
const {Presentation,PresentationFile}=await import(pathToFileURL(runtime+'/node/node_modules/@oai/artifact-tool/dist/artifact_tool.mjs'));
const root='C:/Users/lauta/Proyectos/Facultad/AppUTN';
const work=root+'/Presentacion';
const skill='C:/Users/lauta/.codex/plugins/cache/openai-primary-runtime/presentations/26.1025.11240/skills/presentations';
const p=Presentation.create({slideSize:{width:1280,height:720}});
const ink='#061A35',green='#0860FF',muted='#536B91',bg='#F1F7FF';
const darkSlides=new WeakSet();
function txt(s,t,x,y,w,h,size=28,color=ink,bold=false){if(darkSlides.has(s)){color=color===ink?'#FFFFFF':color===green?'#67B9FF':'#B6CCE9';}const a=s.shapes.add({geometry:'textbox',position:{left:x,top:y,width:w,height:h},fill:'none',line:{fill:'none',width:0}});a.text=t;a.text.style={fontFamily:'Aptos',fontSize:size,color,bold};return a;}
function slide(title,n){const s=p.slides.add();s.background.fill=bg;if([3,5].includes(n)){s.background.fill='#061A35';darkSlides.add(s);}txt(s,title,64,48,1152,78,44,ink,true);txt(s,String(n).padStart(2,'0'),1160,664,55,30,18,muted);return s;}
async function img(s,f,x,y,w,h){let b=await fs.readFile(root+'/'+f);s.images.add({blob:b.buffer.slice(b.byteOffset,b.byteOffset+b.byteLength),contentType:'image/png',alt:path.basename(f),fit:'contain',position:{left:x,top:y,width:w,height:h}});}
const notes=[];
function note(s,title,time,who,body,sources='README.md; docs/GuiaDePantallas.md'){const t=`${title}\nTiempo: ${time}. Expositor sugerido: ${who}.\n\n${body}\n\nFuentes del proyecto: ${sources}.\nCaso de Juan y cantidades: ejemplo ficticio para la demostración.`;s.speakerNotes.text=t;notes.push(t);}
let s=p.slides.add();
s.background.fill='#F3F8FF';
function shape(geometry,x,y,w,h,fill,line='none',stroke=0){return s.shapes.add({geometry,position:{left:x,top:y,width:w,height:h},fill,line:{fill:line,width:stroke}});}
shape('ellipse',635,-130,850,865,'#E4F0FF');
shape('ellipse',780,-100,740,760,'#BEDBFF');
shape('ellipse',865,98,530,525,'#0860FF');
shape('ellipse',660,350,300,210,'#2284FF');
shape('rect',0,595,1280,2,'#0860FF');
txt(s,'Almacén',52,84,680,127,112,ink,true);
txt(s,'de bolsillo',52,204,680,122,102,green,true);
txt(s,'Presentación del proyecto',56,322,660,58,34,muted,true);
shape('roundRect',63,382,56,8,green);
txt(s,'App móvil multiplataforma desarrollada con',56,403,650,36,22,ink);
txt(s,'React Native + Expo,',56,433,300,37,23,green,true);
txt(s,'compatible con dispositivos móviles.',285,434,415,37,21,muted);
// Circular feature icons and separators, all native editable objects.
for(const x of [62,222,435]) shape('ellipse',x,493,56,56,'#D7E9FF');
for(const x of [200,405]) shape('rect',x,504,1,34,'#ABC7EE');
function mobile(x){shape('roundRect',x,506,18,29,'none',green,2.5);shape('ellipse',x+7,530,4,3,green);shape('rect',x+5,508,8,2,green);}
mobile(81);mobile(454);
for(const y of [507,514,521]){const z=shape('diamond',236,y,28,16,'#D7E9FF',green,2.3);}
txt(s,'100%\nMóvil',127,498,84,52,19,ink);
txt(s,'React Native\n+ Expo',288,498,125,58,19,ink,true);
txt(s,'Compatible\nAndroid e iOS',501,498,190,58,19,ink);
const logoRects=JSON.parse(await fs.readFile(work+'/.build/utn-paths.json','utf8'));
const commands=logoRects.flatMap(([x,y,w,h])=>[{moveTo:{x,y}},{lineTo:{x:x+w,y}},{lineTo:{x:x+w,y:y+h}},{lineTo:{x,y:y+h}},{close:{}}]);
s.shapes.add({geometry:'custom',name:'Logo UTN editable',position:{left:62,top:635,width:200,height:52.5},fill:ink,line:{fill:'none',width:0},customPaths:[{width:263,height:69,commands}]});
shape('rect',289,636,1,47,'#6C87AF');
txt(s,'TECNICATURA UNIVERSITARIA\nEN PROGRAMACIÓN',312,638,390,55,19,muted);
shape('roundRect',913,647,332,45,'#D5E7FF');
txt(s,'Gestión simple para pequeños comercios.',930,657,315,32,17,green);
async function phone(file,x,y,w,h,rotation){let bytes=await fs.readFile(root+'/'+file);const i=s.images.add({blob:bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength),contentType:'image/png',alt:file.includes('dashboard')?'Dashboard real de Almacén de Bolsillo':'Productos reales de Almacén de Bolsillo',fit:'contain',position:{left:x,top:y,width:w,height:h}});i.rotation=rotation;}
await phone('docs/screenshots/almacendb-products-dark-mode.png',972,60,290,565,7);
await phone('docs/screenshots/almacendb-dashboard.png',711,16,325,630,-5);
note(s,'1. Presentación','0:30','Lautaro','Somos Lautaro y Mariano. Desarrollamos Almacén de Bolsillo para organizar la actividad cotidiana de pequeños comercios desde el celular. Para mostrar qué resuelve, vamos a seguir un caso ficticio y recorrer una compra y una venta. La portada contiene textos y formas editables y capturas reales de Dashboard y Productos, insertadas como imágenes independientes que pueden reemplazarse.');

function box(x,y,w,h,fill='#DFECFF'){return shape('roundRect',x,y,w,h,fill);}
function person(x,y,label){shape('ellipse',x+20,y,42,42,green);shape('roundRect',x,y+49,82,70,'#CFE2FF');txt(s,label,x-35,y+130,190,50,25,ink,true);}
function heading(t,n){return slide(t,n);}

s=heading('¿Qué pasó mientras Juan no estaba?',2);
txt(s,'UN COMERCIO, DOS TURNOS',64,139,700,35,18,muted,true);
await img(s,'Presentacion/escena-comercio.png',48,186,760,430);
txt(s,'Empleado',78,615,300,40,24,green,true);
txt(s,'Juan',475,615,300,40,24,green,true);
shape('rect',850,170,3,435,'#C4D9F8');
txt(s,'La información queda\nentre papeles y mensajes',895,170,320,100,32,green,true);
txt(s,'Anotaciones dispersas\nNovedades sin comunicar\nDudas sobre la mercadería',895,302,325,135,24);
txt(s,'Volver a contar. Reconstruir lo ocurrido. Detectar faltantes tarde.',895,460,315,105,25,muted);
txt(s,'¿Qué se vendió?\n¿Cuánto queda?',895,585,315,80,30,ink,true);
txt(s,'Caso ficticio. Una persona atiende en cada turno.',64,665,740,30,18,muted);
s.speakerNotes.text='Fuente: Guion-de-defensa.md, apartado PowerPoint del punto 2. Ilustración ficticia creada con imagegen: un empleado y Juan en momentos diferentes, una persona por turno. Recursos editables: todos los títulos, preguntas y explicaciones. La ilustración se puede reemplazar como imagen independiente.';
s=heading('Una gestión compartida desde el celular',3);
const cols=[64,455,846];
['Anotaciones dispersas','Dudas sobre cuánto queda','Horarios de palabra'].forEach((t,i)=>txt(s,t,cols[i],142,355,58,25,muted));
['Registro e historial\nde ventas','Existencias al registrar\nlas operaciones','Asignación y consulta\nde turnos'].forEach((t,i)=>txt(s,t,cols[i],210,350,90,30,green,true));
await img(s,'docs/screenshots/almacendb-sales.png',130,313,205,270);
await img(s,'docs/screenshots/almacendb-products.png',520,313,205,270);
await img(s,'docs/screenshots/almacendb-timetable-calendar.png',910,313,205,270);
['Consultar qué se vendió durante cada turno','Consultar disponibilidad y orientar la reposición','Saber qué horarios tiene asignados el empleado'].forEach((t,i)=>txt(s,t,cols[i],590,350,86,25,ink,true));
s.speakerNotes.text='Fuente: Guion-de-defensa.md, apartado PowerPoint del punto 3. Mapa de valor en tres recorridos verticales: dificultad, respuesta y utilidad. Capturas reales de ventas, productos y turnos del repositorio. Para Juan y otros comercios de barrio: registros y turnos en una misma herramienta.';
s=heading('Bienvenida y personas',4);
s.speakerNotes.text='Espacio reservado para el video local del punto 4. Guion-de-defensa.md, apartado PowerPoint.';
s=heading('Un día en el comercio',5);
s.speakerNotes.text='Espacio reservado para el video local del punto 5. Guion-de-defensa.md, apartado PowerPoint.';
s=heading('¿Cómo funciona por dentro?',6);
txt(s,'UNA VENTA CONECTA LAS TRES CAPAS',64,138,840,32,18,muted,true);
const steps=[{n:'01',title:'Frontend',sub:'Lo que vemos',tech:'React Native + Expo',action:'El empleado confirma una venta'},{n:'02',title:'Backend',sub:'Procesa las operaciones',tech:'Node.js + Express',action:'El sistema procesa la operación'},{n:'03',title:'Base de datos',sub:'Guarda la información',tech:'PostgreSQL',action:'Guarda venta y nuevas cantidades'}];
steps.forEach((o,i)=>{let y=193+i*123;txt(s,o.n,64,y,90,65,46,green,true);txt(s,o.title,175,y,355,45,31,ink,true);txt(s,o.tech,530,y+7,335,38,23,green);txt(s,o.sub,175,y+45,355,40,24,muted);txt(s,o.action,530,y+49,330,65,23,ink);if(i<2)shape('rect',100,y+70,2,36,'#ACC8F1');});
await img(s,'docs/screenshots/almacendb-sales-new-example1.png',930,158,267,425);
shape('rect',64,573,800,2,'#BED2EF');
txt(s,'Diseño que orienta',64,595,365,42,27,green,true);
txt(s,'Botones que guían. Pantallas consistentes.\nTipografía clara y textos breves.',64,639,450,65,21);
txt(s,'Cuidado de las personas',550,595,400,42,27,green,true);
txt(s,'Comercios de barrio. Autonomía.\nCuidado de los datos.',550,639,430,65,21);
s.speakerNotes.text='Fuente: Guion-de-defensa.md, apartado PowerPoint del punto 6. Recorrer las capas en orden. Prisma se menciona oralmente. Apoyar facilidad de uso en la captura real de nueva venta. Son objetivos de diseño e impacto social, no resultados certificados ni medidos.';
s=heading('Conclusiones y futuro',7);
s.background.fill='#061A35';darkSlides.add(s);
// Set title and pagination to the dark palette after changing this slide theme.
for(const t of s.shapes.items){if(t.geometry==='textbox'){t.text.style={fontFamily:'Aptos',fontSize:t.position.top<100?44:18,color:'#FFFFFF',bold:t.position.top<100};}}
txt(s,'El comercio de Juan,\ncon información reunida',64,145,800,110,43,green,true);
txt(s,'APORTE DEL PROYECTO',64,292,730,35,18,muted,true);
txt(s,'Continuidad entre turnos y gestión desde el celular',64,338,790,75,29,ink,true);
txt(s,'LÍMITES DE LA VERSIÓN ACTUAL',64,438,750,32,18,muted,true);
txt(s,'Sin separación por comercio. Funciones con alcance inicial.\nSin modo de trabajo offline.',64,481,800,86,25);
await img(s,'docs/screenshots/almacendb-dashboard-dark-mode.png',930,150,275,430);
txt(s,'Futura versión',64,598,280,50,30,green,true);
txt(s,'Base propia por comercio y mejora de las funciones actuales',355,598,850,60,25,ink,true);
txt(s,'Escaneo SKU  /  Operaciones sin conexión  /  Productos sin ventas recientes',355,655,860,37,20,muted);
txt(s,'Gracias. ¿Preguntas?',64,657,300,37,24,ink,true);
s.speakerNotes.text='Fuente: Guion-de-defensa.md, apartado PowerPoint del punto 7. Base propia por comercio: propuesta multi tenant futura. Captura real de dashboard oscuro. Recuperar a Juan al cerrar. Diferenciar el aporte del proyecto y el impacto esperado de las mejoras propuestas.';
for(let i=0;i<p.slides.items.length;i++){const b=await p.export({slide:p.slides.items[i],format:'png',scale:1});await fs.writeFile(work+`/.build/slide-${i+1}.png`,new Uint8Array(await b.arrayBuffer()));}
const candidate=work+'/.build/candidate.pptx';await(await PresentationFile.exportPptx(p)).save(candidate);
const {finalizePresentation}=await import(pathToFileURL(skill+'/container_tools/artifact_tool_utils.mjs'));
const result=await finalizePresentation({workspaceDir:work,candidatePath:candidate,finalPath:work+'/Entrega/Almacen-de-Bolsillo-Defensa-v7.pptx',pythonExecutable:runtime+'/python/python.exe',integrityValidatorPath:skill+'/container_tools/inspect_presentation_package_integrity.py',layoutValidatorPath:skill+'/container_tools/inspect_presentation_layout_geometry.py',layoutArgs:['--expected-slide-size-emu','12192000,6858000','--validate-heading-fit'],fontPolicy:{basis:'design',families:['Aptos']},explicitTotalSlideCount:7,verifyArtifactToolImport:true,receiptPath:work+'/.build/validation-v7.json'});console.log(JSON.stringify(result));




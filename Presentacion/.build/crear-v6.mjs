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
person(160,165,'Empleado');person(1000,165,'Juan');
txt(s,'PRIMER TURNO',106,125,250,35,18,muted,true);txt(s,'SIGUIENTE TURNO',940,125,260,35,18,muted,true);
box(435,175,175,102);txt(s,'Cuaderno',453,205,155,40,25,ink,true);
box(643,175,175,102);txt(s,'Mensajes',661,205,155,40,25,ink,true);
txt(s,'Anotaciones dispersas',64,362,350,75,30,green,true);
txt(s,'Novedades sin comunicar',460,362,350,80,30,green,true);
txt(s,'Dudas sobre la mercadería',860,362,350,80,30,green,true);
txt(s,'Volver a contar productos',64,470,355,85,27);
txt(s,'Reconstruir lo ocurrido',460,470,350,85,27);
txt(s,'Detectar faltantes tarde',860,470,350,85,27);
txt(s,'¿Qué se vendió?     ¿Cuánto queda?',64,590,1100,55,35,ink,true);
txt(s,'Caso ficticio: almacén de barrio con una persona atendiendo por turno',64,650,1070,35,19,muted);
s.speakerNotes.text='Fuente: Guion-de-defensa.md, apartado PowerPoint del punto 2. Una persona atiende por turno. Reservar la aplicación para la solución.';
s=heading('De la información dispersa a una gestión compartida',3);
txt(s,'DIFICULTAD',64,140,340,40,20,muted,true);txt(s,'RESPUESTA DE LA APP',450,140,360,40,20,muted,true);txt(s,'UTILIDAD PARA EL COMERCIO',860,140,360,40,20,muted,true);
const yy=[210,340,470];
['Anotaciones dispersas','Dudas sobre cuánto queda','Horarios acordados de palabra'].forEach((t,i)=>txt(s,t,64,yy[i],340,100,28,ink,true));
['Registro e historial de ventas','Existencias actualizadas al registrar operaciones','Asignación y consulta de turnos'].forEach((t,i)=>txt(s,t,450,yy[i],350,115,28,green,true));
['Consultar qué se vendió durante cada turno','Consultar disponibilidad y orientar la reposición','Saber qué horarios tiene asignados el empleado'].forEach((t,i)=>txt(s,t,860,yy[i],350,115,26));
txt(s,'Para Juan y otros comercios de barrio: registros y turnos en una misma herramienta',64,625,1140,60,25,green,true);
s.speakerNotes.text='Fuente: Guion-de-defensa.md, apartado PowerPoint del punto 3. Recorrer las tres relaciones de arriba abajo. La demostración detallada queda para los videos.';
s=heading('Bienvenida y personas',4);
s.background.fill=bg;
s.speakerNotes.text='Espacio reservado para insertar el video local del punto 4. Fuente: Guion-de-defensa.md, apartado PowerPoint. Sin contenido adicional hasta incorporar la grabación.';
s=heading('Un día en el comercio',5);
s.background.fill='#061A35';
s.speakerNotes.text='Espacio reservado para insertar el video local del punto 5. Fuente: Guion-de-defensa.md, apartado PowerPoint. Sin contenido adicional hasta incorporar la grabación.';
s=heading('¿Cómo funciona por dentro?',6);
const xx=[64,340,616];
['Frontend','Backend','Base de datos'].forEach((t,i)=>{box(xx[i],150,245,182);txt(s,t,xx[i]+12,164,225,43,29,green,true);});
txt(s,'Lo que vemos',76,214,220,60,24);txt(s,'React Native + Expo',76,281,225,35,21,muted);
txt(s,'Procesa las operaciones',352,214,220,65,24);txt(s,'Node.js + Express',352,281,225,35,21,muted);
txt(s,'Guarda la información',628,214,220,65,24);txt(s,'PostgreSQL',628,281,225,35,21,muted);
txt(s,'›',306,220,35,55,36,green,true);txt(s,'›',582,220,35,55,36,green,true);
txt(s,'Confirma una venta',64,355,255,70,24,ink,true);txt(s,'Procesa la operación',340,355,255,70,24,ink,true);txt(s,'Guarda venta y nuevas cantidades',616,355,255,90,24,ink,true);
txt(s,'Accesibilidad y facilidad de uso',64,460,800,45,29,green,true);
txt(s,'Botones que guían · Pantallas consistentes\nTipografía clara · Textos breves',64,514,800,85,25);
txt(s,'Ética e impacto social',64,605,800,40,27,green,true);
txt(s,'Comercios de barrio · Autonomía · Cuidado de los datos',64,650,840,35,22);
await img(s,'docs/screenshots/almacendb-sales-new-example1.png',925,155,280,435);
s.speakerNotes.text='Fuente: Guion-de-defensa.md, apartado PowerPoint del punto 6. Recorrer el esquema y el ejemplo de venta de izquierda a derecha. Señalar los botones y textos de la captura. Explicar los objetivos de facilidad de uso e impacto social sin atribuir resultados medidos. Prisma se menciona oralmente. Los detalles técnicos quedan para preguntas.';
s=heading('Conclusiones y futuro',7);
person(73,145,'Juan');
txt(s,'Su comercio, con información reunida',265,180,900,65,35,green,true);
const cx=[64,455,846];
['Impacto','Limitaciones','Futura versión'].forEach((t,i)=>txt(s,t,cx[i],325,350,55,33,green,true));
txt(s,'Información reunida\nContinuidad entre turnos\nGestión desde el celular',64,405,350,160,27);
txt(s,'Sin separación por comercio\nFunciones con alcance inicial\nSin modo de trabajo offline',455,405,350,170,26);
txt(s,'Base propia por comercio\nMejora de funciones actuales',846,405,350,105,26,ink,true);
txt(s,'Escaneo de códigos SKU\nOperaciones sin conexión\nProductos sin ventas recientes',846,525,350,110,23,muted);
txt(s,'Gracias · ¿Preguntas?',64,630,725,65,37,ink,true);
s.speakerNotes.text='Fuente: Guion-de-defensa.md, apartado PowerPoint del punto 7. Base propia por comercio: propuesta multi tenant para una futura versión. Impacto y utilidad como propósitos, sin cifras no medidas. Presentar las mejoras como propuestas. Cerrar con preguntas.';
for(let i=0;i<p.slides.items.length;i++){const b=await p.export({slide:p.slides.items[i],format:'png',scale:1});await fs.writeFile(work+`/.build/slide-${i+1}.png`,new Uint8Array(await b.arrayBuffer()));}
const candidate=work+'/.build/candidate.pptx';await(await PresentationFile.exportPptx(p)).save(candidate);
const {finalizePresentation}=await import(pathToFileURL(skill+'/container_tools/artifact_tool_utils.mjs'));
const result=await finalizePresentation({workspaceDir:work,candidatePath:candidate,finalPath:work+'/Entrega/Almacen-de-Bolsillo-Defensa-v6.pptx',pythonExecutable:runtime+'/python/python.exe',integrityValidatorPath:skill+'/container_tools/inspect_presentation_package_integrity.py',layoutValidatorPath:skill+'/container_tools/inspect_presentation_layout_geometry.py',layoutArgs:['--expected-slide-size-emu','12192000,6858000','--validate-heading-fit'],fontPolicy:{basis:'design',families:['Aptos']},explicitTotalSlideCount:7,verifyArtifactToolImport:true,receiptPath:work+'/.build/validation-v6.json'});console.log(JSON.stringify(result));




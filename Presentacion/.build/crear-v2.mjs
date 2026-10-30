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
await img(s,'Presentacion/portada-referencia.png',0,0,1280,720);
txt(s,'Lautaro Flor Kovinchich  ·  Mariano Belgrano',62,22,750,30,20,ink,true);
note(s,'1. Presentación','0:30','Lautaro','Somos Lautaro y Mariano. Desarrollamos Almacén de Bolsillo para organizar la actividad cotidiana de pequeños comercios desde el celular. Para mostrar qué resuelve, vamos a seguir un caso ficticio y recorrer una compra y una venta. La portada utiliza la imagen de referencia aportada por el usuario: sus pantallas son ilustrativas. Las capturas de las demás diapositivas proceden del proyecto.');
s=slide('El problema y nuestro público',2);
txt(s,'Juan atiende\nun pequeño almacén',64,155,720,135,49,green,true);
txt(s,'Atiende clientes, recibe mercadería\ny comparte tareas con un empleado.',64,315,700,100,30);
txt(s,'¿Qué queda?\n¿Qué se compró y qué se vendió?',64,445,710,110,35,ink,true);
txt(s,'Necesita reunir sus registros y consultar\nla actividad mientras trabaja.',64,570,740,80,27,muted);
await img(s,'docs/screenshots/almacendb-dashboard.png',850,140,310,480);
txt(s,'Caso ficticio del público objetivo',850,628,350,35,19,muted);
note(s,'2. Problema y público objetivo','2:00','Lautaro','Presentar a Juan como un personaje ficticio, no como una persona entrevistada. Describir una jornada: atiende, recibe mercadería y registra ventas mientras su empleado también trabaja. Su dificultad es mantener una visión actualizada de lo que ocurrió. Explicar las tareas, frustraciones y resultados deseados del perfil del cliente. El público objetivo son pequeños comercios que necesitan organizar su operación desde el celular. No afirmar que se validaron ahorros o reducción de errores sin un estudio. Transición: estas necesidades orientaron nuestra propuesta.');
s=slide('Nuestra propuesta de valor',3);
const ys=[190,330,470];
['Registros dispersos','Cantidades desactualizadas','Trabajo compartido'].forEach((t,i)=>txt(s,t,64,ys[i],350,55,29,ink,true));
['Productos y movimientos\nen un mismo sistema','Compras y ventas\nvinculadas al stock','Roles y turnos\nsegún la tarea'].forEach((t,i)=>txt(s,t,460,ys[i],370,100,28,green,true));
['Consultar la actividad','Ver las existencias','Organizar responsabilidades'].forEach((t,i)=>txt(s,t,890,ys[i],320,100,26));
txt(s,'Dificultad',64,130,350,35,20,muted);txt(s,'Respuesta de la aplicación',460,130,380,35,20,muted);txt(s,'Valor esperado',890,130,320,35,20,muted);
note(s,'3. Nuestra solución y mapa de valor','1:00','Lautaro','Explicar cada relación de izquierda a derecha. Para Juan, la compra y la venta modifican las existencias del producto que vamos a seguir. Para otros pequeños comercios, la propuesta es reunir la operación cotidiana y distribuir tareas. Este mapa resume la hipótesis de valor, no demuestra por sí mismo un impacto medido. Transición a Mariano: veamos quiénes usan la aplicación y cómo se organiza su trabajo.');
s=slide('Bienvenida y personas',4);
await img(s,'docs/screenshots/almacendb-login.png',70,160,280,430);
await img(s,'docs/screenshots/almacendb-employees.png',380,160,280,430);
await img(s,'docs/screenshots/almacendb-timetable-calendar.png',690,160,280,430);
txt(s,'Acceso',105,600,240,40,25,green,true);txt(s,'Personas y roles',395,600,280,40,25,green,true);txt(s,'Turnos',765,600,200,40,25,green,true);
txt(s,'Video local\npendiente',1010,285,205,100,27,muted);
note(s,'4. Video: bienvenida y personas','1:30','Mariano','Recorrido de grabación: 0:00 inicio de sesión; 0:10 breve registro del dueño con datos ficticios; 0:25 ingreso y orientación en dashboard; 0:35 cuenta de empleado y selección de rol; 0:55 jornada asignada en varias fechas; 1:15 acceso del empleado y consulta de sus turnos. Explicar que el dueño administra su cuenta y que las opciones visibles cambian según el rol. No convertir el registro en el centro de la demo. Las capturas actuales son un respaldo visual real del proyecto, no una grabación del caso. Transición: ya conocemos a las personas; ahora seguimos la mercadería.');
s=slide('Un día en el comercio',5);
await img(s,'docs/screenshots/almacendb-purchases-new-3-review.png',60,150,275,410);
await img(s,'docs/screenshots/almacendb-sales-new-example1.png',355,150,275,410);
await img(s,'docs/screenshots/almacendb-products.png',650,150,275,410);
txt(s,'Arroz de 1 kg',960,180,260,50,28,green,true);txt(s,'2 iniciales\n+ 10 compradas\n− 3 vendidas',960,255,260,150,30);txt(s,'9 unidades',960,430,270,70,40,green,true);
txt(s,'Caso propuesto para grabar. Las capturas muestran otras operaciones del proyecto.',64,590,1140,50,21,muted);
txt(s,'Video local pendiente',64,648,750,35,20,muted);
note(s,'5. Video: un día en el comercio','4:00','Mariano','0:00 presentar arroz de 1 kg con 2 unidades y mínimo 5. 0:25 mostrar proveedor asociado y registrar una compra de 10 unidades. 1:20 confirmar la compra y consultar 12 unidades. 1:50 registrar una venta de 3 unidades. 2:50 volver al producto y comprobar 9 unidades. 3:15 revisar historial y dashboard. 3:45 cerrar la demostración: la misma operación queda conectada con las existencias y el resumen del negocio. Las cifras son un guion ficticio que debe prepararse antes de grabar. Restaurar el estado inicial antes de repetir. No afirmar que los importes de las capturas corresponden a este ejemplo.');
s=slide('Cómo está construida',6);
txt(s,'Aplicación',64,165,350,52,33,green,true);txt(s,'Expo y React Native\nPantallas y navegación',64,232,350,100,28);
txt(s,'API',455,165,350,52,33,green,true);txt(s,'Node.js y Express\nReglas de la operación',455,232,350,100,28);
txt(s,'Base de datos',845,165,350,52,33,green,true);txt(s,'Prisma y PostgreSQL\nPersistencia y transacciones',845,232,355,100,28);
txt(s,'Contratos TypeScript compartidos entre aplicación y API',64,367,1140,50,28,ink,true);
txt(s,'Consistencia',64,460,340,45,27,green,true);txt(s,'Compras, ventas y stock\ndentro de transacciones',64,516,345,95,25);
txt(s,'Seguridad',455,460,340,45,27,green,true);txt(s,'Hash scrypt con salt\nAutorización API por reforzar',455,516,355,95,25);
txt(s,'Accesibilidad',845,460,350,45,27,green,true);txt(s,'Etiquetas en controles\nTemas claro y oscuro',845,516,350,95,25);
note(s,'6. Arquitectura, accesibilidad y responsabilidad','4:00','Lautaro','Primer minuto: la app presenta información y envía solicitudes a la API; la API aplica la operación y accede a PostgreSQL mediante Prisma. El paquete compartido define contratos TypeScript. Segundo minuto: una compra y una venta incluyen varios cambios relacionados; las transacciones evitan que una parte se guarde y otra no. Tercer minuto: las contraseñas usan scrypt con salt aleatorio y comparación segura. La matriz por roles organiza la interfaz, pero aún debe reforzarse la autorización de cada operación sensible en la API. La versión actual no usa JWT. Cuarto minuto: hay etiquetas accesibles en controles y temas claro y oscuro. Esto no equivale a una auditoría completa de accesibilidad. Proponer evaluación con lectores de pantalla y contraste. Responsabilidad: usar datos ficticios en la demo y no exponer información personal. Repartir esta sección si refleja mejor las responsabilidades reales del equipo.','docs/Stack.md; docs/matriz_permisos_uml_almacen_bolsillo_md_2026.md; backend/src/modules/auth/password.ts; frontend/components/auth/CredentialsForm.tsx');
s=slide('Resultados y futuro',7);
txt(s,'Juan puede consultar\nla actividad de su comercio',64,165,790,110,40,green,true);
txt(s,'Compras y ventas conectadas con el stock\nHistorial de operaciones\nOrganización de empleados y turnos',64,305,760,145,28);
txt(s,'Próximas prioridades',64,475,760,50,31,ink,true);
txt(s,'Autorización en API y pruebas\nEvaluación de accesibilidad con usuarios',64,540,770,90,27,muted);
await img(s,'docs/screenshots/almacendb-dashboard-dark-mode.png',880,145,300,480);
note(s,'7. Resultados y futuro','2:00','Mariano y Lautaro','Mariano, primer minuto: recuperar el caso de Juan y el circuito de arroz. El prototipo conecta registros de compra y venta con las existencias y permite consultar operaciones. También organiza personas y turnos. Lautaro, segundo minuto: reconocer la necesidad de reforzar la autorización en API, evaluar accesibilidad y ampliar pruebas. Los scripts test generales son marcadores, no una suite completa. El ahorro de tiempo y la reducción de errores son beneficios esperados que requieren validación con usuarios. Cierre: desarrollamos una herramienta para que el comerciante pueda consultar y organizar su actividad cotidiana desde el celular. Dar lugar a preguntas.','README.md; docs/Stack.md; docs/matriz_permisos_uml_almacen_bolsillo_md_2026.md');
await fs.writeFile(work+'/Entrega/Guion-de-defensa.md','# Guion de defensa\n\nDuración objetivo: 15 minutos. Reparto sugerido, ajustable a la participación real.\n\n'+notes.join('\n\n---\n\n'));
await fs.writeFile(work+'/Entrega/Preparacion-y-videos.md',`# Preparación y videos\n\n## Estado de la presentación\nLas siete diapositivas y sus notas están preparadas. Las diapositivas 4 y 5 contienen capturas reales como respaldo. No hay videos del recorrido en el repositorio, por lo que todavía no están incrustados.\n\n## Grabación 1: bienvenida y personas\nDuración: 1:30. Seguir los tiempos del guion de la diapositiva 4. Usar datos ficticios para dueño y empleado. Evitar contraseñas reales y notificaciones personales.\n\n## Grabación 2: un día en el comercio\nDuración: 4:00. Preparar arroz de 1 kg con stock inicial 2 y mínimo 5, proveedor asociado, compra 10, venta 3, final 9. Configurar costos y precios válidos antes de grabar. Restaurar los datos antes de repetir. Las capturas actuales no representan esas cantidades.\n\n## Insertar en PowerPoint\n1. Abrir la diapositiva 4 y quitar las capturas y el texto de video pendiente.\n2. Insertar > Vídeo > Este dispositivo. Seleccionar el MP4 de bienvenida, usando Insertar para incrustarlo.\n3. Repetir en la diapositiva 5 con el circuito comercial. Conservar el ejemplo de cantidades solo si no tapa el video.\n4. Elegir reproducción al hacer clic y ajustar el video al espacio disponible sin deformarlo.\n5. Guardar, cerrar, desconectar internet y probar ambos videos en el equipo de exposición.\n6. Llevar los MP4 originales y capturas por separado como respaldo.\n\n## Ensayo\nCronometrar 15 minutos: 0:30 + 2:00 + 1:00 + 1:30 + 4:00 + 4:00 + 2:00. Ambos integrantes deben hablar. Evitar leer las diapositivas. Ensayar el pase de palabra y quién controla la reproducción.\n\n## Preguntas previsibles\n- ¿Por qué móvil? Facilita consultar la gestión desde el celular. Es una decisión de diseño, no un resultado medido de adopción.\n- ¿Cómo evitan un stock parcialmente actualizado? Mediante transacciones para cambios relacionados.\n- ¿Los permisos son completos? La interfaz usa una matriz compartida; falta reforzar autorización en la API.\n- ¿Funciona sin internet? El video incrustado sí. No afirmar que la aplicación dispone de operación sin conexión.\n- ¿Qué validaron con usuarios? Diferenciar pruebas realmente realizadas de las evaluaciones futuras. Juan es ficticia.\n- ¿Qué queda pendiente? Autorización API, evaluación de accesibilidad y ampliación de pruebas.\n\n## Fuentes\nREADME.md, docs/Stack.md, docs/GuiaDePantallas.md y matriz de permisos del proyecto. Guías PF aportadas por el usuario.\n`);
for(let i=0;i<p.slides.items.length;i++){const b=await p.export({slide:p.slides.items[i],format:'png',scale:1});await fs.writeFile(work+`/.build/slide-${i+1}.png`,new Uint8Array(await b.arrayBuffer()));}
const candidate=work+'/.build/candidate.pptx';await(await PresentationFile.exportPptx(p)).save(candidate);
const {finalizePresentation}=await import(pathToFileURL(skill+'/container_tools/artifact_tool_utils.mjs'));
const result=await finalizePresentation({workspaceDir:work,candidatePath:candidate,finalPath:work+'/Entrega/Almacen-de-Bolsillo-Defensa-v2.pptx',pythonExecutable:runtime+'/python/python.exe',integrityValidatorPath:skill+'/container_tools/inspect_presentation_package_integrity.py',layoutValidatorPath:skill+'/container_tools/inspect_presentation_layout_geometry.py',layoutArgs:['--expected-slide-size-emu','12192000,6858000','--validate-heading-fit'],fontPolicy:{basis:'design',families:['Aptos']},explicitTotalSlideCount:7,verifyArtifactToolImport:true,receiptPath:work+'/.build/validation-v2.json'});console.log(JSON.stringify(result));



from pathlib import Path
root=Path(__file__).resolve().parents[1]
s=(root/'.build/crear-v6.mjs').read_text(encoding='utf-8-sig')
a=s.index("s=heading('¿Qué pasó mientras Juan no estaba?',2);")
b=s.index('for(let i=0;i<p.slides.items.length;i++)',a)
s=s[:a]+'''
s=heading('¿Qué pasó mientras Juan no estaba?',2);
txt(s,'UN COMERCIO, DOS TURNOS',64,139,700,35,18,muted,true);
await img(s,'Presentacion/escena-comercio.png',48,186,760,430);
txt(s,'Empleado',78,615,300,40,24,green,true);
txt(s,'Juan',475,615,300,40,24,green,true);
shape('rect',850,170,3,435,'#C4D9F8');
txt(s,'La información queda\\nentre papeles y mensajes',895,170,320,100,32,green,true);
txt(s,'Anotaciones dispersas\\nNovedades sin comunicar\\nDudas sobre la mercadería',895,302,325,135,24);
txt(s,'Volver a contar. Reconstruir lo ocurrido. Detectar faltantes tarde.',895,460,315,105,25,muted);
txt(s,'¿Qué se vendió?\\n¿Cuánto queda?',895,585,315,80,30,ink,true);
txt(s,'Caso ficticio. Una persona atiende en cada turno.',64,665,740,30,18,muted);
s.speakerNotes.text='Fuente: Guion-de-defensa.md, apartado PowerPoint del punto 2. Ilustración ficticia creada con imagegen: un empleado y Juan en momentos diferentes, una persona por turno. Recursos editables: todos los títulos, preguntas y explicaciones. La ilustración se puede reemplazar como imagen independiente.';
s=heading('Una gestión compartida desde el celular',3);
const cols=[64,455,846];
['Anotaciones dispersas','Dudas sobre cuánto queda','Horarios de palabra'].forEach((t,i)=>txt(s,t,cols[i],142,355,58,25,muted));
['Registro e historial\\nde ventas','Existencias al registrar\\nlas operaciones','Asignación y consulta\\nde turnos'].forEach((t,i)=>txt(s,t,cols[i],210,350,90,30,green,true));
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
txt(s,'Botones que guían. Pantallas consistentes.\\nTipografía clara y textos breves.',64,639,450,65,21);
txt(s,'Cuidado de las personas',550,595,400,42,27,green,true);
txt(s,'Comercios de barrio. Autonomía.\\nCuidado de los datos.',550,639,430,65,21);
s.speakerNotes.text='Fuente: Guion-de-defensa.md, apartado PowerPoint del punto 6. Recorrer las capas en orden. Prisma se menciona oralmente. Apoyar facilidad de uso en la captura real de nueva venta. Son objetivos de diseño e impacto social, no resultados certificados ni medidos.';
s=heading('Conclusiones y futuro',7);
s.background.fill='#061A35';darkSlides.add(s);
// Set title and pagination to the dark palette after changing this slide theme.
for(const t of s.shapes.items){if(t.geometry==='textbox'){t.text.style={fontFamily:'Aptos',fontSize:t.position.top<100?44:18,color:'#FFFFFF',bold:t.position.top<100};}}
txt(s,'El comercio de Juan,\\ncon información reunida',64,145,800,110,43,green,true);
txt(s,'APORTE DEL PROYECTO',64,292,730,35,18,muted,true);
txt(s,'Continuidad entre turnos y gestión desde el celular',64,338,790,75,29,ink,true);
txt(s,'LÍMITES DE LA VERSIÓN ACTUAL',64,438,750,32,18,muted,true);
txt(s,'Sin separación por comercio. Funciones con alcance inicial.\\nSin modo de trabajo offline.',64,481,800,86,25);
await img(s,'docs/screenshots/almacendb-dashboard-dark-mode.png',930,150,275,430);
txt(s,'Futura versión',64,598,280,50,30,green,true);
txt(s,'Base propia por comercio y mejora de las funciones actuales',355,598,850,60,25,ink,true);
txt(s,'Escaneo SKU  /  Operaciones sin conexión  /  Productos sin ventas recientes',355,655,860,37,20,muted);
txt(s,'Gracias. ¿Preguntas?',64,657,300,37,24,ink,true);
s.speakerNotes.text='Fuente: Guion-de-defensa.md, apartado PowerPoint del punto 7. Base propia por comercio: propuesta multi tenant futura. Captura real de dashboard oscuro. Recuperar a Juan al cerrar. Diferenciar el aporte del proyecto y el impacto esperado de las mejoras propuestas.';
''' +s[b:]
s=s.replace('Defensa-v6.pptx','Defensa-v7.pptx').replace('validation-v6.json','validation-v7.json')
(root/'.build/crear-v7.mjs').write_text(s,encoding='utf-8')

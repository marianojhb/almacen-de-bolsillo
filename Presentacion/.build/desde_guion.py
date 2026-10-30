from pathlib import Path
root=Path(__file__).resolve().parents[1]
s=(root/'.build/crear-v5.mjs').read_text(encoding='utf-8-sig')
a=s.index("s=slide('El problema y nuestro público',2);")
b=s.index('for(let i=0;i<p.slides.items.length;i++)',a)
s=s[:a]+'''
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
txt(s,'Botones que guían · Pantallas consistentes\\nTipografía clara · Textos breves',64,514,800,85,25);
txt(s,'Ética e impacto social',64,605,800,40,27,green,true);
txt(s,'Comercios de barrio · Autonomía · Cuidado de los datos',64,650,840,35,22);
await img(s,'docs/screenshots/almacendb-sales-new-example1.png',925,155,280,435);
s.speakerNotes.text='Fuente: Guion-de-defensa.md, apartado PowerPoint del punto 6. Recorrer el esquema y el ejemplo de venta de izquierda a derecha. Señalar los botones y textos de la captura. Explicar los objetivos de facilidad de uso e impacto social sin atribuir resultados medidos. Prisma se menciona oralmente. Los detalles técnicos quedan para preguntas.';
s=heading('Conclusiones y futuro',7);
person(73,145,'Juan');
txt(s,'Su comercio, con información reunida',265,180,900,65,35,green,true);
const cx=[64,455,846];
['Impacto','Limitaciones','Futura versión'].forEach((t,i)=>txt(s,t,cx[i],325,350,55,33,green,true));
txt(s,'Información reunida\\nContinuidad entre turnos\\nGestión desde el celular',64,405,350,160,27);
txt(s,'Sin separación por comercio\\nFunciones con alcance inicial\\nSin modo de trabajo offline',455,405,350,170,26);
txt(s,'Base propia por comercio\\nMejora de funciones actuales',846,405,350,105,26,ink,true);
txt(s,'Escaneo de códigos SKU\\nOperaciones sin conexión\\nProductos sin ventas recientes',846,525,350,110,23,muted);
txt(s,'Gracias · ¿Preguntas?',64,630,725,65,37,ink,true);
s.speakerNotes.text='Fuente: Guion-de-defensa.md, apartado PowerPoint del punto 7. Base propia por comercio: propuesta multi tenant para una futura versión. Impacto y utilidad como propósitos, sin cifras no medidas. Presentar las mejoras como propuestas. Cerrar con preguntas.';
''' +s[b:]
s=s.replace('Defensa-v5.pptx','Defensa-v6.pptx').replace('validation-v5.json','validation-v6.json')
(root/'.build/crear-v6.mjs').write_text(s,encoding='utf-8')

from pathlib import Path
p=Path(__file__).with_name('crear.mjs')
s=p.read_text(encoding='utf-8-sig')
s=s.replace('Laura','Juan').replace('a una persona entrevistada','a una persona entrevistada')
s=s.replace("const ink='#142C35',green='#087F70',muted='#52656D',bg='#F7FAF9';","const ink='#061A35',green='#0860FF',muted='#536B91',bg='#F1F7FF';\nconst darkSlides=new WeakSet();")
s=s.replace("function txt(s,t,x,y,w,h,size=28,color=ink,bold=false){", "function txt(s,t,x,y,w,h,size=28,color=ink,bold=false){if(darkSlides.has(s)){color=color===ink?'#FFFFFF':color===green?'#67B9FF':'#B6CCE9';}")
s=s.replace("s.background.fill=bg;txt(s,title", "s.background.fill=bg;if([3,5].includes(n)){s.background.fill='#061A35';darkSlides.add(s);}txt(s,title")
a=s.index("let s=slide('Almacén de Bolsillo',1);")
b=s.index("note(s,'1. Presentación'",a)
s=s[:a]+"""let s=p.slides.add();
await img(s,'Presentacion/portada-referencia.png',0,0,1280,720);
txt(s,'Lautaro Flor Kovinchich  ·  Mariano Belgrano',62,22,750,30,20,ink,true);
"""+s[b:]
a=s.index("s=slide('El problema y nuestro público',2);")
b=s.index("note(s,'2. Problema",a)
s=s[:a]+"""s=slide('El problema y nuestro público',2);
txt(s,'Juan atiende\\nun pequeño almacén',64,155,720,135,49,green,true);
txt(s,'Atiende clientes, recibe mercadería\\ny comparte tareas con un empleado.',64,315,700,100,30);
txt(s,'¿Qué queda?\\n¿Qué se compró y qué se vendió?',64,445,710,110,35,ink,true);
txt(s,'Necesita reunir sus registros y consultar\\nla actividad mientras trabaja.',64,570,740,80,27,muted);
await img(s,'docs/screenshots/almacendb-dashboard.png',850,140,310,480);
txt(s,'Caso ficticio del público objetivo',850,628,350,35,19,muted);
"""+s[b:]
a=s.index("s=slide('Resultados y futuro',7);")
b=s.index("note(s,'7. Resultados",a)
s=s[:a]+"""s=slide('Resultados y futuro',7);
txt(s,'Juan puede consultar\\nla actividad de su comercio',64,165,790,110,40,green,true);
txt(s,'Compras y ventas conectadas con el stock\\nHistorial de operaciones\\nOrganización de empleados y turnos',64,305,760,145,28);
txt(s,'Próximas prioridades',64,475,760,50,31,ink,true);
txt(s,'Autorización en API y pruebas\\nEvaluación de accesibilidad con usuarios',64,540,770,90,27,muted);
await img(s,'docs/screenshots/almacendb-dashboard-dark-mode.png',880,145,300,480);
"""+s[b:]
s=s.replace("Almacen-de-Bolsillo-Defensa.pptx","Almacen-de-Bolsillo-Defensa-v2.pptx")
s=s.replace("Caso de Juan y cantidades", "Caso de Juan y cantidades")
s=s.replace('Presentar a Juan como un personaje ficticio, no como una persona entrevistada.','Presentar a Juan como un personaje ficticio, no como una persona entrevistada.')
# Keep the seven-slide sequence and add an explicit note about the supplied cover mockup.
s=s.replace("Para mostrar qué resuelve, vamos a seguir un caso ficticio y recorrer una compra y una venta.'", "Para mostrar qué resuelve, vamos a seguir un caso ficticio y recorrer una compra y una venta. La portada utiliza la imagen de referencia aportada por el usuario: sus pantallas son ilustrativas. Las capturas de las demás diapositivas proceden del proyecto.'")
p.with_name('crear-v2.mjs').write_text(s,encoding='utf-8')

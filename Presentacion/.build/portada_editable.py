from pathlib import Path
p=Path(__file__).with_name('crear-v2.mjs')
s=p.read_text(encoding='utf-8-sig')
a=s.index('let s=p.slides.add();')
b=s.index("note(s,'1. Presentación'",a)
s=s[:a]+'''let s=p.slides.add();
s.background.fill='#F3F8FF';
function shape(geometry,x,y,w,h,fill,line='none',stroke=0){return s.shapes.add({geometry,position:{left:x,top:y,width:w,height:h},fill,line:{fill:line,width:stroke}});}
shape('ellipse',760,-170,780,900,'#DCEBFF');
shape('ellipse',930,120,520,530,'#0860FF');
shape('rect',56,375,58,7,'#0860FF');
shape('rect',0,617,1280,2,'#0860FF');
txt(s,'Almacén',52,102,680,126,104,ink,true);
txt(s,'de bolsillo',52,221,680,121,98,green,true);
txt(s,'Presentación del proyecto',58,345,660,54,35,muted,true);
txt(s,'Gestión cotidiana de pequeños comercios\\ndesde el celular',58,416,650,90,29,ink);
txt(s,'React Native + Expo',58,518,610,42,28,green,true);
txt(s,'Lautaro Flor Kovinchich\\nMariano Belgrano',58,565,650,47,18,muted);
txt(s,'UTN',58,641,150,55,44,ink,true);
txt(s,'TECNICATURA UNIVERSITARIA\\nEN PROGRAMACIÓN',225,644,490,55,19,muted);
async function phone(file,x,y,w,h,rotation){let bytes=await fs.readFile(root+'/'+file);const i=s.images.add({blob:bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength),contentType:'image/png',alt:file.includes('dashboard')?'Dashboard real de Almacén de Bolsillo':'Productos reales de Almacén de Bolsillo',fit:'contain',position:{left:x,top:y,width:w,height:h}});i.rotation=rotation;}
await phone('docs/screenshots/almacendb-products-dark-mode.png',975,115,280,530,7);
await phone('docs/screenshots/almacendb-dashboard.png',725,42,310,590,-5);
txt(s,'Dashboard y Productos',825,663,410,35,23,green,true);
''' + s[b:]
s=s.replace('La portada utiliza la imagen de referencia aportada por el usuario: sus pantallas son ilustrativas. Las capturas de las demás diapositivas proceden del proyecto.','La portada contiene textos y formas editables y capturas reales de Dashboard y Productos, insertadas como imágenes independientes que pueden reemplazarse.')
s=s.replace('Almacen-de-Bolsillo-Defensa-v2.pptx','Almacen-de-Bolsillo-Defensa-v3.pptx').replace('validation-v2.json','validation-v3.json')
p.with_name('crear-v3.mjs').write_text(s,encoding='utf-8')

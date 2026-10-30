from pathlib import Path
from PIL import Image
import json
root=Path(__file__).resolve().parents[1]
im=Image.open(r'C:/Users/lauta/AppData/Local/Temp/codex-clipboard-33adada3-cb08-4aa5-94fe-50e50a8307fc.png').convert('RGB')
# Trace only the UTN logo into editable native paths, using the user's reference.
im=im.crop((80,829,343,898))
rects=[]
for y in range(im.height):
    start=None
    for x in range(im.width+1):
        on=x<im.width and max(im.getpixel((x,y)))<130
        if on and start is None: start=x
        if not on and start is not None:
            rects.append([start,y,x-start,1]);start=None
(root/'.build/utn-paths.json').write_text(json.dumps(rects))
p=root/'.build/crear-v4.mjs';s=p.read_text(encoding='utf-8-sig')
a=s.index("shape('ellipse',760")
b=s.index("note(s,'1. Presentación'",a)
s=s[:a]+'''shape('ellipse',635,-130,850,865,'#E4F0FF');
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
txt(s,'100%\\nMóvil',127,498,84,52,19,ink);
txt(s,'React Native\\n+ Expo',288,498,125,58,19,ink,true);
txt(s,'Compatible\\nAndroid e iOS',501,498,190,58,19,ink);
const logoRects=JSON.parse(await fs.readFile(work+'/.build/utn-paths.json','utf8'));
const commands=logoRects.flatMap(([x,y,w,h])=>[{moveTo:{x,y}},{lineTo:{x:x+w,y}},{lineTo:{x:x+w,y:y+h}},{lineTo:{x,y:y+h}},{close:{}}]);
s.shapes.add({geometry:'custom',name:'Logo UTN editable',position:{left:62,top:635,width:200,height:52.5},fill:ink,line:{fill:'none',width:0},customPaths:[{width:263,height:69,commands}]});
shape('rect',289,636,1,47,'#6C87AF');
txt(s,'TECNICATURA UNIVERSITARIA\\nEN PROGRAMACIÓN',312,638,390,55,19,muted);
shape('roundRect',913,647,332,45,'#D5E7FF');
txt(s,'Gestión simple para pequeños comercios.',930,657,315,32,17,green);
async function phone(file,x,y,w,h,rotation){let bytes=await fs.readFile(root+'/'+file);const i=s.images.add({blob:bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength),contentType:'image/png',alt:file.includes('dashboard')?'Dashboard real de Almacén de Bolsillo':'Productos reales de Almacén de Bolsillo',fit:'contain',position:{left:x,top:y,width:w,height:h}});i.rotation=rotation;}
await phone('docs/screenshots/almacendb-products-dark-mode.png',972,60,290,565,7);
await phone('docs/screenshots/almacendb-dashboard.png',711,16,325,630,-5);
''' + s[b:]
s=s.replace('Defensa-v4.pptx','Defensa-v5.pptx').replace('validation-v4.json','validation-v5.json')
(root/'.build/crear-v5.mjs').write_text(s,encoding='utf-8')

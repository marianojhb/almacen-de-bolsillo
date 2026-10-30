from pathlib import Path
p=Path(__file__).with_name('crear.mjs');s=p.read_text(encoding='utf-8')
s=s.replace("shape('roundRect',x,y,w,h,fill,'none',false);", "shape('roundRect',x,y,w,h,fill,'none',false);")
s=s.replace("w-20,h-6,26,'#FFFFFF'","w-20,h-6,h>50?21:26,'#FFFFFF'")
s=s.replace("await vector('papers',519,181,397,419);","await vector('papers',519,181,397,419);shape('rect',849,529,68,71,'#F9F9F4');")
s=s.replace("text('Novedades\\nsin comunicar',398,500,150,58,21", "text('Novedades\\nsin comunicar',398,500,150,58,20")
s=s.replace("await vector('v'+i+j,xs[j]+18,ys[i]+12,150,101);text(ts[i][j],xs[j]+188,ys[i]+24,157,96,21", "await vector('v'+i+j,xs[j]+18,ys[i]+12,150,101);if(j===2)shape('rect',xs[j]+166,ys[i]+8,180,105,'#FAFAF6');text(ts[i][j],xs[j]+(j===2?175:188),ys[i]+19,j===2?172:157,98,20")
s=s.replace("page(5);grid();", "page(5);for(const x of [444,688,932])line(x,0,0,774,'#DDD9CD',0.8);for(const y of [250,384,627])line(0,y,1376,0,'#DDD9CD',0.8);")
s=s.replace("130,464,1130,57,40","130,459,1130,57,40")
s=s.replace("126,21,1150,139,119","126,10,1150,139,119")
s=s.replace("text('Expositores:',183,566,200,45,32","text('Expositores:',183,566,188,45,32").replace("text('Mariano y Lautaro',377,566","text('Mariano y Lautaro',385,566")
s=s.replace("480,76,25","480,76,23").replace("470,76,24","470,76,22")
s=s.replace("xs[j]+166,ys[i]+8,180,105","xs[j]+145,ys[i]+8,200,105")
# Remove the malformed glyph produced by the source font, keeping the visible credit.
start=s.index("text('");end=s.index("',1268,751",start)
if end-start<150:s=s[:start]+"text('Gemini Notebook"+s[end:]
p.with_name('crear-ajustado.mjs').write_text(s,encoding='utf-8')

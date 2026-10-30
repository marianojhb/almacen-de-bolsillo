from PIL import Image
from pathlib import Path
import json
out=Path(__file__).parent
items={
 'phones':(1,(740,20,1360,715),0.85,96),
 'logo':(1,(548,470,714,626),1,48),
 'employee':(2,(92,269,313,486),1,48),
 'juan':(2,(1076,268,1295,487),1,48),
 'cart':(3,(88,266,161,335),1,32),
 'box':(3,(88,384,163,454),1,32),
 'calendar':(3,(90,503,164,577),1,32),
 'mobile':(6,(210,160,258,232),1,24),
 'server':(6,(645,160,728,234),1,24),
 'database':(6,(1113,161,1173,234),1,24),
 'appearance':(6,(456,537,660,712),1,48),
 'impact':(7,(210,160,300,249),1,32),
 'limits':(7,(638,158,735,250),1,32),
 'rocket':(7,(1062,157,1173,248),1,32),
}
for name,(n,crop,scale,colors) in items.items():
 im=Image.open(out/f'image{n}.png').convert('RGB').crop(crop)
 im=im.resize((int(im.width*scale),int(im.height*scale)))
 q=im.quantize(colors=colors);pal=q.getpalette(); w,h=q.size
 active={}; rects=[]
 for y in range(h):
  row=[q.getpixel((x,y)) for x in range(w)];runs=[];x=0
  while x<w:
   c=row[x];end=x+1
   while end<w and row[end]==c:end+=1
   runs.append((x,end,c));x=end
  new={}
  for run in runs:
   if run in active:new[run]=active.pop(run)
   else:new[run]=[run[0],y,run[1]-run[0],1,run[2]]
  for r in new.values():r[3]=y-r[1]+1
  rects.extend(active.values());active=new
 rects.extend(active.values())
 grouped={}
 for x,y,rw,rh,c in rects:
  color='#'+''.join(f'{v:02x}' for v in pal[c*3:c*3+3])
  grouped.setdefault(color,[]).append([x,y,rw,rh])
 (out/f'{name}.json').write_text(json.dumps({'w':w,'h':h,'colors':grouped}))
 print(name,len(rects))

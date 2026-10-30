exec(__import__('pathlib').Path(__file__).with_name('vectorizar.py').read_text().split('for name,')[0])
import numpy as np
from PIL import ImageFilter
for name,(n,crop,scale,colors) in items.items():
 im=Image.open(out/f'image{n}.png').convert('RGB').crop(crop)
 scale=0.65 if name=='phones' else scale
 colors=40 if name=='phones' else min(colors,32)
 im=im.resize((int(im.width*scale),int(im.height*scale))).filter(ImageFilter.MedianFilter(3))
 q=im.quantize(colors=colors,dither=Image.Dither.NONE);pal=q.getpalette();a=np.array(q);h,w=a.shape
 grouped={}
 for c in np.unique(a):
  mask=a==c;pad=np.pad(mask,1)
  edges={}
  def edge(x,y,xx,yy):edges.setdefault((int(x),int(y)),[]).append((int(xx),int(yy)))
  for y,x in zip(*np.where(mask & ~pad[:-2,1:-1])):edge(x,y,x+1,y)
  for y,x in zip(*np.where(mask & ~pad[1:-1,2:])):edge(x+1,y,x+1,y+1)
  for y,x in zip(*np.where(mask & ~pad[2:,1:-1])):edge(x+1,y+1,x,y+1)
  for y,x in zip(*np.where(mask & ~pad[1:-1,:-2])):edge(x,y+1,x,y)
  paths=[]
  while edges:
   start=next(iter(edges));points=[start];cur=start
   while True:
    opts=edges[cur];nxt=opts.pop()
    if not opts:del edges[cur]
    if nxt==start:break
    points.append(nxt);cur=nxt
   # Remove intermediate points on straight boundary segments.
   simple=[]
   for i,pt in enumerate(points):
    prev=points[i-1];nex=points[(i+1)%len(points)]
    if (pt[0]-prev[0])*(nex[1]-pt[1]) != (pt[1]-prev[1])*(nex[0]-pt[0]):simple.append(pt)
   if len(simple)>=3:paths.append(simple)
  color='#'+''.join(f'{v:02x}' for v in pal[int(c)*3:int(c)*3+3]);grouped[color]=paths
 (out/f'{name}.json').write_text(json.dumps({'w':w,'h':h,'paths':grouped}))
 print(name,sum(len(v) for v in grouped.values()))

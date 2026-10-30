from pathlib import Path
from PIL import Image,ImageFilter
import numpy as np,json
out=Path(__file__).parent
items={
 'logo':(1,(537,167,838,456),1,64),
 'turno1':(2,(101,289,361,509),1,40),
 'papers':(2,(519,181,916,600),1,48),
 'turno2':(2,(1059,264,1251,550),1,40),
 'phone4':(4,(373,196,602,677),1,64),
 'dashboard':(5,(96,152,324,621),1,64),
 'profit':(5,(1053,152,1284,621),1,64),
 'sales':(6,(565,516,801,768),1,48),
 'logo7':(7,(52,547,294,768),1,48),
 'front':(6,(84,173,131,245),1,24),
 'back':(6,(532,173,599,243),1,24),
 'db':(6,(986,173,1040,243),1,24),
 'check':(7,(81,191,159,267),1,24),
 'warning':(7,(506,191,586,267),1,24),
 'rocket':(7,(931,189,1010,267),1,24),
}
for i in range(3):
 for j in range(3):
  x=[95,539,976][j];y=[248,379,507][i]
  items[f'v{i}{j}']=(3,(x,y,x+150,y+101),1,32)
# Reuse the contour conversion routine; keep all artwork as native PowerPoint paths.
old=out.parents[1]/'ReplicaEditable/.build/contornos.py'
code=old.read_text();code=code[code.index('\nfor name,')+1:]
code=code.replace("scale=0.65 if name=='phones' else scale", "scale=0.65 if name in ['papers','turno1','turno2'] else 0.85")
code=code.replace("min(colors,32)","min(colors,24)")
exec(code)

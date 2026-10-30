from pathlib import Path
p=Path(__file__).with_name('crear.mjs');s=p.read_text()
a=s.index('async function vector(');b=s.index('function card(',a)
s=s[:a]+'''async function vector(name,x,y,w,h){let d=JSON.parse(await fs.readFile(work+'/.build/'+name+'.json','utf8'));for(const [color,paths]of Object.entries(d.paths)){const commands=paths.flatMap(pts=>[M(...pts[0]),...pts.slice(1).map(pt=>L(...pt)),Z()]);s.shapes.add({geometry:'custom',name:`${name} vector ${color}`,position:{left:x,top:y,width:w,height:h},fill:color,line:{fill:'none',width:0},customPaths:[{width:d.w,height:d.h,commands}]});}}
''' +s[b:]
s=s.replace("insets:0,lineSpacing:1.05","insets:0,lineSpacing:1.05,wrap:'none'")
s=s.replace("690,150,138","710,150,126")
s=s.replace("i===0?29:27","i===0?29:24")
s=s.replace("347,35,22","347,35,21").replace("300,39,23","300,39,21")
s=s.replace("await vector('phones',740,20,620,695);","shape('rect',740,20,620,695,'#DEE1E4');shape('roundRect',770,45,280,623,'#FFFFFF','none',0,-3);shape('roundRect',1035,72,300,588,'#06172D','none',0,6);await vector('phones',740,20,620,695);")
# Keep every visible text item editable. Backgrounds and artwork are separate paths.
s=s.replace("text('• Volver a contar productos'","text('• Volver a contar productos'")
p.with_name('crear-ajustado.mjs').write_text(s)

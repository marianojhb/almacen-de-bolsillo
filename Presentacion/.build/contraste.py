from pathlib import Path
p=Path(__file__).with_name('crear-v7.mjs')
s=p.read_text(encoding='utf-8').replace('Defensa-v7.pptx','Defensa-v8.pptx').replace('validation-v7.json','validation-v8.json')
s=s.replace('// Set title and pagination',"txt(s,'Conclusiones y futuro',64,48,1152,78,44,'#FFFFFF',true);\n// Set title and pagination")
p.with_name('crear-v8.mjs').write_text(s,encoding='utf-8')

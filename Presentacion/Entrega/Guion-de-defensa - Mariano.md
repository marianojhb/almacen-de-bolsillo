# Mariano

## Guion de defensa - Explicacion Guion

Duración objetivo: 15 minutos. Reparto: Lautaro, secciones 2, 4 y 7; Mariano, secciones 1, 3 y 5; sección 6 compartida.

### 1. Presentación - Tiempo: 0:30. Expositor: Mariano.

**Explicación del guion**

Mariano saluda, presenta a ambos integrantes y enmarca Almacén de Bolsillo como su proyecto final. Explica en una frase para quién está pensada la aplicación y qué permite hacer. Anticipa que la exposición seguirá un caso ficticio para mostrar su funcionamiento y le da la palabra a Lautaro para presentar el problema. Mantener la portada visible durante esta apertura y reservar los detalles de las funciones para las siguientes secciones.

---

### 3. Nuestra solución y mapa de valor - Tiempo: 1:00. Expositor: Mariano.

**Explicación del guion**

Mariano retoma las dificultades del punto 2 y presenta Almacén de Bolsillo como la propuesta para abordarlas. Relacionar cada problema con una función y su utilidad: anotaciones dispersas con registro e historial de ventas; dudas sobre la mercadería disponible con actualización de existencias al confirmar una venta y consulta de productos; coordinación de palabra con asignación y consulta de turnos del empleado.

Aplicar estas relaciones al caso de Juan: el empleado registra las ventas durante su turno y Juan puede consultar lo registrado desde su celular cuando está fuera del local o al retomar la atención. Las existencias reflejan las operaciones cargadas; su precisión depende de que se registren los movimientos. La aplicación permite consultar los turnos asignados, pero no suponer avisos automáticos ni un registro de todas las novedades del comercio.

Ampliar la propuesta a otros kioscos y almacenes de barrio cuyos dueños se alternan con empleados: reunir los registros de la operación y la organización de turnos en una misma herramienta. El mapa de valor expresa cómo se busca responder a esas necesidades; el ahorro de tiempo y la reducción de errores requieren validación con usuarios. Dar paso a Lautaro para iniciar el recorrido de personas y turnos.

---

### 5. Video: un día en el comercio - Tiempo: 4:00. Expositor: Mariano.

**Explicación del guion**

Crear un proveedor:

- Distribuidora Pacheco SRL
- CUIT 30112223334

Creo un producto y le asigno 2 proveedores: 

- Hamburguesas PATY 4 Uni
- Caja de Hamburguesas Paty x 4 unidades 80 gr clásicas
$9600
- minimo 10 unidades

Compro el producto:
- 30 cajas ($4800 x 30 = $144.000)

Vendo 15 unidades 

Usuario Owner:
- Manolo
- manolo@gmail.com
- 123


---

### 6. Cómo funciona la aplicación: tecnologías, accesibilidad e impacto social - Tiempo: hasta 4:00. Expositores: Lautaro y Mariano.

**Explicación del guion**

Explicar la aplicación a un público sin conocimientos técnicos mediante tres capas: frontend, backend y base de datos. Presentar primero qué hace cada una y después mencionar las tecnologías principales, sin enumerar librerías ni versiones.

- Frontend: lo que el usuario ve y utiliza en el celular. React Native y Expo son las herramientas con las que construimos esas pantallas.
- Backend: la parte que recibe lo que pide el usuario y procesa las operaciones. Está desarrollado con Node.js y Express.
- Base de datos: donde se guarda la información del comercio. Usamos PostgreSQL; Prisma es la herramienta que utiliza el backend para trabajar con esos datos.

Conectar las tres capas con una venta: el empleado selecciona los productos en la pantalla, el backend procesa la venta y la base de datos guarda la operación y los cambios de existencias. Aclarar que la cantidad disponible se actualiza a partir de las operaciones registradas.

Mencionar brevemente TypeScript como el lenguaje utilizado para programar y detectar ciertos errores durante el desarrollo, el cuidado de las contraseñas y las opciones según el rol. Los detalles de herramientas, compilaciones y organización del código quedan para las preguntas si el público los solicita.

----

## Guion de defensa - Texto a narrar

Duración objetivo: 15 minutos. Reparto: Lautaro, secciones 2, 4 y 7; Mariano, secciones 1, 3 y 5; sección 6 compartida.

### 1. Presentación - Tiempo: 0:30. Expositor: Mariano.

“Hola, somos Mariano y Lautaro, y hoy presentamos nuestro proyecto final: Almacén de Bolsillo, una aplicación para que pequeños comerciantes puedan organizar su negocio desde el celular.

Para mostrar cómo funciona, vamos a seguir el caso ficticio de Juan y recorrer algunas situaciones de su comercio, desde recibir mercadería hasta registrar una venta.

Lautaro les va a contar qué dificultades buscamos resolver.”

---

### 2. Problema y público objetivo - Tiempo: 2:00. Expositor: Lautaro.

**Presenta — Lautaro**

Hablar despues de “A partir de este problema, Mariano va a presentar nuestra propuesta.”

---

### 3. Nuestra solución y mapa de valor - Tiempo: 1:00. Expositor: Mariano.

“Para abordar estas dificultades desarrollamos Almacén de Bolsillo.

Frente a las anotaciones dispersas, la aplicación permite registrar las ventas y consultar su historial. Así, Juan puede revisar qué se vendió durante su ausencia desde el celular.

Al confirmar una venta, se actualizan las existencias de los productos. Esto le permite consultar cuánto queda según los movimientos registrados y orientar la reposición.

Para organizar los horarios, Juan puede asignar turnos a su empleado, y este puede consultarlos en la aplicación.

La propuesta para Juan y otros comerciantes de barrio es reunir esa información en un mismo lugar y facilitar la continuidad entre quienes se turnan para atender.

Ahora Lautaro va a mostrar cómo se organizan las personas y los turnos dentro de la aplicación.”

---

### 4. Video: bienvenida y personas - Tiempo: 1:30. Expositor: Lautaro.

**Presenta Lautaro**

---

### 5. Video: un día en el comercio - Tiempo: 4:00. Expositor: Mariano.

**Narrar video**

---

### 6. Cómo funciona la aplicación: tecnologías, accesibilidad e impacto social - Tiempo: hasta 4:00. Expositores: Lautaro y Mariano. 

Comienza Mariano

“Para explicar cómo funciona la aplicación, podemos pensarla en tres capas: lo que vemos, lo que procesa las operaciones y lo que guarda la información.

La primera es el frontend: las pantallas que usan Juan y su empleado en el celular. Desde ahí pueden elegir productos, registrar una venta o consultar un turno. Para construir esa parte usamos React Native y Expo.

La segunda es el backend. Es la parte que recibe esas acciones y procesa lo que tiene que hacer el sistema. La desarrollamos con Node.js y Express.

La tercera es la base de datos, donde se guarda la información del comercio: productos, ventas, empleados y turnos. Usamos PostgreSQL y una herramienta llamada Prisma para que el backend trabaje con esos datos.

Veamos cómo se conectan con un ejemplo. El empleado selecciona los productos y confirma una venta en la pantalla. El backend procesa esa operación y guarda en la base de datos tanto la venta como el cambio en las cantidades disponibles. Después, Juan puede consultar lo registrado desde su celular.

Estos cambios se guardan juntos: si ocurre un error durante ese guardado, se revierten para evitar que la venta quede registrada a medias.

Para programar usamos TypeScript, que nos ayuda a detectar ciertos errores mientras desarrollamos.

En cuanto al diseño, buscamos que Juan y su empleado puedan orientarse aunque tengan poca experiencia con este tipo de herramientas. Los botones indican las acciones disponibles y guían el recorrido paso a paso. Las pantallas mantienen un mismo estilo, para que lo aprendido en una también sirva al pasar a otra.

La tipografía clara y los textos breves buscan facilitar la lectura y mostrar de forma directa qué hay que hacer. Así, al registrar una venta, la atención puede centrarse en elegir los productos y confirmar la operación. Estas decisiones buscan facilitar el uso cotidiano, y queremos seguir evaluándolas con usuarios."








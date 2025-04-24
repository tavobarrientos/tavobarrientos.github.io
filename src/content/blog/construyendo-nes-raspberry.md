---
title: 'Construyendo una NES con Raspberry Pi'
description: 'Lorem ipsum dolor sit amet'
pubDate: 'Nov 04 2015'
heroImage: '/blog/running_emulators_xcode.png'
hidden: false
---

Siempre he sido un gamer, desde pequeño, por lo que este articulo me causa cierta nostalgía, ya que el NES fue mi primer consola y de hecho, gracias a los videojuegos,
me aventure en el mundo de la Programación, al querer aprender como se programa un videojuego.

Hace aproximadamente unos 4 meses, adquirí via [Mercado Libre](http://www.mercadolibre.com.mx) un par de consolas, las cuales una estaba descompuesta y la otra estaba en
funcionamiento, solamente con una falla en el aditamento para sostener el cartucho dentro de la consola, lo cual repare con el mecanismo de la consola muerta.

Actualmente existen muchas plataformas como [Raspberry Pi](http://www.raspberrypi.org), [BeagleBone](http://www.beagleboard.org/black), [Banana Pi](http://www.banana-pi.com),
todas estas son plataformas de computo tan pequeñas como una tarjeta de credito y pueden correr sistemas operativos como Android y distintas distribuciones de Linux.

Lo que me gusta de la Raspberry es su precio, aunque si bien no es la más barata, tiene mucha comunidad generando proyectos al rededor de ella y por lo tanto, unos foros
muy concurridos, lo que nos permite poder hacer preguntas o hacer una busqueda en google y encontrar soluciones a nuestro problema de una forma rapida, aunque tambien
recomiendo checar la **BeagleBone Black**.

## Requisitos

1. Raspberry Pi, recomiendo una Raspberry 2, por sus caracteristicas superiores, sin embargo, si deseas emular consolas como NES, Atari o Gameboy, con una Mobelo B(en mi caso) es suficiente.
2. Consola NES dañada, reutilizaremos los puertos de los controles, botones de encendido, reset y led, asi como la fuente de poder(Parte 2).
3. Herramientas varias, voltimetro, cautín y estaño, pinzas corta cables, pinzas pela cables, desarmadores de estrella, Termofit o cinta aislante.
4. Cable HDMI de unos 30cm.
5. Cople para HDMI Hembra-Hembra
6. Cable de red y cople de cable de Red a 90 grados.
7. Cables Dupont(jumper) para conexión Hembra-Hembra
8. Tarjeta SD o Micro SD de al menos 8gb.
9. Control de NES

## Iniciando el Proyecto

Para empezar el proyecto, necesitaremos descargar una distribución de Linux compilada especialmente para nuestra Raspberry Pi, esta distribución esta basada en Raspbian,
conteniendo otros añadidos como [RetroArch](https://github.com/libretro/RetroArch) y [EmulationStation](http://emulationstation.org/), que hacen posible la emulación.
Está distribución se llama RetroPie, para descargar iremos a [http://blog.petrockblock.com/retropie/retropie-downloads/](http://blog.petrockblock.com/retropie/retropie-downloads/)
y descargaremos la imagen compatible con nuestra Raspi.
![Descargando RetroPie](/blog/nes/retropie_download.png)
Yo estoy usando **Mac**, por lo cual, es muy fácil, usaremos un App llamada [ApplePi-Baker](http://www.tweaking4all.com/hardware/raspberry-pi/macosx-apple-pi-baker/), esta app flasheara nuestra SD
de una manera muy sencilla, basta con seleccionar el drive destino, la imagen que vamos a flashear, presionar el boton **Restor Backup** y esperar algunos minutos a que se termine el proceso
despues de eso ya pudieramos ponerla en nuestra Raspi y empezar a trabajar con ella.
![ApplePi-Baker](/blog/nes/pi_baker.png)
Si utilizas **Windows** o **Linux**, [puedes seguir las guias disponibles en su Sitio oficial](https://www.raspberrypi.org/documentation/installation/installing-images/).

## ¡A Construir la consola!

No detallare el proceso de desensamblado de la consola, puesto que ya hay mucha documentación acerca del proceso, [pero les dejo un video donde se muestra como desensamblar la consola.](http://www.youtube.com/embed/thVTgCLDoqI)
![NES completamente desensamblada](/blog/nes/2.JPG)
Una vez que ya tenemos la consola en partes, procederemos a identificar los cables de los puertos de los controles, ya que estos los conectaremos directamente a los pines del
**GPIO** de nuestro Raspi, yo use un esquema que encontre en la página de [Gordon's Projects](https://projects.drogon.net/nes-controller-on-the-raspberry-pi/), está en alemán,
asi que ahi les va una traducción rapida:\

- **Weiss** -> Blanco
- **Braun** -> Café
- **Gelb** -> Amarillo
- **Orange** -> Naranja
- **Rot** -> Rojo

![NES Wires](/blog/nes/wires_controller_schematic.png)

Si se fijan, los cables **Morado** y **Azul** no son requeridos, lo ideal seria que los identificaramos y cancelaramos mediante Termofit o cinta aislante, también podemos cortarlos sin ningun problema.

Ya con los cables plenamente identificados, podemos cortar el conector original, en mi caso, yo los solde a unos conectores hembra, para colocarlos directo al **GPIO** de mi Raspi, aunque podemos soldarlos a unos conectores macho
y usar una Protoboard y un Cobler para conectarlo a la Raspi.
![Socket del NES, para su conexión a Raspi](/blog/nes/3.JPG)

## Configurando la Raspberry Pi

Para empezar, tendremos que ocupar toda la tarjeta SD, ya que vamos a necesitar espacio para la instalación de los driver necesarios para hacer funcionar los controles, para eso, tecleamos el siguiente comando:

```bash
sudo raspi-config
```

Esto nos abrira una ventana con fondo azul y seleccionaremos Expand Filesystem y reiniciaremos nuestra Raspi.
![Expandir el Sistema](/blog/nes/expand_filesystem.png)

## Instalando Driver Gamecon_GPIO_Rpi

El Gamecon_GPIO_Rpi es un modulo de Kernel que nos permitira utilizar algunos controles con nuestra Raspi, entre ellos, podemos utilizar controles de NES, SNES, PSX, PS2, N64 y Gamecube,
si bien vamos a poder utilizar estos, nos centraremos con los controles de NES, una vez que los sockets de nuestra consola estan armados, utilizaremos el siguiente diagrama:

![Diagrama de conexión para controles](/blog/nes/gpio_controller_pinout.png)

Recomiendo utilizar los pines **PAD2** y **PAD3** para los dos controles, en concreto el cable Data.

![Cableado del GPIO](/blog/nes/4.JPG)

Una vez conectado todo, instalaremos el driver del control, asi como las dependencias, con los siguientes comandos:

```bash
# Instalando DKMS
sudo apt-get install dkms

# Instalando los Headers de Kernel
wget http://www.niksula.hut.fi/~mhiienka/Rpi/linux-headers-rpi/linux-headers-$(uname -r)_$(uname -r)-2_armhf.deb
sudo dpkg -i linux-headers-$(uname -r)_$(uname -r)-2_armhf.deb
rm linux-headers-$(uname -r)_$(uname -r)-2_armhf.deb

# Instalando el Driver
wget http://www.niksula.hut.fi/~mhiienka/Rpi/gamecon-gpio-rpi-dkms_1.0_all.deb
```

Habiendo ejecutando estos comandos(pueden bajar el Gist y luego ejecutarlo como script de Shell), nuestro Raspberry Pi se va a reiniciar, esto con el fin de que se carguen los modulos,
aunque podemos saltarnos este paso, y ejecutar el siguiente comando:

```bash
sudo modprobe gamecon_gpio_rpi map=0,2,2,0
```

Despues de esto, podemos ver el directorio **/dev/input** nos daremos cuenta que tenemos dos nuevos dispositivos llamados **js0** y **js1**
![Joysticks detectados](/blog/nes/joysticks.png)
Para probar los controles, podemos utilizar estos comandos:

```bash
jstest /dev/input/js0
jstest /dev/input/js1
```

Con estos comandos, podemos manipular nuestros controles, si vemos que los valores se actualizan, entonces podemos dar por sentado que nuestros controles funcionan adecuadamente.

## Fin de la primera parte

Con esto podemos hacer funcionar nuestros controles, en esta guia nos centramos en los controles de NES, sin embargo, el proceso es el mismo si queremos controles de SNES, de hecho,
contienen la misma cantidad de cables(7, se usan solo 5, **VCC, GND, Clock, Latch y Data**), en teoría podriamos reutilizar el proceso solo que la configuración de **gamecon_gpio_rpi** cambiaria,
para lo cual, recomiendo leer el README incluido **/usr/share/doc/gamecon_gpio_rpi/README.gz**

```bash
/usr/share/doc/gamecon_gpio_rpi/README.gz
```

Para la siguiente parte, cubririamos la siguiente parte:

1. Usar un medio externo para guardar las ROMS
2. Montar el Raspberry Pie en el case del NES
3. Uso de los botones de Power y Reset

Espero que esta guía sea de utilidad, espero sus comentarios en mi Twitter: [@tavobarrientos](http://www.twitter.com/tavobarrientos)
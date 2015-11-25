---
layout: post
title:  "Corriendo Emuladores en iOS sin Jailbreak"
date:   2015-11-24 5:47:44
categories: ios emulacion
---

Si bien, iOS es un sistema operativo móvil muy usado, el control que tiene [Apple](http://www.apple.com) sobre su tienda de Apps nos beneficia en gran medida, sin embargo, casos como [un app que robaba cuentas de instagram](http://http://betanews.com/2015/11/11/instaagent-app-steals-usernames-and-passwords-from-instagram-users/) y el mismo [XcodeGhost](http://http://www.macrumors.com/2015/09/20/xcodeghost-chinese-malware-faq/) nos hace plantearnos dudas sobre la seguridad del sistema operativo.

Si bien estos son dos casos aislados que Apple puso cartas en el asunto, no dejan de ser preocupantes, sin embargo este control tambien ha traido que no podamos ejecutar cierto tipo de aplicaciones, las cuales, en Android si tenemos posibilidad, ofreciendose algunas hasta de pago, estamos hablando de los **Emuladores**.
![Emuladores en Google Play](/images/emuladores.png)

# ¿Que emuladores existen para iOS?
Practicamente para cualquier consola, los mas importantes que tenemos son el **GBA4iOS**(Gameboy Color y Advance), **GearBoy**(Gameboy Color), **MAME4iOS**(Arcade), **nds4iOS**(Nintendo DS), **PPSSPP**(PSP) y **Provenance**(Multi emulador, emula Genesis, Gamegear, Snes, Nes).

# Opciones para instalarlos en iOS
En este tutorial me voy a centrar en **GBA4iOS**, el procedimiento es el mismo.
Tenemos 2 opciones:<br/>
1. **Compilar el emulador**: Más complicada, tenemos que instalar las dependencias por nuestra cuenta, opción más segura<br/>
2. **Descargar el IPA y firmarlo**: Nos viene el emulador ya compilado tenemos que firmarlo nosotros, nos arriesgamos a un troyano<br/>

Para la primera opcion, hay que descargar el codigo fuente, en el caso de **GBA4iOS** iremos a [Repositorio de GBA4IOS](https://bitbucket.org/rileytestut/gba4ios) y clonaremos el repo.<br/>
![Clonando GBA4iOS](/images/cloning.png)
Posteriormente instalaremos las dependencias, estas se encuentran manejadas por un gestor llamado [CocoaPods](http://wwww.cocoapods.org), para ello, tenemos que ir mediante terminal al sitio donde clonamos el código, en caso de no tener instalado este paquete, ejecutamos el comando:<br/>
{% highlight bash %}
sudo gem install cocoapods
{% endhighlight %}
En caso de tener ya instalado Cocoapods, corremos el siguiente comando, dentro del directorio donde clonamos el emulador:
{% highlight bash %}
pod install
{% endhighlight %}
![Cocoapods](/images/pods.png)
Una vez que se instalarón las dependencias del proyecto, nos creara un Workspace, el cual tenemos que abrir siempre, ya que nos incluira un proyecto donde están las dependencias, en caso contrario si abrimos el puro proyecto estas no se incluiran y no podremos correr el proyecto.
![Xcode](/images/gbaiosxcode.png)
A partir de aqui, necesitaremos una cuenta de Desarrollador, la cual, conseguiremos en el sitio de [Apple Developer](http://developer.apple.com), actualmente ya no tienes que pagar $100 dlls para poder probar en el dispositivo.
No voy a detallar los pasos que debemos seguir para poder crear un Provision Profile, solamente a partir de aqui, ya podemos presionar el botón de Run y XCode compilara el emulador y lo instalara en nuestro dispositivo.

Para subir roms, podemos hacerlo a traves de Dropbox(directo en la misma app) o bien a traves de iTunes.
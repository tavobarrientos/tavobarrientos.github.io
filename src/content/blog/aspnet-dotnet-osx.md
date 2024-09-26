---
title: 'Corriendo ASP.NET vNext en OSX'
description: 'Corriendo ASP.NET vNEXT en OSX'
pubDate: 'May 05 2015'
heroImage: '/blog/web.png'
author: tavobarrientos
relatedPosts:
    - construyendo-nes-raspberry
    - corriendo-emuladores-ios-no-jailbreak
hidden: false
---

**Nota**: Este post ya es viejo, actualmente ha cambiado mucho el desarrollo de .NET, actualmente el contenido de este post ya es obsoleto.

Hace no mucho, [Microsoft](http://www.microsoft.com) lanzo [DotNet Core](https://github.com/dotnet/corefx), una de las novedades, es que ahora es [Open Source](http://blogs.msdn.com/b/dotnet/archive/2014/11/12/net-core-is-open-source.aspx) y podemos correrlo en Windows, OSX y Linux.

En este post, veremos un poco como correr ASP.NET MVC 5 en una maquina con OSX Yosemite, el proceso no es muy laborioso, pero requiere tener ciertos conocimientos de uso de terminal.

## Requerimientos Tecnicos Previos

Para seguir este tutorial vamos a requerir:

- OSX 10.10 Yosemite

- XCode (Descargala desde App Store)

- Command Line Tools, se instalan cuando corras Xcode.

- Homebrew instalado, puedes ver instrucciones para instalarlo desde [Aquí](http://brew.sh/)

- Node.JS

- Editor, puede ser Sublime Text, Textmate, VIM, Emacs, Atom, Visual Studio Code... etc.

Teniendo estas herramientas instaladas, abriremos la terminal y teclearemos los siguientes comandos:

```bash
brew tap aspnet/dnx
brew update
brew install dnvm
```

Esto nos ayudara a instalar el ambiente de desarrollo, pero **¿que son todas estas herramientas?**, bueno, explicare un poco.

## DNX o .NET Execution Environment

![DNX](/blog/dnx.png)

Este programa, basicamente, contiene todas las herramientas necesarias para compilar y ejecutar aplicaciones, es decir contiene todas las herramientas de SDK, sistema y CLR necesarias.

## DNVM .NET Version Manager

![DNVM](/blog/dnvm.png)

Nuestro gestor de versiones, con el podremos instalar varios entornos de desarrollo de .NET, muy al estilo de RVM o RBEnv en Ruby.

Ya con estas herramientas instaladas, podemos crear proyectos de .NET en nuestro OSX, instalaremos Yeoman junto con su generador para ASP.NET de la siguiente manera:

```bash
npm install -g yo generator-aspnet grunt-cli bower
```

## ¿Que son todos estos comandos?

[Yeoman](http://www.yeoman.io) es una herramienta escrita en NodeJS que nos ayuda a crear proyectos, ahorrandonos de crear todo el "boilerplate" necesario para algun proyecto web, en nuestro caso, nos creara todo el proyecto de ASP.NET MVC 5, con algunas dependencias
como JQuery, Entity Framework, ASP.NET MVC etc.
Yeoman tambien nos provee de una serie de "plugins" llamados generadores, que son los que construiran nuestros proyectos, cabe mencionar que existen muchos generadores para tecnologías como AngularJS entre otras.

Así mismo, es importante, para tener una productividad alta, que lo combinemos con otras herramientas como Grunt y Bower, que tambien instalamos, con los comandos anteriores, si ya lo tienes instalado en tu Mac, puedes omitirlos.

Una vez instalado Yeoman y el Generador de ASP.NET, ejecutaremos en la terminal

```bash
yo aspnet
```

Y nos aparecera una pantalla parecida a la siguiente donde podremos escoger que tipo de proyecto queremos crear:

![Yeoman](/blog/yeoman.png)

Despues de elegir el nombre del proyecto, en este caos yo lo llame **vnext**, tendremos que restaurar las dependencias de nuestro proyecto que vienen por default.

```bash
dnu restore
```

Este comando le pedira a NuGet que restaure los paquetes faltantes en neustro proyecto, cabe recordar, que en .NET Core CLR, todos los paquetes son descargables mediante NuGet, por lo que si no usamos determindo paquete, podemos descartarlo de nuestro proyecto.

![Terminal]](/blog/restore.png)

Con nuestro proyecto creado, procederemos a abrirlo en el editor de nuestra preferencia, para este tutorial, estoy usando [Visual Studio Code](https://code.visualstudio.com//)

![VSCore](/blog/vss.png)

Si examinamos un poco la estructura del proyecto, tenemos algo muy similar a una aplicación web desarrollada ASP.NET MVC bajo .NET Framework, tenemos una carpeta donde están alojados nuestros Modelos, Controles, Vistas de la aplicación, adicionalmente los web.config
en XML, fuerón reemplazados con un config.json, aqui tambien alojamos nuestros valores de configuración tales como Cadenas de Conexión a base de datos, etc.
El archivo principal del proyecto es el **project.json**, el cual, le dictara al proyecto que dependencias tenemos, que runtime estamos utilizando, etc.

Tambien incluye los archivos: **package.json**, que contiene las dependencias de Node.JS, en este caso grunt, **bower.json**, este archivo contiene las dependencias de frontend, tales como JQuery, Bootstrap y finalmente, **gruntfile.js** que contiene algunas tareas de Grunt.
Cabe destacar que podemos descartar Grunt en favor de Gulp, esto se hace al momento de crear el proyecto de la siguiente manera:

```bash
yo aspnet --gulp
```

Para poder ejecutar el proyecto, nos iremos a la terminal y escribiremos el siguiente comando:

```bash
dnx . kestrel
```

Este comando ejecutar el servidor de desarrollo **Kestrel**, dado que en Mac no disponemos de IIS para probar nuestras aplicaciones, tendremos que usar esta alternativa libre.

![Kestrel](/blog/kestrel.png)

Si no vemos ningún error, podemos ir a la siguiente dirección: [http://localhost:5001](http://localhost:5001), y podremos ver nuestra aplicación ejecutarse.

![Asi se vera tu app corriendo](/blog/web.png)

## No todo es miel sobre ojuelas.

Como dice el titulo, desarrollar una aplicación de este estilo, aún esta de un modo "Experimental" y no se recomienda para entornos productivos, en este caso, se recomienda la version tradcional, sobre Windows, aunque conforme pase el tiempo, el entorno se volvera más solido
y podemos liberar aplicaciones en entornos mas robustos sobre Linux o Mac.

Hay un error muy conocido, sobre la maquina virtual de Mono concretamente en FileSystemWatcher, que no nos permitiria ver nuestra aplicación corriendo, esto se soluciona, antes de correr Kestrel, introduciremos el siguiente comando:

```bash
export MONO_MANAGED_WATCHER=disabled
```

Ya con esto podemos ejecutar una aplicación ASP.NET MVC 5 en Mac OSX, a partir de aqui podemos ir agregando algo de funcionalidad a nuestro proyecto.
Si tecleamos:

```bash
yo aspnet --help
```

Nos mostrara una serie de subgeneradores, los cuales podemos usar para agregar Clases, Scrips, Controladores a nuestro proyecto.

## Agregando un nuevo Controlador y Vista a nuestro proyecto

Para agregar un nuevo controlador a nuestro proyecto, iremos a la carpeta Controllers(en nuestra terminal) y teclearemos:

```bash
yo aspnet:MvcController HolaMundoController
```

En mi caso llame a mi controlador HolaMundo, ahora procederemos a agregar la vista del Metodo Index de nuestro controlador de la siguiente manera:
Iremos a la carpeta Views y crearemos la carpeta correspondiente a nuestro controlador, en este caso **HolaMundo** y tecleamos:

```bash
yo aspnet:MvcView HolaMundoController
```

Volvemos a nuestro editor, agregamos un poco de HTML a la vista, y correremos Kestrel y vamos a [http://localhost:5001/HolaMundo](http://localhost:5001/HolaMundo)

![Hello world!](/blog/holamundo.png)

## Conclusiones

En este tutorial aprendimos:

1. Instalar el entorno de .NET en Mac.
2. Crear un proyecto ASP.NET MVC con Yeoman y detectar errores comunes.
3. Agregar un nuevo Controlador con su Vista.

De igual manera, el workflow de **Yeoman + Grunt + Bower** es muy eficiente, nos ayuda a aumentar la productividad, pero aun así, si requieres una aplicación productiva, en entornos de alta disponibilidad, es recomendable por el momento no optar por esta tecnica
ya que, como comente arriba, todavia esta un poco verde.

En proximos tutoriales, agregaremos mas funcionalidad a la aplicación, agregaremos por ejemplo AngularJS, conexión a base de Datos desde Entity Framework, cambiaremos de Grunt a [Gulp](http://gulpjs.com) desde el proycto ya creado con Grunt.

Espero sus comentarios en: [@tavobarrientos](http://twitter.com/tavobarrientos).

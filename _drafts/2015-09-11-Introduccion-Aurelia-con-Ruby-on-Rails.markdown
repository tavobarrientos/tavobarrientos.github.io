---
layout: post
title:  "Introducción a Aurelia con Ruby on Rails"
date:   2015-09-22 05:22:00
categories: aurelia javascript gulp rails
---

Existen diversos frameworks para el desarrollo de Aplicaciones con Javascript, siendo Angular([Google](http://www.angularjs.org)) y React([Facebook](http://facebook.github.io/react/)) de los más populares.
En esta ocasión hablaré de Aurelia, fue creado por [Rob Eisenberg](http://www.twitter.com/eisenbergeffect)(ex desarrollador de Angular) y el equipo de [Durandal](http://durandal.io/), hace uso de los futuros
estandares **ES6/ES7**, por lo cual, nos vemos forzados a utilizar un **transpilador** llamado [Babel](http://babeljs.io/) que se encargará de ayudarnos a pasar nuestro código al estandar **ES5** compatible
con nuestros browsers actuales.

Algunas caracteristicas de Aurelia son las siguientes:

- Soporte de ES6/ES7 mediante un transpilador.
- Arquitectura MVVM
- Data Binding
- jspm como Gestor de Paquetes.
- Enrutamiento de URL.

# Empezando con Aurelia.

Para empezar, tendremos que instalar algunas herramientas, es imperativo tener instalado [Node.JS](https://nodejs.org/en/) ya que haremos uso de **npm**.
{% highlight bash %}
npm install -g gulp
npm install -g jspm
{% endhighlight %}

Esto nos instalara Gulp y JSPM respectivamente, tambien deberemos configurar nuestra cuenta de Github, ya que los paquetes que se descargarán vienen de [Github](http://www.github.com) y las llamadas anonimas a su API
estan limitadas y no podremos descargar todos los paquetes, con este comando cada que restauremos los paquetes, JSPM hara uso de nuestra cuenta de Github:
{% highlight bash %}
jspm endpoint config github
{% endhighlight %}

# Integrando Aurelia al Pipeline de Rails

A grandes rasgos, el Pipeline es un "framework" que nos ayudara a concatenar y minificar nuestros assets de Javascript y CSS, estos assets estaran localizados en cualquiera de estos directorios:
- app/assets
- lib/assets
- vendor/assets

Para agregar Aurelia, usaremos una gema llamada tambien [Aurelia](https://github.com/acidstudios/aurelia), para esto, agregaremos la gema a nuestro Gemfile, de la siguiente manera:
{% highlight bash %}
gem 'aurelia', '~> 0.1.1'
{% endhighlight %}
Posteriormente ejecutaremos Bundler para realizar la instalación de la gema, corremos el comando de instalación, con el cual descargara los archivos necesarios para correr Aurelia y configurará 
nuestro proyecto de Rails y a modo de prueba, correremos el servidor de rails.
{% highlight bash %}
bundler install
rails g aurelia:install
rails s
{% endhighlight %}



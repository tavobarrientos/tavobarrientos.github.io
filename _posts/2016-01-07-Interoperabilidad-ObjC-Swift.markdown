---
layout: post
title: "Objective-C + Swift"
date: 2016-01-07 4:37:00
categories: ios mobile
---
![Swift](https://camo.githubusercontent.com/de32b354687f1cd9b05a89e4aa03c7f2d311f294/68747470733a2f2f73776966742e6f72672f6173736574732f696d616765732f73776966742e737667)
Swift ya lleva tiempo en el terreno, aproximadamente 1 año y medio, e inclusive [Apple](http://www.apple.com) lo hizo [Open Source](https://www.github.com/apple/swift), pudiendo portarlo a Ubuntu, mientras tanto en 1 año, Objective-C se desplomo 15 posiciones en el indice [TIOBE](http://www.tiobe.com/index.php/content/paperinfo/tpci/index.html), de estar en el 3er lugar de lenguajes mas usados junto con Java, C, C++ y C#, paso al 18 y Swift escalo 11 posiciones, ubicandose en el 14.
![Ranking TIOBE Enero 2016](/images/tiobe012016.png)

En mi opinión, Objective-C es un lenguaje muy poderoso, tiene mucha base de código, pero Swift nos ofrece muchas ventajas, sobre todo en el aspecto funcional, la posibilidad de crear clases Genericas, nos ahorra mucho trabajo a bajo nivel.

Uno de las tareas más comunes que tenemos como desarrolladores, es la interacción con API's de servicios de terceros o bien, Servicios de nuestro mismo cliente/negocio.

Un response muy comun que tendriamos que manejar sería un success en un login por ejemplo:
{% highlight json %}
{
    firstName: "John",
    lastName: "Doe",
    email: "john.doe@mail.com"
}
{% endhighlight %}

En Swift tendriamos un modelo que nos permita guardar esta información:
{% highlight swift %}
class User {
    var firstName:String = ""
    var lastName:String: = ""
    var email:String = ""

    class func createFromDictionary(attributes:[String:AnyObject]) -> User {
        var user = User()

        if let firstName = info["firstName"] as? String {
            user.firstName = firstName
        }

        if let lastName = info["lastName"] as? String {
            user.lastName = lastName
        }

        if let email = info["info"] as? String {
            user.email = email
        }

        return user
    }
}
{% endhighlight %}

Esta clase, basicamente hace su trabajo, con el guardariamos el response anterior, sin embargo tiene algunos puntos debiles, los cuales son:<br/>
- Si tu response JSON es modificado, ya sea se agregan propiedades, o se remueven, tendriamos que actualizar nuestro código.<br/>
- Se va a necesitar escribir código cada que creemos un nuevo modelo.<br/>

Para esto, aprovecharemos los principios basicos de [Key-Value Coding](https://developer.apple.com/library/ios/documentation/Cocoa/Conceptual/KeyValueCoding/Articles/BasicPrinciples.html), para asi poder limpiar un poco nuestro modelo mediante una extensión de **NSObject**, y así tener un modelo mas delgado y dinamico, tambien podría ser valido crear un modelo base y heredar de el.

{% highlight swift %}
class User: NSObject {
    var firstName:String = ""
    var lastName:String = ""
    var email:String = ""
}

extension NSObject {
    class func createFromJson(attributes: NSDictionary) -> Self {
        var obj = self()

        (obj as NSObject).load(attributes)

        return obj
    }

    func load(attributes: NSDictionary) {
        for(key, value) in attributes {
            let keyName = key as String

            if(self.respondsToSelector(NSSelectorFromString(keyName))) {
                self.setValue(value, forKey: keyName)
            }
        }
    }
}
{% endhighlight %}

Con este pequeño código, nos permite tener nuestro modelo mas generico, podemos actualizar nuestra API y actualizar solamente el modelo, para agregar/quitar propiedades, sin tener el temor de que se rompa, simplemente tenemos que heredar de **NSObject** o de la clase creada, si se opto por crear un **BaseModel**

{% highlight swift %}
let json = [
    firstName: "John",
    lastName: "Doe",
    email: "john.doe@mail.com"
]

var user = User.createFromJson(json)

println(user.firstName) // John
println(user.lastName) // Doe
println(user.email) // john.doe@mail.com
{% endhighlight %}


Espero que les sea util este pequeño tip, como siempre, pueden contactarme a mi Twitter en: [@tavobarrientos](https://www.twitter.com/tavobarrientos).

---
title: 'Introducing: TacoMapper'
description: 'A Lightweight Object to Object mapper'
pubDate: 'Jun 24 2025'
heroImage: '/blog/tacomapper.png'
author: tavobarrientos
hidden: false
---

For a long time, I relied heavily on [AutoMapper](https://automapper.org/) in my projects. It’s a great library, no doubt about it. However, after the recent [license changes](https://www.jimmybogard.com/automapper-and-mediatr-licensing-update/), I started exploring alternatives.

I even went as far as mapping objects manually—while that approach works and removes any external dependencies, the drawbacks quickly add up. In large codebases where models evolve frequently, maintaining all those manual mappings becomes a real headache.

That’s why I decided to build something lightweight and easy to use. And that’s how [TacoMapper](https://barrientos.io/TacoMapper) was born.

![TacoMapper](/public/blog/taco.png)

### How do I try TacoMapper?

The good news is, [TacoMapper is available on NuGet](https://www.nuget.org/packages/TacoMapper), so installing it is as easy as:

```bash
dotnet add package TacoMapper --version 1.0.1 # The latest version as of today.
```

Once installed, you can start mapping objects using the `ObjectMapper` (I’ll probably rename this class soon—it predates the library name 😅):

```csharp
var personDto = ObjectMapper.Map<Person, PersonDto>(person);
```

You can also use a fluent API to define your mappings in a more expressive way:

```csharp
var mapper = ObjectMapper.Create<Person, PersonDto>()
    .Map(dest => dest.Id, src => src.Id)
    .Map(dest => dest.Email, src => src.Email)
    .Map(dest => dest.Age, src => src.DateOfBirth, dob => DateTime.Now.Year - dob.Year)
    .Map(dest => dest.Status, src => src.IsActive, active => active ? "Active" : "Inactive")
    .Combine(dest => dest.FullName, src => $"{src.FirstName} {src.LastName}");

var result = mapper.MapFrom(person);
```

### Documentation

[TacoMapper](https://barrientos.io/TacoMapper) comes with clean, minimal documentation built entirely with [StarLight](https://starlight.astro.build/). You can check it out at: [https://barrientos.io/TacoMapper](https://barrientos.io/TacoMapper)

### What’s next?

While [TacoMapper](https://barrientos.io/TacoMapper) is already up and running, there’s still plenty to improve—things like support for dependency injection and other nice-to-have features. The library is actively being developed, so if this project caught your attention and you’d like to contribute, head over to the [GitHub repo](https://github.com/tavobarrientos/TacoMapper) and send a pull request!

#### Resources

- GitHub: [https://github.com/tavobarrientos/TacoMapper](https://github.com/tavobarrientos/TacoMapper)  
- NuGet: [https://www.nuget.org/packages/TacoMapper](https://www.nuget.org/packages/TacoMapper)  
- Docs: [https://barrientos.io/TacoMapper](https://barrientos.io/TacoMapper)

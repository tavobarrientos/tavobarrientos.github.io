---
title: "TacoMapper"
description: "A Lightweight Object to Object mapper"
heroImage: '/blog/tacomapper.png'
links:
  github: "https://github.com/tavobarrientos/TacoMapper"
  website: "https://barrientos.io/TacoMapper"
tags: ['.NET', 'C#', 'Mapping', 'Open Source']
hidden: false
---

## Overview

TacoMapper is a lightweight, open-source object-to-object mapping library for .NET that provides a simple alternative to heavier mapping solutions. Born out of the need for a flexible, dependency-free mapping solution, TacoMapper offers both convention-based automatic mapping and a fluent API for custom mapping scenarios.

![TacoMapper](/blog/taco.png)

## The Problem

For years, many .NET developers relied heavily on AutoMapper for object-to-object mapping. While AutoMapper is a great library, recent license changes prompted the need to explore alternatives. Manual object mapping, while removing external dependencies, becomes a maintenance nightmare in large codebases where models evolve frequently.

TacoMapper was created to fill this gap—providing a lightweight, easy-to-use mapping solution without the complexity or licensing concerns.

## Key Features

- **Lightweight**: Minimal dependencies and footprint
- **Simple API**: Easy to use with minimal setup
- **Fluent Configuration**: Expressive mapping configuration
- **Convention-based**: Automatic mapping for properties with matching names
- **Custom Transformations**: Support for complex property mappings
- **Open Source**: MIT licensed and actively maintained

## Getting Started

### Installation

TacoMapper is available on NuGet and can be installed easily:

```bash
dotnet add package TacoMapper --version 1.0.1
```

### Basic Usage

The simplest way to use TacoMapper is with the static `ObjectMapper` class:

```csharp
var personDto = ObjectMapper.Map<Person, PersonDto>(person);
```

### Fluent API

For more complex scenarios, you can use the fluent API to define custom mappings:

```csharp
var mapper = ObjectMapper.Create<Person, PersonDto>()
    .Map(dest => dest.Id, src => src.Id)
    .Map(dest => dest.Email, src => src.Email)
    .Map(dest => dest.Age, src => src.DateOfBirth, dob => DateTime.Now.Year - dob.Year)
    .Map(dest => dest.Status, src => src.IsActive, active => active ? "Active" : "Inactive")
    .Combine(dest => dest.FullName, src => $"{src.FirstName} {src.LastName}");

var result = mapper.MapFrom(person);
```

## Technical Implementation

TacoMapper uses reflection and expression trees to create efficient mapping functions. The library analyzes source and destination types to automatically map properties with matching names and types, while allowing developers to override or customize mappings as needed.

## Development & Contribution

TacoMapper is actively developed and welcomes contributions from the community. Complete documentation is available at [barrientos.io/TacoMapper](https://barrientos.io/TacoMapper), built with StarLight for a clean, navigable experience.

### Future Roadmap

While TacoMapper is already production-ready, several enhancements are planned:

- Dependency injection support
- Performance optimizations
- Additional mapping scenarios
- Enhanced debugging tools

### Links & Resources

- **GitHub Repository**: [github.com/tavobarrientos/TacoMapper](https://github.com/tavobarrientos/TacoMapper)
- **NuGet Package**: [nuget.org/packages/TacoMapper](https://www.nuget.org/packages/TacoMapper)
- **Documentation**: [barrientos.io/TacoMapper](https://barrientos.io/TacoMapper)

## Technologies Used

- .NET/C#
- Reflection and Expression Trees
- NuGet Package Management
- StarLight (Documentation)
- GitHub Actions (CI/CD)

For a long time, I relied heavily on [AutoMapper](https://automapper.org/) in my projects. It's a great library, no doubt about it. However, after the recent [license changes](https://www.jimmybogard.com/automapper-and-mediatr-licensing-update/), I started exploring alternatives.

I even went as far as mapping objects manually—while that approach works and removes any external dependencies, the drawbacks quickly add up. In large codebases where models evolve frequently, maintaining all those manual mappings becomes a real headache.

That's why I decided to build something lightweight and easy to use. And that's how [TacoMapper](https://barrientos.io/TacoMapper) was born.

![TacoMapper](/blog/taco.png)

## How do I try TacoMapper?

The good news is, [TacoMapper is available on NuGet](https://www.nuget.org/packages/TacoMapper), so installing it is as easy as:

```bash
dotnet add package TacoMapper --version 1.0.1 # The latest version as of today.
```

Once installed, you can start mapping objects using the `ObjectMapper` (I'll probably rename this class soon—it predates the library name 😅):

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

## Documentation

[TacoMapper](https://barrientos.io/TacoMapper) comes with clean, minimal documentation built entirely with [StarLight](https://starlight.astro.build/). You can check it out at: [https://barrientos.io/TacoMapper](https://barrientos.io/TacoMapper)

## What's next?

While [TacoMapper](https://barrientos.io/TacoMapper) is already up and running, there's still plenty to improve—things like support for dependency injection and other nice-to-have features. The library is actively being developed, so if this project caught your attention and you'd like to contribute, head over to the [GitHub repo](https://github.com/tavobarrientos/TacoMapper) and send a pull request!

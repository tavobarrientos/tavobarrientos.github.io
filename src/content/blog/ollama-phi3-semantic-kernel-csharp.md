---
title: 'Using a Phi3 Model with Semantic Kernel in C#'
description: 'In this post we will cover the usage of a SLM like Phi3 with Semantic Kernel in C#'
pubDate: 'Oct 1 2024'
heroImage: '/blog/ai_developer.jpg'
author: tavobarrientos
hidden: false
---

Actually, there's a lot of people talking about AI, which help us to build more powerful and innovative solutions.
<br/>
Ollama allows us to run and test models locally using our machines, without the need to create a subscription in  a provider. <br/>
In this post will walk through the steps to setup the Phi3 Model and create a very simple app using Semantic Kernel.

##### What I need?
 - Ollama
 - Your favorite Terminal
 - Your favorite Code Editor(VSS/Rider/VSCode/VIM for example)
 - Dedicated GPU (Recommended)

##### Installing Ollama and Phi3
To install Ollama, you can download it from [their site](https://www.ollama.com) or using the following command:
```powershell
winget install Ollama.Ollama
```

![Windows Terminal running winget](/blog/ollama/winget.png)

At the end of the installation, it will start the Ollama service, I recommend that restart tour terminal after the installation.

![Ollama Running](/blog/ollama/running.png)

For this post we will use the model PHi3, we have some tags from "variants" of the Phi3 model that we can install,
for this post we gone to install a SML Phi3:mini, in trhis case, is a model that is trained with 3.8b of parameters.


![Phi3](/blog/ollama/phi3.png)

You can go to the [landing page](https://ollama.com/library/phi3) of the model to know more details about it.

##### Previous Considerations;

Please consider that the size of the model that we see in the Ollama page, is only the size that the model will use in our disk,
but also it could be the amount of RAM memory installed on our system that also can use.

![Phi3 memory space](/blog/ollama/space.png)

For instance Phi3-Mini uses 2.2 gb of space, but it will requires up to 3.3gb of memory, please consider this before run a sml in your machine.

Also, the team behind of Ollama recommends in their docs, that your system has a dedicated Graphics Card(or if you have a Mac, one compatible with Metal), you can find the GPUs
that are compatible in this [Link](https://github.com/ollama/ollama/blob/main/docs/gpu.md).

##### Pulling the SML

To pull the model from Ollama you can just type in a terminal the following command:
```powershell
ollama pull phi3:mini
```
With this command, Ollama will download and install the SML in your machine.
![ollama pull phi3:mini](/blog/ollama/pulling.png)

##### Some Ollama commands
If we want to see which models you have on your machine, you can type;
```powershell
ollama list
```
![ollama list](/blog/ollama/ollama_list.png)

To run a model:
```powershell
ollama run <MODEL>
```
![ollama run](/blog/ollama/ollama_run.png)

It will take a little bit to load the model on memory, but when you see a prompt you can start typing to see responses:
![ollama run](/blog/ollama/ollama_run_prompt.png)

To exit from the prompt, onle need to typew: **/bye**

```powershell
ollama ps
```

This command will give us some information about the model that is running, for example the name, the id or memoery size that is using
on our system.
![ollama ps](/blog/ollama/ollama_ps.png)


### Using Semantic Kernel
Semantic Kernel is an open source sdk that allow us to interact with AI models using C#, Python or Java, in this post, we going to use C# for the examples.

The library by itself is very extensible, so we can build powerful applications around it and integrate the very latest AI models in our code.

![Enterprise Ready image by Microsoft](/blog/ollama/enterprise-ready.png)

##### Let's create something cool!

In this post we going to create something very simple, in a future posts I hope that we can see something more complicated around Semantic Kernel.


We need to create a console App, you can use Dotnet CLI or directly in Visual Studio or Rider, you can name your project as you want, the important part is when we add the connection to the SML.

```powershell
dotnet new console -n Ollama.SemanticKernel -o .
```

Fire up your IDE and open your project, and open the file called **Program.cs**, we will type our code on it.
![Visual Studio](/blog/ollama/vss.png)
We gone need to install the Nuget from SemanticKernel and Ollama Connector (pre release), you can do this in Visual Studio/Rider or in Terminal

```powershell
dotnet add package Microsoft.SemanticKernel --version 1.22.0
dotnet add package Microsoft.SemanticKernel.Connectors.Ollama --version 1.22.0-alpha
```
![Visual Studio Nuget install](/blog/ollama/nuget.png)

In previous versions of Semantic Kernel, we can connect using OpenAi connectors to Ollama Models, in newer versions we need the proper connector, in that case, Microsoft created the Ollama connector, since some of the endpoints changed.

**NOTE**: You may have some errors when you invoke some functions, don't worry, you are using code from a prerelease package, you need to supress the warnings with right click with the contextual actions and supress each of them or globally.

![Warnings](/blog/ollama/warnings.png)

![Supressed Warnings](/blog/ollama/suppresed.png)

First of all, you need to ensure that your SML is running with **ollama run phi3:mini**, the default endpoint for Ollama is: **http://localhost:11434/**.

In this case we gonne need to initialize the Kernel with this lines:

```csharp
var semanticKernelBuilder = Kernel.CreateBuilder().AddOllamaChatCompletion(modelId: "phi3:mini", endpoint: new Uri("http://localhost:11434/"));
var kernel = semanticKernelBuilder.Build();

var prompt = @"You can have any conversation about any topic. 
   {{$history}}  
   The user input is:{{$input}}  
";

var chat = kernel.CreateFunctionFromPrompt(prompt);
var settings = new OllamaPromptExecutionSettings
{
    Temperature = 0.0f
};

```

Basically, we tell to Semantic Kernel to connect to our Ollama and tell the model how to behave, also we set the Temperature, but, what is the Temperature?
The temperature is a parameter that evaluates the creativity of the model, it controls the level of randomness that a model can have when it generate text,
this means that a higher temperature value increases the probability of chaotic or dillusional results, otherwise, lower temperature values you gone to obtain
more predictable results, the ideal is to find an ideal value.

After this, we need to create a Chat with our model, for this example I set a very low temperature.

```csharp
while (true)
{
    Console.Write("You: ");
    var input = Console.ReadLine();

    var arguments = new KernelArguments(settings)
    {
        ["$input"] = input
    };

    var response = await chat.InvokeAsync(kernel, arguments);

    Console.WriteLine($"ChatBot: {response}");
}
```

With this final code we going to read a line in the console and send again another message until we close the app.

At the end, we see the basic usage of Semantic Kernel to connect to a SML, I hope that in future posts we can see more advance concepts.
If you want the source code of the example, go to my GitHub: [https://github.com/tavobarrientos/ollama-semantic](https://github.com/tavobarrientos/ollama-semantic)
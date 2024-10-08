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
Semantic Kernel is an open source sdk that allow us to interact with AI models using C# or Python, in this post, we going to use C# for the examples.

The library by itself is very extensible,  
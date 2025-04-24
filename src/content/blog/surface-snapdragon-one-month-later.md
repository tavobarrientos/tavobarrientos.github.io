---
title: 'Developer Perspective: Microsoft Surface 7, one month later'
description: ''
pubDate: 'Apr 24 2025'
heroImage: '/blog/surface7_anime.png'
author: tavobarrientos
hidden: false
---

One month ago (or so lol), I got a 13" [Microsoft Surface Laptop 7](https://www.microsoft.com/en-us/surface/devices/surface-laptop-7th-edition). Initially, I was **very skeptical** about using an ARM-based device for my daily work as a Software Developer. But after several days of using it, I can honestly say I’ve been **pleasantly surprised**!

The **performance is rock solid**. I’ve been able to run all my core dev tools like **Visual Studio**, **VSCode**, **Node.js** without any major issues (okay, maybe **NVM**—but more on that later). The transition to ARM on Windows feels smoother than I expected. Not quite as seamless as Apple’s Intel to Apple Silicon migration, but still **very impressive**. Over time, I hope more apps adopt native support for Windows on ARM. 

If you're curious about compatibility, check out [Windows on ARM](https://windowsonarm.org) — it’s a community-maintained list of what works natively.

---

#### Node (and NVM)

Now, let’s talk about **Node.js**.

I usually install [NVM for Windows](https://github.com/coreybutler/nvm-windows) on all my machines — it’s just super handy when I need to quickly switch Node versions for different projects. But unfortunately, **NVM isn’t natively compatible with ARM**. You’ll need to run it in x86 mode, which isn’t a big deal, we're interested on install ARM Node version, but it does require a few manual steps.

After installing it, make sure to **set the architecture manually** using:

```bash
nvm arch arm64
```

By default, NVM will assume x64, and if you install a Node version, you’ll get the wrong architecture. That’s why this command is important.

Alternatively, you can specify the architecture when installing a version:

```bash
nvm install <version> arm64
```

After that, everything works as expected. I’m currently using Node 20+ without any runtime issues.

---

#### Conda & Python Stuff

One downside I did find: **Conda (Anaconda/Miniconda)** isn’t available for Windows ARM yet. That was a bit disappointing because I use Conda a lot when working with Python or AI/ML environments. 

The workaround? **Run it through WSL (Windows Subsystem for Linux)**. I installed Ubuntu, then Miniconda, and from there everything worked perfectly. It’s not ideal, but it’s functional, and honestly, WSL2 runs so well on this device that I sometimes forget I’m not in a native Linux setup.

---

#### .NET and Visual Studio

Here’s where the Surface Laptop 7 really shines — **.NET just flies** on this device. I’m building .NET and MAUI apps regularly, and performance has been very smooth. **Visual Studio 2022** and **VS Code** both run great natively. Hot reload, debugging, unit tests — no hiccups so far.

Also worth noting: the machine stays **cool and quiet** even under moderate load. ARM’s energy efficiency really helps here.

---

#### Portability & Daily Use

This is honestly one of the biggest advantages of the Surface Laptop 7: **it’s insanely portable**.

Before this, I was using a 16" MacBook Pro M1 Max. Amazing performance, but that thing **weighs a ton**. When you travel or commute daily, that adds up. The Surface Laptop 7 is super lightweight, and it fits into any backpack or messenger bag without bulking things up.

Also, I have to mention the **keyboard**. It’s probably one of my favorite laptop keyboards — reminds me of the MacBook Pro’s keyboard (the good ones, not the butterfly era lol). The key travel, spacing, and typing experience are excellent. I often dock it to my full setup (three monitors + mechanical keyboard), but even when I’m typing on the go, it’s a great experience.

---

#### Battery Life

Battery life has also been pretty solid — around **10-12 hours** with typical dev workloads (VSCode, terminals, browser, Teams, etc.). Of course, it drops a bit when running WSL or emulated apps, but it still beats many x64-based laptops I’ve used.

The fanless design is another plus. The machine is **whisper quiet**, even when compiling or building. It makes a difference if you work in quiet environments like libraries or cafés.

---

#### So… Do I Recommend It?

**Absolutely.** But with some caveats.

If your development workflow is mostly compatible with ARM, or you’re okay using **WSL** or **x86 emulation** for edge cases, this machine is a **joy to use**. It’s light, fast, quiet, and surprisingly capable for both web and app development.

However, if you’re working with tools that are **strictly x64**, or you do **GPU-heavy work** like 3D rendering, gaming, or machine learning — this might not be the best fit just yet. For example, if you’re a game developer or rely on CUDA-based tooling, look elsewhere.

But for my daily stack — .NET, Node.js, TypeScript, and a bit of Python — this Surface Laptop 7 has **exceeded my expectations**. It’s now part of my permanent dev setup.

---

Let me know if you’ve tested it with other tools or stacks — I’d love to hear how it’s working for other devs out there!
---
title: 'Building products with AI: rcrd'
description: 'Building a mobile app to track personal records at the gym using AI tools.'
pubDate: 'Jul 12 2025'
heroImage: '/blog/products/rcrd.jpg'
author: tavobarrientos
hidden: false
---

Ever since Steve Jobs unveiled the first iPhone SDK in March 2008, I’ve been fascinated by the idea of building apps that run on a mobile device. From that moment on, I’ve been involved in creating mobile products for both iOS and Android.

In recent years, I’ve witnessed a radical shift in how mobile products are built. Artificial intelligence has transformed the industry, letting developers work faster, be more creative, and boost productivity.

In this post, I want to share my experience building **Rcrd: Your Gym Personal Records!**—a mobile app that helps users keep track of their personal records at the gym.

> Quick note: this post isn’t about “vibe coding.” It’s about how I built a product by leaning on AI tools, and how those tools can genuinely help developers.

#### Why Rcrd?

The idea for Rcrd came from my own gym experience. I’ve always struggled to keep an accurate log of my PRs, which led to losing motivation and missing goals. So I decided to build an app to solve that problem.

I’m not exactly a fitness person, but I’ve learned that tracking progress is key to staying motivated and hitting targets. With Rcrd, I want to help others do the same.

#### How did AI help me build Rcrd?

AI has been a core part of Rcrd’s development. From idea generation to feature implementation, AI let me work more efficiently across the entire process, so I could focus on what really matters: crafting an exceptional user experience.

Even though Rcrd isn’t 100% finished—and still needs some polishing—I think it’s valuable to write about this so other developers can see how AI can be a powerful ally when building software products.

Once I had the idea and the product name, I started drafting requirements for Rcrd. I didn’t use anything fancy—just ChatGPT to generate a requirements list based on the vision I had. That gave me a clear picture of what I wanted to achieve and helped define the key features.

Using OpenAI’s `o3` reasoning model, ChatGPT produced a pretty extensive requirements list. That’s going to help me shape a development roadmap. For now, I’m only implementing the basic functionality I need for an MVP to validate the idea, and then I’ll add more complex features based on user feedback.

![Create a Project](/blog/products/requirements.png)

#### Let’s move on to development

Because I’m building a mobile app, I chose SwiftUI for iOS. It’s powerful and easy to use for creating user interfaces. Plus, SwiftUI makes it straightforward to build apps that look great across Apple devices—iPhone, iPad, and Mac—which means I’ll be able to expand Rcrd to iPad or macOS later using the same codebase, with only minor tweaks.

For the code editor, I’m obviously using Xcode since I’m in the Apple ecosystem. I’m not on any preview/beta versions yet—that’ll come later, once Rcrd is stable and ready to be a candidate for the App Store.

![Rcrd in action](/blog/products/rcrd.jpg)

#### Which AI tools am I using?

These are the AI tools that have helped me move faster while building Rcrd:

- **GitHub Copilot**: Helps me write code faster and with fewer mistakes by suggesting snippets and completing functions. There’s an Xcode plugin, so I can use it right in my editor. (In Xcode 26, Apple announced an assistant will be integrated directly into the IDE.)
- **Claude Code**: An AI agent—specifically I’m using `Sonnet 4` and `Opus 4`. It helps generate, review, and improve SwiftUI code, and it can also produce task-based development plans. That gives me tighter control over what needs to get done, phased delivery, and even connections to some MCP servers to extend the agent’s capabilities.
- **Gemini CLI**: I’ve been testing `Gemini CLI` these past weeks since it was just announced. It’s a powerful tool. Google offers a free tier with generous usage limits. However, I’ve found `Claude Code` has better reasoning when it comes to generating plans. I hope to write a post about Gemini CLI in the future.
- **ChatGPT**: I’m using it to brainstorm ideas and generate assets like icons and images for the app.

![GitHub Copilot](/blog/products/copilot.png)

#### Results

As of today, Rcrd is already in a fairly advanced stage. We have a test build on TestFlight (reach out if you want a code to try it out 😀). The basic functionality is in place, and there’s even a dedicated Apple Watch app so users can log entries from their wrist and view their data quickly.

![Rcrd in action](/blog/products/results.png)

#### What’s next?

I’ve got several ideas lined up for Rcrd—there are plenty of improvements and new features on the roadmap. Some of them include:

- Integration with other devices and platforms, like iPad and macOS.
- Enhancing the user experience with new features and a more intuitive interface.
- Expanding AI capabilities, including letting users personalize the AI agent’s behavior based on their preferences.

In the future, I plan to write posts about `Gemini CLI` and `Claude Code`. From my perspective, these tools can genuinely help us developers be more productive in our day-to-day work.

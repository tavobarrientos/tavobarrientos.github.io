---
title: 'Multi-Agent Orchestration with Model Routing in LangChain'
line:
    - agents
    - typescript
description: 'Building a small team of agents with LangChain.js and LangGraph.js, where a router decides which agent and which model handles each request.'
pubDate: 'Nov 26 2026'
heroImage: '/blog/model_routing.png'
author: tavobarrientos
relatedPosts:
    - microsoft_agent_framework
hidden: false
---

In my post about [Microsoft Agent Framework](/blog/microsoft_agent_framework) I mentioned that I've been working a lot with LangChain lately. One thing that keeps coming up when you build agents is the cost: most examples use the same model for everything, and that's fine for a demo, but not when you look at the bill.

If a user asks "where is my order 1042?", we don't need our biggest model to answer that. If the user asks us to find a race condition in some code, then yes, we probably do.

In this post we're going to build a small multi-agent system with **LangChain.js** and **LangGraph.js** in TypeScript, with a router in front that decides two things for each request:

1. Which agent should handle it (support, coding or research).
2. Which model that agent should use (a small and fast one, or a bigger one).

##### What do I need?
 - Node.js 20 or later
 - An API key from your model provider (I'm using Anthropic, but LangChain supports a lot of providers)
 - Your favorite code editor

Let's create the project and install the packages:

```bash
mkdir agent-router && cd agent-router
npm init -y && npm pkg set type=module
npm install langchain @langchain/core @langchain/langgraph @langchain/anthropic zod
npm install -D typescript tsx @types/node
export ANTHROPIC_API_KEY="your-key"
```

All the code goes into a single `src/index.ts` file, and we run it with `npx tsx src/index.ts`.

### Why route between models?

Small models are a lot cheaper per token than the big ones, and they are also faster. Most of the requests in a real app are simple, so if we send those to a small model we save money and the user gets the answer sooner. And when a request is really hard, we can send it to our best model without paying that price on every "hello".

This is where model routing and multi-agent orchestration work well together: each agent is a specialist, and the router picks the agent and the model for every request.

### The architecture

This is what we're going to build:

<figure>
<svg viewBox="0 0 720 460" role="img" aria-labelledby="mr-title mr-desc" style="width:100%;height:auto;font-family:var(--font-sans)">
  <title id="mr-title">Model routing architecture</title>
  <desc id="mr-desc">A user request goes to a router running on a fast model. The router returns an agent and a tier, and sends the request to the Support, Coding or Research agent, each of which can run on the fast, balanced or deep model. The chosen agent produces the response.</desc>
  <defs>
    <marker id="mr-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M0 0 L10 5 L0 10 z" style="fill:var(--line-strong)"/>
    </marker>
  </defs>
  <g style="fill:none;stroke:var(--line-strong);stroke-width:1.5" marker-end="url(#mr-arrow)">
    <path d="M360 48 L360 84"/>
    <path d="M360 162 C360 205 120 195 120 234"/>
    <path d="M360 162 L360 234"/>
    <path d="M360 162 C360 205 600 195 600 234"/>
    <path d="M120 356 C120 392 360 380 360 410"/>
    <path d="M360 356 L360 410"/>
    <path d="M600 356 C600 392 360 380 360 410"/>
  </g>
  <g class="motion-reduce:hidden" style="fill:none;stroke:var(--line-agents);stroke-width:2">
    <g opacity="0">
      <path d="M360 48 L360 84"/>
      <path d="M360 162 C360 205 120 195 120 234"/>
      <path d="M120 356 C120 392 360 380 360 410"/>
      <animate attributeName="opacity" values="0;1;1;0;0" keyTimes="0;0.03;0.3;0.333;1" dur="9s" begin="0s" repeatCount="indefinite"/>
    </g>
    <g opacity="0">
      <path d="M360 48 L360 84"/>
      <path d="M360 162 L360 234"/>
      <path d="M360 356 L360 410"/>
      <animate attributeName="opacity" values="0;1;1;0;0" keyTimes="0;0.03;0.3;0.333;1" dur="9s" begin="3s" repeatCount="indefinite"/>
    </g>
    <g opacity="0">
      <path d="M360 48 L360 84"/>
      <path d="M360 162 C360 205 600 195 600 234"/>
      <path d="M600 356 C600 392 360 380 360 410"/>
      <animate attributeName="opacity" values="0;1;1;0;0" keyTimes="0;0.03;0.3;0.333;1" dur="9s" begin="6s" repeatCount="indefinite"/>
    </g>
  </g>
  <g class="motion-reduce:hidden" style="fill:var(--line-agents)">
    <g opacity="0">
      <circle r="10" opacity="0.2"/>
      <circle r="5"/>
      <animateMotion path="M360 48 L360 162 C360 205 120 195 120 236 L120 356 C120 392 360 380 360 412" keyPoints="0;1;1" keyTimes="0;0.3;1" calcMode="linear" dur="9s" begin="0s" repeatCount="indefinite"/>
      <animate attributeName="opacity" values="0;1;1;0;0" keyTimes="0;0.02;0.29;0.3;1" dur="9s" begin="0s" repeatCount="indefinite"/>
    </g>
    <g opacity="0">
      <circle r="10" opacity="0.2"/>
      <circle r="5"/>
      <animateMotion path="M360 48 L360 412" keyPoints="0;1;1" keyTimes="0;0.3;1" calcMode="linear" dur="9s" begin="3s" repeatCount="indefinite"/>
      <animate attributeName="opacity" values="0;1;1;0;0" keyTimes="0;0.02;0.29;0.3;1" dur="9s" begin="3s" repeatCount="indefinite"/>
    </g>
    <g opacity="0">
      <circle r="10" opacity="0.2"/>
      <circle r="5"/>
      <animateMotion path="M360 48 L360 162 C360 205 600 195 600 236 L600 356 C600 392 360 380 360 412" keyPoints="0;1;1" keyTimes="0;0.3;1" calcMode="linear" dur="9s" begin="6s" repeatCount="indefinite"/>
      <animate attributeName="opacity" values="0;1;1;0;0" keyTimes="0;0.02;0.29;0.3;1" dur="9s" begin="6s" repeatCount="indefinite"/>
    </g>
  </g>
  <g style="fill:var(--bg-surface);stroke:var(--line-strong);stroke-width:1">
    <rect x="280" y="12" width="160" height="36" rx="18"/>
    <rect x="280" y="412" width="160" height="36" rx="18"/>
  </g>
  <g style="fill:var(--text-hi);font-size:14px;font-weight:500" text-anchor="middle">
    <text x="360" y="35">User request</text>
    <text x="360" y="435">Response</text>
  </g>
  <rect x="210" y="86" width="300" height="76" rx="12" style="fill:var(--bg-raised);stroke:var(--line-agents);stroke-width:1.5"/>
  <text x="360" y="117" text-anchor="middle" style="fill:var(--text-hi);font-size:17px;font-weight:600">Router</text>
  <text x="360" y="141" text-anchor="middle" style="fill:var(--text-mid);font-size:12px;font-family:var(--font-mono)">fast model · withStructuredOutput</text>
  <rect x="304" y="186" width="112" height="22" rx="11" style="fill:var(--bg-base);stroke:var(--line);stroke-width:1"/>
  <text x="360" y="201" text-anchor="middle" style="fill:var(--line-agents);font-size:11.5px;font-family:var(--font-mono)">{ agent, tier }</text>
  <g style="fill:var(--bg-surface);stroke:var(--line);stroke-width:1">
    <rect x="20" y="236" width="200" height="120" rx="12"/>
    <rect x="260" y="236" width="200" height="120" rx="12"/>
    <rect x="500" y="236" width="200" height="120" rx="12"/>
  </g>
  <g style="fill:var(--text-hi);font-size:15px;font-weight:600" text-anchor="middle">
    <text x="120" y="264">Support agent</text>
    <text x="360" y="264">Coding agent</text>
    <text x="600" y="264">Research agent</text>
  </g>
  <g style="fill:var(--text-mid);font-size:11.5px;font-family:var(--font-mono)" text-anchor="middle">
    <text x="120" y="286">get_order_status</text>
    <text x="360" y="286">no tools</text>
    <text x="600" y="286">search_docs</text>
  </g>
  <g style="fill:var(--text-lo);font-size:12px" text-anchor="middle">
    <text x="120" y="306">orders · accounts · billing</text>
    <text x="360" y="306">write · review · debug</text>
    <text x="600" y="306">explain · compare</text>
  </g>
  <g style="fill:var(--bg-base);stroke:var(--line-strong);stroke-width:1">
    <rect x="85" y="320" width="70" height="24" rx="12"/>
    <rect x="163" y="320" width="50" height="24" rx="12"/>
    <rect x="267" y="320" width="50" height="24" rx="12"/>
    <rect x="325" y="320" width="70" height="24" rx="12"/>
    <rect x="565" y="320" width="70" height="24" rx="12"/>
    <rect x="643" y="320" width="50" height="24" rx="12"/>
  </g>
  <g style="fill:var(--line-agents)">
    <rect x="27" y="320" width="50" height="24" rx="12"/>
    <rect x="403" y="320" width="50" height="24" rx="12"/>
    <rect x="507" y="320" width="50" height="24" rx="12"/>
  </g>
  <g style="fill:var(--text-mid);font-size:11px;font-family:var(--font-mono)" text-anchor="middle">
    <text x="120" y="336">balanced</text>
    <text x="188" y="336">deep</text>
    <text x="292" y="336">fast</text>
    <text x="360" y="336">balanced</text>
    <text x="600" y="336">balanced</text>
    <text x="668" y="336">deep</text>
  </g>
  <g style="fill:var(--bg-base);font-size:11px;font-weight:600;font-family:var(--font-mono)" text-anchor="middle">
    <text x="52" y="336">fast</text>
    <text x="428" y="336">deep</text>
    <text x="532" y="336">fast</text>
  </g>
  <g class="motion-reduce:hidden" style="fill:none;stroke:var(--line-agents)">
    <rect x="20" y="236" width="200" height="120" rx="12" stroke-width="1.5" opacity="0">
      <animate attributeName="opacity" values="0;0;1;1;0;0" keyTimes="0;0.13;0.16;0.29;0.333;1" dur="9s" begin="0s" repeatCount="indefinite"/>
    </rect>
    <rect x="260" y="236" width="200" height="120" rx="12" stroke-width="1.5" opacity="0">
      <animate attributeName="opacity" values="0;0;1;1;0;0" keyTimes="0;0.13;0.16;0.29;0.333;1" dur="9s" begin="3s" repeatCount="indefinite"/>
    </rect>
    <rect x="500" y="236" width="200" height="120" rx="12" stroke-width="1.5" opacity="0">
      <animate attributeName="opacity" values="0;0;1;1;0;0" keyTimes="0;0.13;0.16;0.29;0.333;1" dur="9s" begin="6s" repeatCount="indefinite"/>
    </rect>
    <rect x="27" y="320" width="50" height="24" rx="12" stroke-width="0" opacity="0">
      <animate attributeName="stroke-width" values="0;0;14;14" keyTimes="0;0.16;0.28;1" dur="9s" begin="0s" repeatCount="indefinite"/>
      <animate attributeName="opacity" values="0;0;0.7;0.35;0;0" keyTimes="0;0.16;0.17;0.22;0.28;1" dur="9s" begin="0s" repeatCount="indefinite"/>
    </rect>
    <rect x="403" y="320" width="50" height="24" rx="12" stroke-width="0" opacity="0">
      <animate attributeName="stroke-width" values="0;0;14;14" keyTimes="0;0.16;0.28;1" dur="9s" begin="3s" repeatCount="indefinite"/>
      <animate attributeName="opacity" values="0;0;0.7;0.35;0;0" keyTimes="0;0.16;0.17;0.22;0.28;1" dur="9s" begin="3s" repeatCount="indefinite"/>
    </rect>
    <rect x="507" y="320" width="50" height="24" rx="12" stroke-width="0" opacity="0">
      <animate attributeName="stroke-width" values="0;0;14;14" keyTimes="0;0.16;0.28;1" dur="9s" begin="6s" repeatCount="indefinite"/>
      <animate attributeName="opacity" values="0;0;0.7;0.35;0;0" keyTimes="0;0.16;0.17;0.22;0.28;1" dur="9s" begin="6s" repeatCount="indefinite"/>
    </rect>
  </g>
</svg>
<figcaption>The router picks an agent and a model tier for every request. The highlighted tiers match the example at the end of the post.</figcaption>
</figure>

The router is also a model call, so we want it to be the cheapest and fastest model we have. It only needs to classify the request, and small models do that pretty well when we give them a schema to follow.

##### Defining the models

LangChain has `initChatModel`, which creates a chat model from a `provider:model` string. I like it because all the models live in one place and I can change them later without touching the agents.

```typescript
import { initChatModel } from "langchain";

const MODEL_TIERS = {
  fast: await initChatModel("anthropic:claude-haiku-5-5"),
  balanced: await initChatModel("anthropic:claude-sonnet-5-5"),
  deep: await initChatModel("anthropic:claude-opus-5-5"),
};

type Tier = keyof typeof MODEL_TIERS;
```

You don't need to use Anthropic for all of them. For example, `fast` could be a local model with Ollama (`"ollama:llama3.2"`, you need to install `@langchain/ollama`), and the rest of the code stays the same.

##### Creating the router

The router needs to give us something we can use in code, not a paragraph of text. With `withStructuredOutput` we pass a Zod schema, and the model returns an object with that shape (and TypeScript knows the types too).

```typescript
import * as z from "zod";

const RouteSchema = z.object({
  agent: z
    .enum(["support", "coding", "research"])
    .describe(
      "support: orders, accounts, billing. " +
        "coding: writing, reviewing or debugging code. " +
        "research: explaining concepts, comparing options, summarizing."
    ),
  tier: z
    .enum(["fast", "balanced", "deep"])
    .describe(
      "fast: simple lookups and short answers. " +
        "balanced: normal multi-step tasks. " +
        "deep: hard reasoning, long code reviews, high-stakes answers."
    ),
  reason: z.string().describe("One short sentence explaining the choice."),
});

type Route = z.infer<typeof RouteSchema>;

// The router should be deterministic: same request, same route
const routerModel = (
  await initChatModel("anthropic:claude-haiku-5-5", { temperature: 0 })
).withStructuredOutput(RouteSchema, { name: "route" });

const ROUTER_PROMPT = `You are a request router. Read the user's message and choose
the agent and the cheapest model tier that can handle it well.
Prefer 'fast' unless the task clearly needs more reasoning.`;
```

The texts inside `.describe()` are sent to the model, so they work as instructions; write them with care. Also, in the prompt we tell the router to prefer the cheapest tier. If we don't, the model tends to pick a bigger tier "just in case", and we lose the savings.

You may notice that the router has its own model with `temperature: 0`, and the agents don't. The temperature controls how much randomness the model has when it generates text: with higher values you get more creative (or chaotic) results, and with lower values the results are more predictable. For the router we want the same request to go to the same agent and tier every time, so it's easier to test and to debug when something goes to the wrong place. It's not 100% deterministic, but it's much more consistent. For the agents I left the default value, because an explanation or a summary usually reads better that way.

##### Creating the agents

Each agent is a normal LangChain agent with its own tools and system prompt, created with `createAgent` from LangChain v1. We don't create one agent per model; instead we have a small function that builds the agent for the tier that the router chose.

```typescript
import { createAgent, tool } from "langchain";

const getOrderStatus = tool(
  async ({ orderId }) => {
    // Replace with a real call to your order service
    return `Order ${orderId} shipped on Nov 22 and arrives Nov 27.`;
  },
  {
    name: "get_order_status",
    description: "Look up the status of a customer order.",
    schema: z.object({ orderId: z.string() }),
  }
);

const searchDocs = tool(
  async ({ query }) => {
    return "LangGraph is a library for building stateful, multi-actor LLM apps.";
  },
  {
    name: "search_docs",
    description: "Search the internal documentation.",
    schema: z.object({ query: z.string() }),
  }
);

const AGENT_SPECS = {
  support: {
    tools: [getOrderStatus],
    prompt: "You are a friendly support agent. Be brief and accurate.",
  },
  coding: {
    tools: [],
    prompt:
      "You are a senior software engineer. Explain your reasoning " +
      "and show code when it helps.",
  },
  research: {
    tools: [searchDocs],
    prompt:
      "You are a research assistant. Cite what you found and say " +
      "when you're unsure.",
  },
} as const;

const agentCache = new Map<string, ReturnType<typeof createAgent>>();

function buildAgent(name: Route["agent"], tier: Tier) {
  const key = `${name}:${tier}`;
  if (!agentCache.has(key)) {
    const spec = AGENT_SPECS[name];
    agentCache.set(
      key,
      createAgent({
        model: MODEL_TIERS[tier],
        tools: [...spec.tools],
        systemPrompt: spec.prompt,
      })
    );
  }
  return agentCache.get(key)!;
}
```

Creating an agent is cheap, but with the `Map` we only create each combination of agent and tier once.

##### Connecting everything with LangGraph

Now the orchestration part. In LangGraph we define a graph of nodes that share a state. For the state we use `Annotation`: we reuse `MessagesAnnotation` for the conversation and add a `route` field to save what the router decided.

```typescript
import {
  Annotation,
  MessagesAnnotation,
  StateGraph,
  START,
  END,
} from "@langchain/langgraph";

const State = Annotation.Root({
  ...MessagesAnnotation.spec,
  route: Annotation<Route>(),
});

async function router(state: typeof State.State) {
  const route = await routerModel.invoke([
    { role: "system", content: ROUTER_PROMPT },
    ...state.messages,
  ]);
  return { route };
}

async function runAgent(state: typeof State.State) {
  const { agent: name, tier } = state.route;
  const agent = buildAgent(name, tier);
  const result = await agent.invoke({ messages: state.messages });
  // Only return the new messages; the messages reducer appends them
  return { messages: result.messages.slice(state.messages.length) };
}

const app = new StateGraph(State)
  .addNode("router", router)
  .addNode("runAgent", runAgent)
  .addEdge(START, "router")
  .addEdge("router", "runAgent")
  .addEdge("runAgent", END)
  .compile();
```

In this example the router always goes to `runAgent`, so normal edges are enough. If later you want to send some requests to a person, or answer directly without an agent, you can change that edge to `addConditionalEdges`, or return a `Command` with `goto` from the router.

##### Let's try it!

```typescript
const requests = [
  "Where is my order 1042?",
  "Explain the difference between LangChain and LangGraph.",
  "Review this function and tell me why it deadlocks under load: ...",
];

for (const text of requests) {
  const result = await app.invoke({
    messages: [{ role: "user", content: text }],
  });
  console.log(result.route);
  console.log(result.messages.at(-1)?.content, "\n");
}
```

You should see something like this (I cut the answers):

```text
{ agent: 'support', tier: 'fast', reason: 'Simple order status lookup.' }
Your order 1042 shipped on Nov 22 and should arrive Nov 27.

{ agent: 'research', tier: 'fast', reason: 'Short conceptual comparison.' }
LangChain gives you the building blocks... LangGraph adds stateful orchestration...

{ agent: 'coding', tier: 'deep', reason: 'Concurrency bug needs careful reasoning.' }
The deadlock happens because both workers acquire the locks in opposite order...
```

The exact routes can change a little depending on the model, but the idea is that only the hard request goes to the big model.

### Some things to consider

This example is very simple, and before using something like this in a real app there are a few things I would add:

- If the agent on the `fast` tier fails (for example, a tool call fails or the answer is empty), try again with the next tier. In LangGraph this is a conditional edge back to `runAgent`.
- Let the user choose the tier, for example with a "try again with a better model" button. If the tier comes in the state, we skip the router.
- Log the `reason` that the router returns (LangSmith helps a lot here), so we can see when it's choosing the wrong tier and adjust the descriptions.
- Have a small list of requests with the agent and tier that we expect, so we can test the router when we change the prompt or the model.

Also, keep in mind that the router is one more model call on every request. If your app doesn't have a lot of traffic, or all the requests are complex, maybe a single good model is enough.

At the end, we built a router that sends each request to the right agent and the right model, using LangChain.js for the agents and LangGraph.js for the orchestration. I hope that in future posts we can see more complex orchestration patterns, like agents that work in parallel or hand off tasks to each other.

If you want the source code of the example, go to my GitHub: [https://github.com/tavobarrientos/langchain-example](https://github.com/tavobarrientos/langchain-example)

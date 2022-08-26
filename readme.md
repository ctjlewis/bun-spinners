# Bun Spinners

Simple tool for logging any number of spinners.

#### Preview

![](/assets/spinners-demo.gif)

#### Preview code

See `test/index.test.ts`.

```ts
import { spinners } from "bun-spinners";

const sleep = (ms: number) => new Promise(
  (resolve) => setTimeout(resolve, ms)
);

try {
  await spinners({
    "Starting APU...": async () => {
      await sleep(1000);
    },

    "Starting engines...": async () => {
      await sleep(5000);
      throw "Fuel mixture set to cutoff.";
    },

    "Setting flaps...": async () => {
      await sleep(2000);
    }
  })
} catch (e) {
  await spinners({
    "Aborting takeoff...": async () => {
      await sleep(3000);
    }
  });
}
```
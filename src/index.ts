import { LogStyles, style } from "bun-style";
import * as cliSpinners from "cli-spinners";

export interface SpinnerConfigs {
  [text: string]: () => Promise<void>;
}

export type SpinnerState = "running" | "success" | "failure";

export const spinners = async (
  configs: SpinnerConfigs,
  spinner: cliSpinners.SpinnerName = "dots",
) => {
  let failed = 0;
  let finished = 0;

  const spinnerEntries = Object.entries(configs);
  const spinnerStates: Map<string, SpinnerState> = new Map();
  const spinnerErrors = new Map<string, string>();

  /**
   * Initialize all spinner states to "running".
   */
  for (const [text] of spinnerEntries) {
    spinnerStates.set(
      text,
      "running"
    );
  }

  await Promise.all([
    /**
     * Run spinners.
     */
    (async () => {
      const { frames, interval } = cliSpinners[spinner];

      while (finished < spinnerEntries.length) {
        for (const frame of frames) {
          let frameOutput = "";

          for (const [text] of spinnerEntries) {
            const state = spinnerStates.get(text);

            let prefix = frame;
            const lineStyles: LogStyles[] = ["bold"];

            switch (state) {
              case "success":
                prefix = "✓";
                lineStyles.push("green")
                break;

              case "failure":
                prefix = "✗";
                lineStyles.push("red")
                break;
            }

            frameOutput += style(`\n  ${prefix}  ${text}\n\r`, lineStyles);

            const errors = spinnerErrors.get(text);
            if (errors) {
              frameOutput += style(`     ${errors}\n\r`, ["red"]);
            }
          }

          // console.log("\033[H\033[J");
          console.clear();
          console.log(style(`${frameOutput}\n`, ["grey"]));
          await new Promise((resolve) => setTimeout(resolve, interval));
        }
      }
    })(),
    /**
     * Execute spinner processes.
     */
    Promise.all(
      spinnerEntries.map(
        async ([text, fn]) => {
          spinnerStates.set(text, "running");
          try {
            await fn();
            spinnerStates.set(text, "success");
          } catch (e) {
            spinnerStates.set(text, "failure");
            spinnerErrors.set(text, e?.toString());
            failed++;
          } finally {
            finished++;
          }
        }
      )
    ),
  ]);

  if (failed > 0) {
    throw `${failed} spinner(s) failed.`;
  }
};
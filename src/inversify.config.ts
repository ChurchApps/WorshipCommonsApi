import { AsyncContainerModule } from "inversify";

export const bindings = new AsyncContainerModule(async () => {
  await import("./controllers");
});

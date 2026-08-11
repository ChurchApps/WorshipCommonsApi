import { init } from "./App";
import { Environment } from "./helpers/Environment";

const port = Number(process.env.PORT || process.env.SERVER_PORT || 8098);

Environment.init(process.env.APP_ENV || "dev").then(() => {
  init().then(app => {
    app.listen(port, "0.0.0.0", () => {
      console.log(`WorshipCommonsApi running on port ${port}`);
    });
  });
});

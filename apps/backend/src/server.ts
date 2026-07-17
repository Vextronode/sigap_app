import "dotenv/config";
import { setDefaultResultOrder } from "node:dns";
import { startAlertScheduler } from "./scheduler/alert.scheduler.js";

setDefaultResultOrder("ipv4first");

import app from "./app.js";

const PORT = process.env.PORT ?? 3000;

app.listen(PORT, () => {
  console.log(`SIGAP backend running on port ${PORT}`);
});

startAlertScheduler();
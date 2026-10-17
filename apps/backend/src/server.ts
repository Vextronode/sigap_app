import "dotenv/config";
import { setDefaultResultOrder } from "node:dns";
import { startAlertScheduler } from "./scheduler/alert.scheduler.js";

setDefaultResultOrder("ipv4first");

import app from "./app.js";

const PORT = process.env.PORT ?? 3000;

app.listen(PORT, () => {
  console.log(`SIGAP backend running on port ${PORT}`);
});

if (process.env.ENABLE_LOCAL_SCHEDULER === "true") {
  startAlertScheduler();
} else {
  console.log(
    "[AlertScheduler] Local background scheduler dinonaktifkan secara default untuk menghemat kuota compute Neon Cloud. Set ENABLE_LOCAL_SCHEDULER=true di .env jika ingin mengaktifkan pengujian berkala lokal."
  );
}
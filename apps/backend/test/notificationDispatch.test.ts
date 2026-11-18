import assert from "node:assert/strict";
import { beforeEach, mock, test } from "node:test";

type Sub = { endpoint: string; p256dh: string; auth: string };

const state = {
  subscriptions: [] as Sub[],
  /** Status HTTP penolakan per endpoint; endpoint tanpa entri berhasil terkirim. */
  failures: new Map<string, number>(),
  deleted: [] as string[],
  inFlight: 0,
  maxInFlight: 0,
  timeouts: [] as unknown[],
  upserts: 0,
};

const src = (path: string) => new URL(`../src/${path}`, import.meta.url).href;

mock.module(src("config/prisma.ts"), {
  namedExports: {
    prisma: {
      pushSubscription: {
        findMany: async () => state.subscriptions,
        deleteMany: async ({ where }: { where: { endpoint: { in: string[] } } }) => {
          state.deleted.push(...where.endpoint.in);
          return { count: where.endpoint.in.length };
        },
        upsert: async () => {
          state.upserts++;
          return {};
        },
      },
      notificationLog: { create: async () => ({}), findFirst: async () => null },
    },
  },
});

mock.module(src("config/webPush.ts"), {
  namedExports: {
    VAPID_PUBLIC_KEY: "",
    webpush: {
      sendNotification: async (
        subscription: { endpoint: string },
        _body: string,
        options: { timeout?: number }
      ) => {
        state.timeouts.push(options.timeout);
        state.inFlight++;
        state.maxInFlight = Math.max(state.maxInFlight, state.inFlight);
        await new Promise((resolve) => setTimeout(resolve, 1));
        state.inFlight--;
        const statusCode = state.failures.get(subscription.endpoint);
        if (statusCode !== undefined) {
          throw Object.assign(new Error(`HTTP ${statusCode}`), { statusCode });
        }
        return { statusCode: 201 };
      },
    },
  },
});

const { NotificationService } = await import("../src/services/notification.service.js");
const { NotificationController } = await import("../src/controllers/notification.controller.js");

const notification = {
  payload: { alertId: null, level: "ORANGE", title: "t", body: "b" },
  ttlSeconds: 60,
  urgency: "high",
} as unknown as Parameters<typeof NotificationService.dispatch>[0];

const subs = (count: number, prefix = "ok"): Sub[] =>
  Array.from({ length: count }, (_, index) => ({
    endpoint: `https://fcm.googleapis.com/fcm/send/${prefix}-${index}`,
    p256dh: "p",
    auth: "a",
  }));

beforeEach(() => {
  state.subscriptions = [];
  state.failures = new Map();
  state.deleted = [];
  state.inFlight = 0;
  state.maxInFlight = 0;
  state.timeouts = [];
  state.upserts = 0;
});

test("dispatch paling banyak 50 pengiriman bersamaan dengan timeout 10 detik", async () => {
  state.subscriptions = subs(180);
  const result = await NotificationService.dispatch(notification);

  assert.equal(result.sent, 180);
  assert.equal(state.maxInFlight, 50);
  assert.ok(state.timeouts.every((timeout) => timeout === 10_000));
});

test("subscription 400/403/404/410 dihapus bila ada pengiriman lain yang berhasil", async () => {
  const [ok, bad400, bad403, gone404, gone410, serverError] = subs(6);
  state.subscriptions = [ok, bad400, bad403, gone404, gone410, serverError];
  state.failures = new Map([
    [bad400.endpoint, 400],
    [bad403.endpoint, 403],
    [gone404.endpoint, 404],
    [gone410.endpoint, 410],
    [serverError.endpoint, 500],
  ]);

  const result = await NotificationService.dispatch(notification);

  assert.equal(result.sent, 1);
  assert.deepEqual(
    [...state.deleted].sort(),
    [bad400.endpoint, bad403.endpoint, gone404.endpoint, gone410.endpoint].sort()
  );
});

test("400/403 tidak dihapus bila seluruh pengiriman gagal; 404/410 tetap dihapus", async () => {
  const [bad400, bad403, gone410] = subs(3);
  state.subscriptions = [bad400, bad403, gone410];
  state.failures = new Map([
    [bad400.endpoint, 400],
    [bad403.endpoint, 403],
    [gone410.endpoint, 410],
  ]);

  await NotificationService.dispatch(notification);

  assert.deepEqual(state.deleted, [gone410.endpoint]);
});

const VALID_P256DH = Buffer.alloc(65, 4).toString("base64url");
const VALID_AUTH = Buffer.alloc(16, 1).toString("base64url");

const callSubscribe = async (keys: { p256dh: unknown; auth: unknown }) => {
  let statusCode = 0;
  const res = {
    status(code: number) {
      statusCode = code;
      return this;
    },
    json() {
      return this;
    },
  };
  await NotificationController.subscribe(
    { body: { endpoint: "https://fcm.googleapis.com/fcm/send/x", keys }, headers: {} } as never,
    res as never
  );
  return statusCode;
};

test("subscribe menolak kunci yang tidak sesuai format Web Push", async () => {
  assert.equal(await callSubscribe({ p256dh: "abc", auth: VALID_AUTH }), 400);
  assert.equal(await callSubscribe({ p256dh: VALID_P256DH, auth: "abc" }), 400);
  assert.equal(await callSubscribe({ p256dh: `${VALID_P256DH}!`, auth: VALID_AUTH }), 400);
  assert.equal(await callSubscribe({ p256dh: 123, auth: VALID_AUTH }), 400);
  assert.equal(state.upserts, 0);

  assert.equal(await callSubscribe({ p256dh: VALID_P256DH, auth: VALID_AUTH }), 201);
  assert.equal(state.upserts, 1);
});

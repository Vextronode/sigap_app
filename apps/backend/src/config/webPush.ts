import webpush from "web-push";

const publicKey = process.env.VAPID_PUBLIC_KEY;
const privateKey = process.env.VAPID_PRIVATE_KEY;
const subject = process.env.VAPID_SUBJECT ?? "mailto:admin@sigap.desa.id";

if (!publicKey || !privateKey) {
  throw new Error(
    "VAPID_PUBLIC_KEY dan VAPID_PRIVATE_KEY wajib diisi di .env untuk fitur push notification. " +
      "Generate dengan: node -e \"console.log(require('web-push').generateVAPIDKeys())\""
  );
}

webpush.setVapidDetails(subject, publicKey, privateKey);

export const VAPID_PUBLIC_KEY: string = publicKey;
export { webpush };

import type { ReactNode } from "react";
import { AlertTriangle, Inbox } from "lucide-react";

type StateMessageProps = {
  title: string;
  message: string;
  type?: "empty" | "error";
  action?: ReactNode;
};

export const StateMessage = ({ title, message, type = "empty", action }: StateMessageProps) => {
  const Icon = type === "error" ? AlertTriangle : Inbox;

  return (
    <div className={`state-message state-message--${type}`} role={type === "error" ? "alert" : "status"}>
      <Icon size={22} aria-hidden="true" />
      <div>
        <strong>{title}</strong>
        <p>{message}</p>
        {action}
      </div>
    </div>
  );
};

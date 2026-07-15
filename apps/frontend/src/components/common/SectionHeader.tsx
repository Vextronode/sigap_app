import type { ReactNode } from "react";

type SectionHeaderProps = {
  id?: string;
  title: string;
  icon?: ReactNode;
  action?: ReactNode;
};

export const SectionHeader = ({ id, title, icon, action }: SectionHeaderProps) => (
  <div className="section-header" id={id}>
    <div className="section-header__title">
      {icon}
      <h2>{title}</h2>
    </div>
    {action}
  </div>
);

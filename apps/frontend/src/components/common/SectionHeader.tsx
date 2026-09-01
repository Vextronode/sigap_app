import React, { type ReactNode } from "react";

type SectionHeaderProps = {
  id?: string;
  title: string;
  icon?: ReactNode;
  action?: ReactNode;
};

export const SectionHeader = ({ id, title, icon, action }: SectionHeaderProps) => (
  <div className="section-header flex items-center justify-between mb-4 mt-6" id={id}>
    <div className="section-header__title flex items-center gap-3">
      {icon && (
        <span className="text-[#0b46ad] flex items-center justify-center">
          {React.isValidElement(icon)
            ? React.cloneElement(icon as React.ReactElement<{ size?: number }>, {
                size: 28, 
              })
            : icon}
        </span>
      )}

      <h2 className="text-xl font-bold tracking-tight">
        {title}
      </h2>
    </div>

    {action && <div className="section-header__action">{action}</div>}
  </div>
);
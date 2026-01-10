import React from "react";

export default function PageHeader({ title, description, actions, breadcrumbs }) {
  return (
    <div className="mb-8">
      {breadcrumbs && (
        <nav className="mb-4">
          <ol className="flex items-center gap-2 text-sm">
            {breadcrumbs.map((crumb, index) => (
              <li key={index} className="flex items-center gap-2">
                {index > 0 && <span className="text-slate-600">/</span>}
                {crumb.href ? (
                  <a href={crumb.href} className="text-slate-400 hover:text-white transition-colors">
                    {crumb.label}
                  </a>
                ) : (
                  <span className="text-slate-400">{crumb.label}</span>
                )}
              </li>
            ))}
          </ol>
        </nav>
      )}
      
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">{title}</h1>
          {description && (
            <p className="text-slate-400 mt-2 max-w-2xl">{description}</p>
          )}
        </div>
        {actions && (
          <div className="flex items-center gap-3 flex-shrink-0">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}
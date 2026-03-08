import React from "react";

export default function Layout({ children, currentPageName }) {
  // Full-bleed pages that handle their own layout
  const fullBleedPages = ["Home", "CreateBook", "BookPreview", "Checkout", "SharedBook", "Pricing", "Dashboard", "MyLibrary", "OrderSuccess"];
  
  if (fullBleedPages.includes(currentPageName)) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen gradient-soft">
      {children}
    </div>
  );
}
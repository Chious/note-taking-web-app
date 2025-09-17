"use client";

import { ApiReferenceReact } from "@scalar/api-reference-react";
import "@scalar/api-reference-react/style.css";

/**
 * Scalar API Reference component for displaying OpenAPI documentation
 * This replaces the old SwaggerUI component and is fully compatible with React 19
 */
export function SwaggerWrapper() {
  return (
    <div className="h-screen w-full">
      <ApiReferenceReact
        configuration={{
          _integration: "nextjs",
          url: "/openapi.json",
          theme: "default",
          layout: "modern",
          hideModels: false,
        }}
      />
    </div>
  );
}

import { ClerkProvider, useAuth } from "@clerk/clerk-react";
import {
  RouterProvider,
  createRouter,
  parseSearchWith,
  stringifySearchWith,
} from "@tanstack/react-router";
import { ConvexReactClient } from "convex/react";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import ReactDOM from "react-dom/client";
import { routeTree } from "./routeTree.gen";
import { ConvexQueryCacheProvider } from "convex-helpers/react/cache";

import "./global.css";
import {
  uriDecodeAndParse,
  uriEncodeAndStringify,
} from "./utils/url-encoding-decoding";

const reactConvexClient = new ConvexReactClient(
  import.meta.env.VITE_CONVEX_URL as string
);

// Set up a Router instance
const router = createRouter({
  routeTree,
  defaultPreload: "intent",
  context: {
    title: "Dashboard",
  },
  stringifySearch: stringifySearchWith(uriEncodeAndStringify),
  parseSearch: parseSearchWith(uriDecodeAndParse),
});

// Register things for typesafety
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

const rootElement = document.getElementById("app")!;

if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <ClerkProvider publishableKey={import.meta.env.VITE_CLERK_PUBLISHABLE_KEY}>
      <ConvexProviderWithClerk client={reactConvexClient} useAuth={useAuth}>
        <ConvexQueryCacheProvider>
          <RouterProvider router={router} />
        </ConvexQueryCacheProvider>
      </ConvexProviderWithClerk>
    </ClerkProvider>
  );
}

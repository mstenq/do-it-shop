import { App } from "@/components/app";
import { OverlayProvider } from "@/components/overlay";
import { ThemeProvider } from "@/components/theme-provider";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";
import { SignInButton } from "@clerk/clerk-react";
import {
  createRootRouteWithContext,
  useRouterState,
} from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";
import { Authenticated, AuthLoading, Unauthenticated } from "convex/react";

interface MyRouterContext {
  title: string;
}

const ErrorComponent = ({ error, reset }: any) => {
  return (
    <div>
      <pre>{JSON.stringify(error, null, 2)}</pre>
      <Button onClick={reset}>Reset</Button>
    </div>
  );
};

export const Route = createRootRouteWithContext<MyRouterContext>()({
  component: RootComponent,
  errorComponent: ErrorComponent,
});

function RootComponent() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="do-it-shop-theme">
      <OverlayProvider>
        <div className="light">
          <Unauthenticated>
            <SignInButton />
          </Unauthenticated>
          <Authenticated>
            <App />
            {/* <TanStackRouterDevtools position="bottom-right" /> */}
          </Authenticated>
          <AuthLoading>
            <div className="grid w-full h-screen place-items-center">
              Authenticating user...
            </div>
          </AuthLoading>
          <Toaster />
        </div>
      </OverlayProvider>
    </ThemeProvider>
  );
}

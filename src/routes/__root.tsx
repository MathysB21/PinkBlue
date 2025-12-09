import { createRootRoute, Link, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";

export const Route = createRootRoute({
  component: () => (
    <>
      <div className="min-h-screen bg-gray-900 text-white font-sans antialiased selection:bg-pink-500 selection:text-white">
        {/* Navigation / Header - visible on all pages, maybe hidden on game via conditional logic later if needed */}
        <nav className="p-4 flex gap-4 text-lg font-bold border-b border-gray-800 bg-gray-900/50 backdrop-blur-md sticky top-0 z-50">
          <Link
            to="/"
            className="text-pink-400 hover:text-pink-300 transition-colors"
          >
            PinkBlue
          </Link>
        </nav>

        <main className="container mx-auto p-4">
          <Outlet />
        </main>
      </div>
      <TanStackRouterDevtools />
    </>
  ),
});

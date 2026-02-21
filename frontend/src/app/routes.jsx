import { createBrowserRouter } from "react-router";
import { Layout } from "./components/layout";
import { LandingPage } from "./components/landing-page";
import { AuthPage } from "./components/auth-page";
import { CreatorProfile } from "./components/creator-profile";
import { BrandProfile } from "./components/brand-profile";
import { CreatorDiscovery } from "./components/creator-discovery";
import { BrandDashboard } from "./components/brand-dashboard";
import { BrandRequirements } from "./components/brand-requirements";
import { RatingReviews } from "./components/rating-reviews";
import { NotFound } from "./components/not-found";
import { ProtectedRoute } from "./components/protected-route";
import { RoleDashboard } from "./components/role-dashboard";
import { Inbox } from "./components/inbox";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: LandingPage },
      { path: "auth", Component: AuthPage },
      { path: "creators", Component: CreatorDiscovery },
      { path: "creators/:id", Component: CreatorProfile },
      { path: "brands/profile", Component: BrandDashboard },
      { path: "creator/profile", Component: CreatorProfile },
      { path: "brands/:id/profile", Component: BrandProfile },
      { path: "brands/:id", Component: BrandProfile },
      { path: "requirements", Component: BrandRequirements },
      { path: "reviews", Component: RatingReviews },
      {
        path: "messages",
        element: (
          <ProtectedRoute>
            <Inbox />
          </ProtectedRoute>
        ),
      },
      {
        path: "messages/:userId",
        element: (
          <ProtectedRoute>
            <Inbox />
          </ProtectedRoute>
        ),
      },
      {
        path: "dashboard",
        element: (
          <ProtectedRoute>
            <RoleDashboard />
          </ProtectedRoute>
        ),
      },
      { path: "*", Component: NotFound },
    ],
  },
]);

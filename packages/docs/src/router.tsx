// eslint-disable-next-line no-restricted-imports
import { createBrowserRouter, ScrollRestoration } from "react-router-dom";

import HomeLayout from "./views/Home";

 const router = createBrowserRouter([
  {
    element: (
      <>
        <ScrollRestoration getKey={(location) => location.pathname} />
        <HomeLayout />
      </>
    ),
    children: [
      {
        path: "/",
        lazy: () => import("./examples/UserRulerts"),
      },
    ],
  },
]);
export default router

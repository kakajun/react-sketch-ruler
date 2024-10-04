// eslint-disable-next-line no-restricted-imports
import { createBrowserRouter, ScrollRestoration } from "react-router-dom";

import { Layout } from "shared/Layout";

import { cartPageLoader } from "./Cart/loader";
import { homePageLoader } from "./Home/loader";
import { productPageLoader } from "./Product/loader";
import { productsPageLoader } from "./Products/loader";

export const router = createBrowserRouter([
  {
    element: (
      <>
        <ScrollRestoration getKey={(location) => location.pathname} />
        <Layout />
      </>
    ),
    children: [
      {
        path: "/",
        lazy: () => import("./Home"),
      },
    ],
  },
]);

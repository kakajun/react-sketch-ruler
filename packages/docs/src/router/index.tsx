
import { RouterProvider, createBrowserRouter } from "react-router-dom";

export default function Router() {

	let baseRouter: any[] = [
		{
			path: "/",
			children: [
				{
					index: true,
					lazy: () => import("@/pages/Home"),
				},
			],
		},
	];



	const routers =baseRouter;

	const router = createBrowserRouter(routers);

	return (
		<>
			<RouterProvider router={router} fallbackElement={<p>Loading...</p>} />
		</>
	);
}

import {auth} from "@/auth";
import {redirect} from "next/navigation";
import ROUTES from "@/constants/routes";

const Page = async () => {
	const session = await auth();
  if (!session?.user?.id) redirect(ROUTES.SIGN_IN);

	return (
		<h1>not available, redirecting to sign-in page</h1>
	)
};

export default Page;
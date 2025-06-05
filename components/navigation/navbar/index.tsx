import Link from "next/link";
import Image from "next/image";
import Theme from "@/components/navigation/navbar/Theme";
import MobileNavigation from "@/components/navigation/navbar/MobileNavigation";

const Navbar = () => {
	return (
		<nav className="flex-between background-light900_dark200 fixed z-50 w-full p-6 dark:shadow-none sm:px-12 shadow-light-300">
			<Link href="/" className="flex items-center gap-1">
				<Image
					src="/images/site-logo.svg"
					width={23}
					height={23}
					alt="SWEOverflow Logo"
					className="active-theme"
				/>
				<p className="h2-bold font-space-grotesk text-dark-100 dark:text-light-900 max-sm:hidden">
					SWE<span className="text-primary-500">Overflow</span>
				</p>
			</Link>

			<p>Global Search</p>

			<div className="flex-between gap-5">
				<Theme />
				<MobileNavigation />
			</div>
		</nav>
	);
};

export default Navbar;
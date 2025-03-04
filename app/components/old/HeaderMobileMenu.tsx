import React from "react";
import HeaderNavigation from "./HeaderNavigation";
import SearchBlock from "./SearchBlock";
import CloseIcon from "./icons/CloseIcon";
import MobileMenuIcon from "./icons/MobileMenuIcon";

export default function HeaderMobileMenu() {
	const mobileMenuBtnRef = React.useRef<HTMLInputElement>(null);
	return (
		<div>
			<input
				title="mobile menu button"
				type="checkbox"
				data-mobile-menu-switcher
				id="mobile-menu-switcher"
				ref={mobileMenuBtnRef}
			/>
			<div className="mobile-menu-canvas transition">
				<div className="bg-white p-4 pt-1 shadow-lg">
					<div className="flex items-center">
						<div className="flex-1 pr-4">
							<SearchBlock showButton={false} />
						</div>
						<label
							className="-mr-3 block cursor-pointer rounded bg-slate-100 p-3 text-slate-500"
							htmlFor="mobile-menu-switcher"
						>
							<CloseIcon />
						</label>
					</div>
					<div className="py-4">
						<div className="w-3/4">
							<HeaderNavigation
								onClick={() => {
									if (mobileMenuBtnRef.current) {
										mobileMenuBtnRef.current.checked = false;
									}
								}}
							/>
						</div>
					</div>
				</div>
				<label htmlFor="mobile-menu-switcher" className="block flex-1" />
			</div>
			<label
				className="-mr-3 block cursor-pointer rounded p-3 text-slate-500"
				htmlFor="mobile-menu-switcher"
			>
				<MobileMenuIcon />
			</label>
		</div>
	);
}

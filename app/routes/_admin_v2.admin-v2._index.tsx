import { href, replace } from "react-router";

export const loader = () => {
	throw replace(href("/admin-v2/clients"));
};

export default function AdminIndex() {
	return <p>Admin index page</p>;
}

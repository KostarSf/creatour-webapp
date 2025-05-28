import type { User } from "@prisma-app/client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { cn } from "~/lib/utils";
import type { LiteUser } from "~/models/users";

interface UsersSelectProps {
	defaultId?: string | null;
	required?: boolean;
	name: string;
	id?: string;
	className?: string;
	users: LiteUser[];
}

function UsersSelect({ defaultId, users, name, id, required, className }: UsersSelectProps) {
	return (
		<Select name={name} defaultValue={defaultId ?? (required ? users.at(0)?.id : "-")}>
			<SelectTrigger id={id ?? name} className={cn("w-full", className)}>
				<SelectValue />
			</SelectTrigger>
			<SelectContent>
				{!required ? (
					<SelectItem value="-">
						<span className="italic">-- Отсутствует --</span>
					</SelectItem>
				) : null}
				{users.map((user) => (
					<SelectItem key={user.id} value={user.id}>
						{user.legalName} ({user.username})
					</SelectItem>
				))}
			</SelectContent>
		</Select>
	);
}

export { UsersSelect };

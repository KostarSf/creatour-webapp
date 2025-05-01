import { AlertCircleIcon, LoaderCircleIcon } from "lucide-react";
import { href, useFetcher } from "react-router";

import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { Button } from "~/components/ui/button";
import type { SendConfirmationEmailAction } from "~/routes/api.send-confirmation-email";

function AccountConfirmationAlert({ emailSent }: { emailSent: boolean }) {
	const fetcher = useFetcher<SendConfirmationEmailAction>();

	return (
		<Alert variant="warning">
			<AlertCircleIcon />
			<AlertTitle>Пожалуйста, подтвердите Email</AlertTitle>
			<AlertDescription>
				Без подтверждения электронной почты вы не сможете восстановить пароль
				<div className="mt-2">
					{!fetcher.data && !emailSent && (
						<fetcher.Form method="POST" action={href("/api/send-confirmation-email")}>
							<Button type="submit" variant="secondary" disabled={fetcher.state !== "idle"}>
								{fetcher.state !== "idle" ? (
									<LoaderCircleIcon className="animate-spin" />
								) : (
									"Отправить письмо подтверждения"
								)}
							</Button>
						</fetcher.Form>
					)}
					{fetcher.data?.success === false && (
						<p className="text-destructive">
							{fetcher.data.detail ?? "Не удалось отправить письмо"}
						</p>
					)}
					{(fetcher.data?.success || emailSent) && (
						<p className="text-foreground">Письмо подтверждение отправлено на указанную почту</p>
					)}
				</div>
			</AlertDescription>
		</Alert>
	);
}

export { AccountConfirmationAlert };

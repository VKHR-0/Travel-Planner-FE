import { ArrowLeftIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Link from "next/link";
import { CreateProjectForm } from "@/components/projects/create-project-form";
import { Button } from "@/components/ui/button";

export default function NewProjectPage() {
	return (
		<main
			id="main-content"
			className="mx-auto flex min-h-screen w-full max-w-2xl items-center justify-center p-6"
		>
			<div className="w-full space-y-4">
				<Button
					nativeButton={false}
					render={<Link href="/" />}
					variant="outline"
				>
					<HugeiconsIcon aria-hidden="true" icon={ArrowLeftIcon} strokeWidth={2} />
					Back to Projects
				</Button>
				<CreateProjectForm />
			</div>
		</main>
	);
}

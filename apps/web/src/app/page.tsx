import { Features } from "@/components/features";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { Hero } from "@/components/hero";
import { Highlights } from "@/components/highlights";

export default function Home() {
	return (
		<main id="main" className="min-h-screen bg-background">
			<Header />
			<Hero />
			<Features />
			<Highlights />
			<Footer />
		</main>
	);
}

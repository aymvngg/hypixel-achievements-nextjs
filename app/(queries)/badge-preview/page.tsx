import Link from "next/link";
import { BlockPanel } from "@/components/ui/BlockPanel";
import { PixelButton } from "@/components/ui/PixelButton";
import { RankPrefix } from "@/components/player/RankPrefix";
import {
	PLAYER_TAG_STYLES,
	PlayerBadge,
	type TagDisplayVariant,
} from "@/components/player/PlayerBadge";
import type { PlayerBadgeType } from "@/lib/util/special-players";

const ALL_TAGS: PlayerBadgeType[] = [
	"owner",
	"early-tester",
	"mommy",
	"technoblade",
	"bored",
];

const RANK = "MVP++";
const NICKNAME = "Aymvn";

function NameLine({ variant }: { variant: TagDisplayVariant }) {
	return (
		<div className="flex items-center gap-2 flex-wrap min-w-0">
			<span className="font-[family-name:var(--font-pixel)] text-2xl tracking-[0.06em] leading-tight whitespace-nowrap">
				<RankPrefix rank={RANK} />
				<span className="text-mc-gold">{NICKNAME}</span>
			</span>
			{ALL_TAGS.map((type) => (
				<PlayerBadge key={type} type={type} variant={variant} />
			))}
		</div>
	);
}

function VariantSection({
	variant,
	title,
	blurb,
}: {
	variant: TagDisplayVariant;
	title: string;
	blurb: string;
}) {
	return (
		<BlockPanel className="space-y-3">
			<div>
				<h2 className="font-[family-name:var(--font-pixel)] text-sm text-mc-sky uppercase tracking-wider">
					{title}
				</h2>
				<p className="text-xs text-mc-stone-light">{blurb}</p>
			</div>
			<NameLine variant={variant} />
		</BlockPanel>
	);
}

export default function BadgePreviewPage() {
	return (
		<div className="space-y-6 py-4 max-w-3xl mx-auto">
			<div className="text-center space-y-2">
				<h1 className="font-[family-name:var(--font-pixel)] text-2xl text-mc-gold">
					Custom Tag Preview
				</h1>
				<p className="text-xs font-[family-name:var(--font-pixel)] uppercase text-mc-stone-light tracking-wider">
					Compare display styles before committing to one
				</p>
			</div>

			<VariantSection
				variant="inline"
				title="Inline (same size)"
				blurb="Tags match the name exactly, like a Minecraft rank prefix. Authentic but can overflow on small screens."
			/>
			<VariantSection
				variant="small"
				title="Inline (smaller)"
				blurb="Same position, slightly smaller and vertically centered. Distinct but reads like part of the name."
			/>
			<VariantSection
				variant="block"
				title="Badge pill"
				blurb="Compact bordered chips behind the tag text. Clear separation from the name, good for tight layouts."
			/>
			<VariantSection
				variant="pill"
				title="Badge pill (Minecraft font)"
				blurb="Same bordered chip, but the tag text uses the pixel font for a more authentic look."
			/>

			<BlockPanel className="space-y-3">
				<div>
					<h2 className="font-[family-name:var(--font-pixel)] text-sm text-mc-sky uppercase tracking-wider">
						Color reference
					</h2>
					<p className="text-xs text-mc-stone-light">
						Current tag colors for each role.
					</p>
				</div>
				<div className="flex flex-wrap gap-2">
					{ALL_TAGS.map((type) => {
						const { label, color } = PLAYER_TAG_STYLES[type];
						return (
							<span
								key={type}
								className="font-[family-name:var(--font-pixel)] text-xs"
								style={{ color }}
							>
								[{label}]
							</span>
						);
					})}
				</div>
			</BlockPanel>

			<div className="text-center">
				<Link href="/">
					<PixelButton variant="stone" className="px-6">
						Back to Home
					</PixelButton>
				</Link>
			</div>
		</div>
	);
}

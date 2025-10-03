import { Blog } from "@/types/blog";
// Ghost content rendering - no need for asset utils
import Image from "next/image";

// Barebones lazy-loaded image component
const SampleImageComponent = ({ value, isInline }: unknown) => {
	return (
		<div className='my-10 overflow-hidden rounded-[15px]'>
			<Image
				src={value || "/placeholder-image.jpg"}
				width={800}
				height={400}
				alt={"blog image"}
				loading='lazy'
				style={{
					display: isInline ? "inline-block" : "block",
				}}
			/>
		</div>
	);
};

const _components = {
	types: {
		image: SampleImageComponent,
	},
};

const RenderBodyContent = ({ post }: { post: Blog }) => {
	return (
		<div
			className='prose max-w-none'
			dangerouslySetInnerHTML={{ __html: post?.html || "" }}
		/>
	);
};

export default RenderBodyContent;

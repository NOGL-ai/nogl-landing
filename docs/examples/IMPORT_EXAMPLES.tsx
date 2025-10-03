/**
 * Component Import Examples & Patterns
 *
 * This comprehensive file demonstrates the correct way to import components
 * from each layer of our hybrid architecture, along with real-world usage
 * patterns, performance considerations, and common anti-patterns to avoid.
 *
 * @author Component Architecture Team
 * @version 2.0.0
 * @since 2024-01-01
 */

// ============================================
// ✅ CORRECT IMPORTS - PRODUCTION READY
// ============================================

// 1. Import Untitled UI components from ui/ (ALWAYS import directly)
import { Button, Input, Checkbox, Table, Modal, Select } from "@/components/ui";

// 2. Import design foundations (icons, tokens, utilities)
import { DotIcon, ArrowIcon } from "@/components/foundations";
import { colors, typography, spacing } from "@/components/foundations";

// 3. Import custom atoms (your smallest building blocks)
import {
	Avatar,
	StarRating,
	LikeButton,
	Badge,
	Tag,
	Label,
} from "@/components/atoms";

// 4. Import molecules (composite components)
import {
	UserCard,
	FormItem,
	DatePickerCustomDay,
	SearchBar,
	StatsCard,
} from "@/components/molecules";

// 5. Import organisms (complex components with business logic)
import {
	Header,
	Footer,
	Features,
	Hero,
	Testimonials,
} from "@/components/organisms";

// ============================================
// ⚡ PERFORMANCE OPTIMIZED IMPORTS
// ============================================

// For production builds, consider specific imports for better tree-shaking
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";

// Dynamic imports for large components that aren't always needed
import { lazy, Suspense } from "react";
const Dashboard = lazy(() => import("@/components/organisms/Dashboard"));
const AdminPanel = lazy(() => import("@/components/organisms/AdminPanel"));

// ============================================
// ❌ ANTI-PATTERNS - DON'T DO THIS
// ============================================

// ❌ DON'T: Re-export UI components through atoms
// import { Button } from '@/components/atoms';

// ❌ DON'T: Use nested paths when barrel exports exist
// import Button from '@/components/ui/button';

// ❌ DON'T: Mix relative and absolute imports inconsistently
// import { Button } from '../components/ui';

// ❌ DON'T: Create circular dependencies
// import { UserList } from '@/components/organisms/UserList'; // in molecules

// ❌ DON'T: Import everything from a barrel when you only need one thing
// import * as UI from '@/components/ui'; // Use specific imports instead

// ============================================
// 📝 REAL-WORLD USAGE EXAMPLES
// ============================================

// Example 1: Simple Contact Form
export function ContactForm() {
	const [formData, setFormData] = useState({
		name: "",
		email: "",
		message: "",
		newsletter: false,
	});

	return (
		<form className='mx-auto max-w-md space-y-4'>
			<FormItem label='Full Name' error=''>
				<Input
					placeholder='John Doe'
					value={formData.name}
					onChange={(e) => setFormData({ ...formData, name: e.target.value })}
				/>
			</FormItem>

			<FormItem label='Email' error=''>
				<Input
					type='email'
					placeholder='john@example.com'
					value={formData.email}
					onChange={(e) => setFormData({ ...formData, email: e.target.value })}
				/>
			</FormItem>

			<FormItem label='Message' error=''>
				<Input
					as='textarea'
					placeholder='Your message here...'
					value={formData.message}
					onChange={(e) =>
						setFormData({ ...formData, message: e.target.value })
					}
				/>
			</FormItem>

			<div className='flex items-center space-x-2'>
				<Checkbox
					checked={formData.newsletter}
					onChange={(e) =>
						setFormData({ ...formData, newsletter: e.target.checked })
					}
				/>
				<Label>Subscribe to newsletter</Label>
			</div>

			<Button variant='primary' size='lg' className='w-full'>
				Send Message
			</Button>
		</form>
	);
}

// Example 2: User Profile Card with Actions
export function UserProfileCard({
	user,
	onEdit,
	onDelete,
}: {
	user: {
		id: string;
		name: string;
		email: string;
		avatar?: string;
		rating: number;
		isVerified: boolean;
	};
	onEdit?: () => void;
	onDelete?: () => void;
}) {
	return (
		<UserCard className='max-w-sm'>
			<div className='mb-4 flex items-center space-x-4'>
				<Avatar src={user.avatar} alt={user.name} size='lg' />
				<div className='flex-1'>
					<div className='flex items-center space-x-2'>
						<h3 className='text-lg font-semibold'>{user.name}</h3>
						{user.isVerified && <Badge variant='success'>Verified</Badge>}
					</div>
					<p className='text-sm text-gray-600'>{user.email}</p>
					<StarRating rating={user.rating} />
				</div>
			</div>

			<div className='flex space-x-2'>
				{onEdit && (
					<Button variant='secondary' size='sm' onClick={onEdit}>
						Edit Profile
					</Button>
				)}
				{onDelete && (
					<Button variant='destructive' size='sm' onClick={onDelete}>
						Delete
					</Button>
				)}
			</div>
		</UserCard>
	);
}

// Example 3: Complete Page Layout with Lazy Loading
export function AppLayout({ children }: { children: React.ReactNode }) {
	const [isDashboardOpen, setIsDashboardOpen] = useState(false);

	return (
		<div className='min-h-screen bg-gray-50'>
			<Header onDashboardToggle={() => setIsDashboardOpen(true)} />

			<main className='container mx-auto py-8'>{children}</main>

			<Footer />

			{/* Lazy loaded dashboard modal */}
			{isDashboardOpen && (
				<Modal onClose={() => setIsDashboardOpen(false)}>
					<Suspense fallback={<div>Loading dashboard...</div>}>
						<Dashboard />
					</Suspense>
				</Modal>
			)}
		</div>
	);
}

// Example 4: Complex Data Table with Filtering
export function DataTableExample() {
	const [data, setData] = useState([]);
	const [filter, setFilter] = useState("");
	const [sortBy, setSortBy] = useState("name");

	return (
		<div className='space-y-4'>
			<div className='flex items-center space-x-4'>
				<SearchBar
					placeholder='Search users...'
					value={filter}
					onChange={setFilter}
				/>
				<Select
					value={sortBy}
					onChange={setSortBy}
					options={[
						{ value: "name", label: "Name" },
						{ value: "email", label: "Email" },
						{ value: "rating", label: "Rating" },
					]}
				/>
			</div>

			<Table
				data={data}
				columns={[
					{
						key: "avatar",
						title: "Avatar",
						render: (user) => <Avatar src={user.avatar} alt={user.name} />,
					},
					{
						key: "name",
						title: "Name",
						render: (user) => (
							<div>
								<div className='font-medium'>{user.name}</div>
								<div className='text-sm text-gray-500'>{user.email}</div>
							</div>
						),
					},
					{
						key: "rating",
						title: "Rating",
						render: (user) => <StarRating rating={user.rating} />,
					},
					{
						key: "status",
						title: "Status",
						render: (user) => (
							<Badge variant={user.isActive ? "success" : "warning"}>
								{user.isActive ? "Active" : "Inactive"}
							</Badge>
						),
					},
					{
						key: "actions",
						title: "Actions",
						render: (user) => (
							<div className='flex space-x-2'>
								<Button variant='ghost' size='sm'>
									Edit
								</Button>
								<Button variant='ghost' size='sm'>
									Delete
								</Button>
							</div>
						),
					},
				]}
			/>
		</div>
	);
}

// Example 5: Feature Section with Statistics
export function FeaturesSection() {
	const features = [
		{
			title: "Fast Performance",
			description: "Lightning-fast loading times",
			icon: <DotIcon />,
			stats: "99.9% uptime",
		},
		{
			title: "Secure",
			description: "Enterprise-grade security",
			icon: <ArrowIcon />,
			stats: "256-bit encryption",
		},
		{
			title: "Scalable",
			description: "Grows with your business",
			icon: <DotIcon />,
			stats: "Unlimited users",
		},
	];

	return (
		<section className='bg-white py-16'>
			<div className='container mx-auto px-4'>
				<div className='mb-12 text-center'>
					<h2 className='mb-4 text-3xl font-bold'>Why Choose Us?</h2>
					<p className='mx-auto max-w-2xl text-gray-600'>
						Our platform provides everything you need to succeed
					</p>
				</div>

				<div className='grid grid-cols-1 gap-8 md:grid-cols-3'>
					{features.map((feature, index) => (
						<div key={index} className='text-center'>
							<div className='mb-4'>{feature.icon}</div>
							<h3 className='mb-2 text-xl font-semibold'>{feature.title}</h3>
							<p className='mb-4 text-gray-600'>{feature.description}</p>
							<Badge variant='outline'>{feature.stats}</Badge>
						</div>
					))}
				</div>
			</div>
		</section>
	);
}

// ============================================
// 🎨 ADVANCED STYLING PATTERNS
// ============================================

// Pattern 1: Customizing UI components with Tailwind
export function CustomButton() {
	return (
		<Button
			variant='primary'
			className='transform shadow-lg transition-all duration-200 hover:scale-105 hover:shadow-xl'
		>
			Custom Styled
		</Button>
	);
}

// Pattern 2: Composing atoms into molecules
export function ProfileHeader({
	user,
	onEdit,
}: {
	user: {
		name: string;
		avatar?: string;
		rating: number;
		isOnline: boolean;
	};
	onEdit?: () => void;
}) {
	return (
		<div className='flex items-center gap-4 rounded-lg bg-white p-4 shadow-sm'>
			<div className='relative'>
				<Avatar src={user.avatar} alt={user.name} size='lg' />
				{user.isOnline && (
					<div className='absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-white bg-green-500' />
				)}
			</div>
			<div className='flex-1'>
				<h3 className='text-lg font-semibold'>{user.name}</h3>
				<StarRating rating={user.rating} />
			</div>
			<div className='flex items-center gap-2'>
				<LikeButton />
				{onEdit && (
					<Button variant='ghost' size='sm' onClick={onEdit}>
						Edit
					</Button>
				)}
			</div>
		</div>
	);
}

// Pattern 3: Building organisms from molecules and atoms
export function ProductCard({
	product,
	onAddToCart,
	onToggleFavorite,
}: {
	product: {
		id: string;
		name: string;
		price: number;
		image?: string;
		rating: number;
		isFavorite: boolean;
		discount?: number;
	};
	onAddToCart?: (productId: string) => void;
	onToggleFavorite?: (productId: string) => void;
}) {
	return (
		<div className='overflow-hidden rounded-lg bg-white shadow-md transition-shadow hover:shadow-lg'>
			<div className='relative'>
				<img
					src={product.image}
					alt={product.name}
					className='h-48 w-full object-cover'
				/>
				{product.discount && (
					<Badge variant='destructive' className='absolute right-2 top-2'>
						-{product.discount}%
					</Badge>
				)}
				<Button
					variant='ghost'
					size='sm'
					className='absolute left-2 top-2'
					onClick={() => onToggleFavorite?.(product.id)}
				>
					<LikeButton isActive={product.isFavorite} />
				</Button>
			</div>

			<div className='p-4'>
				<h3 className='mb-2 text-lg font-semibold'>{product.name}</h3>
				<div className='mb-2 flex items-center justify-between'>
					<StarRating rating={product.rating} />
					<span className='text-primary text-2xl font-bold'>
						${product.price}
					</span>
				</div>

				<Button
					variant='primary'
					className='w-full'
					onClick={() => onAddToCart?.(product.id)}
				>
					Add to Cart
				</Button>
			</div>
		</div>
	);
}

// ============================================
// 🔄 COMPONENT COMPOSITION HIERARCHY
// ============================================

/**
 * Organisms use Molecules, Atoms, and UI
 * Example: Complete Feature Section
 */
export function CompleteFeatureSection() {
	return (
		<section className='bg-gray-50 py-16'>
			<div className='container mx-auto px-4'>
				{/* Organism level - complex business logic */}
				<Features
					title='Why Choose Our Platform'
					subtitle='Built for modern teams'
					onFeatureClick={(featureId) => {
						// Business logic
						analytics.track("feature_clicked", { featureId });
					}}
				/>

				{/* Can contain molecules */}
				<div className='mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>
					<UserCard
						user={{
							id: "1",
							name: "Sarah Johnson",
							avatar: "/avatars/sarah.jpg",
							rating: 4.8,
							role: "Product Manager",
						}}
						onEdit={() => console.log("Edit user")}
						onDelete={() => console.log("Delete user")}
					/>

					<UserCard
						user={{
							id: "2",
							name: "Mike Chen",
							avatar: "/avatars/mike.jpg",
							rating: 4.9,
							role: "Developer",
						}}
						onEdit={() => console.log("Edit user")}
					/>
				</div>
			</div>
		</section>
	);
}

/**
 * Molecules use Atoms and UI
 * Example: Advanced Search Bar
 */
export function AdvancedSearchBar({
	onSearch,
	onFilterChange,
}: {
	onSearch: (query: string) => void;
	onFilterChange: (filters: Record<string, any>) => void;
}) {
	const [query, setQuery] = useState("");
	const [filters, setFilters] = useState({
		category: "",
		dateRange: "",
		status: "",
	});

	return (
		<div className='flex flex-col gap-4 rounded-lg bg-white p-4 shadow-sm sm:flex-row'>
			{/* UI component */}
			<div className='flex-1'>
				<Input
					placeholder='Search anything...'
					value={query}
					onChange={(e) => setQuery(e.target.value)}
					className='w-full'
				/>
			</div>

			{/* UI component */}
			<Select
				value={filters.category}
				onChange={(value) => {
					const newFilters = { ...filters, category: value };
					setFilters(newFilters);
					onFilterChange(newFilters);
				}}
				options={[
					{ value: "", label: "All Categories" },
					{ value: "users", label: "Users" },
					{ value: "products", label: "Products" },
					{ value: "orders", label: "Orders" },
				]}
			/>

			{/* UI component */}
			<Button
				variant='primary'
				onClick={() => onSearch(query)}
				className='whitespace-nowrap'
			>
				Search
			</Button>
		</div>
	);
}

/**
 * Atoms use UI and Foundations
 * Example: Custom Status Badge
 */
export function CustomStatusBadge({
	status,
	showIcon = true,
}: {
	status: "active" | "inactive" | "pending" | "error";
	showIcon?: boolean;
}) {
	const statusConfig = {
		active: {
			variant: "success" as const,
			icon: <DotIcon className='text-green-500' />,
			label: "Active",
		},
		inactive: {
			variant: "warning" as const,
			icon: <DotIcon className='text-yellow-500' />,
			label: "Inactive",
		},
		pending: {
			variant: "outline" as const,
			icon: <ArrowIcon className='text-blue-500' />,
			label: "Pending",
		},
		error: {
			variant: "destructive" as const,
			icon: <DotIcon className='text-red-500' />,
			label: "Error",
		},
	};

	const config = statusConfig[status];

	return (
		<Badge variant={config.variant} className='flex items-center gap-1'>
			{showIcon && config.icon}
			{config.label}
		</Badge>
	);
}

// ============================================
// ⚡ PERFORMANCE OPTIMIZATION PATTERNS
// ============================================

// Pattern 1: Memoized Components
export const MemoizedUserCard = React.memo(UserCard);

// Pattern 2: Lazy Loading with Error Boundaries
export function LazyComponentWrapper({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<Suspense
			fallback={
				<div className='flex items-center justify-center p-8'>
					<div className='border-primary h-8 w-8 animate-spin rounded-full border-b-2'></div>
				</div>
			}
		>
			{children}
		</Suspense>
	);
}

// Pattern 3: Conditional Rendering
export function ConditionalFeatureSection({
	user,
	features,
}: {
	user: { role: string; permissions: string[] };
	features: Array<{ id: string; requiresPermission: string }>;
}) {
	const visibleFeatures = features.filter((feature) =>
		user.permissions.includes(feature.requiresPermission)
	);

	if (visibleFeatures.length === 0) {
		return (
			<div className='py-8 text-center'>
				<p className='text-gray-500'>No features available for your role</p>
			</div>
		);
	}

	return (
		<div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>
			{visibleFeatures.map((feature) => (
				<div key={feature.id} className='rounded-lg bg-white p-6 shadow-sm'>
					{/* Feature content */}
				</div>
			))}
		</div>
	);
}

// ============================================
// 🧪 TESTING PATTERNS
// ============================================

// Pattern 1: Testable Component with Props
export function TestableButton({
	children,
	onClick,
	disabled = false,
	variant = "primary",
	"data-testid": testId,
}: {
	children: React.ReactNode;
	onClick?: () => void;
	disabled?: boolean;
	variant?: "primary" | "secondary";
	"data-testid"?: string;
}) {
	return (
		<Button
			variant={variant}
			onClick={onClick}
			disabled={disabled}
			data-testid={testId}
		>
			{children}
		</Button>
	);
}

// Pattern 2: Mock-friendly Component
export function DataDisplay({
	data,
	isLoading,
	error,
	onRetry,
}: {
	data: any[] | null;
	isLoading: boolean;
	error: string | null;
	onRetry?: () => void;
}) {
	if (isLoading) {
		return (
			<div className='flex items-center justify-center p-8'>
				<div className='border-primary h-8 w-8 animate-spin rounded-full border-b-2'></div>
			</div>
		);
	}

	if (error) {
		return (
			<div className='p-8 text-center'>
				<p className='mb-4 text-red-500'>{error}</p>
				{onRetry && (
					<Button variant='secondary' onClick={onRetry}>
						Try Again
					</Button>
				)}
			</div>
		);
	}

	if (!data || data.length === 0) {
		return (
			<div className='p-8 text-center'>
				<p className='text-gray-500'>No data available</p>
			</div>
		);
	}

	return (
		<div className='space-y-4'>
			{data.map((item, index) => (
				<div key={index} className='rounded-lg bg-white p-4 shadow-sm'>
					{/* Render item */}
				</div>
			))}
		</div>
	);
}

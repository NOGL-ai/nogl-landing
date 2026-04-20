"use client";
import React from "react";
import {
	AreaChart,
	Area,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	ResponsiveContainer,
} from "recharts";

const data = [
	{ name: "Sep", value: 23 },
	{ name: "Oct", value: 11 },
	{ name: "Nov", value: 22 },
	{ name: "Dec", value: 27 },
	{ name: "Jan", value: 53 },
	{ name: "Feb", value: 62 },
	{ name: "Mar", value: 37 },
	{ name: "Apr", value: 41 },
	{ name: "May", value: 54 },
	{ name: "Jun", value: 72 },
	{ name: "Jul", value: 63 },
	{ name: "Aug", value: 85 },
];

const ChartOne: React.FC = () => {
	return (
		<div id='chartOne' className='-ml-5'>
			<ResponsiveContainer width='100%' height={300}>
				<AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
					<defs>
						<linearGradient id='colorValue' x1='0' y1='0' x2='0' y2='1'>
							<stop offset='5%' stopColor='#635BFF' stopOpacity={0.3} />
							<stop offset='95%' stopColor='#635BFF' stopOpacity={0} />
						</linearGradient>
					</defs>
					<CartesianGrid strokeDasharray='3 3' vertical={false} />
					<XAxis dataKey='name' tickLine={false} axisLine={false} tick={{ fontSize: 12 }} />
					<YAxis domain={[0, 100]} tickLine={false} axisLine={false} tick={{ fontSize: 12 }} />
					<Tooltip />
					<Area
						type='monotone'
						dataKey='value'
						name='Product One'
						stroke='#635BFF'
						strokeWidth={2}
						fill='url(#colorValue)'
						dot={false}
					/>
				</AreaChart>
			</ResponsiveContainer>
		</div>
	);
};

export default ChartOne;

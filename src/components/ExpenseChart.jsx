import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
const COLORS=['#38bdf8','#818cf8','#fbbf24','#34d399','#fb7185','#c084fc','#f97316','#94a3b8'];
export default function ExpenseChart({categories}) {return <section className="panel"><h2>Expenses by category</h2>{!categories.length?<p>No expense data yet.</p>:<div className="chart"><ResponsiveContainer width="100%" height={310}><PieChart><Pie data={categories} dataKey="value" nameKey="name" cx="50%" cy="45%" outerRadius={95} label>{categories.map((entry,i)=><Cell key={entry.name} fill={COLORS[i%COLORS.length]}/>)}</Pie><Tooltip formatter={value=>`₹${Number(value).toFixed(2)}`}/><Legend/></PieChart></ResponsiveContainer></div>}</section>;}

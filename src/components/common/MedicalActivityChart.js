import React, { useMemo } from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Cell,
    ResponsiveContainer
} from 'recharts';

const MedicalActivityChart = ({ records }) => {
    // Process records to aggregate by "type" (procedure format)
    const data = useMemo(() => {
        if (!records || records.length === 0) return [];

        const typeCounts = records.reduce((acc, current) => {
            const typeValue = current.type && typeof current.type === 'string'
                ? current.type.trim()
                : 'OTRO';

            // Clean up titles for chart
            let label = typeValue;
            if (typeValue.includes('REVISIÓN')) label = 'Revisiones Clínicas';
            else if (typeValue.includes('VACUNACIÓN')) label = 'Vacunaciones';
            else if (typeValue.includes('DESPARASITACIÓN')) label = 'Desparasitaciones';
            else if (typeValue.includes('NECROPSIA')) label = 'Necropsias';
            else if (typeValue.includes('ANESTESIA')) label = 'Anestesias';
            else if (typeValue.includes('TRATAMIENTO GRUPAL')) label = 'Trat. Grupal';
            else if (typeValue.includes('TRATAMIENTO')) label = 'Tratamiento Médico';
            else if (typeValue.includes('HOSPITALIZACIÓN')) label = 'Hospitalizaciones';

            if (!acc[label]) {
                acc[label] = { name: label, value: 0 };
            }
            acc[label].value += 1;
            return acc;
        }, {});

        // Convert grouped object to array sorted by volume
        return Object.values(typeCounts).sort((a, b) => b.value - a.value);
    }, [records]);

    if (data.length === 0) {
        return null; // Don't render if no filtered data
    }

    // Custom Tooltip for premium feel
    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white p-3 border border-gray-100 shadow-lg rounded-xl">
                    <p className="text-gray-500 text-xs font-bold uppercase mb-1">{payload[0].payload.name}</p>
                    <p className="text-blue-600 text-xl font-black">
                        {payload[0].value} <span className="text-sm font-medium text-gray-500">atenciones</span>
                    </p>
                </div>
            );
        }
        return null;
    };

    // Color palette to iterate through bars
    const colors = [
        '#3b82f6', // blue-500
        '#8b5cf6', // violet-500
        '#06b6d4', // cyan-500
        '#10b981', // emerald-500
        '#f59e0b', // amber-500
        '#ec4899', // pink-500
    ];

    return (
        <div className="bg-white border border-gray-100 p-6 rounded-2xl shadow-sm mb-8 transition-all duration-300">
            <h3 className="text-lg font-extrabold text-[#1e293b] mb-1">Volumen de Atenciones Clínicas</h3>
            <p className="text-sm text-gray-500 font-medium mb-6">Distribución de procedimientos según los filtros aplicados</p>

            <div className="w-full" style={{ height: 280, minHeight: 280 }}>
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        data={data}
                        margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                        barSize={40}
                    >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis
                            dataKey="name"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }}
                            dy={10}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#94a3b8', fontSize: 12 }}
                            allowDecimals={false}
                        />
                        <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f8fafc' }} />
                        <Bar
                            dataKey="value"
                            radius={[6, 6, 0, 0]}
                            animationDuration={1500}
                        >
                            {
                                data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                                ))
                            }
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default MedicalActivityChart;

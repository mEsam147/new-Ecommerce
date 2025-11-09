// src/app/admin/reports/page.tsx
'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, FileText, BarChart3, Users, ShoppingCart, DollarSign, Calendar } from 'lucide-react';

export default function ReportsPage() {
  const [selectedReport, setSelectedReport] = useState<string>('');
  const [dateRange, setDateRange] = useState({
    start: '',
    end: '',
  });

  const reports = [
    {
      id: 'sales',
      name: 'Sales Report',
      description: 'Detailed sales data with product performance',
      icon: <DollarSign className="w-8 h-8" />,
      formats: ['PDF', 'Excel', 'CSV'],
    },
    {
      id: 'customers',
      name: 'Customer Analytics',
      description: 'Customer acquisition, retention, and behavior',
      icon: <Users className="w-8 h-8" />,
      formats: ['PDF', 'Excel'],
    },
    {
      id: 'products',
      name: 'Product Performance',
      description: 'Product sales, inventory, and profitability',
      icon: <ShoppingCart className="w-8 h-8" />,
      formats: ['Excel', 'CSV'],
    },
    {
      id: 'financial',
      name: 'Financial Summary',
      description: 'Revenue, expenses, and profit analysis',
      icon: <BarChart3 className="w-8 h-8" />,
      formats: ['PDF', 'Excel'],
    },
    {
      id: 'inventory',
      name: 'Inventory Report',
      description: 'Stock levels, turnover, and valuation',
      icon: <FileText className="w-8 h-8" />,
      formats: ['Excel', 'CSV'],
    },
    {
      id: 'marketing',
      name: 'Marketing Performance',
      description: 'Campaign results and ROI analysis',
      icon: <BarChart3 className="w-8 h-8" />,
      formats: ['PDF', 'Excel'],
    },
  ];

  const generateReport = (format: string) => {
    // Generate report logic here
    console.log(`Generating ${selectedReport} report in ${format} format`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-gray-600 mt-2">
            Generate detailed reports and export business data
          </p>
        </div>
      </div>

      {/* Date Range Selector */}
      <Card>
        <CardHeader>
          <CardTitle>Report Period</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex items-center gap-2">
              <Calendar size={20} className="text-gray-400" />
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <span className="text-gray-500">to</span>
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
              Apply Date Range
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reports.map((report) => (
          <Card key={report.id} className="hover:shadow-lg transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="text-blue-600 bg-blue-50 p-3 rounded-lg">
                  {report.icon}
                </div>
                <button
                  onClick={() => setSelectedReport(report.id)}
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    selectedReport === report.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Select
                </button>
              </div>

              <h3 className="font-semibold text-gray-900 mb-2">{report.name}</h3>
              <p className="text-sm text-gray-600 mb-4">{report.description}</p>

              <div className="flex flex-wrap gap-2">
                {report.formats.map((format) => (
                  <span
                    key={format}
                    className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-medium"
                  >
                    {format}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Report Generator */}
      {selectedReport && (
        <Card>
          <CardHeader>
            <CardTitle>
              Generate {reports.find(r => r.id === selectedReport)?.name}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-gray-600">
                Select the format and generate your report for the selected period.
              </p>
              <div className="flex gap-4">
                {reports
                  .find(r => r.id === selectedReport)
                  ?.formats.map((format) => (
                    <button
                      key={format}
                      onClick={() => generateReport(format)}
                      className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Download size={20} />
                      Export as {format}
                    </button>
                  ))
                }
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Reports */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Reports</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <QuickReportCard
              title="Daily Sales"
              description="Today's sales summary"
              icon={<DollarSign size={24} />}
              onClick={() => console.log('Generate daily sales report')}
            />
            <QuickReportCard
              title="Weekly Performance"
              description="This week's overview"
              icon={<BarChart3 size={24} />}
              onClick={() => console.log('Generate weekly performance report')}
            />
            <QuickReportCard
              title="Monthly Financials"
              description="Monthly financial summary"
              icon={<FileText size={24} />}
              onClick={() => console.log('Generate monthly financials report')}
            />
            <QuickReportCard
              title="Customer Insights"
              description="Customer behavior analysis"
              icon={<Users size={24} />}
              onClick={() => console.log('Generate customer insights report')}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function QuickReportCard({ title, description, icon, onClick }: {
  title: string;
  description: string;
  icon: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-all text-left"
    >
      <div className="text-blue-600 mb-3">{icon}</div>
      <h4 className="font-semibold text-gray-900 mb-1">{title}</h4>
      <p className="text-sm text-gray-600">{description}</p>
    </button>
  );
}

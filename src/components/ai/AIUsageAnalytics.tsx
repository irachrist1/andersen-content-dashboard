"use client";

import React, { useState, useEffect } from 'react';

interface UsageRecord {
  id: string;
  date: string;
  request_count: number;
  input_tokens: number;
  output_tokens: number;
  estimated_cost: number;
}

interface DetailedUsageRecord extends UsageRecord {
  operation: string;
}

interface AIUsageAnalyticsProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AIUsageAnalytics: React.FC<AIUsageAnalyticsProps> = ({
  isOpen,
  onClose,
}) => {
  const [usageData, setUsageData] = useState<UsageRecord[]>([]);
  const [detailedUsageData, setDetailedUsageData] = useState<DetailedUsageRecord[]>([]);
  const [timeRange, setTimeRange] = useState<number>(7); // Default to 7 days
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'summary' | 'detailed'>('summary');
  
  useEffect(() => {
    if (isOpen) {
      fetchUsageData();
    }
  }, [isOpen, timeRange]);
  
  const fetchUsageData = async () => {
    setLoading(true);
    try {
      // Get usage data from API endpoint
      const response = await fetch(`/api/ai/usage?days=${timeRange}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch usage data: ${response.status}`);
      }
      const usageData = await response.json();
      setUsageData(usageData || []);
      
      // Get detailed usage data from API endpoint
      const detailedResponse = await fetch(`/api/ai/usage/detailed?days=${timeRange}`);
      if (!detailedResponse.ok) {
        throw new Error(`Failed to fetch detailed usage data: ${detailedResponse.status}`);
      }
      const detailedData = await detailedResponse.json();
      setDetailedUsageData(detailedData || []);
    } catch (error) {
      console.error('Error fetching AI usage data:', error);
      // Set empty arrays on error
      setUsageData([]);
      setDetailedUsageData([]);
    } finally {
      setLoading(false);
    }
  };
  
  // Calculate totals
  const totalRequests = usageData.reduce((sum, record) => sum + record.request_count, 0);
  const totalInputTokens = usageData.reduce((sum, record) => sum + record.input_tokens, 0);
  const totalOutputTokens = usageData.reduce((sum, record) => sum + record.output_tokens, 0);
  const totalCost = usageData.reduce((sum, record) => sum + record.estimated_cost, 0);
  
  // Format dollar amount
  const formatCost = (cost: number) => {
    return '$' + cost.toFixed(4);
  };
  
  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };
  
  // Group detailed usage by operation
  const operationSummary = detailedUsageData.reduce((acc, record) => {
    if (!acc[record.operation]) {
      acc[record.operation] = {
        operation: record.operation,
        request_count: 0,
        input_tokens: 0,
        output_tokens: 0,
        estimated_cost: 0,
      };
    }
    
    acc[record.operation].request_count += record.request_count;
    acc[record.operation].input_tokens += record.input_tokens;
    acc[record.operation].output_tokens += record.output_tokens;
    acc[record.operation].estimated_cost += record.estimated_cost;
    
    return acc;
  }, {} as Record<string, { operation: string, request_count: number, input_tokens: number, output_tokens: number, estimated_cost: number }>);
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-brand-dark">
            AI Usage Analytics
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="border-b border-gray-200 px-6 py-3 flex justify-between items-center">
          <div className="flex space-x-4">
            <button
              onClick={() => setActiveTab('summary')}
              className={`px-3 py-2 text-sm font-medium rounded-md ${
                activeTab === 'summary'
                  ? 'bg-brand-primary text-white'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
              }`}
            >
              Summary
            </button>
            <button
              onClick={() => setActiveTab('detailed')}
              className={`px-3 py-2 text-sm font-medium rounded-md ${
                activeTab === 'detailed'
                  ? 'bg-brand-primary text-white'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
              }`}
            >
              Detailed by Operation
            </button>
          </div>
          
          <div>
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(Number(e.target.value))}
              className="border border-gray-300 rounded-md p-2 text-sm"
            >
              <option value={7}>Last 7 days</option>
              <option value={14}>Last 14 days</option>
              <option value={30}>Last 30 days</option>
              <option value={90}>Last 90 days</option>
            </select>
          </div>
        </div>
        
        <div className="p-6">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-primary"></div>
            </div>
          ) : (
            <>
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="text-sm font-medium text-blue-700 mb-1">Total Requests</h3>
                  <p className="text-2xl font-bold text-blue-900">{totalRequests}</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="text-sm font-medium text-green-700 mb-1">Input Tokens</h3>
                  <p className="text-2xl font-bold text-green-900">{totalInputTokens.toLocaleString()}</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <h3 className="text-sm font-medium text-purple-700 mb-1">Output Tokens</h3>
                  <p className="text-2xl font-bold text-purple-900">{totalOutputTokens.toLocaleString()}</p>
                </div>
                <div className="bg-red-50 p-4 rounded-lg">
                  <h3 className="text-sm font-medium text-red-700 mb-1">Estimated Cost</h3>
                  <p className="text-2xl font-bold text-red-900">{formatCost(totalCost)}</p>
                </div>
              </div>
              
              {activeTab === 'summary' ? (
                <div>
                  <h3 className="text-lg font-semibold mb-3">Daily Usage</h3>
                  {usageData.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">No usage data available for this period.</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="min-w-full bg-white border border-gray-200">
                        <thead>
                          <tr className="bg-gray-100">
                            <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Date</th>
                            <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Requests</th>
                            <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Input Tokens</th>
                            <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Output Tokens</th>
                            <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Cost</th>
                          </tr>
                        </thead>
                        <tbody>
                          {usageData.map((record) => (
                            <tr key={record.id} className="border-t border-gray-100 hover:bg-gray-50">
                              <td className="px-4 py-2 text-sm">{formatDate(record.date)}</td>
                              <td className="px-4 py-2 text-sm">{record.request_count}</td>
                              <td className="px-4 py-2 text-sm">{record.input_tokens.toLocaleString()}</td>
                              <td className="px-4 py-2 text-sm">{record.output_tokens.toLocaleString()}</td>
                              <td className="px-4 py-2 text-sm">{formatCost(record.estimated_cost)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  <h3 className="text-lg font-semibold mb-3">Usage by Operation</h3>
                  {Object.keys(operationSummary).length === 0 ? (
                    <p className="text-gray-500 text-center py-4">No detailed usage data available for this period.</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="min-w-full bg-white border border-gray-200">
                        <thead>
                          <tr className="bg-gray-100">
                            <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Operation</th>
                            <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Requests</th>
                            <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Input Tokens</th>
                            <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Output Tokens</th>
                            <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Cost</th>
                          </tr>
                        </thead>
                        <tbody>
                          {Object.values(operationSummary).map((record) => (
                            <tr key={record.operation} className="border-t border-gray-100 hover:bg-gray-50">
                              <td className="px-4 py-2 text-sm">{record.operation}</td>
                              <td className="px-4 py-2 text-sm">{record.request_count}</td>
                              <td className="px-4 py-2 text-sm">{record.input_tokens.toLocaleString()}</td>
                              <td className="px-4 py-2 text-sm">{record.output_tokens.toLocaleString()}</td>
                              <td className="px-4 py-2 text-sm">{formatCost(record.estimated_cost)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
        
        <div className="border-t border-gray-200 px-6 py-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}; 
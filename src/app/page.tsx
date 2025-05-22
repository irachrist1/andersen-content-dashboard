"use client";

import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { ContentBoard } from '@/components/board/ContentBoard';

export default function Home() {
  const [databaseError, setDatabaseError] = useState(false);
  
  // Check if database is properly connected
  useEffect(() => {
    const checkDatabaseConnection = async () => {
      try {
        const response = await fetch('/api/content-items');
        if (!response.ok) {
          setDatabaseError(true);
        } else {
          setDatabaseError(false);
        }
      } catch (error) {
        setDatabaseError(true);
      }
    };
    
    checkDatabaseConnection();
  }, []);
  
  return (
    <Layout>
      {databaseError && (
        <div className="mx-auto max-w-7xl p-4 bg-blue-50 border border-blue-200 text-blue-700 rounded mb-4">
          <h3 className="font-medium">Database Setup Required:</h3>
          <p className="mb-2">If you see an error about &quot;relation &quot;public.content_items&quot; does not exist&quot;, please visit one of these endpoints:</p>
          <ul className="list-disc ml-6 mb-2">
            <li><a href="/api/direct-setup" className="underline hover:text-blue-500">Setup Database Automatically</a> (Recommended)</li>
            <li><a href="/api/reset-table" className="underline hover:text-blue-500">Reset Table Data</a> (If table exists but is empty)</li>
          </ul>
          <p>Or manually run the SQL from <code className="bg-blue-100 px-1">src/scripts/createTable.sql</code> in the Supabase SQL Editor.</p>
        </div>
      )}
      <ContentBoard />
    </Layout>
  );
}

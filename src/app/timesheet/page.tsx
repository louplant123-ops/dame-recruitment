'use client'

// Dame Recruitment - Client Timesheet Portal
// Web-based timesheet submission for clients

import React, { useState, useEffect } from 'react';
import { format, startOfWeek, endOfWeek, addDays, parseISO } from 'date-fns';

interface TimesheetEntry {
  candidateId: string;
  candidateName: string;
  workDate: string;
  entryType: 'hours' | 'sick' | 'holiday' | 'contract_ended' | 'no_show';
  hoursWorked?: number;
  startTime?: string;
  finishTime?: string;
  breakDuration?: number;
  calculatedHours?: number;
  notes?: string;
}

interface CandidateRow {
  candidateId: string;
  candidateName: string;
  entries: { [date: string]: TimesheetEntry };
  weeklyTotal: number;
  detailedMode: boolean;
}

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const DAY_ABBREVIATIONS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const ENTRY_TYPES = [
  { value: 'hours', label: 'Hours Worked', color: 'bg-green-50 text-green-800' },
  { value: 'sick', label: 'Sick Day', color: 'bg-red-50 text-red-800' },
  { value: 'holiday', label: 'Holiday', color: 'bg-blue-50 text-blue-800' },
  { value: 'contract_ended', label: 'Contract Ended', color: 'bg-gray-50 text-gray-800' },
  { value: 'no_show', label: 'No Show/Absent', color: 'bg-orange-50 text-orange-800' }
];

export default function ClientTimesheetPortal() {
  const [clientId, setClientId] = useState('');
  const [clientName, setClientName] = useState('');
  const [weekEndingDate, setWeekEndingDate] = useState(
    format(endOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd')
  );
  const [candidateRows, setCandidateRows] = useState<CandidateRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showCorrections, setShowCorrections] = useState(false);
  const [correctionsText, setCorrectionsText] = useState('');
  const [comments, setComments] = useState('');
  const [submitterName, setSubmitterName] = useState('');
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Authentication check
  useEffect(() => {
    // TODO: Implement proper client authentication
    // For now, simulate authentication
    const urlParams = new URLSearchParams(window.location.search);
    const clientParam = urlParams.get('client');
    
    if (clientParam) {
      setClientId(clientParam);
      setClientName('Manufacturing Corp Ltd'); // TODO: Get from API
      setIsAuthenticated(true);
      loadTimesheet(clientParam, weekEndingDate);
    }
  }, [weekEndingDate]);

  // Load timesheet data
  const loadTimesheet = async (clientId: string, weekEndingDate: string) => {
    try {
      setLoading(true);
      
      // TODO: Replace with actual API call
      // Simulate loading assigned candidates
      const mockCandidates = [
        { id: 'cand1', name: 'John Smith' },
        { id: 'cand2', name: 'Sarah Johnson' },
        { id: 'cand3', name: 'Mike Wilson' },
        { id: 'cand4', name: 'Emma Davis' },
        { id: 'cand5', name: 'Tom Brown' }
      ];

      const weekEnd = parseISO(weekEndingDate);
      const weekStart = startOfWeek(weekEnd, { weekStartsOn: 1 });
      const weekDates = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

      const rows: CandidateRow[] = mockCandidates.map(candidate => {
        const entries: { [date: string]: TimesheetEntry } = {};
        
        weekDates.forEach(date => {
          const dateStr = format(date, 'yyyy-MM-dd');
          entries[dateStr] = {
            candidateId: candidate.id,
            candidateName: candidate.name,
            workDate: dateStr,
            entryType: 'hours',
            hoursWorked: 0
          };
        });

        return {
          candidateId: candidate.id,
          candidateName: candidate.name,
          entries,
          weeklyTotal: 0,
          detailedMode: false
        };
      });

      setCandidateRows(rows);
    } catch (error) {
      console.error('Failed to load timesheet:', error);
    } finally {
      setLoading(false);
    }
  };

  // Update entry
  const updateEntry = (candidateId: string, workDate: string, updates: Partial<TimesheetEntry>) => {
    setCandidateRows(prev => prev.map(candidate => {
      if (candidate.candidateId === candidateId) {
        const updatedEntries = {
          ...candidate.entries,
          [workDate]: {
            ...candidate.entries[workDate],
            ...updates
          }
        };

        // Recalculate weekly total
        const weeklyTotal = Object.values(updatedEntries).reduce((total, entry) => {
          if (entry.entryType === 'hours') {
            return total + (entry.hoursWorked || entry.calculatedHours || 0);
          }
          return total;
        }, 0);

        return {
          ...candidate,
          entries: updatedEntries,
          weeklyTotal
        };
      }
      return candidate;
    }));
  };

  // Toggle detailed mode
  const toggleDetailedMode = (candidateId: string) => {
    setCandidateRows(prev => prev.map(candidate => 
      candidate.candidateId === candidateId 
        ? { ...candidate, detailedMode: !candidate.detailedMode }
        : candidate
    ));
  };

  // Calculate hours from time inputs
  const calculateHours = (startTime: string, finishTime: string, breakMinutes: number = 0): number => {
    if (!startTime || !finishTime) return 0;
    
    const start = new Date(`2000-01-01 ${startTime}`);
    const finish = new Date(`2000-01-01 ${finishTime}`);
    
    let totalMinutes = (finish.getTime() - start.getTime()) / (1000 * 60);
    totalMinutes -= breakMinutes;
    
    return Math.max(0, totalMinutes / 60);
  };

  // Validate timesheet
  const validateTimesheet = (): string[] => {
    const errors: string[] = [];

    candidateRows.forEach(candidate => {
      Object.entries(candidate.entries).forEach(([date, entry]) => {
        if (entry.entryType === 'hours') {
          const hours = entry.hoursWorked || entry.calculatedHours || 0;
          
          if (hours > 12) {
            errors.push(`${candidate.candidateName} on ${format(parseISO(date), 'EEE dd/MM')}: ${hours} hours seems unusually high`);
          }
          
          if (hours > 0 && hours < 1) {
            errors.push(`${candidate.candidateName} on ${format(parseISO(date), 'EEE dd/MM')}: ${hours} hours seems unusually low`);
          }
        }
      });
    });

    return errors;
  };

  // Submit timesheet
  const submitTimesheet = async () => {
    if (!submitterName.trim()) {
      alert('Please enter your name before submitting');
      return;
    }

    const errors = validateTimesheet();
    setValidationErrors(errors);

    if (errors.length > 0) {
      const proceed = window.confirm(
        `There are ${errors.length} validation warnings. Do you want to proceed anyway?`
      );
      if (!proceed) return;
    }

    try {
      setSubmitting(true);

      // Prepare submission data
      const submissionData = {
        clientId,
        weekEndingDate,
        submittedBy: submitterName,
        comments,
        correctionsNotes: correctionsText,
        entries: candidateRows.flatMap(candidate => 
          Object.values(candidate.entries).filter(entry => 
            entry.entryType !== 'hours' || (entry.hoursWorked || 0) > 0
          )
        )
      };

      // TODO: Submit to bridge server
      const response = await fetch(`${process.env.NEXT_PUBLIC_DAMEDESK_WEBHOOK_URL || 'http://localhost:3001'}/api/timesheets/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_DAMEDESK_API_KEY}`
        },
        body: JSON.stringify(submissionData)
      });

      if (response.ok) {
        alert('Timesheet submitted successfully! You will receive a confirmation email shortly.');
        // Reset form or redirect
      } else {
        throw new Error('Failed to submit timesheet');
      }
    } catch (error) {
      console.error('Submission error:', error);
      alert('Failed to submit timesheet. Please try again or contact support.');
    } finally {
      setSubmitting(false);
    }
  };

  // Print timesheet
  const printTimesheet = () => {
    window.print();
  };

  // Render entry cell
  const renderEntryCell = (candidate: CandidateRow, date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const entry = candidate.entries[dateStr];
    const isWeekend = date.getDay() === 0 || date.getDay() === 6;

    if (!entry) return <td key={dateStr} className="p-2 border border-gray-200"></td>;

    if (candidate.detailedMode && entry.entryType === 'hours') {
      return (
        <td key={dateStr} className={`p-1 border border-gray-200 ${isWeekend ? 'bg-gray-50' : ''}`}>
          <div className="space-y-1">
            <input
              type="time"
              value={entry.startTime || ''}
              onChange={(e) => updateEntry(candidate.candidateId, dateStr, { 
                startTime: e.target.value,
                calculatedHours: calculateHours(e.target.value, entry.finishTime || '', entry.breakDuration)
              })}
              className="w-full text-xs border rounded px-1 py-0.5"
            />
            <input
              type="number"
              placeholder="Break (mins)"
              value={entry.breakDuration || ''}
              onChange={(e) => updateEntry(candidate.candidateId, dateStr, { 
                breakDuration: parseInt(e.target.value) || 0,
                calculatedHours: calculateHours(entry.startTime || '', entry.finishTime || '', parseInt(e.target.value) || 0)
              })}
              className="w-full text-xs border rounded px-1 py-0.5"
            />
            <input
              type="time"
              value={entry.finishTime || ''}
              onChange={(e) => updateEntry(candidate.candidateId, dateStr, { 
                finishTime: e.target.value,
                calculatedHours: calculateHours(entry.startTime || '', e.target.value, entry.breakDuration)
              })}
              className="w-full text-xs border rounded px-1 py-0.5"
            />
            <div className="text-xs text-center font-medium">
              {entry.calculatedHours?.toFixed(2) || '0.00'}h
            </div>
          </div>
        </td>
      );
    }

    return (
      <td key={dateStr} className={`p-2 border border-gray-200 ${isWeekend ? 'bg-gray-50' : ''}`}>
        {entry.entryType === 'hours' ? (
          <input
            type="number"
            step="0.5"
            min="0"
            max="24"
            value={entry.hoursWorked || ''}
            onChange={(e) => updateEntry(candidate.candidateId, dateStr, { 
              hoursWorked: parseFloat(e.target.value) || 0 
            })}
            className="w-full text-center border rounded px-2 py-1 focus:ring-2 focus:ring-blue-500"
            placeholder="0"
          />
        ) : (
          <select
            value={entry.entryType}
            onChange={(e) => updateEntry(candidate.candidateId, dateStr, { 
              entryType: e.target.value as any 
            })}
            className={`w-full text-xs rounded px-1 py-1 ${
              ENTRY_TYPES.find(t => t.value === entry.entryType)?.color || 'bg-gray-50'
            }`}
          >
            {ENTRY_TYPES.map(type => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        )}
      </td>
    );
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-6">
            Client Timesheet Portal
          </h2>
          <p className="text-gray-600 text-center">
            Please use the link provided in your email to access your timesheet.
          </p>
        </div>
      </div>
    );
  }

  const weekEnd = parseISO(weekEndingDate);
  const weekStart = startOfWeek(weekEnd, { weekStartsOn: 1 });
  const weekDates = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border mb-6 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Weekly Timesheet</h1>
              <p className="text-gray-600 mt-1">
                {clientName} - Week ending {format(weekEnd, 'EEEE, dd MMMM yyyy')}
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={printTimesheet}
                className="flex items-center px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                🖨️ Print
              </button>
            </div>
          </div>
        </div>

        {/* Validation Warnings */}
        {validationErrors.length > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                ⚠️
              </div>
              <div className="ml-3">
                <h4 className="font-medium text-yellow-800">Validation Warnings</h4>
                <ul className="mt-1 text-sm text-yellow-700 space-y-1">
                  {validationErrors.map((error, index) => (
                    <li key={index}>• {error}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Timesheet Grid */}
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden mb-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="p-3 text-left font-medium text-gray-900 border border-gray-200">
                    Worker Name
                  </th>
                  {weekDates.map((date, index) => (
                    <th key={date.toISOString()} className={`p-3 text-center font-medium text-gray-900 border border-gray-200 ${
                      date.getDay() === 0 || date.getDay() === 6 ? 'bg-gray-100' : ''
                    }`}>
                      <div>{DAY_ABBREVIATIONS[index]}</div>
                      <div className="text-xs font-normal text-gray-600">
                        {format(date, 'dd/MM')}
                      </div>
                    </th>
                  ))}
                  <th className="p-3 text-center font-medium text-gray-900 border border-gray-200 bg-blue-50">
                    Total Hours
                  </th>
                  <th className="p-3 text-center font-medium text-gray-900 border border-gray-200">
                    Mode
                  </th>
                </tr>
              </thead>
              <tbody>
                {candidateRows.map((candidate) => (
                  <tr key={candidate.candidateId} className="hover:bg-gray-50">
                    <td className="p-3 border border-gray-200">
                      <div className="font-medium text-gray-900">
                        {candidate.candidateName}
                      </div>
                    </td>
                    
                    {weekDates.map(date => renderEntryCell(candidate, date))}
                    
                    <td className="p-3 text-center font-semibold border border-gray-200 bg-blue-50">
                      {candidate.weeklyTotal.toFixed(1)}h
                    </td>
                    
                    <td className="p-3 text-center border border-gray-200">
                      <button
                        onClick={() => toggleDetailedMode(candidate.candidateId)}
                        className="text-blue-600 hover:text-blue-800 text-xs px-2 py-1 border rounded"
                        title={candidate.detailedMode ? 'Switch to simple hours' : 'Switch to detailed time entry'}
                      >
                        {candidate.detailedMode ? 'Simple' : 'Detailed'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Previous Week Corrections */}
        <div className="bg-white rounded-lg shadow-sm border mb-6 p-4">
          <button
            onClick={() => setShowCorrections(!showCorrections)}
            className={`flex items-center text-sm font-medium ${
              correctionsText ? 'text-orange-600' : 'text-gray-600'
            } hover:text-gray-800`}
          >
            {showCorrections ? '▼' : '▶'} Previous Week Corrections
            {correctionsText && (
              <span className="ml-2 px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded">
                Has corrections
              </span>
            )}
          </button>
          
          {showCorrections && (
            <div className="mt-3">
              <textarea
                value={correctionsText}
                onChange={(e) => setCorrectionsText(e.target.value)}
                placeholder="Enter any corrections for previous weeks (e.g., 'Steve Monday +2 hours', 'Sarah Tuesday was sick not absent')"
                className="w-full p-3 border rounded-md text-sm"
                rows={3}
              />
              <p className="mt-1 text-xs text-gray-500">
                These corrections will be processed by the payroll team
              </p>
            </div>
          )}
        </div>

        {/* Comments and Submission */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Name *
              </label>
              <input
                type="text"
                value={submitterName}
                onChange={(e) => setSubmitterName(e.target.value)}
                placeholder="Enter your full name"
                className="w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Additional Comments
              </label>
              <textarea
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                placeholder="Any additional notes about this week's timesheet..."
                className="w-full p-3 border rounded-md text-sm"
                rows={3}
              />
            </div>

            <div className="flex items-center justify-between pt-4 border-t">
              <p className="text-sm text-gray-600">
                By submitting this timesheet, you confirm that the information provided is accurate.
              </p>
              
              <button
                onClick={submitTimesheet}
                disabled={submitting || !submitterName.trim()}
                className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Submitting...
                  </>
                ) : (
                  <>
                    📤 Submit Timesheet
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

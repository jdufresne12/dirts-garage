'use client'
import helpers from '@/app/utils/helpers';
import { Trash } from 'lucide-react';
import React, { useState, useEffect } from 'react';

interface JobNotesProps {
    job_id: string;
    Notes: Note[]
    setNotes: React.Dispatch<React.SetStateAction<Note[]>>;
}

export default function JobNotes({ job_id, Notes, setNotes }: JobNotesProps) {
    const [newNote, setNewNote] = useState<string>("");
    const [isLoading, setIsLoading] = useState(false);

    // Fetch notes when component mounts or job_id changes
    useEffect(() => {
        const fetchNotes = async () => {
            try {
                const response = await fetch(`/api/jobs/notes/${job_id}`);
                if (!response.ok) {
                    throw new Error('Failed to fetch notes');
                }
                const notesData = await response.json();
                setNotes(notesData);
            } catch (error) {
                console.error('Error fetching notes:', error);
            }
        };
        if (job_id)
            fetchNotes();
    }, [job_id]);

    const handleNewNote = async () => {
        if (!newNote.trim()) return; // Don't add empty notes

        setIsLoading(true);

        try {
            // Create local datetime string without timezone conversion
            const now = new Date();
            const localDateTime = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}T${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;

            const noteData = {
                id: helpers.generateUniqueID(),
                job_id: job_id,
                note: newNote.trim(),
                timestamp: localDateTime, // Use local datetime string
            };

            const response = await fetch('/api/jobs/notes', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(noteData),
            });

            if (!response.ok) {
                throw new Error('Failed to create note');
            }

            // Add the new note to the end of the array (since order is ASC)
            setNotes((prevNotes) => [...prevNotes, noteData]);
            setNewNote("");
        } catch (error) {
            console.error('Error creating note:', error);
            // You might want to show a user-friendly error message here
        } finally {
            setIsLoading(false);
        }
    };

    const handleRemovingNote = async (noteId: string) => {
        try {
            const response = await fetch(`/api/jobs/notes/${noteId}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error('Failed to delete note');
            }

            // Remove note from state only if API call was successful
            setNotes((prevNotes) => prevNotes.filter(n => n.id !== noteId));
        } catch (error) {
            console.error('Error deleting note:', error);
            // You might want to show a user-friendly error message here
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        // Allow Ctrl+Enter or Cmd+Enter to submit
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            handleNewNote();
        }
    };

    return (
        <div className="bg-white rounded-lg border border-gray-200 p-4">
            <h3 className="font-semibold mb-4">Notes</h3>

            <div className="space-y-4 max-h-200 overflow-y-auto">
                {Notes.length > 0 ?
                    Notes.map((note) => (
                        <div key={note.id} className="border-l-4 border-orange-400 pl-3 group">
                            <div className="flex justify-between items-start">
                                <span className="text-xs text-gray-500">{helpers.displayDateAndTimeLong(note.timestamp)}</span>
                                <Trash
                                    className="size-4 text-gray-500 hover:text-red-500 cursor-pointer 
               opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
                                    onClick={() => handleRemovingNote(note.id)}
                                />

                            </div>
                            <p className="text-sm text-gray-900 mt-1">{note.note}</p>
                        </div>
                    )) :
                    <p className="text-gray-500">No notes or communications yet.</p>
                }
            </div>

            <div className="mt-4">
                <textarea
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    onKeyDown={handleKeyPress}
                    placeholder="Add a new note or communication..."
                    className="w-full border border-gray-300 rounded p-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    rows={3}
                    disabled={isLoading}
                />
                <button
                    onClick={handleNewNote}
                    disabled={isLoading || !newNote.trim()}
                    className="w-full mt-2 bg-orange-400 text-white py-2 rounded-lg hover:bg-orange-500 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                    {isLoading ? 'Adding Note...' : 'Add Note'}
                </button>
            </div>
        </div>
    );
};
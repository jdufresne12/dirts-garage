'use client'
import React, { useState } from 'react';

interface JobNotesProps {
    Notes: Note[]
}

export default function JobNotes({ Notes }: JobNotesProps) {
    const [newNote, setNewNote] = useState<string>("");
    return (
        <div className="bg-white rounded-lg border border-gray-200 p-4">
            <h3 className="font-semibold mb-4">Notes</h3>

            <div className="space-y-4 max-h-60 overflow-y-auto">
                {Notes.map((note) => (
                    <div key={note.id} className="border-l-4 border-orange-400 pl-3">
                        <div className="flex justify-between items-start">
                            <span className="text-xs text-gray-500">{note.timestamp}</span>
                        </div>
                        <p className="text-sm text-gray-900 mt-1">{note.note}</p>
                    </div>
                ))}
            </div>

            <div className="mt-4">
                <textarea
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    placeholder="Add a new note or communication..."
                    className="w-full border border-gray-300 rounded p-2 text-sm"
                    rows={3}
                />
                <button className="w-full mt-2 bg-orange-500 text-white py-2 rounded hover:bg-orange-600">
                    Add Note
                </button>
            </div>
        </div>
    )
};
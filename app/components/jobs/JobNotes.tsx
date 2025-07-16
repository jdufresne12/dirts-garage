'use client'
import helpers from '@/app/utils/helpers';
import { Trash } from 'lucide-react';
import React, { useState } from 'react';

interface JobNotesProps {
    Notes: Note[]
    setNotes: React.Dispatch<React.SetStateAction<Note[]>>;
}

export default function JobNotes({ Notes, setNotes }: JobNotesProps) {
    const [newNote, setNewNote] = useState<string>("");

    const handleNewNote = () => {
        // API call to store note

        setNotes((prevNotes) => [
            ...prevNotes,
            {
                id: helpers.generateUniqueID(),
                timestamp: helpers.getLocalDateTimeString(),
                note: newNote
            }
        ])

        setNewNote("");
    }

    const handleRemovingNote = (noteId: string) => {
        console.log(Notes.find(n => n.id === noteId));
        // API call to remove note

        setNotes((prevNotes) => prevNotes.filter(n => n.id !== noteId))
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
                                    className="size-4 text-gray-500 hover:text-red-500 cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
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
                    placeholder="Add a new note or communication..."
                    className="w-full border border-gray-300 rounded p-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    rows={3}
                />
                <button
                    onClick={handleNewNote}
                    className="w-full mt-2 bg-orange-400 text-white py-2 rounded-lg hover:bg-orange-500"
                >
                    Add Note
                </button>
            </div>
        </div>
    )
};
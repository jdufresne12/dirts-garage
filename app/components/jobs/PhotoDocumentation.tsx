import React from 'react';
import { Plus, Camera } from 'lucide-react';

export default function PhotoDocumentation() {
    const images: any = [];

    return (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
                <h2 className="text-xl font-semibold">Photo Documentation</h2>
                <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 whitespace-nowrap">
                    Upload Photos
                </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {images.length > 0 && images.map((photo: any) => (
                    <div key={photo} className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
                        <Camera className="size-8 text-gray-400" />
                    </div>
                ))}
                <div className="aspect-square border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center cursor-pointer hover:border-gray-400">
                    <div className="text-center">
                        <Plus className="size-8 text-gray-400 mx-auto mb-2" />
                        <span className="text-xs text-gray-500">Add Photo</span>
                    </div>
                </div>
            </div>
        </div>
    )
};
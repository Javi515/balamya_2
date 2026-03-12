import React from 'react';

export const SectionTitle = ({ children }) => (
    <h4 className="text-sm font-bold text-gray-800 bg-gray-50 px-4 py-2 mb-5 uppercase border-l-4 border-blue-500">
        {children}
    </h4>
);

export const FormGroup = ({ label, children }) => (
    <div className="flex flex-col mb-4">
        <label className="text-sm text-gray-600 mb-1">{label}</label>
        {children}
    </div>
);

export const FormInput = (props) => (
    <input
        type="text"
        className="w-full border-b border-gray-300 bg-transparent py-2 px-1 text-sm focus:outline-none focus:border-blue-500 transition-colors"
        {...props}
    />
);

export const FormTextArea = (props) => (
    <textarea
        className="w-full border-b border-gray-300 bg-transparent py-2 px-1 text-sm resize-y mt-1 mb-4 focus:outline-none focus:border-blue-500 transition-colors"
        {...props}
    />
);

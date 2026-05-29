import React from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  variant?: 'center' | 'drawer';
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, variant = 'center' }) => {
  if (!isOpen) return null;

  if (variant === 'drawer') {
    return (
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex justify-end"
        onClick={onClose}
      >
        {/* Drawer container with slide-in animation */}
        <div
          className="bg-white dark:bg-[#151B25] w-full max-w-lg h-full shadow-2xl flex flex-col justify-between border-l border-slate-200 dark:border-slate-800/80 animate-slide-in-right"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-between items-center p-6 border-b border-slate-100 dark:border-slate-800/80">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">{title}</h2>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="p-6 overflow-y-auto flex-1">{children}</div>
        </div>
      </div>
    );
  }

  // Standard centered modal layout
  return (
    <div
      className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex justify-center items-center"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-[#151B25] rounded-3xl shadow-2xl w-full max-w-lg m-4 border border-slate-200 dark:border-slate-800/80 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-6 border-b border-slate-100 dark:border-slate-800/80">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">{title}</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
};

export default Modal;
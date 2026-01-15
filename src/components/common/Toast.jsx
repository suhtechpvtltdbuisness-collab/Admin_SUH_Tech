import { AlertCircle, CheckCircle, Info, X, XCircle } from 'lucide-react';

const Toast = ({ message, type = 'success', onClose }) => {
  const icons = {
    success: <CheckCircle size={20} className="text-green-600" />,
    error: <XCircle size={20} className="text-red-600" />,
    warning: <AlertCircle size={20} className="text-amber-600" />,
    info: <Info size={20} className="text-blue-600" />
  };

  const bgColors = {
    success: 'bg-green-50 border-green-200',
    error: 'bg-red-50 border-red-200',
    warning: 'bg-amber-50 border-amber-200',
    info: 'bg-blue-50 border-blue-200'
  };

  const textColors = {
    success: 'text-green-900',
    error: 'text-red-900',
    warning: 'text-amber-900',
    info: 'text-blue-900'
  };

  return (
    <div className={`fixed top-4 right-4 z-[60] animate-slideInRight`}>
      <div className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border ${bgColors[type]} min-w-[300px] max-w-md`}>
        <div className="flex-shrink-0">
          {icons[type]}
        </div>
        <p className={`flex-1 text-sm font-medium ${textColors[type]}`}>
          {message}
        </p>
        <button
          onClick={onClose}
          className="flex-shrink-0 p-1 rounded-lg hover:bg-black/5 transition-colors"
        >
          <X size={16} className={textColors[type]} />
        </button>
      </div>
    </div>
  );
};

export default Toast;

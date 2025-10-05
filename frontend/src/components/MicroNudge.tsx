import { useEffect, useState } from 'react';
import { Wind, AlertCircle, Sparkles, X } from 'lucide-react';

interface MicroNudgeProps {
  type: 'breathing' | 'posture' | 'stretch';
  message: string;
  onDismiss: () => void;
  duration?: number;
}

const MicroNudge = ({ type, message, onDismiss, duration = 10000 }: MicroNudgeProps) => {
  const [progress, setProgress] = useState(100);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        const newProgress = prev - (100 / (duration / 100));
        if (newProgress <= 0) {
          clearInterval(interval);
          handleDismiss();
          return 0;
        }
        return newProgress;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [duration]);

  const handleDismiss = () => {
    setIsVisible(false);
    setTimeout(onDismiss, 300);
  };

  const nudgeConfig = {
    breathing: {
      icon: Wind,
      color: 'blue',
      gradient: 'from-blue-500/20 to-cyan-500/20',
      border: 'border-blue-500/50',
      text: 'text-blue-300',
      glow: 'shadow-blue-500/30'
    },
    posture: {
      icon: AlertCircle,
      color: 'orange',
      gradient: 'from-orange-500/20 to-amber-500/20',
      border: 'border-orange-500/50',
      text: 'text-orange-300',
      glow: 'shadow-orange-500/30'
    },
    stretch: {
      icon: Sparkles,
      color: 'purple',
      gradient: 'from-purple-500/20 to-pink-500/20',
      border: 'border-purple-500/50',
      text: 'text-purple-300',
      glow: 'shadow-purple-500/30'
    }
  };

  const config = nudgeConfig[type];
  const Icon = config.icon;

  if (!isVisible) return null;

  return (
    <div className={`fixed top-24 right-6 z-40 transition-all duration-300 ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}`}>
      <div className="relative group">
        {/* Liquid Glass Container */}
        <div className={`absolute inset-0 bg-white/5 backdrop-blur-2xl rounded-2xl border ${config.border} shadow-2xl ${config.glow}`}></div>
        <div className={`absolute inset-0 bg-gradient-to-br ${config.gradient} rounded-2xl`}></div>
        
        {/* Content */}
        <div className="relative p-4 pr-12 max-w-sm">
          <div className="flex items-start space-x-3">
            <div className={`w-10 h-10 bg-gradient-to-br ${config.gradient} rounded-lg flex items-center justify-center flex-shrink-0 border ${config.border}`}>
              <Icon className={`w-5 h-5 ${config.text}`} />
            </div>
            
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-1">
                <h4 className={`font-semibold ${config.text} text-sm`}>
                  {type === 'breathing' && '🌊 Take a Breath'}
                  {type === 'posture' && '🪑 Check Your Posture'}
                  {type === 'stretch' && '🧘 Time to Stretch'}
                </h4>
              </div>
              <p className="text-white/90 text-sm leading-relaxed">{message}</p>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-3 h-1 bg-white/10 rounded-full overflow-hidden">
            <div 
              className={`h-full bg-gradient-to-r ${config.gradient} transition-all duration-100 ease-linear`}
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        {/* Close button */}
        <button
          onClick={handleDismiss}
          className="absolute top-3 right-3 w-6 h-6 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors"
          aria-label="Dismiss nudge"
        >
          <X className="w-4 h-4 text-white/70" />
        </button>
      </div>
    </div>
  );
};

export default MicroNudge;

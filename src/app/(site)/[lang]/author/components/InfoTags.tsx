interface InfoTagsProps {
  label: string;
  items: Array<{ text: string; subtext?: string; }>;
  variant?: 'neutral' | 'blue';
}

const InfoTags: React.FC<InfoTagsProps> = ({ 
  label, 
  items, 
  variant = 'neutral' 
}) => {
  return (
    <div className="w-full space-y-2">
      <h3 className="text-sm font-medium uppercase tracking-wider text-neutral-400">
        {label}
      </h3>
      <div className="flex flex-wrap justify-center gap-2">
        {items.map((item, index) => (
          <div 
            key={index}
            className={`rounded-full px-3 py-1 ${
              variant === 'blue' 
                ? 'bg-blue-500/10 text-blue-400 hover:bg-blue-500/20' 
                : 'bg-neutral-800/50 text-white'
            } transition-colors`}
          >
            <span className="text-sm font-medium">{item.text}</span>
            {item.subtext && (
              <>
                <span className="mx-1 text-xs text-neutral-400">•</span>
                <span className="text-xs text-neutral-400">{item.subtext}</span>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default InfoTags; 
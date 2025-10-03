// FeatureItem.tsx

import React from 'react';
import { FeatureSlideshow } from "@/types/featureSlideshow";
// import { Accordion, AccordionItem, AccordionButton, AccordionPanel } from 'magic-ui'; // Adjust import based on Magic UI
import { motion } from 'framer-motion';

type FeatureItemProps = {
  data: FeatureSlideshow;
  isActive: boolean;
  onClick: () => void;
  collapseDelay: number;
  linePosition: 'left' | 'right';
};

const FeatureItem: React.FC<FeatureItemProps> = ({
  data,
  isActive,
  onClick,
  collapseDelay,
  linePosition,
}) => {
  const { title, description } = data;

  return (
    <div>
      <div
        className={`relative mb-8 last:mb-0 ${
          linePosition === 'right' ? 'text-right' : 'text-left'
        }`}
      >
        <div
          className={`absolute bottom-0 top-0 h-full w-0.5 bg-neutral-300/50 dark:bg-neutral-300/30 ${
            linePosition === 'right' ? 'left-auto right-0' : 'left-0 right-auto'
          }`}
        >
          <div
            className={`absolute left-0 top-0 w-full bg-neutral-500 dark:bg-white transition-all duration-${collapseDelay}ms ease-linear ${
              isActive ? 'h-full' : 'h-0'
            }`}
          ></div>
        </div>

        <button onClick={onClick} className="text-xl font-bold">
          {title}
        </button>

        {isActive && (
          <div>
            <p>{description}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FeatureItem;

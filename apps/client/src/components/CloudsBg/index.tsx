import React from 'react'
import './style.scss'
import { bgCloudsSettings } from '@/lib/configs/ui-settings';

const CloudsBg = () => {
  return (
    <div className="fixed inset-0 z-[-1]">
      {Array.from({ length: bgCloudsSettings.count }).map((_, index) => {
        const randomPercentage = Math.floor(Math.random() * 100);
        const randomMarginLeft = Math.floor(Math.random() * 100);
        const randomDuration = Math.floor(Math.random() * 100) + 100;
        const randomSize = randomPercentage < bgCloudsSettings.small ? 'small' : randomPercentage < bgCloudsSettings.normal ? 'normal' : 'large';  
        return (
        <div key={index} style={{
          animationDuration: `${randomDuration}s`,
          marginLeft: `${randomMarginLeft}%`,
        }} className={`cloud ${randomSize}`}>
          <div></div><div></div><div></div><div></div>
        </div>
      )})}
    </div>
  )
};

export default CloudsBg;

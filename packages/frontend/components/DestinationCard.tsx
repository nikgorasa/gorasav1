
import React from 'react';
import { Destination } from '../types';

interface DestinationCardProps {
  destination: Destination;
}

const DestinationCard: React.FC<DestinationCardProps> = ({ destination }) => {
  return (
    <div className="group relative bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 flex flex-col border border-slate-100">
      <div className="relative aspect-[4/5] overflow-hidden">
        <img 
          src={destination.imageUrl} 
          alt={destination.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full flex items-center space-x-1 shadow-sm">
          <span className="text-yellow-500">★</span>
          <span className="text-xs font-bold text-slate-800">{destination.rating}</span>
        </div>
      </div>
      
      <div className="p-6">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="text-lg font-serif font-bold text-slate-900 group-hover:text-orange-600 transition-colors leading-tight">
              {destination.name}
            </h3>
            <p className="text-sm text-slate-400 font-medium tracking-tight uppercase">{destination.country}</p>
          </div>
          <div className="text-right">
            <span className="block text-xl font-bold text-slate-900">${destination.price}</span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">avg/night</span>
          </div>
        </div>
        <p className="text-sm text-slate-500 line-clamp-2 mt-4 leading-relaxed">
          {destination.description}
        </p>
      </div>
    </div>
  );
};

export default DestinationCard;

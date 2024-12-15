import React from 'react';
import { ExternalLink, ArrowUp, ArrowDown } from 'lucide-react';

const keywords = [
  { keyword: 'télécharger films gratuit', source: 'Google', url: 'https://example.com/telecharger', position: 3, change: 2, volume: 12500, difficulty: 45 },
  { keyword: 'streaming films vf', source: 'Bing', url: 'https://example.com/streaming', position: 2, change: -1, volume: 18200, difficulty: 62 },
  { keyword: 'films en ligne', source: 'Google', url: 'https://example.com/films', position: 8, change: 4, volume: 9800, difficulty: 38 },
];

export const KeywordsTable = () => {
  return (
    <div className="bg-[#25262b] rounded-lg p-4">
      <h2 className="text-lg font-semibold text-white mb-4">Mots-clés Principaux</h2>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-gray-400 text-sm">
              <th className="text-left pb-3">Mot-clé</th>
              <th className="text-left pb-3">Source</th>
              <th className="text-left pb-3">Position</th>
              <th className="text-right pb-3">Volume</th>
              <th className="text-right pb-3">Difficulté</th>
            </tr>
          </thead>
          <tbody>
            {keywords.map((kw, index) => (
              <tr key={index} className="border-t border-gray-800">
                <td className="py-3">
                  <div className="flex items-center">
                    <span className="text-gray-200">{kw.keyword}</span>
                    <ExternalLink className="w-4 h-4 ml-2 text-gray-500 cursor-pointer" />
                  </div>
                </td>
                <td className="text-gray-300">{kw.source}</td>
                <td>
                  <div className="flex items-center">
                    <span className="text-gray-300">{kw.position}</span>
                    {kw.change !== 0 && (
                      <span className={`ml-1 ${kw.change > 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {kw.change > 0 ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
                      </span>
                    )}
                  </div>
                </td>
                <td className="text-right text-gray-300">{kw.volume.toLocaleString()}</td>
                <td className="text-right">
                  <div className="inline-flex items-center px-2 py-1 rounded bg-opacity-20 text-sm">
                    <div className={`w-2 h-2 rounded-full mr-2 ${
                      kw.difficulty < 40 ? 'bg-green-500' :
                      kw.difficulty < 60 ? 'bg-yellow-500' : 'bg-red-500'
                    }`} />
                    <span className="text-gray-300">{kw.difficulty}</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

import React, { useState, useMemo } from 'react';
import { FieldType } from './types';
import FieldSelector from './components/FieldSelector';
import Field from './components/Field';

const App: React.FC = () => {
  const [selectedField, setSelectedField] = useState<FieldType>(FieldType.Senior);
  const [showNumbers, setShowNumbers] = useState(false);
  const [showMeters, setShowMeters] = useState(true);
  const [showYards, setShowYards] = useState(false);

  const fieldSupportsNumbers = useMemo(() => {
    return selectedField === FieldType.Under15_18 || selectedField === FieldType.Senior;
  }, [selectedField]);


  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col items-center p-4 sm:p-6 lg:p-8">
      <header className="w-full max-w-7xl text-center mb-6">
        <h1 className="text-4xl sm:text-5xl font-bold text-green-400 tracking-wider">
          American Football Field Designer
        </h1>
        <p className="text-lg text-gray-400 mt-2">
          Seleziona una categoria per visualizzare il tracciato del campo.
        </p>
      </header>
      
      <main className="w-full flex-grow flex flex-col items-center">
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full max-w-7xl justify-center mb-4">
            <FieldSelector selectedField={selectedField} onSelectField={setSelectedField} />

            <div className="flex flex-wrap items-center justify-center gap-4">
              {fieldSupportsNumbers && (
              <div className="flex items-center space-x-3 bg-gray-800 p-2 rounded-full border border-gray-700 shadow-lg">
                  <label htmlFor="toggle-numbers" className="text-sm font-medium text-gray-300 pl-2 cursor-pointer select-none">
                  Numeri
                  </label>
                  <button
                  id="toggle-numbers"
                  onClick={() => setShowNumbers(!showNumbers)}
                  className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2 focus:ring-offset-gray-900 ${
                      showNumbers ? 'bg-green-500' : 'bg-gray-600'
                  }`}
                  aria-pressed={showNumbers}
                  >
                  <span
                      className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform duration-300 ${
                      showNumbers ? 'translate-x-6' : 'translate-x-1'
                      }`}
                  />
                  </button>
              </div>
              )}
               <div className="flex items-center space-x-3 bg-gray-800 p-2 rounded-full border border-gray-700 shadow-lg">
                <label htmlFor="toggle-meters" className="text-sm font-medium text-gray-300 pl-2 cursor-pointer select-none">
                  Metri
                </label>
                <button
                  id="toggle-meters"
                  onClick={() => setShowMeters(!showMeters)}
                  className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2 focus:ring-offset-gray-900 ${
                    showMeters ? 'bg-yellow-500' : 'bg-gray-600'
                  }`}
                  aria-pressed={showMeters}
                >
                  <span
                    className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform duration-300 ${
                      showMeters ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center space-x-3 bg-gray-800 p-2 rounded-full border border-gray-700 shadow-lg">
                <label htmlFor="toggle-yards" className="text-sm font-medium text-gray-300 pl-2 cursor-pointer select-none">
                  Yard
                </label>
                <button
                  id="toggle-yards"
                  onClick={() => setShowYards(!showYards)}
                  className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-gray-900 ${
                    showYards ? 'bg-blue-500' : 'bg-gray-600'
                  }`}
                  aria-pressed={showYards}
                >
                  <span
                    className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform duration-300 ${
                      showYards ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
        </div>

        <div className="w-full max-w-7xl mt-4 flex-grow flex items-center justify-center p-4 bg-gray-800 rounded-2xl shadow-2xl border border-gray-700">
           <Field type={selectedField} showNumbers={showNumbers} showMeters={showMeters} showYards={showYards} />
        </div>
      </main>

      <footer className="w-full max-w-7xl text-center mt-8 text-gray-500 text-sm">
        <p>Progettato per allenatori e team per una facile visualizzazione.</p>
      </footer>
    </div>
  );
};

export default App;

import React, { useState, useEffect } from 'react';
import { 
  toBikramSambat, 
  fromBikramSambat, 
  getBikramMonthInfo, 
  solarMonths, 
  toDevanagari, 
  fromDevanagari, 
  Bsdata
} from '../lib/lib';
import { ArrowLeft } from 'lucide-react';
import Footer from './Footer';

// Define the boundaries from the data
const START_BS_YEAR = Bsdata.BS_START_YEAR;
const END_BS_YEAR = Bsdata.BS_START_YEAR + Bsdata.NP_MONTHS_DATA.length - 1;
const START_AD_DATE = new Date(Date.UTC(Bsdata.BS_START_DATE_AD.getFullYear(), Bsdata.BS_START_DATE_AD.getMonth(), Bsdata.BS_START_DATE_AD.getDate()));
const END_AD_DATE = fromBikramSambat(END_BS_YEAR, 11, Bsdata.NP_MONTHS_DATA[Bsdata.NP_MONTHS_DATA.length - 1][11]);
const START_AD_YEAR = START_AD_DATE.getUTCFullYear();
const END_AD_YEAR = END_AD_DATE.getUTCFullYear();

interface ConverterProps {
  onBack: () => void;
}

const Converter: React.FC<ConverterProps> = ({ onBack }) => {
  const [isAdToBs, setIsAdToBs] = useState(true);

  // Timezone Handling for "Today"
  const [todayAd] = useState(() => {
    const now = new Date();
    const nepalFormatter = new Intl.DateTimeFormat('en-CA', {
        timeZone: 'Asia/Kathmandu',
        year: 'numeric', month: '2-digit', day: '2-digit'
    });
    const [year, month, day] = nepalFormatter.format(now).split('-').map(Number);
    return new Date(Date.UTC(year, month - 1, day));
  });
  const [todayBs] = useState(() => toBikramSambat(todayAd));
  // END Timezone Handling

  const [yearText, setYearText] = useState(todayAd.getUTCFullYear().toString());
  const [monthIndex, setMonthIndex] = useState(todayAd.getUTCMonth());
  const [dayText, setDayText] = useState(todayAd.getUTCDate().toString());

  const [resultText, setResultText] = useState('');
  const [infoText, setInfoText] = useState('');

  const handleSwitchMode = (adToBs: boolean) => {
    setIsAdToBs(adToBs);
    if (adToBs) {
      setYearText(todayAd.getUTCFullYear().toString());
      setMonthIndex(todayAd.getUTCMonth());
      setDayText(todayAd.getUTCDate().toString());
    } else {
      setYearText(toDevanagari(todayBs.year));
      setMonthIndex(todayBs.monthIndex);
      setDayText(toDevanagari(todayBs.day));
    }
    setResultText('');
    setInfoText('');
  };

  const handleYearChange = (value: string) => {
    const digits = [...fromDevanagari(value)].filter(char => '0123456789'.includes(char)).join('').slice(0, 4);
    setYearText(isAdToBs ? digits : toDevanagari(digits));
  };
  
  const handleYearBlur = () => {
    const minYear = isAdToBs ? START_AD_YEAR : START_BS_YEAR;
    const maxYear = isAdToBs ? END_AD_YEAR : END_BS_YEAR;
    let year = parseInt(fromDevanagari(yearText), 10);
    if (isNaN(year)) {
        year = isAdToBs ? todayAd.getUTCFullYear() : todayBs.year;
    }
    const clampedYear = Math.max(minYear, Math.min(year, maxYear));
    setYearText(isAdToBs ? clampedYear.toString() : toDevanagari(clampedYear));
  };

  const handleDayChange = (value: string) => {
    const digits = [...fromDevanagari(value)].filter(char => '0123456789'.includes(char)).join('').slice(0, 2);
    setDayText(isAdToBs ? digits : toDevanagari(digits));
  };

  useEffect(() => {
    const year = parseInt(fromDevanagari(yearText), 10);
    const day = parseInt(fromDevanagari(dayText), 10);

    if (isNaN(year) || isNaN(day)) return;

    let maxDay = 31;
    if (isAdToBs) {
      try {
        // Use UTC to get the correct number of days in the month
        maxDay = new Date(Date.UTC(year, monthIndex + 1, 0)).getUTCDate();
      } catch {}
    } else {
      const monthInfo = getBikramMonthInfo(year, monthIndex);
      if (monthInfo) {
        maxDay = monthInfo.totalDays;
      }
    }
    
    if (day > maxDay) {
      setDayText(isAdToBs ? maxDay.toString() : toDevanagari(maxDay));
    }
  }, [yearText, monthIndex, dayText, isAdToBs]);


  const handleConvert = () => {
    setResultText('');
    setInfoText('');
    try {
      const year = parseInt(fromDevanagari(yearText), 10);
      const day = parseInt(fromDevanagari(dayText), 10);

      if (isNaN(year) || isNaN(day) || year.toString().length < 4) {
        setResultText(isAdToBs ? "Please enter a valid date." : "कृपया मान्य मिति प्रविष्ट गर्नुहोस्।");
        return;
      }

      if (isAdToBs) {
        const adDate = new Date(Date.UTC(year, monthIndex, day));
        const bsDate = toBikramSambat(adDate);
        if (bsDate.year === 0) {
            throw new Error("Date is outside the convertible range.");
        }
        setResultText(`वि.सं.: ${toDevanagari(bsDate.year)} ${bsDate.monthName} ${toDevanagari(bsDate.day)}`);
      } else {
        const adDate = fromBikramSambat(year, monthIndex, day);
        const monthName = adDate.toLocaleString('default', { month: 'long', timeZone: 'UTC' });
        setResultText(`ई.सं.: ${adDate.getUTCFullYear()}-${monthName}-${adDate.getUTCDate()}`);
      }
    } catch (e: any) {
      setResultText(isAdToBs ? "Invalid date or out of range." : "अमान्य मिति वा दायरा बाहिर।");
      setInfoText(e.message);
    }
  };

  const adMonths = Array.from({ length: 12 }, (_, i) => new Date(Date.UTC(2000, i, 1)).toLocaleString('default', { month: 'long', timeZone: 'UTC' }));
  const bsMonths = solarMonths;
  const currentMonths = isAdToBs ? adMonths : bsMonths;

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100">
        <header className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center max-w-md mx-auto">
                <button onClick={onBack} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 mr-2">
                    <ArrowLeft size={20} />
                </button>
                <h1 className="text-xl sm:text-2xl font-semibold">Date Converter</h1>
            </div>
        </header>

        <main className="flex-grow overflow-y-auto p-4 sm:p-6 lg:p-8">
            <div className="max-w-md mx-auto">
                <p className="text-center text-sm sm:text-base text-gray-600 dark:text-gray-300 mb-4">
                    {isAdToBs ? "Convert between Bikram Sambat and Gregorian" : "विक्रम सम्वत र ग्रेगोरियन बिच रुपान्तरण"}
                </p>

                <div className="flex justify-center gap-2 mb-6">
                <button onClick={() => handleSwitchMode(true)} className={`px-4 py-2 text-sm font-medium rounded-md ${isAdToBs ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}>
                    AD → BS
                </button>
                <button onClick={() => handleSwitchMode(false)} className={`px-4 py-2 text-sm font-medium rounded-md ${!isAdToBs ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}>
                    BS → AD
                </button>
                </div>

                <div className="space-y-4">
                <p className="font-medium text-sm sm:text-base">{isAdToBs ? "Enter AD date" : "वि.सं. मिति प्रविष्ट गर्नुहोस्"}</p>
                
                <input
                    type="text"
                    value={yearText}
                    onChange={(e) => handleYearChange(e.target.value)}
                    onBlur={handleYearBlur}
                    placeholder={isAdToBs ? "Year" : "वर्ष"}
                    className="w-full p-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 outline-none text-sm sm:text-base"
                />

                <select
                    value={monthIndex}
                    onChange={(e) => setMonthIndex(parseInt(e.target.value, 10))}
                    className="w-full p-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 outline-none appearance-none text-sm sm:text-base"
                >
                    {currentMonths.map((month, idx) => (
                    <option key={idx} value={idx}>{month}</option>
                    ))}
                </select>
                
                <input
                    type="text"
                    value={dayText}
                    onChange={(e) => handleDayChange(e.target.value)}
                    placeholder={isAdToBs ? "Day" : "गते"}
                    className="w-full p-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 outline-none text-sm sm:text-base"
                />

                <button
                    onClick={handleConvert}
                    className="w-full p-3 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition-colors text-sm sm:text-base"
                >
                    {isAdToBs ? "Convert" : "रूपान्तरण गर्नुहोस्"}
                </button>
                </div>

                {resultText && (
                <div className="mt-6 p-4 bg-blue-50 dark:bg-gray-700 rounded-lg text-center">
                    <p className="text-lg sm:text-xl font-semibold text-blue-800 dark:text-blue-200">{resultText}</p>
                    {infoText && (
                        <p className="text-xs sm:text-sm text-yellow-600 dark:text-yellow-400 mt-2">{infoText}</p>
                    )}
                </div>
                )}
            </div>
            <div className="w-full bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
            <Footer />
        </div>
        </main>
    
    </div>
    
  );
};

export default Converter;

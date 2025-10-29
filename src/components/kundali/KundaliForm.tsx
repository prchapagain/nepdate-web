import { LoaderIcon, ChevronDownIcon, LocationIcon, MapIcon, XIcon } from '../../data/icons';
import type { KundaliRequest } from '../../../types/types';
import { NEPALI_LABELS, NEPALI_BS_MONTHS } from '../../constants/constants';
import { nepaliLocations, TIMEZONE_OFFSETS } from '../../data/timezone';
import { Bsdata } from '../../data/monthData';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import tzlookup from 'tz-lookup';
import { useEffect, useMemo, useRef, useState } from 'react';
import { toBikramSambat, fromBikramSambat, getDaysInADMonth, toDevanagari } from '../../lib/lib';

interface KundaliFormProps {
  onCalculate: (data: KundaliRequest) => void;
  isLoading: boolean;
}

const kathmandu = nepaliLocations.find(
  loc => loc.romanization.toLowerCase() === "kathmandu"
);
const defaultLocation = kathmandu ?? nepaliLocations[0];

// --- FormSelect Component ---
const FormSelect: React.FC<{
  label: string;
  value: number | string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  children: React.ReactNode;
}> = ({ label, children, ...props }) => (
  <div className="relative w-full">
    <select
      {...props}
      className="w-full appearance-none bg-gray-100 border border-gray-300 rounded-md py-2 px-3 text-sm text-gray-800 focus:outline-none focus:bg-slate-200 focus:border-blue-400 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 dark:focus:bg-blue-400 dark:focus:border-blue-400"
    >
      {children}
    </select>
    <label className="absolute -top-2 left-2.5 bg-gray-100 px-1 text-xs text-gray-500 dark:bg-gray-700 dark:text-gray-400">{label}</label>
    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 dark:text-gray-300">
      <ChevronDownIcon className="w-4 h-4" />
    </div>
  </div>
);

// --- MapModal Component  ---
interface MapModalProps {
  onClose: () => void;
  onLocationSelect: (lat: number, lon: number) => void;
  initialPosition: [lat: number, lon: number];
}

const MapModal: React.FC<MapModalProps> = ({ onClose, onLocationSelect, initialPosition }) => {
  const [markerPosition, setMarkerPosition] = useState<[number, number]>(initialPosition);

  const LocationMarker = () => {
    useMapEvents({
      click(e) {
        setMarkerPosition([e.latlng.lat, e.latlng.lng]);
      },
    });
    return <Marker position={markerPosition}></Marker>;
  };

  const handleSelect = () => {
    onLocationSelect(markerPosition[0], markerPosition[1]);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 py-2 z-40 flex justify-center items-center p-4">
      {/* Changed bg-slate-200 to bg-slate-50 to match card bg */}
      <div className="bg-slate-50 rounded-lg w-full max-w-2xl h-[70vh] flex flex-col dark:bg-gray-800 dark:text-gray-200">
        <div className="flex justify-between items-center border-b p-3 dark:border-gray-700">
          <h3 className="text-lg font-semibold">{NEPALI_LABELS.selectOnMap || "Select on Map"}</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-100">
            <XIcon className="w-5 h-5" />
          </button>
        </div>
        <div className="flex-1 relative">
          <MapContainer
            center={initialPosition}
            zoom={7}
            scrollWheelZoom={true}
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <LocationMarker />
          </MapContainer>
        </div>
        <div className="border-t p-3 flex justify-between items-center dark:border-gray-700">
          <div className="text-sm text-gray-600 dark:text-gray-300">
            Lat: {markerPosition[0].toFixed(4)}, Lon: {markerPosition[1].toFixed(4)}
          </div>
          <button
            onClick={handleSelect}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 dark:bg-blue-400 dark:text-blue-900 dark:hover:bg-blue-500 dark:hover:text-white"
          >
            {NEPALI_LABELS.selectLocation || "Select Location"}
          </button>
        </div>
      </div>
    </div>
  );
};


// --- InputGroup Components ---
const InputGroup: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="grid grid-cols-3 border border-gray-300 rounded-md overflow-hidden divide-x divide-gray-300 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 dark:border-gray-600 dark:divide-gray-600 dark:focus-within:border-blue-400 dark:focus-within:ring-blue-400">
    {children}
  </div>
);

const GroupedSelect: React.FC<{
  label: string;
  value: number | string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  children: React.ReactNode;
}> = ({ label, children, ...props }) => (
  <div className="relative">
    <label className="absolute top-1 left-2 text-xs text-gray-500 z-10 dark:text-gray-400">{label}</label>
    <select
      {...props}
      className="relative w-full appearance-none bg-gray-100 pt-5 pb-1.5 px-2 text-sm text-gray-800 focus:outline-none focus:bg-slate-200 z-0 dark:bg-gray-700 dark:text-gray-200 dark:focus:bg-gray-600"
    >
      {children}
    </select>
    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 z-10 dark:text-gray-300">
      <ChevronDownIcon className="w-4 h-4" />
    </div>
  </div>
);


// --- KundaliForm Component ---
export const KundaliForm: React.FC<KundaliFormProps> = ({ onCalculate, isLoading }) => {
  const [name, setName] = useState('प्रयोगकर्ता');
  const [dateSystem, setDateSystem] = useState<'BS' | 'AD'>('BS');
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsLocationDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // --- States and Memos ---
  const today = new Date();
  const bsToday = toBikramSambat(today);

  const [adYear, setAdYear] = useState(today.getFullYear());
  const [adMonth, setAdMonth] = useState(today.getMonth() + 1); // JS months are 0-based
  const [adDay, setAdDay] = useState(today.getDate());

  const [bsYear, setBsYear] = useState(bsToday.year);
  const [bsMonth, setBsMonth] = useState(bsToday.monthIndex + 1); // bikram.xyz uses 0-based monthIndex
  const [bsDay, setBsDay] = useState(bsToday.day);

  const [period, setPeriod] = useState<'AM' | 'PM'>('PM');
  const [hour, setHour] = useState(4);
  const [minute, setMinute] = useState(15);
  const [second, setSecond] = useState(0);
  const [relation, setRelation] = useState(NEPALI_LABELS.self);
  const [locationMode, setLocationMode] = useState<'nepal' | 'manual'>('nepal');
  const [nepalLocation, setNepalLocation] = useState(defaultLocation);
  const [manualLat, setManualLat] = useState(defaultLocation?.latitude ?? 27.7172);
  const [manualLon, setManualLon] = useState(defaultLocation?.longitude ?? 85.3240);
  const [manualZoneId, setManualZoneId] = useState(defaultLocation?.zoneId ?? 'Asia/Kathmandu');
  const [showMap, setShowMap] = useState(false);
  const [locationSearch, setLocationSearch] = useState(defaultLocation?.name ?? 'Kathmandu');
  const [isLocationDropdownOpen, setIsLocationDropdownOpen] = useState(false);

  useEffect(() => {
    if (typeof manualLat !== 'number' || typeof manualLon !== 'number' || isNaN(manualLat) || isNaN(manualLon)) {
      return;
    }
    try {
      const zoneId = tzlookup(manualLat, manualLon);
      const isValidZone = TIMEZONE_OFFSETS.some((tz) => tz.zoneId === zoneId);
      if (isValidZone) {
        setManualZoneId(zoneId);
      } else {
        setManualZoneId(defaultLocation?.zoneId ?? 'Asia/Kathmandu');
      }
    } catch (err) {
      console.error("tzlookup failed:", err);
      setManualZoneId(defaultLocation?.zoneId ?? 'Asia/Kathmandu');
    }
  }, [manualLat, manualLon, defaultLocation?.zoneId]);

  const bsYears = useMemo(() => {
    return Array.from({ length: Bsdata.BS_END_YEAR - Bsdata.BS_START_YEAR + 1 }, (_, i) => Bsdata.BS_END_YEAR - i);
  }, []);
  const adYears = useMemo(() => Array.from({ length: 102 }, (_, i) => 2034 - i), []);
  const hours = useMemo(() => Array.from({ length: 12 }, (_, i) => i + 1), []);
  const minutesSeconds = useMemo(() => Array.from({ length: 60 }, (_, i) => i), []);

  const daysInMonth = useMemo(() => {
    const yearData = Bsdata.NP_MONTHS_DATA[bsYear];
    return dateSystem === 'BS'
      ? (yearData ? yearData[bsMonth - 1] : 30)
      : getDaysInADMonth(adYear, adMonth);
  }, [dateSystem, bsYear, bsMonth, adYear, adMonth]);

  const filteredLocations = useMemo(() => {
    const searchTerm = locationSearch.toLowerCase().trim();
    if (!searchTerm || searchTerm === nepalLocation?.name.toLowerCase().trim()) {
      return nepaliLocations;
    }
    return nepaliLocations.filter(loc =>
      loc.name.includes(searchTerm) ||
      (loc.romanization && loc.romanization.toLowerCase().includes(searchTerm))
    );
  }, [locationSearch, nepalLocation?.name]);

  useEffect(() => {
    if (dateSystem === 'BS' && bsDay > daysInMonth) setBsDay(daysInMonth);
    if (dateSystem === 'AD' && adDay > daysInMonth) setAdDay(daysInMonth);
  }, [daysInMonth, dateSystem, bsDay, adDay]);

  // --- Handlers and Submit Logic ---
  const handleNepalLocationChange = (selected: typeof nepaliLocations[0]) => {
    setNepalLocation(selected);
    setManualLat(selected.latitude);
    setManualLon(selected.longitude);
    setManualZoneId(selected.zoneId);
  };

  const handleMapSelect = (lat: number, lon: number) => {
    setManualLat(lat);
    setManualLon(lon);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const pad = (n: number) => n.toString().padStart(2, '0');
    let finalAdYear = adYear, finalAdMonth = adMonth, finalAdDay = adDay;

    if (dateSystem === 'BS') {
      const adDate = fromBikramSambat(bsYear, bsMonth - 1, bsDay);
      finalAdYear = adDate.getFullYear();
      finalAdMonth = adDate.getMonth() + 1;
      finalAdDay = adDate.getDate();
    }

    let h24 = hour;
    if (period === 'PM' && hour < 12) h24 += 12;
    if (period === 'AM' && hour === 12) h24 = 0;

    const datetimeString = `${finalAdYear}-${pad(finalAdMonth)}-${pad(finalAdDay)}T${pad(h24)}:${pad(minute)}:${pad(second)}`;
    const finalLat = locationMode === 'nepal' ? (nepalLocation?.latitude ?? 27.7172) : manualLat;
    const finalLon = locationMode === 'nepal' ? (nepalLocation?.longitude ?? 85.3240) : manualLon;
    const finalZoneId = locationMode === 'nepal' ? (nepalLocation?.zoneId ?? 'Asia/Kathmandu') : manualZoneId;
    const foundTimezone = TIMEZONE_OFFSETS.find(tz => tz.zoneId === finalZoneId);
    const finalOffset = foundTimezone
      ? foundTimezone.offset
      : 5.75;

    onCalculate({
      name,
      datetime: datetimeString,
      latitude: finalLat,
      longitude: finalLon,
      zoneId: finalZoneId,
      offset: finalOffset,
      options: {
        zodiac: 'SIDEREAL',
        ayanamsa: 'LAHIRI',
        houseSystem: 'WHOLE_SIGN',
        divisionalCharts: [9],
        dashaSystem: 'VIMSHOTTARI',
      },
    });
  };

  return (
    <>
      {/* --- PAGE WRAPPER --- */}
      {/* This div provides the overall page background (your app's bg) and scrolling */}
      <div className="w-full min-h-screen bg-slate-200 dark:bg-gray-800 py-8 sm:px-4 lg:px-8 flex justify-center items-start overflow-y-auto">
        <form
          onSubmit={handleSubmit}
          // --- CARD STYLING ---
          // bg-slate-50 to distinguish from bg-slate-200
          // Added shadow-lg and dark:border
          // Increased max-w for lg/xl screens
          // Adjusted padding and spacing
          className="kundali-card bg-slate-50 rounded-xl shadow-lg w-full max-w-md lg:max-w-3xl xl:max-w-6xl p-4  space-y-4 text-sm md:text-base dark:bg-gray-800 dark:text-gray-200 dark:border dark:border-gray-700"
        >
          <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-blue-700 text-center dark:text-blue-300">{NEPALI_LABELS.mainTitle}</h2>

          {/* --- 2-COLUMN GRID --- */}
          {/* This grid splits the form into 2 columns on xl screens */}
          <div className="grid grid-cols-1 xl:grid-cols-2 xl:gap-x-8">

            {/* --- LEFT COLUMN --- */}
            <div className="space-y-3 md:space-y-4">
              <div>
                <label className="block font-medium text-stone-700 mb-1 dark:text-stone-300">{NEPALI_LABELS.name}</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:focus:ring-blue-400 dark:focus:border-blue-400"
                  required
                />
              </div>

              {/* Date Input Section */}
              <div>
                <div className="flex justify-between py-1.5 items-center mb-1">
                  <label className="block font-medium text-stone-700 dark:text-stone-300">
                    {NEPALI_LABELS.dateOfBirth}
                  </label>
                  <div className="flex bg-gray-200  py-2 rounded-md p-0.5 w-auto dark:bg-gray-700">
                    {(['BS', 'AD'] as const).map((sys) => (
                      <button
                        key={sys}
                        type="button"
                        onClick={() => setDateSystem(sys)}
                        className={`px-3 py-1 text-xs rounded-md transition-colors duration-200 ${dateSystem === sys
                          ? 'bg-blue-500 text-white shadow dark:bg-blue-400 dark:text-blue-900'
                          : 'text-gray-600 hover:bg-gray-300 dark:text-gray-300 dark:hover:bg-gray-600'
                          }`}
                      >
                        {sys === 'BS' ? NEPALI_LABELS.bs : NEPALI_LABELS.ad}
                      </button>
                    ))}
                  </div>
                </div>

                {dateSystem === 'BS' ? (
                  <InputGroup>
                    <GroupedSelect label={NEPALI_LABELS.year} value={bsYear} onChange={e => setBsYear(+e.target.value)}>
                      {bsYears.map(y => <option key={y} value={y}>{toDevanagari(y)}</option>)}
                    </GroupedSelect>
                    <GroupedSelect label={NEPALI_LABELS.month} value={bsMonth} onChange={e => setBsMonth(+e.target.value)}>
                      {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                        <option key={m} value={m}>{NEPALI_BS_MONTHS[m - 1]}</option>
                      ))}
                    </GroupedSelect>
                    <GroupedSelect label={NEPALI_LABELS.day} value={bsDay} onChange={e => setBsDay(+e.target.value)}>
                      {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(d => <option key={d} value={d}>{toDevanagari(d)}</option>)}
                    </GroupedSelect>
                  </InputGroup>
                ) : (
                  <InputGroup>
                    <GroupedSelect label={NEPALI_LABELS.year} value={adYear} onChange={e => setAdYear(+e.target.value)}>
                      {adYears.map(y => <option key={y} value={y}>{toDevanagari(y)}</option>)}
                    </GroupedSelect>
                    <GroupedSelect label={NEPALI_LABELS.month} value={adMonth} onChange={e => setAdMonth(+e.target.value)}>
                      {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                        <option key={m} value={m}>{toDevanagari(m)}</option>
                      ))}
                    </GroupedSelect>
                    <GroupedSelect label={NEPALI_LABELS.day} value={adDay} onChange={e => setAdDay(+e.target.value)}>
                      {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(d => <option key={d} value={d}>{toDevanagari(d)}</option>)}
                    </GroupedSelect>
                  </InputGroup>
                )}
              </div>

              {/* Time of Birth */}
              <div>
                <label className="block font-medium text-stone-700 mb-1 dark:text-stone-300">{NEPALI_LABELS.birthTimeLabel}</label>
                <InputGroup>
                  <GroupedSelect label={NEPALI_LABELS.hour} value={hour} onChange={e => setHour(+e.target.value)}>
                    {hours.map(h => <option key={h} value={h}>{toDevanagari(h)}</option>)}
                  </GroupedSelect>
                  <GroupedSelect label={NEPALI_LABELS.minute} value={minute} onChange={e => setMinute(+e.target.value)}>
                    {minutesSeconds.map(m => (
                      <option key={m} value={m}>
                        {toDevanagari(m.toString().padStart(2, '0'))}
                      </option>
                    ))}
                  </GroupedSelect>
                  <GroupedSelect label={NEPALI_LABELS.second} value={second} onChange={e => setSecond(+e.target.value)}>
                    {minutesSeconds.map(s => (
                      <option key={s} value={s}>
                        {toDevanagari(s.toString().padStart(2, '0'))}
                      </option>
                    ))}
                  </GroupedSelect>
                </InputGroup>
                <div className="mt-1.5">
                  <div className="flex bg-gray-200 rounded-md p-0.5 w-full dark:bg-gray-700">
                    {(['AM', 'PM'] as const).map((key) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setPeriod(key)}
                        className={`w-full px-3 py-1.5 text-sm rounded-md transition-colors duration-200 ${period === key ? 'bg-blue-500 text-white shadow dark:bg-blue-400 dark:text-blue-900' : 'text-gray-600 hover:bg-gray-300 dark:text-gray-300 dark:hover:bg-gray-600'
                          }`}
                      >
                        {NEPALI_LABELS[key.toLowerCase() as 'am' | 'pm']}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Relation */}
              <div>
                <label className="block font-medium text-stone-700 mb-1 dark:text-stone-300">{NEPALI_LABELS.relation}</label>
                <select
                  value={relation}
                  onChange={e => setRelation(e.target.value)}
                  className="w-full bg-gray-100 border border-gray-300 rounded-md py-2 px-3 text-sm text-gray-800 focus:outline-none focus:bg-slate-200 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 dark:focus:bg-gray-600 dark:focus:border-blue-400"
                >
                  <option>{NEPALI_LABELS.self}</option>
                  <option>छोरा</option>
                  <option>छोरी</option>
                  <option>जीवनसाथी</option>
                </select>
              </div>
            </div>

            {/* --- RIGHT COLUMN --- */}
            <div className="space-y-3 md:space-y-4 mt-3 xl:mt-0">
              {/* Location Section --- */}
              <div>
                <label className="block font-medium text-stone-700 mb-1 dark:text-stone-300">{NEPALI_LABELS.birthPlace}</label>

                <div className="flex bg-gray-200 rounded-md p-0.5 w-full mb-2 dark:bg-gray-700">
                  <button
                    type="button"
                    onClick={() => {
                      setLocationMode('nepal');
                      if (nepalLocation) {
                        setLocationSearch(nepalLocation.name);
                      }
                    }}
                    className={`w-full px-3 py-1.5 text-sm rounded-md transition-colors duration-200 ${locationMode === 'nepal' ? 'bg-blue-500 text-white shadow dark:bg-blue-400 dark:text-blue-900' : 'text-gray-600 hover:bg-gray-300 dark:text-gray-300 dark:hover:bg-gray-600'
                      }`}
                  >
                    <LocationIcon className="w-4 h-4 inline-block -mt-0.5 mr-1" />
                    {NEPALI_LABELS.selectFromList || "Select from Nepal"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setLocationMode('manual')}
                    className={`w-full px-3 py-1.5 text-sm rounded-md transition-colors duration-200 ${locationMode === 'manual' ? 'bg-blue-500 text-white shadow dark:bg-blue-400 dark:text-blue-900' : 'text-gray-600 hover:bg-gray-300 dark:text-gray-300 dark:hover:bg-gray-600'
                      }`}
                  >
                    <MapIcon className="w-4 h-4 inline-block -mt-0.5 mr-1" />
                    {NEPALI_LABELS.enterManually || "Enter Manually"}
                  </button>
                </div>

                {locationMode === 'nepal' && (
                  <div className="relative" ref={dropdownRef}>
                    <input
                      type="text"
                      placeholder={NEPALI_LABELS.searchLocation}
                      value={locationSearch}
                      onChange={(e) => {
                        setLocationSearch(e.target.value);
                        setIsLocationDropdownOpen(true);
                      }}
                      onFocus={(e) => {
                        e.target.select();
                        setLocationSearch("");
                        setIsLocationDropdownOpen(true);
                      }}
                      className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 dark:focus:ring-blue-400 dark:focus:border-blue-400"
                    />
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 dark:text-gray-300">
                      <ChevronDownIcon className="w-4 h-4" />
                    </div>

                    {isLocationDropdownOpen && (
                      <div className="absolute z-10 w-full bg-slate-50 border border-gray-300 rounded-md mt-1 max-h-60 overflow-y-auto shadow-lg dark:bg-gray-800 dark:border-gray-600">
                        {filteredLocations.map(loc => (
                          <div
                            key={loc.name}
                            className="p-2 cursor-pointer hover:bg-gray-100 text-sm dark:hover:bg-gray-700"
                            onMouseDown={() => {
                              handleNepalLocationChange(loc);
                              setLocationSearch(loc.name);
                              setIsLocationDropdownOpen(false);
                            }}
                          >
                            {loc.name}
                          </div>
                        ))}
                        <div
                          className="p-2 cursor-pointer hover:bg-gray-100 border-t text-sm font-medium dark:hover:bg-gray-700 dark:border-gray-600"
                          onMouseDown={() => {
                            setLocationMode('manual');
                            setIsLocationDropdownOpen(false);
                          }}
                        >
                          --- {NEPALI_LABELS.outsideNepal} ---
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {locationMode === 'manual' && (
                  <div className="space-y-2 p-3 border border-gray-200 rounded-md dark:border-gray-700">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs text-gray-500 mb-0.5 dark:text-gray-400">{NEPALI_LABELS.latitude}</label>
                        <input
                          type="number"
                          step="any"
                          value={manualLat}
                          onChange={e => setManualLat(parseFloat(e.target.value))}
                          className="w-full px-3 py-2 text-sm border border-stone-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 dark:focus:ring-blue-400 dark:focus:border-blue-400"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-0.5 dark:text-gray-400">{NEPALI_LABELS.longitude}</label>
                        <input
                          type="number"
                          step="any"
                          value={manualLon}
                          onChange={e => setManualLon(parseFloat(e.target.value))}
                          className="w-full px-3 py-2 text-sm border border-stone-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 dark:focus:ring-blue-400 dark:focus:border-blue-400"
                        />
                      </div>
                    </div>
                    <div>
                      <FormSelect
                        label={NEPALI_LABELS.timezone}
                        value={manualZoneId}
                        onChange={e => setManualZoneId(e.target.value)}
                      >
                        {TIMEZONE_OFFSETS.map((tz) => (
                          <option key={tz.zoneId} value={tz.zoneId}>
                            {tz.label}
                          </option>
                        ))}
                      </FormSelect>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowMap(true)}
                      className="w-full flex items-center justify-center gap-2 bg-blue-50 text-blue-700 border border-blue-200 rounded-md text-sm py-2 hover:bg-blue-100 dark:bg-blue-900 dark:text-blue-200 dark:border-blue-700 dark:hover:bg-blue-800"
                    >
                      <MapIcon className="w-4 h-4" />
                      {NEPALI_LABELS.selectOnMap}
                    </button>
                  </div>
                )}

                <div className="text-xs text-gray-500 mt-1 dark:text-gray-400">
                  {locationMode === 'nepal'
                    ? `${NEPALI_LABELS.latitudeShort} : ${nepalLocation?.latitude.toFixed(2)} ${NEPALI_LABELS.longitudeShort} : ${nepalLocation?.longitude.toFixed(2)}`
                    : `${NEPALI_LABELS.latitudeShort} : ${manualLat.toFixed(2)} ${NEPALI_LABELS.longitudeShort} : ${manualLon.toFixed(2)} (TZ: ${manualZoneId})`
                  }
                </div>
              </div>
            </div>
          </div>

          {/* --- SUBMIT BUTTON --- */}
          <div className="sticky bottom-0 bg-slate-50/90 backdrop-blur-sm pt-4 pb-2 -mb-4  sm:-mb-6  md:-mb-8  px-4 sm:px-6 md:px-8 rounded-b-xl dark:bg-gray-800/90">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center items-center py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-blue-500 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300 disabled:cursor-not-allowed dark:bg-blue-400 dark:text-blue-900 dark:hover:bg-blue-500 dark:hover:text-white dark:focus:ring-blue-300 dark:disabled:bg-blue-200 dark:disabled:text-gray-500"
            >
              {isLoading ? (
                <>
                  <LoaderIcon className="w-5 h-5 mr-3 animate-spin" />
                  {NEPALI_LABELS.calculating}
                </>
              ) : (
                NEPALI_LABELS.calculate
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Map Modal */}
      {showMap && (
        <MapModal
          initialPosition={[manualLat, manualLon]}
          onClose={() => setShowMap(false)}
          onLocationSelect={handleMapSelect}
        />
      )}
    </>
  );
};
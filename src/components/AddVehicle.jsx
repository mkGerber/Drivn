import React, {useState, useEffect, useMemo} from 'react'
import Navbar from './Navbar'
import supabase from "../supabaseClient"
import { v4 as uuidv4 } from 'uuid';
import { PlusIcon, ArrowRightIcon, InformationCircleIcon, Cog6ToothIcon, DocumentTextIcon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';
import { UserAuth } from '../context/AuthContext';
import vehicleModels from '../../mobile/src/data/vehicle models.json';

const AddVehicle = () => {
  const { session } = UserAuth();
  const navigate = useNavigate();
  const ADD_CAR_XP = 100;
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [type, setType] = useState("");
  const [makeQuery, setMakeQuery] = useState("");
  const [modelQuery, setModelQuery] = useState("");
  const [showMakeOptions, setShowMakeOptions] = useState(false);
  const [showModelOptions, setShowModelOptions] = useState(false);
  const [year, setYear] = useState("");
  const [color, setColor] = useState("");
  const [licensePlate, setLicensePlate] = useState("");
  const [vin, setVin] = useState("");
  const [trim, setTrim] = useState("");
  const [mileage, setMileage] = useState("");
  const [transmission, setTransmission] = useState("");
  const [engine, setEngine] = useState("");
  const [uploading, setUploading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  useEffect(() => {
    if (!session) {
      navigate('/signin');
    }
  }, [session, navigate]);

  const catalog = useMemo(() => {
    const list = (vehicleModels || [])
      .map((entry) => {
        const makeName = String(entry?.Make || entry?.make_name || '').trim();
        if (!makeName) return null;
        const rawModels = (entry?.Models || entry?.models || [])
          .map((model) => String(model?.model_name || model || '').trim())
          .filter(Boolean);
        const modelsByName = new Map();
        rawModels.forEach((name) => {
          const key = name.toLowerCase();
          if (!modelsByName.has(key)) {
            modelsByName.set(key, name);
          }
        });
        const models = Array.from(modelsByName.values()).sort((a, b) => a.localeCompare(b));
        return { make: makeName, models };
      })
      .filter(Boolean)
      .sort((a, b) => a.make.localeCompare(b.make));
    return list;
  }, []);

  const makeOptions = useMemo(
    () => catalog.map((item) => item.make).sort((a, b) => a.localeCompare(b)),
    [catalog]
  );

  const selectedMake = useMemo(
    () => catalog.find((item) => item.make === make) || null,
    [catalog, make]
  );

  const modelOptions = useMemo(() => {
    if (!selectedMake) return [];
    return selectedMake.models.slice().sort();
  }, [selectedMake]);

  const matchOption = (value, options) => {
    const normalized = value.trim().toLowerCase();
    if (!normalized) return "";
    return options.find((option) => option.toLowerCase() === normalized) || "";
  };

  const getTypeForMake = (value = '') => {
    const normalized = value.trim().toLowerCase();
    if (!normalized) return '';
    const euro = new Set([
      'audi', 'bmw', 'mercedes-benz', 'mercedes', 'porsche', 'volkswagen', 'volvo', 'mini',
      'land rover', 'jaguar', 'alfa romeo', 'fiat', 'peugeot', 'renault', 'skoda', 'seat',
      'bentley', 'maserati', 'ferrari', 'lamborghini', 'aston martin', 'rolls-royce', 'mclaren',
    ]);
    const jdm = new Set([
      'toyota', 'lexus', 'honda', 'acura', 'nissan', 'infiniti', 'mazda', 'subaru', 'mitsubishi',
      'suzuki', 'daihatsu', 'isuzu',
    ]);
    const domestic = new Set([
      'ford', 'chevrolet', 'gmc', 'cadillac', 'buick', 'chrysler', 'dodge', 'ram', 'jeep',
      'lincoln', 'tesla', 'rivian',
    ]);
    const korean = new Set(['hyundai', 'kia', 'genesis']);
    if (euro.has(normalized)) return 'Euro';
    if (jdm.has(normalized)) return 'JDM';
    if (domestic.has(normalized)) return 'Domestic';
    if (korean.has(normalized)) return 'Korean';
    return 'Other';
  };

  useEffect(() => {
    if (!make) {
      setModel("");
      setModelQuery("");
      setType("");
      return;
    }
    setType(getTypeForMake(make));
    if (model && !modelOptions.includes(model)) {
      setModel("");
    }
  }, [make, model, modelOptions, selectedMake]);

  const filteredMakes = makeOptions.filter((item) =>
    item.toLowerCase().includes(makeQuery.trim().toLowerCase())
  );

  const filteredModels = modelOptions.filter((item) =>
    item.toLowerCase().includes(modelQuery.trim().toLowerCase())
  );

  const awardCarXp = async () => {
    if (!session?.user?.id) return;
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('xp_score')
      .eq('id', session.user.id)
      .single();

    if (profileError) {
      console.error('Error fetching XP:', profileError);
      return;
    }

    const nextXp = (Number(profileData?.xp_score) || 0) + ADD_CAR_XP;
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ xp_score: nextXp })
      .eq('id', session.user.id);

    if (updateError) {
      console.error('Error updating XP:', updateError);
    }
  };

  const handleAddVehicle = async (e) => {
    setUploading(true);
    e.preventDefault();
    
    if (!session?.user?.id) {
      alert('Please sign in to add a vehicle');
      setUploading(false);
      return;
    }

    const matchedMake = matchOption(makeQuery || make, makeOptions);
    const matchedModel = matchOption(modelQuery || model, modelOptions);
    const finalMake = matchedMake || make;
    const finalModel = matchedModel || model;

    if (!finalMake || !finalModel) {
      alert('Please select a valid make and model from the list.');
      setUploading(false);
      return;
    }

    const newVehicleData = {
      id: uuidv4(),
      user_id: session.user.id,
      make: finalMake,
      model: finalModel,
      year: year,
      color: color,
      license_plate: licensePlate,
      vin: vin,
      trim: trim,
      current_mileage: mileage,
      transmission: transmission,
      engine: engine,
      public: true,
      type: getTypeForMake(finalMake) || null
    };
    const { data, error } = await supabase.from("cars").insert([newVehicleData]).single();

    if (error) {
      console.error("Error adding vehicle:", error);
    } else {
      console.log("Vehicle added successfully:", data);
      await awardCarXp();
    }

    // Redirect to garage page
    navigate("/garage");
    setUploading(false);
  };

  if (!session) return null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-black text-white -mt-0">
      <Navbar />
      
      <div className="max-w-3xl mx-auto px-6 py-6 md:py-12">
        {/* Hero Header */}
        <div
          className={`mb-8 transform transition-all duration-1000 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-r from-red-500 to-orange-500 rounded-xl">
              <PlusIcon className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-white">
              <span className="bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">Add Vehicle</span>
            </h1>
          </div>
          <p className="text-gray-400 text-lg">Add a new vehicle to your garage</p>
        </div>

        {/* Loading State */}
        {uploading && (
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-12 border border-gray-700/50 text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-red-500 border-t-transparent mb-4"></div>
            <p className="text-gray-400 text-lg">Adding vehicle to your garage...</p>
          </div>
        )}

        {/* Form */}
        {!uploading && (
          <form
            onSubmit={handleAddVehicle}
            className={`bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-gray-700/50 transform transition-all duration-1000 delay-200 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
          >
            {/* Basic Information Section */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <InformationCircleIcon className="w-6 h-6 text-red-400" />
                Basic Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Make <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search or select make"
                      required
                      className="w-full p-3 bg-gray-900 text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 placeholder-gray-500"
                      value={makeQuery}
                      onChange={(e) => {
                        const nextValue = e.target.value;
                        setMakeQuery(nextValue);
                        const matchedMake = matchOption(nextValue, makeOptions);
                        if (matchedMake && matchedMake !== make) {
                          setMake(matchedMake);
                          setModel("");
                          setModelQuery("");
                        } else if (!matchedMake && make) {
                          setMake("");
                          setModel("");
                          setModelQuery("");
                        }
                      }}
                      onFocus={() => setShowMakeOptions(true)}
                      onBlur={() => setTimeout(() => setShowMakeOptions(false), 100)}
                    />
                    {showMakeOptions && filteredMakes.length > 0 && (
                      <div className="absolute z-20 mt-2 w-full max-h-60 overflow-auto rounded-lg border border-gray-700 bg-gray-900 shadow-lg">
                        {filteredMakes.map((item) => (
                          <button
                            key={item}
                            type="button"
                            className="w-full text-left px-4 py-2 text-white hover:bg-gray-800"
                            onMouseDown={() => {
                              setMake(item);
                              setMakeQuery(item);
                              setModel("");
                              setModelQuery("");
                              setShowMakeOptions(false);
                            }}
                          >
                            {item}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Model <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder={make ? "Search or select model" : "Pick a make first"}
                      required
                      className="w-full p-3 bg-gray-900 text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                      value={modelQuery}
                      onChange={(e) => {
                        const nextValue = e.target.value;
                        setModelQuery(nextValue);
                        if (!make) return;
                        const matchedModel = matchOption(nextValue, modelOptions);
                        if (matchedModel && matchedModel !== model) {
                          setModel(matchedModel);
                        } else if (!matchedModel && model) {
                          setModel("");
                        }
                      }}
                      onFocus={() => setShowModelOptions(true)}
                      onBlur={() => setTimeout(() => setShowModelOptions(false), 100)}
                      disabled={!make || modelOptions.length === 0}
                    />
                    {showModelOptions && filteredModels.length > 0 && (
                      <div className="absolute z-20 mt-2 w-full max-h-60 overflow-auto rounded-lg border border-gray-700 bg-gray-900 shadow-lg">
                        {filteredModels.map((item) => (
                          <button
                            key={item}
                            type="button"
                            className="w-full text-left px-4 py-2 text-white hover:bg-gray-800"
                            onMouseDown={() => {
                              setModel(item);
                              setModelQuery(item);
                              setShowModelOptions(false);
                            }}
                          >
                            {item}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Year <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    placeholder="e.g., 2020"
                    required
                    min="1900"
                    max="2100"
                    className="w-full p-3 bg-gray-900 text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 placeholder-gray-500"
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Trim
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., SE, XLE"
                    className="w-full p-3 bg-gray-900 text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 placeholder-gray-500"
                    value={trim}
                    onChange={(e) => setTrim(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Specifications Section */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <Cog6ToothIcon className="w-6 h-6 text-blue-400" />
                Specifications
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Engine
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., 3.5L V6"
                    className="w-full p-3 bg-gray-900 text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 placeholder-gray-500"
                    value={engine}
                    onChange={(e) => setEngine(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Transmission
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Automatic, Manual"
                    className="w-full p-3 bg-gray-900 text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 placeholder-gray-500"
                    value={transmission}
                    onChange={(e) => setTransmission(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Current Mileage
                  </label>
                  <input
                    type="number"
                    placeholder="0"
                    min="0"
                    className="w-full p-3 bg-gray-900 text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 placeholder-gray-500"
                    value={mileage}
                    onChange={(e) => setMileage(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Color
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Red, Black"
                    className="w-full p-3 bg-gray-900 text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 placeholder-gray-500"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Additional Details Section */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <DocumentTextIcon className="w-6 h-6 text-green-400" />
                Additional Details
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    License Plate
                  </label>
                  <input
                    type="text"
                    placeholder="Optional"
                    className="w-full p-3 bg-gray-900 text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 placeholder-gray-500"
                    value={licensePlate}
                    onChange={(e) => setLicensePlate(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    VIN
                  </label>
                  <input
                    type="text"
                    placeholder="Vehicle Identification Number"
                    className="w-full p-3 bg-gray-900 text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 placeholder-gray-500"
                    value={vin}
                    onChange={(e) => setVin(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={() => navigate('/garage')}
                className="flex-1 px-6 py-3 bg-gray-700 text-white rounded-xl hover:bg-gray-600 transition font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-6 py-3 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-xl hover:opacity-90 transition font-semibold shadow-lg shadow-red-500/50 flex items-center justify-center gap-2"
              >
                Add Vehicle
                <ArrowRightIcon className="w-5 h-5" />
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default AddVehicle
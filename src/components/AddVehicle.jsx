import React, {useState} from 'react'
import Navbar from './Navbar'
import  supabase from "../supabaseClient"
import { v4 as uuidv4 } from 'uuid';

const AddVehicle = () => {
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState("");
  const [color, setColor] = useState("");
  const [licensePlate, setLicensePlate] = useState("");
  const [vin, setVin] = useState("");
  const [trim, setTrim] = useState("");
  const [mileage, setMileage] = useState("");
  const [transmission, setTransmission] = useState("");
  const [engine, setEngine] = useState("");
  const [uploading, setUploading] = useState(false);

  const handleAddVehicle = async (e) => {
    setUploading(true);
    e.preventDefault();
    const newVehicleData = {
      id: uuidv4(),
      make: make,
      model: model,
      year: year,
      color: color,
      license_plate: licensePlate,
      vin: vin,
      trim: trim,
      current_mileage: mileage,
      transmission: transmission,
      engine: engine
    };
    const { data, error } = await supabase.from("cars").insert([newVehicleData]).single();

    if (error) {
      console.error("Error adding vehicle:", error);
    } else {
      console.log("Vehicle added successfully:", data);
    }

    // Redirect to garage page
    window.location.href = "/garage";
    setUploading(false);
    
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
        <Navbar/>
        {uploading && <p className="text-gray-600 dark:text-gray-400 ">Adding vehicle...</p>}
        {!uploading && (
          <form onSubmit={handleAddVehicle} className="max-w-md m-auto pt-24">
            <h2 className="font-bold pb-2 text-black dark:text-white">Add vehicle!</h2> 
            <input type="text" placeholder="Make" className="w-full p-2 mb-2 bg-white dark:bg-gray-800 text-black dark:text-white border border-gray-300 dark:border-gray-600 rounded" value={make} onChange={(e) => setMake(e.target.value)}/>
            <input type="text" placeholder="Model" className="w-full p-2 mb-2 bg-white dark:bg-gray-800 text-black dark:text-white border border-gray-300 dark:border-gray-600 rounded" value={model} onChange={(e) => setModel(e.target.value)}/>
            <input type="text" placeholder="Year" className="w-full p-2 mb-2 bg-white dark:bg-gray-800 text-black dark:text-white border border-gray-300 dark:border-gray-600 rounded" value={year} onChange={(e) => setYear(e.target.value)}/>
            <input type="text" placeholder="Color" className="w-full p-2 mb-2 bg-white dark:bg-gray-800 text-black dark:text-white border border-gray-300 dark:border-gray-600 rounded" value={color} onChange={(e) => setColor(e.target.value)}/>
            <input type="text" placeholder="License Plate" className="w-full p-2 mb-2 bg-white dark:bg-gray-800 text-black dark:text-white border border-gray-300 dark:border-gray-600 rounded" value={licensePlate} onChange={(e) => setLicensePlate(e.target.value)}/>
            <input type="text" placeholder="VIN" className="w-full p-2 mb-2 bg-white dark:bg-gray-800 text-black dark:text-white border border-gray-300 dark:border-gray-600 rounded" value={vin} onChange={(e) => setVin(e.target.value)}/>
            <input type="text" placeholder="Trim" className="w-full p-2 mb-2 bg-white dark:bg-gray-800 text-black dark:text-white border border-gray-300 dark:border-gray-600 rounded" value={trim} onChange={(e) => setTrim(e.target.value)}/>
            <input type="text" placeholder="Mileage" className="w-full p-2 mb-2 bg-white dark:bg-gray-800 text-black dark:text-white border border-gray-300 dark:border-gray-600 rounded" value={mileage} onChange={(e) => setMileage(e.target.value)}/>
            <input type="text" placeholder="Transmission Type" className="w-full p-2 mb-2 bg-white dark:bg-gray-800 text-black dark:text-white border border-gray-300 dark:border-gray-600 rounded" value={transmission} onChange={(e) => setTransmission(e.target.value)}/>
            <input type="text" placeholder="Engine Type" className="w-full p-2 mb-2 bg-white dark:bg-gray-800 text-black dark:text-white border border-gray-300 dark:border-gray-600 rounded" value={engine} onChange={(e) => setEngine(e.target.value)}/>
            <button type="submit" className="mt-4 w-full bg-gray-800 dark:bg-gray-700 text-white dark:text-white hover:bg-gray-700 dark:hover:bg-gray-600 rounded">Add Vehicle</button>
          </form>
        )}
    </div>
  )
}

export default AddVehicle
import React, { useEffect, useState } from 'react';
import supabase from '../supabaseClient';
import Navbar from './Navbar';
import { useParams } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { UserAuth } from '../context/AuthContext';
import {PencilSquareIcon, TrashIcon, CheckIcon, XCircleIcon} from '@heroicons/react/24/outline';



const VehicleDetails = () => {

  const handleEdit = (log_id, title, description, cost, date, mileage, toolsUsed) => {
    setEditingLogId(log_id);
    setEditedLogTitle(title);
    setEditedLogDescription(description);
    setEditedLogCost(cost);
    setEditedLogDate(date);
    setEditedLogMileage(mileage);
    setEditedLogToolsUsed(toolsUsed);
  }

  const { id } = useParams();

  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);

  const [uploading, setUploading] = useState(false);
  const [logUploading, setLogUploading] = useState(false);
  const [imageUrls, setImageUrls] = useState([]);

  const [activeIndex, setActiveIndex] = useState(0);

  const [maintenanceLogs, setMaintenanceLogs] = useState([]);

  //Totals
  const [totalPrice, setTotalPrice] = useState(0);
  const [totalLogs, setTotalLogs] = useState(0);
  const [totalHours, setTotalHours] = useState(0);

  //Log form
  const [addLogVisible, setAddLogVisible] = useState(false);

  const [logTitle, setLogTitle] = useState("");
  const [logDescription, setLogDescription] = useState("");
  const [logCost, setLogCost] = useState("");
  const [logDate, setLogDate] = useState("");
  const [logMileage, setLogMileage] = useState("");
  const [logToolsUsed, setLogToolsUsed] = useState("");
  const [logLaborHours, setLogLaborHours] = useState(0);
  const [logPerformer, setLogPerformer] = useState("");
  const [logNotes, setLogNotes] = useState("");

  //edit logs

  const [editingLogId, setEditingLogId] = useState(null);
  const [editedLogTitle, setEditedLogTitle] = useState("");
  const [editedLogDescription, setEditedLogDescription] = useState("");
  const [editedLogCost, setEditedLogCost] = useState("");
  const [editedLogDate, setEditedLogDate] = useState("");
  const [editedLogMileage, setEditedLogMileage] = useState("");
  const [editedLogToolsUsed, setEditedLogToolsUsed] = useState("");

  const [editUploading, setEditUploading] = useState(false)

  const submitLogEdit = async () => {
    setEditUploading(true);


    const { data, error } = await supabase
      .from('vehicle_logs')
      .update({
        title: editedLogTitle,
        description: editedLogDescription,
        cost: editedLogCost,
        date: editedLogDate,
        mileage: editedLogMileage,
        tools_used: editedLogToolsUsed
      })
      .eq('id', editingLogId)
      .single();

      if (error) {
        console.error("Error updating maintenance log:", error);
      } else {
        console.log("Maintenance log updated successfully:", data);
        getLogs();
        setEditingLogId(null);
      }

      setEditUploading(false);
  };

  const handleRemoveLog = async (log_id) => {
    //Ask if they are sure first
    const confirmed = window.confirm(
      "Are you sure you want to delete this maintenance log? This cannot be undone."
    );

    if (!confirmed) return;

    const {data, error} = await supabase
      .from('vehicle_logs')
      .delete()
      .eq('id', log_id);
    
      if (error) {
        console.error("Error deleting vehicle log: ", error);
      } else {
        console.log("Maintenance log deleted successfully: ", data)
        getLogs();
      }
  }

  const { session } = UserAuth();
  const canEdit = session && vehicle?.user_id === session.user.id;


  /* ------------------ FETCH DATA ------------------ */

  const getImages = async () => {
    const { data, error } = await supabase
      .from('car_images')
      .select('id, image_url, is_cover')
      .eq('car_id', id)
      .order('created_at', { ascending: true });

    if (!error) setImageUrls(data || []);
  };

  const getLogs = async () => {
    const { data, error } = await supabase
      .from('vehicle_logs')
      .select('*')
      .eq('vehicle_id', id)
      .order('date', {ascending: false});
    
      if(!error) setMaintenanceLogs(data || [])

    const totalPrice = (data || []).reduce(
      (sum, log) => sum + (Number(log.cost) || 0), 0
    );

    setTotalPrice(totalPrice);
    setTotalLogs(data.length);

      
  };

  useEffect(() => {
    const fetchVehicle = async () => {
      const { data } = await supabase
        .from('cars')
        .select('*')
        .eq('id', id)
        .single();

      setVehicle(data);
      setLoading(false);
    };

    fetchVehicle();
    getImages();
    getLogs();
  }, [id]);

  useEffect(() => {
    if (imageUrls.length && activeIndex >= imageUrls.length) {
      setActiveIndex(0);
    }
  }, [imageUrls, activeIndex]);

  /* ------------------ IMAGE UPLOAD ------------------ */

  const uploadImages = async (e) => {
    const selectedFiles = Array.from(e.target.files);
    setUploading(true);

    for (const file of selectedFiles) {
      const resizedFile = await resizeFile(file);
      const path = `${id}/${uuidv4()}`;

      const { data } = await supabase.storage
        .from('vehicle-photos')
        .upload(path, resizedFile);

      if (data) {
        const publicUrl = supabase.storage
          .from('vehicle-photos')
          .getPublicUrl(data.path).data.publicUrl;

        await supabase
          .from('car_images')
          .insert({ car_id: id, image_url: publicUrl });
      }
    }

    setUploading(false);
    getImages();
  };

  /* ------------------ MAKE COVER ------------------ */

  const makeCoverImage = async (imageId) => {
    await supabase
      .from('car_images')
      .update({ is_cover: false })
      .eq('car_id', id);

    await supabase
      .from('car_images')
      .update({ is_cover: true })
      .eq('id', imageId);

    getImages();
  };

  /* ------------------ IMAGE RESIZE ------------------ */

  const resizeFile = (file, maxWidth = 1024, maxHeight = 1024, quality = 0.7) =>
    new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (e) => {
        const img = new Image();
        img.src = e.target.result;
        img.onload = () => {
          let { width, height } = img;
          const canvas = document.createElement('canvas');

          if (width > height && width > maxWidth) {
            height *= maxWidth / width;
            width = maxWidth;
          } else if (height > maxHeight) {
            width *= maxHeight / height;
            height = maxHeight;
          }

          canvas.width = width;
          canvas.height = height;

          canvas.getContext('2d').drawImage(img, 0, 0, width, height);
          canvas.toBlob(
            (blob) => resolve(new File([blob], file.name, { type: 'image/jpeg' })),
            'image/jpeg',
            quality
          );
        };
      };
    });

    const addMaintenanceLog = async (e) => {
      setLogUploading(true);
      e.preventDefault();
      const newLogData = {
        vehicle_id: id,
        user_id: session.user.id,
        title: logTitle,
        description: logDescription,
        cost: logCost,
        date: logDate,
        mileage: logMileage,
        tools_used: logToolsUsed,
        labor_hours: logLaborHours,
        performed_by: logPerformer,
        notes: logNotes
      };
      const { data, error } = await supabase.from("vehicle_logs").insert([newLogData]).single();

      if (error) {
        console.error("Error adding maintenance log:", error);
      } else {
        console.log("Maintenance log added successfully:", data);
      }
      setLogUploading(false);
      setLogTitle("");
      setLogDescription("");
      setLogCost("");
      setLogDate("");
      setLogMileage("");
      setLogToolsUsed("");
      setLogLaborHours(0);
      setLogPerformer("");
      setLogNotes("");
    }

    /* ------------------ DELETE VEHICLE ------------------ */
    const deleteVehicle = async () => {
      const confirmed = window.confirm(
        "Are you sure you want to delete this vehicle? This cannot be undone."
      );

      if (!confirmed) return;

      try {
        // 1️⃣ Get image URLs from DB
        const { data: images, error: imageError } = await supabase
          .from('car_images')
          .select('image_url')
          .eq('car_id', id);

        if (imageError) {
          console.error("Error fetching image URLs:", imageError);
          return;
        }

        // 2️⃣ Convert public URLs → storage paths
        const pathsToDelete = images
          .map(img => {
            if (!img.image_url) return null;

            // Example URL:
            // https://xxxx.supabase.co/storage/v1/object/public/vehicle-photos/123/1/file.jpg
            const marker = '/vehicle-photos/';
            const index = img.image_url.indexOf(marker);

            if (index === -1) return null;

            return img.image_url.slice(index + marker.length);
          })
          .filter(Boolean);

        // 3️⃣ Delete files from storage
        if (pathsToDelete.length > 0) {
          const { error: removeError } = await supabase
            .storage
            .from('vehicle-photos')
            .remove(pathsToDelete);

          if (removeError) {
            console.error("Error deleting storage files:", removeError);
            return;
          }
        }

    // 4️⃣ Delete image records
    const { error: dbImageError } = await supabase
      .from('car_images')
      .delete()
      .eq('car_id', id);

    if (dbImageError) {
      console.error("Error deleting image records:", dbImageError);
      return;
    }

    // 5️⃣ Delete vehicle logs
    const { error: logError } = await supabase
      .from('vehicle_logs')
      .delete()
      .eq('vehicle_id', id);

    if (logError) {
      console.error("Error deleting vehicle logs:", logError);
      return;
    }

    // 6️⃣ Delete vehicle
    const { error: vehicleError } = await supabase
      .from('cars')
      .delete()
      .eq('id', id);

    if (vehicleError) {
      console.error("Error deleting vehicle:", vehicleError);
      return;
    }

    // 7️⃣ Redirect
    window.location.href = "/garage";

  } catch (err) {
    console.error("Unexpected error deleting vehicle:", err);
  }
};




  if (loading) return <div className="min-h-screen bg-white dark:bg-gray-900"><Navbar /><p className="p-6 text-black dark:text-white">Loading...</p></div>;
  if (!vehicle) return <div className="min-h-screen bg-white dark:bg-gray-900"><Navbar /><p className="p-6 text-black dark:text-white">Vehicle not found</p></div>;

  /* ------------------ RENDER ------------------ */

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-black dark:text-white">
      <Navbar />

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Title */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold">
              {vehicle.year} {vehicle.make} {vehicle.model}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">{vehicle.trim}</p>
          </div>
          {canEdit && (
            <button className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition flex-shrink-0 mt-5" onClick={deleteVehicle}>
              Delete Vehicle
            </button>
          )}
          
        </div>

        

        {/* MAIN SECTION */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* CAROUSEL */}
          <div className="relative bg-gray-100 dark:bg-gray-800 rounded-xl overflow-hidden shadow-lg">
            {imageUrls.length > 0 ? (
              <>
                <img
                  src={imageUrls[activeIndex].image_url}
                  className="w-full h-[380px] object-cover"
                  alt="Vehicle"
                />

                {/* Arrows */}
                <button
                  onClick={() =>
                    setActiveIndex((i) =>
                      i === 0 ? imageUrls.length - 1 : i - 1
                    )
                  }
                  className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/60 px-3 py-2 rounded-full dark:bg-black/60"
                >
                  ‹
                </button>

                <button
                  onClick={() =>
                    setActiveIndex((i) =>
                      i === imageUrls.length - 1 ? 0 : i + 1
                    )
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/60 px-3 py-2 rounded-full dark:bg-black/60"
                >
                  ›
                </button>

                {/* Bottom overlay */}
                <div className="absolute bottom-0 w-full bg-black/60 px-4 py-3 flex justify-between items-center">
                  <span className="text-sm text-gray-300">
                    {activeIndex + 1} / {imageUrls.length}
                  </span>
                  {canEdit && (
                    <div>
                    {!imageUrls[activeIndex].is_cover ? (
                      <button
                        onClick={() =>
                          makeCoverImage(imageUrls[activeIndex].id)
                        }
                        className="bg-blue-600 text-sm px-4 py-1 rounded-md"
                      >
                        Make Cover
                      </button>
                    ) : (
                      <span className="text-blue-400 font-semibold text-sm">
                        Cover Image
                      </span>
                    )}
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="h-[380px] flex items-center justify-center text-gray-500 dark:text-gray-400">
                No images uploaded
              </div>
            )}
          </div>

          {/* VEHICLE INFO */}
          <div className="bg-gray-100 dark:bg-gray-800 rounded-xl p-6 shadow-lg space-y-3">
            <InfoRow label="Mileage" value={vehicle.current_mileage} />
            <InfoRow label="Engine" value={vehicle.engine} />
            <InfoRow label="Transmission" value={vehicle.transmission} />
            <InfoRow label="Color" value={vehicle.color} />
          </div>
        </div>

        {/* UPLOAD */}
        {canEdit && (
          <div className="mt-8">
            <label className="block mb-2 font-semibold">Upload Images</label>
            <input
              type="file"
              multiple
              onChange={uploadImages}
              className="block w-full text-sm text-gray-700 dark:text-gray-300
                file:mr-4 file:py-2 file:px-4
                file:rounded-md file:border-0
                file:bg-gray-700 dark:file:bg-gray-600 file:text-white
                hover:file:bg-gray-600 dark:hover:file:bg-gray-500"
            />
            {uploading && (
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Uploading…</p>
            )}
          </div>
        )}

        {/* THUMBNAILS */}
        {imageUrls.length > 0 && (
          <div className="flex gap-3 overflow-x-auto mt-6 pb-2">
            {imageUrls.map((img, index) => (
              <button
                key={img.id}
                onClick={() => setActiveIndex(index)}
                className={`border-2 rounded-lg ${
                  index === activeIndex
                    ? 'border-blue-500'
                    : 'border-transparent'
                }`}
              >
                <img
                  src={img.image_url}
                  className="h-24 w-32 object-cover rounded-md"
                  alt="Thumbnail"
                />
              </button>
            ))}
          </div>
        )}

        {/* Top of maintenance log section */}
        <div className="flex items-center justify-between mt-12 mb-4">
          <h2 className="text-2xl font-bold">Maintenance Logs</h2>
          {canEdit && (
            <button
              onClick={() => setAddLogVisible(!addLogVisible)}
              className="bg-gray-800 dark:bg-gray-700 text-white dark:text-white hover:bg-gray-700 dark:hover:bg-gray-600 rounded px-4 py-2"
            >
              {addLogVisible ? 'Cancel' : 'Add Log'}
            </button>
          )}
        </div>

        {/* Add Maintenance Logs */}
        {canEdit && addLogVisible && (
          <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl p-6 shadow-xl mt-6 border border-gray-200 dark:border-gray-700">
            
            {/* Header */}
            <div className="mb-5">
              <h3 className="text-xl font-bold text-black dark:text-white">
                Add Maintenance Log
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Keep track of work, parts, and costs
              </p>
            </div>

            <div className="space-y-4">
              
              {/* Title */}
              <input
                type="text"
                placeholder="Log title (e.g. Oil Change)"
                className="w-full p-3 bg-white dark:bg-gray-700 text-black dark:text-white
                          border border-gray-300 dark:border-gray-600 rounded-lg
                          focus:outline-none focus:ring-2 focus:ring-orange-500"
                value={logTitle}
                onChange={(e) => setLogTitle(e.target.value)}
              />

              {/* Description */}
              <textarea
                placeholder="What was done?"
                rows={3}
                className="w-full p-3 bg-white dark:bg-gray-700 text-black dark:text-white
                          border border-gray-300 dark:border-gray-600 rounded-lg
                          focus:outline-none focus:ring-2 focus:ring-orange-500"
                value={logDescription}
                onChange={(e) => setLogDescription(e.target.value)}
              />

              {/* Cost + Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input
                  type="number"
                  placeholder="Cost ($)"
                  className="w-full p-3 bg-white dark:bg-gray-700 text-black dark:text-white
                            border border-gray-300 dark:border-gray-600 rounded-lg
                            focus:outline-none focus:ring-2 focus:ring-orange-500"
                  value={logCost}
                  onChange={(e) => setLogCost(e.target.value)}
                />

                <input
                  type="date"
                  className="w-full p-3 bg-white dark:bg-gray-700 text-black dark:text-white
                            border border-gray-300 dark:border-gray-600 rounded-lg
                            focus:outline-none focus:ring-2 focus:ring-orange-500"
                  value={logDate}
                  onChange={(e) => setLogDate(e.target.value)}
                />
              </div>

              {/* Mileage + Tools */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input
                  type="number"
                  placeholder="Mileage"
                  className="w-full p-3 bg-white dark:bg-gray-700 text-black dark:text-white
                            border border-gray-300 dark:border-gray-600 rounded-lg
                            focus:outline-none focus:ring-2 focus:ring-orange-500"
                  value={logMileage}
                  onChange={(e) => setLogMileage(e.target.value)}
                />

                <input
                  type="text"
                  placeholder="Tools used (optional)"
                  className="w-full p-3 bg-white dark:bg-gray-700 text-black dark:text-white
                            border border-gray-300 dark:border-gray-600 rounded-lg
                            focus:outline-none focus:ring-2 focus:ring-orange-500"
                  value={logToolsUsed}
                  onChange={(e) => setLogToolsUsed(e.target.value)}
                />
              </div>

              {/* labor hours + Performed by */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input
                  type="number"
                  placeholder="Labor Hours"
                  className="w-full p-3 bg-white dark:bg-gray-700 text-black dark:text-white
                            border border-gray-300 dark:border-gray-600 rounded-lg
                            focus:outline-none focus:ring-2 focus:ring-orange-500"
                  value={logLaborHours}
                  onChange={(e) => setLogLaborHours(e.target.value)}
                />

                <input
                  type="text"
                  placeholder="Who did the work? (yourself, friend, shop...)"
                  className="w-full p-3 bg-white dark:bg-gray-700 text-black dark:text-white
                            border border-gray-300 dark:border-gray-600 rounded-lg
                            focus:outline-none focus:ring-2 focus:ring-orange-500"
                  value={logPerformer}
                  onChange={(e) => setLogPerformer(e.target.value)}
                />
              </div>

              {/* Description */}
              <textarea
                placeholder="Any other notes you want to add"
                rows={3}
                className="w-full p-3 bg-white dark:bg-gray-700 text-black dark:text-white
                          border border-gray-300 dark:border-gray-600 rounded-lg
                          focus:outline-none focus:ring-2 focus:ring-orange-500"
                value={logNotes}
                onChange={(e) => setLogNotes(e.target.value)}
              />

              {/* Submit */}
              <button
                onClick={addMaintenanceLog}
                disabled={logUploading}
                className="w-full mt-2 bg-gradient-to-r from-orange-500 to-red-500
                          text-white font-semibold py-3 rounded-lg
                          hover:opacity-90 transition disabled:opacity-50"
              >
                {logUploading ? 'Adding Log…' : 'Add Maintenance Log'}
              </button>

            </div>
          </div>
        )}

        {/* Maintenance Logs */}
        <div className="mt-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-7">
            
            {/* Total Logs */}
            <div className="flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-xl p-5 shadow">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                # of Logs
              </p>
              <h1 className="text-3xl font-bold text-black dark:text-white">
                {totalLogs}
              </h1>
            </div>

            {/* Total Spent */}
            <div className="flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-xl p-5 shadow">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                Total Spent
              </p>
              <h1 className="text-3xl font-bold text-green-500">
                ${totalPrice.toFixed(2)}
              </h1>
            </div>

            {/* Hours Spent */}
            <div className="flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-xl p-5 shadow">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                Hours Spent
              </p>
              <h1 className="text-3xl font-bold text-blue-500">
                {totalHours}
              </h1>
            </div>

          </div>
        

          {maintenanceLogs.length === 0 ? (
            <p className="text-gray-600 dark:text-gray-400">
              {canEdit ? 'No maintenance logs yet. Start by adding one above 👨‍🔧' 
              : 'No maintenance logs yet🔧'}
            </p>
          ) : (
            <div className="relative border-l-2 border-gray-300 dark:border-gray-700 ml-3 space-y-6">
              {maintenanceLogs.map((log) => (
                <div key={log.id} className="relative pl-8">
                  {/* Timeline dot */}
                  <span className="absolute -left-[9px] top-2 h-4 w-4 rounded-full bg-blue-600" />

                  {editingLogId === log.id ? (
                    <div className="bg-gray-100 dark:bg-gray-800 rounded-xl p-5 shadow-lg">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                      {/*Edit Title*/}
                      <input className="text-lg font-semibold" 
                      value={editedLogTitle} 
                      type="Text"
                      onChange={(e) => setEditedLogTitle(e.target.value)}
                      />
                      <div>
                        {editingLogId === log.id && canEdit &&  (
                          <div>
                            <CheckIcon className="h-5 w-5 text-gray-500 dark:text-gray-400 inline-block mr-2 cursor-pointer hover:text-green-500" onClick={(e) => submitLogEdit()}/>
                            <XCircleIcon className="h-5 w-5 text-gray-500 dark:text-gray-400 inline-block cursor-pointer hover:text-red-500" onClick={(e) => setEditingLogId(null)}/>
                          </div>
                        )}
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {log.date}
                        </span>
                      </div>
                      
                    </div>

                    {/* Edit Description */}
                      {log.description && (
                        <textarea
                          value={editedLogDescription}
                          onChange={(e) => setEditedLogDescription(e.target.value)}
                          className="w-full mt-2 p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white resize-none focus:outline-none focus:ring-2 focus:ring-blue-400"
                          rows={3}
                        />
                      )}


                    {/* Edit Metadata */}
                    <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                      {log.mileage && (
                        <div className="bg-white dark:bg-gray-700 rounded-lg px-3 py-2">
                          <span className="block text-gray-500 dark:text-gray-400">
                            Mileage
                          </span>
                          <input 
                            className="font-semibold"
                            type="text"
                            value={editedLogMileage}
                            onChange={(e) => setEditedLogMileage(e.target.value)}
                          />
                          <span className="font-semibold">
                             mi
                          </span>
                        </div>
                      )}

                      {log.cost && (
                        <div className="bg-white dark:bg-gray-700 rounded-lg px-3 py-2">
                          <span className="block text-gray-500 dark:text-gray-400">
                            Cost
                          </span>
                          <span className="font-semibold">
                            $
                          </span>
                          <input 
                            className="font-semibold"
                            type="text"
                            value={editedLogCost}
                            onChange={(e) => setEditedLogCost(e.target.value)}
                          />
                        </div>
                      )}

                      {log.tools_used && (
                        <div className="bg-white dark:bg-gray-700 rounded-lg px-3 py-2 col-span-2">
                          <span className="block text-gray-500 dark:text-gray-400">
                            Tools Used
                          </span>
                          <input 
                            className="font-semibold"
                            type="text"
                            value={editedLogToolsUsed}
                            onChange={(e) => setEditedLogToolsUsed(e.target.value)}
                          />
                          
                        </div>
                      )}
                    </div>
                  </div>
                  ) : (
                    <div className="bg-gray-100 dark:bg-gray-800 rounded-xl p-5 shadow-lg">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold">{log.title}</h3>
                      <div>
                        {canEdit && (
                          <div>
                            <PencilSquareIcon className="h-5 w-5 text-gray-500 dark:text-gray-400 inline-block mr-2 cursor-pointer hover:text-blue-500" onClick={(e) => handleEdit(log.id, log.title, log.description, log.cost, log.date, log.mileage, log.tools_used)}/>
                            <TrashIcon className="h-5 w-5 text-gray-500 dark:text-gray-400 inline-block cursor-pointer hover:text-red-500" onClick={(e) => handleRemoveLog(log.id)}/>
                          </div>
                        )}
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {log.date}
                        </span>
                      </div>
                      
                    </div>

                    {/* Description */}
                    {log.description && (
                      <p className="mt-2 text-gray-700 dark:text-gray-300">
                        {log.description}
                      </p>
                    )}

                    {/* Metadata */}
                    <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                      {log.mileage && (
                        <div className="bg-white dark:bg-gray-700 rounded-lg px-3 py-2">
                          <span className="block text-gray-500 dark:text-gray-400">
                            Mileage
                          </span>
                          <span className="font-semibold">
                            {log.mileage.toLocaleString()} mi
                          </span>
                        </div>
                      )}

                      {log.cost && (
                        <div className="bg-white dark:bg-gray-700 rounded-lg px-3 py-2">
                          <span className="block text-gray-500 dark:text-gray-400">
                            Cost
                          </span>
                          <span className="font-semibold">
                            ${Number(log.cost).toFixed(2)}
                          </span>
                        </div>
                      )}

                      {log.tools_used && (
                        <div className="bg-white dark:bg-gray-700 rounded-lg px-3 py-2 col-span-2">
                          <span className="block text-gray-500 dark:text-gray-400">
                            Tools Used
                          </span>
                          <span className="font-semibold">{log.tools_used}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  )}
                  
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default VehicleDetails;

/* ------------------ INFO ROW ------------------ */

const InfoRow = ({ label, value }) => (
  <div className="flex justify-between border-b border-gray-300 dark:border-gray-700 pb-2">
    <span className="text-gray-600 dark:text-gray-400">{label}</span>
    <span className="font-medium">{value || '—'}</span>
  </div>
);

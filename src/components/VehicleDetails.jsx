import React, { useEffect, useState } from 'react';
import supabase from '../supabaseClient';
import Navbar from './Navbar';
import { useParams, useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { UserAuth } from '../context/AuthContext';
import {PencilSquareIcon, TrashIcon, CheckIcon, XCircleIcon, ChatBubbleLeftIcon, ArrowUpIcon, ArrowDownIcon, QuestionMarkCircleIcon, ArrowRightIcon, PlusIcon, ChevronDownIcon, ChevronUpIcon, HandThumbDownIcon, HandThumbUpIcon, BookmarkIcon} from '@heroicons/react/24/outline';
import {ArrowUpIcon as ArrowUpSolid, ArrowDownIcon as ArrowDownSolid, BookmarkIcon as BookmarkSolid} from '@heroicons/react/24/solid';



const VehicleDetails = () => {

  const handleEdit = (log) => {
    setEditingLogId(log.id);
    setEditedLogTitle(log.title || '');
    setEditedLogDescription(log.description || '');
    setEditedLogCost(log.cost || '');
    setEditedLogDate(log.date || '');
    setEditedLogMileage(log.mileage || '');
    setEditedLogToolsUsed(log.tools_used || '');
    setEditedLogLaborHours(log.labor_hours || '');
    setEditedLogPerformer(log.performed_by || '');
    setEditedLogNotes(log.notes || '');
    setEditedLogCategory(log.category || '');
    setEditedLogGallons(log.gas_gallons || '');
  }

  const { id } = useParams();
  const navigate = useNavigate();

  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [ownerProfile, setOwnerProfile] = useState(null);

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
  const [addGasVisible, setAddGasVisible] = useState(false);
  const [hideGasLogs, setHideGasLogs] = useState(false);
  const [logsToShow, setLogsToShow] = useState(10);

  const [logTitle, setLogTitle] = useState(null);
  const [logDescription, setLogDescription] = useState("");
  const [logCategory, setLogCategory] = useState("");
  const [logCost, setLogCost] = useState(null);
  const [logDate, setLogDate] = useState(null);
  const [logMileage, setLogMileage] = useState(null);
  const [logToolsUsed, setLogToolsUsed] = useState("");
  const [logLaborHours, setLogLaborHours] = useState(0);
  const [logPerformer, setLogPerformer] = useState("");
  const [logNotes, setLogNotes] = useState("");
  const [logGallons, setLogGallons] = useState(null);

  //edit logs

  const [editingLogId, setEditingLogId] = useState(null);
  const [editedLogTitle, setEditedLogTitle] = useState("");
  const [editedLogDescription, setEditedLogDescription] = useState("");
  const [editedLogCategory, setEditedLogCategory] = useState("");
  const [editedLogCost, setEditedLogCost] = useState("");
  const [editedLogDate, setEditedLogDate] = useState("");
  const [editedLogMileage, setEditedLogMileage] = useState("");
  const [editedLogToolsUsed, setEditedLogToolsUsed] = useState("");
  const [editedLogLaborHours, setEditedLogLaborHours] = useState(null)
  const [editedLogPerformer, setEditedLogPerformer] = useState("");
  const [editedLogNotes, setEditedLogNotes] = useState("");
  const [editedLogGallons, setEditedLogGallons] = useState(null);

  const [editUploading, setEditUploading] = useState(false)

  // Sell vehicle
  const [showSellForm, setShowSellForm] = useState(false);
  const [askingPrice, setAskingPrice] = useState("");
  const [sellingVehicle, setSellingVehicle] = useState(false);

  // Edit vehicle info
  const [editingVehicle, setEditingVehicle] = useState(false);
  const [editingVehicleInfo, setEditingVehicleInfo] = useState(false);
  const [editedMake, setEditedMake] = useState("");
  const [editedModel, setEditedModel] = useState("");
  const [editedYear, setEditedYear] = useState("");
  const [editedTrim, setEditedTrim] = useState("");
  const [editedEngine, setEditedEngine] = useState("");
  const [editedTransmission, setEditedTransmission] = useState("");
  const [editedMileage, setEditedMileage] = useState("");
  const [editedColor, setEditedColor] = useState("");
  const [editedLicensePlate, setEditedLicensePlate] = useState("");
  const [editedVin, setEditedVin] = useState("");
  const [editedOilChangeInterval, setEditedOilChangeInterval] = useState("");
  
  // Toggle between Vehicle Info and Wheels Info
  const [showWheelsInfo, setShowWheelsInfo] = useState(false);
  
  // Wheels and Tires Management
  const [wheelSetups, setWheelSetups] = useState([]);
  const [tireSetups, setTireSetups] = useState({}); // { wheelSetupId: [tireSetups] }
  const [showAddWheelForm, setShowAddWheelForm] = useState(false);
  const [showAddTireForm, setShowAddTireForm] = useState(null); // wheelSetupId when showing form
  const [expandedWheelSetup, setExpandedWheelSetup] = useState(null); // wheelSetupId that's expanded
  const [editingWheelSetup, setEditingWheelSetup] = useState(null);
  const [editingTireSetup, setEditingTireSetup] = useState(null);
  
  // Wheel form state
  const [wheelName, setWheelName] = useState('');
  const [wheelIsActive, setWheelIsActive] = useState(false);
  const [isWheelStaggered, setIsWheelStaggered] = useState(false);
  const [frontDiameter, setFrontDiameter] = useState('');
  const [frontWidth, setFrontWidth] = useState('');
  const [frontOffset, setFrontOffset] = useState('');
  const [frontBore, setFrontBore] = useState('');
  const [rearDiameter, setRearDiameter] = useState('');
  const [rearWidth, setRearWidth] = useState('');
  const [rearOffset, setRearOffset] = useState('');
  const [rearBore, setRearBore] = useState('');
  const [boltPattern, setBoltPattern] = useState('');
  const [wheelBrand, setWheelBrand] = useState('');
  const [wheelModel, setWheelModel] = useState('');
  const [wheelColor, setWheelColor] = useState('');
  const [wheelMaterial, setWheelMaterial] = useState('');
  const [wheelNotes, setWheelNotes] = useState('');
  
  // Tire form state
  const [tireName, setTireName] = useState('');
  const [tireIsActive, setTireIsActive] = useState(false);
  const [isTireStaggered, setIsTireStaggered] = useState(false);
  const [tireBrand, setTireBrand] = useState('');
  const [tireModel, setTireModel] = useState('');
  const [tireType, setTireType] = useState('');
  const [tireFrontWidth, setTireFrontWidth] = useState('');
  const [tireFrontAspectRatio, setTireFrontAspectRatio] = useState('');
  const [tireFrontDiameter, setTireFrontDiameter] = useState('');
  const [tireRearWidth, setTireRearWidth] = useState('');
  const [tireRearAspectRatio, setTireRearAspectRatio] = useState('');
  const [tireRearDiameter, setTireRearDiameter] = useState('');
  const [tireNotes, setTireNotes] = useState('');
  
  // Visibility toggles for info fields
  const [showMileage, setShowMileage] = useState(true);
  const [showEngine, setShowEngine] = useState(true);
  const [showTransmission, setShowTransmission] = useState(true);
  const [showColor, setShowColor] = useState(true);
  const [showTrim, setShowTrim] = useState(true);
  const [showLicensePlate, setShowLicensePlate] = useState(true);
  const [showVin, setShowVin] = useState(true);
  
  // User's current vote (null, -1 for pass, 1 for approve)
  const [userVote, setUserVote] = useState(null);

  // Does the user have the vehicle saved?
  const [vehicleSaved, setVehicleSaved] = useState(null)


  




  const submitLogEdit = async () => {
    setEditUploading(true);

    // Helper function to convert empty strings to null for numeric fields
    const toNumberOrNull = (value) => {
      if (value === '' || value === null || value === undefined) return null;
      const num = parseFloat(value);
      return isNaN(num) ? null : num;
    };

    const { data, error } = await supabase
      .from('vehicle_logs')
      .update({
        title: editedLogTitle || null,
        description: editedLogDescription || null,
        category: editedLogCategory || null,
        cost: toNumberOrNull(editedLogCost),
        date: editedLogDate || null,
        mileage: toNumberOrNull(editedLogMileage),
        tools_used: editedLogToolsUsed || null,
        labor_hours: toNumberOrNull(editedLogLaborHours),
        performed_by: editedLogPerformer || null,
        notes: editedLogNotes || null,
        gas_gallons: toNumberOrNull(editedLogGallons)
      })
      .eq('id', editingLogId)
      .single();

      if (error) {
        console.error("Error updating maintenance log:", error);
        alert('Failed to update log. Please check your input and try again.');
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

    const totalHours = (data || []).reduce(
      (sum, log) => sum + (Number(log.labor_hours) || 0), 0
    );

    setTotalPrice(totalPrice);
    setTotalHours(totalHours);
    setTotalLogs(data.length);

      
  };

  /* ------------------ FETCH WHEELS & TIRES ------------------ */
  const getWheelSetups = async () => {
    if (!id) return;
    
    const { data, error } = await supabase
      .from('wheel_setups')
      .select('*')
      .eq('car_id', id)
      .order('created_at', { ascending: false });
    
    if (!error && data) {
      // Sort so active setups come first, then by created_at descending
      const sorted = [...(data || [])].sort((a, b) => {
        if (a.is_active && !b.is_active) return -1;
        if (!a.is_active && b.is_active) return 1;
        return new Date(b.created_at) - new Date(a.created_at);
      });
      setWheelSetups(sorted);
      
      // Fetch tire setups for each wheel setup
      const tireMap = {};
      for (const wheelSetup of data) {
        const { data: tireData } = await supabase
          .from('tire_setups')
          .select('*')
          .eq('wheel_setup_id', wheelSetup.id)
          .order('created_at', { ascending: false });
        
        tireMap[wheelSetup.id] = tireData || [];
      }
      setTireSetups(tireMap);
    }
  };

  /* ------------------ WHEEL SETUP FUNCTIONS ------------------ */
  const handleEditWheelSetup = (wheelSetup) => {
    setEditingWheelSetup(wheelSetup.id);
    setWheelName(wheelSetup.name || '');
    setWheelIsActive(wheelSetup.is_active || false);
    setFrontDiameter(wheelSetup.front_diameter || '');
    setFrontWidth(wheelSetup.front_width || '');
    setFrontOffset(wheelSetup.front_offset || '');
    setFrontBore(wheelSetup.front_bore || '');
    setRearDiameter(wheelSetup.rear_diameter || '');
    setRearWidth(wheelSetup.rear_width || '');
    setRearOffset(wheelSetup.rear_offset || '');
    setRearBore(wheelSetup.rear_bore || '');
    setBoltPattern(wheelSetup.bolt_pattern || '');
    setWheelBrand(wheelSetup.wheel_brand || '');
    setWheelModel(wheelSetup.wheel_model || '');
    setWheelColor(wheelSetup.wheel_color || '');
    setWheelMaterial(wheelSetup.wheel_material || '');
    setWheelNotes(wheelSetup.notes || '');
    
    // Check if staggered (front and rear are different)
    const isStaggered = (
      wheelSetup.front_diameter !== wheelSetup.rear_diameter ||
      wheelSetup.front_width !== wheelSetup.rear_width ||
      wheelSetup.front_offset !== wheelSetup.rear_offset ||
      wheelSetup.front_bore !== wheelSetup.rear_bore
    );
    setIsWheelStaggered(isStaggered);
  };

  const saveWheelSetup = async (e) => {
    e.preventDefault();
    if (!session?.user?.id) return;

    const toNumberOrNull = (value) => {
      if (value === '' || value === null || value === undefined) return null;
      const num = parseFloat(value);
      return isNaN(num) ? null : num;
    };

    const toIntOrNull = (value) => {
      if (value === '' || value === null || value === undefined) return null;
      const num = parseInt(value);
      return isNaN(num) ? null : num;
    };

    // If not staggered, copy front values to rear
    const finalRearDiameter = isWheelStaggered ? toIntOrNull(rearDiameter) : toIntOrNull(frontDiameter);
    const finalRearWidth = isWheelStaggered ? toNumberOrNull(rearWidth) : toNumberOrNull(frontWidth);
    const finalRearOffset = isWheelStaggered ? toNumberOrNull(rearOffset) : toNumberOrNull(frontOffset);
    const finalRearBore = isWheelStaggered ? toNumberOrNull(rearBore) : toNumberOrNull(frontBore);

    const wheelData = {
      car_id: id,
      user_id: session.user.id,
      name: wheelName || null,
      is_active: wheelIsActive,
      front_diameter: toIntOrNull(frontDiameter),
      front_width: toNumberOrNull(frontWidth),
      front_offset: toNumberOrNull(frontOffset),
      front_bore: toNumberOrNull(frontBore),
      rear_diameter: finalRearDiameter,
      rear_width: finalRearWidth,
      rear_offset: finalRearOffset,
      rear_bore: finalRearBore,
      bolt_pattern: boltPattern || null,
      wheel_brand: wheelBrand || null,
      wheel_model: wheelModel || null,
      wheel_color: wheelColor || null,
      wheel_material: wheelMaterial || null,
      notes: wheelNotes || null
    };

    if (editingWheelSetup) {
      // Update existing
      const { error } = await supabase
        .from('wheel_setups')
        .update(wheelData)
        .eq('id', editingWheelSetup);
      
      if (error) {
        console.error('Error updating wheel setup:', error);
        alert('Failed to update wheel setup');
      } else {
        setEditingWheelSetup(null);
        getWheelSetups();
      }
    } else {
      // Create new
      const { error } = await supabase
        .from('wheel_setups')
        .insert([{ ...wheelData, id: uuidv4() }]);
      
      if (error) {
        console.error('Error creating wheel setup:', error);
        alert('Failed to create wheel setup');
      } else {
        setShowAddWheelForm(false);
        getWheelSetups();
        // Reset form
        setWheelName(''); setWheelIsActive(false); setIsWheelStaggered(false);
        setFrontDiameter(''); setFrontWidth(''); setFrontOffset(''); setFrontBore('');
        setRearDiameter(''); setRearWidth(''); setRearOffset(''); setRearBore('');
        setBoltPattern(''); setWheelBrand(''); setWheelModel(''); setWheelColor(''); setWheelMaterial(''); setWheelNotes('');
      }
    }
  };

  const deleteWheelSetup = async (wheelSetupId) => {
    if (!window.confirm('Are you sure you want to delete this wheel setup? This will also delete all associated tire setups.')) return;

    // Delete tire setups first
    await supabase
      .from('tire_setups')
      .delete()
      .eq('wheel_setup_id', wheelSetupId);

    // Delete wheel setup
    const { error } = await supabase
      .from('wheel_setups')
      .delete()
      .eq('id', wheelSetupId);

    if (error) {
      console.error('Error deleting wheel setup:', error);
      alert('Failed to delete wheel setup');
    } else {
      getWheelSetups();
    }
  };

  const setActiveWheelSetup = async (wheelSetupId) => {
    // Set all to inactive first
    await supabase
      .from('wheel_setups')
      .update({ is_active: false })
      .eq('car_id', id);

    // Set selected to active
    const { error } = await supabase
      .from('wheel_setups')
      .update({ is_active: true })
      .eq('id', wheelSetupId);

    if (!error) {
      getWheelSetups();
    }
  };

  /* ------------------ TIRE SETUP FUNCTIONS ------------------ */
  const handleEditTireSetup = (tireSetup) => {
    setEditingTireSetup(tireSetup.id);
    setTireName(tireSetup.name || '');
    setTireIsActive(tireSetup.is_active || false);
    setTireBrand(tireSetup.tire_brand || '');
    setTireModel(tireSetup.tire_model || '');
    setTireType(tireSetup.tire_type || '');
    setTireFrontWidth(tireSetup.front_width || '');
    setTireFrontAspectRatio(tireSetup.front_aspect_ratio || '');
    setTireFrontDiameter(tireSetup.front_diameter || '');
    setTireRearWidth(tireSetup.rear_width || '');
    setTireRearAspectRatio(tireSetup.rear_aspect_ratio || '');
    setTireRearDiameter(tireSetup.rear_diameter || '');
    setTireNotes(tireSetup.notes || '');
    
    // Check if staggered (front and rear are different)
    const isStaggered = (
      tireSetup.front_width !== tireSetup.rear_width ||
      tireSetup.front_aspect_ratio !== tireSetup.rear_aspect_ratio ||
      tireSetup.front_diameter !== tireSetup.rear_diameter
    );
    setIsTireStaggered(isStaggered);
  };

  const saveTireSetup = async (e, wheelSetupId) => {
    e.preventDefault();
    if (!session?.user?.id) return;

    const toIntOrNull = (value) => {
      if (value === '' || value === null || value === undefined) return null;
      const num = parseInt(value);
      return isNaN(num) ? null : num;
    };

    // If not staggered, copy front values to rear
    const finalRearWidth = isTireStaggered ? toIntOrNull(tireRearWidth) : toIntOrNull(tireFrontWidth);
    const finalRearAspectRatio = isTireStaggered ? toIntOrNull(tireRearAspectRatio) : toIntOrNull(tireFrontAspectRatio);
    const finalRearDiameter = isTireStaggered ? toIntOrNull(tireRearDiameter) : toIntOrNull(tireFrontDiameter);

    const tireData = {
      wheel_setup_id: wheelSetupId,
      user_id: session.user.id,
      name: tireName || null,
      is_active: tireIsActive,
      tire_brand: tireBrand || null,
      tire_model: tireModel || null,
      tire_type: tireType || null,
      front_width: toIntOrNull(tireFrontWidth),
      front_aspect_ratio: toIntOrNull(tireFrontAspectRatio),
      front_diameter: toIntOrNull(tireFrontDiameter),
      rear_width: finalRearWidth,
      rear_aspect_ratio: finalRearAspectRatio,
      rear_diameter: finalRearDiameter,
      notes: tireNotes || null
    };

    if (editingTireSetup) {
      // Update existing
      const { error } = await supabase
        .from('tire_setups')
        .update(tireData)
        .eq('id', editingTireSetup);
      
      if (error) {
        console.error('Error updating tire setup:', error);
        alert('Failed to update tire setup');
      } else {
        setEditingTireSetup(null);
        getWheelSetups();
      }
    } else {
      // Create new
      const { error } = await supabase
        .from('tire_setups')
        .insert([{ ...tireData, id: uuidv4() }]);
      
      if (error) {
        console.error('Error creating tire setup:', error);
        alert('Failed to create tire setup');
      } else {
        setShowAddTireForm(null);
        getWheelSetups();
        // Reset form
        setTireName(''); setTireIsActive(false); setIsTireStaggered(false);
        setTireBrand(''); setTireModel(''); setTireType('');
        setTireFrontWidth(''); setTireFrontAspectRatio(''); setTireFrontDiameter('');
        setTireRearWidth(''); setTireRearAspectRatio(''); setTireRearDiameter('');
        setTireNotes('');
      }
    }
  };

  const deleteTireSetup = async (tireSetupId) => {
    if (!window.confirm('Are you sure you want to delete this tire setup?')) return;

    const { error } = await supabase
      .from('tire_setups')
      .delete()
      .eq('id', tireSetupId);

    if (error) {
      console.error('Error deleting tire setup:', error);
      alert('Failed to delete tire setup');
    } else {
      getWheelSetups();
    }
  };

  const setActiveTireSetup = async (tireSetupId, wheelSetupId) => {
    // Set all tire setups for this wheel setup to inactive
    await supabase
      .from('tire_setups')
      .update({ is_active: false })
      .eq('wheel_setup_id', wheelSetupId);

    // Set selected to active
    const { error } = await supabase
      .from('tire_setups')
      .update({ is_active: true })
      .eq('id', tireSetupId);

    if (!error) {
      getWheelSetups();
    }
  };

  useEffect(() => {
    const fetchVehicle = async () => {
      const { data } = await supabase
        .from('cars')
        .select('*')
        .eq('id', id)
        .single();

      setVehicle(data);
      
      // Initialize visibility state from vehicle data
      if (data) {
        setShowMileage(data.show_mileage !== false);
        setShowEngine(data.show_engine !== false);
        setShowTransmission(data.show_transmission !== false);
        setShowColor(data.show_color !== false);
        setShowTrim(data.show_trim !== false);
        setShowLicensePlate(data.show_license_plate !== false);
        setShowVin(data.show_vin !== false);
        
        // Recalculate vote score when vehicle is loaded to ensure accuracy
        const { data: votes, error } = await supabase
          .from('car_votes')
          .select('value')
          .eq('car_id', id);

        if (!error && votes) {
          const voteScore = votes.reduce((sum, vote) => sum + (vote.value || 0), 0);
          await supabase
            .from('cars')
            .update({ vote_score: voteScore })
            .eq('id', id);
          setVehicle(prev => ({ ...prev, vote_score: voteScore }));
        }
      }
      
      // Fetch owner profile
      if (data?.user_id) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('id, username, avatar_url, bio')
          .eq('id', data.user_id)
          .single();
        
        setOwnerProfile(profile);
      }
      
      setLoading(false);
    };

    fetchVehicle();
    getImages();
    getLogs();
    getWheelSetups();
  }, [id]);

  // Fetch saved vehicle status when session is available
  useEffect(() => {
    if (id && session?.user?.id) {
      getSaveVehicleInfo();
    }
  }, [id, session]);

  // Fetch user vote when component loads or id changes
  useEffect(() => {
    if (id && session) {
      fetchUserVote(session);
    } else {
      setUserVote(null);
    }
  }, [id, session]);

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
      category: logCategory,
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

      if (logMileage > vehicle.current_mileage) {
        const confirmed = window.confirm("This will update the current mileage of the vehicle. Are you sure you want to do this?");
        if (!confirmed) return;
          const { data: updatedData, error: updateError} = await supabase
            .from('cars')
            .update({
              current_mileage: logMileage
            })
            .eq('id', id);

          if (updateError) {
            console.error("Error updating current mileage:", updateError);
          } else {
            console.log("Current mileage updated successfully:", updatedData);
          }
         
      }
      
      setLogUploading(false);
      setLogTitle("");
      setLogDescription("");
    setLogCategory("");
      setLogCost("");
      setLogDate("");
      setLogMileage("");
      setLogToolsUsed("");
      setLogLaborHours(0);
      setLogPerformer("");
      setLogNotes("");

      getLogs();
      setAddLogVisible(false);
    }

    const addGasLog = async (e) => {
      setLogUploading(true);
      e.preventDefault();
      const newLogData = {
        vehicle_id: id,
        user_id: session.user.id,
        title: "Gas",
        cost: logCost,
        date: logDate,
        mileage: logMileage,
        gas: true,
        gas_gallons: logGallons
      };
      const { data, error } = await supabase.from("vehicle_logs").insert([newLogData]).single();

      if (error) {
        console.error("Error adding Gas log:", error);
      } else {
        console.log("Gas log added successfully:", data);
      }
      setLogUploading(false);
      setLogTitle("");
      setLogDescription("");
    setLogCategory("");
      setLogCost("");
      setLogDate("");
      setLogMileage("");
      setLogToolsUsed("");
      setLogLaborHours(0);
      setLogPerformer("");
      setLogNotes("");

      getLogs();
      setAddGasVisible(false);
    }

    /* ------------------ SELL VEHICLE ------------------ */
    const sellVehicle = async (e) => {
      e.preventDefault();
      if (!askingPrice || parseFloat(askingPrice) <= 0) {
        alert('Please enter a valid asking price');
        return;
      }

      setSellingVehicle(true);
      try {
        const { error } = await supabase
          .from('cars')
          .update({
            for_sale: true,
            asking_price: parseFloat(askingPrice)
          })
          .eq('id', id);

        if (error) {
          console.error('Error updating vehicle for sale:', error);
          alert('Failed to list vehicle for sale. Please try again.');
        } else {
          alert('Vehicle listed for sale successfully!');
          setShowSellForm(false);
          setAskingPrice("");
          // Refresh vehicle data
          const { data } = await supabase
            .from('cars')
            .select('*')
            .eq('id', id)
            .single();
          setVehicle(data);
        }
      } catch (err) {
        console.error('Error in sellVehicle:', err);
        alert('Failed to list vehicle for sale. Please try again.');
      } finally {
        setSellingVehicle(false);
      }
    };

    const removeCarFromMarket = async (e) => {

      const { data, error } = await supabase
        .from('cars')
        .update({
          'for_sale': false,
          'asking_price': null
        })
        .eq('id', id)

      if (error) {
        console.error("There was an error removing your car from the marketplace: ", error)
      } else {
        console.log("Car was removed from marketplace successfully!")
      }

      setShowSellForm(false);
    }

  /* ------------------ EDIT VEHICLE INFO ------------------ */
  const handleEditVehicleInfo = () => {
    if (!vehicle) return;
    setEditedMake(vehicle.make || '');
    setEditedModel(vehicle.model || '');
    setEditedYear(vehicle.year || '');
    setEditedTrim(vehicle.trim || '');
    setEditedEngine(vehicle.engine || '');
    setEditedTransmission(vehicle.transmission || '');
    setEditedMileage(vehicle.current_mileage || '');
    setEditedColor(vehicle.color || '');
    setEditedLicensePlate(vehicle.license_plate || '');
    setEditedVin(vehicle.vin || '');
    setEditedOilChangeInterval(vehicle.oil_change_interval || '');
    
    // Load visibility preferences from vehicle or default to true
    setShowMileage(vehicle.show_mileage !== false);
    setShowEngine(vehicle.show_engine !== false);
    setShowTransmission(vehicle.show_transmission !== false);
    setShowColor(vehicle.show_color !== false);
    setShowTrim(vehicle.show_trim !== false);
    setShowLicensePlate(vehicle.show_license_plate !== false);
    setShowVin(vehicle.show_vin !== false);
    
    setEditingVehicleInfo(true);
  };

  const saveVehicleInfo = async (e) => {
    e.preventDefault();
    setEditingVehicle(true);

    try {
      const { data, error } = await supabase
        .from('cars')
        .update({
          make: editedMake,
          model: editedModel,
          year: editedYear ? Number(editedYear) : null,
          trim: editedTrim || null,
          engine: editedEngine || null,
          transmission: editedTransmission || null,
          current_mileage: editedMileage ? Number(editedMileage) : null,
          color: editedColor || null,
          license_plate: editedLicensePlate || null,
          vin: editedVin || null,
          oil_change_interval: editedOilChangeInterval
            ? Number(editedOilChangeInterval)
            : null,
          show_mileage: showMileage,
          show_engine: showEngine,
          show_transmission: showTransmission,
          show_color: showColor,
          show_trim: showTrim,
          show_license_plate: showLicensePlate,
          show_vin: showVin
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating vehicle:', error);
        alert('Failed to update vehicle. Please try again.');
      } else {
        setVehicle(data);
        setEditingVehicleInfo(false);
      }
    } catch (err) {
      console.error('Error in saveVehicleInfo:', err);
      alert('Failed to update vehicle. Please try again.');
    } finally {
      setEditingVehicle(false);
    }
  };

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


  // Fetch user's current vote
  const fetchUserVote = async (session) => {
    if (!session?.user?.id) {
      setUserVote(null);
      return;
    }

    const { data, error } = await supabase
      .from('car_votes')
      .select('value')
      .eq('car_id', id)
      .eq('user_id', session.user.id)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 is "not found" error
      console.error("Failed to fetch user vote: ", error);
      return;
    }

    setUserVote(data?.value || null);
  };

  // Calculate and update vote score from car_votes table
  const updateVoteScore = async () => {
    const { data: votes, error } = await supabase
      .from('car_votes')
      .select('value')
      .eq('car_id', id);

    if (error) {
      console.error("Failed to fetch votes for score calculation: ", error);
      return;
    }

    // Sum all vote values (1 for approve, -1 for pass)
    const voteScore = (votes || []).reduce((sum, vote) => sum + (vote.value || 0), 0);

    // Update the cars table with the calculated score
    const { error: updateError } = await supabase
      .from('cars')
      .update({ vote_score: voteScore })
      .eq('id', id);

    if (updateError) {
      console.error("Failed to update vote score: ", updateError);
    } else {
      // Update local state
      setVehicle(prev => ({ ...prev, vote_score: voteScore }));
    }
  };

  const passVote = async (e) => {
    if (!session?.user?.id) return;
    
    // Prevent owner from voting on their own car
    if (vehicle?.user_id === session.user.id) {
      return;
    }

    const { data, error} = await supabase
      .from('car_votes')
      .upsert({
        car_id: id,
        user_id: session.user.id,
        value: userVote === -1 ? null : -1
      },
      {
        onConflict: 'car_id,user_id'
      }
      )

    if (error) {
      console.error("Failed to pass vote: ", error)
      return;
    }

    // If removing vote, delete the record
    if (userVote === -1) {
      await supabase
        .from('car_votes')
        .delete()
        .eq('car_id', id)
        .eq('user_id', session.user.id);
      setUserVote(null);
    } else {
      setUserVote(-1);
    }

    // Recalculate and update vote score from all votes
    await updateVoteScore();
  }

  const approveVote = async (e) => {
    if (!session?.user?.id) return;
    
    // Prevent owner from voting on their own car
    if (vehicle?.user_id === session.user.id) {
      return;
    }

    const { data, error} = await supabase
      .from('car_votes')
      .upsert({
        car_id: id,
        user_id: session.user.id,
        value: userVote === 1 ? null : 1
      },
      {
        onConflict: 'car_id,user_id'
      }
      )

    if (error) {
      console.error("Failed to approve vote: ", error)
      return;
    }

    // If removing vote, delete the record
    if (userVote === 1) {
      await supabase
        .from('car_votes')
        .delete()
        .eq('car_id', id)
        .eq('user_id', session.user.id);
      setUserVote(null);
    } else {
      setUserVote(1);
    }

    // Recalculate and update vote score from all votes
    await updateVoteScore();
  }

  const getSaveVehicleInfo = async (e) => {
    if (!session?.user?.id || !id) return;
    
    const {data, error} = await supabase
    .from("saved_vehicles")
    .select("*")
    .eq('car_id', id)
    .eq('user_id', session.user.id)

    if (data && data.length > 0) {
      setVehicleSaved(true)
    } 

    console.log(data?.length || 0)
  }
 
  const handleSaveVehicle = async (e) => {
    if (!session?.user?.id) return;

    if (!vehicleSaved) {
      const { data, error } = await supabase
        .from("saved_vehicles")
        .insert([{ car_id: id, user_id: session.user.id }]);

      if (error) {
        console.error("Failed to save vehicle:", error);
      } else {
        setVehicleSaved(true);
      }
    } else {
      const { data, error } = await supabase
        .from("saved_vehicles")
        .delete()
        .eq("car_id", id)
        .eq("user_id", session.user.id);

      if (error) {
        console.error("Failed to unsave vehicle:", error);
      } else {
        setVehicleSaved(false);
      }
    }
  };



  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const oilChangeInterval = Number(vehicle?.oil_change_interval || 0);
  const hasOilChangeInterval = Number.isFinite(oilChangeInterval) && oilChangeInterval > 0;
  const lastOilChangeLog = maintenanceLogs.find((log) => {
    if (log.gas) return false;
    return (log.category || '').toLowerCase() === 'oil change';
  });
  const lastOilChangeMileage = lastOilChangeLog?.mileage
    ? Number(lastOilChangeLog.mileage)
    : null;
  const currentMileage = Number(vehicle?.current_mileage ?? 0);
  const hasCurrentMileage = Number.isFinite(currentMileage) && currentMileage > 0;
  const nextOilChangeMileage =
    hasOilChangeInterval && lastOilChangeMileage !== null
      ? lastOilChangeMileage + oilChangeInterval
      : null;
  const milesUntilOilChange =
    nextOilChangeMileage !== null && hasCurrentMileage
      ? nextOilChangeMileage - currentMileage
      : null;

  if (loading) return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      <Navbar />
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-red-500 border-t-transparent mb-4"></div>
          <p className="text-gray-400">Loading vehicle...</p>
        </div>
      </div>
    </div>
  );
  
  if (!vehicle) return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      <Navbar />
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-white text-xl">Vehicle not found</p>
      </div>
    </div>
  );

  /* ------------------ RENDER ------------------ */

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-black text-white -mt-0">
      <Navbar />

      <div className="w-full px-4 md:px-8 lg:px-12 py-4 md:py-8">
        {/* Sell Vehicle Modal */}
        {showSellForm && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800/95 backdrop-blur-md rounded-2xl p-8 max-w-md w-full shadow-2xl border border-gray-700">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white">
                  List Vehicle for Sale
                </h2>
                <button
                  onClick={() => {
                    setShowSellForm(false);
                    setAskingPrice("");
                  }}
                  className="text-gray-400 hover:text-white transition"
                >
                  ✕
                </button>
              </div>

              <p className="text-sm text-gray-400 mb-6">
                Enter your asking price to list this vehicle for sale.
              </p>

              <form onSubmit={sellVehicle} className="space-y-4">
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-300">
                    Asking Price ($) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    required
                    placeholder="0.00"
                    value={askingPrice}
                    onChange={(e) => setAskingPrice(e.target.value)}
                    className="w-full p-3 bg-gray-700 text-white
                              border border-gray-600 rounded-lg
                              focus:outline-none focus:ring-2 focus:ring-green-500
                              invalid:border-red-500 invalid:ring-red-500"
                  />
                </div>

                {vehicle?.for_sale && vehicle?.asking_price && (
                  <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-3">
                    <p className="text-sm text-green-300">
                      Current asking price: <span className="font-semibold">${Number(vehicle.asking_price).toFixed(2)}</span>
                    </p>
                  </div>
                )}

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowSellForm(false);
                      setAskingPrice("");
                    }}
                    className="flex-1 px-4 py-2 bg-gray-700 text-gray-200 rounded-lg hover:bg-gray-600 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={sellingVehicle}
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
                  >
                    {sellingVehicle ? 'Listing...' : vehicle?.for_sale ? 'Update Price' : 'List for Sale'}
                  </button>
                </div>
              </form>
              
              {vehicle.for_sale && (
                <button 
                  className="w-full mt-4 px-4 py-2 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-lg hover:opacity-90 transition font-semibold" 
                  onClick={() => removeCarFromMarket()}
                >
                  Remove from Market
                </button>
              )}
              
            </div>
          </div>
        )}

        {/* Hero Header */}
        <div className={`relative mb-8 transform transition-all duration-1000 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}>
          <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 via-orange-500/10 to-yellow-500/10 rounded-2xl blur-xl"></div>
          <div className="relative bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700/50">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
              {/* Left: Vehicle + Owner */}
              <div className="flex flex-col">
                <div className="flex items-center gap-3 mb-2">
                  {vehicle.for_sale && (
                    <span className="bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-full animate-pulse">
                      FOR SALE
                    </span>
                  )}
                  <span className="text-gray-400 text-sm">{vehicle.year}</span>
                </div>
                <h1 className="text-4xl md:text-5xl font-extrabold mb-2">
                  <span className="bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">
                    {vehicle.make} {vehicle.model}
                  </span>
                </h1>

                {vehicle.trim && (
                  <p className="text-gray-400 text-lg mb-4">
                    {vehicle.trim}
                  </p>
                )}

                {/* Owner */}
                {ownerProfile && (
                  <button
                    onClick={() => navigate(`/user/${ownerProfile.id}`)}
                    className="flex items-center gap-3 mt-2 group w-fit"
                  >
                    {ownerProfile.avatar_url ? (
                      <img
                        src={ownerProfile.avatar_url}
                        alt={ownerProfile.username || 'User'}
                        className="w-10 h-10 rounded-full object-cover border-2 border-gray-700 group-hover:border-red-500 transition"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center border-2 border-gray-600 group-hover:border-red-500 transition">
                        <svg
                          className="w-5 h-5 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                          />
                        </svg>
                      </div>
                    )}

                    <span className="text-sm text-gray-400 group-hover:text-red-400 transition">
                      @{ownerProfile.username || 'user'}
                    </span>
                  </button>
                )}
              </div>

              {/* Right: Actions */}
              {canEdit && (
                <div className="flex gap-3 self-start">
                  <button
                    onClick={() => setShowSellForm(true)}
                    className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl hover:opacity-90 transition font-semibold shadow-lg shadow-green-500/50"
                  >
                    {vehicle?.for_sale ? 'Update Price' : 'Sell Vehicle'}
                  </button>

                  <button
                    onClick={deleteVehicle}
                    className="px-6 py-3 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-xl hover:opacity-90 transition font-semibold shadow-lg shadow-red-500/50"
                  >
                    Delete
                  </button>
                </div>
              )}

              {!vehicleSaved && !canEdit && (
                <BookmarkIcon 
                className="w-8 h-8 absolute top-5 right-5 hover:cursor-pointer text-gray-400 hover:text-blue-500 hover:scale-110 active:scale-95 transition-all duration-200" 
                onClick={handleSaveVehicle}
                />
              )}
              {vehicleSaved && !canEdit && (
                <BookmarkSolid
                className="w-8 h-8 absolute top-5 right-5 hover:cursor-pointer text-blue-500 hover:text-gray-400 hover:scale-110 active:scale-95 transition-all duration-200" 
                onClick={handleSaveVehicle}
                />
              )}
              

              {/* Voting  DESKTOP */}
              <div className="absolute top-2 right-2 md:top-auto md:bottom-6 md:right-6 z-10 hidden md:block">
                <div className="flex items-center gap-2 md:gap-4">
                  {/* Downvote */}
                  <button 
                    className={`group flex flex-col items-center gap-1 transition-all duration-200 ${canEdit ? 'opacity-50 cursor-not-allowed' : 'hover:scale-110 active:scale-95'} ${userVote === -1 ? 'opacity-100' : 'opacity-80'}`}
                    onClick={passVote}
                    disabled={canEdit}
                  >
                    <div className={`p-1.5 md:p-2 rounded-xl border transition-all duration-200 relative ${
                      userVote === -1 
                        ? 'bg-red-500/30 border-red-500/60 shadow-lg shadow-red-500/20' 
                        : 'bg-red-500/10 group-hover:bg-red-500/20 border-red-500/20 group-hover:border-red-500/40'
                    } ${canEdit ? 'opacity-50' : ''}`}>
                      {canEdit && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-full h-0.5 bg-gray-400 rotate-45"></div>
                        </div>
                      )}
                      <HandThumbDownIcon className={`h-4 w-4 md:h-6 md:w-6 transition-colors ${
                        userVote === -1 
                          ? 'text-red-300' 
                          : 'text-red-400 group-hover:text-red-300'
                      } ${canEdit ? 'opacity-50' : ''}`} />
                    </div>
                    <span className={`text-[10px] md:text-xs font-medium transition-colors ${
                      userVote === -1 
                        ? 'text-red-400' 
                        : 'text-gray-400 group-hover:text-red-400'
                    } ${canEdit ? 'opacity-50 line-through' : ''}`}>Pass</span>
                  </button>
                  
                  {/* Vote Count */}
                  <div className="flex flex-col items-center min-w-[2rem] md:min-w-[4rem]">
                    <div className="text-base md:text-2xl font-bold bg-gradient-to-b from-green-400 via-white to-red-400 bg-clip-text text-transparent">
                      {vehicle?.vote_score > 0 ? `+${vehicle.vote_score}` : vehicle?.vote_score || 0}
                    </div>
                    <span className="text-[9px] md:text-xs text-gray-500 font-medium">Votes</span>
                  </div>
                  
                  {/* Upvote */}
                  <button 
                    className={`group flex flex-col items-center gap-1 transition-all duration-200 ${canEdit ? 'opacity-50 cursor-not-allowed' : 'hover:scale-110 active:scale-95'} ${userVote === 1 ? 'opacity-100' : 'opacity-80'}`}
                    onClick={approveVote}
                    disabled={canEdit}
                  >
                    <div className={`p-1.5 md:p-2 rounded-xl border transition-all duration-200 relative ${
                      userVote === 1 
                        ? 'bg-green-500/30 border-green-500/60 shadow-lg shadow-green-500/20' 
                        : 'bg-green-500/10 group-hover:bg-green-500/20 border-green-500/20 group-hover:border-green-500/40'
                    } ${canEdit ? 'opacity-50' : ''}`}>
                      {canEdit && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-full h-0.5 bg-gray-400 rotate-45"></div>
                        </div>
                      )}
                      <HandThumbUpIcon className={`h-4 w-4 md:h-6 md:w-6 transition-colors ${
                        userVote === 1 
                          ? 'text-green-300' 
                          : 'text-green-400 group-hover:text-green-300'
                      } ${canEdit ? 'opacity-50' : ''}`} />
                    </div>
                    <span className={`text-[10px] md:text-xs font-medium transition-colors ${
                      userVote === 1 
                        ? 'text-green-400' 
                        : 'text-gray-400 group-hover:text-green-400'
                    } ${canEdit ? 'opacity-50 line-through' : ''}`}>Approve</span>
                  </button>
                </div>
              </div>

              
            </div>
          </div>
           {/* Voting  MOBILE */}
          <div className="w-full flex justify-center z-10 md:hidden mt-6">
            <div className="flex items-center gap-2 md:gap-4">
              {/* Downvote */}
              <button 
                className={`group flex flex-col items-center gap-1 transition-all duration-200 ${canEdit ? 'opacity-50 cursor-not-allowed' : 'hover:scale-110 active:scale-95'} ${userVote === -1 ? 'opacity-100' : 'opacity-80'}`}
                onClick={passVote}
                disabled={canEdit}
              >
                <div className={`p-1.5 md:p-2 rounded-xl border transition-all duration-200 relative ${
                  userVote === -1 
                    ? 'bg-red-500/30 border-red-500/60 shadow-lg shadow-red-500/20' 
                    : 'bg-red-500/10 group-hover:bg-red-500/20 border-red-500/20 group-hover:border-red-500/40'
                } ${canEdit ? 'opacity-50' : ''}`}>
                  {canEdit && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-full h-0.5 bg-gray-400 rotate-45"></div>
                    </div>
                  )}
                  <HandThumbDownIcon className={`h-6 w-6  transition-colors ${
                    userVote === -1 
                      ? 'text-red-300' 
                      : 'text-red-400 group-hover:text-red-300'
                  } ${canEdit ? 'opacity-50' : ''}`} />
                </div>
                <span className={`text-[10px] md:text-xs font-medium transition-colors ${
                  userVote === -1 
                    ? 'text-red-400' 
                    : 'text-gray-400 group-hover:text-red-400'
                } ${canEdit ? 'opacity-50 line-through' : ''}`}>Pass</span>
              </button>
              
              {/* Vote Count */}
              <div className="flex flex-col items-center min-w-[2rem] md:min-w-[4rem]">
                <div className="text-[25px] font-bold bg-gradient-to-b from-green-400 via-white to-red-400 bg-clip-text text-transparent">
                  {vehicle?.vote_score > 0 ? `+${vehicle.vote_score}` : vehicle?.vote_score || 0}
                </div>
                <span className="text-[13px]  text-gray-500 font-medium">Votes</span>
              </div>
              
              {/* Upvote */}
              <button 
                className={`group flex flex-col items-center gap-1 transition-all duration-200 ${canEdit ? 'opacity-50 cursor-not-allowed' : 'hover:scale-110 active:scale-95'} ${userVote === 1 ? 'opacity-100' : 'opacity-80'}`}
                onClick={approveVote}
                disabled={canEdit}
              >
                <div className={`p-1.5 md:p-2 rounded-xl border transition-all duration-200 relative ${
                  userVote === 1 
                    ? 'bg-green-500/30 border-green-500/60 shadow-lg shadow-green-500/20' 
                    : 'bg-green-500/10 group-hover:bg-green-500/20 border-green-500/20 group-hover:border-green-500/40'
                } ${canEdit ? 'opacity-50' : ''}`}>
                  {canEdit && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-full h-0.5 bg-gray-400 rotate-45"></div>
                    </div>
                  )}
                  <HandThumbUpIcon className={`h-6 w-6  transition-colors ${
                    userVote === 1 
                      ? 'text-green-300' 
                      : 'text-green-400 group-hover:text-green-300'
                  } ${canEdit ? 'opacity-50' : ''}`} />
                </div>
                <span className={`text-[10px] md:text-xs font-medium transition-colors ${
                  userVote === 1 
                    ? 'text-green-400' 
                    : 'text-gray-400 group-hover:text-green-400'
                } ${canEdit ? 'opacity-50 line-through' : ''}`}>Approve</span>
              </button>
            </div>
          </div>
        </div>


        {/* MAIN LAYOUT: Content + Sidebar */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 ">
          {/* LEFT COLUMN - Main Content */}
          <div className="xl:col-span-8 space-y-6">
          {/* MAIN SECTION - Image and Info */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* CAROUSEL */}
          <div className="lg:col-span-1 relative bg-gray-800/50 backdrop-blur-sm rounded-2xl overflow-hidden shadow-2xl border border-gray-700/50 h-fit self-start">
            {imageUrls.length > 0 ? (
              <>
                <img
                  src={imageUrls[activeIndex].image_url}
                  className="w-full h-[400px] object-cover transition-transform duration-500"
                  alt="Vehicle"
                />

                {/* Arrows */}
                <button
                  onClick={() =>
                    setActiveIndex((i) =>
                      i === 0 ? imageUrls.length - 1 : i - 1
                    )
                  }
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/60 backdrop-blur-sm hover:bg-black/80 px-4 py-3 rounded-full text-white transition-all hover:scale-110"
                >
                  ‹
                </button>

                <button
                  onClick={() =>
                    setActiveIndex((i) =>
                      i === imageUrls.length - 1 ? 0 : i + 1
                    )
                  }
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/60 backdrop-blur-sm hover:bg-black/80 px-4 py-3 rounded-full text-white transition-all hover:scale-110"
                >
                  ›
                </button>

                {/* Bottom overlay */}
                <div className="absolute bottom-0 w-full bg-gradient-to-t from-black/80 to-transparent px-6 py-4 flex justify-between items-center">
                  <span className="text-sm text-white font-semibold">
                    {activeIndex + 1} / {imageUrls.length}
                  </span>
                  {canEdit && (
                    <div>
                    {!imageUrls[activeIndex].is_cover ? (
                      <button
                        onClick={() =>
                          makeCoverImage(imageUrls[activeIndex].id)
                        }
                        className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-sm px-4 py-2 rounded-lg hover:opacity-90 transition font-semibold"
                      >
                        Make Cover
                      </button>
                    ) : (
                      <span className="bg-gradient-to-r from-green-500 to-emerald-500 text-white text-sm px-4 py-2 rounded-lg font-semibold">
                        Cover Image
                      </span>
                    )}
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="h-[400px] flex items-center justify-center text-gray-400">
                <div className="text-center">
                  <p className="text-lg mb-2">No images uploaded</p>
                  <p className="text-sm text-gray-500">Upload images to showcase your vehicle</p>
                </div>
              </div>
            )}
          </div>

          {/* VEHICLE INFO / WHEELS INFO */}
          <div className="lg:col-span-2">
            {/* Tabs */}
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => setShowWheelsInfo(false)}
                className={`px-6 py-2 rounded-t-lg transition font-medium ${
                  !showWheelsInfo
                    ? 'bg-gray-800/50 backdrop-blur-sm text-white border-t border-l border-r border-gray-700/50'
                    : 'bg-gray-900/30 text-gray-400 hover:text-white border-t border-l border-r border-transparent'
                }`}
              >
                Car Info
              </button>
              <button
                onClick={() => setShowWheelsInfo(true)}
                className={`px-6 py-2 rounded-t-lg transition font-medium ${
                  showWheelsInfo
                    ? 'bg-gray-800/50 backdrop-blur-sm text-white border-t border-l border-r border-gray-700/50'
                    : 'bg-gray-900/30 text-gray-400 hover:text-white border-t border-l border-r border-transparent'
                }`}
              >
                Wheels
              </button>
            </div>

            {/* Content Card */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-b-2xl rounded-tr-2xl p-6 shadow-xl border border-gray-700/50 border-t-0">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-white">
                  {showWheelsInfo ? 'Wheels Information' : 'Vehicle Information'}
                </h3>
                {canEdit && !editingVehicleInfo && !showWheelsInfo && (
                  <button
                    onClick={handleEditVehicleInfo}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition text-sm font-medium"
                  >
                    <PencilSquareIcon className="w-4 h-4" />
                    Edit
                  </button>
                )}
              </div>

            {showWheelsInfo ? (
              <div className="space-y-4">
                {/* Add Wheel Setup Button */}
                {canEdit && !showAddWheelForm && !editingWheelSetup && (
                  <button
                    onClick={() => {
                      setShowAddWheelForm(true);
                      // Reset form
                      setWheelName('');
                      setWheelIsActive(false);
                      setIsWheelStaggered(false);
                      setFrontDiameter(''); setFrontWidth(''); setFrontOffset(''); setFrontBore('');
                      setRearDiameter(''); setRearWidth(''); setRearOffset(''); setRearBore('');
                      setBoltPattern(''); setWheelBrand(''); setWheelModel(''); setWheelColor(''); setWheelMaterial(''); setWheelNotes('');
                    }}
                    className="w-full px-4 py-3 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-lg hover:opacity-90 transition font-semibold flex items-center justify-center gap-2"
                  >
                    <PlusIcon className="w-5 h-5" />
                    Add Wheel Setup
                  </button>
                )}

                {/* Add/Edit Wheel Setup Form */}
                {(showAddWheelForm || editingWheelSetup) && canEdit && (
                  <form onSubmit={saveWheelSetup} className="bg-gray-900/50 rounded-lg p-6 border border-gray-700/50 space-y-4">
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="text-lg font-bold text-white">
                        {editingWheelSetup ? 'Edit Wheel Setup' : 'Add Wheel Setup'}
                      </h4>
                      <button
                        type="button"
                        onClick={() => {
                          setShowAddWheelForm(false);
                          setEditingWheelSetup(null);
                          // Reset form
                          setWheelName('');
                          setWheelIsActive(false);
                          setIsWheelStaggered(false);
                          setFrontDiameter(''); setFrontWidth(''); setFrontOffset(''); setFrontBore('');
                          setRearDiameter(''); setRearWidth(''); setRearOffset(''); setRearBore('');
                          setBoltPattern(''); setWheelBrand(''); setWheelModel(''); setWheelColor(''); setWheelMaterial(''); setWheelNotes('');
                        }}
                        className="text-gray-400 hover:text-white"
                      >
                        <XCircleIcon className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Setup Name
                        </label>
                        <input
                          type="text"
                          className="w-full p-3 bg-gray-800 text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                          value={wheelName}
                          onChange={(e) => setWheelName(e.target.value)}
                          placeholder="e.g., Summer Wheels, Track Setup"
                        />
                      </div>

                      <div className="md:col-span-2 flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={wheelIsActive}
                          onChange={(e) => setWheelIsActive(e.target.checked)}
                          className="w-4 h-4"
                        />
                        <label className="text-sm text-gray-300">Set as active setup</label>
                      </div>

                      <div className="md:col-span-2 flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={isWheelStaggered}
                          onChange={(e) => {
                            setIsWheelStaggered(e.target.checked);
                            // If unchecking staggered, copy front to rear
                            if (!e.target.checked) {
                              setRearDiameter(frontDiameter);
                              setRearWidth(frontWidth);
                              setRearOffset(frontOffset);
                              setRearBore(frontBore);
                            }
                          }}
                          className="w-4 h-4"
                        />
                        <label className="text-sm text-gray-300">Staggered setup (different front/rear sizes)</label>
                      </div>

                      <div className="md:col-span-2">
                        <h5 className="text-md font-semibold text-white mb-3">
                          {isWheelStaggered ? 'Front Wheels' : 'Wheel Specifications'}
                        </h5>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Diameter (inches)</label>
                        <input type="number" className="w-full p-3 bg-gray-800 text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500" value={frontDiameter} onChange={(e) => setFrontDiameter(e.target.value)} />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Width</label>
                        <input type="number" step="0.5" className="w-full p-3 bg-gray-800 text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500" value={frontWidth} onChange={(e) => setFrontWidth(e.target.value)} />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Offset</label>
                        <input type="number" step="0.5" className="w-full p-3 bg-gray-800 text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500" value={frontOffset} onChange={(e) => setFrontOffset(e.target.value)} />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Bore</label>
                        <input type="number" step="0.1" className="w-full p-3 bg-gray-800 text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500" value={frontBore} onChange={(e) => setFrontBore(e.target.value)} />
                      </div>

                      {isWheelStaggered && (
                        <>
                          <div className="md:col-span-2">
                            <h5 className="text-md font-semibold text-white mb-3 mt-4">Rear Wheels</h5>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Diameter (inches)</label>
                            <input type="number" className="w-full p-3 bg-gray-800 text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500" value={rearDiameter} onChange={(e) => setRearDiameter(e.target.value)} />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Width</label>
                            <input type="number" step="0.5" className="w-full p-3 bg-gray-800 text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500" value={rearWidth} onChange={(e) => setRearWidth(e.target.value)} />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Offset</label>
                            <input type="number" step="0.5" className="w-full p-3 bg-gray-800 text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500" value={rearOffset} onChange={(e) => setRearOffset(e.target.value)} />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Bore</label>
                            <input type="number" step="0.1" className="w-full p-3 bg-gray-800 text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500" value={rearBore} onChange={(e) => setRearBore(e.target.value)} />
                          </div>
                        </>
                      )}

                      <div className="md:col-span-2">
                        <h5 className="text-md font-semibold text-white mb-3 mt-4">Wheel Details</h5>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Bolt Pattern</label>
                        <input type="text" className="w-full p-3 bg-gray-800 text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500" value={boltPattern} onChange={(e) => setBoltPattern(e.target.value)} placeholder="e.g., 5x114.3" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Brand</label>
                        <input type="text" className="w-full p-3 bg-gray-800 text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500" value={wheelBrand} onChange={(e) => setWheelBrand(e.target.value)} />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Model</label>
                        <input type="text" className="w-full p-3 bg-gray-800 text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500" value={wheelModel} onChange={(e) => setWheelModel(e.target.value)} />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Color</label>
                        <input type="text" className="w-full p-3 bg-gray-800 text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500" value={wheelColor} onChange={(e) => setWheelColor(e.target.value)} />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Material</label>
                        <input type="text" className="w-full p-3 bg-gray-800 text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500" value={wheelMaterial} onChange={(e) => setWheelMaterial(e.target.value)} placeholder="e.g., Forged, Cast" />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-300 mb-2">Notes</label>
                        <textarea rows={3} className="w-full p-3 bg-gray-800 text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500" value={wheelNotes} onChange={(e) => setWheelNotes(e.target.value)} />
                      </div>
                    </div>

                    <div className="flex gap-3 pt-4">
                      <button
                        type="button"
                        onClick={() => {
                          setShowAddWheelForm(false);
                          setEditingWheelSetup(null);
                        }}
                        className="flex-1 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition font-semibold"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="flex-1 px-4 py-2 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-lg hover:opacity-90 transition font-semibold"
                      >
                        {editingWheelSetup ? 'Save Changes' : 'Add Setup'}
                      </button>
                    </div>
                  </form>
                )}

                {/* Wheel Setups List */}
                {wheelSetups.length === 0 && !showAddWheelForm && !editingWheelSetup && (
                  <div className="text-center py-8 text-gray-400">
                    <p>No wheel setups yet. Add your first setup to get started!</p>
                  </div>
                )}

                {wheelSetups.map((wheelSetup) => {
                  const isExpanded = expandedWheelSetup === wheelSetup.id;
                  const setupTireSetups = tireSetups[wheelSetup.id] || [];
                  
                  return (
                    <div key={wheelSetup.id} className="bg-gray-900/50 rounded-lg border border-gray-700/50 overflow-hidden">
                      {/* Wheel Setup Header */}
                      <div className="p-4">
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-3 flex-wrap">
                              <h4 className="text-base font-semibold text-white">
                                {wheelSetup.name || 'Unnamed Setup'}
                              </h4>
                              {wheelSetup.is_active && (
                                <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs font-semibold rounded flex-shrink-0">
                                  ACTIVE
                                </span>
                              )}
                            </div>
                            
                            {/* Clean Info Display */}
                            <div className="space-y-2.5 text-sm">
                              {/* Size Display */}
                              {wheelSetup.front_diameter && (() => {
                                const isStaggered = (
                                  wheelSetup.front_diameter !== wheelSetup.rear_diameter ||
                                  wheelSetup.front_width !== wheelSetup.rear_width ||
                                  wheelSetup.front_offset !== wheelSetup.rear_offset ||
                                  wheelSetup.front_bore !== wheelSetup.rear_bore
                                );
                                
                                if (!isStaggered && wheelSetup.rear_diameter) {
                                  // Non-staggered: show combined
                                  return (
                                    <div className="flex items-baseline gap-3">
                                      <span className="text-gray-400 text-sm font-medium w-32 flex-shrink-0">Size:</span>
                                      <span className="text-white font-semibold">
                                        {wheelSetup.front_diameter}" × {wheelSetup.front_width || '?'}"
                                        {wheelSetup.front_offset && ` ET${wheelSetup.front_offset}`}
                                      </span>
                                    </div>
                                  );
                                } else {
                                  // Staggered: show separately
                                  return (
                                    <>
                                      {wheelSetup.front_diameter && (
                                        <div className="flex items-baseline gap-3">
                                          <span className="text-gray-400 text-sm font-medium w-32 flex-shrink-0">Front:</span>
                                          <span className="text-white font-semibold">
                                            {wheelSetup.front_diameter}" × {wheelSetup.front_width || '?'}"
                                            {wheelSetup.front_offset && ` ET${wheelSetup.front_offset}`}
                                          </span>
                                        </div>
                                      )}
                                      {wheelSetup.rear_diameter && (
                                        <div className="flex items-baseline gap-3">
                                          <span className="text-gray-400 text-sm font-medium w-32 flex-shrink-0">Rear:</span>
                                          <span className="text-white font-semibold">
                                            {wheelSetup.rear_diameter}" × {wheelSetup.rear_width || '?'}"
                                            {wheelSetup.rear_offset && ` ET${wheelSetup.rear_offset}`}
                                          </span>
                                        </div>
                                      )}
                                    </>
                                  );
                                }
                              })()}
                              
                              {/* Other Details */}
                              {wheelSetup.bolt_pattern && (
                                <div className="flex items-baseline gap-3">
                                  <span className="text-gray-400 text-sm font-medium w-32 flex-shrink-0">Bolt Pattern:</span>
                                  <span className="text-white font-semibold">{wheelSetup.bolt_pattern}</span>
                                </div>
                              )}
                              
                              {wheelSetup.wheel_brand && wheelSetup.wheel_model && (
                                <div className="flex items-baseline gap-3">
                                  <span className="text-gray-400 text-sm font-medium w-32 flex-shrink-0">Wheels:</span>
                                  <span className="text-white font-semibold">{wheelSetup.wheel_brand} {wheelSetup.wheel_model}</span>
                                </div>
                              )}
                              
                              {wheelSetup.wheel_color && (
                                <div className="flex items-baseline gap-3">
                                  <span className="text-gray-400 text-sm font-medium w-32 flex-shrink-0">Color:</span>
                                  <span className="text-white font-semibold capitalize">{wheelSetup.wheel_color}</span>
                                </div>
                              )}
                              
                              {wheelSetup.wheel_material && (
                                <div className="flex items-baseline gap-3">
                                  <span className="text-gray-400 text-sm font-medium w-32 flex-shrink-0">Material:</span>
                                  <span className="text-white font-semibold">{wheelSetup.wheel_material}</span>
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0 flex-wrap sm:flex-nowrap">
                            {canEdit && (
                              <>
                                {!wheelSetup.is_active && (
                                  <button
                                    onClick={() => setActiveWheelSetup(wheelSetup.id)}
                                    className="px-3 py-1.5 bg-blue-500/20 text-blue-400 text-xs font-medium rounded hover:bg-blue-500/30 transition whitespace-nowrap"
                                  >
                                    Set Active
                                  </button>
                                )}
                                <button
                                  onClick={() => handleEditWheelSetup(wheelSetup)}
                                  className="p-2 bg-gray-700 hover:bg-gray-600 rounded transition flex-shrink-0"
                                  aria-label="Edit"
                                >
                                  <PencilSquareIcon className="w-4 h-4 text-white" />
                                </button>
                                <button
                                  onClick={() => deleteWheelSetup(wheelSetup.id)}
                                  className="p-2 bg-red-500/20 hover:bg-red-500/30 rounded transition flex-shrink-0"
                                  aria-label="Delete"
                                >
                                  <TrashIcon className="w-4 h-4 text-red-400" />
                                </button>
                              </>
                            )}
                            <button
                              onClick={() => setExpandedWheelSetup(isExpanded ? null : wheelSetup.id)}
                              className="p-2 bg-gray-700 hover:bg-gray-600 rounded transition flex-shrink-0"
                              aria-label={isExpanded ? "Collapse" : "Expand"}
                            >
                              {isExpanded ? (
                                <ChevronUpIcon className="w-4 h-4 text-white" />
                              ) : (
                                <ChevronDownIcon className="w-4 h-4 text-white" />
                              )}
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Expanded Content - Tire Setups */}
                      {isExpanded && (
                        <div className="border-t border-gray-700/50 p-4 space-y-3">
                          <div className="flex items-center justify-between mb-3">
                            <h5 className="text-sm font-semibold text-white">Tire Setups</h5>
                            {canEdit && showAddTireForm !== wheelSetup.id && !editingTireSetup && (
                              <button
                                onClick={() => {
                                  setShowAddTireForm(wheelSetup.id);
                                  setTireName('');
                                  setTireIsActive(false);
                                  setIsTireStaggered(false);
                                  setTireBrand(''); setTireModel(''); setTireType('');
                                  setTireFrontWidth(''); setTireFrontAspectRatio(''); setTireFrontDiameter('');
                                  setTireRearWidth(''); setTireRearAspectRatio(''); setTireRearDiameter('');
                                  setTireNotes('');
                                }}
                                className="px-3 py-1.5 bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-sm rounded hover:opacity-90 transition font-medium flex items-center gap-2"
                              >
                                <PlusIcon className="w-4 h-4" />
                                Add Tire Setup
                              </button>
                            )}
                          </div>

                          {/* Add/Edit Tire Form */}
                          {(showAddTireForm === wheelSetup.id || editingTireSetup) && canEdit && (
                            <form onSubmit={(e) => saveTireSetup(e, wheelSetup.id)} className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50 space-y-4">
                              <div className="flex justify-between items-center">
                                <h6 className="text-sm font-bold text-white">
                                  {editingTireSetup ? 'Edit Tire Setup' : 'Add Tire Setup'}
                                </h6>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setShowAddTireForm(null);
                                    setEditingTireSetup(null);
                                    // Reset form
                                    setTireName('');
                                    setTireIsActive(false);
                                    setIsTireStaggered(false);
                                    setTireBrand(''); setTireModel(''); setTireType('');
                                    setTireFrontWidth(''); setTireFrontAspectRatio(''); setTireFrontDiameter('');
                                    setTireRearWidth(''); setTireRearAspectRatio(''); setTireRearDiameter('');
                                    setTireNotes('');
                                  }}
                                  className="text-gray-400 hover:text-white"
                                >
                                  <XCircleIcon className="w-4 h-4" />
                                </button>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div className="md:col-span-2">
                                  <label className="block text-xs font-medium text-gray-300 mb-1">Setup Name</label>
                                  <input type="text" className="w-full p-2 bg-gray-900 text-white border border-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" value={tireName} onChange={(e) => setTireName(e.target.value)} />
                                </div>
                                <div className="md:col-span-2 flex items-center gap-2">
                                  <input type="checkbox" checked={tireIsActive} onChange={(e) => setTireIsActive(e.target.checked)} className="w-4 h-4" />
                                  <label className="text-xs text-gray-300">Set as active</label>
                                </div>
                                <div className="md:col-span-2 flex items-center gap-2">
                                  <input
                                    type="checkbox"
                                    checked={isTireStaggered}
                                    onChange={(e) => {
                                      setIsTireStaggered(e.target.checked);
                                      // If unchecking staggered, copy front to rear
                                      if (!e.target.checked) {
                                        setTireRearWidth(tireFrontWidth);
                                        setTireRearAspectRatio(tireFrontAspectRatio);
                                        setTireRearDiameter(tireFrontDiameter);
                                      }
                                    }}
                                    className="w-4 h-4"
                                  />
                                  <label className="text-xs text-gray-300">Staggered setup (different front/rear sizes)</label>
                                </div>
                                <div>
                                  <label className="block text-xs font-medium text-gray-300 mb-1">Brand</label>
                                  <input type="text" className="w-full p-2 bg-gray-900 text-white border border-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" value={tireBrand} onChange={(e) => setTireBrand(e.target.value)} />
                                </div>
                                <div>
                                  <label className="block text-xs font-medium text-gray-300 mb-1">Model</label>
                                  <input type="text" className="w-full p-2 bg-gray-900 text-white border border-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" value={tireModel} onChange={(e) => setTireModel(e.target.value)} />
                                </div>
                                <div>
                                  <label className="block text-xs font-medium text-gray-300 mb-1">Type</label>
                                  <input type="text" className="w-full p-2 bg-gray-900 text-white border border-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" value={tireType} onChange={(e) => setTireType(e.target.value)} placeholder="e.g., Summer, All-Season" />
                                </div>
                                <div className="md:col-span-2">
                                  <h6 className="text-xs font-semibold text-white mb-2">
                                    {isTireStaggered ? 'Front Tire' : 'Tire Specifications'}
                                  </h6>
                                </div>
                                <div>
                                  <label className="block text-xs font-medium text-gray-300 mb-1">Width</label>
                                  <input type="number" className="w-full p-2 bg-gray-900 text-white border border-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" value={tireFrontWidth} onChange={(e) => setTireFrontWidth(e.target.value)} />
                                </div>
                                <div>
                                  <label className="block text-xs font-medium text-gray-300 mb-1">Aspect Ratio</label>
                                  <input type="number" className="w-full p-2 bg-gray-900 text-white border border-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" value={tireFrontAspectRatio} onChange={(e) => setTireFrontAspectRatio(e.target.value)} />
                                </div>
                                <div>
                                  <label className="block text-xs font-medium text-gray-300 mb-1">Diameter</label>
                                  <input type="number" className="w-full p-2 bg-gray-900 text-white border border-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" value={tireFrontDiameter} onChange={(e) => setTireFrontDiameter(e.target.value)} />
                                </div>
                                {isTireStaggered && (
                                  <>
                                    <div className="md:col-span-2">
                                      <h6 className="text-xs font-semibold text-white mb-2">Rear Tire</h6>
                                    </div>
                                    <div>
                                      <label className="block text-xs font-medium text-gray-300 mb-1">Width</label>
                                      <input type="number" className="w-full p-2 bg-gray-900 text-white border border-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" value={tireRearWidth} onChange={(e) => setTireRearWidth(e.target.value)} />
                                    </div>
                                    <div>
                                      <label className="block text-xs font-medium text-gray-300 mb-1">Aspect Ratio</label>
                                      <input type="number" className="w-full p-2 bg-gray-900 text-white border border-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" value={tireRearAspectRatio} onChange={(e) => setTireRearAspectRatio(e.target.value)} />
                                    </div>
                                    <div>
                                      <label className="block text-xs font-medium text-gray-300 mb-1">Diameter</label>
                                      <input type="number" className="w-full p-2 bg-gray-900 text-white border border-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" value={tireRearDiameter} onChange={(e) => setTireRearDiameter(e.target.value)} />
                                    </div>
                                  </>
                                )}
                                <div className="md:col-span-2">
                                  <label className="block text-xs font-medium text-gray-300 mb-1">Notes</label>
                                  <textarea rows={2} className="w-full p-2 bg-gray-900 text-white border border-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" value={tireNotes} onChange={(e) => setTireNotes(e.target.value)} />
                                </div>
                              </div>

                              <div className="flex gap-2 pt-2">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setShowAddTireForm(null);
                                    setEditingTireSetup(null);
                                    // Reset form
                                    setTireName('');
                                    setTireIsActive(false);
                                    setIsTireStaggered(false);
                                    setTireBrand(''); setTireModel(''); setTireType('');
                                    setTireFrontWidth(''); setTireFrontAspectRatio(''); setTireFrontDiameter('');
                                    setTireRearWidth(''); setTireRearAspectRatio(''); setTireRearDiameter('');
                                    setTireNotes('');
                                  }}
                                  className="flex-1 px-3 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 transition text-sm font-medium"
                                >
                                  Cancel
                                </button>
                                <button
                                  type="submit"
                                  className="flex-1 px-3 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded hover:opacity-90 transition text-sm font-medium"
                                >
                                  {editingTireSetup ? 'Save' : 'Add'}
                                </button>
                              </div>
                            </form>
                          )}

                          {/* Tire Setups List */}
                          {setupTireSetups.length === 0 && showAddTireForm !== wheelSetup.id && !editingTireSetup && (
                            <div className="text-center py-4 text-gray-500 text-sm">
                              No tire setups yet
                            </div>
                          )}

                          {setupTireSetups.map((tireSetup) => (
                            <div key={tireSetup.id} className="bg-gray-800/50 rounded-lg p-3 border border-gray-700/50">
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-2">
                                    <h6 className="text-sm font-semibold text-white">
                                      {tireSetup.name || 'Unnamed Tire Setup'}
                                    </h6>
                                    {tireSetup.is_active && (
                                      <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs font-semibold rounded flex-shrink-0">
                                        ACTIVE
                                      </span>
                                    )}
                                  </div>
                                  <div className="space-y-2 text-sm">
                                    {/* Size Display */}
                                    {tireSetup.front_width && tireSetup.front_aspect_ratio && tireSetup.front_diameter && (() => {
                                      const isStaggered = (
                                        tireSetup.front_width !== tireSetup.rear_width ||
                                        tireSetup.front_aspect_ratio !== tireSetup.rear_aspect_ratio ||
                                        tireSetup.front_diameter !== tireSetup.rear_diameter
                                      );
                                      
                                      if (!isStaggered && tireSetup.rear_width) {
                                        // Non-staggered: show combined
                                        return (
                                          <div className="flex items-baseline gap-3">
                                            <span className="text-gray-400 text-sm font-medium w-28 flex-shrink-0">Size:</span>
                                            <span className="text-white font-semibold">
                                              {tireSetup.front_width}/{tireSetup.front_aspect_ratio}R{tireSetup.front_diameter}
                                            </span>
                                          </div>
                                        );
                                      } else {
                                        // Staggered: show separately
                                        return (
                                          <>
                                            <div className="flex items-baseline gap-3">
                                              <span className="text-gray-400 text-sm font-medium w-28 flex-shrink-0">Front:</span>
                                              <span className="text-white font-semibold">
                                                {tireSetup.front_width}/{tireSetup.front_aspect_ratio}R{tireSetup.front_diameter}
                                              </span>
                                            </div>
                                            {tireSetup.rear_width && tireSetup.rear_aspect_ratio && tireSetup.rear_diameter && (
                                              <div className="flex items-baseline gap-3">
                                                <span className="text-gray-400 text-sm font-medium w-28 flex-shrink-0">Rear:</span>
                                                <span className="text-white font-semibold">
                                                  {tireSetup.rear_width}/{tireSetup.rear_aspect_ratio}R{tireSetup.rear_diameter}
                                                </span>
                                              </div>
                                            )}
                                          </>
                                        );
                                      }
                                    })()}
                                    
                                    {/* Other Details */}
                                    {tireSetup.tire_brand && tireSetup.tire_model && (
                                      <div className="flex items-baseline gap-3">
                                        <span className="text-gray-400 text-sm font-medium w-28 flex-shrink-0">Tire:</span>
                                        <span className="text-white font-semibold">{tireSetup.tire_brand} {tireSetup.tire_model}</span>
                                      </div>
                                    )}
                                    
                                    {tireSetup.tire_type && (
                                      <div className="flex items-baseline gap-3">
                                        <span className="text-gray-400 text-sm font-medium w-28 flex-shrink-0">Type:</span>
                                        <span className="text-white font-semibold">{tireSetup.tire_type}</span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                                {canEdit && (
                                  <div className="flex items-center gap-2 flex-shrink-0 flex-wrap sm:flex-nowrap">
                                    {!tireSetup.is_active && (
                                      <button
                                        onClick={() => setActiveTireSetup(tireSetup.id, wheelSetup.id)}
                                        className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs font-medium rounded hover:bg-blue-500/30 transition whitespace-nowrap"
                                      >
                                        Set Active
                                      </button>
                                    )}
                                    <button
                                      onClick={() => handleEditTireSetup(tireSetup)}
                                      className="p-1.5 bg-gray-700 hover:bg-gray-600 rounded transition flex-shrink-0"
                                      aria-label="Edit"
                                    >
                                      <PencilSquareIcon className="w-3.5 h-3.5 text-white" />
                                    </button>
                                    <button
                                      onClick={() => deleteTireSetup(tireSetup.id)}
                                      className="p-1.5 bg-red-500/20 hover:bg-red-500/30 rounded transition flex-shrink-0"
                                      aria-label="Delete"
                                    >
                                      <TrashIcon className="w-3.5 h-3.5 text-red-400" />
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : !editingVehicleInfo ? (
              <div className="space-y-4">
                {(() => {
                  const showMileage = vehicle.show_mileage !== false;
                  const showEngine = vehicle.show_engine !== false;
                  const showTransmission = vehicle.show_transmission !== false;
                  const showColor = vehicle.show_color !== false;
                  const showTrim = vehicle.show_trim !== false;
                  const showLicensePlate = vehicle.show_license_plate !== false;
                  const showVin = vehicle.show_vin !== false;

                  return (
                    <>
                      {showMileage && <InfoRow label="Mileage" value={vehicle.current_mileage ? `${vehicle.current_mileage.toLocaleString()} mi` : '—'} />}
                      {showEngine && <InfoRow label="Engine" value={vehicle.engine} />}
                      {showTransmission && <InfoRow label="Transmission" value={vehicle.transmission} />}
                      {showColor && <InfoRow label="Color" value={vehicle.color} />}
                      {showTrim && vehicle.trim && <InfoRow label="Trim" value={vehicle.trim} />}
                      {showLicensePlate && vehicle.license_plate && <InfoRow label="License Plate" value={vehicle.license_plate} />}
                      {showVin && vehicle.vin && <InfoRow label="VIN" value={vehicle.vin} />}
                      {vehicle.oil_change_interval && (
                        <InfoRow label="Oil Change Interval" value={`${Number(vehicle.oil_change_interval).toLocaleString()} mi`} />
                      )}
                    </>
                  );
                })()}
              </div>
            ) : (
              <form onSubmit={saveVehicleInfo} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Make <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      className="w-full p-3 bg-gray-900 text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                      value={editedMake}
                      onChange={(e) => setEditedMake(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Model <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      className="w-full p-3 bg-gray-900 text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                      value={editedModel}
                      onChange={(e) => setEditedModel(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Year <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      required
                      min="1900"
                      max="2100"
                      className="w-full p-3 bg-gray-900 text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                      value={editedYear}
                      onChange={(e) => setEditedYear(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Trim
                    </label>
                    <input
                      type="text"
                      className="w-full p-3 bg-gray-900 text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                      value={editedTrim}
                      onChange={(e) => setEditedTrim(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Engine
                    </label>
                    <input
                      type="text"
                      className="w-full p-3 bg-gray-900 text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                      value={editedEngine}
                      onChange={(e) => setEditedEngine(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Transmission
                    </label>
                    <input
                      type="text"
                      className="w-full p-3 bg-gray-900 text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                      value={editedTransmission}
                      onChange={(e) => setEditedTransmission(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Current Mileage
                    </label>
                    <input
                      type="number"
                      min="0"
                      className="w-full p-3 bg-gray-900 text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                      value={editedMileage}
                      onChange={(e) => setEditedMileage(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Color
                    </label>
                    <input
                      type="text"
                      className="w-full p-3 bg-gray-900 text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                      value={editedColor}
                      onChange={(e) => setEditedColor(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      License Plate
                    </label>
                    <input
                      type="text"
                      className="w-full p-3 bg-gray-900 text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                      value={editedLicensePlate}
                      onChange={(e) => setEditedLicensePlate(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      VIN
                    </label>
                    <input
                      type="text"
                      className="w-full p-3 bg-gray-900 text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                      value={editedVin}
                      onChange={(e) => setEditedVin(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Oil Change Interval (mi)
                    </label>
                    <input
                      type="number"
                      min="0"
                      className="w-full p-3 bg-gray-900 text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                      value={editedOilChangeInterval}
                      onChange={(e) => setEditedOilChangeInterval(e.target.value)}
                    />
                  </div>
                </div>

                {/* Visibility Toggles */}
                <div className="pt-6 border-t border-gray-700/50">
                  <h4 className="text-lg font-semibold text-white mb-4">Visibility Settings</h4>
                  <p className="text-sm text-gray-400 mb-4">Choose which information to display publicly</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <label className="flex items-center justify-between p-3 bg-gray-900/50 rounded-lg cursor-pointer hover:bg-gray-900 transition">
                      <span className="text-gray-300">Show Mileage</span>
                      <div className="relative">
                        <input
                          type="checkbox"
                          checked={showMileage}
                          onChange={(e) => setShowMileage(e.target.checked)}
                          className="sr-only"
                        />
                        <div className={`w-11 h-6 rounded-full transition-colors ${showMileage ? 'bg-red-500' : 'bg-gray-600'}`}>
                          <div className={`w-5 h-5 bg-white rounded-full transition-transform mt-0.5 ${showMileage ? 'translate-x-5 ml-0.5' : 'translate-x-0.5'}`}></div>
                        </div>
                      </div>
                    </label>
                    <label className="flex items-center justify-between p-3 bg-gray-900/50 rounded-lg cursor-pointer hover:bg-gray-900 transition">
                      <span className="text-gray-300">Show Engine</span>
                      <div className="relative">
                        <input
                          type="checkbox"
                          checked={showEngine}
                          onChange={(e) => setShowEngine(e.target.checked)}
                          className="sr-only"
                        />
                        <div className={`w-11 h-6 rounded-full transition-colors ${showEngine ? 'bg-red-500' : 'bg-gray-600'}`}>
                          <div className={`w-5 h-5 bg-white rounded-full transition-transform mt-0.5 ${showEngine ? 'translate-x-5 ml-0.5' : 'translate-x-0.5'}`}></div>
                        </div>
                      </div>
                    </label>
                    <label className="flex items-center justify-between p-3 bg-gray-900/50 rounded-lg cursor-pointer hover:bg-gray-900 transition">
                      <span className="text-gray-300">Show Transmission</span>
                      <div className="relative">
                        <input
                          type="checkbox"
                          checked={showTransmission}
                          onChange={(e) => setShowTransmission(e.target.checked)}
                          className="sr-only"
                        />
                        <div className={`w-11 h-6 rounded-full transition-colors ${showTransmission ? 'bg-red-500' : 'bg-gray-600'}`}>
                          <div className={`w-5 h-5 bg-white rounded-full transition-transform mt-0.5 ${showTransmission ? 'translate-x-5 ml-0.5' : 'translate-x-0.5'}`}></div>
                        </div>
                      </div>
                    </label>
                    <label className="flex items-center justify-between p-3 bg-gray-900/50 rounded-lg cursor-pointer hover:bg-gray-900 transition">
                      <span className="text-gray-300">Show Color</span>
                      <div className="relative">
                        <input
                          type="checkbox"
                          checked={showColor}
                          onChange={(e) => setShowColor(e.target.checked)}
                          className="sr-only"
                        />
                        <div className={`w-11 h-6 rounded-full transition-colors ${showColor ? 'bg-red-500' : 'bg-gray-600'}`}>
                          <div className={`w-5 h-5 bg-white rounded-full transition-transform mt-0.5 ${showColor ? 'translate-x-5 ml-0.5' : 'translate-x-0.5'}`}></div>
                        </div>
                      </div>
                    </label>
                    <label className="flex items-center justify-between p-3 bg-gray-900/50 rounded-lg cursor-pointer hover:bg-gray-900 transition">
                      <span className="text-gray-300">Show Trim</span>
                      <div className="relative">
                        <input
                          type="checkbox"
                          checked={showTrim}
                          onChange={(e) => setShowTrim(e.target.checked)}
                          className="sr-only"
                        />
                        <div className={`w-11 h-6 rounded-full transition-colors ${showTrim ? 'bg-red-500' : 'bg-gray-600'}`}>
                          <div className={`w-5 h-5 bg-white rounded-full transition-transform mt-0.5 ${showTrim ? 'translate-x-5 ml-0.5' : 'translate-x-0.5'}`}></div>
                        </div>
                      </div>
                    </label>
                    <label className="flex items-center justify-between p-3 bg-gray-900/50 rounded-lg cursor-pointer hover:bg-gray-900 transition">
                      <span className="text-gray-300">Show License Plate</span>
                      <div className="relative">
                        <input
                          type="checkbox"
                          checked={showLicensePlate}
                          onChange={(e) => setShowLicensePlate(e.target.checked)}
                          className="sr-only"
                        />
                        <div className={`w-11 h-6 rounded-full transition-colors ${showLicensePlate ? 'bg-red-500' : 'bg-gray-600'}`}>
                          <div className={`w-5 h-5 bg-white rounded-full transition-transform mt-0.5 ${showLicensePlate ? 'translate-x-5 ml-0.5' : 'translate-x-0.5'}`}></div>
                        </div>
                      </div>
                    </label>
                    <label className="flex items-center justify-between p-3 bg-gray-900/50 rounded-lg cursor-pointer hover:bg-gray-900 transition">
                      <span className="text-gray-300">Show VIN</span>
                      <div className="relative">
                        <input
                          type="checkbox"
                          checked={showVin}
                          onChange={(e) => setShowVin(e.target.checked)}
                          className="sr-only"
                        />
                        <div className={`w-11 h-6 rounded-full transition-colors ${showVin ? 'bg-red-500' : 'bg-gray-600'}`}>
                          <div className={`w-5 h-5 bg-white rounded-full transition-transform mt-0.5 ${showVin ? 'translate-x-5 ml-0.5' : 'translate-x-0.5'}`}></div>
                        </div>
                      </div>
                    </label>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setEditingVehicleInfo(false)}
                    className="flex-1 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={editingVehicle}
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-lg hover:opacity-90 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {editingVehicle ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            )}
            </div>
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
              className="block w-full text-sm text-gray-300
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
                className={`flex-shrink-0 border-2 rounded-lg transition-all ${
                  index === activeIndex
                    ? 'border-blue-500 scale-105'
                    : 'border-transparent hover:border-gray-600'
                }`}
              >
                <img
                  src={img.image_url}
                  className="h-28 w-40 md:h-32 md:w-48 object-cover rounded-md"
                  alt="Thumbnail"
                />
              </button>
            ))}
          </div>
        )}

        {/* Top of maintenance log section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-bold">Maintenance Logs</h2>
            {/* Toggle to hide gas logs */}
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={hideGasLogs}
                onChange={(e) => {
                  setHideGasLogs(e.target.checked);
                  setLogsToShow(10); // Reset to 10 when toggling
                }}
                className="sr-only"
              />
              <div className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${
                hideGasLogs ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
              }`}>
                <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform duration-200 ${
                  hideGasLogs ? 'translate-x-5' : 'translate-x-0'
                }`}></div>
              </div>
              <span className="text-sm font-medium text-gray-300">
                Hide Gas Logs
              </span>
            </label>
          </div>
          {canEdit && (
            <div>
              <button
                onClick={() => {setAddGasVisible(!addGasVisible); setAddLogVisible(false)}}
                className="mr-2 bg-orange-400 text-white dark:text-white hover:bg-orange-500 rounded px-4 py-2 text-base sm:px-3 sm:py-1 sm:text-sm"
              >
                {addGasVisible ? 'Cancel' : 'Add Gas'}
              </button>

              <button
                onClick={() => {setAddLogVisible(!addLogVisible); setAddGasVisible(false)}}
                className="bg-gray-800 dark:bg-gray-700 text-white dark:text-white hover:bg-gray-700 dark:hover:bg-gray-600 rounded px-4 py-2 text-base sm:px-3 sm:py-1 sm:text-sm"
              >
                {addLogVisible ? 'Cancel' : 'Add Log'}
              </button>

            </div>
          )}
        </div>

        {hasOilChangeInterval && (
          <div className="mb-6 rounded-xl border border-gray-700/50 bg-gray-800/40 p-4">
            <div className="text-sm text-gray-400">Oil Change Interval</div>
            <div className="text-lg font-semibold text-white">
              Every {oilChangeInterval.toLocaleString()} mi
            </div>
            <div className="text-sm text-gray-300 mt-1">
              {nextOilChangeMileage !== null ? (
                <>
                  Next due at {nextOilChangeMileage.toLocaleString()} mi
                  {milesUntilOilChange !== null && (
                    <span className="text-gray-400">
                      {milesUntilOilChange >= 0
                        ? ` • ${Math.round(milesUntilOilChange).toLocaleString()} mi remaining`
                        : ` • ${Math.abs(Math.round(milesUntilOilChange)).toLocaleString()} mi overdue`}
                    </span>
                  )}
                </>
              ) : (
                'Log an Oil Change to calculate the next due mileage.'
              )}
            </div>
          </div>
        )}

        {/* Add Maintenance Logs */}
        {canEdit && addLogVisible && (
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 shadow-xl mt-6 border border-gray-700/50">
            
            {/* Header */}
            <div className="mb-6">
              <h3 className="text-2xl font-bold text-white mb-2">
                Add Maintenance Log
              </h3>
              <p className="text-sm text-gray-400">
                Keep track of work, parts, and costs
              </p>
            </div>

            <form className="space-y-4" onSubmit={addMaintenanceLog}>

              <p className="text-sm text-gray-400 mb-4">
                Fields marked with <span className="text-red-500">*</span> are required
              </p>

              {/* Title */}
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-300">
                  Log Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Oil Change"
                  required
                  value={logTitle}
                  onChange={(e) => setLogTitle(e.target.value)}
                  className="w-full p-3 bg-gray-900 text-white
                            border border-gray-700 rounded-lg
                            focus:outline-none focus:ring-2 focus:ring-orange-500
                            invalid:border-red-500 invalid:ring-red-500 placeholder-gray-500"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-300">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={logCategory}
                  onChange={(e) => setLogCategory(e.target.value)}
                  className="w-full p-3 bg-gray-900 text-white
                            border border-gray-700 rounded-lg
                            focus:outline-none focus:ring-2 focus:ring-orange-500
                            invalid:border-red-500 invalid:ring-red-500"
                >
                  <option value="" disabled>Select a category</option>
                  <option value="Oil Change">Oil Change</option>
                  <option value="Brakes">Brakes</option>
                  <option value="Tires">Tires</option>
                  <option value="Fluids">Fluids</option>
                  <option value="Filters">Filters</option>
                  <option value="Battery">Battery</option>
                  <option value="Inspection">Inspection</option>
                  <option value="Repair">Repair</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* Description */}
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-300">
                  Description
                </label>
                <textarea
                  rows={3}
                  placeholder="What was done?"
                  value={logDescription}
                  onChange={(e) => setLogDescription(e.target.value)}
                  className="w-full p-3 bg-gray-900 text-white
                            border border-gray-700 rounded-lg
                            focus:outline-none focus:ring-2 focus:ring-orange-500 placeholder-gray-500"
                />
              </div>

              {/* Cost + Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-300">
                    Cost ($) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    required
                    placeholder="0.00"
                    value={logCost}
                    onChange={(e) => setLogCost(e.target.value)}
                    className="w-full p-3 bg-gray-900 text-white
                              border border-gray-700 rounded-lg
                              focus:outline-none focus:ring-2 focus:ring-orange-500
                              invalid:border-red-500 invalid:ring-red-500 placeholder-gray-500"
                  />
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-300">
                    Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={logDate}
                    onChange={(e) => setLogDate(e.target.value)}
                    className="w-full p-3 bg-gray-900 text-white
                              border border-gray-700 rounded-lg
                              focus:outline-none focus:ring-2 focus:ring-orange-500
                              invalid:border-red-500 invalid:ring-red-500 placeholder-gray-500"
                  />
                </div>
              </div>

              {/* Mileage + Tools */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-300">
                    Mileage
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="Mileage"
                    value={logMileage}
                    onChange={(e) => setLogMileage(e.target.value)}
                    className="w-full p-3 bg-gray-900 text-white
                              border border-gray-700 rounded-lg
                              focus:outline-none focus:ring-2 focus:ring-orange-500 placeholder-gray-500"
                  />
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-300">
                    Tools Used
                  </label>
                  <input
                    type="text"
                    placeholder="Optional"
                    value={logToolsUsed}
                    onChange={(e) => setLogToolsUsed(e.target.value)}
                    className="w-full p-3 bg-gray-900 text-white
                              border border-gray-700 rounded-lg
                              focus:outline-none focus:ring-2 focus:ring-orange-500 placeholder-gray-500"
                  />
                </div>
              </div>

              {/* Labor + Performer */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-300">
                    Labor Hours
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    placeholder="Hours"
                    value={logLaborHours}
                    onChange={(e) => setLogLaborHours(e.target.value)}
                    className="w-full p-3 bg-gray-900 text-white
                              border border-gray-700 rounded-lg
                              focus:outline-none focus:ring-2 focus:ring-orange-500 placeholder-gray-500"
                  />
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-300">
                    Performed By
                  </label>
                  <input
                    type="text"
                    placeholder="Yourself, friend, shop…"
                    value={logPerformer}
                    onChange={(e) => setLogPerformer(e.target.value)}
                    className="w-full p-3 bg-gray-900 text-white
                              border border-gray-700 rounded-lg
                              focus:outline-none focus:ring-2 focus:ring-orange-500 placeholder-gray-500"
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-300">
                  Notes
                </label>
                <textarea
                  rows={3}
                  placeholder="Any other notes"
                  value={logNotes}
                  onChange={(e) => setLogNotes(e.target.value)}
                  className="w-full p-3 bg-gray-900 text-white
                            border border-gray-700 rounded-lg
                            focus:outline-none focus:ring-2 focus:ring-orange-500 placeholder-gray-500"
                />
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={logUploading}
                className="w-full mt-4 bg-gradient-to-r from-orange-500 to-red-500
                          text-white font-semibold py-3 rounded-lg
                          hover:opacity-90 transition disabled:opacity-50 shadow-lg shadow-orange-500/50"
              >
                {logUploading ? 'Adding Log…' : 'Add Maintenance Log'}
              </button>

            </form>

          </div>
        )}

        {/* Add Gas Logs */}
        {canEdit && addGasVisible && (
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 shadow-xl mt-6 border border-gray-700/50">
            
            {/* Header */}
            <div className="mb-6">
              <h3 className="text-2xl font-bold text-white mb-2">
                Add Gas!
              </h3>
              <p className="text-sm text-gray-400">
                Keep track of when you get gas
              </p>
            </div>

            <form className="space-y-4" onSubmit={addGasLog}>

              <p className="text-sm text-gray-400">
                Fields marked with <span className="text-red-500">*</span> are required
              </p>
              

              {/* Cost + Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-300">
                    Cost ($) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    required
                    placeholder="0.00"
                    value={logCost}
                    onChange={(e) => setLogCost(e.target.value)}
                    className="w-full p-3 bg-gray-900 text-white
                              border border-gray-700 rounded-lg
                              focus:outline-none focus:ring-2 focus:ring-orange-500
                              invalid:border-red-500 invalid:ring-red-500 placeholder-gray-500"
                  />
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-300">
                    Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={logDate}
                    onChange={(e) => setLogDate(e.target.value)}
                    className="w-full p-3 bg-gray-900 text-white
                              border border-gray-700 rounded-lg
                              focus:outline-none focus:ring-2 focus:ring-orange-500
                              invalid:border-red-500 invalid:ring-red-500 placeholder-gray-500"
                  />
                </div>
              </div>
              {/* Mileage + Gallons*/}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-300">
                    Mileage
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={logMileage}
                    onChange={(e) => setLogMileage(e.target.value)}
                    className="w-full p-3 bg-gray-900 text-white
                              border border-gray-700 rounded-lg
                              focus:outline-none focus:ring-2 focus:ring-orange-500 placeholder-gray-500"
                  />
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-300">
                    Gallons
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    placeholder="0.0"
                    value={logGallons}
                    onChange={(e) => setLogGallons(e.target.value)}
                    className="w-full p-3 bg-gray-900 text-white
                              border border-gray-700 rounded-lg
                              focus:outline-none focus:ring-2 focus:ring-orange-500 placeholder-gray-500"
                  />
                </div>

              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={logUploading}
                className="w-full mt-4 bg-gradient-to-r from-orange-500 to-red-500
                          text-white font-semibold py-3 rounded-lg
                          hover:opacity-90 transition disabled:opacity-50 shadow-lg shadow-orange-500/50"
              >
                {logUploading ? 'Adding Log…' : 'Add Gas Log'}
              </button>

            </form>

          </div>
        )}

        {/* Maintenance Logs */}
        <div className="mt-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-7">
            {(() => {
              // Calculate filtered totals based on hideGasLogs toggle
              const filteredLogs = hideGasLogs 
                ? maintenanceLogs.filter(log => !log.gas)
                : maintenanceLogs;
              
              const filteredTotalPrice = filteredLogs.reduce(
                (sum, log) => sum + (Number(log.cost) || 0), 0
              );
              
              const filteredTotalHours = filteredLogs.reduce(
                (sum, log) => sum + (Number(log.labor_hours) || 0), 0
              );
              
              const filteredTotalLogs = filteredLogs.length;
              
              return (
                <>
                  {/* Total Logs */}
                  <div className="flex flex-col items-center justify-center bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 shadow-xl border border-gray-700/50">
                    <p className="text-sm text-gray-400 mb-2">
                      # of Logs
                    </p>
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent">
                      {filteredTotalLogs}
                    </h1>
                  </div>

                  {/* Total Spent */}
                  <div className="flex flex-col items-center justify-center bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 shadow-xl border border-gray-700/50">
                    <p className="text-sm text-gray-400 mb-2">
                      Total Spent
                    </p>
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-green-500 to-emerald-500 bg-clip-text text-transparent">
                      ${filteredTotalPrice.toFixed(2)}
                    </h1>
                  </div>

                  {/* Hours Spent */}
                  <div className="flex flex-col items-center justify-center bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 shadow-xl border border-gray-700/50">
                    <p className="text-sm text-gray-400 mb-2">
                      Hours Spent
                    </p>
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
                      {filteredTotalHours}
                    </h1>
                  </div>
                </>
              );
            })()}
          </div>
        

          {(() => {
            const filteredLogs = hideGasLogs 
              ? maintenanceLogs.filter(log => !log.gas)
              : maintenanceLogs;
            
            return filteredLogs.length === 0 ? (
              <div className="text-center py-12 bg-gray-800/30 rounded-xl border border-gray-700/50">
                <p className="text-gray-400 text-lg">
                  {hideGasLogs 
                    ? 'No maintenance logs (gas logs hidden). Start by adding one above 👨‍🔧'
                    : canEdit 
                      ? 'No maintenance logs yet. Start by adding one above 👨‍🔧' 
                      : 'No maintenance logs yet🔧'}
                </p>
              </div>
            ) : (
              <>
                <div className="relative border-l-2 border-gray-700 ml-3 space-y-6">
                  {filteredLogs.slice(0, logsToShow).map((log) => (
                <div key={log.id} className="relative pl-8">
                  {/* Timeline dot */}
                  <span className={`absolute -left-[9px] top-2 h-5 w-5 rounded-full border-2 border-gray-900 ${log.gas ? 'bg-orange-500 shadow-lg shadow-orange-500/50' : 'bg-blue-500 shadow-lg shadow-blue-500/50'}`} />

                  {editingLogId === log.id ? (
                    <div className={`rounded-xl p-6 shadow-xl border-2 ${log.gas ? 'bg-orange-500/20 border-orange-500/50' : 'bg-gray-800/50 border-blue-500/50'} backdrop-blur-sm`}>
                      {/* Header */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex-1">
                          <label className="block text-xs font-medium text-gray-400 mb-1">
                            Title
                          </label>
                          <input 
                            className="w-full text-lg font-semibold bg-gray-900 text-white border border-gray-700 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500" 
                            value={editedLogTitle || ''} 
                            type="text"
                            onChange={(e) => setEditedLogTitle(e.target.value)}
                            placeholder="Log title"
                          />
                        </div>
                        <div className="flex items-center gap-2 ml-4">
                          {editingLogId === log.id && canEdit && (
                            <>
                              <button
                                onClick={submitLogEdit}
                                className="p-2 rounded-lg bg-green-500 hover:bg-green-600 text-white transition-colors"
                                title="Save"
                                disabled={editUploading}
                              >
                                <CheckIcon className="h-5 w-5" />
                              </button>
                              <button
                                onClick={() => setEditingLogId(null)}
                                className="p-2 rounded-lg bg-gray-400 hover:bg-gray-500 text-white transition-colors"
                                title="Cancel"
                              >
                                <XCircleIcon className="h-5 w-5" />
                              </button>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Date */}
                      <div className="mb-4">
                        <label className="block text-xs font-medium text-gray-400 mb-1">
                          Date
                        </label>
                        <input
                          type="date"
                          value={editedLogDate || ''}
                          onChange={(e) => setEditedLogDate(e.target.value)}
                          className="w-full bg-gray-900 text-white border border-gray-700 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      {/* Edit Description - Only show if not gas log */}
                      {!log.gas && (
                        <>
                          <div className="mb-4">
                            <label className="block text-xs font-medium text-gray-400 mb-1">
                              Category
                            </label>
                            <select
                              value={editedLogCategory || ''}
                              onChange={(e) => setEditedLogCategory(e.target.value)}
                              className="w-full p-3 rounded-lg border border-gray-700 bg-gray-900 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                              <option value="">Select a category</option>
                              <option value="Oil Change">Oil Change</option>
                              <option value="Brakes">Brakes</option>
                              <option value="Tires">Tires</option>
                              <option value="Fluids">Fluids</option>
                              <option value="Filters">Filters</option>
                              <option value="Battery">Battery</option>
                              <option value="Inspection">Inspection</option>
                              <option value="Repair">Repair</option>
                              <option value="Other">Other</option>
                            </select>
                          </div>
                          <div className="mb-4">
                            <label className="block text-xs font-medium text-gray-400 mb-1">
                              Description
                            </label>
                            <textarea
                              value={editedLogDescription || ''}
                              onChange={(e) => setEditedLogDescription(e.target.value)}
                              className="w-full p-3 rounded-lg border border-gray-700 bg-gray-900 text-white resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500"
                              rows={3}
                              placeholder="What was done?"
                            />
                          </div>
                        </>
                      )}

                      {/* Edit Metadata */}
                      {log.gas ? (
                        /* Gas log - always show all 3 fields */
                        <div className="grid grid-cols-3 gap-3">
                          <div className="bg-gray-900 rounded-lg p-3 border border-gray-700">
                            <label className="block text-xs font-medium text-gray-400 mb-1">
                              Mileage
                            </label>
                            <div className="flex items-center gap-1">
                              <input 
                                className="flex-1 font-semibold bg-transparent border-none focus:outline-none text-white"
                                type="number"
                                value={editedLogMileage || ''}
                                onChange={(e) => setEditedLogMileage(e.target.value)}
                                placeholder="0"
                              />
                              <span className="text-sm text-gray-400">mi</span>
                            </div>
                          </div>

                          <div className="bg-gray-900 rounded-lg p-3 border border-gray-700">
                            <label className="block text-xs font-medium text-gray-400 mb-1">
                              Cost
                            </label>
                            <div className="flex items-center gap-1">
                              <span className="text-sm text-gray-400">$</span>
                              <input 
                                className="flex-1 font-semibold bg-transparent border-none focus:outline-none text-white"
                                type="number"
                                step="0.01"
                                value={editedLogCost || ''}
                                onChange={(e) => setEditedLogCost(e.target.value)}
                                placeholder="0.00"
                              />
                            </div>
                          </div>

                          <div className="bg-gray-900 rounded-lg p-3 border border-gray-700">
                            <label className="block text-xs font-medium text-gray-400 mb-1">
                              Gallons
                            </label>
                            <input 
                              className="w-full font-semibold bg-transparent border-none focus:outline-none text-white"
                              type="number"
                              step="0.01"
                              value={editedLogGallons || ''}
                              onChange={(e) => setEditedLogGallons(e.target.value)}
                              placeholder="0.00"
                            />
                          </div>
                        </div>
                      ) : (
                        /* Regular log - always show all fields */
                        <div className="space-y-3">
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            <div className="bg-gray-900 rounded-lg p-3 border border-gray-700">
                              <label className="block text-xs font-medium text-gray-400 mb-1">
                                Mileage
                              </label>
                              <div className="flex items-center gap-1">
                                <input 
                                  className="flex-1 font-semibold bg-transparent border-none focus:outline-none text-white"
                                  type="number"
                                  value={editedLogMileage || ''}
                                  onChange={(e) => setEditedLogMileage(e.target.value)}
                                  placeholder="0"
                                />
                                <span className="text-sm text-gray-400">mi</span>
                              </div>
                            </div>

                            <div className="bg-gray-900 rounded-lg p-3 border border-gray-700">
                              <label className="block text-xs font-medium text-gray-400 mb-1">
                                Cost
                              </label>
                              <div className="flex items-center gap-1">
                                <span className="text-sm text-gray-400">$</span>
                                <input 
                                  className="flex-1 font-semibold bg-transparent border-none focus:outline-none text-white"
                                  type="number"
                                  step="0.01"
                                  value={editedLogCost || ''}
                                  onChange={(e) => setEditedLogCost(e.target.value)}
                                  placeholder="0.00"
                                />
                              </div>
                            </div>

                            <div className="bg-gray-900 rounded-lg p-3 border border-gray-700">
                              <label className="block text-xs font-medium text-gray-400 mb-1">
                                Labor Hours
                              </label>
                              <input 
                                className="w-full font-semibold bg-transparent border-none focus:outline-none text-white"
                                type="number"
                                step="0.1"
                                value={editedLogLaborHours || ''}
                                onChange={(e) => setEditedLogLaborHours(e.target.value)}
                                placeholder="0"
                              />
                            </div>

                            <div className="bg-gray-900 rounded-lg p-3 border border-gray-700">
                              <label className="block text-xs font-medium text-gray-400 mb-1">
                                Performed By
                              </label>
                              <input 
                                className="w-full font-semibold bg-transparent border-none focus:outline-none text-white"
                                type="text"
                                value={editedLogPerformer || ''}
                                onChange={(e) => setEditedLogPerformer(e.target.value)}
                                placeholder="Optional"
                              />
                            </div>
                          </div>

                          <div className="bg-gray-900 rounded-lg p-3 border border-gray-700">
                            <label className="block text-xs font-medium text-gray-400 mb-1">
                              Tools Used
                            </label>
                            <input 
                              className="w-full font-semibold bg-transparent border-none focus:outline-none text-white"
                              type="text"
                              value={editedLogToolsUsed || ''}
                              onChange={(e) => setEditedLogToolsUsed(e.target.value)}
                              placeholder="Optional"
                            />
                          </div>

                          <div className="bg-gray-900 rounded-lg p-3 border border-gray-700">
                            <label className="block text-xs font-medium text-gray-400 mb-1">
                              Notes
                            </label>
                            <textarea
                              className="w-full font-semibold bg-transparent border-none focus:outline-none text-white resize-none"
                              rows={2}
                              value={editedLogNotes || ''}
                              onChange={(e) => setEditedLogNotes(e.target.value)}
                              placeholder="Optional notes"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className={`rounded-xl p-6 shadow-xl border ${log.gas ? 'bg-orange-500/20 border-orange-500/30' : 'bg-gray-800/50 border-gray-700/50'} backdrop-blur-sm hover:scale-[1.02] transition-transform`}>
                    {/* Header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-semibold text-white">{log.title}</h3>
                        {!log.gas && log.category && (
                          <span className="text-xs font-semibold px-2 py-1 rounded-full bg-blue-500/20 text-blue-200 border border-blue-500/40">
                            {log.category}
                          </span>
                        )}
                      </div>
                      <div>
                        {canEdit && (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleEdit(log)}
                              className="p-2 rounded-md hover:bg-blue-500/20 transition"
                              title="Edit"
                            >
                              <PencilSquareIcon className="h-5 w-5 text-gray-400 hover:text-blue-400" />
                            </button>

                            <button
                              onClick={() => handleRemoveLog(log.id)}
                              className="p-2 rounded-md hover:bg-red-500/20 transition"
                              title="Delete"
                            >
                              <TrashIcon className="h-5 w-5 text-gray-400 hover:text-red-400" />
                            </button>
                          </div>
                        )}

                        <span className="text-sm text-gray-400">
                          {log.date}
                        </span>
                      </div>
                      
                    </div>

                    {/* Description - Only show if not gas log */}
                    {!log.gas && log.description && (
                      <p className="mt-2 text-gray-300">
                        {log.description}
                      </p>
                    )}

                    {/* Metadata */}
                    {log.gas ? (
                      /* Gas log - only mileage and cost */
                      <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
                        {log.mileage && (
                          <div className="bg-gray-900 rounded-lg px-3 py-2 border border-gray-700">
                            <span className="block text-gray-400 text-xs">
                              Mileage
                            </span>
                            <span className="font-semibold text-white">
                              {log.mileage.toLocaleString()} mi
                            </span>
                          </div>
                        )}

                        {log.cost && (
                          <div className="bg-gray-900 rounded-lg px-3 py-2 border border-gray-700">
                            <span className="block text-gray-400 text-xs">
                              Cost
                            </span>
                            <span className="font-semibold text-white">
                              ${Number(log.cost).toFixed(2)}
                            </span>
                          </div>
                        )}

                        {log.gas_gallons && (
                          <div className="bg-gray-900 rounded-lg px-3 py-2 border border-gray-700">
                            <span className="block text-gray-400 text-xs">
                              Gallons
                            </span>
                            <span className="font-semibold text-white">
                              {Number(log.gas_gallons).toFixed(2)}
                            </span>
                          </div>
                        )}
                      </div>
                    ) : (
                      /* Regular log - all fields */
                      <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                        {log.mileage && (
                          <div className="bg-gray-900 rounded-lg px-3 py-2 border border-gray-700">
                            <span className="block text-gray-400 text-xs">
                              Mileage
                            </span>
                            <span className="font-semibold text-white">
                              {log.mileage.toLocaleString()} mi
                            </span>
                          </div>
                        )}

                        {log.cost && (
                          <div className="bg-gray-900 rounded-lg px-3 py-2 border border-gray-700">
                            <span className="block text-gray-400 text-xs">
                              Cost
                            </span>
                            <span className="font-semibold text-white">
                              ${Number(log.cost).toFixed(2)}
                            </span>
                          </div>
                        )}

                        {log.tools_used && (
                          <div className="bg-gray-900 rounded-lg px-3 py-2 col-span-2 border border-gray-700">
                            <span className="block text-gray-400 text-xs">
                              Tools Used
                            </span>
                            <span className="font-semibold text-white">{log.tools_used}</span>
                          </div>
                        )}

                        {log.labor_hours && (
                          <div className="bg-gray-900 rounded-lg px-3 py-2 border border-gray-700">
                            <span className="block text-gray-400 text-xs">
                              Labor Hours
                            </span>
                            <span className="font-semibold text-white">{log.labor_hours}</span>
                          </div>
                        )}
                        {log.performed_by && (
                          <div className="bg-gray-900 rounded-lg px-3 py-2 border border-gray-700">
                            <span className="block text-gray-400 text-xs">
                              Performed by
                            </span>
                            <span className="font-semibold text-white">{log.performed_by}</span>
                          </div>
                        )}

                        {log.notes && (
                          <div className="bg-gray-900 rounded-lg px-3 py-2 col-span-2 border border-gray-700">
                            <span className="block text-gray-400 text-xs">
                              Notes
                            </span>
                            <span className="font-semibold text-white">{log.notes}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  )}
                  
                </div>
                  ))}
                </div>
                
                {/* Load More Button */}
                {filteredLogs.length > logsToShow && (
                  <div className="flex justify-center mt-6">
                    <button
                      onClick={() => setLogsToShow(prev => prev + 10)}
                      className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl hover:opacity-90 transition font-semibold shadow-lg shadow-blue-500/50 flex items-center gap-2"
                    >
                      Load More ({filteredLogs.length - logsToShow} remaining)
                      <ArrowRightIcon className="w-5 h-5" />
                    </button>
                  </div>
                )}
              </>
            );
          })()}
        </div>
          </div>

          {/* RIGHT COLUMN - Discussion & Q&A Sidebar */}
          <div className="xl:col-span-4 space-y-6">
            <DiscussionSection vehicleId={id} vehicleOwnerId={vehicle?.user_id} />
            <QASection vehicleId={id} vehicleOwnerId={vehicle?.user_id} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default VehicleDetails;

/* ------------------ INFO ROW ------------------ */

const InfoRow = ({ label, value }) => (
  <div className="flex justify-between border-b border-gray-700/50 pb-3">
    <span className="text-gray-400">{label}</span>
    <span className="font-semibold text-white">{value || '—'}</span>
  </div>
);

/* ------------------ DISCUSSION SECTION ------------------ */

const DiscussionSection = ({ vehicleId, vehicleOwnerId }) => {
  const navigate = useNavigate();
  const { session } = UserAuth();
  const isOwner = session?.user?.id === vehicleOwnerId;
  
  const [discussions, setDiscussions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostContent, setNewPostContent] = useState('');
  const [showNewPost, setShowNewPost] = useState(false);

  // Fetch discussions from Supabase
  const fetchDiscussions = async () => {
    setLoading(true);
    try {
      const { data: posts, error } = await supabase
        .from('posts')
        .select(`
          id,
          title,
          body,
          comment_count,
          created_at,
          user_id,
          profiles:user_id (
            username
          )
        `)
        .eq('vehicle_id', vehicleId)
        .eq('post_type', 'discussion')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching discussions:', error);
        setLoading(false);
        return;
      }

      // Format discussions
      const formatted = (posts || []).map(post => ({
        id: post.id,
        title: post.title,
        content: post.body,
        comments: post.comment_count || 0,
        timestamp: formatTimeAgo(post.created_at),
        vehicleId: vehicleId,
        author: post.profiles?.username || 'Unknown'
      }));

      setDiscussions(formatted);
    } catch (err) {
      console.error('Error in fetchDiscussions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (vehicleId) {
      fetchDiscussions();
    }
  }, [vehicleId, session?.user?.id]);


  const handleSubmitPost = async (e) => {
    e.preventDefault();
    if (!newPostTitle.trim() || !newPostContent.trim()) return;
    if (!session?.user?.id) {
      alert('Please sign in to create a post');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('posts')
        .insert({
          user_id: session.user.id,
          title: newPostTitle,
          body: newPostContent,
          post_type: 'discussion',
          vehicle_id: vehicleId,
          comment_count: 0
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating post:', error);
        alert('Failed to create post. Please try again.');
      } else {
        setNewPostTitle('');
        setNewPostContent('');
        setShowNewPost(false);
        fetchDiscussions();
      }
    } catch (err) {
      console.error('Error in handleSubmitPost:', err);
      alert('Failed to create post. Please try again.');
    }
  };

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-gray-700/50">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold flex items-center gap-2 text-white">
          <ChatBubbleLeftIcon className="h-6 w-6 text-blue-400" />
          Discussions
        </h2>
        {!isOwner && (
          <button
            onClick={() => setShowNewPost(!showNewPost)}
            className="text-sm bg-gradient-to-r from-blue-500 to-cyan-500 hover:opacity-90 text-white px-4 py-2 rounded-lg transition font-semibold shadow-lg shadow-blue-500/50"
          >
            {showNewPost ? 'Cancel' : '+ New Post'}
          </button>
        )}
      </div>

      {/* New Post Form */}
      {showNewPost && (
        <form onSubmit={handleSubmitPost} className="mb-6 p-5 bg-gray-900/50 rounded-xl border border-gray-700/50 space-y-4">
          <input
            type="text"
            placeholder="Post title..."
            value={newPostTitle}
            onChange={(e) => setNewPostTitle(e.target.value)}
            className="w-full p-3 bg-gray-800 text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500"
          />
          <textarea
            placeholder="What's on your mind?"
            value={newPostContent}
            onChange={(e) => setNewPostContent(e.target.value)}
            rows={3}
            className="w-full p-3 bg-gray-800 text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none placeholder-gray-500"
          />
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:opacity-90 text-white py-3 rounded-lg transition font-semibold shadow-lg shadow-blue-500/50"
          >
            Post
          </button>
        </form>
      )}

      {/* Discussions List */}
      <div className="space-y-4 max-h-[600px] overflow-y-auto">
        {loading ? (
          <p className="text-center text-gray-400 py-4">Loading...</p>
        ) : discussions.length === 0 ? (
          <p className="text-center text-gray-400 py-8">
            No discussions yet. Start the conversation!
          </p>
        ) : (
          discussions.map((disc) => (
          <div
            key={disc.id}
            className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700/50 hover:border-blue-500/50 hover:shadow-lg transition-all cursor-pointer"
          >
            <div className="flex gap-3">
              {/* Content - Clickable */}
              <div 
                className="flex-1 min-w-0 cursor-pointer"
                onClick={() => navigate(`/discussion/${disc.id}`)}
              >
                <h3 className="font-semibold text-sm mb-1 line-clamp-2 hover:text-blue-400 transition text-white">{disc.title}</h3>
                <p className="text-sm text-gray-400 mb-2 line-clamp-2">
                  {disc.content}
                </p>
                <div className="flex items-center gap-3 text-xs text-gray-500">
                  <span className="font-medium">{disc.author}</span>
                  <span>•</span>
                  <span>{disc.timestamp}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <ChatBubbleLeftIcon className="h-3 w-3" />
                    {disc.comments}
                  </span>
                </div>
              </div>
            </div>
          </div>
          ))
        )}
      </div>
    </div>
  );
};

// Helper function to format time ago
const formatTimeAgo = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now - date) / 1000);
  
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} day${days !== 1 ? 's' : ''} ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 4) return `${weeks} week${weeks !== 1 ? 's' : ''} ago`;
  const months = Math.floor(days / 30);
  return `${months} month${months !== 1 ? 's' : ''} ago`;
};

/* ------------------ Q&A SECTION ------------------ */

const QASection = ({ vehicleId, vehicleOwnerId }) => {
  const { session } = UserAuth();
  const isOwner = session?.user?.id === vehicleOwnerId;
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newQuestion, setNewQuestion] = useState('');
  const [showNewQuestion, setShowNewQuestion] = useState(false);
  const [newAnswers, setNewAnswers] = useState({});



  // Fetch questions from Supabase
  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const { data: posts, error } = await supabase
        .from('posts')
        .select(`
          id,
          title,
          body,
          comment_count,
          is_solved,
          created_at,
          user_id,
          profiles:user_id (
            username
          )
        `)
        .eq('vehicle_id', vehicleId)
        .eq('post_type', 'question')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching questions:', error);
        setLoading(false);
        return;
      }

      // Fetch answers for each question
      const questionIds = posts?.map(p => p.id) || [];
      let allAnswers = {};
      
      if (questionIds.length > 0) {
        // Fetch answers without nested relationship to avoid errors
        const { data: comments, error: commentsError } = await supabase
          .from('comments')
          .select('id, body, is_answer, is_accepted, created_at, post_id, parent_id, user_id')
          .in('post_id', questionIds)
          .eq('is_answer', true)
          .order('created_at', { ascending: true });

        if (commentsError) {
          console.error('Error fetching answers:', commentsError);
        } else if (comments && comments.length > 0) {
          // Fetch usernames separately
          const userIds = [...new Set(comments.map(c => c.user_id).filter(Boolean))];
          let usernameMap = {};
          
          if (userIds.length > 0) {
            const { data: profilesData } = await supabase
              .from('profiles')
              .select('id, username')
              .in('id', userIds);
            
            if (profilesData) {
              usernameMap = profilesData.reduce((acc, profile) => {
                acc[profile.id] = profile.username;
                return acc;
              }, {});
            }
          }

          // Group comments by post_id (question id)
          allAnswers = comments.reduce((acc, comment) => {
            const questionId = comment.post_id;
            if (!acc[questionId]) {
              acc[questionId] = [];
            }
            acc[questionId].push({
              id: comment.id,
              author: usernameMap[comment.user_id] || 'Unknown',
              content: comment.body,
              timestamp: formatTimeAgo(comment.created_at),
              isAccepted: comment.is_accepted || false
            });
            return acc;
          }, {});
        }
      }

      // Format questions
      const formatted = (posts || []).map(post => {
        const questionAnswers = allAnswers[post.id] || [];
        return {
          id: post.id,
          user_id: post.user_id,
          author: post.profiles?.username || 'Unknown',
          question: post.title || post.body,
          answers: questionAnswers,
          timestamp: formatTimeAgo(post.created_at),
          isAnswered: questionAnswers.length > 0 || post.is_solved
        };
      });

      console.log('Formatted questions with answers:', formatted);
      setQuestions(formatted);
    } catch (err) {
      console.error('Error in fetchQuestions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (vehicleId) {
      fetchQuestions();
    }
  }, [vehicleId]);

  const handleSubmitQuestion = async (e) => {
    e.preventDefault();
    if (!newQuestion.trim()) return;
    if (!session?.user?.id) {
      alert('Please sign in to ask a question');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('posts')
        .insert({
          user_id: session.user.id,
          title: newQuestion,
          body: newQuestion,
          post_type: 'question',
          vehicle_id: vehicleId,
          comment_count: 0,
          is_solved: false
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating question:', error);
        alert('Failed to create question. Please try again.');
      } else {
        setNewQuestion('');
        setShowNewQuestion(false);
        fetchQuestions();
      }
    } catch (err) {
      console.error('Error in handleSubmitQuestion:', err);
      alert('Failed to create question. Please try again.');
    }
  };

  const handleSubmitAnswer = async (questionId, e) => {
    e.preventDefault();
    const answerText = newAnswers[questionId];
    if (!answerText?.trim()) return;
    if (!session?.user?.id) {
      alert('Please sign in to answer');
      return;
    }

    try {
      const { error } = await supabase
        .from('comments')
        .insert({
          user_id: session.user.id,
          post_id: questionId,
          parent_id: null,
          body: answerText,
          is_answer: true,
          is_accepted: false
        });

      if (error) {
        console.error('Error creating answer:', error);
        alert('Failed to post answer. Please try again.');
      } else {
        // Update comment count
        const { data: post } = await supabase
          .from('posts')
          .select('comment_count')
          .eq('id', questionId)
          .single();

        if (post) {
          await supabase
            .from('posts')
            .update({ comment_count: (post.comment_count || 0) + 1 })
            .eq('id', questionId);
        }

        setNewAnswers(prev => ({ ...prev, [questionId]: '' }));
        fetchQuestions();
      }
    } catch (err) {
      console.error('Error in handleSubmitAnswer:', err);
      alert('Failed to post answer. Please try again.');
    }
  };

  const handleAcceptAnswer = async (questionId, answerId) => {
    if (!session?.user?.id) {
      alert('Please sign in to accept answers');
      return;
    }

    try {
      // Check if user owns the question
      const { data: question } = await supabase
        .from('posts')
        .select('user_id')
        .eq('id', questionId)
        .single();

      if (!question || question.user_id !== session.user.id) {
        alert('Only the question author can accept answers');
        return;
      }

      // Unaccept all other answers for this question
      await supabase
        .from('comments')
        .update({ is_accepted: false })
        .eq('post_id', questionId)
        .eq('is_answer', true);

      // Accept the selected answer
      const { error } = await supabase
        .from('comments')
        .update({ is_accepted: true })
        .eq('id', answerId);

      if (!error) {
        // Mark question as solved
        await supabase
          .from('posts')
          .update({ is_solved: true })
          .eq('id', questionId);

        fetchQuestions();
      }
    } catch (err) {
      console.error('Error accepting answer:', err);
    }
  };
  

  const handleRemoveQuestion = async (question_id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this question?"
    );

    if (!confirmed) return;

    console.log(question_id)

    const {data, error} = await supabase
      .from('posts')
      .delete()
      .eq('id', question_id);

    if (error) {
      console.error("Error deleting question: ", error)
    } else {
      console.log("Question deleted successfully!")
    }

    fetchQuestions();
  }

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-gray-700/50">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold flex items-center gap-2 text-white">
          <QuestionMarkCircleIcon className="h-6 w-6 text-green-400" />
          Q&A
        </h2>
        {!isOwner && (
          <button
            onClick={() => setShowNewQuestion(!showNewQuestion)}
            className="text-sm bg-gradient-to-r from-green-500 to-emerald-500 hover:opacity-90 text-white px-4 py-2 rounded-lg transition font-semibold shadow-lg shadow-green-500/50"
          >
            {showNewQuestion ? 'Cancel' : '+ Ask Question'}
          </button>
        )}
      </div>

      {/* New Question Form */}
      {showNewQuestion && (
        <form onSubmit={handleSubmitQuestion} className="mb-6 p-5 bg-gray-900/50 rounded-xl border border-gray-700/50">
          <textarea
            placeholder="What would you like to know?"
            value={newQuestion}
            onChange={(e) => setNewQuestion(e.target.value)}
            rows={3}
            className="w-full p-3 bg-gray-800 text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 resize-none mb-4 placeholder-gray-500"
          />
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:opacity-90 text-white py-3 rounded-lg transition font-semibold shadow-lg shadow-green-500/50"
          >
            Ask Question
          </button>
        </form>
      )}

      {/* Questions List */}
      <div className="space-y-4 max-h-[600px] overflow-y-auto">
        {loading ? (
          <p className="text-center text-gray-400 py-4">Loading...</p>
        ) : questions.length === 0 ? (
          <p className="text-center text-gray-400 py-8">
            No questions yet. Be the first to ask!
          </p>
        ) : (
          questions.map((q) => (
          <div
            key={q.id}
            className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-5 border border-gray-700/50 hover:border-green-500/50 hover:shadow-lg transition-all relative"
          > 
            {(isOwner || q.user_id == session.user.id) && (
              <TrashIcon className="absolute bottom-4 right-4 h-5 w-5 text-gray-400 inline-block cursor-pointer hover:text-red-400" onClick={(e) => handleRemoveQuestion(q.id)}/>
            )}
            
            <div className="flex items-start gap-3 mb-3">
              
              <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
                q.isAnswered
                  ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg shadow-green-500/50'
                  : 'bg-gray-700 text-gray-400'
              }`}>
                {q.isAnswered ? '✓' : '?'}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-sm mb-1 text-white">{q.question}</h3>
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <span>{q.author}</span>
                  <span>•</span>
                  <span>{q.timestamp}</span>
                  {q.isAnswered && (
                    <>
                      <span>•</span>
                      <span className="text-green-600 dark:text-green-400">{q.answers.length} answer{q.answers.length !== 1 ? 's' : ''}</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Answers */}
            {q.answers.length > 0 && (
              <div className="ml-14 space-y-3 border-l-2 border-gray-700 pl-4">
                {q.answers.map((answer) => (
                  <div
                    key={answer.id}
                    className={`relative p-4 rounded-lg ${
                      answer.isAccepted
                        ? 'bg-green-500/20 border border-green-500/50'
                        : 'bg-gray-900/50 border border-gray-700/50'
                    } backdrop-blur-sm`}
                  >
                    {answer.isAccepted && (
                      <div className="absolute -left-6 top-3 text-green-600 dark:text-green-400">
                        <CheckIcon className="h-5 w-5" />
                      </div>
                    )}
                    <p className="text-sm text-gray-300 mb-2">
                      {answer.content}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 text-xs text-gray-400">
                        <span>{answer.author}</span>
                        <span>•</span>
                        <span>{answer.timestamp}</span>
                      </div>
                      {!answer.isAccepted && !isOwner && (
                        <button
                          onClick={() => handleAcceptAnswer(q.id, answer.id)}
                          className="text-xs text-green-600 dark:text-green-400 hover:underline"
                        >
                          Accept
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Answer Input */}
            <div className="ml-14 mt-4">
              <form onSubmit={(e) => handleSubmitAnswer(q.id, e)} className="space-y-2">
                <textarea
                  placeholder="Write an answer..."
                  value={newAnswers[q.id] || ''}
                  onChange={(e) => setNewAnswers(prev => ({ ...prev, [q.id]: e.target.value }))}
                  rows={2}
                  className="w-full p-3 bg-gray-800 text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 resize-none text-sm placeholder-gray-500"
                />
                <button
                  type="submit"
                  className="text-sm bg-gradient-to-r from-green-500 to-emerald-500 hover:opacity-90 text-white px-4 py-2 rounded-lg transition font-semibold"
                >
                  Post Answer
                </button>
              </form>
            </div>
            
            
          </div>
          ))
        )}
      </div>
    </div>
  );
};

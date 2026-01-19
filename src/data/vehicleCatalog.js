const vehicleCatalog = [
  {
    make: 'Audi',
    type: 'Euro',
    models: ['A3', 'A4', 'A5', 'A6', 'A7', 'A8', 'Q3', 'Q4 e-tron', 'Q5', 'Q7', 'Q8', 'S3', 'S4', 'S5', 'S6', 'S7', 'S8', 'RS3', 'RS5', 'RS6', 'RS7', 'TT', 'R8'],
  },
  {
    make: 'BMW',
    type: 'Euro',
    models: ['1 Series', '2 Series', '3 Series', '4 Series', '5 Series', '6 Series', '7 Series', '8 Series', 'X1', 'X2', 'X3', 'X4', 'X5', 'X6', 'X7', 'Z4', 'i3', 'i4', 'i5', 'i7', 'i8', 'iX', 'M2', 'M3', 'M4', 'M5', 'M8'],
  },
  {
    make: 'Mercedes-Benz',
    type: 'Euro',
    models: ['A-Class', 'C-Class', 'E-Class', 'S-Class', 'CLA', 'CLS', 'GLA', 'GLB', 'GLC', 'GLE', 'GLS', 'G-Class', 'EQS', 'EQE', 'EQC', 'AMG GT', 'SL', 'SLC'],
  },
  {
    make: 'Porsche',
    type: 'Euro',
    models: ['911', '718 Cayman', '718 Boxster', 'Panamera', 'Macan', 'Cayenne', 'Taycan', 'Cayman GT4', 'Boxster Spyder'],
  },
  {
    make: 'Volkswagen',
    type: 'Euro',
    models: ['Golf', 'GTI', 'Golf R', 'Jetta', 'Passat', 'Atlas', 'Atlas Cross Sport', 'Tiguan', 'Arteon', 'ID.4'],
  },
  {
    make: 'Volvo',
    type: 'Euro',
    models: ['S60', 'S90', 'V60', 'V90', 'XC40', 'XC60', 'XC90'],
  },
  {
    make: 'Mini',
    type: 'Euro',
    models: ['Cooper', 'Cooper S', 'Clubman', 'Countryman'],
  },
  {
    make: 'Land Rover',
    type: 'Euro',
    models: ['Defender', 'Discovery', 'Discovery Sport', 'Range Rover', 'Range Rover Sport', 'Range Rover Evoque'],
  },
  {
    make: 'Jaguar',
    type: 'Euro',
    models: ['XE', 'XF', 'XJ', 'F-Type', 'E-Pace', 'F-Pace', 'I-Pace'],
  },
  {
    make: 'Alfa Romeo',
    type: 'Euro',
    models: ['Giulia', 'Stelvio', '4C', 'Giulietta'],
  },
  {
    make: 'Fiat',
    type: 'Euro',
    models: ['500', '500 Abarth', '500X', 'Panda', 'Tipo'],
  },
  {
    make: 'Peugeot',
    type: 'Euro',
    models: ['208', '308', '3008', '508', '2008', '5008'],
  },
  {
    make: 'Renault',
    type: 'Euro',
    models: ['Clio', 'Megane', 'Captur', 'Koleos', 'Talisman'],
  },
  {
    make: 'Skoda',
    type: 'Euro',
    models: ['Octavia', 'Superb', 'Karoq', 'Kodiaq', 'Fabia'],
  },
  {
    make: 'SEAT',
    type: 'Euro',
    models: ['Leon', 'Ibiza', 'Ateca', 'Arona', 'Tarraco'],
  },
  {
    make: 'Bentley',
    type: 'Euro',
    models: ['Continental GT', 'Flying Spur', 'Bentayga'],
  },
  {
    make: 'Maserati',
    type: 'Euro',
    models: ['Ghibli', 'Quattroporte', 'Levante', 'MC20', 'Grecale'],
  },
  {
    make: 'Ferrari',
    type: 'Euro',
    models: ['Roma', '488', 'F8', '812', 'SF90', 'Portofino'],
  },
  {
    make: 'Lamborghini',
    type: 'Euro',
    models: ['Huracan', 'Aventador', 'Urus'],
  },
  {
    make: 'Aston Martin',
    type: 'Euro',
    models: ['Vantage', 'DB11', 'DBS', 'DBX'],
  },
  {
    make: 'Rolls-Royce',
    type: 'Euro',
    models: ['Phantom', 'Ghost', 'Wraith', 'Cullinan'],
  },
  {
    make: 'McLaren',
    type: 'Euro',
    models: ['570S', '600LT', '720S', 'Artura', 'GT'],
  },
  {
    make: 'Toyota',
    type: 'JDM',
    models: ['Corolla', 'GR Corolla', 'Camry', 'Supra', 'GR86', 'Prius', 'RAV4', 'RAV4 Prime', 'Highlander', 'Grand Highlander', 'Sequoia', 'Tacoma', 'Tundra', '4Runner', 'Land Cruiser', 'Avalon', 'C-HR', 'Venza', 'Sienna'],
  },
  {
    make: 'Lexus',
    type: 'JDM',
    models: ['IS', 'ES', 'GS', 'LS', 'RC', 'LC', 'NX', 'RX', 'GX', 'LX'],
  },
  {
    make: 'Honda',
    type: 'JDM',
    models: ['Civic', 'Accord', 'CR-V', 'HR-V', 'Pilot', 'Passport', 'Odyssey', 'Fit', 'Ridgeline', 'S2000'],
  },
  {
    make: 'Acura',
    type: 'JDM',
    models: ['ILX', 'TLX', 'RLX', 'RDX', 'MDX', 'NSX', 'Integra'],
  },
  {
    make: 'Nissan',
    type: 'JDM',
    models: ['Altima', 'Maxima', 'Sentra', '370Z', 'Z', 'GT-R', 'Rogue', 'Murano', 'Pathfinder', 'Frontier', 'Titan', 'Kicks', 'Versa', 'Ariya'],
  },
  {
    make: 'Infiniti',
    type: 'JDM',
    models: ['Q50', 'Q60', 'Q70', 'QX50', 'QX60', 'QX80'],
  },
  {
    make: 'Mazda',
    type: 'JDM',
    models: ['Mazda3', 'Mazda6', 'CX-3', 'CX-5', 'CX-30', 'CX-50', 'CX-9', 'CX-90', 'MX-5 Miata', 'MX-30'],
  },
  {
    make: 'Subaru',
    type: 'JDM',
    models: ['Impreza', 'WRX', 'BRZ', 'Legacy', 'Outback', 'Forester', 'Crosstrek', 'Ascent', 'Baja', 'Solterra'],
  },
  {
    make: 'Mitsubishi',
    type: 'JDM',
    models: ['Lancer', 'Eclipse', 'Outlander', 'Outlander Sport', 'Pajero'],
  },
  {
    make: 'Suzuki',
    type: 'JDM',
    models: ['Swift', 'Vitara', 'Jimny'],
  },
  {
    make: 'Ford',
    type: 'Domestic',
    models: ['F-150', 'Mustang', 'Explorer', 'Escape', 'Edge', 'Bronco', 'Bronco Sport', 'Ranger', 'Focus', 'Fusion', 'Maverick', 'Expedition', 'Mustang Mach-E'],
  },
  {
    make: 'Chevrolet',
    type: 'Domestic',
    models: ['Silverado', 'Camaro', 'Corvette', 'Malibu', 'Impala', 'Equinox', 'Tahoe', 'Suburban', 'Colorado', 'Traverse', 'Blazer', 'Trailblazer'],
  },
  {
    make: 'Dodge',
    type: 'Domestic',
    models: ['Charger', 'Challenger', 'Durango', 'Journey', 'Hornet'],
  },
  {
    make: 'Ram',
    type: 'Domestic',
    models: ['1500', '2500', '3500', 'ProMaster'],
  },
  {
    make: 'GMC',
    type: 'Domestic',
    models: ['Sierra', 'Terrain', 'Acadia', 'Yukon', 'Canyon'],
  },
  {
    make: 'Cadillac',
    type: 'Domestic',
    models: ['CT4', 'CT5', 'XT4', 'XT5', 'XT6', 'Escalade'],
  },
  {
    make: 'Buick',
    type: 'Domestic',
    models: ['Encore', 'Encore GX', 'Envision', 'Enclave'],
  },
  {
    make: 'Chrysler',
    type: 'Domestic',
    models: ['300', 'Pacifica', 'Voyager'],
  },
  {
    make: 'Jeep',
    type: 'Domestic',
    models: ['Wrangler', 'Grand Cherokee', 'Cherokee', 'Compass', 'Renegade', 'Gladiator', 'Wagoneer', 'Grand Wagoneer'],
  },
  {
    make: 'Lincoln',
    type: 'Domestic',
    models: ['MKZ', 'Corsair', 'Nautilus', 'Aviator', 'Navigator'],
  },
  {
    make: 'Tesla',
    type: 'Domestic',
    models: ['Model S', 'Model 3', 'Model X', 'Model Y', 'Cybertruck', 'Roadster', 'Semi'],
  },
  {
    make: 'Hyundai',
    type: 'Domestic',
    models: ['Elantra', 'Sonata', 'Accent', 'Kona', 'Kona N', 'Tucson', 'Santa Fe', 'Palisade', 'Ioniq 5', 'Ioniq 6', 'Veloster', 'Santa Cruz', 'Venue'],
  },
  {
    make: 'Kia',
    type: 'Domestic',
    models: ['Forte', 'K5', 'Stinger', 'Soul', 'Seltos', 'Sportage', 'Sorento', 'Telluride', 'EV6', 'EV9', 'Niro'],
  },
  {
    make: 'Genesis',
    type: 'Domestic',
    models: ['G70', 'G80', 'G90', 'GV70', 'GV80'],
  },
  {
    make: 'Rivian',
    type: 'Domestic',
    models: ['R1T', 'R1S'],
  },
];

export default vehicleCatalog;

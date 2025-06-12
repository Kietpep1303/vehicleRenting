export const CAR_MODELS: Record<string, string[]> = {
    VinFast: ['Fadil', 'Lux A2.0', 'Lux SA2.0', 'VF e34', 'VF 8', 'VF 9', 'Other'],
    Toyota: ['Vios', 'Veloz Cross', 'Innova', 'Fortuner', 'Corolla Altis', 'Camry', 'Yaris', 'Raize', 'Rush', 'Hilux', 'Land Cruiser Prado', 'C-HR', 'Avanza', 'Other'],
    Kia: ['Morning', 'Soluto', 'K3 (Cerato)', 'Seltos', 'Sportage', 'Sorento', 'Carnival', 'Stinger', 'Telluride', 'Other'],
    Ford: ['EcoSport', 'Ranger', 'Everest', 'Explorer', 'Transit', 'Focus', 'Fiesta', 'Mustang', 'Escort', 'Tourneo', 'Other'],
    Honda: ['City', 'Civic', 'Accord', 'CR-V', 'HR-V', 'Jazz', 'BR-V', 'WR-V', 'Pilot', 'Insight', 'Other'],
    Mazda: ['Mazda2', 'Mazda3', 'Mazda6', 'CX-3', 'CX-30', 'CX-5', 'CX-8', 'BT-50', 'Other'],
    Mitsubishi: ['Attrage', 'Mirage', 'Xpander', 'Pajero Sport', 'Outlander', 'Triton (L200)', 'Other'],
    Hyundai: ['Grand i10', 'Accent', 'Elantra', 'Kona', 'Tucson', 'Santa Fe', 'Starex', 'Palisade', 'Ioniq 5', 'Pony (i20)', 'Other'],
    Suzuki: ['Swift', 'Ciaz', 'XL7', 'Ertiga', 'Vitara', 'Celerio', 'Other'],
    MercedesBenz: ['A-Class', 'C-Class', 'E-Class', 'S-Class', 'GLA', 'GLC', 'GLE', 'GLS', 'G-Class', 'V-Class', 'Other'],
    BMW: ['1 Series', '3 Series', '5 Series', '7 Series', 'X1', 'X3', 'X5', 'X7', 'Z4', 'M2', 'M3', 'M5', 'Other'],
    Lexus: ['IS', 'ES', 'GS', 'LS', 'UX', 'NX', 'RX', 'LX', 'LC', 'Other'],
    Audi: ['A3', 'A4', 'A5', 'A6', 'A7', 'A8', 'Q2', 'Q3', 'Q5', 'Q7', 'Q8', 'Other'],
    Nissan: ['Almera', 'X-Trail', 'Navara', 'Terra', 'Kicks', 'Sunny', 'Teana', 'Juke', 'Other'],
    Volkswagen: ['Polo', 'Golf', 'Tiguan', 'Passat', 'Touareg', 'Jetta', 'Beetle', 'Other'],
    Peugeot: ['2008', '3008', '5008', '408', '508', '3008 GT', 'Other'],
    Subaru: ['Forester', 'Outback', 'XV (Crosstrek)', 'Impreza', 'WRX', 'BRZ', 'Levorg', 'Other'],
    LandRover: ['Range Rover', 'Range Rover Sport', 'Range Rover Velar', 'Discovery', 'Defender', 'Evoque', 'Other'],
    Volvo: ['S60', 'S90', 'XC40', 'XC60', 'XC90', 'V60', 'V90', 'Other'],
    MG: ['MG3', 'MG ZS', 'MG HS', 'MG5', 'MG RX5', 'Other'],
    Other: []
}

export const CAR_BRAND = Object.keys(CAR_MODELS);

export const MOTORCYCLE_MODELS: Record<string, string[]> = {
    Honda: ['Wave Alpha', 'Wave RSX', 'Blade', 'Winner X', 'Air Blade', 'SH Mode', 'SH', 'Vision', 'Future 125', 'PCX 125', 'Monkey', 'Other'],
    Yamaha: ['Exciter', 'Sirius', 'Janus', 'Grande', 'NVX', 'MT-15', 'R15', 'FZ 150', 'TFX 155', 'Other'],
    Suzuki: ['Raider 150', 'Satria F150', 'Address', 'Impulse', 'GD110', 'Other'],
    SYM: ['Angel 125', 'Attila', 'Galaxy 125', 'Elizabeth', 'Shark 125', 'Other'],
    Piaggio: ['Liberty', 'Medley', 'Beverly', 'MP3', 'X10', 'Other'],
    Vespa: ['LX', 'Sprint', 'Primavera', 'GTS', 'Sei Giorni', 'Other'],
    KTM: ['Duke 200', 'Duke 390', 'RC 200', 'RC 390', 'Adventure 250', 'Other'],
    Kawasaki: ['Ninja 300', 'Ninja 400', 'Z300', 'Z400', 'Versys 300', 'Other'],
    Ducati: ['Monster 821', 'Panigale V2', 'Panigale V4', 'Diavel', 'Scrambler Icon', 'Other'],
    HarleyDavidson: ['Iron 883', 'Street 750', 'Forty-Eight', 'Road King', 'Fat Boy', 'Other'],
    Benelli: ['TNT 150', 'TNT 25', 'TRK 251', 'TRK 502', 'Leoncino 250', 'Other'],
    BMW: ['G310R', 'G310GS', 'R1250GS', 'R NineT', 'F800GS', 'S1000RR', 'Other'],
    Triumph: ['Tiger 850', 'Speed Triple', 'Bonneville T120', 'Scrambler 1200', 'Street Triple', 'Other'],
    Aprilia: ['RS 150', 'GPR 150', 'Tuono 155', 'SR GT', 'Other'],
    RoyalEnfield: ['Classic 350', 'Bullet 350', 'Himalayan', 'Meteor 350', 'Interceptor 650', 'Other'],
    Kymco: ['Like 125', 'Many 125', 'People GTI', 'X-Town 300', 'Other'],
    Haojue: ['DK 150', 'DR 160', 'S-Wing 125', 'Other'],
    CFMoto: ['150NK', '250NK', '300NK', '650MT', 'Other'],
    Bajaj: ['Pulsar NS200', 'Pulsar 150', 'Pulsar RS200', 'Dominar 400', 'Avenger 220', 'Other'],
    QJMotor: ['SRK 150', 'SRK 125', 'QJ350', 'Other'],
    Other: []
}

export const MOTORCYCLE_BRAND = Object.keys(MOTORCYCLE_MODELS);

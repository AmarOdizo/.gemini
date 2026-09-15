export const checkVetOnlineStatus = (vet) => {
  if (!vet) return false;
  
  // Emergency Duty overrides everything - forces online 24/7
  if (vet.emergencyDuty === true) return true;
  
  // Doctor's manual master switch
  if (vet.telehealthMode === false) return false;
  
  if (!vet.availability || vet.availability.length === 0) return false;

  const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const now = new Date();
  const currentDayStr = daysOfWeek[now.getDay()];
  
  const todayAvail = vet.availability.find(a => a.day === currentDayStr);
  if (!todayAvail || !todayAvail.active) return false;
  
  const [startStr, endStr] = todayAvail.slots;
  if (!startStr || !endStr) return false;

  // Helper to convert "09:00 AM" to minutes since midnight
  const timeToMinutes = (timeStr) => {
    try {
      const parts = timeStr.split(' ');
      if (parts.length !== 2) {
        // Fallback for 24h format if old data exists
        const [h, m] = timeStr.split(':').map(Number);
        return h * 60 + (m || 0);
      }
      
      const time = parts[0];
      const period = parts[1];
      let [hours, minutes] = time.split(':').map(Number);
      
      if (period === 'PM' && hours !== 12) hours += 12;
      if (period === 'AM' && hours === 12) hours = 0;
      
      return hours * 60 + minutes;
    } catch (e) {
      return 0;
    }
  };

  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const startMinutes = timeToMinutes(startStr);
  const endMinutes = timeToMinutes(endStr);

  return currentMinutes >= startMinutes && currentMinutes <= endMinutes;
};
